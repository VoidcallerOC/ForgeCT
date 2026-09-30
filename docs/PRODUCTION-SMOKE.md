# Production smoke coverage

ForgeCT has a deterministic, **GET-only** production smoke runner at
`scripts/smoke-production.mjs`.

## What it checks

The runner checks the canonical production origin (`https://www.forge-ct.com` by
default) for:

- HTTP status and redirect chain
- response time (15-second default threshold)
- canonical URL on Forge pages
- required security headers: CSP, HSTS, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`
- expected HTML markers
- the required Forge routes: `/`, `/audit`, `/services`, `/care`, `/contact`,
  `/book`, `/connecticut-web-design`, `/hartford-web-design`, and `/work`
- all four Forge portfolio case-study routes
- safe `GET` behavior for `/api/contact`, `/api/checkout`, `/api/portal`, and
  `/api/stripe-webhook` (expected `405` with `Allow: POST`)
- the approved live client URLs currently linked by the Forge portfolio:
  `thousandsunnytcg.com`, `mjvideogames.com`, and `hardhittincardshop.com`

The runner never sends `POST`, submits a form, follows a payment link, creates a
Stripe object, or writes customer data. It follows only HTTP redirects returned
by the requested `GET`.

## Commands

```bash
npm run test:smoke:unit
npm run test:smoke:production
```

Optional environment variables:

- `SMOKE_BASE_URL` — override the Forge origin for controlled verification
- `SMOKE_TIMEOUT_MS` — per-request timeout, default `15000`
- `SMOKE_MAX_MS` — response-time threshold, default `5000`
- `SMOKE_JSON=1` — emit machine-readable JSON for CI artifacts

CI runs production smoke after the existing quality and browser checks, only on a
push to `main`. Pull requests continue to use local, mocked browser flows and do
not call production.

## Controlled integration tests

These are separate from the automatic smoke suite and require an explicit owner,
provider, and test-mode approval before execution.

### Resend

Use a provider-supported test or sandbox recipient and a synthetic message that
cannot be mistaken for a customer inquiry. Confirm the exact destination and
sender domain first. Verify the provider acceptance response and the controlled
mailbox receipt, then remove or retain the test message according to the mailbox
owner's policy. Never use a real customer address or submit a production form as a
health check.

### Stripe

Use Stripe test mode and Stripe test prices/customers only. Exercise Checkout,
Customer Portal, and webhook handling with test objects and signed test events.
Verify idempotency/replay behavior and fulfillment in a test database or isolated
namespace. Never use live mode, real payment methods, real customer data, or a
production charge for monitoring.

### Supabase

Use a dedicated test project or isolated test schema. Apply the migration there,
run bounded test inserts/reads for webhook deduplication and rate limiting, and
clean up synthetic rows after verification. Never run test writes against the
production project unless the owner has explicitly approved the exact synthetic
records and cleanup plan.

## Alerting status

No uptime/error alert provider or owner is established in the current evidence.
This phase adds CI detection only; it does not silently create a new alerting
integration. Establish an owner, provider, notification destination, retention,
and escalation policy before adding automated alerts.
