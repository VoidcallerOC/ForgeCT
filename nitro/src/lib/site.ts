/**
 * FORGE CT business facts. Every value here is copied from the certified production site
 * (www.forge-ct.com, main @ f7ec08a). Do not add a fact that is not published there:
 * no years in business, no client counts beyond the approved five, no outcomes or metrics.
 */
export const SITE_URL = "https://www.forge-ct.com";

export const BUSINESS = {
  name: "FORGE CT",
  founder: "Nick Sousa",
  email: "create@forge-ct.com",
  locality: "Farmington",
  regionLong: "Connecticut",
  area: "Greater Hartford",
} as const;

export const MAILTO = `mailto:${BUSINESS.email}`;

export type PackageId = "basic" | "standard" | "premium";

export type Package = {
  id: PackageId;
  tier: string;
  label: string;
  price: number;
  pages: number;
  revisions: number;
  performance: boolean;
  advanced: boolean;
  rush: { fee: number; days: number };
};

export const PACKAGES: Package[] = [
  {
    id: "basic",
    tier: "Basic",
    label: "Starter Website",
    price: 750,
    pages: 3,
    revisions: 1,
    performance: false,
    advanced: false,
    rush: { fee: 250, days: 1 },
  },
  {
    id: "standard",
    tier: "Standard",
    label: "Business Website",
    price: 1500,
    pages: 5,
    revisions: 2,
    performance: true,
    advanced: false,
    rush: { fee: 500, days: 3 },
  },
  {
    id: "premium",
    tier: "Premium",
    label: "Forge Website",
    price: 2500,
    pages: 8,
    revisions: 3,
    performance: true,
    advanced: true,
    rush: { fee: 750, days: 5 },
  },
];

export const ADD_ONS = [
  { name: "Additional page", price: 150, days: 1, note: "Add one page beyond the selected package's page limit." },
  { name: "Additional revision", price: 100, days: 1, note: "Add one revision beyond the package allowance." },
  {
    name: "E-commerce functionality",
    price: 750,
    days: 5,
    note: "Add e-commerce functionality to an otherwise applicable package. Product, catalog, integration, and custom-functionality scope is agreed separately.",
  },
  {
    name: "Additional product",
    price: 250,
    days: 2,
    note: "A defined additional product build, scoped to the project. Not unlimited product uploads or simple data entry.",
  },
] as const;

export const CARE = {
  care: {
    name: "Care",
    price: 35,
    points: [
      "Your hours and holiday notes stay right.",
      "Updates for services, events, seasonal offers, and other key details when you send them.",
      "The page stays up. You still own it.",
      "Cancel anytime. No retainer trap.",
      "First month free after any build.",
      "Changes within 2 business days.",
    ],
  },
  carePlus: {
    name: "Care+",
    price: 79,
    points: [
      "Everything in Care.",
      "One extra block or small page change a month.",
      "Same or next business day.",
      "For businesses whose services, hours, or offerings change often.",
    ],
  },
} as const;

/** Public Stripe-hosted destinations (not secrets). Mirrors PAYMENT_LINKS in the certified payments.js. */
export const PAYMENT_LINKS = {
  care: "https://buy.stripe.com/4gMbJ30Cc07sd525Mt5EY06",
  carePlus: "https://buy.stripe.com/4gM9AV84Ef2m4yw3El5EY07",
  portal: "https://billing.stripe.com/p/login/14A00l1Gg2fAaWUcaR5EY00",
} as const;

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
