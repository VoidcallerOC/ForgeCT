import { stripe } from "./_stripe.js";

// Signature verification needs the exact bytes Stripe signed, so the platform
// body parser must stay out of the way.
export const config = { api: { bodyParser: false } };

const RELEVANT = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "payment_intent.succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

const FINAL_PAYMENT_LOOKUPS = new Set([
  "forge_site_final",
  "forge_system_launch",
]);

const CARE_PRICE_ENV = {
  care: "STRIPE_PRICE_CARE",
  "care-plus": "STRIPE_PRICE_CARE_PLUS",
};

// Best-effort replay guard for a warm instance. Stripe-side idempotency and the
// final-invoice check below protect the financial side effect across instances.
const seen = new Set();

function rawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function money(amount, currency) {
  if (typeof amount !== "number") return "";
  return `${(amount / 100).toFixed(2)} ${String(currency || "usd").toUpperCase()}`;
}

export function addOneMonth(timestamp) {
  const date = new Date(timestamp * 1000);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return Math.floor(date.getTime() / 1000);
}

function customerId(value) {
  return typeof value === "string" ? value : value?.id;
}

async function rememberCarePlan(client, session, settledAt) {
  const carePlan = session.metadata?.care_plan;
  const customer = customerId(session.customer);
  if (!customer || !CARE_PRICE_ENV[carePlan]) return;

  const metadata = {
    care_plan: carePlan,
    source: "forge_deposit_checkout",
  };
  if (settledAt) {
    metadata.care_payment_settled_at = String(settledAt);
    metadata.care_countdown_ends_at = String(addOneMonth(settledAt));
    metadata.care_payment_intent = session.payment_intent || "";
  }
  await client.customers.update(customer, { metadata });
}

async function rememberCarePlanFromPaymentIntent(
  client,
  paymentIntent,
  settledAt,
) {
  const carePlan = paymentIntent.metadata?.care_plan;
  const customer = customerId(paymentIntent.customer);
  if (!customer || !CARE_PRICE_ENV[carePlan]) return;

  settledAt =
    settledAt || paymentIntent.created || Math.floor(Date.now() / 1000);
  await client.customers.update(customer, {
    metadata: {
      care_plan: carePlan,
      source: "forge_deposit_checkout",
      care_payment_settled_at: String(settledAt),
      care_countdown_ends_at: String(addOneMonth(settledAt)),
      care_payment_intent: paymentIntent.id,
    },
  });
}

async function provisionCareAfterFinalPayment(client, invoice, settledAt) {
  const lookup = invoice.metadata?.lookup;
  if (!FINAL_PAYMENT_LOOKUPS.has(lookup)) return null;

  const customer = customerId(invoice.customer);
  if (!customer) throw new Error(`Final invoice ${invoice.id} has no customer`);

  const customerRecord = await client.customers.retrieve(customer);
  const carePlan = customerRecord.metadata?.care_plan;
  const priceEnv = CARE_PRICE_ENV[carePlan];
  if (!priceEnv) {
    console.warn("Final payment has no Care plan", invoice.id, customer);
    return null;
  }

  const price = process.env[priceEnv];
  if (!price) throw new Error(`${priceEnv} is not configured`);

  const existing = await client.subscriptions.list({
    customer,
    status: "all",
    limit: 100,
  });
  const alreadyProvisioned = existing.data.find(
    (subscription) =>
      subscription.metadata?.source === "forge_final_payment" &&
      subscription.metadata?.final_invoice === invoice.id,
  );
  if (alreadyProvisioned) return alreadyProvisioned;

  const paidAt =
    settledAt ||
    invoice.status_transitions?.paid_at ||
    Math.floor(Date.now() / 1000);
  const trialEnd = addOneMonth(paidAt);
  const subscription = await client.subscriptions.create(
    {
      customer,
      items: [{ price }],
      trial_end: trialEnd,
      metadata: {
        source: "forge_final_payment",
        final_invoice: invoice.id,
        care_plan: carePlan,
        care_countdown_started_at: String(paidAt),
        care_countdown_ends_at: String(trialEnd),
      },
    },
    { idempotencyKey: `care-after-final:${invoice.id}:${carePlan}` },
  );

  await client.customers.update(customer, {
    metadata: {
      care_payment_settled_at: String(paidAt),
      care_countdown_ends_at: String(trialEnd),
      care_final_invoice: invoice.id,
    },
  });

  await notify("FORGE — Care scheduled after final payment", [
    `Plan: ${carePlan}`,
    `Settlement: ${new Date(paidAt * 1000).toISOString()}`,
    `Starts billing: ${new Date(trialEnd * 1000).toISOString()}`,
    `Customer: ${customer}`,
    `Subscription: ${subscription.id}`,
    `Final invoice: ${invoice.id}`,
  ]);
  return subscription;
}

