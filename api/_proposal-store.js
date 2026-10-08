import { randomBytes } from "node:crypto";
import { computeTotals } from "./_proposal-money.js";
import {
  assertTransition,
  TIMESTAMP_FIELD,
  maybeExpire,
} from "./_proposal-state.js";

const memoryProposals = new Map();
const memoryEvents = new Map();

function storageConfig() {
  return {
    url: (process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

function useMemoryStore() {
  return (
    process.env.PROPOSAL_STORE === "memory" ||
    process.env.NODE_ENV !== "production"
  );
}

function hasDurableStorage() {
  const { url, key } = storageConfig();
  return Boolean(url && key);
}

function preferMemory() {
  return useMemoryStore() && !hasDurableStorage();
}

export function newPublicId() {
  return randomBytes(18).toString("base64url");
}

async function supabaseRpc(
  functionName,
  body,
  { fetchImpl = globalThis.fetch } = {},
) {
  const { url, key } = storageConfig();
  if (!url || !key) {
    throw new Error(
      "Durable proposal storage is not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  const response = await fetchImpl(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase proposal storage responded ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function pushEvent(publicId, event) {
  const list = memoryEvents.get(publicId) || [];
  list.push({
    id: `evt_${list.length + 1}`,
    created_at: new Date().toISOString(),
    ...event,
  });
  memoryEvents.set(publicId, list);
}

function clone(row) {
  return JSON.parse(JSON.stringify(row));
}

function buildPricing(input) {
  return computeTotals(input.line_items || input.lineItems || [], {
    depositPercent: input.deposit_percent ?? input.depositPercent ?? 50,
    depositCents: input.deposit_cents ?? input.depositCents ?? null,
  });
}

function normalizeRecordInput(input) {
  const pricing = buildPricing(input);
  return {
    business_name: String(
      input.business_name || input.businessName || "",
    ).trim(),
    contact_name: String(input.contact_name || input.contactName || "").trim(),
    contact_email: String(input.contact_email || input.contactEmail || "")
      .trim()
      .toLowerCase(),
    contact_phone: String(
      input.contact_phone || input.contactPhone || "",
    ).trim(),
    website: String(input.website || "").trim(),
    address: String(input.address || "").trim(),
    hubspot_ref: String(input.hubspot_ref || input.hubspotRef || "").trim(),
    project_title: String(
      input.project_title || input.projectTitle || "",
    ).trim(),
    scope_text: String(input.scope_text || input.scopeText || ""),
    timeline_text: String(input.timeline_text || input.timelineText || ""),
    terms_text: String(input.terms_text || input.termsText || ""),
    package_id: String(input.package_id || input.packageId || "").trim(),
    line_items: pricing.line_items,
    subtotal_cents: pricing.subtotal_cents,
    deposit_cents: pricing.deposit_cents,
    currency: String(input.currency || "usd").toLowerCase(),
    expires_at: input.expires_at || input.expiresAt || null,
    lead_id: input.lead_id || input.leadId || null,
    notes: String(input.notes || ""),
  };
}

function requireCoreFields(fields) {
  if (!fields.business_name)
    throw Object.assign(new Error("business_name is required."), {
      status: 400,
    });
  if (!fields.contact_name)
    throw Object.assign(new Error("contact_name is required."), {
      status: 400,
    });
  if (!fields.contact_email || !fields.contact_email.includes("@")) {
    throw Object.assign(new Error("contact_email is required."), {
      status: 400,
    });
  }
  if (!fields.project_title)
    throw Object.assign(new Error("project_title is required."), {
      status: 400,
    });
}

export async function createProposal(input, opts = {}) {
  const fields = normalizeRecordInput(input);
  requireCoreFields(fields);
  const publicId = input.public_id || newPublicId();

  if (preferMemory()) {
    const row = {
      id: `mem_${memoryProposals.size + 1}`,
      public_id: publicId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "DRAFT",
      version: 1,
      ...fields,
      acceptance: null,
      snapshot: null,
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
      sent_at: null,
      viewed_at: null,
      accepted_at: null,
      declined_at: null,
      archived_at: null,
      payment_pending_at: null,
      payment_received_at: null,
      payment_failed_at: null,
    };
    memoryProposals.set(publicId, row);
    pushEvent(publicId, {
      proposal_id: row.id,
      public_id: publicId,
      event_type: "created",
      from_status: null,
      to_status: "DRAFT",
      version: 1,
      actor: "admin",
      detail: {},
    });
    return clone(row);
  }

  return supabaseRpc(
    "proposal_insert",
    {
      p_public_id: publicId,
      p_business_name: fields.business_name,
      p_contact_name: fields.contact_name,
      p_contact_email: fields.contact_email,
      p_contact_phone: fields.contact_phone || null,
      p_website: fields.website || null,
      p_address: fields.address || null,
      p_hubspot_ref: fields.hubspot_ref || null,
      p_project_title: fields.project_title,
      p_scope_text: fields.scope_text,
      p_timeline_text: fields.timeline_text,
      p_terms_text: fields.terms_text,
      p_package_id: fields.package_id || null,
      p_line_items: fields.line_items,
      p_subtotal_cents: fields.subtotal_cents,
      p_deposit_cents: fields.deposit_cents,
      p_currency: fields.currency,
      p_expires_at: fields.expires_at,
      p_lead_id: fields.lead_id,
      p_notes: fields.notes || null,
    },
    opts,
  );
}

export async function getProposal(publicId, opts = {}) {
  if (!publicId) return null;
  let row;
  if (preferMemory()) {
    row = memoryProposals.get(publicId) || null;
  } else {
    row = await supabaseRpc(
      "proposal_get_by_public_id",
      { p_public_id: publicId },
      opts,
    );
  }
  if (!row) return null;
  return maybeExpire(clone(row));
}

export async function listProposals(
  { includeArchived = false } = {},
  opts = {},
) {
  if (preferMemory()) {
    const rows = [...memoryProposals.values()]
      .filter((r) => includeArchived || r.status !== "ARCHIVED")
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .map(clone);
    return rows;
  }
  const result = await supabaseRpc(
    "proposal_list",
    { p_include_archived: includeArchived },
    opts,
  );
  return Array.isArray(result) ? result : [];
}

export async function updateProposal(publicId, input, opts = {}) {
  const existing = await getProposal(publicId, opts);
  if (!existing) {
    throw Object.assign(new Error("Proposal not found."), { status: 404 });
  }
  if (!["DRAFT", "SENT", "VIEWED"].includes(existing.status)) {
    throw Object.assign(
      new Error(`Proposal is not editable in status ${existing.status}.`),
      { status: 409 },
    );
  }

  const fields = normalizeRecordInput({ ...existing, ...input });
  requireCoreFields(fields);
  const bumpVersion =
    Boolean(input.bump_version ?? input.bumpVersion) ||
    ["SENT", "VIEWED"].includes(existing.status);

  if (preferMemory()) {
    const next = {
      ...existing,
      ...fields,
      version:
        bumpVersion && existing.status !== "DRAFT"
          ? existing.version + 1
          : existing.version,
      status:
        bumpVersion && existing.status !== "DRAFT" ? "DRAFT" : existing.status,
      snapshot:
        bumpVersion && existing.status !== "DRAFT" ? null : existing.snapshot,
      sent_at:
        bumpVersion && existing.status !== "DRAFT" ? null : existing.sent_at,
      viewed_at:
        bumpVersion && existing.status !== "DRAFT" ? null : existing.viewed_at,
      updated_at: new Date().toISOString(),
    };
    memoryProposals.set(publicId, next);
    pushEvent(publicId, {
      proposal_id: next.id,
      public_id: publicId,
      event_type:
        bumpVersion && existing.status !== "DRAFT"
          ? "version_bumped"
          : "updated",
      from_status: existing.status,
      to_status: next.status,
      version: next.version,
      actor: "admin",
      detail: { bump: bumpVersion },
    });
    return clone(next);
  }

  return supabaseRpc(
    "proposal_update_draft",
    {
      p_public_id: publicId,
      p_business_name: fields.business_name,
      p_contact_name: fields.contact_name,
      p_contact_email: fields.contact_email,
      p_contact_phone: fields.contact_phone || null,
      p_website: fields.website || null,
      p_address: fields.address || null,
      p_hubspot_ref: fields.hubspot_ref || null,
      p_project_title: fields.project_title,
      p_scope_text: fields.scope_text,
      p_timeline_text: fields.timeline_text,
      p_terms_text: fields.terms_text,
      p_package_id: fields.package_id || null,
      p_line_items: fields.line_items,
      p_subtotal_cents: fields.subtotal_cents,
      p_deposit_cents: fields.deposit_cents,
      p_currency: fields.currency,
      p_expires_at: fields.expires_at,
      p_notes: fields.notes || null,
      p_bump_version: bumpVersion,
    },
    opts,
  );
}

export async function transitionProposal(
  publicId,
  {
    toStatus,
    eventType,
    actor = "system",
    detail = {},
    snapshot = null,
    acceptance = null,
    stripeCheckoutSessionId = null,
    stripePaymentIntentId = null,
  },
  opts = {},
) {
  const existing = await getProposal(publicId, opts);
  if (!existing) {
    throw Object.assign(new Error("Proposal not found."), { status: 404 });
  }

  // Apply local expiry before transition checks for SENT/VIEWED.
  let fromStatus = existing.status;
  if (existing._expired_locally && fromStatus !== "EXPIRED") {
    fromStatus = "EXPIRED";
  }

  assertTransition(fromStatus, toStatus);
  const timestampField = TIMESTAMP_FIELD[toStatus] || null;

  if (preferMemory()) {
    const next = {
      ...existing,
      status: toStatus,
      snapshot: snapshot ?? existing.snapshot,
      acceptance: acceptance ?? existing.acceptance,
      stripe_checkout_session_id:
        stripeCheckoutSessionId ?? existing.stripe_checkout_session_id,
      stripe_payment_intent_id:
        stripePaymentIntentId ?? existing.stripe_payment_intent_id,
      updated_at: new Date().toISOString(),
    };
    if (timestampField) {
      if (timestampField === "viewed_at") {
        next.viewed_at = next.viewed_at || new Date().toISOString();
      } else {
        next[timestampField] = new Date().toISOString();
      }
    }
    delete next._expired_locally;
    memoryProposals.set(publicId, next);
    pushEvent(publicId, {
      proposal_id: next.id,
      public_id: publicId,
      event_type: eventType,
      from_status: fromStatus,
      to_status: toStatus,
      version: next.version,
      actor,
      detail,
    });
    return clone(next);
  }

  return supabaseRpc(
    "proposal_transition",
    {
      p_public_id: publicId,
      p_from_statuses: [fromStatus],
      p_to_status: toStatus,
      p_event_type: eventType,
      p_actor: actor,
      p_detail: detail,
      p_snapshot: snapshot,
      p_acceptance: acceptance,
      p_stripe_checkout_session_id: stripeCheckoutSessionId,
      p_stripe_payment_intent_id: stripePaymentIntentId,
      p_timestamp_field: timestampField,
    },
    opts,
  );
}

export async function listEvents(publicId, opts = {}) {
  if (preferMemory()) {
    return clone(memoryEvents.get(publicId) || []);
  }
  const result = await supabaseRpc(
    "proposal_list_events",
    { p_public_id: publicId },
    opts,
  );
  return Array.isArray(result) ? result : [];
}

export function buildSnapshot(proposal) {
  return {
    version: proposal.version,
    business_name: proposal.business_name,
    contact_name: proposal.contact_name,
    contact_email: proposal.contact_email,
    contact_phone: proposal.contact_phone,
    website: proposal.website,
    address: proposal.address,
    hubspot_ref: proposal.hubspot_ref,
    project_title: proposal.project_title,
    scope_text: proposal.scope_text,
    timeline_text: proposal.timeline_text,
    terms_text: proposal.terms_text,
    package_id: proposal.package_id,
    line_items: proposal.line_items,
    subtotal_cents: proposal.subtotal_cents,
    deposit_cents: proposal.deposit_cents,
    currency: proposal.currency,
    expires_at: proposal.expires_at,
  };
}

export function publicProposalView(proposal) {
  if (!proposal) return null;
  const snap = proposal.snapshot || buildSnapshot(proposal);
  return {
    public_id: proposal.public_id,
    status: proposal.status,
    version: proposal.version,
    business_name: snap.business_name,
    contact_name: snap.contact_name,
    contact_email: snap.contact_email,
    project_title: snap.project_title,
    scope_text: snap.scope_text,
    timeline_text: snap.timeline_text,
    terms_text: snap.terms_text,
    package_id: snap.package_id,
    line_items: snap.line_items,
    subtotal_cents: snap.subtotal_cents,
    deposit_cents: snap.deposit_cents,
    currency: snap.currency || "usd",
    expires_at: snap.expires_at || proposal.expires_at,
    sent_at: proposal.sent_at,
    viewed_at: proposal.viewed_at,
    accepted_at: proposal.accepted_at,
    payment_pending_at: proposal.payment_pending_at,
    payment_received_at: proposal.payment_received_at,
  };
}

export function resetMemoryProposalStore() {
  memoryProposals.clear();
  memoryEvents.clear();
}

export function getMemoryProposal(publicId) {
  return memoryProposals.get(publicId) || null;
}
