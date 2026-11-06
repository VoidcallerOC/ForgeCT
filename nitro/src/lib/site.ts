/**
 * FORGE CT business facts. Canonical values are the Nov 2026 local SEO brief:
 * name, Farmington CT 06032, phone and hours (each still awaiting owner verification),
 * and the owner-approved package prices below.
 */
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export const SITE_URL = "https://www.forge-ct.com";

export const BUSINESS = {
  name: "FORGE CT",
  founder: "Nick Sousa",
  email: "create@forge-ct.com",
  phoneDisplay: "(959) 229-0653",
  phoneTel: "tel:+19592290653",
  phoneSchema: "+1-959-229-0653",
  locality: "Farmington",
  region: "CT",
  postalCode: "06032",
  regionLong: "Connecticut",
  area: "Greater Hartford",
  hours: "Open 24 hours, 7 days a week",
  priceRange: "$750–$2,500",
  description:
    "Sites and apps for Connecticut shops and local businesses: web design, web systems and ongoing care, built by Nick Sousa in Farmington, CT.",
  /** Audit reply promise, as published on /audit and the location pages. */
  auditPromise: "three practical fixes within 24 hours",
} as const;

export const MAILTO = `mailto:${BUSINESS.email}`;

/**
 * Optional public scheduling URL (Cal.com, Google Calendar appointment schedule, etc.).
 * Leave empty until Nick publishes a real booking link. When empty, /book uses the
 * request form and must not claim a slot is held.
 */
export const SCHEDULING_URL = "";

export type PackageId = "basic" | "standard" | "premium";

/**
 * Owner-approved rate sheet, restored Nov 2026 after the higher-priced package ladder was rejected.
 * Scopes are the previously published ones. No extra-fast delivery fees or delivery promises are published.
 */
export type Package = {
  id: PackageId;
  tier: string;
  label: string;
  price: number;
  pages: number;
  revisions: number;
  performance: boolean;
  advanced: boolean;
  schemaDescription: string;
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
    schemaDescription:
      "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision.",
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
    schemaDescription:
      "Up to 5 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; speed and performance optimization; 2 revisions.",
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
    schemaDescription:
      "Up to 8 pages; custom design and development; responsive, mobile-first functional website; advanced functionality; hosting setup; social media icons; speed and performance optimization; 3 revisions. E-commerce is a separately priced add-on.",
  },
];

/** Add-ons. E-commerce has no published price: it is quoted per project. No delivery days are published. */
export const ADD_ONS: { name: string; price?: number; note: string }[] = [
  { name: "Additional page", price: 150, note: "Add one page beyond the selected package's page limit." },
  { name: "Additional revision", price: 100, note: "Add one revision beyond the package allowance." },
  {
    name: "E-commerce functionality",
    note: "A separately priced add-on, quoted per project. Product, catalog, integration, and custom-functionality scope is agreed separately.",
  },
  {
    name: "Additional product",
    price: 250,
    note: "A defined additional product build, scoped to the project. Not unlimited product uploads or simple data entry.",
  },
];

export const packagePrice = (p: Package) => usd(p.price);

/** "Basic $750, Standard $1,500, Premium $2,500" — the package line every page and FAQ uses. */
export const PACKAGE_LINE = PACKAGES.map((p) => `${p.tier} ${usd(p.price)}`).join(", ");

/** Full published price sentence, used in FAQs and location pages. */
export const PRICE_SENTENCE = `Website packages are ${PACKAGE_LINE}. E-commerce is a separately priced add-on. Care is $35/month or Care+ is $79/month.`;

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

