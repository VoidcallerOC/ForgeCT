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
  const PAYMENT_LINKS = {
    care: "https://buy.stripe.com/4gMbJ30Cc07sd525Mt5EY06",
    carePlus: "https://buy.stripe.com/4gM9AV84Ef2m4yw3El5EY07",
    portal: "https://billing.stripe.com/p/login/14A00l1Gg2fAaWUcaR5EY00",
  };

  // The page ships written for the unconfigured state: buttons ask about a
  // plan, and the copy says an invoice comes by hand. Setting a URL above
  // upgrades that link and swaps in the wording that promises checkout, so the
  // page never claims a payment path it does not have. Both states are in the
  // markup, so this holds with JavaScript disabled too.
  document.querySelectorAll("[data-payment-link]").forEach((link) => {
    const url = PAYMENT_LINKS[link.getAttribute("data-payment-link")];
    if (!url) return;
    link.href = url;
    link.rel = "noopener";
    const label = link.getAttribute("data-payment-label");
    if (label) link.textContent = label;
  });

  document.querySelectorAll("[data-payment-when]").forEach((element) => {
    const [key, state] = element.getAttribute("data-payment-when").split(":");
    const configured = Boolean(PAYMENT_LINKS[key]);
    element.hidden = state === "set" ? !configured : configured;
  });
})();
