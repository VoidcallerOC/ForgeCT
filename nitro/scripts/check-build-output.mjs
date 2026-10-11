/**
 * Validates the built .vercel/output against the certified FORGE CT site.
 *
 * 1. Every sitemap URL (and /pay, /thanks, /privacy) is prerendered to static HTML.
 * 2. Each page carries title, description, canonical, robots, Open Graph and Twitter tags.
 * 3. SEO parity with the certified HTML in the repo root (while it exists): title, description,
 *    canonical, robots, og:title / og:description, and JSON-LD must match. Documented exceptions only.
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
const certifiedRoot = path.join(here, "../..");
const failures = [];
const fail = (msg) => failures.push(msg);

/** Pages where the certified HTML had no meta description; this build adds one. */
const NEW_DESCRIPTIONS = new Set(["/audit", "/contact"]);
/**
 * Pages whose description and JSON-LD intentionally differ from the certified page. Harris in Wonderland is
 * live (owner confirmed, 2026-10-01), so its case study now says "and live site" like the other four clients.
 */
const CHANGED_SEO = new Set(["/work/harris-in-wonderland"]);
/** Pages where the certified robots tag was absent (= index,follow); this build states it. */
const ROBOTS_DEFAULT = "index,follow";
/** Certified smoke markers (scripts/smoke-production.mjs). */
const MARKERS = {
  "/": "FORGE CT",
  "/audit": "FORGE CT",
  "/services": "FORGE CT",
  "/care": "FORGE CT",
  "/contact": "Contact FORGE CT",
  "/book": "Book FORGE CT",
  "/connecticut-web-design": "Connecticut Web Design",
  "/hartford-web-design": "Hartford web design",
  "/work": "Forge CT portfolio",
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
/** Prerendered but noindex and kept out of the sitemap until the client approves (in-progress case studies). */
const UNLISTED = ["/work/ninos-collectibles"];
const routes = [...new Set([...sitemapRoutes, "/pay", "/thanks", "/privacy", ...UNLISTED])];

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

  const certifiedFile = path.join(certifiedRoot, route === "/" ? "index.html" : `${route.slice(1)}/index.html`);
  if (await exists(certifiedFile)) {
    const certifiedHtml = await readFile(certifiedFile, "utf8");
    const c = headOf(certifiedHtml);
    if (certifiedHtml.includes('src="/schema.js"')) {
      c.jsonld.push(JSON.parse(await readFile(path.join(certifiedRoot, "schema/services.json"), "utf8")));
    }
    if (h.title !== c.title) fail(`${route}: title drift\n    built:     ${h.title}\n    certified: ${c.title}`);
    if (CHANGED_SEO.has(route)) {
      if (!h.description) fail(`${route}: missing description`);
    } else if (c.description ? h.description !== c.description : !NEW_DESCRIPTIONS.has(route))
      fail(`${route}: description drift\n    built:     ${h.description}\n    certified: ${c.description}`);
    if (h.canonical !== c.canonical) fail(`${route}: canonical drift (${h.canonical} vs ${c.canonical})`);
    if (h.robots.replace(/\s/g, "") !== (c.robots || ROBOTS_DEFAULT).replace(/\s/g, ""))
      fail(`${route}: robots drift (${h.robots} vs ${c.robots})`);
    if (c.ogTitle && h.ogTitle !== c.ogTitle) fail(`${route}: og:title drift`);
    if (c.ogDescription && h.ogDescription !== c.ogDescription && !CHANGED_SEO.has(route)) fail(`${route}: og:description drift`);
    if (!CHANGED_SEO.has(route) && JSON.stringify(h.jsonld) !== JSON.stringify(c.jsonld))
      fail(`${route}: JSON-LD differs from certified page`);
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

for (const f of ["robots.txt", "sitemap.xml", "favicon.svg", "images/og-image.jpg"]) {
  if (!(await exists(path.join(staticDir, f)))) fail(`static: ${f} missing`);
}

if (failures.length) {
  console.error(`build output check failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`build output check passed: ${routes.length} prerendered routes, SEO parity with the certified site, headers, redirect, local references.`);
