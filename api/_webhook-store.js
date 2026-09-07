const RETENTION_SECONDS = 90 * 24 * 60 * 60;
const PROCESSING_LEASE_SECONDS = 5 * 60;
const memoryStates = new Map();

function storageConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
  return { url: url.replace(/\/$/, ""), token };
}

function useMemoryStore() {
  return (
    process.env.WEBHOOK_EVENT_STORE === "memory" ||
    process.env.NODE_ENV !== "production"
  );
}

async function redisCommand(command, { fetchImpl = globalThis.fetch } = {}) {
  const { url, token } = storageConfig();
  if (!url || !token) {
    if (!useMemoryStore()) {
      throw new Error(
        "Durable webhook storage is not configured; set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
      );
    }
    return null;
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("Fetch is unavailable for durable webhook storage");
  }

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`Durable webhook storage responded ${response.status}`);
  }
  const payload = await response.json();
  if (!("result" in payload)) {
    throw new Error("Durable webhook storage returned an unexpected result");
  }
  return payload.result;
}

/**
 * Acquire a short processing lease for a Stripe event. A duplicate delivery is
 * ignored while a lease or completed record exists. A crashed invocation can
 * be retried after the five-minute lease expires.
 */
export async function claimWebhookEvent(
  eventId,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!eventId) throw new Error("Webhook event id is required");
  const key = `forge:webhook:event:${eventId}`;

  if (useMemoryStore() && !storageConfig().url) {
    if (memoryStates.has(eventId)) return false;
    memoryStates.set(eventId, "processing");
    return true;
  }

  const result = await redisCommand(
    ["SET", key, "processing", "NX", "EX", String(PROCESSING_LEASE_SECONDS)],
    { fetchImpl },
  );
  return result === "OK";
}

export async function markWebhookEventProcessed(
  eventId,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!eventId) throw new Error("Webhook event id is required");
  const key = `forge:webhook:event:${eventId}`;

  if (useMemoryStore() && !storageConfig().url) {
    memoryStates.set(eventId, "processed");
    return;
  }

  await redisCommand(
    ["SET", key, "processed", "EX", String(RETENTION_SECONDS)],
    { fetchImpl },
  );
}

export async function releaseWebhookEvent(
  eventId,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!eventId) return;
  const key = `forge:webhook:event:${eventId}`;

  if (useMemoryStore() && !storageConfig().url) {
    if (memoryStates.get(eventId) === "processing")
      memoryStates.delete(eventId);
    return;
  }

  await redisCommand(["DEL", key], { fetchImpl });
}

export function resetMemoryWebhookStore() {
  memoryStates.clear();
}

export const WEBHOOK_EVENT_RETENTION_SECONDS = RETENTION_SECONDS;
export const WEBHOOK_PROCESSING_LEASE_SECONDS = PROCESSING_LEASE_SECONDS;
