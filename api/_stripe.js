import Stripe from "stripe";

// Pin the API version so a Stripe-side default bump can never change behavior
// under a deployed function. Bump this deliberately, then re-test.
export const STRIPE_API_VERSION = "2026-07-29.dahlia";

// Suffix is 8 random letters, per Stripe's integration_identifier convention.
// Keep these stable so Dashboard reporting stays comparable across deploys.
export const INTEGRATION_ID = {
  care: "forge-care-mtjqvzxd",
  deposit: "forge-deposit-rlbcgnwp",
};

let client;

/**
 * Lazily construct a single StripeClient per warm function instance.
 * Returns null when the key is absent so handlers can answer 503 instead of
 * throwing at import time.
 */
export function stripe() {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client = new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: { name: "FORGE CT", url: "https://www.forge-ct.com" },
    maxNetworkRetries: 2,
  });
  return client;
}

/**
 * The things a shop can buy on the site. One Stripe Product per plan, so
 * Checkout and invoice line items name the plan the customer actually picked.
 */
export const CATALOG = {
  care: {
    mode: "subscription",
    label: "Care",
    priceEnv: "STRIPE_PRICE_CARE",
    integrationIdentifier: INTEGRATION_ID.care,
  },
  "care-plus": {
    mode: "subscription",
    label: "Care+",
    priceEnv: "STRIPE_PRICE_CARE_PLUS",
    integrationIdentifier: INTEGRATION_ID.care,
  },
  "site-deposit": {
    mode: "payment",
    label: "Local Business Site — deposit",
    priceEnv: "STRIPE_PRICE_SITE_DEPOSIT",
    integrationIdentifier: INTEGRATION_ID.deposit,
  },
  "system-deposit": {
    mode: "payment",
    label: "Site and System — deposit",
    priceEnv: "STRIPE_PRICE_SYSTEM_DEPOSIT",
    integrationIdentifier: INTEGRATION_ID.deposit,
  },
};

export function siteUrl(request) {
  const configured = process.env.SITE_URL;
  if (configured) {
    return configured
      .replace(/\/$/, "")
      .replace("https://forge-ct.com", "https://www.forge-ct.com");
  }
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  const proto = request.headers["x-forwarded-proto"] || "https";
  const canonicalHost = host === "forge-ct.com" ? "www.forge-ct.com" : host;
  return canonicalHost
    ? `${proto}://${canonicalHost}`
    : "https://www.forge-ct.com";
}

/**
 * Stripe Tax stays off until FORGE holds an active registration. Turning
 * automatic_tax on without one makes Stripe collect nothing while the
 * Dashboard reads as if tax is handled — see docs/STRIPE.md.
 */
export function automaticTax() {
  return { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" };
}

export function readJsonBody(request) {
  const payload = request.body;
  if (typeof payload !== "string") return payload || {};
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
