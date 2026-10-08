(() => {
  "use strict";

  const TOKEN_KEY = "forge_proposal_admin_token";
  const gate = document.getElementById("gate");
  const desk = document.getElementById("desk");
  const listEl = document.getElementById("proposal-list");
  const deskError = document.getElementById("desk-error");
  const gateError = document.getElementById("gate-error");
  const packageSelect = document.getElementById("package_id");
  let templates = [];
  let current = null;

  function token() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(value) {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  }

  async function api(path, { method = "GET", body } = {}) {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token()}`,
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function showDesk(show) {
    gate.hidden = show;
    desk.hidden = !show;
  }

  function fillForm(p) {
    current = p;
    document.getElementById("public_id").value = p?.public_id || "";
    document.getElementById("status").value = p?.status || "DRAFT";
    document.getElementById("business_name").value = p?.business_name || "";
    document.getElementById("contact_name").value = p?.contact_name || "";
    document.getElementById("contact_email").value = p?.contact_email || "";
    document.getElementById("contact_phone").value = p?.contact_phone || "";
    document.getElementById("website").value = p?.website || "";
    document.getElementById("address").value = p?.address || "";
    document.getElementById("hubspot_ref").value = p?.hubspot_ref || "";
    document.getElementById("project_title").value = p?.project_title || "";
    document.getElementById("scope_text").value = p?.scope_text || "";
    document.getElementById("timeline_text").value = p?.timeline_text || "";
    document.getElementById("terms_text").value = p?.terms_text || "";
    document.getElementById("notes").value = p?.notes || "";
    document.getElementById("package_id").value = p?.package_id || "";
    document.getElementById("line_items").value = JSON.stringify(
      p?.line_items || [],
      null,
      2,
    );
    document.getElementById("money-preview").textContent = p
      ? `Subtotal ${(p.subtotal_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} · Deposit ${(p.deposit_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} · v${p.version}`
      : "";
    document.getElementById("link-out").hidden = true;
  }

  function formPayload() {
    let line_items = [];
    try {
      line_items = JSON.parse(
        document.getElementById("line_items").value || "[]",
      );
    } catch {
      throw new Error("Line items must be valid JSON.");
    }
    return {
      public_id: document.getElementById("public_id").value || undefined,
      package_id: document.getElementById("package_id").value || undefined,
      business_name: document.getElementById("business_name").value,
      contact_name: document.getElementById("contact_name").value,
      contact_email: document.getElementById("contact_email").value,
      contact_phone: document.getElementById("contact_phone").value,
      website: document.getElementById("website").value,
      address: document.getElementById("address").value,
      hubspot_ref: document.getElementById("hubspot_ref").value,
      project_title: document.getElementById("project_title").value,
      scope_text: document.getElementById("scope_text").value,
      timeline_text: document.getElementById("timeline_text").value,
      terms_text: document.getElementById("terms_text").value,
      notes: document.getElementById("notes").value,
      line_items,
    };
  }

  function renderList(proposals) {
    listEl.replaceChildren();
    proposals.forEach((p) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = `<strong>${escapeHtml(p.project_title)}</strong><span>${escapeHtml(p.business_name)} · ${escapeHtml(p.status)}</span>`;
      if (current?.public_id === p.public_id)
        btn.setAttribute("aria-current", "true");
      btn.addEventListener("click", () => openProposal(p.public_id));
      li.append(btn);
      listEl.append(li);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function refresh() {
    deskError.hidden = true;
    const data = await api("/api/proposals?include_archived=1");
    renderList(data.proposals || []);
  }

  async function openProposal(id) {
    const data = await api(`/api/proposals?id=${encodeURIComponent(id)}`);
    fillForm(data.proposal);
    await refresh();
  }

  function applyTemplate(id) {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    document.getElementById("project_title").value = template.name;
    document.getElementById("scope_text").value = template.scope_text;
    document.getElementById("timeline_text").value = template.timeline_text;
    document.getElementById("terms_text").value =
      document.getElementById("terms_text").value || "";
    document.getElementById("line_items").value = JSON.stringify(
      template.line_items,
      null,
      2,
    );
    if (!template.list_price_verified) {
      deskError.hidden = false;
      deskError.textContent = `Template "${template.name}" has UNVERIFIED list price — set unit_amount_cents before send.`;
    }
  }

  async function boot() {
    if (!token()) {
      showDesk(false);
      return;
    }
    try {
      const tpl = await api("/api/proposals?action=templates");
      templates = tpl.packages || [];
      packageSelect.replaceChildren(new Option("— custom —", ""));
      templates.forEach((t) => {
        packageSelect.append(
          new Option(
            `${t.name}${t.list_price_verified ? "" : " (UNVERIFIED price)"}`,
            t.id,
          ),
        );
      });
      if (!document.getElementById("terms_text").value) {
        document.getElementById("terms_text").value = tpl.default_terms || "";
      }
      showDesk(true);
      await refresh();
    } catch (error) {
      setToken("");
      showDesk(false);
      gateError.hidden = false;
      gateError.textContent = error.message;
    }
  }

  document.getElementById("unlock").addEventListener("click", () => {
    gateError.hidden = true;
    setToken(document.getElementById("admin-token").value.trim());
    boot();
  });

  document.getElementById("lock").addEventListener("click", () => {
    setToken("");
    current = null;
    showDesk(false);
  });

  document.getElementById("refresh").addEventListener("click", () => {
    refresh().catch((error) => {
      deskError.hidden = false;
      deskError.textContent = error.message;
    });
  });

  document.getElementById("new-proposal").addEventListener("click", () => {
    fillForm({
      status: "DRAFT",
      version: 1,
      line_items: [],
      subtotal_cents: 0,
      deposit_cents: 0,
      terms_text: document.getElementById("terms_text").value,
    });
  });

  packageSelect.addEventListener("change", () =>
    applyTemplate(packageSelect.value),
  );

  document
    .getElementById("editor")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      deskError.hidden = true;
      try {
        const payload = formPayload();
        const data = payload.public_id
          ? await api(
              `/api/proposals?id=${encodeURIComponent(payload.public_id)}`,
              {
                method: "PATCH",
                body: payload,
              },
            )
          : await api("/api/proposals", { method: "POST", body: payload });
        fillForm(data.proposal);
        await refresh();
      } catch (error) {
        deskError.hidden = false;
        deskError.textContent = error.message;
      }
    });

  document.getElementById("send").addEventListener("click", async () => {
    deskError.hidden = true;
    try {
      let payload = formPayload();
      if (!payload.public_id) {
        const created = await api("/api/proposals", {
          method: "POST",
          body: payload,
        });
        payload = { ...payload, public_id: created.proposal.public_id };
        fillForm(created.proposal);
      } else {
        const saved = await api(
          `/api/proposals?id=${encodeURIComponent(payload.public_id)}`,
          {
            method: "PATCH",
            body: payload,
          },
        );
        fillForm(saved.proposal);
      }
      const sent = await api(
        `/api/proposals?action=send&id=${encodeURIComponent(payload.public_id)}`,
        { method: "POST", body: { action: "send" } },
      );
      fillForm(sent.proposal);
      const linkOut = document.getElementById("link-out");
      linkOut.hidden = false;
      linkOut.textContent = `Client link: ${sent.link}${sent.email?.sent ? " · email queued" : ` · email: ${sent.email?.reason || "not sent"}`}`;
      await refresh();
    } catch (error) {
      deskError.hidden = false;
      deskError.textContent = error.message;
    }
  });

  document.getElementById("preview").addEventListener("click", () => {
    const id = document.getElementById("public_id").value;
    if (!id) {
      deskError.hidden = false;
      deskError.textContent = "Save the draft before preview.";
      return;
    }
    window.open(`/proposals/${encodeURIComponent(id)}`, "_blank", "noopener");
  });

  document.getElementById("duplicate").addEventListener("click", async () => {
    const id = document.getElementById("public_id").value;
    if (!id) return;
    try {
      const data = await api(
        `/api/proposals?action=duplicate&id=${encodeURIComponent(id)}`,
        {
          method: "POST",
          body: { action: "duplicate" },
        },
      );
      fillForm(data.proposal);
      await refresh();
    } catch (error) {
      deskError.hidden = false;
      deskError.textContent = error.message;
    }
  });

  document.getElementById("archive").addEventListener("click", async () => {
    const id = document.getElementById("public_id").value;
    if (!id) return;
    try {
      const data = await api(
        `/api/proposals?action=archive&id=${encodeURIComponent(id)}`,
        {
          method: "POST",
          body: { action: "archive" },
        },
      );
      fillForm(data.proposal);
      await refresh();
    } catch (error) {
      deskError.hidden = false;
      deskError.textContent = error.message;
    }
  });

  document.getElementById("reopen").addEventListener("click", async () => {
    const id = document.getElementById("public_id").value;
    if (!id) return;
    try {
      const data = await api(
        `/api/proposals?action=reopen&id=${encodeURIComponent(id)}`,
        {
          method: "POST",
          body: { action: "reopen" },
        },
      );
      fillForm(data.proposal);
      await refresh();
    } catch (error) {
      deskError.hidden = false;
      deskError.textContent = error.message;
    }
  });

  boot();
})();
