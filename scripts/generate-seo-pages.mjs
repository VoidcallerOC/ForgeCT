import fs from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const projects = [
  {
    slug: "thousand-sunny",
    name: "Thousand Sunny Cards and Collectibles",
    short: "Thousand Sunny",
    category: "Card and tabletop shop",
    place: "West Hartford",
    image: "/images/work/thousandsunny.jpg",
    site: "https://www.thousandsunnytcg.com/",
    siteLabel: "thousandsunnytcg.com",
    desc: "A shop page with event context and custom illustration that feels like the store.",
    built:
      "A shop page with event context and custom illustration that feels like the store.",
    need: "Turn a search into a visit with hours, events, and a clear path to the floor.",
    tags: ["Shop page", "Events", "Custom illustration", "Care plan"],
  },
  {
    slug: "hard-hittin",
    name: "Hard Hittin Card Shop",
    short: "Hard Hittin",
    category: "Card shop",
    place: "Connecticut",
    image: "/images/work/hardhittin.jpg",
    site: "https://hardhittincardshop.com/",
    siteLabel: "hardhittincardshop.com",
    desc: "A launch page with the same direct energy as the counter.",
    built: "A launch page with the same direct energy as the counter.",
    need: "Give sports cards, graded slabs, breaks, and hobby boxes one clear home.",
    tags: ["Shop page", "Breaks", "Slabs", "Launch"],
  },
  {
    slug: "harris-in-wonderland",
    name: "Harris in Wonderland",
    short: "Harris in Wonderland",
    category: "Retail and local business",
    place: "Canton",
    image: "/images/work/harrisinwonderland.jpg",
    desc: "Live inventory, a feeder locker, care sheets, and a beginner chooser in one experience.",
    built:
      "Live inventory, a feeder locker, care sheets, and a beginner chooser in one experience.",
    need: "Help customers understand the animals, care, and inventory beyond the storefront.",
    tags: ["Live inventory", "Square", "Care sheets", "Care plan"],
  },
  {
    slug: "m-and-j-video-games",
    name: "M and J Video Games",
    short: "M and J Video Games",
    category: "Neighborhood video-game shop",
    place: "Southington",
    image: "/images/work/mjvideogames.jpg",
    site: "https://mjvideogames.com/",
    siteLabel: "mjvideogames.com",
    desc: "A neighborhood storefront online, built for the phone check from the parking lot.",
    built:
      "A neighborhood storefront online, built for the phone check from the parking lot.",
    need: "Make trade-ins, services, and a real walk-in path easy to find.",
    tags: ["Shop page", "Trade-ins", "Directions"],
  },
];

