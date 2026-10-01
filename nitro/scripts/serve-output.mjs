/**
 * Serves the built .vercel/output locally the way Vercel's router would: config.json routes in order
 * (host redirect, header routes with `continue`, `handle: filesystem`, then the Nitro function).
 * Used by the browser checks and the output check so they test the real build artifact.
 *
 *   node scripts/serve-output.mjs [port]      (default 4173)
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../.vercel/output");
const config = JSON.parse(await readFile(path.join(root, "config.json"), "utf8"));
const fn = (await import(pathToFileURL(path.join(root, "functions/__server.func/index.mjs")).href)).default;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

async function staticFile(pathname) {
  const base = path.join(root, "static", decodeURIComponent(pathname));
  if (!base.startsWith(path.join(root, "static"))) return null;
  for (const candidate of [base, path.join(base, "index.html"), `${base}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      /* next */
    }
  }
  return null;
}

const matches = (route, pathname, host) => {
  const re = new RegExp(`^${route.src}$`);
  const m = pathname.match(re);
  if (!m) return null;
  for (const cond of route.has || []) {
    if (cond.type === "host" && cond.value !== host) return null;
  }
  return m;
};

export function startServer(port = 4173) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const host = String(req.headers.host || "").split(":")[0];
      const headers = {};
      for (const route of config.routes) {
        if (route.handle === "filesystem") {
          const file = await staticFile(url.pathname);
          if (file) {
            const body = await readFile(file);
            res.writeHead(200, { ...headers, "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
            return res.end(req.method === "HEAD" ? undefined : body);
          }
          continue;
        }
        const m = matches(route, url.pathname, host);
        if (!m) continue;
        const sub = (v) => v.replace(/\$(\d+)/g, (_, i) => m[Number(i)] ?? "");
        if (route.status && route.headers?.Location) {
          res.writeHead(route.status, { ...headers, Location: sub(route.headers.Location) });
          return res.end();
        }
        if (route.headers) Object.assign(headers, route.headers);
        if (route.dest) {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const request = new Request(url, {
            method: req.method,
            headers: Object.entries(req.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : [[k, v]])),
            body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
          });
          const response = await fn.fetch(request, {});
          const out = { ...headers };
          response.headers.forEach((v, k) => (out[k] = v));
          res.writeHead(response.status, out);
          return res.end(Buffer.from(await response.arrayBuffer()));
        }
        if (!route.continue) {
          // A matched route with no dest ends routing; Vercel then serves the path from the filesystem.
          const file = await staticFile(url.pathname);
          if (file) {
            res.writeHead(200, { ...headers, "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
            return res.end(req.method === "HEAD" ? undefined : await readFile(file));
          }
          break;
        }
      }
      res.writeHead(404, headers);
      res.end("not found");
    } catch (error) {
      res.writeHead(500);
      res.end(String(error?.stack || error));
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.argv[2] || 4173);
  await startServer(port);
  console.log(`serving .vercel/output on http://127.0.0.1:${port}`);
}
