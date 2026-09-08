import assert from "node:assert/strict";
import test from "node:test";
import handler from "./contact.js";
import { resetMemoryRateLimiter } from "./_ratelimit.js";

function responseMock() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function request(body, headers = { "content-type": "application/json" }) {
  return {
    method: "POST",
    headers,
    body,
    socket: { remoteAddress: "203.0.113.20" },
  };
}

test.afterEach(() => {
  delete process.env.NODE_ENV;
  delete process.env.RESEND_API_KEY;
  resetMemoryRateLimiter();
});

test("rejects non-JSON requests before parsing the body", async () => {
  const response = responseMock();

  await handler(
    request("name=Test", {
      "content-type": "application/x-www-form-urlencoded",
    }),
    response,
  );

  assert.equal(response.statusCode, 415);
  assert.equal(response.body.ok, false);
});

test("rejects oversized requests", async () => {
  const response = responseMock();
  const body = JSON.stringify({ message: "x".repeat(12 * 1024) });

  await handler(
    request(body, {
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(body)),
    }),
    response,
  );

  assert.equal(response.statusCode, 413);
  assert.equal(response.body.ok, false);
});

test("normalizes Unicode input and lowercases the reply address", async () => {
  process.env.NODE_ENV = "test";
  process.env.RESEND_API_KEY = "resend-test-key";
  const originalFetch = globalThis.fetch;
  let sent;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true };
  };
  const response = responseMock();

  try {
    await handler(
      request({
        name: "  Café  ",
        email: "  SHOP@EXAMPLE.COM ",
        company: "  Shop   Co  ",
        message: "  First line\r\nsecond line  ",
      }),
      response,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(sent.reply_to, "shop@example.com");
  assert.match(sent.text, /Name: Café/);
  assert.match(sent.text, /Company: Shop Co/);
  assert.match(sent.text, /First line\nsecond line/);
});

test("rejects malformed email addresses", async () => {
  const response = responseMock();

  await handler(
    request({
      name: "Test Shop",
      email: "person..name@example.com",
      message: "Hello",
    }),
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Please add a valid email address.");
});

test("honeypot remains a silent success", async () => {
  const response = responseMock();

  await handler(
    request({ website: "https://bot.example", email: "not-an-email" }),
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true });
});
