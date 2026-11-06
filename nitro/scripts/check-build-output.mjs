/**
 * Validates the built .vercel/output against the certified FORGE CT site.
 *
 * 1. Every sitemap URL (and /pay, /thanks, /privacy) is prerendered to static HTML.
 * 2. Each page carries title, description, canonical, robots, Open Graph and Twitter tags.
 * 3. Titles, descriptions, Open Graph, one H1, the shared ProfessionalService, and the local-SEO
 *    forbidden strings match the Nov 2026 brief. The archived certified HTML is the pre-brief baseline
 *    and is no longer the copy contract.
 * 4. The production smoke markers (scripts/smoke-production.mjs CORE_ROUTES) appear on each page.
 * 5. config.json carries the security headers and the apex → www redirect.
 * 6. Every local src/href in the HTML resolves to a built file or a prerendered page.
 * 7. Portfolio integrity: all five approved clients are prerendered (200, not redirected), in the sitemap,
 *    in the /work CollectionPage, and every visible count matches the roster. Retired Hard Hittin appears
 *    in no page, meta tag or JSON-LD; only its old URL keeps a 301 to /work.
 *
 * APPROVED_CLIENTS is the owner-approved roster. It is written out here on purpose, independent of
 * src/lib/work.ts, so a deletion in the app cannot silently pass this check.
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, "../.vercel/output");
const staticDir = path.join(out, "static");
const failures = [];
const fail = (msg) => failures.push(msg);

/** Owner-approved live client roster (canonical order). Voidcaller is a FORGE CT experiment, not a client. */
const APPROVED_CLIENTS = [
  { slug: "harris-in-wonderland", name: "Harris in Wonderland" },
  { slug: "thousand-sunny", name: "Thousand Sunny Cards and Collectibles" },
  { slug: "m-and-j-video-games", name: "M and J Video Games" },
  { slug: "infinite-heroes", name: "Infinite Heroes" },
  { slug: "ninos-collectibles", name: "Nino’s Collectibles" },
];
const COUNT = APPROVED_CLIENTS.length;
const COUNT_WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][COUNT];
const CAP_COUNT_WORD = COUNT_WORD[0].toUpperCase() + COUNT_WORD.slice(1);

/** Titles and meta descriptions from the Nov 2026 local SEO brief. */
const EXPECTED = {
  "/": {
    title: "FORGE CT — Sites and apps for Hartford shops",
    description:
      "Sites and apps for Connecticut shops and local businesses, built by Nick Sousa in Farmington, CT. Local Business Sites from $2,000. Call (959) 229-0653.",
  },
  "/services": {
    title: "Packages: sites, systems and product sites — FORGE CT",
    description:
      "Local Business Site from $2,000, Site and System $6,000, Product Site $16,000. Built by FORGE CT in Farmington, CT. Care from $35/month.",
  },
  "/care": {
    title: "Website care from $35/month — FORGE CT",
    description:
      "Care $35/month or Care+ $79/month keeps hours, events and details current on your FORGE CT site. Farmington, CT, serving Greater Hartford.",
  },
  "/why": {
    title: "Why Hartford shops choose FORGE CT for sites and apps",
    description:
      "One builder, live client shops you can open, published prices. Why Greater Hartford businesses pick FORGE CT over a typical agency.",
  },
  "/audit": {
    title: "Free website audit for CT shops — FORGE CT",
    description:
      "Send your business website. Nick Sousa replies with three practical fixes within 24 hours. Free, no pitch deck. FORGE CT, Farmington, CT.",
  },
  "/contact": {
    title: "Contact FORGE CT — Sites and apps, Farmington CT",
    description:
      "Call (959) 229-0653 or email create@forge-ct.com. FORGE CT builds sites and apps from Farmington, CT. Open 24 hours, 7 days a week.",
  },
  "/book": {
    title: "Book a working session — FORGE CT",
    description:
      "Request a working session about your shop's site or app. FORGE CT, Farmington, CT, serving Hartford, West Hartford and the Farmington Valley.",
  },
  "/work": {
    title: "Live client sites — FORGE CT work",
    description:
      "Five live client sites: Harris in Wonderland, Thousand Sunny, M and J Video Games, Infinite Heroes and Nino’s Collectibles. Open them and see what customers see.",
  },
  "/hartford-web-design": {
    title: "Hartford Web Design for Local Shops — FORGE CT",
    description:
      "Web design for Hartford shops and local businesses from one Farmington-based builder. Live client sites, Local Business Sites from $2,000.",
  },
  "/farmington-web-design": {
    title: "Farmington CT Web Design — FORGE CT",
    description:
      "Sites and apps built in Farmington, CT for Farmington Valley shops and local businesses. One builder, live client work, from $2,000.",
  },
  "/west-hartford-web-design": {
    title: "West Hartford Web Design — FORGE CT",
    description:
      "Web design for West Hartford shops, from the Farmington builder behind Thousand Sunny Cards' site. Local Business Sites from $2,000.",
  },
  "/connecticut-web-design": {
    title: "Connecticut Web Design for Local Businesses | FORGE CT",
    description:
      "Farmington studio building sites and apps for Connecticut businesses. Live work in Canton, West Hartford, Southington and Watertown. From $2,000.",
  },
  "/work/harris-in-wonderland": {
    title: "Harris in Wonderland — FORGE CT case study",
    description:
      "Harris in Wonderland: Live inventory, a feeder locker, care sheets, and a beginner chooser in one experience. See the FORGE CT case study and live site.",
  },
  "/work/ninos-collectibles": {
    title: "Nino’s Collectibles — FORGE CT case study",
    description:
      "Nino’s Collectibles: A phone-first site built from Nino’s own Instagram posts, with a show list read from his OnTreasure profile and a card scanner for people selling to him. See the FORGE CT case study and live site.",
  },
  "/work/thousand-sunny": {
    title: "Thousand Sunny Cards and Collectibles — FORGE CT case study",
    description:
      "Thousand Sunny Cards and Collectibles: A shop page with event context and custom illustration that feels like the store. See the FORGE CT case study and live site.",
  },
  "/work/m-and-j-video-games": {
    title: "M and J Video Games — FORGE CT case study",
    description:
      "M and J Video Games: A neighborhood storefront online, built for the phone check from the parking lot. See the FORGE CT case study and live site.",
  },
  "/work/infinite-heroes": {
    title: "Infinite Heroes — FORGE CT case study",
    description:
      "Infinite Heroes: A clear local shop page built around the Wednesday rhythm and the floor. See the FORGE CT case study and live site.",
  },
};

