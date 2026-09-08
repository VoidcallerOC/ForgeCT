# FORGE CT

A fast, accessible marketing site for **FORGE CT**, an independent web design and development practice based in Farmington, Connecticut.

The production site is [www.forge-ct.com](https://www.forge-ct.com/). The apex domain redirects permanently to the `www` hostname, which is the canonical host used by page metadata, the sitemap, crawler controls, and Stripe return URLs.

## What is included

The site is a dependency-light static implementation plus a small Vercel function for inquiries. It provides a responsive marketing page, a server-side inquiry form, a privacy notice, social-preview metadata, a sitemap, and crawler controls.

| Area                       | Location                                                              |
| -------------------------- | --------------------------------------------------------------------- |
| Main page                  | `index.html`                                                          |
| Shared styles              | `styles.css`                                                          |
| Inquiry form behavior      | `app.js`                                                              |
| Inquiry delivery           | `api/contact.js`                                                      |
| Payment routing            | `pay/index.html`, `payments.js`                                       |
| Privacy notice             | `privacy/index.html`                                                  |
| Social-preview image       | `images/og-image.jpg`                                                 |
| Security and cache headers | `vercel.json`                                                         |
| Quality checks             | `package.json`, `.htmlvalidate.json`, `scripts/check-local-links.mjs` |
| Continuous integration     | `.github/workflows/quality.yml`                                       |

## Local development

Use Node.js 22 or later.

```bash
npm ci
npm test
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser while the local server is running. The site has no build step; Vercel serves the tracked static files directly.

## Quality checks

`npm test` runs the release checks for formatting, HTML, links, and application
logic. CI also runs `npm run test:browser` against a local static server using
Chromium. Those browser checks intentionally cover only the business-critical
contact submission, Care/Care+ links, deposit checkout hand-off, and receipt-bound
customer portal path; they do not attempt visual regression testing.

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run format:check` | Ensures source files follow the shared Prettier configuration.    |
| `npm run lint:html`    | Detects invalid or inconsistent HTML.                             |
| `npm run test:links`   | Detects broken local routes and static assets referenced by HTML. |
| `npm run test:browser` | Exercises the contact and payment-critical flows in Chromium.     |

GitHub Actions runs these checks on pull requests and pushes to `main`. Branch protection is active: changes to `main` require a pull request and the passing `Validate site` check before merging.

## Content and contact updates

The inquiry form posts to `/api/contact`. Delivery uses Resend. Set these Vercel project environment variables before relying on the form in production:

- `RESEND_API_KEY` — Resend API key
- `CONTACT_TO_EMAIL` — destination inbox (currently the public address `create@forge-ct.com`)
- `CONTACT_FROM_EMAIL` — optional verified From value (example: `FORGE CT <hello@forge-ct.com>`). Until a custom domain is verified in Resend, the Resend onboarding sender is used.

The visible mailto link remains a fallback. Do not point `CONTACT_TO_EMAIL` at an address until that mailbox actually exists and receives mail.

## Payments

Payments are hosted by Stripe and reached by ordinary outbound links. Nothing on
this site collects a card, so no key, SDK, or Content Security Policy exception
is required, and the practice stays at PCI SAQ A. Two separate paths:

- **Care and Care+** — Stripe Payment Links in subscription mode, plus the Stripe
  Customer Portal so a shop can update a card or cancel without emailing anyone.
  That is what makes the "cancel anytime" promise on `/care` self-serve.
- **Build deposits and milestones** — Stripe Invoicing with ACH bank transfer
  enabled, sent from the dashboard. Card fees on a $6,000 deposit run into the
  low hundreds; ACH is capped at a few dollars.

`/pay` is the landing route for both. The three destinations live in the
`PAYMENT_LINKS` object at the top of `payments.js`:

| Key        | Source                                   |
| ---------- | ---------------------------------------- |
| `care`     | Stripe Payment Link, $35/month recurring |
| `carePlus` | Stripe Payment Link, $79/month recurring |
| `portal`   | Stripe Customer Portal login link        |

These are public URLs, not secrets, so they are committed rather than read from
the environment. While a value is empty, that link falls back to the href in the
markup, which points at the inquiry form — an unconfigured button is never a dead
button. Enabling real payments is editing those three strings.

### Stripe webhook fulfillment

The production webhook is live at `/api/stripe-webhook`. It verifies Stripe
signatures against the raw request body, ignores unpaid delayed-payment
checkouts, records ACH settlement timestamps, and starts the Care one-month
countdown after a settled final payment. The endpoint is registered in the live
Stripe account for checkout, PaymentIntent, subscription, and invoice events.

The same Supabase project provides the distributed fixed-window limiter used by
the public `/api/checkout` and `/api/contact` endpoints (and `/api/portal`). Run
the current `sql/stripe-webhook-events.sql` migration before deploying those
endpoints with `NODE_ENV=production`.

Two operational details remain:

- Stripe signature verification needs the raw request body. Vercel's Node runtime
  parses it first, so `api/stripe-webhook.js` opts out with
  `export const config = { api: { bodyParser: false } }` — otherwise every
  signature check fails and it reads like a bad signing secret.
- Webhook event IDs are durably claimed in Supabase through a unique primary key,
  with a five-minute processing lease and 90-day retention for completed events.
  Run `sql/stripe-webhook-events.sql` before deploying production payments and set
  both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Production fails closed if
  either value is missing; only local or explicitly opted-in test runs may use
  the in-memory fallback.

The contact endpoint accepts JSON only, rejects request bodies over 12 KiB, applies
Unicode normalization and bounded email validation, and logs validation and delivery
failures with the client IP but never the submitted message. The existing honeypot and
shared IP rate limiter remain the primary anti-abuse controls.

Embedding Stripe.js or a pricing table instead of linking out would require
adding `https://js.stripe.com` to `script-src`, adding a `frame-src`, and
reopening `payment=()` in the `Permissions-Policy` — all in `vercel.json`. That
is the cost of an embedded checkout, and the reason this site links out.

## Deployment checklist

1. Create a branch and make the required content or code changes.
2. Run `npm test` locally.
3. Review the Vercel preview at desktop and mobile widths. Confirm that the site is styled, the inquiry form posts to `/api/contact`, `/privacy`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, and `/images/og-image.jpg` return 200, and the page has the expected metadata.
4. Merge the approved change to `main` and wait for the Git-linked Vercel deployment to be READY.
5. Confirm the production alias serves the newly approved commit—not an earlier redeploy. Check the title, canonical URL, response status, security policy, form behavior, and the core routes again on production.
6. Verify that HTTPS works on both the apex and `www` hostnames, that the apex permanently redirects to `https://www.forge-ct.com`, and that mail delivery works before requesting indexing.
7. After the first real payment, confirm the Stripe delivery, Care countdown metadata,
   subscription timing, and Resend notification in the live Dashboard.

## Payments

Deposits, the Care plans, and project invoices run through Stripe. The plan,
environment variables, webhook setup, and tax posture are documented in
[`docs/STRIPE.md`](docs/STRIPE.md).

Buttons on `/services` and `/care` post to `/api/checkout`, which returns a
Stripe-hosted Checkout URL — no card data touches this origin and the Content
Security Policy is unchanged. Fulfillment runs in `api/stripe-webhook.js`, not
on the `/thanks` page.

## Privacy notice

`privacy/index.html` is a working website privacy notice based on the current implementation, which includes Vercel delivery, Google Fonts, and a server-side inquiry form. It is not legal advice. Have qualified counsel review it before relying on it, especially if the site adds analytics, advertising pixels, form processing, account features, e-commerce, or visitors in additional jurisdictions.

## Security model

The project uses a restrictive Content Security Policy that permits same-origin
scripts and local styles, the verified Vercel Insights script and endpoint, and
the Google Fonts stylesheet and font origins. It denies inline script/style
attributes, frames, media, and data-URI images. Keep application styles in
`styles.css` and JavaScript in `app.js` or `checkout.js`; do not add inline style
or script blocks without deliberately updating and validating the policy.
Production HTTPS, HSTS, frame protection, a restrictive permissions policy, and
a strict referrer policy are configured in `vercel.json`.
