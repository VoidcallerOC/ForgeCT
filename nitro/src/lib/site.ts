/**
 * FORGE CT business facts. Canonical values are the Nov 2026 local SEO brief:
 * name, Farmington CT 06032, phone, hours, and the current package prices.
 */
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
  priceRange: "$2,000–$16,000",
  description:
    "Sites and apps for Connecticut shops and local businesses: web design, web systems and ongoing care, built by Nick Sousa in Farmington, CT.",
  /** Audit reply promise, as published on /audit and the location pages. */
  auditPromise: "three practical fixes within 24 hours",
} as const;

export const MAILTO = `mailto:${BUSINESS.email}`;

/** Proof line used wherever the live clients are listed. Hard Hittin has no case page. */
export const PROOF_LIST =
  "Thousand Sunny Cards and Collectibles (West Hartford) · M&J Video Games (Southington) · Hard Hittin · Infinite Heroes (Watertown)";

export const LIVE_CLIENT_LINE = "Live client sites · 4";

export const FOUR_LIVE_CLIENTS = "Four live client sites for Connecticut shops.";

export const WHY_FEATURED =
  "Three featured live client shops are open right now: Thousand Sunny, M&J Video Games and Hard Hittin. See all four on the Work page.";

/**
 * Optional public scheduling URL (Cal.com, Google Calendar appointment schedule, etc.).
 * Leave empty until Nick publishes a real booking link. When empty, /book uses the
 * request form and must not claim a slot is held.
 */
export const SCHEDULING_URL = "";

export type PackageId = "local" | "system" | "product";

export type Package = {
  id: PackageId;
  name: string;
  price: number;
  /** True when the published price is a starting price. */
  from?: boolean;
  summary: string;
};

export const PACKAGES: Package[] = [
  {
    id: "local",
    name: "Local Business Site",
    price: 2000,
    from: true,
    summary: "A site for a shop or local business.",
  },
  {
    id: "system",
    name: "Site and System",
    price: 6000,
    summary: "Booking, inventory, intake.",
  },
  {
    id: "product",
    name: "Product Site",
    price: 16000,
    summary: "A product site.",
  },
];

export const packagePrice = (p: Package) => (p.from ? `from ${usd(p.price)}` : usd(p.price));

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
