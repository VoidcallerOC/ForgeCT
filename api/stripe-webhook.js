import { stripe } from "./_stripe.js";
import { Pool } from 'pg';

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

// Database connection pool for durable event storage
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Graceful shutdown
process.on('SIGTERM', () => pool.end());
process.on('SIGINT', () => pool.end());

// Database helper functions
async function isEventProcessed(eventId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT 1 FROM stripe_webhook_events WHERE event_id = $1',
      [eventId]
    );
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}

async function storeWebhookEvent(eventId, eventType, eventData, metadata = null) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO stripe_webhook_events 
       (event_id, event_type, event_data, metadata) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (event_id) DO NOTHING`,
      [eventId, eventType, eventData, metadata]
    );
  } finally {
    client.release();
  }
}

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

// Enhanced ACH settlement verification
async function isACHSettled(paymentIntent) {
  if (paymentIntent.payment_method_types?.includes('us_bank_account')) {
    if (paymentIntent.charges?.data?.[0]) {
      const chargeId = paymentIntent.charges.data[0].id;
      const client = stripe();
      if (client) {
        try {
          const charge = await client.charges.retrieve(chargeId);
          return charge.paid && charge.status === 'succeeded';
        } catch (error) {
          console.error('Error verifying ACH settlement:', error);
          return false;
        }
      }
    }
  }
  return true;
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

  try {
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
      console.error(`Resend notification failed: ${result.status}`, subject);
      return;
    }
    
    console.log(`Resend notification sent: ${subject}`);
  } catch (error) {
    console.error('Resend notification error:', error);
  }
}

export async function handleEvent(client, event) {
  const object = event.data.object;
  const eventId = event.id;
  const eventType = event.type;

  console.log(`Processing event: ${eventType}`, {
    eventId,
    created: event.created,
    livemode: event.livemode
  });

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      if (object.payment_status === "unpaid") {
        console.log("checkout session completed but unpaid", object.id);
        await storeWebhookEvent(eventId, eventType, object, {
          status: 'ignored',
          reason: 'payment_status is unpaid'
        });
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
        `Payment Status: ${object.payment_status}`,
      ]);
      
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'processed',
        plan,
        amount: object.amount_total,
        currency: object.currency
      });
      return;
    }

    case "payment_intent.succeeded": {
      const isSettled = await isACHSettled(object);
      
      if (!isSettled) {
        console.log('ACH payment not yet settled, skipping processing', object.id);
        await storeWebhookEvent(eventId, eventType, object, {
          status: 'pending',
          reason: 'ACH settlement not confirmed'
        });
        return;
      }
      
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
        `Amount: ${money(object.amount, object.currency)}`,
      ]);
      
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'processed',
        ach_settled: true,
        amount: object.amount,
        currency: object.currency
      });
      return;
    }

    case "checkout.session.async_payment_failed":
      await notify("FORGE — payment failed at checkout", [
        `Email: ${object.customer_details?.email || "unknown"}`,
        `Amount: ${money(object.amount_total, object.currency)}`,
        `Session: ${object.id}`,
      ]);
      
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'failed',
        reason: 'async_payment_failed'
      });
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
      
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'processed',
        subscription_status: object.status
      });
      return;

    case "invoice.paid":
      await provisionCareAfterFinalPayment(client, object);
      await notify("FORGE — invoice paid", [
        `Number: ${object.number || object.id}`,
        `Amount: ${money(object.amount_paid, object.currency)}`,
        `Email: ${object.customer_email || "unknown"}`,
        `Customer: ${object.customer}`,
      ]);
      
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'processed',
        invoice_number: object.number,
        amount_paid: object.amount_paid
      });
      return;

    case "invoice.payment_failed":
      await notify("FORGE — invoice payment failed", [
        `Number: ${object.number || object.id}`,
        `Amount due: ${money(object.amount_due, object.currency)}`,
        `Email: ${object.customer_email || "unknown"}`,
        `Attempt: ${object.attempt_count}`,
        `Hosted invoice: ${object.hosted_invoice_url || "—"}`,
      ]);
      
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'failed',
        attempt_count: object.attempt_count
      });
      return;

    default:
      await storeWebhookEvent(eventId, eventType, object, {
        status: 'ignored',
        reason: 'not in RELEVANT set'
      });
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
    console.error("Stripe signature verification failed", error?.message);
    return response
      .status(400)
      .json({ ok: false, error: "Invalid signature." });
  }

  try {
    const alreadyProcessed = await isEventProcessed(event.id);
    
    if (!RELEVANT.has(event.type) || alreadyProcessed) {
      if (!alreadyProcessed) {
        await storeWebhookEvent(event.id, event.type, event.data.object, {
          status: 'ignored',
          reason: 'not relevant or already processed'
        });
      }
      return response.status(200).json({ ok: true, ignored: true });
    }

    await handleEvent(client, event);
    
    await storeWebhookEvent(event.id, event.type, event.data.object, {
      status: 'processed',
      processed_at: new Date().toISOString()
    });
    
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Stripe webhook handler failed", event?.type, error?.message);
    
    if (event) {
      await storeWebhookEvent(event.id, event.type, event.data?.object, {
        status: 'failed',
        error: error.message,
        stack: error.stack
      });
    }
    
    return response.status(500).json({ ok: false });
  }
}