const LOCATION_PAGES = ["/hartford-web-design", "/farmington-web-design", "/west-hartford-web-design", "/connecticut-web-design"];
const PRICE_RE = /750|1,500|2,500|Basic|Standard|Premium|Extra-fast/;
/** Banned brands and retired spellings, anywhere in a built page (body, meta, JSON-LD). */
const BANNED_RE = /SousaSaaS|Front Window|Come By|Forge-CT|\$60/;
/** Retired client: must not appear as proof in any page, meta tag or structured data. */
const RETIRED_RE = /Hard[\s-]*Hittin/i;
/** Client counts that contradict the roster. */
const OTHER_WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"].filter((w) => w !== COUNT_WORD).join("|");
const WRONG_COUNT_RE = new RegExp(
  `Live client sites · (?!${COUNT}\\b)\\d+|\\b(all )?(${OTHER_WORDS}) (approved |featured )?(live )?(client|case stud)`,
  "i",
);

/** Smoke markers that must appear in the built HTML. */
const MARKERS = {
  "/": "FORGE CT",
  "/audit": "FORGE CT",
  "/services": "FORGE CT",
  "/care": "FORGE CT",
  "/contact": "Contact FORGE CT",
  "/book": "Book FORGE CT",
  "/connecticut-web-design": "Connecticut Web Design",
  "/hartford-web-design": "Hartford web design",
  "/farmington-web-design": "Farmington web design",
  "/west-hartford-web-design": "West Hartford web design",
  "/work": "FORGE CT live client sites",
};

const exists = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};
const fileFor = (route) => path.join(staticDir, route === "/" ? "index.html" : `${route.slice(1)}/index.html`);
const decode = (s) =>
  s
    ?.replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const attr = (html, re) => decode(html.match(re)?.[1]);

function headOf(html) {
  return {
    title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1]),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    robots: attr(html, /<meta name="robots" content="([^"]*)"/),
    ogTitle: attr(html, /<meta property="og:title" content="([^"]*)"/),
    ogDescription: attr(html, /<meta property="og:description" content="([^"]*)"/),
    ogImage: attr(html, /<meta property="og:image" content="([^"]*)"/),
    twitterCard: attr(html, /<meta name="twitter:card" content="([^"]*)"/),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])),
  };
}

const sitemap = await readFile(path.join(here, "../public/sitemap.xml"), "utf8");
const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/www\.forge-ct\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
const routes = [...new Set([...sitemapRoutes, "/pay", "/thanks", "/privacy"])];

