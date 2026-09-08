const MAX_POSTS = 5;
const MAX_BODY_BYTES = 12 * 1024;
import { clientIp, isRateLimited } from "./_ratelimit.js";

function header(request, name) {
  const headers = request.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function normalizeText(value, { preserveNewlines = false } = {}) {
  const text = String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  return preserveNewlines
    ? text
        .replace(/\r\n?/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim()
    : text.replace(/\s+/g, " ").trim();
}

function validEmail(email) {
  if (email.length > 254 || email.includes("..")) return false;
  const [local, domain] = email.split("@");
  if (
    !local ||
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".")
  ) {
    return false;
  }
  if (!/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;
  return /^(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i.test(
    domain,
  );
}

function rejectValidation(request, reason, message) {
  console.warn("contact validation rejected", {
    reason,
    ip: clientIp(request),
  });
  return { ok: false, error: message };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }

  if (!/^application\/json(?:\s*;|$)/i.test(header(request, "content-type"))) {
    return response.status(415).json({
      ok: false,
      error: "This form accepts JSON requests only.",
    });
  }

  const contentLength = Number(header(request, "content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return response.status(413).json({
      ok: false,
      error: "That request is too large.",
    });
  }

  try {
    if (await isRateLimited("contact", clientIp(request), MAX_POSTS)) {
      console.warn("contact rate limit exceeded", { ip: clientIp(request) });
      response.setHeader("Retry-After", "900");
      return response.status(429).json({
        ok: false,
        error: "Too many messages. Wait a bit, or email create@forge-ct.com.",
      });
    }
  } catch (error) {
    console.error("distributed contact rate limiter failed", error);
    return response.status(503).json({
      ok: false,
      error:
        "The inquiry form is temporarily unavailable. Please try again shortly.",
    });
  }

  let payload = request.body;
  if (typeof payload === "string") {
    if (Buffer.byteLength(payload, "utf8") > MAX_BODY_BYTES) {
      return response.status(413).json({
        ok: false,
        error: "That request is too large.",
      });
    }
    try {
      payload = JSON.parse(payload);
    } catch {
      return response
        .status(400)
        .json({ ok: false, error: "Invalid request." });
    }
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return response.status(400).json({ ok: false, error: "Invalid request." });
  }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > MAX_BODY_BYTES) {
    return response.status(413).json({
      ok: false,
      error: "That request is too large.",
    });
  }

  const website = normalizeText(payload.website);
  if (website) {
    return response.status(200).json({ ok: true });
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const company = normalizeText(payload.company);
  const siteUrl = normalizeText(payload.siteUrl);
  const message = normalizeText(payload.message, { preserveNewlines: true });

  if (name.length < 2 || name.length > 100) {
    return response
      .status(400)
      .json(rejectValidation(request, "name", "Please add your name."));
  }

  if (!validEmail(email)) {
    return response
      .status(400)
      .json(
        rejectValidation(request, "email", "Please add a valid email address."),
      );
  }

  if (company.length > 120) {
    return response
      .status(400)
      .json(
        rejectValidation(
          request,
          "company_length",
          "Company name is too long.",
        ),
      );
  }

  if (
    siteUrl &&
    (siteUrl.length > 500 || !/^https?:\/\/[^\s]+$/i.test(siteUrl))
  ) {
    return response
      .status(400)
      .json(
        rejectValidation(
          request,
          "website_url",
          "Please add a valid website URL, including https://.",
        ),
      );
  }

  if (message.length > 4000) {
    return response
      .status(400)
      .json(
        rejectValidation(
          request,
          "message_length",
          "Your note is too long. Please keep it under 4,000 characters.",
        ),
      );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      ok: false,
      error:
        "The inquiry form is not configured yet. Email create@forge-ct.com instead.",
    });
  }

  const to = process.env.CONTACT_TO_EMAIL || "create@forge-ct.com";
  const from =
    process.env.CONTACT_FROM_EMAIL || "FORGE CT <onboarding@resend.dev>";

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : "",
    siteUrl ? `Website: ${siteUrl}` : "",
    "",
    "Shop details:",
    message || "No additional note provided.",
  ]
    .filter(Boolean)
    .join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Shop inquiry from ${name}`,
      text,
    }),
  });

  if (!resendResponse.ok) {
    console.error("contact delivery failed", {
      status: resendResponse.status,
      ip: clientIp(request),
    });
    return response.status(502).json({
      ok: false,
      error: "The message could not be delivered. Please email directly.",
    });
  }

  return response.status(200).json({ ok: true });
}
