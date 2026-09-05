# SousaSaaS

A fast, accessible marketing site for **SousaSaaS**, an independent web design and development practice based in Farmington, Connecticut.

The live project is currently served at [sousasaas.vercel.app](https://sousasaas.vercel.app/). The `sousasaas.com` custom domain has not been configured for this repository; do not add it to canonical tags, sitemap URLs, Open Graph metadata, or email addresses until DNS, hosting, and the mailbox are confirmed.

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

`npm test` runs three release checks:

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run format:check` | Ensures source files follow the shared Prettier configuration.    |
| `npm run lint:html`    | Detects invalid or inconsistent HTML.                             |
| `npm run test:links`   | Detects broken local routes and static assets referenced by HTML. |

GitHub Actions runs these checks on pull requests and pushes to `main`. Branch protection is active: changes to `main` require a pull request and the passing `Validate site` check before merging.

## Content and contact updates

The inquiry form posts to `/api/contact`. Delivery uses Resend. Set these Vercel project environment variables before relying on the form in production:

- `RESEND_API_KEY` — Resend API key
- `CONTACT_TO_EMAIL` — destination inbox (currently the public address `Create@Forge-CT.com`)
- `CONTACT_FROM_EMAIL` — optional verified From value (example: `SousaSaaS <hello@your-domain.com>`). Until a custom domain is verified in Resend, the Resend onboarding sender is used.

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

### If a webhook is added later

Nothing in this project needs one today: there is no database and no client
accounts, so there is no payment state to record. If that changes, two things in
this stack will bite:

- Stripe signature verification needs the raw request body. Vercel's Node runtime
  parses it first, so the function must opt out with
  `export const config = { api: { bodyParser: false } }` — otherwise every
  signature check fails and it reads like a bad signing secret.
- The in-memory rate-limit map in `api/contact.js` does not survive across
  serverless instances. It is adequate spam friction on a contact form; do not
  reuse that pattern for anything financial.

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
6. If a custom domain is later configured, update the canonical tag, Open Graph URLs, sitemap, `robots.txt`, contact email address, and this README in the same pull request. Verify HTTPS, both apex and `www` redirect behavior, and mail delivery before requesting indexing.

## Privacy notice

`privacy/index.html` is a working website privacy notice based on the current implementation, which includes Vercel delivery, Google Fonts, and a server-side inquiry form. It is not legal advice. Have qualified counsel review it before relying on it, especially if the site adds analytics, advertising pixels, form processing, account features, e-commerce, or visitors in additional jurisdictions.

## Security model

The project uses a restrictive Content Security Policy that permits only same-origin scripts and local styles, plus the Google Fonts stylesheet and font origins. Keep application styles in `styles.css` and JavaScript in `app.js`; do not add inline style or script blocks without deliberately updating and validating the policy. Production HTTPS, HSTS, frame protection, a restrictive permissions policy, and a strict referrer policy are configured in `vercel.json`.
