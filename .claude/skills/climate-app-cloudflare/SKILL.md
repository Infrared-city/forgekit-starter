---
name: climate-app-cloudflare
description: Use when building or deploying a climate-aware app from this forgekit-starter template — adding a new analysis (wind, UTCI, solar, flood, tree canopy), wiring the Infrared SDK, or deploying to Cloudflare Pages/Workers. Triggers on "deploy my climate app", "add an analysis", "wire up wind comfort", "climate workshop challenge", "deploy to cloudflare" in this repo.
---

# Building climate-aware apps on forgekit-starter + Cloudflare

This repo is a trimmed fork of Infrared's internal app template: a React +
Vite client, a Hono Cloudflare Worker that hides your Infrared API key, and
a vendored `@infrared-city/infrared-sdk-ts` for calling Infrared's urban
microclimate simulations (wind comfort, thermal comfort/UTCI, solar,
daylight, sky view factor, ground materials, vegetation).

For general Cloudflare mechanics (Wrangler basics, Pages vs Workers, D1, R2,
secrets, "what should I build on Cloudflare") **use the general `cloudflare`
skill first** — this skill only covers what's specific to this template.

## Architecture in 30 seconds

```
apps/base/client   (Cloudflare Pages)  --/api/*-->  apps/base/api  (Cloudflare Worker)
                                                            |
                                                    @infrared-city/infrared-sdk-ts
                                                            |
                                                  api.infrared.city (real Infrared API key)
```

The client never holds `INFRARED_API_KEY` — only the Worker does. If you add
a new SDK call, put it behind a Worker route in
`apps/base/api/src/domains/infrared-proxy/routes.ts`, not directly in
client code with the key inlined.

New feature = new "domain": follow `apps/base/client/docs/DOMAIN_TEMPLATE.md`
for the file layout (store + api hooks + layer + panel component), and
`packages/primitives/analysis/` as a worked example of a primitive that
plugs into the map via `@forge-kit/plugin-contracts`' `MapPlugin` shape.

## Local dev loop

```bash
bun run --cwd apps/base/api dev       # :8787
bun run --cwd apps/base/client dev    # :3001, proxies /api -> :8787
```

Vite dev already proxies both `/api` (your Worker) and `/infrared-api`
(direct-to-Infrared, CORS workaround for quick iteration) — see the `server.proxy`
block in `apps/base/client/vite.config.ts` if you need to adjust targets.

## Deploying

Two independent deploys — a Cloudflare Pages project (client) and a
Cloudflare Worker (API):

```bash
# 1. API Worker — set the secret ONCE per environment, then deploy
cd apps/base/api
wrangler secret put INFRARED_API_KEY --env production
bun run deploy:production          # or deploy:preview / deploy:dev

# 2. Client — point it at the deployed Worker, then deploy
cd apps/base/client
# set VITE_API_URL=https://<your-worker>.<subdomain>.workers.dev in .env or CI
bun run deploy                     # wrangler pages deploy
```

Rename the `name` fields in both `wrangler.toml` files (currently
`my-climate-app` / `my-climate-app-api`) before your first deploy — Cloudflare
project names must be unique per account.

If you're deploying with an AI coding agent driving Wrangler for you
(the workshop's intended flow), the general `cloudflare` skill has the
step-by-step account/wrangler-login/deploy sequence — this skill only adds
the two-Worker split and secret above.

## Preset workshop challenges

Each of these is a self-contained prompt you can hand to your coding agent.
They're scoped so a working deployed URL is reachable inside a
few-hour workshop session — not by pasting a paragraph, but by
letting the agent make small implementation choices along the way.

1. **Wind comfort dashboard** — for a drawn site, run a wind comfort (PWC)
   analysis for summer vs. winter and show both side by side.
   *SDK call: `client.wind` / the `analysis` primitive's `runArea` with a PWC
   payload — see `packages/primitives/analysis/react/analysis.area-run-api.ts`.*

2. **Thermal comfort (UTCI) heat-check** — run UTCI for a site at a hot
   summer afternoon time period and flag the fraction of the area above a
   "strong heat stress" threshold.

3. **Tree canopy / shade explorer** — combine the vegetation primitive
   (`packages/primitives/vegetation/`) with an analysis run to show how much
   of a site's shade comes from existing trees vs. buildings.

4. **Solar potential for a neighborhood** — run a solar radiation analysis
   over a larger drawn area and rank sub-regions by annual solar potential
   (a rooftop-PV siting pitch).

5. **Ground-material heat contribution** — use the ground-materials
   primitive to swap a site's paving/grass mix and compare the resulting
   UTCI or wind result — a before/after "what if we added more grass"
   story.

Encourage students to change ONE thing about a challenge (a different city,
a different time of year, a different material mix) rather than starting
from a blank prompt — it keeps the scope small enough to actually ship a
deployed URL in the session.

## Gotchas specific to this template

- **Bundle size**: deck.gl + mapbox-gl + the IFC/BIM viewer (`@thatopen/fragments`,
  `web-ifc`) are large. First `vite build` produces multi-MB chunks — this is
  expected, not a sign something's broken (see README.md "Known follow-ups").
- **`INFRARED_BASE_URL`** defaults to `https://api.infrared.city/v2` in both
  `wrangler.toml` files — don't point it at a raw AWS execute-api URL, that
  was an internal staging artifact removed during extraction.
- **Single Analysis tab**: the original template had a second "AI Workflows"
  tab calling Infrared's internal AI backend; it's removed here. The tab-bar
  code is gone from `WorkflowPanel.tsx` too — if you want a second tab for
  your own feature, that file is the place to add it back.
