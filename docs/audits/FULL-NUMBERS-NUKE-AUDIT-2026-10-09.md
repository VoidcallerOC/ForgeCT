# Forge-CT Full Numbers Nuke Audit

**Audit date:** 2026-10-09 (UTC)  
**Auditor run:** https://cursor.com/agents/bc-01a11e3e-26fe-7b8b-ba46-7b6fe9ea8730  
**Mode:** Read-only evidence gathering (no live Stripe charges, no DB writes, no env changes, no deploys)  
**Report status:** PARTIAL — code, production deploy identity, published prices, local tests, and prior E2E evidence reconciled; live money collected, Stripe Dashboard balances, Supabase row counts, War Room MASTER board, and operating costs remain inaccessible or unverified

---

## 0. Identity established first

| Layer              | Verified fact                                  | Evidence                                                                                          |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| GitHub repo        | `VoidcallerOC/ForgeCT`, default branch `main`  | `gh api repos/VoidcallerOC/ForgeCT`                                                               |
| Local / remote SHA | `a4c470bdfac0450fc79434adce8a50f7c37d1a24`     | `git rev-parse HEAD`; matches `origin/main` after fetch                                           |
| Latest merge       | PR #153 — proposal rewrite fix                 | Git log / GH PR list                                                                              |
| Vercel project     | `forgect` (`prj_IjtNiwVFIM3UiCNfjEmpVk34alnG`) | Vercel MCP `list_projects` / `get_project`                                                        |
| Framework          | Nitro                                          | Vercel project `framework: nitro`                                                                 |
| Production deploy  | `dpl_7FkW1aXnH1TE3j4UNNdkVJrS2M91` READY       | Vercel `list_deployments` target=production                                                       |
| Production commit  | `a4c470bdfac0450fc79434adce8a50f7c37d1a24`     | Deployment meta `githubCommitSha`                                                                 |
| Canonical domain   | `https://www.forge-ct.com`                     | Domain list; apex `forge-ct.com` → 308 → www                                                      |
| War Room board     | Canonical board **not** in this repo           | `WAR-ROOM/MASTER.md` points to `VoidcallerOC/war-room` + `nicklife.xyz/war-room`                  |
| War Room access    | **BLOCKED** for this agent                     | `war-room` GitHub 404; nicklife war-room UI requires password; log API unauthorized without token |

**Do not treat** local static HTML alone as production. Production is the Nitro build on Vercel serving commit `a4c470b…`.

---

## A. Executive verdict

### Verified to work (COMPLETE for the named capability)

- Public marketing site on production (homepage, services, care, pay, audit, book, work routes) — GET smoke **20/20**.
- Published list prices on production match package templates and schema: **$750 / $1,500 / $2,500**; Care **$35/mo**; Care+ **$79/mo**.
- Proposal APIs are live on Nitro production: `/api/proposals` (401 without admin), accept/checkout POST handlers present, webhook rejects unsigned bodies (400 Invalid signature).
- Admin and client proposal shells serve HTTP 200.
- Server-side integer-cent totals (`api/_proposal-money.js`) with unit tests.
- Explicit proposal status machine with unit tests.
- Local suite: `npm test` → **43 unit tests passed**, format/HTML/links/images green.
- Prior production E2E (agent `bc-3a5bcd97…`): create → send → view → accept → Checkout session create succeeded.

### Partially implemented (PARTIAL)

- **Proposal deposit collection:** Checkout session creation works; payment + webhook → `PAYMENT_RECEIVED` not verified with a completed payment.
- **Care subscriptions:** Payment Links resolve HTTP 200; live subscription purchase / invoice / webhook fulfillment not proven in this audit.
- **Lead capture:** Code + SQL migration present; production `inquiry_leads` table application and live Resend delivery not independently verified here.
- **Tax:** `STRIPE_AUTOMATIC_TAX` unset (off) — intentional per `docs/STRIPE.md`; CT tax obligation remains an owner/accounting item.
- **Alerting / uptime:** GET smoke scheduled in GitHub Actions; no verified log-drain / payment-failure alerting.

