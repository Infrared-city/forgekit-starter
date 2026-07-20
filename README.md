# forgekit-starter

A trimmed, public starting point for building climate-aware map apps on
[Infrared](https://infrared.city)'s urban microclimate SDK, deployed on
Cloudflare (Pages + Workers).

Built by extracting the `apps/base` reference app from Infrared's internal
`forge-kit` monorepo — the same three-layer plugin architecture the
commercial platform is built on — and vendoring a built copy of the
`@infrared-city/infrared-sdk-ts` package so `bun install` works with no
private registry auth. See "What was removed" below for exactly what was
stripped and why.

## What's in here

```
apps/base/client/   React + Vite app: map, buildings, draw-area, run analyses
apps/base/api/      Hono Worker: server-side Infrared API key proxy + auth
packages/sdk/       Vendored @infrared-city/infrared-sdk-ts (built, not source)
packages/primitives/  buildings, analysis, ground-materials, vegetation, indoor-analysis
packages/interfaces/  map (deck.gl + Mapbox canvas), interior (IFC viewer), plugin-contracts
packages/ui/        Shared component library
```

Architecture rule (enforced by convention, not tooling): **primitives never
import interfaces; interfaces never import apps.** Each primitive exports a
`MapPlugin` (or `InteriorPlugin`) that the app's composition root
(`apps/base/client/src/composition/`) wires together. See
`apps/base/client/docs/DOMAIN_TEMPLATE.md` for the file-by-file pattern to
follow when adding a new analysis domain, and `README-INFRARED.md` for the
data-flow architecture (pure-function layers, cross-domain query
invalidation).

## Quick start

```bash
bun install
cp .env.example .env                                    # fill in VITE_MAPBOX_TOKEN
cp apps/base/api/.dev.vars.example apps/base/api/.dev.vars  # fill in INFRARED_API_KEY

bun run --cwd apps/base/api dev      # Worker on :8787
bun run --cwd apps/base/client dev   # Vite on :3001, proxies /api -> :8787
```

Open `http://localhost:3001`. Sign in with your Infrared account, search a
place, draw a polygon, run an analysis.

**Getting an Infrared API key:** sign up at infrared.city (or use the
account/token your workshop provided). **Mapbox token:** free at mapbox.com.

## Deploying to Cloudflare

See the bundled `.claude/skills/climate-app-cloudflare/SKILL.md` — it covers
the two-Worker deploy (Pages for the client, a Worker for the API proxy),
required secrets, and gives you copy-paste prompts for the workshop's preset
challenges. It builds on the general-purpose `cloudflare` skill for
Wrangler/Pages/D1/R2 mechanics.

Quick version:
```bash
wrangler secret put INFRARED_API_KEY --env production   # in apps/base/api/
bun run --cwd apps/base/api deploy:production
bun run --cwd apps/base/client deploy                    # after setting VITE_API_URL
```

## Why a Worker in front of the SDK, not calling it from the browser

`apps/base/api` exists mainly so `INFRARED_API_KEY` never reaches the
browser bundle. The Worker's `/infrared/*` routes proxy Infrared SDK calls
using a server-side key (`apps/base/api/src/domains/infrared-proxy/`); the
client calls its own Worker, never `api.infrared.city` directly in
production. Keep this pattern if you add new SDK calls.

## What was removed from the original forge-kit `apps/base`

This is a **subset** of Infrared's internal app, not the whole monorepo.
Removed, cleanly, so nothing here silently depends on Infrared-internal
infrastructure:

- **`billing` domain** (API + any pricing UI) — Infrared's own commercial
  token billing. Not relevant to a free/workshop template.
- **`ai-workflows` primitive + domain** — calls Infrared's internal AIBackend
  (OpenAI orchestration) service, which isn't public. The `WorkflowPanel`
  sidebar is now single-tab (Analysis only) as a result — the tab-bar
  scaffolding is still there in `composition/WorkflowPanel.tsx` if you want
  to add a second tab for your own feature.
- **`apps/platform`, `apps/design-explorer`, `packages/warehouse*`** — the
  commercial product and its D1/R2 persistence layer. Not copied at all.
- **Internal AWS Gateway URL** — the original `wrangler.toml` pointed
  `INFRARED_BASE_URL` at a raw `execute-api.eu-central-1.amazonaws.com/staging`
  URL. Replaced with the public `https://api.infrared.city/v2`.

## Known follow-ups (not blocking, but real)

- **`bun run typecheck` (`tsc -b`) has pre-existing type errors** (implicit-
  `any`s, missing `@types` resolution in the workspace packages) inherited
  from the source repo. `build` and `deploy` intentionally do NOT gate on it —
  `vite build` and `wrangler dev` both work fine; typecheck strictness wasn't
  part of this extraction pass.
- **No hand-tuned vendor chunk splitting** — the original's
  `manualChunks` config (deck.gl/mapbox/three grouped into named chunks)
  assumed package names that don't all resolve standalone here, so it's
  removed for now. The build works, just as fewer/larger chunks (deck.gl +
  mapbox-gl + IFC parsing are inherently large — expect a few hundred KB–2MB
  chunks). Worth re-adding if load time matters for your deployment.
- **`WorkflowPanel.test.tsx` and the API contract smoke test were deleted**,
  not fixed — they asserted on the removed AI Workflows tab / a parallel
  Python backend variant not included here.
- **The SDK is vendored, not npm-installed** — `packages/sdk/dist` is a
  point-in-time build (v0.12.3). To pick up a newer SDK release, rebuild it
  from `Infrared-city/infrared-api-sdk-ts` and drop the new `dist/` in.

## License

[Apache-2.0](./LICENSE) — the whole template, matching the vendored SDK's
(`packages/sdk`) upstream license.
