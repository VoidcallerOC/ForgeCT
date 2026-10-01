import assert from "node:assert/strict";
import test from "node:test";
import {
  claimWebhookEvent,
  markWebhookEventProcessed,
  releaseWebhookEvent,
  resetMemoryWebhookStore,
  WEBHOOK_EVENT_RETENTION_SECONDS,
  WEBHOOK_PROCESSING_LEASE_SECONDS,
} from "./_webhook-store.js";

test.afterEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.NODE_ENV;
  delete process.env.WEBHOOK_EVENT_STORE;
  resetMemoryWebhookStore();
});

test("Supabase atomically claims a new event with a short lease", async () => {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  let request;

  const claimed = await claimWebhookEvent("evt_new", {
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => true };
    },
  });

  assert.equal(claimed, true);
  assert.equal(
    request.url,
    "https://project.supabase.co/rest/v1/rpc/claim_stripe_webhook_event",
  );
  assert.equal(request.options.headers.apikey, "service-role-test-key");
  assert.deepEqual(JSON.parse(request.options.body), {
    p_event_id: "evt_new",
    p_lease_seconds: WEBHOOK_PROCESSING_LEASE_SECONDS,
    p_retention_seconds: WEBHOOK_EVENT_RETENTION_SECONDS,
  });
});

test("Supabase rejects a duplicate event", async () => {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";

  const claimed = await claimWebhookEvent("evt_duplicate", {
    fetchImpl: async () => ({
      ok: true,
      json: async () => false,
    }),
  });

  assert.equal(claimed, false);
});

test("successful events receive a long retention window", async () => {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  let request;

  await markWebhookEventProcessed("evt_processed", {
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => null };
    },
  });

  assert.match(request.url, /mark_stripe_webhook_event_processed$/);
  assert.deepEqual(JSON.parse(request.options.body), {
    p_event_id: "evt_processed",
    p_retention_seconds: WEBHOOK_EVENT_RETENTION_SECONDS,
  });
});

test("storage failures are surfaced for Stripe retry", async () => {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";

  await assert.rejects(
    () =>
      claimWebhookEvent("evt_storage_down", {
        fetchImpl: async () => ({ ok: false, status: 503 }),
      }),
    /responded 503/,
  );
});

test("production fails closed when Supabase is not configured", async () => {
  process.env.NODE_ENV = "production";

  await assert.rejects(
    () => claimWebhookEvent("evt_unconfigured"),
    /Durable webhook storage is not configured/,
  );
});

test("partial Supabase configuration fails closed instead of using memory", async () => {
  process.env.NODE_ENV = "production";
  process.env.SUPABASE_URL = "https://project.supabase.co";

  await assert.rejects(
    () => claimWebhookEvent("evt_partial_config"),
    /Durable webhook storage is not configured/,
  );
});

test("local fallback releases failures but retains successes", async () => {
  process.env.WEBHOOK_EVENT_STORE = "memory";

  assert.equal(await claimWebhookEvent("evt_local"), true);
  assert.equal(await claimWebhookEvent("evt_local"), false);
  await releaseWebhookEvent("evt_local");
  assert.equal(await claimWebhookEvent("evt_local"), true);
  await markWebhookEventProcessed("evt_local");
  assert.equal(await claimWebhookEvent("evt_local"), false);
});
