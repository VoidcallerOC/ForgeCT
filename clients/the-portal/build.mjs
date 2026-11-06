// The Portal — Forge-CT prospect demo build.
// Assembles src/pages/*.html with shared partials into dist/, copies public/,
// and writes sitemap.xml + robots.txt. Zero dependencies.
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "dist");
const SITE = "https://www.theportalct.com";
// Demo previews must never be indexed. Flip to false only when the owner approves launch.
const DEMO = process.env.PORTAL_LAUNCH !== "1";

const partial = (name) =>
  readFileSync(join(root, "src/partials", `${name}.html`), "utf8");
const header = partial("header");
const footer = partial("footer");
const head = partial("head");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, "public"), out, { recursive: true });

const pages = readdirSync(join(root, "src/pages")).filter((f) =>
  f.endsWith(".html"),
);
const urls = [];

for (const file of pages) {
  const raw = readFileSync(join(root, "src/pages", file), "utf8");
  const meta = JSON.parse(raw.match(/<!--meta([\s\S]*?)-->/)[1]);
  const body = raw.replace(/<!--meta[\s\S]*?-->\s*/, "");
  const slug = file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`;
  if (file !== "404.html") urls.push(slug);

  const nav = header.replace(
    new RegExp(`(data-nav="${meta.nav ?? "none"}")`, "g"),
    '$1 aria-current="page"',
  );
  const html = head
    .replaceAll("{{title}}", meta.title)
    .replaceAll("{{description}}", meta.description)
    .replaceAll("{{canonical}}", SITE + slug)
    .replaceAll("{{robots}}", DEMO ? "noindex, nofollow" : "index, follow")
    .replaceAll("{{bodyClass}}", meta.bodyClass ?? "")
    .replace("{{header}}", nav)
    .replace("{{main}}", body)
    .replace("{{footer}}", footer);

  writeFileSync(join(out, file), html);
}

writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
);
writeFileSync(
  join(out, "robots.txt"),
  DEMO
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(
  `Built ${pages.length} pages → dist/ (${DEMO ? "DEMO: noindex" : "LAUNCH: indexable"})`,
);
