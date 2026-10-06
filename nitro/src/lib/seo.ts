import { SITE_URL } from "./site";
import { STRUCTURED_DATA } from "./structured-data";

type PageMeta = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageAlt?: string;
  robots?: string;
};

const DEFAULT_OG_ALT = "FORGE CT shop websites and systems for Greater Hartford businesses";
const CT_OG_ALT = "FORGE CT web design and development for Connecticut businesses";

/**
 * Per-route metadata, carried over from the certified site. Titles, descriptions, robots and canonicals
 * are unchanged. /audit and /contact had no meta description; theirs are new and written only from
 * claims already on those pages.
 */
export const META: Record<string, PageMeta> = {
  "/": {
    title: "FORGE CT — Websites for the businesses people drive to.",
    description:
      "Custom websites for the businesses people drive to. Forge CT builds clear, fast storefronts for local shops and businesses in Connecticut. Packages from $750.",
    ogTitle: "FORGE CT — Custom websites for the businesses people drive to.",
    ogDescription:
      "Clear, fast storefronts for local shops and businesses in Connecticut. Packages from $750; larger systems scoped separately.",
    ogImageAlt: "FORGE CT custom websites and systems for local businesses.",
  },
  "/audit": {
    title: "The Forge-CT Audit — See your shop like a customer",
    description:
      "Send your business website. FORGE CT reviews it the way a customer meets it and replies with three practical fixes within 24 hours. No pitch deck, no quote maze.",
    ogTitle: "The Forge-CT Audit — What your customers see before they walk in",
  },
  "/book": {
    title: "Book a shop website session — FORGE CT",
    description:
      "Book a working session for your Hartford-area shop website. Get a clear plan for hours, events, products, and the customer path.",
  },
  "/care": {
    title: "Business website care from $35/month — FORGE CT",
    description:
      "Keep your FORGE-built business website current after launch. Care covers hours, services, events, seasonal updates, and more for Greater Hartford businesses.",
    ogDescription:
      "Keep hours, services, events, and other key details on your FORGE-built website current with Care from $35/month.",
    ogImageAlt: "FORGE CT websites and digital systems for Greater Hartford businesses",
  },
  "/connecticut-web-design": {
    title: "Connecticut Web Design for Local Businesses | FORGE CT",
    description:
      "FORGE CT builds custom websites, ecommerce experiences, and useful web systems for local businesses across Connecticut.",
    ogImageAlt: CT_OG_ALT,
  },
  "/contact": {
    title: "Contact FORGE CT — Shop websites for Hartford",
    description:
      "Tell FORGE CT what your business needs. Reply with practical next steps for a site, app, or ongoing care plan. Farmington, Connecticut.",
  },
  "/hartford-web-design": {
    title: "Hartford web design for card and tabletop shops — FORGE CT",
    description:
      "Custom website packages for Hartford-area shops and local businesses: Basic $750, Standard $1,500, Premium $2,500. Extra-fast delivery is available for defined package scopes.",
  },
  "/pay": {
    title: "Pay FORGE CT — care plans and build deposits",
    description:
      "Start a FORGE CT Care or Care+ plan. Website package payments are arranged after project scope is confirmed.",
    ogDescription:
      "Start Care at $35/month or Care+ at $79/month. Website package payments are arranged after project scope is confirmed.",
    robots: "noindex,follow",
  },
  "/privacy": {
    title: "Privacy Notice — FORGE CT",
    description: "Privacy notice for FORGE CT.",
    robots: "noindex,follow",
  },
  "/services": {
    title: "Website packages and add-ons — FORGE CT",
    description:
      "Custom website packages for local businesses: Basic $750, Standard $1,500, and Premium $2,500. Explore extra-fast delivery and clearly scoped add-ons from FORGE CT.",
    ogDescription:
      "Basic $750, Standard $1,500, Premium $2,500. See the exact scope, extra-fast delivery options, and defined add-ons.",
    ogImageAlt: "FORGE CT custom websites and systems for local businesses",
  },
  "/thanks": {
    title: "Payment received — FORGE CT",
    description: "Payment received. FORGE CT will be in touch from the studio inbox.",
    robots: "noindex, nofollow",
  },
  "/why": {
    title: "Why Hartford shops choose FORGE CT web design",
    description:
      "See why Greater Hartford shops choose FORGE CT instead of a typical web agency: live work, clear pricing, and websites built around real visits.",
    ogTitle: "Why shops pick FORGE CT over a Hartford web agency",
    ogDescription: "Agencies send you a quote. I send you live shops. Thousand Sunny, M and J, Hard Hittin.",
  },
  "/work": {
    title: "Work — Forge CT live client projects",
    description:
      "All five approved Forge CT live client projects for card, tabletop, retail, and neighborhood businesses in Connecticut.",
    ogImageAlt: CT_OG_ALT,
  },
};

export function caseStudyMeta(p: { name: string; built: string; site?: string }): PageMeta {
  return {
    title: `${p.name} — Forge CT case study`,
    description: `${p.name}: ${p.built} See the Forge CT case study${p.site ? " and live site" : " and project details"}.`,
    ogImageAlt: CT_OG_ALT,
  };
}

/** Builds the TanStack `head()` result for a route: meta, canonical, social cards and JSON-LD. */
export function pageHead(path: string, meta: PageMeta = META[path]) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const ogTitle = meta.ogTitle ?? meta.title;
  const ogDescription = meta.ogDescription ?? meta.description;
  const image = `${SITE_URL}/images/og-image.jpg`;
  return {
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { name: "robots", content: meta.robots ?? "index,follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FORGE CT" },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "2560" },
      { property: "og:image:height", content: "1440" },
      { property: "og:image:alt", content: meta.ogImageAlt ?? DEFAULT_OG_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDescription },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: (STRUCTURED_DATA[path] ?? []).map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  };
}