### Blocked

- War Room / MASTER live board read & log write (private repo + auth).
- Stripe Dashboard reconciliation (balances, live vs test products, collected revenue, refunds) — no Stripe Dashboard / CLI login in this environment; secret values not decrypted.
- Supabase row counts / RPC application proof beyond prior E2E behavioral evidence.
- Operating-cost ledger (hosting invoices, AI tools, labor) — not present in ForgeCT repo; must not invent.

### Unverified

- Any **collected** revenue, MRR, ARR, pipeline $, win rate, or profit figure.
- Live Care or Care+ subscription count.
- Whether legacy deposit Stripe price env vars still map to active Dashboard products.
- Whether product tax codes are non-SaaS defaults in Stripe.
- Competitor comparison claim “$89 to $149 a month” on `/care`.
- “First month free after any build” operational fulfillment (Care trial after final invoice path exists in webhook code; not proven end-to-end).
- HubSpot / Life Tracker CRM financial dashboards (field exists on proposals; no live CRM money ledger found in this repo).

### Safe for customer-facing use?

**Numerical integrity of published list prices: sufficient** for marketing display.  
**Proposal → deposit money path: not yet safe to treat as COMPLETE production money collection.** Checkout can create **live** sessions (`cs_live_…`); abandoned-checkout restart is broken; webhook does not assert paid amount equals stored deposit; live paid E2E has not been completed. Do not report accepted proposals or Checkout starts as collected revenue.

---

## B. Complete numerical register

Legend for **Source class:** AUTH = authoritative business figure in code/config; DERIVED = computed; ILLUST = illustrative / comparison; ENG = engineering constant; UNVER = not independently verified in production provider.

