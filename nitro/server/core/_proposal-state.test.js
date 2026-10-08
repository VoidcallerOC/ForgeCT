import test from "node:test";
import assert from "node:assert/strict";
import {
  assertTransition,
  canAccept,
  canStartCheckout,
  maybeExpire,
} from "./_proposal-state.js";

test("allows the happy path transitions", () => {
  assertTransition("DRAFT", "SENT");
  assertTransition("SENT", "VIEWED");
  assertTransition("VIEWED", "ACCEPTED");
  assertTransition("ACCEPTED", "PAYMENT_PENDING");
  assertTransition("PAYMENT_PENDING", "PAYMENT_RECEIVED");
});

test("rejects impossible transitions", () => {
  assert.throws(
    () => assertTransition("DRAFT", "ACCEPTED"),
    /Invalid proposal transition/,
  );
  assert.throws(
    () => assertTransition("ARCHIVED", "SENT"),
    /Invalid proposal transition/,
  );
  assert.throws(() => assertTransition("PAYMENT_RECEIVED", "DRAFT"), /Invalid/);
});

test("acceptance and checkout gates", () => {
  assert.equal(canAccept("SENT"), true);
  assert.equal(canAccept("VIEWED"), true);
  assert.equal(canAccept("DRAFT"), false);
  assert.equal(canStartCheckout("ACCEPTED"), true);
  assert.equal(canStartCheckout("SENT"), false);
});

test("maybeExpire marks sent proposals past expires_at", () => {
  const expired = maybeExpire(
    {
      status: "SENT",
      expires_at: "2020-01-01T00:00:00.000Z",
    },
    new Date("2026-10-08T00:00:00.000Z"),
  );
  assert.equal(expired.status, "EXPIRED");
  assert.equal(expired._expired_locally, true);
});
