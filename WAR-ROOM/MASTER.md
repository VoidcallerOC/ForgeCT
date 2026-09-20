# MASTER.md — Forge CT War Room

Updated: 2026-09-20 (chat-verified + ChatGPT memory + Claude memory).
PR: https://github.com/VoidcallerOC/ForgeCT/pull/103

## Law
Never invent COMPLETE.
Status only: COMPLETE | PARTIAL | BLOCKED | UNVERIFIED | NOT STARTED.
Sources of truth:
- GitHub = code, commits, branches, PRs
- Vercel = deployments / builds
- Production = user-facing behavior
- nicklife.xyz = clients / pipeline / money board + War Room Log (when verified)
- MASTER.md = priorities, dependencies, blockers, ownership, next actions
- DB/API = live data

Conflict order: production, then repo, then deploy, then DB/API, then verified agent evidence, then docs, then older notes, then assumptions.

Every meaningful task ends with HANDOFF.
One concrete NEXT ACTION.
P0 to P2 before P4 polish.

### Handoff template
```
HANDOFF
STATUS:
TASK:
WHAT WAS VERIFIED:
WHAT CHANGED:
EVIDENCE:
WHAT REMAINS UNVERIFIED:
BLOCKERS:
DO NOT REDO:
NEXT ACTION:
OTHER AGENTS / DEPENDENCIES:
```

## Who Nick is (ops)
- Nicholas (Nick) Sousa / SmokeyNS. Farmington, CT.
- Day job: DQR Aerospace Inspector at Polamer Precision (Farmington); title is inspector not instructor.
- Forge-CT / FORGE (rebranded from SousaSaaS): freelance web for CT small businesses (esp. card/comics/gaming/collectibles).
- Email: create@forge-ct.com (Google Workspace).
- GitHub: VoidcallerOC. Studio: forge-ct.com (VoidcallerOC/ForgeCT).
- Morph Forge Exotics: reptile breeding side business (Farmington).
- Voidcaller: on-chain metalcore (Avalanche / Grotto); site voidcaller.enterthegrotto.xyz; repo VoidcallerOC/The-Void.
- Also trades Pokemon TCG (collect + resale/grading) and Solana (separate from Forge cash clocks).
- Client starter: VoidcallerOC/client-site-starter; Drive folder Web Clients.
- Prefers direct, unsoftened analysis; builds written rules/guardrails against impulse.

## Forge standing rules (from Claude memory)
- Never begin building without written agreement.
- Withhold domain / repo / DNS until payment clears.
- Model: deposit up front, balance at launch; optional monthly care (Stripe recurring). Moving off Founders pricing toward real rate card + negotiated discounts; care rate rising for new clients.
- Spec-site / demo-first pitch for local shops (friendlier than a cold audit).
- Client SMS: draft only unless Google Voice (or other SMS) connected and Nick says send.

## Working preferences
- Practical, implementation-focused. Detailed technical reviews, prompts, deployment guidance. Avoid high-level theory.
- Audits: concrete findings + prioritized recommendations.
- Prompts: production-ready, single-step; hand straight to Manus/coding tools.
- Stack often: Python, React, modern web. Clean, modular, maintainable code.
- Images: analyze without auto-generating/editing unless Nick asks; preserve existing artwork.
- Outreach voice: human and direct. Not slang yo. Not corporate suit. No em dashes in client texts.

## Major repos / projects
- ForgeCT / Forge / MorphForge / Express-
- Harris / harris-wonderland
- Thousand Sunny / Hard-Hitting / tcg-buy-calculator
- tenant-portal / zipp (landlord portal work; deploy noted historically at zipp-orpin.vercel.app)
- Your Grails / The-Void / Voidcaller
- life-tracker (nicklife.xyz)
- sousasaas-client-tracker (client PII; treat as sensitive)
Active themes: repo audits, production readiness, DB security, branding, workflow.

## Desks (outside)
| Desk | Job |
|---|---|
| Manus (main) | Coders. One job at a time across accounts. |
| Super Grok | Award-winning UI / design. Hand impl to Manus. |
| ChatGPT | Prompt maker / brainstorm. Does not invent money or deploy COMPLETE. |
| Claude | Heavy writer / hard judgment (contracts, high-stakes messages, scope). Not a lawyer. Not daily coder. |
| dr eggbot | Front desk. Routes Forge bots. |

