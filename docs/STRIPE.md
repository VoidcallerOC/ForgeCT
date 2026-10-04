# Stripe integration — FORGE CT

Current site payments: **Billing** for Care plans; build packages are scoped on
`/services`, then payment is arranged by invoice. The site does not offer a build
deposit Checkout.

Built against Stripe API version `2026-07-29.dahlia` with the Node SDK (`stripe`
v22).

## What maps to what

| On the site                       | Stripe product | Mechanism                                           |
| --------------------------------- | -------------- | --------------------------------------------------- |
| Basic, Standard, Premium packages | —              | Published on `/services`; build payment after scope |
| Package add-ons                   | —              | Published on `/services`; scoped with the project   |
| Care, $35/mo                      | Care           | Stripe Payment Link in subscription mode            |
| Care+, $79/mo                     | Care+          | Stripe Payment Link in subscription mode            |
| Card change, receipts, cancel     | Billing        | Customer Portal, from `/thanks`                     |

Build package and add-on prices are authoritative on `/services`. The public site
does not expose build-deposit checkout; build payments are arranged after scope
is confirmed. Do not use the old deposit products or saved build Payment Links as
current package prices.

## Legacy build deposits

Historical deposit Checkout IDs and invoice lookup keys are not part of the
current bootstrap catalog and are not linked from the public site. The webhook
can continue to process previously created sessions, and the invoice script
retains legacy lookup keys for already-agreed project balances. The bootstrap
script now manages only Care and Care+; do not add build products or enable build
Checkout without an agreed payment schedule and matching Stripe prices.

Each separately invoiced service should have a distinct Stripe **Product**, so
the invoice line item identifies the work the customer agreed to.

## Historical build Checkout fulfillment

Previously created build Checkout sessions may still deliver webhook events.
The webhook continues to honor their existing metadata so an in-flight historical
project can finish fulfillment; this does not make retired deposit products
available for new purchases. Care and Care+ are now purchased through their
subscription links, and webhook idempotency and delayed-payment handling remain
in place for historical sessions.

## Files

| Path                           | Role                                                                  |
| ------------------------------ | --------------------------------------------------------------------- |
| `api/_stripe.js`               | `StripeClient` singleton, current Care checkout catalog, tax switch   |
| `api/_ratelimit.js`            | Per-instance request throttle shared by the endpoints                 |
| `api/portal.js`                | `POST` → Customer Portal session                                      |
| `api/stripe-webhook.js`        | Signature-verified event handler; **this is where fulfillment lives** |
| `checkout.js`                  | Client script that binds `[data-stripe-portal]` on `/thanks`          |
| `thanks/index.html`            | Success page; hosts the "Open billing" button                         |
| `scripts/stripe-bootstrap.mjs` | Reconciles Care products and prices                                   |
| `scripts/stripe-invoice.mjs`   | Sends a scoped project invoice; supports legacy lookup keys           |

## Setup

1. **Create a restricted key.** Dashboard → Developers → API keys → _Create
   restricted key_ (`rk_…`). Grant write on Customers, Products, Prices,
   Subscriptions, Invoices, and Billing Portal; leave everything else at
   _None_. Use a restricted key rather than `sk_…` so a leak from the
   deployment cannot move money out or read the whole account.

2. **Reconcile the catalog** against a test key first:

   ```sh
   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs          # report only
   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs --apply
   ```

   The script **adopts products that already exist**, including ones created by
   hand in the Dashboard. It matches on a metadata tag, then the canonical name,
   then the known former name (`Website Maintenance` → `Care`), then renames and
   re-describes what it finds. Re-running is safe and it never creates a
   duplicate of a product it can recognise.

   Read the dry run before applying. It reports three things worth acting on:
   active products it did not claim (archive the duplicates), prices at the
   wrong amount (Stripe prices are immutable, so it creates the right one and
   names the old price for you to archive), and unset tax codes.

   The bootstrap manages Care and Care+ only. Build package prices are published
   on `/services` and invoiced after scope is agreed; they are not managed in
   Stripe Checkout.

