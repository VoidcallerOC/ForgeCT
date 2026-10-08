import { timingSafeEqual } from "node:crypto";

function header(request, name) {
  const headers = request.headers || {};
  return headers[name] || headers[name.toLowerCase()] || "";
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Admin gate: Authorization: Bearer <PROPOSAL_ADMIN_TOKEN>
 * No login system exists on Forge-CT; this shared secret is the minimal
 * internal gate (same secret class as other server env keys).
 */
export function requireAdmin(request) {
  const expected = process.env.PROPOSAL_ADMIN_TOKEN || "";
  if (!expected || expected.length < 16) {
    const err = new Error(
      "Proposal admin is not configured. Set PROPOSAL_ADMIN_TOKEN (16+ chars).",
    );
    err.code = "ADMIN_NOT_CONFIGURED";
    err.status = 503;
    throw err;
  }

  const auth = String(header(request, "authorization") || "");
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  const token = match ? match[1].trim() : "";
  if (!token || !safeEqual(token, expected)) {
    const err = new Error("Unauthorized.");
    err.code = "UNAUTHORIZED";
    err.status = 401;
    throw err;
  }
  return true;
}

export function readJsonBody(request, maxBytes = 64 * 1024) {
  let payload = request.body;
  if (typeof payload === "string") {
    if (Buffer.byteLength(payload, "utf8") > maxBytes) {
      const err = new Error("That request is too large.");
      err.status = 413;
      throw err;
    }
    try {
      payload = JSON.parse(payload);
    } catch {
      const err = new Error("Invalid JSON body.");
      err.status = 400;
      throw err;
    }
  }
  return payload || {};
}

export function contentTypeIsJson(request) {
  return /^application\/json(?:\s*;|$)/i.test(
    String(header(request, "content-type") || ""),
  );
}
