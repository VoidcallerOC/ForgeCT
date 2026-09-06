/**
 * Reconciles the FORGE CT catalog in Stripe and prints the price IDs to paste
 * into the deployment environment.
 *
 * This adopts products that already exist — including ones created by hand in
 * the Dashboard — by matching on a metadata tag, then the canonical name, then
 * any known former name. It renames and re-describes what it finds rather than
 * creating a second copy.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs           # report only
 *   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs --apply   # write
 *
 * Prices are immutable in Stripe: an amount cannot be edited. When an adopted
 * product carries a price at the wrong amount, this creates the correct one and
 * tells you which old price to archive — it never deletes anything.
 */
import process from "node:process";
import Stripe from "stripe";

const API_VERSION = "2026-07-29.dahlia";
const TAG = "forge_ct_catalog";

/**
 * Site and System bills in thirds against the "from $6,000" floor published on
 * /services, so each installment is $2,000. If that project is really a $9,000
 * build, change this to 300000 and update the services page in the same commit
 * — the page and the catalog have to agree.
 */
const SYSTEM_INSTALLMENT = 200000;

/**
 * Local Business Site bills in halves against the "from $2,000" floor.
 */
const SITE_INSTALLMENT = 100000;

/**
 * Stripe product tax codes drive Stripe Tax. The Dashboard default of
 * "Software as a service (SaaS)" is wrong for bespoke design work and for a
 * monthly care plan, and it will mis-rate invoices the day Stripe Tax is
 * switched on. Set the correct codes in the Dashboard (Product catalog → each
 * product → Tax code) and confirm them with an accountant, then fill them in
 * here so future runs keep them pinned.
 *
 *   const TAX_CODE = { service: "txcd_…", care: "txcd_…" };
 */
const TAX_CODE = {};

const CATALOG = [
  {
    key: "care",
    envVar: "STRIPE_PRICE_CARE",
    name: "Care",
    aliases: ["Website Maintenance"],
    description:
      "Hours, holiday notes, events, and restocks stay true on your live page. Cancel any month. The site stays yours.",
    unitAmount: 3500,
    recurring: { interval: "month" },
    taxCode: TAX_CODE.care,
  },
  {
    key: "care_plus",
    envVar: "STRIPE_PRICE_CARE_PLUS",
    name: "Care+",
    aliases: ["Website Maintenance Plus", "Care Plus"],
    description:
      "Everything in Care, plus one extra block or small page change a month and same-week turns when the floor moves.",
    unitAmount: 7900,
    recurring: { interval: "month" },
    taxCode: TAX_CODE.care,
  },
  {
    key: "site_deposit",
    envVar: "STRIPE_PRICE_SITE_DEPOSIT",
    name: "Local Business Site — deposit",
    aliases: ["Site - First Deposit", "Local Business Site"],
    description:
      "Books the build and starts a three to five page shop site — hours, the floor, and how to walk in. Half now, half at launch.",
    unitAmount: SITE_INSTALLMENT,
    taxCode: TAX_CODE.service,
  },
  {
    key: "site_final",
    name: "Local Business Site — final",
    aliases: ["Site - Final Payment"],
    description:
      "The balance on a Local Business Site, due when the page goes live. Covers launch and the handoff. The page is yours.",
    unitAmount: SITE_INSTALLMENT,
    taxCode: TAX_CODE.service,
    invoiceOnly: true,
  },
  {
    key: "system_deposit",
    envVar: "STRIPE_PRICE_SYSTEM_DEPOSIT",
    name: "Site and System — deposit",
    aliases: ["Site and System - Deposit", "Site and System"],
    description:
      "First of three. Books the calendar and starts a five to ten page site with events, play nights, and intake.",
    unitAmount: SYSTEM_INSTALLMENT,
    taxCode: TAX_CODE.service,
  },
  {
    key: "system_build",
    name: "Site and System — build",
    aliases: ["Site and System - Build"],
    description:
      "Second of three. The full build — every page, events and intake wired up, and a private link to walk through before it is public.",
    unitAmount: SYSTEM_INSTALLMENT,
    taxCode: TAX_CODE.service,
    invoiceOnly: true,
  },
  {
    key: "system_launch",
    name: "Site and System — launch",
    aliases: ["Site and System - Launch"],
    description:
      "Third of three, due when the page goes live. Covers launch and the handoff. The page is yours.",
    unitAmount: SYSTEM_INSTALLMENT,
    taxCode: TAX_CODE.service,
    invoiceOnly: true,
  },
];

