(() => {
  "use strict";

  // Stripe hosted destinations. Fill these in from the Stripe dashboard:
  //   care, carePlus — Payment Links created in subscription mode
  //   portal         — Customer Portal login link, for self-serve cancel and card updates
  //
  // These are public URLs, not secrets; no key ever belongs in this file. Every
  // one of them is a plain outbound link, which is why the Content Security
  // Policy in vercel.json does not need a Stripe entry. Embedding Stripe.js
  // would; that is the trade being avoided here.
  //
  // Until a value is set, its link keeps the href already in the markup, which
  // points at the inquiry form. Nothing here can ship a dead payment button.
  const PAYMENT_LINKS = {
    care: "",
    carePlus: "",
    portal: "",
  };

  document.querySelectorAll("[data-payment-link]").forEach((link) => {
    const url = PAYMENT_LINKS[link.getAttribute("data-payment-link")];
    if (!url) return;
    link.href = url;
    link.rel = "noopener";
  });
})();
