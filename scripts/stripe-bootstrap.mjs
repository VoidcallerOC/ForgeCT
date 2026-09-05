/**
 * Creates the FORGE CT product catalog in Stripe, then prints the price IDs to
 * paste into the deployment environment.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=rk_test_... node scripts/stripe-bootstrap.mjs
 *   STRIPE_SECRET_KEY=rk_test_... node scripts/stripe-bootstrap.mjs --apply
 *
 * Without --apply it only reports what it would create. It is safe to re-run:
 * products and prices are looked up by a stable lookup_key / metadata tag
 * before anything new is written.
 */
import process from "node:process";
import Stripe from "stripe";

const API_VERSION = "2026-07-29.dahlia";
const TAG = "forge_ct_catalog";

const PLANS = [
  {
    key: "care",
    envVar: "STRIPE_PRICE_CARE",
    product: "Care",
    description:
      "Monthly care for a live FORGE shop page. Hours, holiday notes, events, and restocks stay true. Cancel any month.",
    price: { unit_amount: 3500, recurring: { interval: "month" } },
  },
  {
    key: "care_plus",
    envVar: "STRIPE_PRICE_CARE_PLUS",
    product: "Care+",
    description:
      "Everything in Care, plus one extra block or small page change a month and same-week turns.",
    price: { unit_amount: 7900, recurring: { interval: "month" } },
  },
  {
    key: "site_deposit",
    envVar: "STRIPE_PRICE_SITE_DEPOSIT",
    product: "Local Business Site",
    description:
      "Deposit to start a three to five page shop site. Applied to the final invoice.",
    price: { unit_amount: 100000 },
  },
  {
    key: "system_deposit",
    envVar: "STRIPE_PRICE_SYSTEM_DEPOSIT",
    product: "Site and System",
    description:
      "Deposit to start a five to ten page site with events, play nights, and intake. Applied to the final invoice.",
    price: { unit_amount: 300000 },
  },
];

const apply = process.argv.includes("--apply");
const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error("Set STRIPE_SECRET_KEY (a restricted key, rk_…) first.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: API_VERSION });

async function findProduct(plan) {
  // Search is eventually consistent, so also fall back to a list scan.
  const found = await stripe.products.search({
    query: `metadata['${TAG}']:'${plan.key}'`,
    limit: 1,
  });
  if (found.data[0]) return found.data[0];
  for await (const product of stripe.products.list({ limit: 100 })) {
    if (product.metadata?.[TAG] === plan.key) return product;
  }
  return null;
}

const results = [];

for (const plan of PLANS) {
  const lookupKey = `forge_${plan.key}`;
  const existingPrices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });

  if (existingPrices.data[0]) {
    results.push({ plan, price: existingPrices.data[0], created: false });
    continue;
  }

  if (!apply) {
    results.push({ plan, price: null, created: false });
    continue;
  }

  const product =
    (await findProduct(plan)) ||
    (await stripe.products.create({
      name: plan.product,
      description: plan.description,
      metadata: { [TAG]: plan.key },
    }));

  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    lookup_key: lookupKey,
    unit_amount: plan.price.unit_amount,
    ...(plan.price.recurring ? { recurring: plan.price.recurring } : {}),
    metadata: { [TAG]: plan.key },
  });

  results.push({ plan, price, created: true });
}

console.log(
  apply ? "\nCatalog applied.\n" : "\nDry run — pass --apply to write.\n",
);
for (const { plan, price, created } of results) {
  const amount = (plan.price.unit_amount / 100).toFixed(2);
  const cadence = plan.price.recurring ? "/mo" : " one time";
  const state = price ? (created ? "created" : "exists") : "would create";
  console.log(
    `${plan.product.padEnd(22)} $${amount}${cadence.padEnd(9)} ${state.padEnd(13)} ${price?.id || ""}`,
  );
}

console.log("\nEnvironment variables:\n");
for (const { plan, price } of results) {
  console.log(`${plan.envVar}=${price?.id || "<run with --apply>"}`);
}
