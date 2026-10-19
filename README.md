# FORGE CT

A fast, accessible marketing site for **FORGE CT**, an independent web design and development practice based in Farmington, Connecticut.

The production site is [www.forge-ct.com](https://www.forge-ct.com/). The apex domain redirects permanently to the `www` hostname, which is the canonical host used by page metadata, the sitemap, crawler controls, and Stripe return URLs.

> **Which code is live.** Production is served from the **`nitro/` app** (TanStack Start, React 19, Nitro, Vercel project `forgect`, Root Directory `nitro`, framework `nitro`). Verified 2026-10-19 against the production build log for `main@b1d5733`: Vercel runs `npm run build` → `vite build` inside `nitro/`. Edit pages in `nitro/src`.

## What is in this repository root

| Area                                                            | Location                                                                       | Status                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production site                                                 | `nitro/`                                                                       | Live. See `nitro/README.md`.                                                                                                                                                                                                     |
| Certified API (inquiries, Stripe portal and webhook, proposals) | `api/`                                                                         | Source of truth; `nitro/server/core` must stay byte-identical (CI-enforced by `nitro/scripts/check-api-parity.mjs`). Retiring this duplication is an open decision, see `docs/audits/ROOT-STATIC-SITE-RETIREMENT-2026-10-19.md`. |
| Production smoke checks                                         | `scripts/smoke-production.mjs`, `docs/PRODUCTION-SMOKE.md`                     | Run by CI on every push to `main` and every six hours.                                                                                                                                                                           |
| Stripe operations                                               | `scripts/stripe-bootstrap.mjs`, `scripts/stripe-invoice.mjs`, `docs/STRIPE.md` | Operational scripts.                                                                                                                                                                                                             |
| Database migrations                                             | `sql/`                                                                         | Run in Supabase before production use.                                                                                                                                                                                           |
| The earlier static site                                         | `archive/certified-static-site/`                                               | **Not served.** Frozen on 2026-10-19 as the SEO-parity baseline that `nitro/scripts/check-build-output.mjs` reads and as rollback material. Do not edit; do not deploy.                                                          |

The sections below describe the API, payments and operations. Anything they say about `index.html`, `app.js`, `styles.css` or `vercel.json` refers to the archived static site; the live equivalents are `nitro/src`, `nitro/security-headers.ts` and `nitro/vite.config.ts`.

## Local development

Use Node.js 22 or later. The site is developed in `nitro/`:

```bash
cd nitro
npm ci
npm run dev        # http://localhost:8080
npm run check      # typecheck, lint, API parity, unit tests, build, output check
npm run test:e2e   # browser checks against the built output
```

The repository root keeps the API tests and the production smoke runner:

```bash
npm ci
npm test                         # Prettier check + API syntax and unit tests
npm run test:smoke:production    # GET-only checks against production
```

## Quality checks

`npm test` at the root runs Prettier and the certified API unit tests. `cd nitro && npm run check` and `npm run test:e2e` validate the production app. On pushes to `main`, CI additionally runs `npm run test:smoke:production`, a GET-only smoke suite against the canonical production origin and approved public client URLs. It never submits a form or creates a payment.

| Command                         | Purpose                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run format:check`          | Ensures source files follow the shared Prettier configuration (the archive is ignored).     |
| `npm run test:js`               | Syntax-checks and unit-tests the certified API and the smoke runner.                        |
| `npm run test:smoke:unit`       | Tests the production smoke runner against a local controlled server.                        |
| `npm run test:smoke:production` | Checks production routes, APIs, headers, redirects, and approved public URLs with GET only. |
| `cd nitro && npm run check`     | Typecheck, lint, API parity, unit tests, build, SEO/headers/redirect output check.          |
| `cd nitro && npm run test:e2e`  | Browser checks: forms, payments links, navigation, layout, security headers.                |

GitHub Actions runs these checks on pull requests and pushes to `main`. Branch protection is active: changes to `main` require a pull request and the passing `Validate site` and `Validate Nitro rebuild` checks before merging.

Production smoke scope, safe integration-test procedures for Resend/Stripe/Supabase,
and the current alerting limitation are documented in
[`docs/PRODUCTION-SMOKE.md`](docs/PRODUCTION-SMOKE.md).

## Content and contact updates

The inquiry form posts to `/api/contact`. Delivery uses Resend. Set these Vercel project environment variables before relying on the form in production:

- `RESEND_API_KEY` — Resend API key
- `CONTACT_TO_EMAIL` — destination inbox (currently the public address `create@forge-ct.com`)
- `CONTACT_FROM_EMAIL` — optional verified From value (example: `FORGE CT <hello@forge-ct.com>`). Until a custom domain is verified in Resend, the Resend onboarding sender is used.

The visible mailto link remains a fallback. Do not point `CONTACT_TO_EMAIL` at an address until that mailbox actually exists and receives mail.

## Internal proposals (MVP)

Forge-internal proposal flow (not a public product): admin drafts at
`/admin/proposals`, client documents at `/proposals/:id`, acceptance + Stripe
deposit Checkout, webhook payment truth.

| Piece         | Location                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| SQL migration | `sql/proposals.sql` (run in Supabase before production use)              |
| APIs          | `api/proposals.js`, `api/proposal-accept.js`, `api/proposal-checkout.js` |
| Admin UI      | `/admin/proposals` (Bearer `PROPOSAL_ADMIN_TOKEN`)                       |
| Client UI     | `/proposals/:id` (rewrite → `proposals/index.html`)                      |

Set `PROPOSAL_ADMIN_TOKEN` (16+ characters) in Vercel. Package template amounts
seed from published `/services` list prices and remain editable per proposal.
Acceptance records confirmation text + metadata; it is **not** legal e-sign.
Do not claim production COMPLETE until the SQL migration, admin token, deploy,
and a verified create→send→accept→deposit path exist.

## Payments

Payments are hosted by Stripe and reached by ordinary outbound links. Nothing on
this site collects a card, so no key, SDK, or Content Security Policy exception
is required, and the practice stays at PCI SAQ A. Two separate paths:

- **Care and Care+** — Stripe Payment Links in subscription mode, plus the Stripe
  Customer Portal so a shop can update a card or cancel without emailing anyone.
  That is what makes the "cancel anytime" promise on `/care` self-serve.
- **Website builds** — published package scope and add-ons are listed on
  `/services`. Build payments are arranged after scope is confirmed; the public
  site does not offer the retired build-deposit checkout.

`/pay` is the landing route for Care subscriptions. The destinations live in the
`PAYMENT_LINKS` object at the top of `payments.js`:

| Key        | Source                                   |
| ---------- | ---------------------------------------- |
| `care`     | Stripe Payment Link, $35/month recurring |
| `carePlus` | Stripe Payment Link, $79/month recurring |
| `portal`   | Stripe Customer Portal login link        |

These care and portal URLs are public, not secrets, so they are committed rather than read from
the environment. While a value is empty, that link falls back to the href in the
markup, which points at the inquiry form. An unconfigured button is never a dead
button. Enabling real payments is editing those strings.

The Customer Portal from a paid receipt is opened on `/thanks` by `checkout.js`
(`[data-stripe-portal]` posts to `/api/portal`). Public pages such as `/services`
and `/care` do **not** post to `/api/checkout` and do not use `[data-stripe-plan]`;
Care purchase CTAs point at `/pay` (Payment Links). Plan, environment variables,
webhook setup, and tax posture are documented in
[`docs/STRIPE.md`](docs/STRIPE.md).

### Stripe webhook fulfillment

The production webhook is live at `/api/stripe-webhook`. It verifies Stripe
signatures against the raw request body, ignores unpaid delayed-payment
checkouts, records ACH settlement timestamps, and starts the Care one-month
countdown after a settled final payment. The endpoint is registered in the live
Stripe account for checkout, PaymentIntent, subscription, and invoice events.

The same Supabase project provides the distributed fixed-window limiter used by
the public `/api/checkout` and `/api/contact` endpoints (and `/api/portal`). Run
the current `sql/stripe-webhook-events.sql` migration before deploying those
endpoints with `NODE_ENV=production`. Also run `sql/inquiry-leads.sql` so
`/api/contact` can persist durable lead rows (soft-fails until applied).

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
outcomes with the client IP but never the submitted message. Successful Resend
acceptance logs include only the provider message ID (and lead id when persisted) when
available; transport and provider failures return an explicit non-success response.
Validated inquiries are also written to a private Supabase `inquiry_leads` table when
`sql/inquiry-leads.sql` has been applied (statuses: `received` → `notified` /
`notify_failed`; audit rows set a 24h `sla_due_at`). Lead persistence soft-fails if the
migration is missing so email delivery still runs; treat `contact lead persist failed`
runtime errors as a production alert. The existing honeypot and shared IP rate limiter
remain the primary anti-abuse controls.

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