| ID  | Value             | Unit               | Meaning                                | Location                                                                              | Source class             | Formula                             | Production use                        | Verification                                      | Severity               |
| --- | ----------------- | ------------------ | -------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------- | ------------------------------------- | ------------------------------------------------- | ---------------------- |
| N01 | 750               | USD                | Basic package list price               | `/services`, Nitro rate sheet, `schema/services.json`, `_proposal-packages.js` 75000¢ | AUTH                     | fixed list                          | Published + proposal template         | Prod HTML + code match                            | —                      |
| N02 | 1500              | USD                | Standard package list price            | same                                                                                  | AUTH                     | fixed list                          | Published + template                  | Prod + code match                                 | —                      |
| N03 | 2500              | USD                | Premium package list price             | same                                                                                  | AUTH                     | fixed list                          | Published + template                  | Prod + code match                                 | —                      |
| N04 | 250               | USD                | Extra-fast Basic add-on                | services / ADD_ON_LINE_ITEMS 25000¢                                                   | AUTH                     | fixed list                          | Published                             | Prod + code match                                 | —                      |
| N05 | 500               | USD                | Extra-fast Standard                    | 50000¢                                                                                | AUTH                     | fixed list                          | Published                             | Match                                             | —                      |
| N06 | 750               | USD                | Extra-fast Premium / e-commerce add-on | 75000¢                                                                                | AUTH                     | fixed list                          | Published                             | Match                                             | —                      |
| N07 | 150               | USD                | Additional page                        | 15000¢                                                                                | AUTH                     | fixed list                          | Published                             | Match                                             | —                      |
| N08 | 100               | USD                | Additional revision                    | 10000¢                                                                                | AUTH                     | fixed list                          | Published                             | Match                                             | —                      |
| N09 | 250               | USD                | Additional product (scoped)            | 25000¢                                                                                | AUTH                     | fixed list                          | Published                             | Match                                             | —                      |
| N10 | 35                | USD/mo             | Care subscription                      | `/care`, `/pay`, bootstrap 3500¢, Payment Link                                        | AUTH                     | fixed                               | Live Payment Link                     | Link HTTP 200; amount in Stripe Dashboard UNVER   | P1 if Dashboard ≠ 3500 |
| N11 | 79                | USD/mo             | Care+ subscription                     | same, 7900¢                                                                           | AUTH                     | fixed                               | Live Payment Link                     | Link HTTP 200; Dashboard UNVER                    | P1 if Dashboard ≠ 7900 |
| N12 | 50                | %                  | Default proposal deposit               | `_proposal-money.js` `depositPercent = 50`                                            | AUTH (policy default)    | `round(subtotal_cents * pct / 100)` | Server compute                        | Unit tests pass                                   | —                      |
| N13 | 75000             | cents              | Example Standard deposit               | Prior E2E + store tests                                                               | DERIVED                  | 50% of 150000                       | Used in probe                         | E2E created Checkout for 75000¢                   | —                      |
| N14 | 150000            | cents              | Example Standard subtotal              | Prior E2E                                                                             | DERIVED                  | package template                    | Probe proposal                        | E2E                                               | —                      |
| N15 | 0                 | cents              | Custom / Restoration template defaults | `_proposal-packages.js`                                                               | AUTH as “must edit”      | placeholder                         | Admin must set before send            | Flagged `list_price_verified: false`              | P2 if sent at $0       |
| N16 | 90                | days               | Webhook event retention                | `docs/STRIPE.md`, SQL comments                                                        | ENG                      | retention window                    | Supabase claim store                  | SQL presence; prod table UNVER                    | —                      |
| N17 | 10                | req/window         | Proposal accept/checkout rate limit    | `proposal-accept.js`, `proposal-checkout.js`                                          | ENG                      | fixed-window                        | Prod via Supabase RPC                 | Code + unit tests                                 | —                      |
| N18 | 60                | req/window         | Proposal view rate limit               | `proposals.js`                                                                        | ENG                      | fixed-window                        | Prod                                  | Code                                              | —                      |
| N19 | 15                | s                  | Smoke response threshold               | `PRODUCTION-SMOKE.md`                                                                 | ENG                      | threshold                           | CI smoke                              | Smoke passed                                      | —                      |
| N20 | 24                | hours              | Audit reply promise                    | Homepage / audit / landings                                                           | AUTH claim (SLA promise) | operational commitment              | Marketing                             | Operational fulfillment UNVER                     | P2                     |
| N21 | 89–149            | USD/mo             | “Typical monthly plan” comparison      | `/care`                                                                               | ILLUST                   | none                                | Marketing comparison                  | **Unsupported** competitor figure                 | P2                     |
| N22 | —                 | —                  | Collected revenue / MRR / profit       | nowhere authoritative in repo                                                         | UNVER                    | n/a                                 | No dashboard                          | **Not started / no data**                         | P1 (reporting gap)     |
| N23 | 5                 | count              | Client case-study projects shown       | Work ledger                                                                           | AUTH as portfolio count  | curated list                        | Marketing proof                       | Names/links present; not “X clients served” claim | —                      |
| N24 | 2026              | year               | Copyright year                         | Footer                                                                                | AUTH                     | calendar                            | Site                                  | Present                                           | —                      |
| N25 | 2026-07-29.dahlia | Stripe API version | `_stripe.js`                           | ENG pin                                                                               | SDK                      | Deployed code                       | Code match docs                       | —                                                 |
| N26 | 2                 | retries            | Stripe maxNetworkRetries               | `_stripe.js`                                                                          | ENG                      | SDK                                 | Deployed                              | Code                                              | —                      |
| N27 | 16                | chars min          | `PROPOSAL_ADMIN_TOKEN` length          | `_proposal-auth.js`                                                                   | ENG                      | gate                                | Prod env key present (value not read) | Env key inventory                                 | —                      |

---

## C. Discrepancy register

