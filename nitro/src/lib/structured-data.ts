import { BUSINESS, PACKAGES } from "./site";
import { LIVE_CLIENTS_LEAD, PROJECTS, joinNames } from "./work";

/**
 * One ProfessionalService block for the layout. Page files add FAQ, breadcrumb,
 * CollectionPage and CreativeWork blocks. Do not repeat ProfessionalService per page.
 */
export const BUSINESS_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://www.forge-ct.com/#business",
  name: "FORGE CT",
  url: "https://www.forge-ct.com/",
  logo: "https://www.forge-ct.com/images/og-image.jpg",
  image: "https://www.forge-ct.com/images/og-image.jpg",
  description:
    "Sites and apps for Connecticut shops and local businesses: web design, web systems and ongoing care, built by Nick Sousa in Farmington, CT.",
  email: "create@forge-ct.com",
  founder: { "@type": "Person", name: "Nick Sousa" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Farmington",
    addressRegion: "CT",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "Farmington, CT" },
    { "@type": "City", name: "Hartford, CT" },
    { "@type": "City", name: "West Hartford, CT" },
    { "@type": "AdministrativeArea", name: "Hartford County, CT" },
    { "@type": "State", name: "Connecticut" },
  ],
  priceRange: BUSINESS.priceRange,
  makesOffer: [
    ...PACKAGES.map((p) => ({
      "@type": "Offer",
      name: `${p.tier} — ${p.label}`,
      url: "https://www.forge-ct.com/services",
      price: String(p.price),
      priceCurrency: "USD",
      itemOffered: { "@type": "Service", name: `${p.tier} — ${p.label}`, description: p.schemaDescription },
    })),
    {
      "@type": "Offer",
      name: "Care",
      url: "https://www.forge-ct.com/care",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "35", priceCurrency: "USD", unitText: "MONTH" },
    },
    {
      "@type": "Offer",
      name: "Care+",
      url: "https://www.forge-ct.com/care",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "79", priceCurrency: "USD", unitText: "MONTH" },
    },
  ],
};

export type FaqItem = { q: string; a: string };

export function faqPageLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Home › page. */
export function breadcrumbLd(pageName: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.forge-ct.com/" },
      { "@type": "ListItem", position: 2, name: pageName, item: `https://www.forge-ct.com${path}` },
    ],
  };
}

const CASE_STUDIES = Object.fromEntries(
  PROJECTS.map((p) => [
    `/work/${p.slug}`,
    [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `https://www.forge-ct.com/work/${p.slug}#case-study`,
        url: `https://www.forge-ct.com/work/${p.slug}`,
        name: p.name,
        description: `${p.name}: ${p.built} See the FORGE CT case study${p.site ? " and live site" : " and project details"}.`,
        image: `https://www.forge-ct.com${p.image}`,
        creator: { "@type": "Organization", name: "FORGE CT", url: "https://www.forge-ct.com/" },
      },
    ],
  ]),
);

/** Page JSON-LD that is not the shared business entity. Location-page FAQ and breadcrumbs are passed from those routes. */
export const STRUCTURED_DATA: Record<string, unknown[]> = {
  "/audit": [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "FORGE CT Audit",
      serviceType: "Website audit for local businesses",
      provider: { "@id": "https://www.forge-ct.com/#business" },
      description:
        "A free review of a local business website: what a customer sees before they walk in, what is getting lost, and three practical fixes within 24 hours.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
  "/work": [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://www.forge-ct.com/work#webpage",
      url: "https://www.forge-ct.com/work",
      name: "FORGE CT live client sites",
      description: `${LIVE_CLIENTS_LEAD}: ${joinNames(PROJECTS.map((p) => p.name))}.`,
      isPartOf: { "@id": "https://www.forge-ct.com/#business" },
      numberOfItems: PROJECTS.length,
      mainEntity: PROJECTS.map((p) => ({
        "@type": "CreativeWork",
        name: p.name,
        url: `https://www.forge-ct.com/work/${p.slug}`,
      })),
    },
  ],
  ...CASE_STUDIES,
};
