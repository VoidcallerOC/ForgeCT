import { Readable } from "node:stream";

/**
 * Runs a certified FORGE CT API handler (server/core, written for Vercel's Node runtime) inside a
 * TanStack Start server route. The handlers only use: request.method / headers / body / socket and a
 * readable stream for the raw body; response.status().json() and response.setHeader().
 *
 * rawBody: true mirrors `export const config = { api: { bodyParser: false } }` (Stripe webhook):
 * the body is left unparsed and only available as a stream, byte for byte, for signature checks.
 */
type NodeResponse = {
  statusCode: number;
  setHeader(name: string, value: string | number): NodeResponse;
  status(code: number): NodeResponse;
  json(body: unknown): NodeResponse;
  end(body?: string): NodeResponse;
};

export type NodeHandler = (request: any, response: NodeResponse) => unknown;

export async function runNodeHandler(handler: NodeHandler, request: Request, options: { rawBody?: boolean } = {}) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  const bytes = Buffer.from(await request.arrayBuffer());

  let body: unknown;
  if (!options.rawBody && bytes.length) {
    const text = bytes.toString("utf8");
    body = text;
    if (/^application\/json(?:\s*;|$)/i.test(headers["content-type"] || "")) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
  }

  const url = new URL(request.url);
  const nodeRequest = Object.assign(Readable.from(options.rawBody && bytes.length ? [bytes] : []), {
    method: request.method,
    url: url.pathname + url.search,
    headers,
    body,
  });

  const outHeaders = new Headers();
  let payload: string | undefined;
  const response: NodeResponse = {
    statusCode: 200,
    setHeader(name, value) {
      outHeaders.set(name, String(value));
      return response;
    },
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(value) {
      outHeaders.set("Content-Type", "application/json; charset=utf-8");
      payload = JSON.stringify(value);
      return response;
    },
    end(value) {
      payload = value;
      return response;
    },
  };

  await handler(nodeRequest, response);
  outHeaders.set("Cache-Control", "no-store");
  return new Response(payload ?? null, { status: response.statusCode, headers: outHeaders });
}