const head = (title, description, canonical, jsonld) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#0e0f12" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://www.forge-ct.com${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="FORGE CT" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="https://www.forge-ct.com${canonical}" />
    <meta property="og:image" content="https://www.forge-ct.com/images/og-image.jpg" />
    <meta property="og:image:alt" content="FORGE CT web design and development for Connecticut businesses" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://www.forge-ct.com/images/og-image.jpg" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap" />
    <link rel="stylesheet" href="/styles.css?v=20260910b" />
    <link rel="stylesheet" href="/brand.css?v=20260910b" />
    <link rel="stylesheet" href="/seo-pages.css?v=20260916a" />
    <title>${title}</title>
    <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  </head>`;
const shell = (content) =>
  `<body><a class="skip-link" href="#main-content">Skip to content</a><header class="site-header"><div class="shell nav-wrap"><a class="brand" href="/" aria-label="FORGE CT home">FORGE <span>CT</span></a><nav class="primary-nav" aria-label="Primary navigation"><a href="/work">Work</a><a href="/services">Services</a><a href="/connecticut-web-design">Connecticut</a><a href="/hartford-web-design">Hartford</a><a href="/contact">Contact</a></nav><a class="button button--small" href="/book">Start a project <span class="glyph glyph--inline" aria-hidden="true">↗︎</span></a></div></header>${content}<footer class="site-footer"><div class="shell footer-wrap"><div><a class="brand brand--footer" href="/" aria-label="FORGE CT home">FORGE <span>CT</span></a><p>Sites and apps for real shops. Built like storefronts.</p></div><div class="footer-links"><a href="/work">Work</a><a href="/services">Services</a><a href="/care">Care</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div></div><div class="shell footer-bottom"><p>© <span data-current-year>2026</span> FORGE CT. All rights reserved.</p><p>Farmington, Connecticut</p></div></footer></body></html>`;

const workCards = projects
  .map(
    (p) =>
      `<article class="seo-card"><a href="/work/${p.slug}"><img src="${p.image}" alt="${p.name} website shown on a mobile phone" width="720" height="1429" loading="lazy" /><div><p class="work-meta"><span>${p.category}</span><span aria-hidden="true">·</span><span>${p.place}</span></p><h2>${p.name}</h2><p>${p.desc}</p><span class="text-link">Read the case study <span class="glyph glyph--inline" aria-hidden="true">→</span></span></div></a></article>`,
  )
  .join("");
const workJson = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://www.forge-ct.com/work#webpage",
  url: "https://www.forge-ct.com/work",
  name: "Forge CT Work",
  description: "Selected Forge CT projects for local shops and businesses.",
  isPartOf: { "@id": "https://www.forge-ct.com/#business" },
  mainEntity: projects.map((p) => ({
    "@type": "CreativeWork",
    name: p.name,
    url: `https://www.forge-ct.com/work/${p.slug}`,
  })),
};
const work = `${head("Work — Forge CT portfolio", "Selected Forge CT work for card, tabletop, retail, and neighborhood businesses in Connecticut.", "/work", workJson)}${shell(`<main id="main-content" class="seo-main"><section class="seo-hero"><div class="shell"><p class="eyebrow">Selected work · Connecticut</p><h1>Real businesses. Real reasons to build.</h1><p class="seo-lede">These projects are actual Forge CT work for shops and local businesses. Each page describes the need, the build, and the project details using information documented in the Forge portfolio.</p><div class="seo-actions"><a class="button" href="/contact">Talk about your project <span class="glyph glyph--inline" aria-hidden="true">↗︎</span></a><a class="text-link" href="/services">See services <span class="glyph glyph--inline" aria-hidden="true">→</span></a></div></div></section><section class="section section--cream" aria-labelledby="projects-title"><div class="shell"><div class="section-heading section-heading--wide"><p class="eyebrow">Forge CT portfolio</p><h2 id="projects-title">Built for the way people find a place.</h2><p>From a phone in the parking lot to a deeper inventory experience, these pages give each business a useful place to be found and understood.</p></div><div class="seo-card-grid">${workCards}</div></div></section><section class="section section--paper"><div class="shell seo-links"><p class="eyebrow">Next steps</p><a href="/connecticut-web-design">Connecticut web design for local businesses</a><a href="/services">See Forge CT services</a><a href="/contact">Contact Forge CT</a><a href="/book">Book a project conversation</a></div></section></main>`)}`;
fs.writeFileSync(`${root}work/index.html`, work);

for (const p of projects) {
  const canonical = `/work/${p.slug}`;
  const title = `${p.name} — Forge CT case study`;
  const description = `${p.name}: ${p.desc} See the Forge CT case study${p.site ? " and live site" : " and project details"}.`;
  const json = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `https://www.forge-ct.com${canonical}#case-study`,
    url: `https://www.forge-ct.com${canonical}`,
    name: p.name,
    description,
    image: `https://www.forge-ct.com${p.image}`,
    creator: {
      "@type": "Organization",
      name: "FORGE CT",
      url: "https://www.forge-ct.com/",
    },
  };
  const content = `<main id="main-content" class="seo-main"><section class="case-hero"><div class="shell"><p class="eyebrow">Forge CT case study · ${p.category}</p><h1>${p.name}</h1><p class="case-deck">${p.desc}</p><div class="case-meta"><span>${p.place}</span><span aria-hidden="true">·</span><span>Forge CT project</span></div></div></section><section class="section section--cream"><div class="shell case-layout"><div><img class="case-image" src="${p.image}" alt="${p.name} website shown on a mobile phone" width="720" height="1429" /><div class="case-copy"><h2>A clearer place for the business to be found.</h2><h3>The need</h3><p>${p.need}</p><h3>What Forge CT built</h3><p>${p.built}</p><h3>Project context</h3><p>This case study records the project information currently documented in the Forge CT portfolio. It does not add performance claims or outcomes that are not documented.</p></div></div><aside class="case-aside"><p class="eyebrow">Project notes</p><h2>${p.short}</h2><ul>${p.tags.map((t) => `<li>${t}</li>`).join("")}</ul><div class="case-cta">${p.site ? `<a class="button button--small" href="${p.site}" target="_blank" rel="noopener noreferrer">Visit ${p.siteLabel} <span class="glyph glyph--inline" aria-hidden="true">↗︎</span></a>` : ""}<a class="text-link" href="/work">Back to all work</a></div></aside></div></section><section class="section section--paper"><div class="shell seo-links"><p class="eyebrow">Continue with Forge CT</p><a href="/services">See web design and development services</a><a href="/connecticut-web-design">Connecticut web design for local businesses</a><a href="/contact">Contact Forge CT</a><a href="/book">Book a project conversation</a></div></section></main>`;
  fs.writeFileSync(
    `${root}work/${p.slug}/index.html`,
    `${head(title, description, canonical, json)}${shell(content)}`,
  );
}
console.log(`Generated ${projects.length + 1} SEO routes.`);
