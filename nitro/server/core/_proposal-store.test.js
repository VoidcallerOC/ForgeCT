import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSnapshot,
  createProposal,
  getProposal,
  listEvents,
  publicProposalView,
  resetMemoryProposalStore,
  transitionProposal,
  updateProposal,
} from "./_proposal-store.js";
import { fulfillProposalDeposit } from "./stripe-webhook.js";

test.beforeEach(() => {
  delete process.env.NODE_ENV;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.PROPOSAL_STORE;
  process.env.NODE_ENV = "test";
  process.env.PROPOSAL_STORE = "memory";
  resetMemoryProposalStore();
});

test("create → send → view → accept → payment happy path", async () => {
  const created = await createProposal({
    business_name: "Thousand Sunny Cards",
    contact_name: "Luffy",
    contact_email: "owner@example.com",
    project_title: "Website Build — Standard",
    package_id: "website-standard",
    line_items: [
      {
        label: "Standard · Business Website",
        quantity: 1,
        unit_amount_cents: 150000,
      },
    ],
    scope_text: "Up to 5 pages",
    timeline_text: "3–4 weeks",
    terms_text: "Deposit 50%.",
  });

  assert.equal(created.status, "DRAFT");
  assert.equal(created.subtotal_cents, 150000);
  assert.equal(created.deposit_cents, 75000);
  assert.match(created.public_id, /^[A-Za-z0-9_-]{20,}$/);

  const sent = await transitionProposal(created.public_id, {
    toStatus: "SENT",
    eventType: "sent",
    actor: "admin",
    snapshot: buildSnapshot(created),
  });
  assert.equal(sent.status, "SENT");
  assert.ok(sent.snapshot);

  const viewed = await transitionProposal(created.public_id, {
    toStatus: "VIEWED",
    eventType: "viewed",
    actor: "client",
  });
  assert.equal(viewed.status, "VIEWED");

  const accepted = await transitionProposal(created.public_id, {
    toStatus: "ACCEPTED",
    eventType: "accepted",
    actor: "client",
    acceptance: {
      name: "Luffy",
      email: "owner@example.com",
      version: created.version,
      legal_esign_claimed: false,
    },
  });
  assert.equal(accepted.status, "ACCEPTED");

  const pending = await transitionProposal(created.public_id, {
    toStatus: "PAYMENT_PENDING",
    eventType: "checkout_created",
    actor: "client",
    stripeCheckoutSessionId: "cs_test_123",
  });
  assert.equal(pending.status, "PAYMENT_PENDING");

  const paid = await fulfillProposalDeposit({
    id: "cs_test_123",
    amount_total: 75000,
    currency: "usd",
    payment_intent: "pi_test_1",
    metadata: {
      source: "forge_proposal_deposit",
      proposal_public_id: created.public_id,
      proposal_version: String(created.version),
    },
  });
  assert.equal(paid.status, "PAYMENT_RECEIVED");

  const events = await listEvents(created.public_id);
  assert.ok(events.some((e) => e.event_type === "payment_received"));
});

test("editing after send bumps version back to draft", async () => {
  const created = await createProposal({
    business_name: "Shop",
    contact_name: "Alex",
    contact_email: "alex@example.com",
    project_title: "Basic site",
    line_items: [{ label: "Basic", quantity: 1, unit_amount_cents: 75000 }],
  });
  await transitionProposal(created.public_id, {
    toStatus: "SENT",
    eventType: "sent",
    actor: "admin",
    snapshot: buildSnapshot(created),
  });

  const updated = await updateProposal(created.public_id, {
    scope_text: "Revised scope",
    line_items: [{ label: "Basic", quantity: 1, unit_amount_cents: 75000 }],
  });
  assert.equal(updated.status, "DRAFT");
  assert.equal(updated.version, 2);
  assert.equal(updated.scope_text, "Revised scope");
});

test("public view hides draft and strips internal fields", async () => {
  const created = await createProposal({
    business_name: "Shop",
    contact_name: "Alex",
    contact_email: "alex@example.com",
    project_title: "Basic site",
    notes: "internal only",
    line_items: [{ label: "Basic", quantity: 1, unit_amount_cents: 75000 }],
  });
  const pub = publicProposalView(created);
  assert.equal(pub.project_title, "Basic site");
  assert.equal(pub.notes, undefined);
  assert.equal((await getProposal(created.public_id)).notes, "internal only");
});

test("rejects impossible transition", async () => {
  const created = await createProposal({
    business_name: "Shop",
    contact_name: "Alex",
    contact_email: "alex@example.com",
    project_title: "Basic site",
    line_items: [{ label: "Basic", quantity: 1, unit_amount_cents: 75000 }],
  });
  await assert.rejects(
    () =>
      transitionProposal(created.public_id, {
        toStatus: "PAYMENT_RECEIVED",
        eventType: "bad",
      }),
    /Invalid proposal transition/,
  );
});
