import process from "node:process";
import { fileURLToPath } from "node:url";

export const CORE_ROUTES = [
  { path: "/", marker: "FORGE CT" },
  { path: "/audit", marker: "FORGE CT" },
  { path: "/services", marker: "FORGE CT" },
  { path: "/care", marker: "FORGE CT" },
  { path: "/contact", marker: "Contact FORGE CT" },
  { path: "/book", marker: "Book FORGE CT" },
  { path: "/connecticut-web-design", marker: "Connecticut Web Design" },
  { path: "/hartford-web-design", marker: "Hartford web design" },
  { path: "/work", marker: "Forge CT portfolio" },
];

export const API_GET_ROUTES = [
  { path: "/api/contact", allowedMethods: ["POST"] },
  { path: "/api/checkout", allowedMethods: ["POST"] },
  { path: "/api/portal", allowedMethods: ["POST"] },
  { path: "/api/stripe-webhook", allowedMethods: ["POST"] },
];

export const PORTFOLIO_ROUTES = [
  "/work/thousand-sunny",
  "/work/hard-hittin",
  "/work/harris-in-wonderland",
  "/work/m-and-j-video-games",
];

export const APPROVED_CLIENT_URLS = [
  "https://thousandsunnytcg.com/",
  "https://mjvideogames.com/",
  "https://hardhittincardshop.com/",
];

export const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const DEFAULT_BASE_URL = "https://www.forge-ct.com";
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_MS = 15_000;
const MAX_REDIRECTS = 5;

function asUrl(baseUrl, path) {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

function canonicalFor(baseUrl, path) {
  const url = asUrl(baseUrl, path);
  url.hash = "";
  url.search = "";
  return url.href;
}

function headerValue(headers, name) {
  return headers.get(name) || "";
}

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      ...options,
      redirect: "manual",
      signal: controller.signal,
    });
    return {
      response,
      elapsedMs: Math.round(performance.now() - started),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function requestFollowingRedirects(
  url,
  { timeoutMs = DEFAULT_TIMEOUT_MS, maxRedirects = MAX_REDIRECTS } = {},
) {
  const redirects = [];
  let current = new URL(url);
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    let result;
    try {
      result = await fetchWithTimeout(current, {}, timeoutMs);
    } catch (error) {
      const reason = error?.name === "AbortError" ? "timeout" : error?.message;
      return { url: current.href, redirects, error: reason };
    }
    const { response, elapsedMs } = result;
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      const next = new URL(location, current);
      redirects.push({
        from: current.href,
        to: next.href,
        status: response.status,
      });
      current = next;
      continue;
    }
    return { url: current.href, redirects, response, elapsedMs };
  }
  return {
    url: current.href,
    redirects,
    error: `redirect limit exceeded (${maxRedirects})`,
  };
}

function failure(result, url, type, detail) {
  result.failures.push({ url, type, detail });
}

async function checkPage(result, baseUrl, definition, options) {
  const url = asUrl(baseUrl, definition.path).href;
  const checked = await requestFollowingRedirects(url, options);
  if (checked.error) {
    failure(
      result,
      url,
      checked.error === "timeout" ? "timeout" : "request",
      checked.error,
    );
    return;
  }
  const { response, elapsedMs, redirects } = checked;
  const finalUrl = checked.url;
  const body = await response.text();
  result.checks.push({
    url,
    finalUrl,
    status: response.status,
    redirects,
    responseTimeMs: elapsedMs,
  });
  if (response.status !== 200)
    failure(result, url, "status", `expected 200, received ${response.status}`);
  if (elapsedMs > options.maxMs)
    failure(
      result,
      url,
      "response-time",
      `${elapsedMs}ms exceeds ${options.maxMs}ms`,
    );
  if (!body.toLowerCase().includes("<html"))
    failure(result, url, "html-marker", "missing <html marker");
  if (!body.includes(definition.marker))
    failure(
      result,
      url,
      "content-marker",
      `missing ${JSON.stringify(definition.marker)}`,
    );
  const canonical = body.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  )?.[1];
  const expectedCanonical = canonicalFor(baseUrl, definition.path);
  if (canonical !== expectedCanonical) {
    failure(
      result,
      url,
      "canonical",
      `expected ${expectedCanonical}, received ${canonical || "missing"}`,
    );
  }
  for (const header of REQUIRED_HEADERS) {
    if (!headerValue(response.headers, header))
      failure(result, url, "security-header", `missing ${header}`);
  }
}

