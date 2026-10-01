import {
  CATALOG,
  automaticTax,
  readJsonBody,
  siteUrl,
  stripe,
} from "./_stripe.js";
import { clientIp, isRateLimited } from "./_ratelimit.js";

const MAX_POSTS = 12;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }

  try {
    if (await isRateLimited("checkout", clientIp(request), MAX_POSTS)) {
      response.setHeader("Retry-After", "900");
      return response
        .status(429)
        .json({ ok: false, error: "Too many attempts. Wait a bit." });
    }
  } catch (error) {
    console.error("distributed checkout rate limiter failed", error);
    return response.status(503).json({
      ok: false,
      error: "Checkout is temporarily unavailable. Please try again shortly.",
    });
  }

  const payload = readJsonBody(request);
  if (!payload) {
    return response.status(400).json({ ok: false, error: "Invalid request." });
  }

  const plan = CATALOG[String(payload.plan || "")];
  if (!plan) {
    return response.status(400).json({ ok: false, error: "Unknown plan." });
  }

  const email = String(payload.email || "").trim();
  const carePlan = String(payload.care_plan || "").trim();
  const isDeposit = plan.mode === "payment";
  if (isDeposit && !["care", "care-plus"].includes(carePlan)) {
    return response.status(400).json({
      ok: false,
      error: "Choose a Care plan before starting a deposit checkout.",
    });
  }
  if (
    email &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
  ) {
    return response
      .status(400)
      .json({ ok: false, error: "Please add a valid email address." });
  }

  const client = stripe();
  const price = process.env[plan.priceEnv];
  if (!client || !price) {
    return response.status(503).json({
      ok: false,
      error:
        "Online payment is not switched on yet. Email create@forge-ct.com and I will send an invoice.",
    });
  }

  const base = siteUrl(request);

  try {
    const session = await client.checkout.sessions.create(
      {
        mode: plan.mode,
        // No payment_method_types: dynamic payment methods pick what converts
        // best for the customer, and the set is managed from the Dashboard.
        line_items: [{ price, quantity: 1 }],
        integration_identifier: plan.integrationIdentifier,
        automatic_tax: automaticTax(),
        billing_address_collection: "auto",
        client_reference_id: `forge:${payload.plan}`,
        metadata: {
          plan: payload.plan,
          plan_label: plan.label,
          ...(isDeposit ? { care_plan: carePlan } : {}),
        },
        ...(email ? { customer_email: email } : {}),
        // Deposits must produce a Customer so the project balance can be
        // invoiced to the same record later.
        ...(isDeposit
          ? {
              customer_creation: "always",
              payment_intent_data: {
                description: `FORGE CT — ${plan.label}`,
                metadata: { plan: payload.plan, care_plan: carePlan },
              },
            }
          : {
              subscription_data: {
                metadata: { plan: payload.plan, plan_label: plan.label },
              },
            }),
        success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/services`,
      },
      // Retries of the same click must not create a second session or charge.
      {
        idempotencyKey: `checkout:${payload.plan}:${clientIp(request)}:${email}:${Math.floor(Date.now() / 60000)}`,
      },
    );

    return response.status(200).json({ ok: true, url: session.url });
  } catch (error) {
    console.error("stripe.checkout.sessions.create failed", {
      type: error?.type,
      code: error?.code,
      message: error?.message,
    });
    return response.status(502).json({
      ok: false,
      error: "Could not start checkout. Email create@forge-ct.com.",
    });
  }
}
