const WINDOW_SECONDS = 15 * 60;
const memoryHits = new Map();

function storageConfig() {
  return {
    url: (process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

function useMemoryStore() {
  return (
    process.env.RATE_LIMIT_STORE === "memory" ||
    process.env.NODE_ENV !== "production"
  );
}

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

async function supabaseRpc(functionName, body, fetchImpl = globalThis.fetch) {
  const { url, key } = storageConfig();
  if (!url || !key) {
    throw new Error(
      "Distributed rate limiting is not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("Fetch is unavailable for distributed rate limiting");
  }

  const result = await fetchImpl(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!result.ok) {
    throw new Error(`Supabase rate-limit storage responded ${result.status}`);
  }
  return result.json();
}

function isMemoryRateLimited(bucket, ip, max) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  if (memoryHits.size > 400) {
    for (const [storedKey, value] of memoryHits) {
      if (now - value.start > WINDOW_SECONDS * 1000)
        memoryHits.delete(storedKey);
    }
  }
  const record = memoryHits.get(key);
  if (!record || now - record.start > WINDOW_SECONDS * 1000) {
    memoryHits.set(key, { start: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > max;
}

/**
 * Atomically increments a shared fixed-window counter in Supabase. Production
 * never silently falls back to an instance-local limiter.
 */
export async function isRateLimited(
  bucket,
  ip,
  max,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (useMemoryStore() && !storageConfig().url) {
    return isMemoryRateLimited(bucket, ip, max);
  }

  const count = await supabaseRpc(
    "increment_rate_limit",
    {
      p_bucket: bucket,
      p_client_key: ip,
      p_window_seconds: WINDOW_SECONDS,
      p_max_requests: max,
    },
    fetchImpl,
  );
  return Number(count) > max;
}

export function resetMemoryRateLimiter() {
  memoryHits.clear();
}

export const RATE_LIMIT_WINDOW_SECONDS = WINDOW_SECONDS;
