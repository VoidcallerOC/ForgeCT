import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  "audit/index.html",
  "book/index.html",
  "contact/index.html",
  "hartford-web-design/index.html",
];

test("event-emitting conversion pages load Vercel Analytics", async () => {
  for (const page of pages) {
    const html = await readFile(page, "utf8");
    assert.match(
      html,
      /<script[^>]+src="\/app\.js[^>]+defer/,
      `${page} must load app.js`,
    );
    assert.match(
      html,
      /<script(?=[^>]*defer)(?=[^>]*src="https:\/\/cdn\.vercel-insights\.com\/v1\/script\.js")[^>]*>/,
      `${page} must load Vercel Analytics`,
    );
    assert.match(
      html,
      /<script(?=[^>]*defer)(?=[^>]*src="\/_vercel\/speed-insights\/script\.js")[^>]*>/,
      `${page} must load Speed Insights`,
    );
  }
});
