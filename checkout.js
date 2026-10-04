/* FORGE CT — Stripe Customer Portal hand-off.
   The thanks/ page posts to a same-origin function, then sends the shop to
   Stripe-hosted billing. Care purchases use Payment Links (payments.js).
   No card data ever touches this site. */
(() => {
  "use strict";

  const FALLBACK =
    "Could not open billing. Email create@forge-ct.com.";

  function setStatus(button, message) {
    const target = document.getElementById(
      button.getAttribute("aria-describedby") || "",
    );
    if (target) {
      target.textContent = message;
    }
  }

  async function post(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.error || FALLBACK);
    }
    return result.url;
  }

  function bind(selector, handler) {
    for (const button of document.querySelectorAll(selector)) {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        button.disabled = true;
        setStatus(button, "Opening secure billing…");
        try {
          window.location.assign(await handler(button));
        } catch (error) {
          setStatus(button, error.message || FALLBACK);
          button.disabled = false;
        }
      });
    }
  }

  bind("[data-stripe-portal]", () => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    if (!sessionId) {
      throw new Error(
        "Open this from the link in your receipt, or email create@forge-ct.com.",
      );
    }
    return post("/api/portal", { session_id: sessionId });
  });

  // The portal button only makes sense when a receipt id is in the URL.
  if (!new URLSearchParams(window.location.search).get("session_id")) {
    for (const button of document.querySelectorAll("[data-stripe-portal]")) {
      button.hidden = true;
    }
  }
})();
