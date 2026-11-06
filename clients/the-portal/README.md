# The Portal: prospect demo

An isolated client demo for The Portal, a tabletop game store in Manchester, CT. It lives apart from Forge CT production (`nitro/`) and shares no code, config or deploy settings with it.

## Run

```bash
node build.mjs          # writes dist/ (noindex demo mode)
PORTAL_LAUNCH=1 node build.mjs   # indexable build, only after owner approval
```

The build needs nothing beyond Node 18 or newer. Static output goes to `dist/`. `vercel.json` sets the build command, clean URLs and a `noindex` header.

## Deploy (isolated preview)

Create a **new** Vercel project with its root directory set to `clients/the-portal`. Don't reuse the Forge CT project. Before launch, remove the `X-Robots-Tag` header and the demo ribbon.

## Pages

`/` home · `/events` filterable event types · `/cards` Magic and card games · `/tabletop` board games and miniatures · `/rpg` RPG and community · `/begin` "Where to Begin" quiz · `/visit` hours, map and contact · `404`

## Content sources (verified)

Every fact comes from theportalct.com (fetched Nov 2026):

- Address 60 Hilliard St, Manchester CT 06042 · phone (860) 432-0711 · email bryan@theportalct.com
- Hours (Contact page): Sun and Mon 12–8 p.m., Tue–Thu 12–11 p.m., Fri 12 p.m.–12 a.m., Sat 10 a.m.–10 p.m.
- 17 miniatures tables, a terrain collection, a game library of 500+ titles, a large gaming space
- Magic: FNM, prereleases, drafts · board game days · miniatures game days · learn-to-play RPG · local designer and publisher showcases
- Miniatures games named on the site: Warhammer, Star Wars, Game of Thrones
- Facebook /TimeMachinePortal · YouTube channel · Podomatic podcast archive
- Photos: the store's own images from its current site

Event dates, times and fees are **not** published on the store's site, so the demo shows "Schedule TBA" or "ask in store" rather than inventing them. See `PROPOSAL.md` for what the owner still needs to confirm.