| ID  | Severity | Current value                                                                                         | Expected value                                                          | Evidence                                                                          | Root cause                                     | Business impact                                                                                               | Remediation                                                                                                            |
| --- | -------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| D01 | P1       | `canStartCheckout` = ACCEPTED \| PAYMENT_FAILED only                                                  | Restart allowed from PAYMENT_PENDING (or reuse open session)            | `_proposal-state.js` L76–78; UI `proposal.js` shows pay button on PAYMENT_PENDING | State gate omits abandoned Checkout            | Customer who closes Stripe cannot restart deposit; revenue stall; prior E2E left proposals in PAYMENT_PENDING | Allow PAYMENT_PENDING → new Checkout (or retrieve open session); add test; acceptance: abandoned session can pay again |
| D02 | P1       | Proposal Checkout creates `cs_live_…` in production                                                   | Test-mode E2E path available without live charge risk                   | Prior E2E agent `bc-3a5bcd97…` STATUS PARTIAL                                     | Production `STRIPE_SECRET_KEY` is live         | Cannot safely complete pay→webhook proof; risk of accidental live charge                                      | Owner configures isolated TEST path (preview env or temporary test key policy); never complete live probe Checkout     |
| D03 | P1       | Webhook marks `PAYMENT_RECEIVED` without comparing `session.amount_total` to `proposal.deposit_cents` | Paid amount must equal stored deposit (currency too)                    | `fulfillProposalDeposit` in `stripe-webhook.js`                                   | Missing assertion                              | Wrong-amount session could mark paid if metadata forged/misbuilt                                              | Reject/alert on mismatch; unit test                                                                                    |
| D04 | P1       | No collected-revenue ledger / dashboard in ForgeCT                                                    | At least Stripe-sourced paid totals + proposal `PAYMENT_RECEIVED` count | Repo search; no revenue aggregation                                               | Not built                                      | Business can confuse quoted/accepted with collected                                                           | Owner Stripe export + optional admin paid list; do not invent MRR                                                      |
| D05 | P2       | UI copy implies restart after refresh “once status allows”                                            | Status never returns to ACCEPTED automatically                          | `proposals/proposal.js` L92–97                                                    | Misleading copy + D01                          | Support load / lost deposits                                                                                  | Fix D01 + honest copy                                                                                                  |
| D06 | P2       | `SITE_URL` env not present on Vercel project                                                          | Documented as `https://www.forge-ct.com` in `docs/STRIPE.md`            | Env key inventory 2026-10-09                                                      | Relies on Host headers fallback                | Usually OK on www; preview/host spoof edge cases for success URLs                                             | Set `SITE_URL` on production                                                                                           |
| D07 | P2       | Legacy `STRIPE_PRICE_SITE_DEPOSIT` / `STRIPE_PRICE_SYSTEM_DEPOSIT` still in prod env                  | Retired per `docs/STRIPE.md`                                            | Env keys present                                                                  | Catalog drift                                  | Confusion; accidental reuse of old deposit products                                                           | Confirm unused; archive Stripe prices; remove env after owner check                                                    |
| D08 | P2       | `/care` claims “$89 to $149 a month” typical plans                                                    | UNVERIFIED                                                              | Prod `/care` + `nitro/src/routes/care.tsx`                                        | Illustrative competitor copy                   | Misleading if read as market fact                                                                             | Cite source or soften/remove                                                                                           |
| D09 | P2       | Accept does not require email == `contact_email`                                                      | Optional bind to invited contact (product decision)                     | `proposal-accept.js`                                                              | Operational acceptance design                  | Anyone with link can accept under another email                                                               | Document risk; optionally require match or magic link                                                                  |
| D10 | P2       | `GET /api/proposals?action=templates` public                                                          | Admin-only templates OR intentional public catalog                      | Production returns 200 with package cents                                         | No auth on templates action                    | Exposes internal package IDs/cents (same as public prices mostly)                                             | Gate if internal notes grow; currently low risk                                                                        |
| D11 | P2       | “First month free” marketing vs Care Payment Link immediate billing                                   | Fulfillment via final-invoice Care trial path in webhook                | Site copy + `provisionCareAfterFinalPayment`                                      | Two paths: Payment Link vs build-final invoice | Customer expectation mismatch if they buy Care from `/pay` without a build                                    | Clarify copy: free month applies after FORGE build final payment / documented path only                                |
| D12 | P3       | Static root `index.html` still mentions “3 biggest opportunities…”                                    | Nitro production uses “three practical fixes…”                          | Root `index.html` vs prod HTML                                                    | Dual stack; Nitro is prod                      | Confusion for agents reading repo root only                                                                   | Treat Nitro as prod SoT; sync or document certified-static role                                                        |
| D13 | P3       | Scorecards in `FORGE-10-10-EXECUTION-REPORT.md` (e.g. 8.5/10)                                         | Not financial metrics                                                   | Report file                                                                       | Qualitative self-score                         | Must not be treated as revenue/KPI truth                                                                      | Keep labeled as site quality score                                                                                     |

