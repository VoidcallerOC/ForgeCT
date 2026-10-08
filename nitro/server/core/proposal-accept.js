import { clientIp, isRateLimited } from "./_ratelimit.js";
import { contentTypeIsJson, readJsonBody } from "./_proposal-auth.js";
import { canAccept } from "./_proposal-state.js";
import { getProposal, transitionProposal } from "./_proposal-store.js";

const CONFIRMATION_PHRASE =
  "I confirm I have reviewed this proposal and accept the stated scope, timeline, and pricing for this version.";

function header(request, name) {
  const headers = request.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function validEmail(email) {
  if (email.length > 254 || email.includes("..")) return false;
  const [local, domain] = email.split("@");
  if (!local || !domain) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }
  if (!contentTypeIsJson(request)) {
    return response
      .status(415)
      .json({ ok: false, error: "JSON body required." });
  }

  try {
    if (await isRateLimited("proposal_accept", clientIp(request), 10)) {
      response.setHeader("Retry-After", "900");
      return response.status(429).json({
        ok: false,
        error:
          "Too many acceptance attempts. Wait a bit, or email create@forge-ct.com.",
      });
    }
  } catch (error) {
    console.error("proposal accept rate limiter failed", error);
    return response.status(503).json({
      ok: false,
      error: "Acceptance is temporarily unavailable. Please try again shortly.",
    });
  }

  let body;
  try {
    body = readJsonBody(request, 16 * 1024);
  } catch (error) {
    return response.status(error.status || 400).json({
      ok: false,
      error: error.message,
    });
  }

  const publicId = normalizeText(body.public_id || body.id);
  const name = normalizeText(body.name).slice(0, 120);
  const email = normalizeText(body.email).toLowerCase().slice(0, 254);
  const version = Number(body.version);
  const confirmation = normalizeText(body.confirmation);
  const honeypot = normalizeText(body.website || body.company_url || "");

  if (honeypot) {
    return response.status(200).json({ ok: true, accepted: true });
  }
  if (!publicId) {
    return response
      .status(400)
      .json({ ok: false, error: "Proposal id is required." });
  }
  if (!name || name.length < 2) {
    return response
      .status(400)
      .json({ ok: false, error: "Please add your name." });
  }
  if (!validEmail(email)) {
    return response
      .status(400)
      .json({ ok: false, error: "Please add a valid email." });
  }
  if (!Number.isInteger(version) || version < 1) {
    return response
      .status(400)
      .json({ ok: false, error: "Proposal version is required." });
  }
  if (confirmation !== CONFIRMATION_PHRASE) {
    return response.status(400).json({
      ok: false,
      error: "Please confirm acceptance using the exact confirmation text.",
      confirmation_phrase: CONFIRMATION_PHRASE,
    });
  }

  try {
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
    if (proposal._expired_locally || proposal.status === "EXPIRED") {
      return response
        .status(409)
        .json({ ok: false, error: "This proposal has expired." });
    }
    if (!canAccept(proposal.status)) {
      return response.status(409).json({
        ok: false,
        error: `Proposal cannot be accepted in status ${proposal.status}.`,
      });
    }
    if (proposal.version !== version) {
      return response.status(409).json({
        ok: false,
        error:
          "This proposal was updated. Refresh and review the latest version.",
        current_version: proposal.version,
      });
    }

    const acceptance = {
      name,
      email,
      version,
      confirmed_at: new Date().toISOString(),
      confirmation_phrase: CONFIRMATION_PHRASE,
      ip: clientIp(request),
      user_agent: String(header(request, "user-agent") || "").slice(0, 400),
      legal_esign_claimed: false,
      note: "Operational acceptance record — not a DocuSign/legal e-signature.",
    };

    const accepted = await transitionProposal(publicId, {
      toStatus: "ACCEPTED",
      eventType: "accepted",
      actor: "client",
      acceptance,
      detail: {
        name,
        email,
        version,
      },
    });

    return response.status(200).json({
      ok: true,
      accepted: true,
      proposal: {
        public_id: accepted.public_id,
        status: accepted.status,
        version: accepted.version,
        deposit_cents: accepted.deposit_cents,
        subtotal_cents: accepted.subtotal_cents,
        accepted_at: accepted.accepted_at,
      },
      next: "checkout",
      notice:
        "Acceptance recorded. This is not a legal electronic signature. Continue to Stripe deposit checkout when ready.",
    });
  } catch (error) {
    const status =
      error.status || (error.code === "INVALID_TRANSITION" ? 409 : 500);
    if (status >= 500) console.error("proposal-accept error", error);
    return response.status(status).json({
      ok: false,
      error: error.message || "Acceptance failed.",
      code: error.code || undefined,
    });
  }
}

export const CONFIRMATION = CONFIRMATION_PHRASE;