3. **Set the environment** (Vercel → Project → Settings → Environment Variables):

   | Variable                    | Notes                                          |
   | --------------------------- | ---------------------------------------------- |
   | `STRIPE_SECRET_KEY`         | The `rk_…` key                                 |
   | `STRIPE_WEBHOOK_SECRET`     | `whsec_…` from step 4                          |
   | `STRIPE_PRICE_CARE`         | from bootstrap                                 |
   | `STRIPE_PRICE_CARE_PLUS`    | from bootstrap                                 |
   | `SITE_URL`                  | `https://www.forge-ct.com`                     |
   | `STRIPE_AUTOMATIC_TAX`      | leave unset — see **Tax**                      |
   | `RESEND_API_KEY`            | already set; the webhook reuses it for notices |
   | `SUPABASE_URL`              | Supabase project URL for webhook event storage |
   | `SUPABASE_SERVICE_ROLE_KEY` | server-only Supabase service-role key          |

   Keys belong in the platform's environment store, never in the repo. Nothing
   here is a `NEXT_PUBLIC_`-style client value — the browser only ever talks to
   `/api/*` on this origin.

4. **Register the webhook.** Dashboard → Developers → Webhooks → endpoint
   `https://www.forge-ct.com/api/stripe-webhook`, subscribed to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
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
- `payment_intent.succeeded` is the settlement-level signal for ACH Direct Debit.
  The handler uses the event's `created` timestamp—not Checkout creation time—to
  start the one-month Care countdown.
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

**Check the product tax codes before anything else.** Products created in the
Dashboard default to _Software as a service (SaaS)_, which is wrong for custom
build work and wrong for a monthly care plan; those are treated differently from
SaaS in several states. It costs nothing while Stripe Tax is off, and mis-rates
every invoice the day it is switched on. Set each product's tax code in the
Dashboard (Product catalog → product → Tax code), confirm the choice with an
accountant, then pin the codes in the `TAX_CODE` constant in
`scripts/stripe-bootstrap.mjs` so later runs keep them.

`STRIPE_AUTOMATIC_TAX` is deliberately **off**. Enabling `automatic_tax` without
an active tax registration is the most common Stripe Tax mistake: Stripe
calculates and collects nothing, returns no error, and the Dashboard reads as
though tax is handled. Register first (Dashboard → Tax → Registrations), confirm
CT is active, then set `STRIPE_AUTOMATIC_TAX=true` — the portal
endpoint and the invoice script read that one switch. See
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

## Known limits and hardening backlog

- **Portal access is receipt-bound.** The site has no accounts, so `/api/portal`
  trades a `cs_…` session id for a portal link. The id is unguessable and scoped
  to one customer, but if real logins arrive, resolve the customer from the
  session instead.
- **Replay records expire after 90 days.** Run
  `sql/stripe-webhook-events.sql` in the Supabase SQL Editor. The webhook
  atomically claims event ids through Supabase RPC functions, keeps a five-minute
  processing lease for crash recovery, and retains successful event markers for
  90 days. Production fails closed if the Supabase variables are missing; local
  tests may explicitly use `WEBHOOK_EVENT_STORE=memory`.
- **Rate limiting uses Supabase in production.** Run the current
  `sql/stripe-webhook-events.sql` to create the shared atomic fixed-window
  counter. `/api/contact` and `/api/portal` use the existing
  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` variables. Local and test
  environments use an in-memory fallback; production returns a temporary
  unavailable response rather than silently falling back to per-instance
  protection if Supabase is unavailable.

## Production status and remaining checks

The live restricted key, catalog, webhook endpoint, signing secret, and Vercel
deployment are configured. The endpoint is active at
`https://www.forge-ct.com/api/stripe-webhook` and listens for nine events,
including `payment_intent.succeeded` for ACH settlement.

Before treating payments as fully proven, run through
<https://docs.stripe.com/get-started/checklist/go-live.md> and complete the
following owner/accounting checks:

Also settle these before the first real charge:

- Product tax codes are not the SaaS default (see **Tax**).
- The public website does not enable build Checkout. Re-enable only after an agreed payment schedule and current Stripe products/prices are configured.
- The deposit descriptions say whether a deposit is refundable. That sentence is
  the one people look for, and burying it costs the dispute later.
- The privacy notice covers payments — it currently reads as though the site has
  no e-commerce.
- Complete one controlled real-payment lifecycle with an approved customer,
  then verify the Stripe delivery, Care countdown metadata, subscription timing,
  and Resend notification. Do not use a real charge solely as a technical test.
- Keep the durable webhook store variables configured and monitor storage
  errors before transaction volume increases.