If expected value unknown: marked **UNVERIFIED** above rather than guessed.

---

## D. Revenue and payment lifecycle

| Stage                             | Status                   | Evidence                                                | Break / leak points                                               |
| --------------------------------- | ------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------- |
| 1. Prospective                    | PARTIAL                  | Audit/book/contact forms; leads SQL                     | Lead table application & delivery UNVERIFIED here                 |
| 2. Quoted                         | PARTIAL                  | Admin proposals + templates                             | Zero-price UNVERIFIED templates can be sent if admin ignores flag |
| 3. Accepted contract value        | PARTIAL                  | Accept API + confirmation phrase; **not** legal e-sign  | Email not bound to contact; acceptance ≠ payment                  |
| 4. Checkout initiated             | PARTIAL                  | Checkout API + prior E2E `PAYMENT_PENDING` + `cs_live_` | Restart blocked (D01); live mode blocks safe E2E (D02)            |
| 5. Payment authorized/processing  | UNVERIFIED / NOT STARTED | No completed payment in this audit                      | Delayed methods gated on `payment_status` in webhook (good)       |
| 6. Payment successfully collected | UNVERIFIED / NOT STARTED | No Stripe Dashboard totals; E2E stopped before pay      | Do not count Checkout create as collected                         |
| 7. Refunded / disputed            | NOT STARTED              | No refund/dispute handlers found for proposals          | Exposure unmodeled                                                |
| 8. Recognized revenue             | NOT STARTED              | No accounting system in repo                            | —                                                                 |
| 9. Gross/net profit               | BLOCKED                  | No cost ledger                                          | —                                                                 |

**Care path (separate from proposals):** Payment Links in `payments.js` → Stripe-hosted Checkout → webhook fulfillment / notifications. Build packages are **not** sold via public Checkout; remaining balances via `scripts/stripe-invoice.mjs` (owner-run).

**Prior E2E truth (reconcile, do not redo live pay):** create/send/view/accept/checkout-create COMPLETE; payment/webhook `PAYMENT_RECEIVED` NOT STARTED; session was **live** (`cs_live_`).

---

## E. Pricing and cost model

### Verified pricing inputs (as of 2026-10-09)

| Offer                      | Amount                 | Authoritative surface                                         |
| -------------------------- | ---------------------- | ------------------------------------------------------------- |
| Basic / Standard / Premium | $750 / $1,500 / $2,500 | Production pages + `schema/services.json` + package templates |
| Add-ons                    | see N04–N09            | `/services` + `ADD_ON_LINE_ITEMS`                             |
| Deposit default            | 50% of subtotal        | `_proposal-money.computeTotals`                               |
| Care / Care+               | $35 / $79 per month    | `/care`, `/pay`, bootstrap catalog                            |

**Proposal total formula (server):**

```
line_total_cents = round(quantity * unit_amount_cents)
subtotal_cents   = sum(line_total_cents)
deposit_cents    = depositCents ?? round(subtotal_cents * depositPercent / 100)
```

Checkout charges **deposit_cents only** via `price_data.unit_amount` (not client-submitted totals).

### Cost model