const builtHtml = {};
for (const route of routes) {
  const file = fileFor(route);
  if (!(await exists(file))) {
    fail(`${route}: not prerendered (${path.relative(out, file)} missing)`);
    continue;
  }
  const html = await readFile(file, "utf8");
  builtHtml[route] = html;
  const h = headOf(html);
  for (const key of ["title", "description", "canonical", "robots", "ogTitle", "ogDescription", "ogImage", "twitterCard"]) {
    if (!h[key]) fail(`${route}: missing ${key}`);
  }
  const expectedCanonical = `https://www.forge-ct.com${route === "/" ? "/" : route}`;
  if (h.canonical !== expectedCanonical) fail(`${route}: canonical ${h.canonical} != ${expectedCanonical}`);
  if (sitemapRoutes.includes(route) && /noindex/.test(h.robots || "")) fail(`${route}: in sitemap but noindex`);
  if (MARKERS[route] && !html.includes(MARKERS[route])) fail(`${route}: smoke marker ${JSON.stringify(MARKERS[route])} missing`);
  if (h.ogTitle !== h.title) fail(`${route}: og:title does not match title`);
  if (h.ogDescription !== h.description) fail(`${route}: og:description does not match description`);
  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (h1Count !== 1) fail(`${route}: expected one h1, found ${h1Count}`);
  if (!html.includes("(959) 229-0653")) fail(`${route}: phone missing`);
  if (!html.includes("Open 24 hours, 7 days a week")) fail(`${route}: hours missing`);
  if (PRICE_RE.test(html)) fail(`${route}: old price string still present`);
  if (BANNED_RE.test(html)) fail(`${route}: banned brand string present (${html.match(BANNED_RE)[0]})`);
  if (RETIRED_RE.test(html)) fail(`${route}: retired client Hard Hittin present in page, meta or JSON-LD`);
  if (h.jsonld.some((block) => RETIRED_RE.test(JSON.stringify(block)))) fail(`${route}: Hard Hittin in JSON-LD`);
  const visibleCount = html.match(WRONG_COUNT_RE);
  if (visibleCount) fail(`${route}: client count contradicts the ${COUNT}-client roster: ${JSON.stringify(visibleCount[0])}`);
  const businesses = h.jsonld.filter((block) => block["@type"] === "ProfessionalService" || (Array.isArray(block["@type"]) && block["@type"].includes("ProfessionalService")));
  if (businesses.length !== 1) fail(`${route}: expected one ProfessionalService, found ${businesses.length}`);
  const business = businesses[0];
  if (business.name !== "FORGE CT" || business.telephone !== "+1-959-229-0653" || business.address?.postalCode !== "06032")
    fail(`${route}: ProfessionalService NAP mismatch`);
  if (business.priceRange !== "$2,000–$16,000") fail(`${route}: priceRange mismatch`);
  const expected = EXPECTED[route];
  if (expected) {
    if (h.title !== expected.title) fail(`${route}: title\n    built:    ${h.title}\n    expected: ${expected.title}`);
    if (h.description !== expected.description) fail(`${route}: description\n    built:    ${h.description}\n    expected: ${expected.description}`);
  }
  if (LOCATION_PAGES.includes(route)) {
    if (!h.jsonld.some((block) => block["@type"] === "BreadcrumbList")) fail(`${route}: missing BreadcrumbList`);
    if (!h.jsonld.some((block) => block["@type"] === "FAQPage")) fail(`${route}: missing FAQPage`);
  }
  if (route === "/audit") {
    const service = h.jsonld.find((block) => block["@type"] === "Service");
    if (service?.name !== "FORGE CT Audit" || service?.provider?.["@id"] !== "https://www.forge-ct.com/#business")
      fail("/audit: Service schema must be named FORGE CT Audit and reference #business");
  }
  if (route === "/") {
    if (!html.includes("Sites and apps for Hartford shops.")) fail("/: H1 copy missing");
    if (!html.includes("Custom websites for the businesses people drive to, built in Farmington, CT.")) fail("/: subhead missing");
    if (!html.includes(`Live client sites · ${COUNT}`)) fail(`/: "Live client sites · ${COUNT}" missing`);
    if (!html.includes(`${CAP_COUNT_WORD} live client sites`)) fail(`/: "${CAP_COUNT_WORD} live client sites" missing`);
    for (const c of APPROVED_CLIENTS) if (!decode(html).includes(c.name)) fail(`/: approved client ${c.name} missing`);
    if (html.includes("Websites for the businesses people drive to.</h2>")) fail("/: old footer tagline still present");
  }
  if (route === "/contact" && !html.includes("Contact FORGE CT")) fail("/contact: H1 copy missing");
  if (route === "/work") {
    const collection = h.jsonld.find((block) => block["@type"] === "CollectionPage");
    const names = (collection?.mainEntity || []).map((item) => item.name).join(" | ");
    const expectedNames = APPROVED_CLIENTS.map((c) => c.name).join(" | ");
    if (names !== expectedNames) fail(`/work: mainEntity is ${names}, expected ${expectedNames}`);
    if (collection?.numberOfItems !== COUNT) fail(`/work: numberOfItems ${collection?.numberOfItems} != ${COUNT}`);
    if (!html.includes(`${CAP_COUNT_WORD} live client sites`)) fail(`/work: "${CAP_COUNT_WORD} live client sites" missing`);
    const rows = (html.match(/<table class="ledger"[\s\S]*?<\/table>/)?.[0].match(/<tr\b[^>]*>\s*<td class="thumb"/g) || []).length;
    if (rows !== COUNT) fail(`/work: ledger has ${rows} client rows, expected ${COUNT}`);
    for (const c of APPROVED_CLIENTS) {
      if (!decode(html).includes(c.name)) fail(`/work: approved client ${c.name} missing`);
      if (!html.includes(`href="/work/${c.slug}"`)) fail(`/work: no link to /work/${c.slug}`);
    }
  }
}

