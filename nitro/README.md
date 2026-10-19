# FORGE CT — Nitro rebuild

A ground-up rebuild of [www.forge-ct.com](https://www.forge-ct.com/) on the Forge Nitro stack: TanStack Start, React 19, Tailwind 4 and Nitro v3, built for Vercel.

**This is production.** Vercel project `forgect` builds this folder (Root Directory `nitro`, framework `nitro`) and serves www.forge-ct.com from it; verified 2026-10-19 against the production deployment of `main@09e3c88`. The earlier static site is archived at `../archive/certified-static-site` (not served) and remains only as the SEO-parity baseline for `scripts/check-build-output.mjs`; `../api` is still the certified API source that `scripts/check-api-parity.mjs` compares against.

## Run

```bash
cd nitro
npm ci
npm run dev        # http://localhost:8080
npm run check      # typecheck, lint, API parity, API unit tests, build, SEO parity
npm run test:e2e   # browser checks against the built output (run after check/build)
node scripts/serve-output.mjs   # serve .vercel/output locally, the way Vercel routes it
```

## What carries over from the certified site, and how

| Baseline | Where it lives here | Guard |
|---|---|---|
| Business facts, prices, add-ons, Care | `src/lib/site.ts` | e2e checks prices and Stripe links |
| Portfolio taxonomy: 5 live clients (4 card and tabletop, 1 retail and local) and 1 lab build | `src/lib/work.ts` | e2e checks filters and allowed outbound URLs |
| Titles, descriptions, canonicals, robots, Open Graph | `src/lib/seo.ts` | `scripts/check-build-output.mjs` compares the build with the archived certified HTML |
| JSON-LD | `src/lib/structured-data.ts` (same as the certified pages) | same check, byte-for-byte JSON |
| Sitemap, robots, favicon, OG image, client screenshots | `public/` | output check |
| `/api/contact`, `/api/portal`, `/api/stripe-webhook`, `/api/proposals`, `/api/proposal-accept`, `/api/proposal-checkout` | `server/core/` (exact copies of `../api`), run through `src/lib/node-handler.ts` + `src/routes/api/*` | `npm run test:parity` fails if a file drifts; the certified unit tests run here too |
| `/admin/proposals`, `/proposals/:id` | Static shells in `public/` (CSP-safe; no Google Fonts); rewrite in `vite.config.ts` | Production root is this Nitro app — root `admin/`/`proposals/` alone are not served |
| Form payload `{ name, email, company, siteUrl, message, website }` | `src/components/inquiry-form.tsx` | e2e checks the exact payload |
| Security headers, apex → www 308 | `security-headers.ts`, `vite.config.ts` → `.vercel/output/config.json` | output check and e2e |
| Vercel Analytics events (`landing_page_view`, `lead_form_success`, `data-track`) | `src/lib/analytics.ts`, `__root.tsx` | — |

Every page is prerendered to static HTML. Only `/api/*` and unknown URLs (404) reach the function.

### Intentional differences

- Fonts are self-hosted (`@fontsource`). Google Fonts and jsDelivr are no longer allowed by the CSP, and the privacy notice no longer mentions Google Fonts.
- `/audit` and `/contact` now have meta descriptions. The certified pages had none. Both are written only from claims already on those pages.
- `schema/services.json` is rendered into the HTML on the server. The certified site injected it with JavaScript.
- `/pay` renders only the configured Stripe state, because all three links are configured.
- Visible text is restructured. The facts are the same. No new outcomes, metrics, years or client names.

## Design

**Rule: reuse the engine, recombine the components, reinvent the composition.**

- **Engine (reused from `captital-bail`/`UpScale`):** Vite and TanStack Start config, the router, `nitro({ preset: "vercel" })`, the ESLint setup, and the pattern of keeping facts in a single file.
- **Composition (new):** the site is built around the *parking-lot test*. A local business site gets judged on a phone, in seconds.
  - Home: hero, then a **phone rail** showing the live client sites, then the four questions a customer asks, then the **Audit Ticket** (with a 24h stub), then who builds it and the towns the live sites are in, then the **proof deck** and **work ledger** (a filterable table, with the lab build set apart), then the **rate sheet** (packages as one spec table), then the audit-first next step.
  - Brand: the forge-ct.com brand, unchanged. Void `#0a0a0a` and charcoal `#1a1c1f` surfaces, fog `#e6e6e6` text, slate `#8a9099` for eyebrows and actions, DM Sans (self-hosted), and the FORGE-CT wordmark image (`public/brand/forge-ct-wordmark.png`, the same file as `/brand/DTsjw.png`). The rebuild is monochrome, as the live site is.
  - Labels, plates, ticket numbers and stamps are set in JetBrains Mono (self-hosted, latin subset, about 40 KB): the inspection-record voice of the Audit Ticket, carried through the spec plates and table headers.
  - **The Audit Ticket** (`src/components/audit-ticket.tsx`) is the one light "paper" object on the site: the FIND / MISS / FORGE / NEXT record with a perforated 24h stub. The homepage shows the empty ticket (what each line covers); `/audit` shows a filled sample stamped ILLUSTRATIVE for a fictional shop, then the intake form framed as the counterfoil. Nothing on it is scored, verified or issued automatically.
  - There is no decorative background. The ambient starfield canvas was removed in the 2026-10-19 anti-AI audit (`docs/audits/ANTI-AI-AUDIT-2026-10-19.md`): it was the kind of ornament any agency template ships, and it cost a 30 fps canvas on every page.

### Differentiation check

| | Bonds (`captital-bail`) | Certified Forge-CT | This rebuild |
|---|---|---|---|
| Hero | Dark split: headline + "have this ready" facts card | Dark text hero + stat counters + marquee | Headline over a rail of real client phones |
| Navigation | Sticky header, full-screen mobile menu, sticky call bar | Anchor nav to homepage sections | Static masthead; page nav; scrollable nav strip on mobile, no hamburger |
| Proof | 3-item "what to expect" strip | Filterable image cards | Ledger table (client / town / what it does / links) |
| Pricing | None | Cards + JS package picker | Single comparison table (rate sheet) |
| Process | Dark numbered steps | Five-step "Discover → Launch" | Four customer questions (Q1–Q4) |
| Type / colour | DM Sans, purple, offset shadows | forge-ct.com brand: DM Sans, void/charcoal/fog/slate | Same forge-ct.com brand (brand is kept; layout is new) |
| Interaction | Call-first | Cursor spotlight, magnetic buttons, marquee | No decorative JS or canvas. One filter, forms only |

## Cutover checklist

Items 1–7 are done: the project is live on this folder. The root static site was archived on 2026-10-19 (`../archive/certified-static-site`). The remaining part of item 8, retiring `../api` in favour of `server/core` and removing the parity script, is a deliberate decision for Nick: see `../docs/audits/ROOT-STATIC-SITE-RETIREMENT-2026-10-19.md`.

1. Create a Vercel project from this repository with **Root Directory `nitro`**. Nitro is auto-detected and `npm run build` writes `.vercel/output`. Do not add a repo-root `.vercelignore` that lists `nitro`: Vercel applies the repo-root ignore file even when Root Directory is `nitro`, and it strips the whole app before the build.
2. Copy the production environment variables: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CARE`, `STRIPE_PRICE_CARE_PLUS`, `STRIPE_AUTOMATIC_TAX`, `SITE_URL`.
3. Review the preview deployment on a real phone and on desktop. Submit one real inquiry and confirm it arrives in the inbox. Confirm `/_vercel/speed-insights/script.js` and analytics load.
4. Confirm the apex redirect keeps query strings on Vercel. This is not verifiable locally. If it does not, move the apex → www redirect to Vercel Domains settings.
5. Stripe: point a **test-mode** webhook at the preview `/api/stripe-webhook` and send a test event. Repoint the live webhook only at the domain switch.
6. Have counsel review the privacy notice edit, then set its effective date.
7. Move the domain, run `npm run test:smoke:production` from the repo root against production, and keep the old project deployable for rollback.
8. After cutover: retire `../api` (keep `server/core` as canonical) and remove the parity script.