| Input                    | Status       | Notes                                                          |
| ------------------------ | ------------ | -------------------------------------------------------------- |
| Vercel hosting           | UNVERIFIED $ | Project exists; invoice amounts not available                  |
| Supabase / Postgres      | UNVERIFIED $ | Env integration present                                        |
| Domains (`forge-ct.com`) | UNVERIFIED $ | Verified on project; renewal cost unknown                      |
| Stripe fees              | UNVERIFIED $ | Standard Stripe fee schedule not measured against Forge volume |
| Resend                   | UNVERIFIED $ | Key present                                                    |
| AI / Cursor / labor      | NOT IN SCOPE | Do not pull personal finances into Forge ledger                |
| Monthly fixed opex       | BLOCKED      | Missing invoices                                               |
| Variable cost / project  | BLOCKED      | Missing labor time + infra allocation                          |
| Break-even project count | BLOCKED      | Requires opex + margin inputs                                  |

**Partial formula skeleton (inputs missing):**

```
monthly_fixed = sum(verified_recurring_invoices)   # MISSING
gross_margin_offer = list_price - variable_cost_offer  # variable_cost MISSING
break_even_projects = ceil(monthly_fixed / contribution_per_project)  # MISSING
```

Calculation date: 2026-10-09 — **no numeric opex result claimed**.

---

## F. Marketing-claim verification

| Claim                                 | Published?                                           | Where                           | Evidence support                                                                         | Current?         | Reproducible?     | Overclaim risk                              |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- | ---------------- | ----------------- | ------------------------------------------- |
| Packages $750 / $1,500 / $2,500       | Yes                                                  | `/`, `/services`, SEO           | Matches templates/schema                                                                 | Yes              | Yes               | Low                                         |
| Care $35 / Care+ $79                  | Yes                                                  | `/care`, `/pay`                 | Matches bootstrap amounts; Stripe Dashboard amount UNVER                                 | Yes on site      | Link resolves     | Medium until Dashboard confirm              |
| Packages from $750                    | Yes                                                  | meta / schema `priceRange`      | Consistent                                                                               | Yes              | Yes               | Low                                         |
| Three practical fixes within 24 hours | Yes                                                  | Audit CTAs                      | Operational SLA; fulfillment rate UNVER                                                  | Yes              | Process UNVER     | Medium                                      |
| First month free after any build      | Yes                                                  | `/`, `/care`, schema Care offer | Webhook trial after final invoice exists in code; Payment Link path may bill immediately | Partial          | Code yes; live no | **High** if `/pay` buyers expect free month |
| $89–$149 typical monthly plan         | Yes                                                  | `/care` compare                 | No source cited                                                                          | UNVER            | No                | Medium                                      |
| Live client work (named shops)        | Yes                                                  | Work ledger                     | External sites linked; case studies avoid revenue metrics                                | Yes as portfolio | Visit URLs        | Low if not overstated as outcomes           |
| Conversion / ranking / revenue lift   | No material invented claims found on prod rate sheet | —                               | Deliberately avoided in prior 10/10 work                                                 | —                | —                 | Keep                                        |

---

## G. Data and calculation integrity

| Area                    | Finding                                                                   | Status                                                                        |
| ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Money authority         | Integer cents server-side; client totals ignored on create/update         | COMPLETE (code)                                                               |
| Status machine          | Explicit transitions; PAYMENT_RECEIVED terminal except archive            | COMPLETE (code)                                                               |
| Webhook payment truth   | Success URL `?paid=1` does not set paid; UI warns to wait for webhook     | COMPLETE (design)                                                             |
| Amount reconciliation   | No `amount_total` vs `deposit_cents` check                                | PARTIAL / gap D03                                                             |
| Idempotency             | Webhook event claim store + Care subscription idempotency key             | COMPLETE (code); prod store UNVER                                             |
| Unpaid delayed Checkout | Skips fulfillment when `payment_status === unpaid`                        | COMPLETE (code + unit test)                                                   |
| Proposal public access  | Knowledge of `public_id` is the capability (unguessable id)               | PARTIAL (by design)                                                           |
| Demo vs prod data       | Memory store only when env/test; production fails closed without Supabase | COMPLETE (code)                                                               |
| Revenue dashboards      | None                                                                      | NOT STARTED                                                                   |
| Double-count risk       | No aggregation UI; risk low today                                         | N/A                                                                           |
| RLS                     | SQL enables RLS; access via security-definer RPCs + service role          | Schema present; live policies UNVER                                           |
| Dual stack              | Certified static `api/` mirrored in `nitro/server/core/`                  | PARTIAL — parity tests exist in Nitro tooling; this audit ran root `npm test` |

