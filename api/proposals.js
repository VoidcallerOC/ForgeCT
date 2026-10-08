import { clientIp, isRateLimited } from "./_ratelimit.js";
import {
  contentTypeIsJson,
  readJsonBody,
  requireAdmin,
} from "./_proposal-auth.js";
import {
  ADD_ON_LINE_ITEMS,
  DEFAULT_TERMS,
  PACKAGE_TEMPLATES,
  getPackageTemplate,
} from "./_proposal-packages.js";
import {
  buildSnapshot,
  createProposal,
  getProposal,
  listEvents,
  listProposals,
  publicProposalView,
  transitionProposal,
  updateProposal,
} from "./_proposal-store.js";
import { isPubliclyViewable } from "./_proposal-state.js";

function header(request, name) {
  const headers = request.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function siteOrigin(request) {
  const configured = process.env.SITE_URL;
  if (configured) {
    return configured
      .replace(/\/$/, "")
      .replace("https://forge-ct.com", "https://www.forge-ct.com");
  }
  const host = header(request, "x-forwarded-host") || header(request, "host");
  const proto = header(request, "x-forwarded-proto") || "https";
  const canonical = host === "forge-ct.com" ? "www.forge-ct.com" : host;
  return canonical ? `${proto}://${canonical}` : "https://www.forge-ct.com";
}

async function maybeSendProposalEmail(proposal, link) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY missing" };
  }
  const to = proposal.contact_email;
  const from =
    process.env.CONTACT_FROM_EMAIL || "FORGE CT <onboarding@resend.dev>";
  const subject = `FORGE CT proposal — ${proposal.project_title}`;
  const html = `
    <p>Hi ${escapeHtml(proposal.contact_name)},</p>
    <p>Your FORGE CT proposal for <strong>${escapeHtml(proposal.business_name)}</strong> is ready.</p>
    <p><a href="${escapeHtml(link)}">View proposal</a></p>
    <p>Version ${proposal.version}. This message confirms delivery of a commercial proposal; it is not a legal e-signature request.</p>
    <p>— FORGE CT</p>
  `;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      sent: false,
      reason: `Resend ${response.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`,
    };
  }
  const body = await response.json().catch(() => ({}));
  return { sent: true, id: body.id || null };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyTemplate(body) {
  const packageId = body.package_id || body.packageId;
  if (!packageId) return body;
  const template = getPackageTemplate(packageId);
  if (!template) return body;
  return {
    ...body,
    package_id: template.id,
    project_title: body.project_title || body.projectTitle || template.name,
    scope_text: body.scope_text || body.scopeText || template.scope_text,
    timeline_text:
      body.timeline_text || body.timelineText || template.timeline_text,
    terms_text: body.terms_text || body.termsText || DEFAULT_TERMS,
    line_items: body.line_items || body.lineItems || template.line_items,
  };
}

