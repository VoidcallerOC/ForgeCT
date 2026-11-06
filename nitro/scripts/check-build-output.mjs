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
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, "../.vercel/output");
const staticDir = path.join(out, "static");
const failures = [];
const fail = (msg) => failures.push(msg);

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
      "Live sites for Connecticut shops: Thousand Sunny, M&J Video Games, Hard Hittin and Infinite Heroes. Open them and see what customers see.",
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
      "Farmington studio building sites and apps for Connecticut businesses. Live work in West Hartford, Southington and Watertown. From $2,000.",
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
const PROOF_RE = /Harris|Nino|Canton|Forge-CT|SousaSaaS|Front Window|Come By|\$60/;

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
  if (PROOF_RE.test(html)) fail(`${route}: retired proof or brand string still present`);
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
  }
  if (route === "/contact" && !html.includes("Contact FORGE CT")) fail("/contact: H1 copy missing");
  if (route === "/work") {
    const collection = h.jsonld.find((block) => block["@type"] === "CollectionPage");
    const names = (collection?.mainEntity || []).map((item) => item.name).join(" | ");
    if (names !== "Thousand Sunny Cards and Collectibles | M&J Video Games | Infinite Heroes")
      fail(`/work: mainEntity is ${names}`);
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
for (const src of ["/work/hard-hittin/?", "/work/harris-in-wonderland/?", "/work/ninos-collectibles/?"]) {
  const retired = config.routes.find((r) => r.src === src);
  if (retired?.status !== 301 || retired.headers?.Location !== "/work") fail(`config.json: ${src} → /work 301 redirect missing`);
  const folder = src.replace(/\/\?$/, "").slice(1);
  if (await exists(path.join(staticDir, folder, "index.html"))) fail(`static: retired ${src} was prerendered`);
}

for (const f of ["robots.txt", "sitemap.xml", "favicon.svg", "images/og-image.jpg"]) {
  if (!(await exists(path.join(staticDir, f)))) fail(`static: ${f} missing`);
}

if (failures.length) {
  console.error(`build output check failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`build output check passed: ${routes.length} prerendered routes, brief titles and schema, headers, redirects, local references.`);
