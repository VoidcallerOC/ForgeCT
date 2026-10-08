import test from "node:test";
import assert from "node:assert/strict";
import {
  computeTotals,
  toCents,
  formatUsdFromCents,
} from "./_proposal-money.js";

test("toCents rounds dollars to integer cents", () => {
  assert.equal(toCents(750), 75000);
  assert.equal(toCents(19.99), 1999);
  assert.equal(toCents("1500"), 150000);
});

test("computeTotals is server authority and ignores float tricks", () => {
  const totals = computeTotals([
    { label: "Basic", quantity: 1, unit_amount_cents: 75000 },
    { label: "E-commerce", quantity: 1, unit_amount_cents: 75000 },
  ]);
  assert.equal(totals.subtotal_cents, 150000);
  assert.equal(totals.deposit_cents, 75000);
  assert.equal(totals.line_items[0].line_total_cents, 75000);
});

test("computeTotals rejects deposit above subtotal", () => {
  assert.throws(
    () =>
      computeTotals([{ label: "X", quantity: 1, unit_amount_cents: 1000 }], {
        depositCents: 1001,
      }),
    /Deposit cannot exceed/,
  );
});

test("formatUsdFromCents", () => {
  assert.equal(formatUsdFromCents(75000), "$750.00");
});
