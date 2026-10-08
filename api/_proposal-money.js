/**
 * Server-side money helpers. Integer cents are the only authority.
 * Never trust client-provided subtotals or deposits.
 */

export function toCents(dollars) {
  if (typeof dollars === "number" && Number.isFinite(dollars)) {
    return Math.round(dollars * 100);
  }
  if (typeof dollars === "string" && dollars.trim()) {
    const n = Number(dollars);
    if (!Number.isFinite(n)) throw new Error("Invalid dollar amount");
    return Math.round(n * 100);
  }
  throw new Error("Invalid dollar amount");
}

export function normalizeLineItem(raw) {
  const label = String(raw?.label ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  if (!label) throw new Error("Each line item needs a label.");

  let quantity = Number(raw?.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Line item quantity must be a positive number.");
  }
  quantity = Math.round(quantity * 1000) / 1000;

  let unitAmountCents;
  if (raw?.unit_amount_cents != null) {
    unitAmountCents = Number(raw.unit_amount_cents);
  } else if (raw?.unitAmountCents != null) {
    unitAmountCents = Number(raw.unitAmountCents);
  } else if (raw?.unit_amount != null || raw?.unitAmount != null) {
    unitAmountCents = toCents(raw.unit_amount ?? raw.unitAmount);
  } else {
    throw new Error("Line item needs unit_amount_cents.");
  }
  if (!Number.isInteger(unitAmountCents) || unitAmountCents < 0) {
    throw new Error("unit_amount_cents must be a non-negative integer.");
  }

  const lineTotalCents = Math.round(quantity * unitAmountCents);
  return {
    label,
    quantity,
    unit_amount_cents: unitAmountCents,
    line_total_cents: lineTotalCents,
  };
}

export function computeTotals(
  lineItems,
  { depositPercent = 50, depositCents = null } = {},
) {
  const items = (lineItems || []).map(normalizeLineItem);
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.line_total_cents,
    0,
  );
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) {
    throw new Error("Invalid subtotal.");
  }

  let resolvedDeposit;
  if (depositCents != null && depositCents !== "") {
    resolvedDeposit = Number(depositCents);
    if (!Number.isInteger(resolvedDeposit) || resolvedDeposit < 0) {
      throw new Error("deposit_cents must be a non-negative integer.");
    }
  } else {
    const pct = Number(depositPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw new Error("depositPercent must be between 0 and 100.");
    }
    resolvedDeposit = Math.round((subtotalCents * pct) / 100);
  }

  if (resolvedDeposit > subtotalCents) {
    throw new Error("Deposit cannot exceed subtotal.");
  }

  return {
    line_items: items,
    subtotal_cents: subtotalCents,
    deposit_cents: resolvedDeposit,
  };
}

export function formatUsdFromCents(cents) {
  const n = Number(cents);
  if (!Number.isInteger(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n / 100);
}
