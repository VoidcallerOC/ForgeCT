const RETENTION_SECONDS = 90 * 24 * 60 * 60;
const PROCESSING_LEASE_SECONDS = 5 * 60;
const memoryStates = new Map();

function storageConfig() {
  return {
    url: (process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

function useMemoryStore() {
  return (
    process.env.WEBHOOK_EVENT_STORE === "memory" ||
    process.env.NODE_ENV !== "production"
  );
}

function hasDurableStorage() {
  const { url, key } = storageConfig();
  return Boolean(url && key);
}

async function supabaseRpc(
  functionName,
  body,
  { fetchImpl = globalThis.fetch } = {},
) {
  const { url, key } = storageConfig();
  if (!url || !key) {
    if (!useMemoryStore()) {
      throw new Error(
        "Durable webhook storage is not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
      );
    }
    return null;
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("Fetch is unavailable for durable webhook storage");
  }

  const response = await fetchImpl(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Supabase webhook storage responded ${response.status}`);
  }
  return response.json();
}

/**
 * Acquire a short processing lease for a Stripe event. The Supabase RPC uses
 * a unique event id and a conditional upsert so concurrent serverless
 * instances cannot process the same event twice.
 */
export async function claimWebhookEvent(
  eventId,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!eventId) throw new Error("Webhook event id is required");

  if (
    useMemoryStore() &&
    !hasDurableStorage() &&
    !storageConfig().url &&
    !storageConfig().key
  ) {
    if (memoryStates.has(eventId)) return false;
    memoryStates.set(eventId, "processing");
    return true;
  }

  const result = await supabaseRpc(
    "claim_stripe_webhook_event",
    {
      p_event_id: eventId,
      p_lease_seconds: PROCESSING_LEASE_SECONDS,
      p_retention_seconds: RETENTION_SECONDS,
    },
    { fetchImpl },
  );
  return result === true;
}

export async function markWebhookEventProcessed(
  eventId,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!eventId) throw new Error("Webhook event id is required");

  if (
    useMemoryStore() &&
    !hasDurableStorage() &&
    !storageConfig().url &&
    !storageConfig().key
  ) {
    memoryStates.set(eventId, "processed");
    return;
  }

  await supabaseRpc(
    "mark_stripe_webhook_event_processed",
    { p_event_id: eventId, p_retention_seconds: RETENTION_SECONDS },
    { fetchImpl },
  );
}

export async function releaseWebhookEvent(
  eventId,
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!eventId) return;

  if (
    useMemoryStore() &&
    !hasDurableStorage() &&
    !storageConfig().url &&
    !storageConfig().key
  ) {
    if (memoryStates.get(eventId) === "processing")
      memoryStates.delete(eventId);
    return;
  }

  await supabaseRpc(
    "release_stripe_webhook_event",
    { p_event_id: eventId },
    { fetchImpl },
  );
}

export function resetMemoryWebhookStore() {
  memoryStates.clear();
}

export const WEBHOOK_EVENT_RETENTION_SECONDS = RETENTION_SECONDS;
export const WEBHOOK_PROCESSING_LEASE_SECONDS = PROCESSING_LEASE_SECONDS;
