/**
 * Editable package templates seeded from published /services list prices.
 * Amounts are list defaults only — each proposal may edit them.
 * UNVERIFIED list prices (no published Forge page amount) are flagged.
 */

export const PACKAGE_TEMPLATES = [
  {
    id: "website-basic",
    name: "Website Build — Basic",
    list_price_verified: true,
    source: "/services Basic $750",
    line_items: [
      {
        label: "Basic · Starter Website (up to 3 pages)",
        quantity: 1,
        unit_amount_cents: 75000,
      },
    ],
    scope_text:
      "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision.",
    timeline_text:
      "Schedule agreed after discovery. Extra-fast: 1 day (+$250) for defined Basic scope.",
  },
  {
    id: "website-standard",
    name: "Website Build — Standard",
    list_price_verified: true,
    source: "/services Standard $1,500",
    line_items: [
      {
        label: "Standard · Business Website (up to 5 pages)",
        quantity: 1,
        unit_amount_cents: 150000,
      },
    ],
    scope_text:
      "Up to 5 pages; custom design and development; responsive, mobile-first; hosting setup; social media icons; speed and performance optimization; 2 revisions.",
    timeline_text:
      "Schedule agreed after discovery. Extra-fast: 3 days (+$500) for defined Standard scope.",
  },
  {
    id: "website-premium",
    name: "Website Build — Premium",
    list_price_verified: true,
    source: "/services Premium $2,500",
    line_items: [
      {
        label: "Premium · Forge Website (up to 8 pages)",
        quantity: 1,
        unit_amount_cents: 250000,
      },
    ],
    scope_text:
      "Up to 8 pages; custom design and development; responsive, mobile-first; advanced functionality; hosting setup; social media icons; performance; 3 revisions. E-commerce is a paid add-on.",
    timeline_text:
      "Schedule agreed after discovery. Extra-fast: 5 days (+$750) for defined Premium scope.",
  },
  {
    id: "ecommerce-addon",
    name: "E-Commerce add-on",
    list_price_verified: true,
    source: "/services E-commerce functionality +$750",
    line_items: [
      {
        label: "E-commerce functionality add-on",
        quantity: 1,
        unit_amount_cents: 75000,
      },
    ],
    scope_text:
      "Add e-commerce functionality to an otherwise applicable package. Product, catalog, integration, and custom-functionality scope is agreed separately.",
    timeline_text:
      "+5 days relative to the base package schedule (as published).",
  },
  {
    id: "custom-web-product",
    name: "Custom Web Product",
    list_price_verified: false,
    source: "UNVERIFIED — no published fixed list price; set amount per scope",
    line_items: [
      {
        label: "Custom web product (scoped)",
        quantity: 1,
        unit_amount_cents: 0,
      },
    ],
    scope_text:
      "Custom product / application scope to be defined with the client.",
    timeline_text: "Timeline set after discovery.",
  },
  {
    id: "restoration",
    name: "Restoration",
    list_price_verified: false,
    source: "UNVERIFIED — no published fixed list price; set amount per scope",
    line_items: [
      {
        label: "Site restoration / recovery (scoped)",
        quantity: 1,
        unit_amount_cents: 0,
      },
    ],
    scope_text:
      "Restore or recover an existing site. Scope and urgency agreed before send.",
    timeline_text: "Timeline set after discovery.",
  },
  {
    id: "maintenance-care",
    name: "Maintenance — Care (monthly)",
    list_price_verified: true,
    source:
      "/care Care $35/mo via Stripe Payment Link — proposal may reference, not replace, Care checkout",
    line_items: [
      {
        label: "Care subscription (first month reference)",
        quantity: 1,
        unit_amount_cents: 3500,
      },
    ],
    scope_text:
      "Ongoing Care: hours/holiday notes, content updates when sent, cancel anytime via Stripe Customer Portal. Prefer /pay Payment Link for recurring billing.",
    timeline_text: "Recurring monthly; cancel anytime.",
  },
];

export const DEFAULT_TERMS = `This proposal is an offer of work from FORGE CT (Farmington, Connecticut). Accepting confirms you reviewed the scope, timeline, and pricing for the stated version. It is not a substitute for a signed legal contract or electronic signature platform.

Payment: the deposit listed is due via Stripe Checkout after acceptance. Remaining balance is invoiced after scope milestones as agreed. Website build payments are arranged after scope is confirmed.

Questions: create@forge-ct.com`;

export const ADD_ON_LINE_ITEMS = [
  { label: "Additional page", quantity: 1, unit_amount_cents: 15000 },
  { label: "Additional revision", quantity: 1, unit_amount_cents: 10000 },
  {
    label: "Extra-fast delivery — Basic (+1 day)",
    quantity: 1,
    unit_amount_cents: 25000,
  },
  {
    label: "Extra-fast delivery — Standard (+3 days)",
    quantity: 1,
    unit_amount_cents: 50000,
  },
  {
    label: "Extra-fast delivery — Premium (+5 days)",
    quantity: 1,
    unit_amount_cents: 75000,
  },
  {
    label: "Additional product (scoped)",
    quantity: 1,
    unit_amount_cents: 25000,
  },
];

export function getPackageTemplate(id) {
  return PACKAGE_TEMPLATES.find((p) => p.id === id) || null;
}