async function checkApi(result, baseUrl, definition, options) {
  const url = asUrl(baseUrl, definition.path).href;
  let checked;
  try {
    checked = await requestFollowingRedirects(url, options);
  } catch (error) {
    failure(result, url, "request", error.message);
    return;
  }
  if (checked.error) {
    failure(
      result,
      url,
      checked.error === "timeout" ? "timeout" : "request",
      checked.error,
    );
    return;
  }
  const { response, elapsedMs } = checked;
  const allow = headerValue(response.headers, "allow");
  result.checks.push({
    url,
    finalUrl: checked.url,
    status: response.status,
    allow,
    responseTimeMs: elapsedMs,
  });
  if (response.status !== 405)
    failure(
      result,
      url,
      "api-get-status",
      `expected 405 for safe GET, received ${response.status}`,
    );
  if (
    !definition.allowedMethods.some((method) =>
      allow.toUpperCase().includes(method),
    )
  ) {
    failure(
      result,
      url,
      "api-get-allow",
      `expected Allow to include ${definition.allowedMethods.join(", ")}, received ${allow || "missing"}`,
    );
  }
  if (elapsedMs > options.maxMs)
    failure(
      result,
      url,
      "response-time",
      `${elapsedMs}ms exceeds ${options.maxMs}ms`,
    );
}

async function checkExternal(result, url, options) {
  const checked = await requestFollowingRedirects(url, options);
  if (checked.error) {
    failure(
      result,
      url,
      checked.error === "timeout" ? "timeout" : "request",
      checked.error,
    );
    return;
  }
  const { response, elapsedMs } = checked;
  result.checks.push({
    url,
    finalUrl: checked.url,
    status: response.status,
    redirects: checked.redirects,
    responseTimeMs: elapsedMs,
  });
  if (response.status < 200 || response.status >= 400)
    failure(
      result,
      url,
      "status",
      `expected 2xx or 3xx, received ${response.status}`,
    );
  if (elapsedMs > options.maxMs)
    failure(
      result,
      url,
      "response-time",
      `${elapsedMs}ms exceeds ${options.maxMs}ms`,
    );
}

export async function runSmoke({
  baseUrl = process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL,
  timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  maxMs = Number(process.env.SMOKE_MAX_MS) || DEFAULT_MAX_MS,
  clientUrls = APPROVED_CLIENT_URLS,
} = {}) {
  const result = {
    baseUrl,
    safeMethod:
      "GET-only; no forms, payments, customer data, or mutation endpoints submitted",
    checks: [],
    failures: [],
  };
  const options = { timeoutMs, maxMs };
  for (const definition of CORE_ROUTES)
    await checkPage(result, baseUrl, definition, options);
  for (const path of PORTFOLIO_ROUTES)
    await checkPage(result, baseUrl, { path, marker: "Forge CT" }, options);
  for (const definition of API_GET_ROUTES)
    await checkApi(result, baseUrl, definition, options);
  for (const url of clientUrls) await checkExternal(result, url, options);
  result.ok = result.failures.length === 0;
  return result;
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = await runSmoke();
  const output =
    process.env.SMOKE_JSON === "1"
      ? JSON.stringify(result, null, 2)
      : [
          `Production smoke ${result.ok ? "passed" : "failed"}: ${result.checks.length} checks, ${result.failures.length} failure(s).`,
          ...result.failures.map(
            (item) => `- ${item.url} [${item.type}] ${item.detail}`,
          ),
        ].join("\n");
  console.log(output);
  if (!result.ok) process.exitCode = 1;
}
