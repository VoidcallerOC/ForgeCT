import fs from "node:fs";

const routes = [
  "connecticut-web-design",
  "work",
  "work/thousand-sunny",
  "work/hard-hittin",
  "work/harris-in-wonderland",
  "work/m-and-j-video-games",
];
const required = [
  "<title>",
  'name="description"',
  'rel="canonical"',
  'property="og:title"',
  'name="twitter:card"',
  "application/ld+json",
];
const failures = [];
for (const route of routes) {
  const file = `${route}/index.html`;
  const html = fs.readFileSync(file, "utf8");
  for (const marker of required) {
    if (!html.includes(marker)) failures.push(`${file} missing ${marker}`);
  }
  for (const match of html.matchAll(/(?:src|href)="(\/images\/[^"?#]+)/g)) {
    if (!fs.existsSync(`.${match[1]}`))
      failures.push(`${file} missing image ${match[1]}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const sitemapRoutes = [
  "/",
  "/why",
  "/services",
  "/care",
  "/hartford-web-design",
  "/contact",
  "/book",
  "/connecticut-web-design",
  "/work",
  "/work/thousand-sunny",
  "/work/hard-hittin",
  "/work/harris-in-wonderland",
  "/work/m-and-j-video-games",
];
for (const route of sitemapRoutes) {
  if (!sitemap.includes(`https://www.forge-ct.com${route}`)) {
    throw new Error(`missing sitemap route ${route}`);
  }
}
if (
  !fs
    .readFileSync("robots.txt", "utf8")
    .includes("https://www.forge-ct.com/sitemap.xml")
) {
  throw new Error("robots sitemap mismatch");
}
console.log(
  `SEO metadata and image existence checks passed for ${routes.length} routes.`,
);
console.log(
  `Sitemap and robots checks passed for ${sitemapRoutes.length} URLs.`,
);
