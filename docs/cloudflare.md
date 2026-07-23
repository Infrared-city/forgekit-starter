# Building climate-aware apps on forgekit-starter + Cloudflare

> **For your AI coding agent (and you).** Deploying this app to Cloudflare, or
> adding an analysis, database, or storage? Point your agent at this file —
> "read docs/cloudflare.md". It covers the deploy path, the D1/R2/KV toolbox,
> Wrangler commands, and the dashboard steps.

This repo is a trimmed fork of Infrared's internal app template: a React +
Vite client, a Hono Cloudflare Worker that hides your Infrared API key, and
a vendored `@infrared-city/infrared-sdk-ts` for calling Infrared's urban
microclimate simulations (wind comfort, thermal comfort/UTCI, solar,
daylight, sky view factor, ground materials, vegetation).

For general Cloudflare mechanics (Wrangler basics, Pages vs Workers, D1, R2,
secrets, "what should I build on Cloudflare") the official docs at
**developers.cloudflare.com** are the reference — this guide only covers what's
specific to this template.

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
(the workshop's intended flow), the Wrangler cheat-sheet below plus
developers.cloudflare.com cover the account/login/deploy sequence — this
guide adds the two-Worker split and secret above.

## Beyond the key-hiding Worker: Cloudflare's toolbox

The Worker in this template does one job: hide `INFRARED_API_KEY`. But the
same Worker can do much more — if your app idea needs to *remember* things
(saved sites, user accounts, uploaded files), Cloudflare has a piece for
each. The whole toolbox in one picture:

| Restaurant | Your app | Cloudflare | Reach for it when… |
|---|---|---|---|
| dining room | the page users see | Pages (`apps/base/client`) | always — it's your UI |
| kitchen | server logic + the API key | Workers (`apps/base/api`) | always — already here |
| recipe book | a real database | **D1** (SQLite) | you have rows: saved sites, users, comments |
| walk-in fridge | files & images | **R2** (object storage) | users upload/download files; you store result exports |
| sticky notes | quick key→value cache | **KV** | sessions, config, cache — small, fast, expires |
| lock on the door | user accounts | **Better Auth** (you add it) | users log into *your* app — not the same as Infrared sign-in, see below |

> Two one-liners worth keeping: *"serverless" doesn't mean no servers — it
> means you don't think about them.* And *"edge"* = your code runs near the
> user (someone in Tokyo hits a Tokyo machine).

### D1 — a database for your app

SQLite that Cloudflare runs for you; scales to zero — free when idle (free
tier: 5 GB, 5M row-reads + 100k row-writes a day). Reach for it the moment
your app has *rows* — saved analyses, a list of sites, user notes.

```toml
# apps/base/api/wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "my-climate-app-db"
database_id = "..."            # from: wrangler d1 create my-climate-app-db
migrations_dir = "drizzle"
```

Then from any Worker route, `c.env.DB` is your database:

```ts
await c.env.DB.prepare("INSERT INTO sites (name, geojson) VALUES (?, ?)").bind(name, geojson).run()
const { results } = await c.env.DB.prepare("SELECT * FROM sites").all()
```

Schema lives in migration files; apply them with
`wrangler d1 migrations apply my-climate-app-db --local` (then `--remote`
for production). Tell your agent "add a D1 database to save drawn sites" and
it will wire the binding, a migration, and the routes.

### R2 & KV — files vs. quick values

- **R2** = files: images, GeoJSON, PDF exports, an uploaded IFC model.
  Killer feature: **zero egress fees** (S3 charges for downloads; R2 doesn't).
- **KV** = tiny key→value pairs that can expire: a cached result, a session,
  a setting. Not for anything needing exact/instant consistency.

```ts
// R2 — store & fetch a file
await c.env.BUCKET.put('exports/site-42.pdf', pdfBytes)
const obj = await c.env.BUCKET.get('exports/site-42.pdf')

// KV — cache a value for an hour
await c.env.CACHE.put('last-result:42', JSON.stringify(data), { expirationTtl: 3600 })
const cached = await c.env.CACHE.get('last-result:42', 'json')
```

### Auth — user accounts for YOUR app

**Important distinction, or you'll build two login systems by accident:**

- This template *already* signs users into **Infrared** (so it can run
  simulations on their account) — that's the sign-in on the client, handled
  by the Worker. Leave it alone.
- **Cloudflare has no built-in user auth.** If *your* app needs its own
  accounts (so a user saves *their* sites and sees them next visit), you add
  it — **Better Auth** (free, open-source) is the standard choice, and it
  stores users right in your D1 database.

Two beginner traps, both real, both cost an afternoon:

- Add `compatibility_flags = ["nodejs_compat"]` to `wrangler.toml` — Better
  Auth needs it.
- Don't use bcrypt — it blows the Workers 10 ms CPU limit (Error 1102). Use
  a Web Crypto PBKDF2 hasher instead (ask your agent for the ~25-line
  Web Crypto version).

### Wrangler CLI cheat-sheet

Wrangler is the terminal tool that talks to Cloudflare. Your agent runs these
for you — the ones worth recognising (all verified against current docs):

```bash
wrangler login                         # sign in (opens a browser)
wrangler whoami                        # which account am I on?
wrangler dev                           # run locally  (http://localhost:8787)
wrangler types                         # regenerate Env types after adding a binding
wrangler deploy                        # deploy the Worker (apps/base/api)
wrangler pages deploy dist             # deploy the static client (apps/base/client)
wrangler secret put INFRARED_API_KEY   # set a production secret (local: .dev.vars)
wrangler tail                          # stream live production logs

# D1 (database)
wrangler d1 create my-climate-app-db
wrangler d1 migrations create my-climate-app-db add_sites
wrangler d1 migrations apply my-climate-app-db --local     # then --remote for prod
wrangler d1 execute my-climate-app-db --command "SELECT * FROM sites"

# storage
wrangler r2 bucket create my-files
wrangler kv namespace create CACHE     # v4 syntax: "kv namespace", not "kv:namespace"
```

> **The one v4 trap:** commands touching data (`d1`, `kv`, `r2`) now default
> to your *local* copy. Add `--remote` to read/write the real production
> resource — forget it and you'll swear "the data isn't saving" while it sits
> in a local file.

Our client's deploy script uses `wrangler pages deploy`; Cloudflare now steers
brand-new projects to `wrangler deploy` with a static-assets directory
instead. Both work — the template stays on Pages, no action needed.

### What you must do in the dashboard (the CLI can't)

A few things have no `wrangler` command — you (a human) click them once at
[dash.cloudflare.com](https://dash.cloudflare.com):

- **Turn on R2 before using it.** Storage & databases → R2 → Overview →
  complete the checkout flow. Until you do, `wrangler r2` fails with
  `10042 NotEntitled`. (No charge on the free tier — it just has to be enabled.)
- **API token for auto-deploy from GitHub.** My Profile → API Tokens →
  Create Token (permissions: Workers Scripts Edit + Cloudflare Pages Edit).
  Only needed if you wire up CI — plain `wrangler deploy` from your laptop uses
  your login.
- **Connect a repo for auto-deploy.** Workers & Pages → Create application →
  import a repository; first time, GitHub asks you to authorise the
  "Cloudflare Workers and Pages" app. There's no CLI for this git link.
- **Upgrade to Workers Paid ($5/mo).** Workers & Pages → Plans. You're only
  forced here past real usage — Workers AI over 10k neurons/day, any Durable
  Objects, or a client with 20k+ files.

### Gotchas & free-tier limits that bite

- **KV:** expiry under 60 s isn't supported, and you can only write the *same
  key* once per second (429 if you hammer a counter). Free: 1,000 writes/day.
- **D1:** 100k row-*writes*/day on free — a chatty app hits the write cap long
  before the read cap.
- **Workers CPU is 10 ms/request on free** — that's why bcrypt fails
  (Error 1102) and you use the PBKDF2 hasher instead.
- **Upload size:** request bodies cap at 100 MB on Free/Pro accounts (a big
  IFC model → 413).

For the full step-by-step (account setup, `wrangler login`, a complete
build with D1 + auth), see **developers.cloudflare.com** — this section is
just the map.

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