All desks should POST War Room Log handoffs to nicklife when API token is live (PR life-tracker #8).

## Forge bots (this app)
| Bot | Job | Anti-jobs |
|---|---|---|
| forge scout | Find/qualify only from Nick-confirmed sources | No contact. No nicklife-scrape ghosts. |
| forge draft | Paste-ready copy in Nick voice | Never sends. No invented stories. |
| forge close | Packages, objections, close order | Never sends. No fake COMPLETE. |
| forge see | Person-first Discover gate | No builds. No invented client bios. |
| repo comb | GitHub audit + amendment prompt + handoff | No merge/push unless Nick says. |

## Board (P0)

### Housing
STATUS: PARTIAL
- Address: 342 Scott Swamp Road, Farmington CT (Nick Sousa + Brittanie Patton)
- Notice to Quit: move by Sept 21, 2026 (non-payment). Owner Thomas C. Zipp LLC. Atty Paul E. Zagorsky 860-793-0200.
- Verbal plan (attorney): $2500 by end of Sept + October rent by the 10th to reinstate.
- Written email expected Monday. Need hold past Sept 21 in writing.
- Tom: text only. No website pitch.
- Claude-memory note (UNVERIFIED vs above): landlord also referenced as Meagan; tenant portal offered as credit exchange (zipp-orpin.vercel.app). Resolve naming with Nick before agents invent a story.

### Cash clocks
- $400 insurance by Sunday Sept 20 (collect path)
- $2500 by Sept 30 (Forge scoreboard)

### Open money / deals
| Item | Amount | Status | Next |
|---|---:|---|---|
| Hard Hittin calculator (Rob) | $600 | UNVERIFIED collect. No reply Sat Sept 19. | Sunday walk-in if open |
| Express Pizza & Scoops (2 locations) | $2000 total | PARTIAL. Mock contract + demo left. | Close bump $1000+$1000 twin sites; ordering in; no kitchen printer in $2k |
| Bascetta DMD (Newington) | $1000 deposit target | NOT STARTED walk-in | Discover first. Upside. |
| Harris in Wonderland (Adam) | dispute | BLOCKED for housing cash | Counsel/demand track only |

### Claude-memory prospects (UNVERIFIED vs current board)
Salem Comics, Leather Jacket Games, IDeal Cards, East Coast Collectibles (Scott). Do not treat as hot cash until Nick confirms. Prior Ideal/Rocky/Paul ghost paths stay scrubbed unless Nick reopens them.

### Confirmed Forge clients (ops)
M&J Collectibles (John), Thousand Sunny (West Hartford), Hard Hittin (Rob), Harris (Adam/Canton) dispute, Infinite Heroes live on forge-ct.com portfolio.

### Math to $2500
Express $2000 + Hard Hittin $600 = over if both clear. Bascetta = upside.

### Express contract (target rewrite)
- $1000 deposit before work; non-refundable once work begins
- $1000 final on completion / approval / launch (both sites)
- Per location: Home, Menu, Order Online, About/Story, Location/Contact, responsive, basic SEO, Maps, ordering-platform integration, deploy, launch polish
- Location 2 = configured twin of location 1
- Ownership after full payment; Forge keeps reusable methods/code/frameworks

## Morph Forge Exotics (light)
Farmington reptile breeding side business (ball pythons, western hognose, African house snakes, Pueblan milk snakes, eastern garter). Details live in nicklife Animals; do not invent genetics in sales copy.

## Interests (light)
Pokemon TCG, Magic, One Piece, guitar / Cubase interest, AI automation for business process.

## Do not
- Invent leads from nicklife scrapes
- Promise kitchen printer/ticket sync inside Express $2000
- Chase Harris for sept rent plan
- Begin unpaid builds / hand over domain-repo-DNS before payment
- Run 7 agents / 3 manus on the same job
- Mark COMPLETE without direct evidence
- Auto-send client SMS without Nick confirm
- Auto-generate/edit images unless Nick asks
- Put workplace HR drama or trading playbooks into client-facing copy

## Handoff log
- 2026-09-19: MASTER created; forge engine kicked; ChatGPT memory folded in.
- 2026-09-19: Nicklife war room + Express/Hard Hittin logs filled.
- 2026-09-20: War Room Log UI deployed (life-tracker PR #7). Agent HTTP API in PR #8.
- 2026-09-20: Claude memory folded in (Forge rules, clients, Morph Forge, Voidcaller, housing naming conflict flagged UNVERIFIED).

## Sync
- Path: WAR-ROOM/MASTER.md on VoidcallerOC/ForgeCT (branch war-room-master until PR merged)
- nicklife: facts board + per-shop logs + War Room Log UI; agent POST /api/war-room/log after PR #8 + token
- Texts: draft only unless Google Voice (or other SMS) connected and Nick says send
