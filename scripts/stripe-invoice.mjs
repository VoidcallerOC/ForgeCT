/**
 * Sends a FORGE CT project invoice through Stripe Invoicing — the right tool
 * for "from $2,000" work, where the number is settled on a call rather than
 * fixed on the page.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=rk_... node scripts/stripe-invoice.mjs \
 *     --email owner@shop.com --name "Shop Name" \
 *     --amount 2400 --label "Local Business Site — balance" [--days 14] [--send]
 *
 * Without --send it creates a draft you can read in the Dashboard first.
 */
import process from "node:process";
import Stripe from "stripe";

const API_VERSION = "2026-07-29.dahlia";

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const email = arg("email");
const name = arg("name");
const amount = Number(arg("amount"));
const label = arg("label") || "FORGE CT project";
const days = Number(arg("days") || 14);
const send = process.argv.includes("--send");
const key = process.env.STRIPE_SECRET_KEY;

if (!key || !email || !name || !Number.isFinite(amount) || amount <= 0) {
  console.error(
    "Usage: STRIPE_SECRET_KEY=rk_... node scripts/stripe-invoice.mjs --email <e> --name <n> --amount <dollars> [--label <l>] [--days 14] [--send]",
  );
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: API_VERSION });

const existing = await stripe.customers.list({ email, limit: 1 });
const customer =
  existing.data[0] ||
  (await stripe.customers.create({
    email,
    name,
    metadata: { source: "forge_ct_invoice" },
  }));

const invoice = await stripe.invoices.create({
  customer: customer.id,
  collection_method: "send_invoice",
  days_until_due: days,
  // Stripe Tax stays off until FORGE holds an active CT registration.
  automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
  description: label,
  footer: "FORGE CT — Farmington, Connecticut. Questions: Create@Forge-CT.com",
  metadata: { source: "forge_ct_invoice" },
});

await stripe.invoiceItems.create({
  customer: customer.id,
  invoice: invoice.id,
  currency: "usd",
  unit_amount: Math.round(amount * 100),
  quantity: 1,
  description: label,
});

const finalized = send
  ? await stripe.invoices.sendInvoice(invoice.id)
  : await stripe.invoices.retrieve(invoice.id);

console.log(`Customer:  ${customer.id} (${email})`);
console.log(`Invoice:   ${finalized.id} — ${finalized.status}`);
console.log(`Amount:    $${amount.toFixed(2)} due in ${days} days`);
console.log(
  `Hosted:    ${finalized.hosted_invoice_url || "(finalizes on send)"}`,
);
if (!send) console.log("\nDraft only. Re-run with --send to email it.");