const apply = process.argv.includes("--apply");
const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error("Set STRIPE_SECRET_KEY (a restricted key, rk_…) first.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: API_VERSION });
const notes = [];
const warnings = [];

function lookupKeyFor(entry) {
  return `forge_${entry.key}`;
}

function normalize(name) {
  // Hand-typed names drift on dashes, spacing, and case. Compare on letters
  // and digits only so "Site and System - Deposit" adopts cleanly.
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function allProducts() {
  const products = [];
  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    products.push(product);
  }
  return products;
}

function matchProduct(entry, products) {
  const tagged = products.find((p) => p.metadata?.[TAG] === entry.key);
  if (tagged) return { product: tagged, how: "tag" };

  const wanted = [entry.name, ...(entry.aliases || [])].map(normalize);
  const byName = products.find((p) => wanted.includes(normalize(p.name)));
  if (byName) return { product: byName, how: "name" };

  return { product: null, how: "none" };
}

function sameShape(price, entry) {
  if (price.unit_amount !== entry.unitAmount) return false;
  if (price.currency !== "usd") return false;
  const wantInterval = entry.recurring?.interval || null;
  const haveInterval = price.recurring?.interval || null;
  return wantInterval === haveInterval;
}

async function reconcilePrice(entry, product) {
  const lookupKey = lookupKeyFor(entry);

  const tagged = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });
  if (tagged.data[0]) {
    if (!sameShape(tagged.data[0], entry)) {
      warnings.push(
        `${entry.name}: price ${tagged.data[0].id} holds lookup key ${lookupKey} but is $${(tagged.data[0].unit_amount / 100).toFixed(2)}, not $${(entry.unitAmount / 100).toFixed(2)}. Archive it, then re-run.`,
      );
    }
    return { price: tagged.data[0], action: "kept" };
  }

  const existing = [];
  for await (const price of stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  })) {
    existing.push(price);
  }

  const usable = existing.find((price) => sameShape(price, entry));
  if (usable) {
    if (!apply) return { price: usable, action: "would tag" };
    const updated = await stripe.prices.update(usable.id, {
      lookup_key: lookupKey,
      transfer_lookup_key: true,
      metadata: { [TAG]: entry.key },
    });
    return { price: updated, action: "tagged" };
  }

  for (const price of existing) {
    warnings.push(
      `${entry.name}: existing price ${price.id} is $${(price.unit_amount / 100).toFixed(2)}${price.recurring ? "/" + price.recurring.interval : ""} — the catalog wants $${(entry.unitAmount / 100).toFixed(2)}. A new price is being used; archive ${price.id} in the Dashboard so it cannot be charged.`,
    );
  }

  if (!apply) return { price: null, action: "would create" };

  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    lookup_key: lookupKey,
    unit_amount: entry.unitAmount,
    ...(entry.recurring ? { recurring: entry.recurring } : {}),
    metadata: { [TAG]: entry.key },
  });
  return { price, action: "created" };
}

async function reconcileProduct(entry, products) {
  const { product, how } = matchProduct(entry, products);

  if (!product) {
    if (!apply) return { product: null, action: "would create" };
    const created = await stripe.products.create({
      name: entry.name,
      description: entry.description,
      metadata: { [TAG]: entry.key },
      ...(entry.taxCode ? { tax_code: entry.taxCode } : {}),
    });
    return { product: created, action: "created" };
  }

  const drift = {};
  if (product.name !== entry.name) drift.name = entry.name;
  if (product.description !== entry.description)
    drift.description = entry.description;
  if (product.metadata?.[TAG] !== entry.key)
    drift.metadata = { ...product.metadata, [TAG]: entry.key };
  if (entry.taxCode && product.tax_code !== entry.taxCode)
    drift.tax_code = entry.taxCode;

  if (!entry.taxCode && product.tax_code) {
    notes.push(
      `${entry.name}: tax code is ${typeof product.tax_code === "string" ? product.tax_code : product.tax_code.id} — confirm it is right before enabling Stripe Tax.`,
    );
  }

  if (!Object.keys(drift).length) {
    return { product, action: `adopted by ${how}` };
  }

  if (!apply) {
    return {
      product,
      action: `would update (${Object.keys(drift).join(", ")})`,
    };
  }

  const updated = await stripe.products.update(product.id, drift);
  return {
    product: updated,
    action: `updated (${Object.keys(drift).join(", ")})`,
  };
}

const products = await allProducts();
const rows = [];

for (const entry of CATALOG) {
  const { product, action: productAction } = await reconcileProduct(
    entry,
    products,
  );
  const { price, action: priceAction } = product
    ? await reconcilePrice(entry, product)
    : { price: null, action: "pending product" };
  rows.push({ entry, product, productAction, price, priceAction });
}

const claimed = new Set(rows.map((row) => row.product?.id).filter(Boolean));
const orphans = products.filter((product) => !claimed.has(product.id));

console.log(
  apply ? "\nCatalog applied.\n" : "\nDry run — pass --apply to write.\n",
);
console.log(
  "Product                             Amount      Product        Price",
);
console.log("-".repeat(96));
for (const { entry, productAction, price, priceAction } of rows) {
  const amount = `$${(entry.unitAmount / 100).toFixed(2)}${entry.recurring ? "/mo" : ""}`;
  console.log(
    `${entry.name.padEnd(35)} ${amount.padEnd(11)} ${productAction.padEnd(14)} ${priceAction.padEnd(12)} ${price?.id || ""}`,
  );
}

if (orphans.length) {
  console.log("\nActive products not in the catalog:");
  for (const product of orphans) {
    console.log(`  ${product.id}  ${product.name}`);
  }
  console.log("  Archive any of these that are duplicates or no longer sold.");
}

if (notes.length) {
  console.log("\nNotes:");
  for (const note of notes) console.log(`  - ${note}`);
}

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (!Object.keys(TAX_CODE).length) {
  console.log(
    "\nTax codes are unset. The Dashboard default (Software as a service) is wrong\n" +
      "for custom build work and for the care plans. Set the right codes per product\n" +
      "in the Dashboard before enabling Stripe Tax, then pin them in TAX_CODE here.",
  );
}

console.log("\nEnvironment variables:\n");
for (const { entry, price } of rows) {
  if (!entry.envVar) continue;
  console.log(`${entry.envVar}=${price?.id || "<run with --apply>"}`);
}

const invoiceOnly = rows.filter((row) => row.entry.invoiceOnly);
if (invoiceOnly.length) {
  console.log("\nInvoiced later (no env var needed):\n");
  for (const { entry, price } of invoiceOnly) {
    console.log(
      `  ${entry.name.padEnd(35)} ${price?.id || "(pending)"}  →  scripts/stripe-invoice.mjs --label "${entry.name}"`,
    );
  }
}
