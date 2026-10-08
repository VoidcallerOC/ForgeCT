import assert from "node:assert/strict";
import test from "node:test";
import {
  createInquiryLead,
  getMemoryLead,
  markInquiryLeadDelivery,
  resetMemoryLeadStore,
} from "./_lead-store.js";

test.afterEach(() => {
  delete process.env.NODE_ENV;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.LEAD_STORE;
  resetMemoryLeadStore();
});

test("memory store records a received lead and delivery status", async () => {
  process.env.NODE_ENV = "test";
  const id = await createInquiryLead({
    source: "audit",
    name: "Pat",
    email: "pat@example.com",
    siteUrl: "https://example.com",
    message: "Hours buried",
    slaHours: 24,
  });
  assert.ok(id);
  assert.equal(getMemoryLead(id).status, "received");
  await markInquiryLeadDelivery(id, {
    status: "notified",
    providerMessageId: "re_123",
  });
  assert.equal(getMemoryLead(id).status, "notified");
  assert.equal(getMemoryLead(id).providerMessageId, "re_123");
});

test("LEAD_STORE=off skips persistence", async () => {
  process.env.LEAD_STORE = "off";
  const id = await createInquiryLead({
    source: "inquiry",
    name: "Pat",
    email: "pat@example.com",
  });
  assert.equal(id, null);
});

test("production uses Supabase RPC insert", async () => {
  process.env.NODE_ENV = "production";
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  let called;
  const id = await createInquiryLead(
    {
      source: "booking",
      name: "Pat",
      email: "pat@example.com",
      message: "Appointment request",
    },
    {
      fetchImpl: async (url, options) => {
        called = { url, body: JSON.parse(options.body) };
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify("11111111-2222-3333-4444-555555555555");
          },
        };
      },
    },
  );
  assert.equal(id, "11111111-2222-3333-4444-555555555555");
  assert.equal(
    called.url,
    "https://project.supabase.co/rest/v1/rpc/insert_inquiry_lead",
  );
  assert.equal(called.body.p_source, "booking");
  assert.equal(called.body.p_email, "pat@example.com");
});
