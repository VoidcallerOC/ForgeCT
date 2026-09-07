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
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.NODE_ENV;
  delete process.env.WEBHOOK_EVENT_STORE;
  resetMemoryWebhookStore();
});

test("durable store atomically claims a new event with a short lease", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  let request;

  const claimed = await claimWebhookEvent("evt_new", {
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ result: "OK" }) };
    },
  });

  assert.equal(claimed, true);
  assert.equal(request.url, "https://redis.example.com");
  assert.equal(request.options.headers.Authorization, "Bearer test-token");
  assert.deepEqual(JSON.parse(request.options.body), [
    "SET",
    "forge:webhook:event:evt_new",
    "processing",
    "NX",
    "EX",
    String(WEBHOOK_PROCESSING_LEASE_SECONDS),
  ]);
});

test("durable store rejects a duplicate event", async () => {
  process.env.KV_REST_API_URL = "https://kv.example.com";
  process.env.KV_REST_API_TOKEN = "test-token";

  const claimed = await claimWebhookEvent("evt_duplicate", {
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ result: null }),
    }),
  });

  assert.equal(claimed, false);
});

test("successful events receive a long retention window", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  let command;

  await markWebhookEventProcessed("evt_processed", {
    fetchImpl: async (_url, options) => {
      command = JSON.parse(options.body);
      return { ok: true, json: async () => ({ result: "OK" }) };
    },
  });

  assert.deepEqual(command, [
    "SET",
    "forge:webhook:event:evt_processed",
    "processed",
    "EX",
    String(WEBHOOK_EVENT_RETENTION_SECONDS),
  ]);
});

test("storage failures are surfaced for Stripe retry", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

  await assert.rejects(
    () =>
      claimWebhookEvent("evt_storage_down", {
        fetchImpl: async () => ({ ok: false, status: 503 }),
      }),
    /responded 503/,
  );
});

test("production fails closed when durable storage is not configured", async () => {
  process.env.NODE_ENV = "production";

  await assert.rejects(
    () => claimWebhookEvent("evt_unconfigured"),
    /Durable webhook storage is not configured/,
  );
});

test("local tests retain an explicit in-memory fallback and release failures", async () => {
  process.env.WEBHOOK_EVENT_STORE = "memory";

  assert.equal(await claimWebhookEvent("evt_local"), true);
  assert.equal(await claimWebhookEvent("evt_local"), false);
  await releaseWebhookEvent("evt_local");
  assert.equal(await claimWebhookEvent("evt_local"), true);
  await markWebhookEventProcessed("evt_local");
  assert.equal(await claimWebhookEvent("evt_local"), false);
});
