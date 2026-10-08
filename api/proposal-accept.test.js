import test from "node:test";
import assert from "node:assert/strict";
import handler, { CONFIRMATION } from "./proposal-accept.js";
import {
  buildSnapshot,
  createProposal,
  resetMemoryProposalStore,
  transitionProposal,
} from "./_proposal-store.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test.beforeEach(() => {
  process.env.NODE_ENV = "test";
  process.env.PROPOSAL_STORE = "memory";
  process.env.RATE_LIMIT_STORE = "memory";
  resetMemoryProposalStore();
});

test("accept records confirmation without claiming legal e-sign", async () => {
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

  const response = mockResponse();
  await handler(
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.10",
        "user-agent": "ForgeTest/1.0",
      },
      body: {
        public_id: created.public_id,
        name: "Alex Owner",
        email: "alex@example.com",
        version: 1,
        confirmation: CONFIRMATION,
      },
    },
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.accepted, true);
  assert.equal(response.body.proposal.status, "ACCEPTED");
  assert.match(response.body.notice, /not a legal electronic signature/i);
});

test("accept rejects version mismatch", async () => {
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

  const response = mockResponse();
  await handler(
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.11",
      },
      body: {
        public_id: created.public_id,
        name: "Alex",
        email: "alex@example.com",
        version: 99,
        confirmation: CONFIRMATION,
      },
    },
    response,
  );

  assert.equal(response.statusCode, 409);
  assert.match(response.body.error, /updated/i);
});