// Local references resolve.
for (const [route, html] of Object.entries(builtHtml)) {
  for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) {
    const ref = m[1];
    if (ref.startsWith("/_vercel/") || ref.startsWith("/api/")) continue;
    const candidates = [path.join(staticDir, ref), path.join(staticDir, ref, "index.html")];
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) fail(`${route}: broken local reference ${ref}`);
  }
}

// Platform config.
const config = JSON.parse(await readFile(path.join(out, "config.json"), "utf8"));
const headerRoute = config.routes.find((r) => r.headers?.["Content-Security-Policy"]);
if (!headerRoute?.continue) fail("config.json: security header route missing or not `continue: true`");
for (const h of ["Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
  if (!headerRoute?.headers?.[h]) fail(`config.json: missing ${h}`);
}
const apex = config.routes.find((r) => r.has?.some((c) => c.type === "host" && c.value === "forge-ct.com"));
if (apex?.status !== 308 || !apex.headers?.Location?.startsWith("https://www.forge-ct.com/")) fail("config.json: apex → www 308 redirect missing");
// Retired Hard Hittin: old URL keeps its 301 to /work and is never prerendered.
const retired = config.routes.find((r) => r.src === "/work/hard-hittin/?");
if (retired?.status !== 301 || retired.headers?.Location !== "/work") fail("config.json: /work/hard-hittin → /work 301 redirect missing");
if (await exists(path.join(staticDir, "work/hard-hittin/index.html"))) fail("static: retired /work/hard-hittin was prerendered");
if (sitemapRoutes.some((r) => RETIRED_RE.test(r))) fail("sitemap: retired /work/hard-hittin listed");

// Approved clients: indexable case study, in the sitemap, never redirected.
for (const c of APPROVED_CLIENTS) {
  const route = `/work/${c.slug}`;
  if (!sitemapRoutes.includes(route)) fail(`sitemap: approved case study ${route} missing`);
  if (!builtHtml[route]) fail(`static: approved case study ${route} not prerendered`);
  const matches = (src) => {
    try {
      return new RegExp(`^${src}$`).test(route);
    } catch {
      return false;
    }
  };
  const redirect = config.routes.find((r) => !r.has && r.status >= 300 && r.status < 400 && matches(r.src));
  if (redirect) fail(`config.json: approved case study ${route} is redirected (${redirect.status} → ${redirect.headers?.Location})`);
  const html = builtHtml[route] || "";
  if (!decode(html).includes(`<h1`) || !decode(html).includes(c.name)) fail(`${route}: H1 or client name missing`);
}
const caseRoutes = sitemapRoutes.filter((r) => r.startsWith("/work/"));
if (caseRoutes.length !== COUNT) fail(`sitemap: ${caseRoutes.length} case studies, expected ${COUNT}`);

for (const f of ["robots.txt", "sitemap.xml", "favicon.svg", "images/og-image.jpg"]) {
  if (!(await exists(path.join(staticDir, f)))) fail(`static: ${f} missing`);
}

if (failures.length) {
  console.error(`build output check failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`build output check passed: ${routes.length} prerendered routes, brief titles and schema, headers, redirects, local references.`);
