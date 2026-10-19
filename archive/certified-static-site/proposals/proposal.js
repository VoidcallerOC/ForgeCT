(() => {
  "use strict";

  const CONFIRMATION =
    "I confirm I have reviewed this proposal and accept the stated scope, timeline, and pricing for this version.";

  const loading = document.getElementById("proposal-loading");
  const errorEl = document.getElementById("proposal-error");
  const statusEl = document.getElementById("proposal-status");
  const doc = document.getElementById("proposal-doc");
  const actions = document.getElementById("proposal-actions");
  const pay = document.getElementById("proposal-pay");
  const done = document.getElementById("proposal-done");

  let proposal = null;

  function publicIdFromPath() {
    const parts = location.pathname.replace(/\/+$/, "").split("/");
    const idx = parts.indexOf("proposals");
    if (idx === -1) return "";
    return decodeURIComponent(parts[idx + 1] || "").trim();
  }

  function money(cents) {
    if (!Number.isInteger(cents)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }

  function showError(message) {
    loading.hidden = true;
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function setStatus(status) {
    statusEl.hidden = false;
    statusEl.textContent = status.replaceAll("_", " ");
  }

  function render(p) {
    proposal = p;
    loading.hidden = true;
    doc.hidden = false;
    setStatus(p.status);
    document.title = `${p.project_title} — FORGE CT proposal`;
    document.getElementById("proposal-title").textContent = p.project_title;
    document.getElementById("proposal-client").textContent =
      `${p.business_name} · prepared for ${p.contact_name}`;
    document.getElementById("proposal-meta").textContent =
      `Version ${p.version}${p.expires_at ? ` · Expires ${new Date(p.expires_at).toLocaleDateString()}` : ""}`;
    document.getElementById("proposal-scope").textContent = p.scope_text || "—";
    document.getElementById("proposal-timeline").textContent =
      p.timeline_text || "—";
    document.getElementById("proposal-terms").textContent = p.terms_text || "—";
    document.getElementById("proposal-subtotal").textContent = money(
      p.subtotal_cents,
    );
    document.getElementById("proposal-deposit").textContent = money(
      p.deposit_cents,
    );

    const lines = document.getElementById("proposal-lines");
    lines.replaceChildren();
    (p.line_items || []).forEach((item) => {
      const tr = document.createElement("tr");
      const label = document.createElement("td");
      label.textContent = item.label;
      const qty = document.createElement("td");
      qty.textContent = String(item.quantity);
      const amount = document.createElement("td");
      amount.textContent = money(
        item.line_total_cents ?? item.unit_amount_cents,
      );
      tr.append(label, qty, amount);
      lines.append(tr);
    });

    document.getElementById("accept-name").value = p.contact_name || "";
    document.getElementById("accept-email").value = p.contact_email || "";

    actions.hidden = true;
    pay.hidden = true;
    done.hidden = true;

    if (p.status === "SENT" || p.status === "VIEWED") {
      actions.hidden = false;
    } else if (p.status === "ACCEPTED" || p.status === "PAYMENT_FAILED") {
      pay.hidden = false;
    } else if (p.status === "PAYMENT_PENDING") {
      done.hidden = false;
      document.getElementById("done-title").textContent = "Deposit pending";
      document.getElementById("done-body").textContent =
        "Stripe checkout was started. If you closed the window, you can start deposit checkout again from this page after refresh once status allows — or email create@forge-ct.com.";
      pay.hidden = false;
    } else if (p.status === "PAYMENT_RECEIVED") {
      done.hidden = false;
      document.getElementById("done-title").textContent = "Deposit received";
      document.getElementById("done-body").textContent =
        "Payment is confirmed via Stripe. FORGE will follow up with project handoff and production next steps.";
    } else if (p.status === "EXPIRED" || p.status === "DECLINED") {
      done.hidden = false;
      document.getElementById("done-title").textContent = p.status;
      document.getElementById("done-body").textContent =
        "This proposal is no longer open for acceptance. Contact FORGE if you still want to move forward.";
    }

    const params = new URLSearchParams(location.search);
    if (params.get("paid") === "1" && p.status !== "PAYMENT_RECEIVED") {
      document.getElementById("done-body").textContent =
        "Thanks — if Stripe confirmed payment, status will update when the webhook settles (usually seconds). Refresh shortly.";
      done.hidden = false;
    }
  }

  async function load() {
    const id = publicIdFromPath();
    if (!id || id === "index.html") {
      showError("Missing proposal link. Ask FORGE for your proposal URL.");
      return;
    }
    try {
      const res = await fetch(`/api/proposals?id=${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showError(data.error || "Proposal not found.");
        return;
      }
      render(data.proposal);
    } catch {
      showError("Could not load this proposal. Try again shortly.");
    }
  }

  document
    .getElementById("accept-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const err = document.getElementById("accept-error");
      err.hidden = true;
      const confirmed = document.getElementById("accept-confirm").checked;
      if (!confirmed) {
        err.hidden = false;
        err.textContent = "Please confirm acceptance.";
        return;
      }
      const submit = document.getElementById("accept-submit");
      submit.disabled = true;
      try {
        const res = await fetch("/api/proposal-accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            public_id: proposal.public_id,
            name: document.getElementById("accept-name").value,
            email: document.getElementById("accept-email").value,
            version: proposal.version,
            confirmation: CONFIRMATION,
            website: event.target.website.value,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          err.hidden = false;
          err.textContent = data.error || "Acceptance failed.";
          submit.disabled = false;
          return;
        }
        await load();
      } catch {
        err.hidden = false;
        err.textContent = "Acceptance failed. Try again.";
        submit.disabled = false;
      }
    });

  document.getElementById("pay-button").addEventListener("click", async () => {
    const err = document.getElementById("pay-error");
    err.hidden = true;
    const button = document.getElementById("pay-button");
    button.disabled = true;
    try {
      const res = await fetch("/api/proposal-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ public_id: proposal.public_id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.checkout_url) {
        err.hidden = false;
        err.textContent = data.error || "Could not start Stripe checkout.";
        button.disabled = false;
        return;
      }
      location.href = data.checkout_url;
    } catch {
      err.hidden = false;
      err.textContent = "Could not start Stripe checkout.";
      button.disabled = false;
    }
  });

  load();
})();
