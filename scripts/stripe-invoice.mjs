/**
 * Sends a FORGE CT invoice through Stripe Invoicing — the later installments on
 * a build, and any work whose number is settled on a call rather than fixed on
 * the page.
 *
 * Bill a catalog installment by its lookup key, so the invoice line matches the
 * product a shop already saw at checkout:
 *
 *   STRIPE_SECRET_KEY=rk_… node scripts/stripe-invoice.mjs \
 *     --email owner@shop.com --name "Shop Name" --lookup forge_system_build --send
 *
 * Or bill a one-off amount:
 *
 *   STRIPE_SECRET_KEY=rk_… node scripts/stripe-invoice.mjs \
 *     --email owner@shop.com --name "Shop Name" \
 *     --amount 2400 --label "Extra page — intake form" --send
 *
 * Lookup keys: forge_site_deposit, forge_site_final, forge_system_deposit,
 * forge_system_build, forge_system_launch.
 *
 * Without --send it leaves a draft you can read in the Dashboard first.
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
const lookup = arg("lookup");
const amount = arg("amount") === undefined ? undefined : Number(arg("amount"));
const label = arg("label");
const days = Number(arg("days") || 14);
const send = process.argv.includes("--send");
const key = process.env.STRIPE_SECRET_KEY;

const hasAmount = amount !== undefined && Number.isFinite(amount) && amount > 0;

if (
  !key ||
  !email ||
  !name ||
  (!lookup && !hasAmount) ||
  (lookup && hasAmount)
) {
  console.error(
    [
      "Usage:",
      "  STRIPE_SECRET_KEY=rk_… node scripts/stripe-invoice.mjs --email <e> --name <n> \\",
      "    ( --lookup <catalog key> | --amount <dollars> --label <text> ) [--days 14] [--send]",
      "",
      "Pass exactly one of --lookup or --amount.",
    ].join("\n"),
  );
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: API_VERSION });

let price;
if (lookup) {
  const found = await stripe.prices.list({
    lookup_keys: [lookup],
    limit: 1,
    expand: ["data.product"],
  });
  price = found.data[0];
  if (!price) {
    console.error(
      `No price with lookup key "${lookup}". Run scripts/stripe-bootstrap.mjs --apply first.`,
    );
    process.exit(1);
  }
  if (price.recurring) {
    console.error(
      `"${lookup}" is a recurring price. Subscriptions are sold through Checkout, not invoices.`,
    );
    process.exit(1);
  }
}

const lineLabel = label || (price ? price.product.name : "FORGE CT project");

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
  // Stripe Tax stays off until FORGE holds an active registration, and until
  // each product carries a tax code that is not the SaaS default.
  automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
  description: lineLabel,
  footer: "FORGE CT — Farmington, Connecticut. Questions: create@forge-ct.com",
  metadata: { source: "forge_ct_invoice", ...(lookup ? { lookup } : {}) },
});

await stripe.invoiceItems.create({
  customer: customer.id,
  invoice: invoice.id,
  quantity: 1,
  ...(price
    ? { price: price.id }
    : {
        currency: "usd",
        unit_amount: Math.round(amount * 100),
        description: lineLabel,
      }),
});

const finalized = send
  ? await stripe.invoices.sendInvoice(invoice.id)
  : await stripe.invoices.retrieve(invoice.id);

const dollars = price ? price.unit_amount / 100 : amount;

console.log(`Customer:  ${customer.id} (${email})`);
console.log(`Line:      ${lineLabel}`);
console.log(`Invoice:   ${finalized.id} — ${finalized.status}`);
console.log(`Amount:    $${dollars.toFixed(2)} due in ${days} days`);
console.log(
  `Hosted:    ${finalized.hosted_invoice_url || "(finalizes on send)"}`,
);
if (!send) console.log("\nDraft only. Re-run with --send to email it.");
