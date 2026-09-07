import assert from "node:assert/strict";
import test from "node:test";
import {
  isRateLimited,
  resetMemoryRateLimiter,
  RATE_LIMIT_WINDOW_SECONDS,
} from "./_ratelimit.js";

test.afterEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.NODE_ENV;
  delete process.env.RATE_LIMIT_STORE;
  resetMemoryRateLimiter();
});

test("production increments the shared Supabase counter", async () => {
  process.env.NODE_ENV = "production";
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";

  let request;
  const limited = await isRateLimited("contact", "203.0.113.10", 5, {
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => 6 };
    },
  });

  assert.equal(limited, true);
  assert.equal(
    request.url,
    "https://project.supabase.co/rest/v1/rpc/increment_rate_limit",
  );
  assert.deepEqual(JSON.parse(request.options.body), {
    p_bucket: "contact",
    p_client_key: "203.0.113.10",
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    p_max_requests: 5,
  });
});

test("local environments retain the existing in-memory limit semantics", async () => {
  process.env.NODE_ENV = "test";

  for (let count = 0; count < 5; count += 1) {
    assert.equal(await isRateLimited("contact", "203.0.113.10", 5), false);
  }
  assert.equal(await isRateLimited("contact", "203.0.113.10", 5), true);
});

test("production does not silently fall back when shared storage is missing", async () => {
  process.env.NODE_ENV = "production";
  await assert.rejects(
    isRateLimited("checkout", "203.0.113.11", 12),
    /Distributed rate limiting is not configured/,
  );
});
