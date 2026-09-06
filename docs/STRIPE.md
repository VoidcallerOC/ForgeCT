# Stripe integration — FORGE CT

How forge-ct.com takes money: **Payments** for deposits, **Billing** for the Care
plans, **Invoicing** for project balances that are quoted rather than listed.

Built against Stripe API version `2026-07-29.dahlia` with the Node SDK (`stripe`
v22).

## What maps to what

| On the site                       | Stripe product | Mechanism                                         |
| --------------------------------- | -------------- | ------------------------------------------------- |
| Local Business Site — from $2,000 | Payments       | Checkout Session, `mode: "payment"` — first half  |
| Site and System — from $6,000     | Payments       | Checkout Session, `mode: "payment"` — first third |
| Care — $35/mo                     | Billing        | Checkout Session, `mode: "subscription"`          |
| Care+ — $79/mo                    | Billing        | Checkout Session, `mode: "subscription"`          |
| Later installments                | Invoicing      | `scripts/stripe-invoice.mjs --lookup …`           |
| Card change, receipts, cancel     | Billing        | Customer Portal, from `/thanks`                   |

## Installments

The published prices are floors ("from $2,000"), so the site sells only the
**first** installment. Everything after it goes out as an invoice, once scope is
settled and the real number is known.

| Build               | Total  | Split                           |
| ------------------- | ------ | ------------------------------- |
| Local Business Site | $2,000 | halves — deposit, final         |
| Site and System     | $6,000 | thirds — deposit, build, launch |

The installment amounts live in two constants at the top of
`scripts/stripe-bootstrap.mjs` (`SITE_INSTALLMENT`, `SYSTEM_INSTALLMENT`). **The
catalog and the services page have to agree.** If a Site and System build is
really $9,000, change `SYSTEM_INSTALLMENT` to `300000` and change the "from
$6,000" copy on `/services` in the same commit.

Each installment is its own Stripe **Product**, because Checkout and invoices
print the product name on the line item. A shop that clicks "Start Care" should
get a receipt that says Care — not a shared or generic product name.

## Care starts after launch

Deposit Checkout asks the customer to choose Care or Care+. The choice is stored
on the Stripe Customer when the deposit settles. The webhook provisions no
subscription at that point. When the final invoice is paid (`forge_site_final`
or `forge_system_launch`), the webhook creates the selected subscription with a
one-month trial ending one month after Stripe's settlement event timestamp.
For ACH, the handler consumes `payment_intent.succeeded`—Stripe emits it after
the bank settles the debit—and records `care_payment_settled_at` and
`care_countdown_ends_at` on the Customer and subscription metadata.
The first Care charge therefore follows the final build payment, which is the
launch event. ACH and other delayed payment methods cannot provision Care early:
the handler ignores unpaid Checkout completions and waits for the asynchronous
settlement event. Subscription creation is keyed by final invoice and plan so
Stripe retries cannot create a duplicate subscription.

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

2. **Reconcile the catalog** against a test key first:

   ```sh
   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs          # report only
   STRIPE_SECRET_KEY=rk_test_… node scripts/stripe-bootstrap.mjs --apply
   ```

   The script **adopts products that already exist**, including ones created by
   hand in the Dashboard. It matches on a metadata tag, then the canonical name,
   then any known former name (`Website Maintenance` → `Care`,
   `Site - First Deposit` → `Local Business Site — deposit`, and so on), then
   renames and re-describes what it finds. Re-running is safe and it never
   creates a duplicate of a product it can recognise.

   Read the dry run before applying. It reports three things worth acting on:
   active products it did not claim (archive the duplicates), prices at the
   wrong amount (Stripe prices are immutable, so it creates the right one and
   names the old price for you to archive), and unset tax codes.

   It prints the four `STRIPE_PRICE_*` values the site needs, plus the lookup
   keys for the installments that are invoiced later.

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

## Known limits and hardening backlog

- **Portal access is receipt-bound.** The site has no accounts, so `/api/portal`
  trades a `cs_…` session id for a portal link. The id is unguessable and scoped
  to one customer, but if real logins arrive, resolve the customer from the
  session instead.
- **Replay guard is in-memory.** `api/stripe-webhook.js` dedupes event ids per
  warm instance. Stripe-side idempotency and the final-invoice lookup protect
  the Care subscription side effect, but move event processing records to
  durable storage before payment volume grows or additional non-repeatable
  fulfillment is added.
- **Rate limiting is per-instance.** Same reason; it blunts casual abuse, and
  Stripe's own limits and Radar are the real backstop.

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
- The services page and `SYSTEM_INSTALLMENT` agree on what a Site and System costs.
- The deposit descriptions say whether a deposit is refundable. That sentence is
  the one people look for, and burying it costs the dispute later.
- The privacy notice covers payments — it currently reads as though the site has
  no e-commerce.
- Complete one controlled real-payment lifecycle with an approved customer,
  then verify the Stripe delivery, Care countdown metadata, subscription timing,
  and Resend notification. Do not use a real charge solely as a technical test.
- Add durable webhook-event storage before transaction volume increases.
