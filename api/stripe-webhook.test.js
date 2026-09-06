import assert from "node:assert/strict";
import test from "node:test";
import { addOneMonth, handleEvent } from "./stripe-webhook.js";

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

test("unpaid checkout sessions do not update customers or send fulfillment", async () => {
  let updates = 0;
  const client = {
    customers: { update: async () => updates++ },
  };

  await handleEvent(client, {
    type: "checkout.session.completed",
    created: timestamp("2026-09-06T17:55:23Z"),
    data: {
      object: {
        id: "cs_unpaid",
        payment_status: "unpaid",
        metadata: { care_plan: "care" },
        customer: "cus_unpaid",
      },
    },
  });

  assert.equal(updates, 0);
});

test("ACH settlement records the settlement timestamp and countdown", async () => {
  const updates = [];
  const client = {
    customers: { update: async (...args) => updates.push(args) },
  };
  const settledAt = timestamp("2026-09-06T17:55:23Z");

  await handleEvent(client, {
    type: "payment_intent.succeeded",
    created: settledAt,
    data: {
      object: {
        id: "pi_ach_settled",
        customer: "cus_ach",
        metadata: { care_plan: "care" },
      },
    },
  });

  assert.deepEqual(updates, [
    [
      "cus_ach",
      {
        metadata: {
          care_plan: "care",
          source: "forge_deposit_checkout",
          care_payment_settled_at: String(settledAt),
          care_countdown_ends_at: String(addOneMonth(settledAt)),
          care_payment_intent: "pi_ach_settled",
        },
      },
    ],
  ]);
});

test("a paid final invoice does not create a duplicate Care subscription", async () => {
  process.env.STRIPE_PRICE_CARE = "price_care_test";
  const created = [];
  const client = {
    customers: {
      retrieve: async () => ({ metadata: { care_plan: "care" } }),
      update: async () => {},
    },
    subscriptions: {
      list: async () => ({
        data: [
          {
            id: "sub_existing",
            metadata: {
              source: "forge_final_payment",
              final_invoice: "in_final",
            },
          },
        ],
      }),
      create: async (params) => created.push(params),
    },
  };

  await handleEvent(client, {
    type: "invoice.paid",
    created: timestamp("2026-09-06T17:55:23Z"),
    data: {
      object: {
        id: "in_final",
        metadata: { lookup: "forge_site_final" },
        customer: "cus_final",
        status_transitions: { paid_at: timestamp("2026-09-06T17:55:23Z") },
      },
    },
  });

  assert.equal(created.length, 0);
});
