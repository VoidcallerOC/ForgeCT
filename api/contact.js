const MAX_POSTS = 5;
import { clientIp, isRateLimited } from "./_ratelimit.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }

  try {
    if (await isRateLimited("contact", clientIp(request), MAX_POSTS)) {
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
    try {
      payload = JSON.parse(payload);
    } catch {
      return response
        .status(400)
        .json({ ok: false, error: "Invalid request." });
    }
  }

  const website = String(payload?.website || "").trim();
  if (website) {
    return response.status(200).json({ ok: true });
  }

  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim();
  const company = String(payload?.company || "").trim();
  const siteUrl = String(payload?.siteUrl || "").trim();
  const message = String(payload?.message || "").trim();

  if (name.length < 2 || name.length > 100) {
    return response
      .status(400)
      .json({ ok: false, error: "Please add your name." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response
      .status(400)
      .json({ ok: false, error: "Please add a valid email address." });
  }

  if (company.length > 120) {
    return response
      .status(400)
      .json({ ok: false, error: "Company name is too long." });
  }

  if (
    siteUrl &&
    (siteUrl.length > 500 || !/^https?:\/\/[^\s]+$/i.test(siteUrl))
  ) {
    return response.status(400).json({
      ok: false,
      error: "Please add a valid website URL, including https://.",
    });
  }

  if (message.length > 4000) {
    return response.status(400).json({
      ok: false,
      error: "Your note is too long. Please keep it under 4,000 characters.",
    });
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
    return response.status(502).json({
      ok: false,
      error: "The message could not be delivered. Please email directly.",
    });
  }

  return response.status(200).json({ ok: true });
}
