const WINDOW_MS = 15 * 60 * 1000;
const hits = new Map();

export function clientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  const real = request.headers["x-real-ip"];
  if (typeof real === "string" && real.trim()) {
    return real.trim();
  }
  return request.socket?.remoteAddress || "unknown";
}

/**
 * Per-instance sliding window. Serverless instances are not shared, so this
 * blunts casual abuse rather than a distributed attack — Stripe's own rate
 * limits and radar are the real backstop.
 */
export function isRateLimited(bucket, ip, max) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  if (hits.size > 400) {
    for (const [k, v] of hits) {
      if (now - v.start > WINDOW_MS) hits.delete(k);
    }
  }
  const rec = hits.get(key);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > max;
}
