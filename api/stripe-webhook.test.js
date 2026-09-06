import assert from "node:assert/strict";
import test from "node:test";
import { addOneMonth } from "./stripe-webhook.js";

const timestamp = (value) => Math.floor(Date.parse(value) / 1000);
const iso = (value) =>
  new Date(addOneMonth(timestamp(value)) * 1000).toISOString();

test("one-month countdown clamps January 31 to February 28", () => {
  assert.equal(iso("2026-01-31T12:00:00Z"), "2026-02-28T12:00:00.000Z");
});

test("one-month countdown preserves February 29 in a leap year", () => {
  assert.equal(iso("2028-02-29T12:00:00Z"), "2028-03-29T12:00:00.000Z");
});

test("one-month countdown preserves time of day", () => {
  assert.equal(iso("2026-09-06T17:55:23Z"), "2026-10-06T17:55:23.000Z");
});
