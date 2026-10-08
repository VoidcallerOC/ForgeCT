/**
 * Explicit proposal status machine. Impossible transitions throw.
 */

export const STATUSES = Object.freeze([
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "EXPIRED",
  "DECLINED",
  "ARCHIVED",
  "PAYMENT_PENDING",
  "PAYMENT_RECEIVED",
  "PAYMENT_FAILED",
]);

/** from → allowed next statuses */
export const TRANSITIONS = Object.freeze({
  DRAFT: ["SENT", "ARCHIVED"],
  SENT: ["VIEWED", "ACCEPTED", "DECLINED", "EXPIRED", "ARCHIVED", "DRAFT"],
  VIEWED: ["ACCEPTED", "DECLINED", "EXPIRED", "ARCHIVED", "DRAFT"],
  // PAYMENT_RECEIVED from ACCEPTED covers webhook races if checkout session
  // settled before PAYMENT_PENDING was persisted.
  ACCEPTED: ["PAYMENT_PENDING", "PAYMENT_RECEIVED", "ARCHIVED"],
  PAYMENT_PENDING: ["PAYMENT_RECEIVED", "PAYMENT_FAILED", "ARCHIVED"],
  PAYMENT_FAILED: ["PAYMENT_PENDING", "PAYMENT_RECEIVED", "ARCHIVED"],
  PAYMENT_RECEIVED: ["ARCHIVED"],
  DECLINED: ["ARCHIVED", "DRAFT"],
  EXPIRED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT"],
});

export const TIMESTAMP_FIELD = Object.freeze({
  SENT: "sent_at",
  VIEWED: "viewed_at",
  ACCEPTED: "accepted_at",
  DECLINED: "declined_at",
  EXPIRED: null,
  ARCHIVED: "archived_at",
  PAYMENT_PENDING: "payment_pending_at",
  PAYMENT_RECEIVED: "payment_received_at",
  PAYMENT_FAILED: "payment_failed_at",
  DRAFT: null,
});

export function assertTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus];
  if (!allowed || !allowed.includes(toStatus)) {
    const err = new Error(
      `Invalid proposal transition from ${fromStatus} to ${toStatus}.`,
    );
    err.code = "INVALID_TRANSITION";
    throw err;
  }
  return true;
}

export function isPubliclyViewable(status) {
  return [
    "SENT",
    "VIEWED",
    "ACCEPTED",
    "EXPIRED",
    "DECLINED",
    "PAYMENT_PENDING",
    "PAYMENT_RECEIVED",
    "PAYMENT_FAILED",
  ].includes(status);
}

export function canAccept(status) {
  return status === "SENT" || status === "VIEWED";
}

export function canStartCheckout(status) {
  return status === "ACCEPTED" || status === "PAYMENT_FAILED";
}

export function maybeExpire(proposal, now = new Date()) {
  if (!proposal?.expires_at) return proposal;
  if (!["SENT", "VIEWED"].includes(proposal.status)) return proposal;
  const expires = new Date(proposal.expires_at);
  if (Number.isNaN(expires.getTime())) return proposal;
  if (expires.getTime() > now.getTime()) return proposal;
  return { ...proposal, status: "EXPIRED", _expired_locally: true };
}
