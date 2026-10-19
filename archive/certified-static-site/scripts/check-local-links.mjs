import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const htmlFiles = [];

async function collectHtmlFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", ".vercel"].includes(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectHtmlFiles(absolutePath);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(absolutePath);
    }
  }
}

function localPathFor(urlPath) {
  const pathname = decodeURIComponent(urlPath.split(/[?#]/, 1)[0]);
  if (pathname === "/") return path.join(root, "index.html");

  const withoutLeadingSlash = pathname.replace(/^\//, "");
  const directPath = path.join(root, withoutLeadingSlash);
  const extension = path.extname(withoutLeadingSlash);

  if (extension) return directPath;
  return path.join(directPath, "index.html");
}

async function exists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

await collectHtmlFiles(root);
const failures = [];
const referencePattern = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  for (const match of html.matchAll(referencePattern)) {
    const reference = match[1].trim();
    if (
      !reference ||
      reference.startsWith("#") ||
      reference.startsWith("mailto:") ||
      reference.startsWith("tel:")
    )
      continue;
    if (/^(https?:)?\/\//i.test(reference) || reference.startsWith("data:"))
      continue;
    // Skip Vercel-specific paths that only exist when deployed
    if (reference.startsWith("/_vercel/")) continue;

    const target = reference.startsWith("/")
      ? localPathFor(reference)
      : path.resolve(path.dirname(htmlFile), reference.split(/[?#]/, 1)[0]);

    if (!(await exists(target))) {
      failures.push(
        `${path.relative(root, htmlFile)} references missing local asset or route: ${reference}`,
      );
    }
  }
}

if (failures.length) {
  console.error(
    "Local link check failed:\n" +
      failures.map((failure) => `- ${failure}`).join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(`Local link check passed for ${htmlFiles.length} HTML file(s).`);
}
