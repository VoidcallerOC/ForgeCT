import { createServer } from "node:http";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  APPROVED_CLIENT_URLS,
  EXTERNAL_SCOPE,
  FORGE_CT_SCOPE,
  PORTFOLIO_ROUTES,
  formatSummary,
  runSmoke,
} from "./smoke-production.mjs";

const server = createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const securityHeaders = {
    "content-security-policy": "default-src 'self'",
    "strict-transport-security": "max-age=63072000",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "payment=()",
  };
  if (pathname === "/down-client-site/") {
    response.writeHead(503, { "content-type": "text/plain" });
    response.end("unavailable");
    return;
  }
  if (pathname.startsWith("/api/")) {
    response.writeHead(405, {
      ...securityHeaders,
      allow: "POST",
      "content-type": "application/json",
    });
    response.end(JSON.stringify({ ok: false, error: "Method not allowed." }));
    return;
  }
  const canonical = `http://127.0.0.1:${server.address()?.port}${pathname === "/" ? "/" : pathname}`;
  response.writeHead(200, { ...securityHeaders, "content-type": "text/html" });
  response.end(
    `<!doctype html><html><head><link rel="canonical" href="${canonical}"></head><body><h1>FORGE CT</h1><p>Connecticut Web Design Hartford web design Farmington web design West Hartford web design FORGE CT live client sites Book FORGE CT Contact FORGE CT</p></body></html>`,
  );
});

before(() => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)));
after(() => new Promise((resolve) => server.close(resolve)));

test("safe smoke runner passes against a representative healthy origin", async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const result = await runSmoke({
    baseUrl,
    clientUrls: [],
    timeoutMs: 1_000,
    maxMs: 5_000,
  });
  assert.equal(result.ok, true, JSON.stringify(result.failures));
  assert.equal(result.failures.length, 0);
  assert.ok(result.checks.some((check) => check.url.endsWith("/api/contact")));
});

test("smoke results identify the exact URL and failure type", async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const result = await runSmoke({
    baseUrl,
    clientUrls: [],
    timeoutMs: 1_000,
    maxMs: 5_000,
  });
  assert.equal(
    result.failures.some(
      (failure) =>
        failure.url.endsWith("/api/contact") &&
        failure.type === "api-get-status",
    ),
    false,
  );
  assert.equal(result.safeMethod.startsWith("GET-only"), true);
});

test("portfolio routes and client URLs match the approved roster in work.ts", () => {
  const source = readFileSync(
    new URL("../nitro/src/lib/work.ts", import.meta.url),
    "utf8",
  );
  const roster = source.slice(
    source.indexOf("export const PROJECTS"),
    source.indexOf("];", source.indexOf("export const PROJECTS")),
  );
  const slugs = [...roster.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
  const sites = [...roster.matchAll(/site: "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(slugs.length, 5);
  assert.deepEqual(
    PORTFOLIO_ROUTES,
    slugs.map((slug) => `/work/${slug}`),
  );
  assert.deepEqual(APPROVED_CLIENT_URLS, sites);
});

test("external client site failures are scoped and labelled as external", async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const downUrl = `${baseUrl}/down-client-site/`;
  const result = await runSmoke({
    baseUrl,
    clientUrls: [downUrl],
    timeoutMs: 1_000,
    maxMs: 5_000,
  });
  assert.equal(result.ok, false);
  assert.equal(result.forgeCtFailures, 0);
  assert.equal(result.externalFailures, 1);
  assert.deepEqual(result.failures, [
    {
      url: downUrl,
      type: "status",
      detail: "expected 2xx or 3xx, received 503",
      scope: EXTERNAL_SCOPE,
    },
  ]);
  const summary = formatSummary(result);
  assert.match(summary, /0 FORGE CT, 1 external client site/);
  assert.match(summary, /outside FORGE CT control/);
  assert.doesNotMatch(summary, /^FORGE CT failures:/m);
  assert.notEqual(EXTERNAL_SCOPE, FORGE_CT_SCOPE);
});
