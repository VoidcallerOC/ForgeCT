# Stripe integration — FORGE CT

How forge-ct.com takes money: **Payments** for deposits, **Billing** for the Care
plans, **Invoicing** for project balances that are quoted rather than listed.

Built against Stripe API version `2026-07-29.dahlia` with the Node SDK (`stripe`
v22).

## What maps to what

| On the site                       | Stripe product | Mechanism                                            |
| --------------------------------- | -------------- | ---------------------------------------------------- |
| Local Business Site — from $2,000 | Payments       | Checkout Session, `mode: "payment"` — $1,000 deposit |
| Site and System — from $6,000     | Payments       | Checkout Session, `mode: "payment"` — $3,000 deposit |
| Care — $35/mo                     | Billing        | Checkout Session, `mode: "subscription"`             |
| Care+ — $79/mo                    | Billing        | Checkout Session, `mode: "subscription"`             |
| Project balance after launch      | Invoicing      | `scripts/stripe-invoice.mjs`                         |
| Card change, receipts, cancel     | Billing        | Customer Portal, from `/thanks`                      |

The published prices are floors ("from $2,000"), so the site sells a **fixed
deposit** and the balance goes out as an invoice once scope is settled. That
keeps a real number on the page — the thing the services page promises — without
pretending every shop costs the same.

Each plan is its own Stripe **Product**. Checkout and invoice line items print
the product name, so sharing one product across tiers would make every receipt
read the same.

## Files

| Path                           | Role                                                                  |
| ------------------------------ | --------------------------------------------------------------------- |
| `api/_stripe.js`               | `StripeClient` singleton, plan catalog, tax switch                    |
| `api/_ratelimit.js`            | Per-instance request throttle shared by the endpoints                 |
| `api/checkout.js`              | `POST` → Checkout Session → hosted Stripe page                        |
| `api/portal.js`                | `POST` → Customer Portal session                                      |
| `api/stripe-webhook.js`        | Signature-verified event handler; **this is where fulfillment lives** |
| `checkout.js`                  | Client script that binds `[data-stripe-plan]` buttons                 |
| `thanks/index.html`            | Success page; hosts the "Open billing" button                         |
| `scripts/stripe-bootstrap.mjs` | Creates products and prices, prints the env vars                      |
| `scripts/stripe-invoice.mjs`   | Sends a project invoice                                               |

## Setup

1. **Create a restricted key.** Dashboard → Developers → API keys → _Create
   restricted key_ (`rk_…`). Grant write on Checkout Sessions, Customers,
   Products, Prices, Subscriptions, Invoices, and Billing Portal; leave
   everything else at _None_. Use a restricted key rather than `sk_…` so a leak
   from the deployment cannot move money out or read the whole account.

2. **Create the catalog** against a test key first:

   ```sh
   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs          # dry run
   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs --apply
   ```

   It prints the four `STRIPE_PRICE_*` values. Re-running is safe — it matches
   on `lookup_key` before creating anything.

3. **Set the environment** (Vercel → Project → Settings → Environment Variables):

   | Variable                      | Notes                                          |
   | ----------------------------- | ---------------------------------------------- |
   | `STRIPE_SECRET_KEY`           | The `rk_…` key                                 |
   | `STRIPE_WEBHOOK_SECRET`       | `whsec_…` from step 4                          |
   | `STRIPE_PRICE_CARE`           | from bootstrap                                 |
   | `STRIPE_PRICE_CARE_PLUS`      | from bootstrap                                 |
   | `STRIPE_PRICE_SITE_DEPOSIT`   | from bootstrap                                 |
   | `STRIPE_PRICE_SYSTEM_DEPOSIT` | from bootstrap                                 |
   | `SITE_URL`                    | `https://www.forge-ct.com`                     |
   | `STRIPE_AUTOMATIC_TAX`        | leave unset — see **Tax**                      |
   | `RESEND_API_KEY`              | already set; the webhook reuses it for notices |

   Keys belong in the platform's environment store, never in the repo. Nothing
   here is a `NEXT_PUBLIC_`-style client value — the browser only ever talks to
   `/api/*` on this origin.

