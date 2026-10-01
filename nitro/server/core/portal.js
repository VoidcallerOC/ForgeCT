import { readJsonBody, siteUrl, stripe } from "./_stripe.js";
import { clientIp, isRateLimited } from "./_ratelimit.js";

const MAX_POSTS = 8;

/**
 * Opens the Stripe Customer Portal so a shop can update its card, see
 * receipts, or cancel Care without emailing anyone.
 *
 * The site has no login, so the caller supplies a Checkout session id from
 * their receipt or the /thanks page. That id is the bearer of access here —
 * it is unguessable and scoped to one customer, but if the site ever grows
 * real accounts, resolve the customer from the session instead.
 */
export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }

  try {
    if (await isRateLimited("portal", clientIp(request), MAX_POSTS)) {
      response.setHeader("Retry-After", "900");
      return response
        .status(429)
        .json({ ok: false, error: "Too many attempts. Wait a bit." });
    }
  } catch (error) {
    console.error("distributed portal rate limiter failed", error);
    return response.status(503).json({
      ok: false,
      error: "Billing management is temporarily unavailable.",
    });
  }

  const payload = readJsonBody(request);
  const sessionId = String(payload?.session_id || "").trim();
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return response
      .status(400)
      .json({ ok: false, error: "Missing checkout session id." });
  }

  const client = stripe();
  if (!client) {
    return response.status(503).json({
      ok: false,
      error: "Billing management is not switched on yet.",
    });
  }

  try {
    const checkoutSession = await client.checkout.sessions.retrieve(sessionId);
    const customer =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer?.id;

    if (!customer) {
      return response
        .status(404)
        .json({ ok: false, error: "No billing record for that receipt." });
    }

    const portal = await client.billingPortal.sessions.create({
      customer,
      return_url: `${siteUrl(request)}/care`,
    });

    return response.status(200).json({ ok: true, url: portal.url });
  } catch (error) {
    console.error("stripe billing portal failed", {
      code: error?.code,
      message: error?.message,
    });
    return response.status(502).json({
      ok: false,
      error: "Could not open billing. Email create@forge-ct.com.",
    });
  }
}
