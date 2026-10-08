const memoryLeads = new Map();

function storageConfig() {
  return {
    url: (process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

function useMemoryStore() {
  return (
    process.env.LEAD_STORE === "memory" || process.env.NODE_ENV !== "production"
  );
}

function hasDurableStorage() {
  const { url, key } = storageConfig();
  return Boolean(url && key);
}

function leadStoreDisabled() {
  return process.env.LEAD_STORE === "off";
}

async function supabaseRpc(
  functionName,
  body,
  { fetchImpl = globalThis.fetch } = {},
) {
  const { url, key } = storageConfig();
  if (!url || !key) {
    throw new Error(
      "Durable lead storage is not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("Fetch is unavailable for durable lead storage");
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
      `Supabase lead storage responded ${response.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`,
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

/**
 * Persist a validated inquiry before email delivery. Soft-fails in production when
 * storage is unavailable so Resend delivery is not blocked by an unmigrated table;
 * callers must log the failure and rely on alerting.
 */
export async function createInquiryLead(
  {
    source = "unknown",
    name,
    email,
    company = "",
    siteUrl = "",
    message = "",
    slaHours = null,
  },
  { fetchImpl = globalThis.fetch } = {},
) {
  if (leadStoreDisabled()) return null;

  if (
    useMemoryStore() &&
    !hasDurableStorage() &&
    !storageConfig().url &&
    !storageConfig().key
  ) {
    const id = `mem_${memoryLeads.size + 1}`;
    memoryLeads.set(id, {
      id,
      status: "received",
      source,
      name,
      email,
      company,
      siteUrl,
      message,
      slaHours,
    });
    return id;
  }

  const result = await supabaseRpc(
    "insert_inquiry_lead",
    {
      p_source: source,
      p_name: name,
      p_email: email,
      p_company: company || null,
      p_site_url: siteUrl || null,
      p_message: message || null,
      p_sla_hours: slaHours,
    },
    { fetchImpl },
  );
  if (typeof result === "string") return result;
  if (result && typeof result === "object" && typeof result.id === "string") {
    return result.id;
  }
  return result == null ? null : String(result);
}

export async function markInquiryLeadDelivery(
  leadId,
  { status, providerMessageId = "" },
  { fetchImpl = globalThis.fetch } = {},
) {
  if (!leadId || leadStoreDisabled()) return;

  if (
    useMemoryStore() &&
    !hasDurableStorage() &&
    !storageConfig().url &&
    !storageConfig().key
  ) {
    const record = memoryLeads.get(leadId);
    if (record) {
      record.status = status;
      record.providerMessageId = providerMessageId || "";
    }
    return;
  }

  await supabaseRpc(
    "update_inquiry_lead_delivery",
    {
      p_lead_id: leadId,
      p_status: status,
      p_provider_message_id: providerMessageId || null,
    },
    { fetchImpl },
  );
}

export function resetMemoryLeadStore() {
  memoryLeads.clear();
}

export function getMemoryLead(leadId) {
  return memoryLeads.get(leadId) || null;
}
