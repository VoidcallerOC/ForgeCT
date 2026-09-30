import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const budgets = [
  { pattern: /^images\/og-image\.jpg$/, maxBytes: 600 * 1024 },
  { pattern: /^images\/work\/.*\.(?:jpe?g|png)$/i, maxBytes: 300 * 1024 },
];

async function collectHtml(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", ".vercel"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtml(absolute)));
    else if (entry.isFile() && entry.name.endsWith(".html"))
      files.push(absolute);
  }
  return files;
}

const referenced = new Set();
for (const htmlFile of await collectHtml(root)) {
  const html = await readFile(htmlFile, "utf8");
  for (const [, value] of html.matchAll(
    /(?:src|href)=["'](\/images\/[^"'?#]+)/gi,
  )) {
    referenced.add(value.slice(1));
  }
}

const failures = [];
const measurements = [];
for (const relativePath of [...referenced].sort()) {
  const budget = budgets.find(({ pattern }) => pattern.test(relativePath));
  if (!budget) continue;
  const bytes = (await stat(path.join(root, relativePath))).size;
  measurements.push({
    path: relativePath,
    bytes,
    budgetBytes: budget.maxBytes,
  });
  if (bytes > budget.maxBytes) {
    failures.push(
      `${relativePath} is ${bytes} bytes; budget is ${budget.maxBytes} bytes`,
    );
  }
}

if (failures.length) {
  console.error(
    `Image budget failed:\n${failures.map((item) => `- ${item}`).join("\n")}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Image budget passed for ${measurements.length} referenced image(s).`,
  );
  for (const item of measurements) {
    console.log(`- ${item.path}: ${item.bytes} / ${item.budgetBytes} bytes`);
  }
}