async function notify(subject, lines) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing; skipping notification", subject);
    return;
  }
  const to = process.env.CONTACT_TO_EMAIL || "create@forge-ct.com";
  const from =
    process.env.CONTACT_FROM_EMAIL || "FORGE CT <onboarding@resend.dev>";

  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: lines.filter(Boolean).join("\n"),
    }),
  });

  if (!result.ok) {
    // Throwing returns a non-2xx to Stripe, which retries the event.
    throw new Error(`Resend responded ${result.status}`);
  }
}

async function handleEvent(client, event) {
  const object = event.data.object;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      // Delayed-notification methods complete the session while it is still
      // unpaid. Fulfilling on the event alone would grant work for money that
      // never arrives, so gate on payment_status.
      if (object.payment_status === "unpaid") {
        console.log("checkout session completed but unpaid", object.id);
        return;
      }
      await rememberCarePlan(client, object, event.created);
      const plan = object.metadata?.plan_label || object.metadata?.plan || "—";
      await notify(`FORGE — paid: ${plan}`, [
        `Plan: ${plan}`,
        `Mode: ${object.mode}`,
        `Amount: ${money(object.amount_total, object.currency)}`,
        `Email: ${object.customer_details?.email || "unknown"}`,
        `Name: ${object.customer_details?.name || "unknown"}`,
        `Customer: ${object.customer || "none"}`,
        `Session: ${object.id}`,
      ]);
      return;
    }

    case "payment_intent.succeeded": {
      // ACH Direct Debit reaches this event only after the bank settles the
      // payment. Persist the settlement marker and, for a final invoice,
      // start the Care countdown from this settlement timestamp.
      await rememberCarePlanFromPaymentIntent(client, object, event.created);
      const invoiceId = object.invoice && customerId(object.invoice);
      if (invoiceId) {
        const invoice = await client.invoices.retrieve(invoiceId);
        await provisionCareAfterFinalPayment(client, invoice, event.created);
      }
      await notify("FORGE — ACH payment settled", [
        `Payment intent: ${object.id}`,
        `Customer: ${object.customer || "unknown"}`,
        `Settled: ${new Date((event.created || Date.now() / 1000) * 1000).toISOString()}`,
        `Invoice: ${invoiceId || "none"}`,
      ]);
      return;
    }

    case "checkout.session.async_payment_failed":
      await notify("FORGE — payment failed at checkout", [
        `Email: ${object.customer_details?.email || "unknown"}`,
        `Amount: ${money(object.amount_total, object.currency)}`,
        `Session: ${object.id}`,
      ]);
      return;

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await notify(`FORGE — subscription ${event.type.split(".").pop()}`, [
        `Plan: ${object.metadata?.plan_label || object.metadata?.plan || "—"}`,
        `Status: ${object.status}`,
        `Cancel at period end: ${object.cancel_at_period_end}`,
        `Customer: ${object.customer}`,
        `Subscription: ${object.id}`,
      ]);
      return;

    case "invoice.paid":
      await provisionCareAfterFinalPayment(client, object);
      await notify("FORGE — invoice paid", [
        `Number: ${object.number || object.id}`,
        `Amount: ${money(object.amount_paid, object.currency)}`,
        `Email: ${object.customer_email || "unknown"}`,
        `Customer: ${object.customer}`,
      ]);
      return;

    case "invoice.payment_failed":
      // Stripe's own dunning retries the card; this is the human heads-up.
      await notify("FORGE — invoice payment failed", [
        `Number: ${object.number || object.id}`,
        `Amount due: ${money(object.amount_due, object.currency)}`,
        `Email: ${object.customer_email || "unknown"}`,
        `Attempt: ${object.attempt_count}`,
        `Hosted invoice: ${object.hosted_invoice_url || "—"}`,
      ]);
      return;

    default:
      return;
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }

  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret) {
    console.error("Stripe webhook is not configured");
    return response.status(503).json({ ok: false });
  }

  let event;
  try {
    const body = await rawBody(request);
    event = client.webhooks.constructEvent(
      body,
      request.headers["stripe-signature"],
      secret,
    );
  } catch (error) {
    // An unverified body is not trustworthy input — never act on it.
    console.error("Stripe signature verification failed", error?.message);
    return response
      .status(400)
      .json({ ok: false, error: "Invalid signature." });
  }

  if (!RELEVANT.has(event.type) || seen.has(event.id)) {
    return response.status(200).json({ ok: true, ignored: true });
  }

  try {
    await handleEvent(client, event);
    if (seen.size > 500) seen.clear();
    seen.add(event.id);
    return response.status(200).json({ ok: true });
  } catch (error) {
    // Non-2xx tells Stripe to retry with backoff.
    console.error("Stripe webhook handler failed", event.type, error?.message);
    return response.status(500).json({ ok: false });
  }
}
