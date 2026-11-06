import { SITE_URL } from "./site";
import { CLIENT_SHORT_NAMES, LIVE_CLIENTS_LEAD, TOWN_PROJECTS, joinNames } from "./work";
import { STRUCTURED_DATA } from "./structured-data";

type PageMeta = {
  title: string;
  description: string;
  ogImageAlt?: string;
  robots?: string;
};

const DEFAULT_OG_ALT = "FORGE CT shop websites and systems for Greater Hartford businesses";
const CT_OG_ALT = "FORGE CT web design and development for Connecticut businesses";

/**
 * Per-route metadata. og:title and og:description are the title and description.
 * "Web Design" appears in titles only on the location pages.
 */
export const META: Record<string, PageMeta> = {
  "/": {
    title: "FORGE CT — Sites and apps for Hartford shops",
    description:
      "Sites and apps for Connecticut shops and local businesses, built by Nick Sousa in Farmington, CT. Local Business Sites from $2,000. Call (959) 229-0653.",
  },
  "/audit": {
    title: "Free website audit for CT shops — FORGE CT",
    description:
      "Send your business website. Nick Sousa replies with three practical fixes within 24 hours. Free, no pitch deck. FORGE CT, Farmington, CT.",
  },
  "/book": {
    title: "Book a working session — FORGE CT",
    description:
      "Request a working session about your shop's site or app. FORGE CT, Farmington, CT, serving Hartford, West Hartford and the Farmington Valley.",
  },
  "/care": {
    title: "Website care from $35/month — FORGE CT",
    description:
      "Care $35/month or Care+ $79/month keeps hours, events and details current on your FORGE CT site. Farmington, CT, serving Greater Hartford.",
  },
  "/connecticut-web-design": {
    title: "Connecticut Web Design for Local Businesses | FORGE CT",
    description:
      `Farmington studio building sites and apps for Connecticut businesses. Live work in ${joinNames(TOWN_PROJECTS.map((p) => p.town!))}. From $2,000.`,
    ogImageAlt: CT_OG_ALT,
  },
  "/contact": {
    title: "Contact FORGE CT — Sites and apps, Farmington CT",
    description:
      "Call (959) 229-0653 or email create@forge-ct.com. FORGE CT builds sites and apps from Farmington, CT. Open 24 hours, 7 days a week.",
  },
  "/farmington-web-design": {
    title: "Farmington CT Web Design — FORGE CT",
    description:
      "Sites and apps built in Farmington, CT for Farmington Valley shops and local businesses. One builder, live client work, from $2,000.",
  },
  "/hartford-web-design": {
    title: "Hartford Web Design for Local Shops — FORGE CT",
    description:
      "Web design for Hartford shops and local businesses from one Farmington-based builder. Live client sites, Local Business Sites from $2,000.",
  },
  "/pay": {
    title: "Pay FORGE CT — Care plans and build invoices",
    description:
      "Start a FORGE CT Care or Care+ plan. Website package payments are arranged after project scope is confirmed.",
    robots: "noindex,follow",
  },
  "/privacy": {
    title: "Privacy Notice — FORGE CT",
    description: "Privacy notice for FORGE CT.",
    robots: "noindex,follow",
  },
  "/services": {
    title: "Packages: sites, systems and product sites — FORGE CT",
    description:
      "Local Business Site from $2,000, Site and System $6,000, Product Site $16,000. Built by FORGE CT in Farmington, CT. Care from $35/month.",
  },
  "/thanks": {
    title: "Payment received — FORGE CT",
    description: "Payment received. FORGE CT will be in touch from the studio inbox.",
    robots: "noindex, nofollow",
  },
  "/west-hartford-web-design": {
    title: "West Hartford Web Design — FORGE CT",
    description:
      "Web design for West Hartford shops, from the Farmington builder behind Thousand Sunny Cards' site. Local Business Sites from $2,000.",
  },
  "/why": {
    title: "Why Hartford shops choose FORGE CT for sites and apps",
    description:
      "One builder, live client shops you can open, published prices. Why Greater Hartford businesses pick FORGE CT over a typical agency.",
  },
  "/work": {
    title: "Live client sites — FORGE CT work",
    description:
      `${LIVE_CLIENTS_LEAD}: ${CLIENT_SHORT_NAMES}. Open them and see what customers see.`,
    ogImageAlt: CT_OG_ALT,
  },
};

export function caseStudyMeta(p: { name: string; built: string; site?: string }): PageMeta {
  return {
    title: `${p.name} — FORGE CT case study`,
    description: `${p.name}: ${p.built} See the FORGE CT case study${p.site ? " and live site" : " and project details"}.`,
    ogImageAlt: CT_OG_ALT,
  };
}

/** Builds the TanStack `head()` result for a route: meta, canonical, social cards and page JSON-LD. */
export function pageHead(path: string, meta: PageMeta = META[path], jsonLd: unknown[] = STRUCTURED_DATA[path] ?? []) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const image = `${SITE_URL}/images/og-image.jpg`;
  return {
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { name: "robots", content: meta.robots ?? "index,follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FORGE CT" },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: meta.ogImageAlt ?? DEFAULT_OG_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: meta.title },
      { name: "twitter:description", content: meta.description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: meta.ogImageAlt ?? DEFAULT_OG_ALT },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd.map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  };
}