4. **Register the webhook.** Dashboard → Developers → Webhooks → endpoint
   `https://www.forge-ct.com/api/stripe-webhook`, subscribed to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `customer.subscription.created` / `.updated` / `.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. **Turn on the Customer Portal** at Dashboard → Settings → Billing → Customer
   portal: allow payment-method updates, invoice history, and cancellation.

6. **Enable payment methods** at Settings → Payment methods. The code never
   passes `payment_method_types`, so Stripe shows each shop the methods most
   likely to convert and the set is changed from the Dashboard with no deploy.

## Fulfillment happens in the webhook, not on `/thanks`

A shop can pay and then lose signal before the success page loads. Anything that
only runs on `/thanks` silently drops that sale. So `/thanks` is a receipt page
and nothing else; the notification email fires from `api/stripe-webhook.js`.

Two details that matter there:

- `checkout.session.completed` arrives **while the session is still unpaid** for
  delayed-notification methods (bank debits). The handler skips those and waits
  for `checkout.session.async_payment_succeeded`.
- The handler returns non-2xx on failure so Stripe retries with backoff, and
  never acts on a body whose signature did not verify.

## Testing

```sh
npm i -g @stripe/cli   # or: brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook   # prints a whsec_ for local use
stripe trigger checkout.session.completed
```

Test cards: `4242 4242 4242 4242` succeeds, `4000 0000 0000 9995` is declined for
insufficient funds, `4000 0025 0000 3155` forces 3DS. Any future expiry, any CVC.
The plugin's `/test-cards` command has the full list.

Run the site's own checks before deploying: `npm test`.

## Tax

Connecticut taxes computer and data processing services, and FORGE sells to
Connecticut shops — so this is a live question, not a someday one.

`STRIPE_AUTOMATIC_TAX` is deliberately **off**. Enabling `automatic_tax` without
an active tax registration is the most common Stripe Tax mistake: Stripe
calculates and collects nothing, returns no error, and the Dashboard reads as
though tax is handled. Register first (Dashboard → Tax → Registrations), confirm
CT is active, then set `STRIPE_AUTOMATIC_TAX=true` — both the Checkout endpoints
and the invoice script read that one switch. See
<https://docs.stripe.com/billing/taxes/collect-taxes.md>.

## Content Security Policy

`vercel.json` keeps `script-src 'self'` and `connect-src 'self'`. Nothing here
loosens it: the browser fetches only same-origin `/api/*` and is then redirected
to a Stripe-hosted page, so no Stripe script runs on this origin and no card data
touches it.

If the site ever moves to an embedded Payment Element, that changes — it needs
`https://js.stripe.com` in `script-src`, `https://api.stripe.com` in
`connect-src`, `frame-src https://js.stripe.com`, and the current
`Permissions-Policy: payment=()` header would have to allow `payment=(self)` for
Apple Pay and Google Pay.

## Known limits

- **Portal access is receipt-bound.** The site has no accounts, so `/api/portal`
  trades a `cs_…` session id for a portal link. The id is unguessable and scoped
  to one customer, but if real logins arrive, resolve the customer from the
  session instead.
- **Replay guard is in-memory.** `api/stripe-webhook.js` dedupes event ids per
  warm instance. Every side effect today is an email, so a duplicate is noise —
  move the guard to durable storage before adding fulfillment that is not safe
  to repeat.
- **Rate limiting is per-instance.** Same reason; it blunts casual abuse, and
  Stripe's own limits and Radar are the real backstop.

## Before going live

Run through <https://docs.stripe.com/get-started/checklist/go-live.md>. The
short version for this site: swap the test key for a live `rk_…`, create the
catalog again in live mode (the price IDs differ), register the live webhook and
store its own `whsec_…`, and put one real card through Care and refund it.