export default async function handler(request, response) {
  const method = request.method || "GET";
  const url = new URL(request.url || "/", "http://localhost");
  const action = url.searchParams.get("action") || "";
  const publicId =
    url.searchParams.get("id") || url.searchParams.get("public_id") || "";

  try {
    if (method === "GET" && action === "templates") {
      return response.status(200).json({
        ok: true,
        packages: PACKAGE_TEMPLATES,
        add_ons: ADD_ON_LINE_ITEMS,
        default_terms: DEFAULT_TERMS,
      });
    }

    if (method === "GET" && publicId && action !== "admin") {
      try {
        if (await isRateLimited("proposal_view", clientIp(request), 60)) {
          response.setHeader("Retry-After", "60");
          return response
            .status(429)
            .json({ ok: false, error: "Too many requests." });
        }
      } catch {
        // rate limiter hard-fail only in production stores; continue on memory
      }

      const proposal = await getProposal(publicId);
      if (
        !proposal ||
        proposal.status === "DRAFT" ||
        proposal.status === "ARCHIVED"
      ) {
        return response
          .status(404)
          .json({ ok: false, error: "Proposal not found." });
      }
      if (
        !isPubliclyViewable(proposal.status) &&
        proposal.status !== "EXPIRED"
      ) {
        return response
          .status(404)
          .json({ ok: false, error: "Proposal not found." });
      }

      if (proposal._expired_locally && proposal.status === "EXPIRED") {
        try {
          await transitionProposal(publicId, {
            toStatus: "EXPIRED",
            eventType: "expired",
            actor: "system",
            detail: { reason: "expires_at" },
          });
        } catch {
          // already expired or race
        }
      } else if (proposal.status === "SENT") {
        try {
          await transitionProposal(publicId, {
            toStatus: "VIEWED",
            eventType: "viewed",
            actor: "client",
            detail: {
              ip: clientIp(request),
              ua: String(header(request, "user-agent") || "").slice(0, 300),
            },
          });
        } catch {
          // concurrent view is fine
        }
      }

      const fresh = await getProposal(publicId);
      return response.status(200).json({
        ok: true,
        proposal: publicProposalView(fresh),
      });
    }

    // Admin routes below
    requireAdmin(request);

    if (method === "GET" && action === "events" && publicId) {
      const events = await listEvents(publicId);
      return response.status(200).json({ ok: true, events });
    }

    if (method === "GET") {
      const includeArchived = url.searchParams.get("include_archived") === "1";
      if (publicId) {
        const proposal = await getProposal(publicId);
        if (!proposal) {
          return response
            .status(404)
            .json({ ok: false, error: "Proposal not found." });
        }
        const events = await listEvents(publicId);
        return response.status(200).json({ ok: true, proposal, events });
      }
      const proposals = await listProposals({ includeArchived });
      return response.status(200).json({ ok: true, proposals });
    }

    if (!contentTypeIsJson(request) && method !== "GET") {
      return response.status(415).json({
        ok: false,
        error: "JSON body required.",
      });
    }

    const body = method === "GET" ? {} : readJsonBody(request);

    if (
      method === "POST" &&
      (action === "duplicate" || body.action === "duplicate")
    ) {
      const sourceId = publicId || body.public_id || body.id;
      const source = await getProposal(sourceId);
      if (!source) {
        return response
          .status(404)
          .json({ ok: false, error: "Proposal not found." });
      }
      const copy = await createProposal({
        ...source,
        project_title: `${source.project_title} (copy)`,
        public_id: undefined,
      });
      return response.status(201).json({ ok: true, proposal: copy });
    }

    if (method === "POST" && (action === "send" || body.action === "send")) {
      const id = publicId || body.public_id || body.id;
      const proposal = await getProposal(id);
      if (!proposal) {
        return response
          .status(404)
          .json({ ok: false, error: "Proposal not found." });
      }
      const snapshot = buildSnapshot(proposal);
      const sent = await transitionProposal(id, {
        toStatus: "SENT",
        eventType: "sent",
        actor: "admin",
        snapshot,
        detail: {},
      });
      const link = `${siteOrigin(request)}/proposals/${sent.public_id}`;
      let email = { sent: false, reason: "skipped" };
      try {
        email = await maybeSendProposalEmail(sent, link);
      } catch (error) {
        email = { sent: false, reason: String(error?.message || error) };
      }
      return response.status(200).json({
        ok: true,
        proposal: sent,
        link,
        email,
      });
    }

    if (
      method === "POST" &&
      (action === "archive" || body.action === "archive")
    ) {
      const id = publicId || body.public_id || body.id;
      const archived = await transitionProposal(id, {
        toStatus: "ARCHIVED",
        eventType: "archived",
        actor: "admin",
      });
      return response.status(200).json({ ok: true, proposal: archived });
    }

    if (
      method === "POST" &&
      (action === "reopen" || body.action === "reopen")
    ) {
      const id = publicId || body.public_id || body.id;
      const reopened = await transitionProposal(id, {
        toStatus: "DRAFT",
        eventType: "reopened",
        actor: "admin",
        detail: { note: "Returned to draft for editing." },
      });
      return response.status(200).json({ ok: true, proposal: reopened });
    }

    if (method === "POST") {
      const proposal = await createProposal(applyTemplate(body));
      return response.status(201).json({ ok: true, proposal });
    }

    if (method === "PATCH") {
      const id = publicId || body.public_id || body.id;
      if (!id) {
        return response
          .status(400)
          .json({ ok: false, error: "id is required." });
      }
      const proposal = await updateProposal(id, applyTemplate(body));
      return response.status(200).json({ ok: true, proposal });
    }

    response.setHeader("Allow", "GET, POST, PATCH");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    const status =
      error.status || (error.code === "INVALID_TRANSITION" ? 409 : 500);
    if (status >= 500) {
      console.error("proposals handler error", error);
    }
    return response.status(status).json({
      ok: false,
      error: error.message || "Proposal request failed.",
      code: error.code || undefined,
    });
  }
}
