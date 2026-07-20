# forgekit-starter — agent guide

This repo is a public starting point for building climate-aware apps on
Infrared's urban microclimate SDK, deployed on Cloudflare. It was extracted
from Infrared's internal `forge-kit` monorepo for a workshop where students
vibecode their own app ideas — read this before making structural changes so
new work lands in the right tier.

## The three tiers — read this before adding anything

**1. Core (always required, keep minimal):**
```
packages/sdk/          vendored @infrared-city/infrared-sdk-ts (built, not source)
apps/base/api/          Hono Cloudflare Worker — the ONLY thing that holds INFRARED_API_KEY
```
This is the actual "get simulations running from anywhere" foundation. It has
no opinion about UI — a student building a chatbot, a CLI tool, or a plain
dashboard only needs these two pieces. **Do not add map/UI dependencies here.**

**2. Optional layer (pull in only what you use):**
```
packages/primitives/    buildings, analysis, ground-materials, vegetation, indoor-analysis
packages/interfaces/    map (deck.gl + Mapbox canvas), interior (IFC viewer), plugin-contracts
packages/ui/            shared component library
packages/design-tokens/, three-theme/, analysis-colors/, mapbox-theme/
```
Deck.gl, Mapbox, and the three-layer plugin architecture (primitives →
interfaces → apps) all live here. Genuinely useful, genuinely optional — a
student who wants a 3D map picks these up; one who doesn't, skips them
entirely and just calls the SDK directly from their own Worker route.

**3. Reference example (fork it, don't feel bound by it):**
```
apps/base/client/       full map app: buildings, draw-area, analysis tabs, Cognito login
```
This is one complete worked example wiring Core + the Optional layer
together — not the only valid app shape. If a student's idea doesn't need a
map, they should NOT start here; point them at Core + a blank Vite/Worker
app instead.

## Architecture rule (enforced by convention, not tooling)

**Primitives never import interfaces. Interfaces never import apps.** Each
primitive in `packages/primitives/*` exports a `MapPlugin` (or
`InteriorPlugin`) shape conforming to `@forge-kit/plugin-contracts`. The
composition root (`apps/base/client/src/composition/`) is the only place
that wires primitives into interfaces. See
`apps/base/client/docs/DOMAIN_TEMPLATE.md` for the exact file layout to
follow when adding a new analysis domain.

## The security pattern — non-negotiable

`INFRARED_API_KEY` must never reach a browser bundle. Every SDK call from a
browser-facing app goes through a Worker route
(`apps/base/api/src/domains/infrared-proxy/routes.ts` is the reference) that
injects the key server-side. If you're helping a student add a new SDK call,
put it behind a Worker route — never inline the key in client code, even
"just for testing."

## Base URLs — two different upstreams, don't conflate them

`apps/base/api/src/config.ts` declares two env vars for a reason:
- `INFRARED_BASE_URL` (`https://api.infrared.city/v2`) — versioned async/SDK
  surface, used only by the `/infrared/*` proxy.
- `INFRARED_AUTH_BASE_URL` (`https://api.infrared.city`, no `/v2`) — auth,
  user profile, indoor presign/confirm. These live at the unversioned root on
  prod; pointing them at the `/v2` base 404s (this was a real bug, fixed
  2026-07-17 — see git history / README "Known follow-ups").

## Dev commands

```bash
bun install
cp .env.example .env                                        # fill VITE_MAPBOX_TOKEN
cp apps/base/api/.dev.vars.example apps/base/api/.dev.vars   # fill INFRARED_API_KEY

bun run --cwd apps/base/api dev      # Worker on :8787
bun run --cwd apps/base/client dev   # Vite on :3001, proxies /api -> :8787
```

## Deploying

See `.claude/skills/climate-app-cloudflare/SKILL.md` for the full Cloudflare
deploy sequence (two independent deploys: Pages for the client, a Worker for
the API) and ready-to-use workshop challenge prompts.

## Where deeper docs live

| Doc | Covers |
|---|---|
| `README.md` | What's here, what was removed from the original forge-kit `apps/base`, known follow-ups |
| `apps/base/client/docs/DOMAIN_TEMPLATE.md` | File-by-file pattern for adding a new analysis domain |
| `apps/base/client/README-INFRARED.md` | Data-flow architecture: pure-function layers, cross-domain query invalidation |
| `.claude/skills/climate-app-cloudflare/SKILL.md` | Cloudflare deploy steps + preset workshop challenges |