---

## H. Test evidence

| Command                                        | Result                                                                                | Notes                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm ci`                                       | OK                                                                                    | Dev deps installed in audit VM                                                                  |
| `npm test`                                     | **PASS** — Prettier, html-validate, links (22 HTML), images (6), **43/43** unit tests | 2026-10-09                                                                                      |
| `npm run test:smoke:production`                | **PASS** — 20 checks, 0 failures                                                      | GET-only against `www.forge-ct.com`                                                             |
| `npm run test:browser` / Nitro `npm run check` | **SKIPPED**                                                                           | Not required for numerical register; Playwright browsers may be heavy; root suite already green |
| Stripe live charge                             | **NOT RUN**                                                                           | Forbidden by audit rules; prior E2E stopped at `cs_live_`                                       |
| Stripe Dashboard / bootstrap against live key  | **SKIPPED**                                                                           | No authorized key material in shell                                                             |
| Supabase SQL Editor inspection                 | **SKIPPED**                                                                           | No console access                                                                               |

Unit coverage present: money, state, store happy path, accept, webhook unpaid/ACH/idempotency helpers, leads, rate limit, smoke unit.  
Missing coverage (gap): PAYMENT_PENDING checkout restart, amount_total mismatch rejection, tax/discount (N/A — no discount engine), revenue aggregation, timezone dashboard boundaries.

---

## I. Prioritized remediation plan

### P0 — immediate production risk

_None newly proven as active security exploit with customer fund loss in this read-only pass._  
Closest P0-adjacent: **do not complete** any outstanding live probe Checkout sessions; treat live key usage in “test” E2E as an operational hazard (see D02).

### P1 — trust / revenue collection

1. **Fix abandoned Checkout restart (D01)** — repo `ForgeCT`; `_proposal-state.js` + checkout handler + UI; test: PAYMENT_PENDING can create/resume Checkout; acceptance: customer can pay after closing Stripe.
2. **Complete TEST-mode deposit E2E to `PAYMENT_RECEIVED` (D02)** — owner Stripe TEST config; then webhook verify; acceptance: one TEST payment flips status; no live card.
3. **Assert webhook amount == deposit (D03)** — `stripe-webhook.js` / Nitro mirror; test mismatch rejected; acceptance: underpay cannot mark paid.
4. **Establish collected-revenue truth process (D04)** — Stripe Dashboard export + proposal `PAYMENT_RECEIVED` count; acceptance: weekly number with source links, labeled collected vs quoted.

### P2

5. Set `SITE_URL` (D06).
6. Retire/confirm legacy deposit price envs (D07).
7. Fix or source competitor $89–$149 claim (D08).
8. Clarify “first month free” vs `/pay` Payment Link (D11).
9. Confirm `sql/inquiry-leads.sql` applied if still open from prior P0/P1 pass.
10. Soft-bind acceptance email (D09) if threat model requires.

### P3

11. Align static root copy with Nitro or document dual-stack SoT (D12).
12. Gate templates endpoint if needed (D10).

### P4

Do **not** start polish while P1 payment integrity items remain open.

---

## J. Final truth ledger

| Item                                                                           | Status                                                |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Repo + production deploy identity (`a4c470b` / `dpl_7FkW1aXn…` / www)          | COMPLETE                                              |
| Published package & Care list prices consistency (site ↔ templates ↔ schema) | COMPLETE                                              |
| Proposal APIs wired on Nitro production                                        | COMPLETE                                              |
| Server-side cent math + state machine (code + unit tests)                      | COMPLETE                                              |
| Local `npm test` (43) + production GET smoke (20)                              | COMPLETE                                              |
| Proposal create→accept→Checkout session (prior E2E)                            | PARTIAL                                               |
| Proposal payment collected + `PAYMENT_RECEIVED`                                | NOT STARTED (safe proof)                              |
| Care live subscription purchase proof                                          | UNVERIFIED                                            |
| Stripe Dashboard revenue / product amount audit                                | BLOCKED / UNVERIFIED                                  |
| Tax registration & automatic tax                                               | PARTIAL (off by design)                               |
| Operating cost / margin / break-even                                           | BLOCKED                                               |
| Revenue/CRM dashboards                                                         | NOT STARTED                                           |
| War Room MASTER live board read                                                | BLOCKED                                               |
| Full Numbers Nuke prior duplicate report                                       | NOT STARTED previously — **this report is the first** |

### Highest-priority next action (single)

**Owner: configure a Stripe TEST path for proposal deposits, cancel/ignore any live probe Checkout sessions, then re-run accept→Checkout→TEST pay→webhook until proposal status is `PAYMENT_RECEIVED` — and ship D01 (PAYMENT_PENDING restart) before inviting real customers to self-serve deposits.**

---

## System inventory (discovered)

| System                       | Source of truth                               | Status            | Production identity                                                     | Quantitative outputs             | Dependencies                                     |
| ---------------------------- | --------------------------------------------- | ----------------- | ----------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| Marketing site (Nitro)       | `VoidcallerOC/ForgeCT` + Vercel `forgect`     | COMPLETE          | `www.forge-ct.com` @ `a4c470b`                                          | Prices N01–N11                   | Vercel                                           |
| Proposal admin/client        | `api/*proposal*`, `nitro/public/**/proposals` | PARTIAL           | Routes live; money E2E incomplete                                       | deposit/subtotal cents           | Supabase, Stripe, Resend, `PROPOSAL_ADMIN_TOKEN` |
| Stripe Care links            | `payments.js`                                 | PARTIAL           | Links HTTP 200                                                          | $35 / $79                        | Stripe live                                      |
| Stripe webhook               | `api/stripe-webhook.js`                       | PARTIAL           | Endpoint rejects bad sig                                                | fulfillment events               | `STRIPE_WEBHOOK_SECRET`, Supabase                |
| Supabase                     | SQL in `sql/` + Vercel env                    | PARTIAL           | Env keys present; schema apply UNVER except prior proposal E2E behavior | leads, proposals, webhook events | Service role                                     |
| Invoice script               | `scripts/stripe-invoice.mjs`                  | UNVERIFIED        | Owner-run                                                               | final balances                   | Stripe key                                       |
| Analytics                    | Vercel Analytics / Speed Insights             | PARTIAL           | Scripts on prod HTML                                                    | traffic UNVER                    | Vercel                                           |
| War Room                     | External `war-room` + nicklife                | BLOCKED           | —                                                                       | priorities                       | Auth                                             |
| Life Tracker / HubSpot money | External / field only                         | NOT STARTED       | `hubspot_ref` column                                                    | —                                | —                                                |
| Client sites                 | External URLs in work ledger                  | COMPLETE as links | listed domains                                                          | no Forge revenue figures         | —                                                |

### Env keys present (names only — values not disclosed)

`PROPOSAL_ADMIN_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CARE`, `STRIPE_PRICE_CARE_PLUS`, `STRIPE_PRICE_SITE_DEPOSIT` (legacy), `STRIPE_PRICE_SYSTEM_DEPOSIT` (legacy), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, related Supabase/Postgres keys, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.

**Documented but absent:** `SITE_URL`, `STRIPE_AUTOMATIC_TAX` (absence of tax flag = tax off — OK).

---

## Related prior work (reconcile, do not duplicate)

- `docs/FORGE-10-10-EXECUTION-REPORT.md` — conversion/UX; **not** a money ledger.
- `docs/STRIPE.md` — integration design + go-live checklist.
- Proposal MVP PRs #151–#153 + E2E agent `bc-3a5bcd97…` — lifecycle PARTIAL at live Checkout.
- No prior `FULL-NUMBERS-NUKE` report found in repo `docs/`.

---

## War Room log payload (for authorized poster)

See agent final response for curl. Status **PARTIAL**. Do not claim log updated unless API returns success.
