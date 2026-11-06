/**
 * Editable package templates seeded from published /services list prices.
 * Amounts are list defaults only — each proposal may edit them.
 * UNVERIFIED list prices (no published FORGE CT page amount) are flagged.
 * Local Business Site is published as a starting price; the default below is that minimum.
 */

export const PACKAGE_TEMPLATES = [
  {
    id: "local-business-site",
    name: "Local Business Site",
    list_price_verified: true,
    source: "/services Local Business Site from $2,000",
    line_items: [
      {
        label: "Local Business Site",
        quantity: 1,
        unit_amount_cents: 200000,
      },
    ],
    scope_text:
      "A site for a shop or local business. Published from $2,000; confirm the final amount before send.",
    timeline_text: "Schedule agreed after discovery.",
  },
  {
    id: "site-and-system",
    name: "Site and System",
    list_price_verified: true,
    source: "/services Site and System $6,000",
    line_items: [
      {
        label: "Site and System (booking, inventory, intake)",
        quantity: 1,
        unit_amount_cents: 600000,
      },
    ],
    scope_text: "Site and System: booking, inventory, and intake.",
    timeline_text: "Schedule agreed after discovery.",
  },
  {
    id: "product-site",
    name: "Product Site",
    list_price_verified: true,
    source: "/services Product Site $16,000",
    line_items: [
      {
        label: "Product Site",
        quantity: 1,
        unit_amount_cents: 1600000,
      },
    ],
    scope_text:
      "Product Site. Confirm catalog and integration scope before send.",
    timeline_text: "Schedule agreed after discovery.",
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
  {
    id: "maintenance-care-plus",
    name: "Maintenance — Care+ (monthly)",
    list_price_verified: true,
    source:
      "/care Care+ $79/mo via Stripe Payment Link — proposal may reference, not replace, Care+ checkout",
    line_items: [
      {
        label: "Care+ subscription (first month reference)",
        quantity: 1,
        unit_amount_cents: 7900,
      },
    ],
    scope_text:
      "Care plus one extra block or small page change a month. Prefer /pay Payment Link for recurring billing.",
    timeline_text: "Recurring monthly; cancel anytime.",
  },
];

export const DEFAULT_TERMS = `This proposal is an offer of work from FORGE CT (Farmington, Connecticut). Accepting confirms you reviewed the scope, timeline, and pricing for the stated version. It is not a substitute for a signed legal contract or electronic signature platform.

Payment: the deposit listed is due via Stripe Checkout after acceptance. Remaining balance is invoiced after scope milestones as agreed. Website build payments are arranged after scope is confirmed.

Questions: create@forge-ct.com`;

export const ADD_ON_LINE_ITEMS = [];

export function getPackageTemplate(id) {
  return PACKAGE_TEMPLATES.find((p) => p.id === id) || null;
}
