# forgekit-starter

Build small climate apps with [Infrared](https://infrared.city)'s urban
microclimate simulations: sun hours, wind, thermal comfort (UTCI), solar
radiation, daylight, sky view — on any place in the world. You need a bit of
JavaScript, or an AI coding tool, and an Infrared API key.

The app runs in the browser on Cloudflare Pages. A small Cloudflare Worker
keeps your API key secret.

## Start in 5 minutes

You need [Node.js 20 or newer](https://nodejs.org) and git.

```bash
git clone https://github.com/Infrared-city/forgekit-starter.git
cd forgekit-starter
cp apps/base/api/.dev.vars.example apps/base/api/.dev.vars
#   open apps/base/api/.dev.vars and paste your key after INFRARED_API_KEY=
npm install
npm run dev
```

Open **http://localhost:3002**. You see four example apps:

| Page | What it shows | Analysis | Cost (512 m square) |
|---|---|---|---|
| Sun hours | Hours of direct sun at an address on one day | `direct-sun-hours` | 10 AItokens |
| Wind | Wind speed, or wind comfort from a local wind rose | `wind-speed` / `pedestrian-wind-comfort` | 40 / 200 AItokens (256 m square: 10 / 50) |
| UTCI heat | "Feels like" temperature on summer afternoons | `thermal-comfort-index` | 10 AItokens |
| Facades | Sun hours on every building wall, in 3D | `direct-sun-hours` + `analysisSurfaces: 'facades'` | 10-20 AItokens |

Type an address or click the map, press **1. Check cost** (free), then
**2. Run** (spends tokens). The result shows on the map.

### Get an API key

Sign in to the Infrared platform at https://platform.infrared.city and create
an API key in your account (or use the key that your workshop gave you). Put it
**only** in `apps/base/api/.dev.vars`. That file is in `.gitignore`: git never
commits it. Never put the key in browser code, in `.env`, or in a chat.

### What does it cost?

Each run spends **AItokens** from your Infrared account.

- One run is split into **tiles**. Most analyses cost about **10 AItokens per
  tile**; `pedestrian-wind-comfort` costs about **50 per tile**. The live price
  can change: always press **Check cost** first (it uses the live price and
  submits nothing).
- Solar, daylight and thermal tiles are **512 m x 512 m**. An area smaller than
  that costs the same, so use areas of **512 m or more**.
- Wind tiles are 256 m apart: a 512 m square is 4 wind tiles, a 256 m square
  is 1.
- The SDK refuses a run of more than 100 tiles unless you ask for it.

### Pass the geometry explicitly

The examples read buildings, trees and ground materials from open data, then
**pass them to the run**:

```ts
const buildings = await client.buildings.getBuildingsInArea(polygon)
const vegetation = await client.vegetation.getArea(polygon)
await client.runAreaAndWait(input, polygon, { buildings, vegetation })
```

The run does not read anything by itself: if you leave out `buildings`, the
simulation sees an empty site. When you have your own design (a new building,
a new park), put your own geometry in these objects instead.

## Build your own app

The easiest way: open this folder in Claude Code, Cursor, Codex or another AI
coding tool and ask for what you want. The tool reads `CLAUDE.md` /
`AGENTS.md`, which explain the SDK and the rules. Good first prompts:

- "Add a page to apps/examples that shows sky view factor for a place I click."
- "In the UTCI example, let me compare two months side by side."
- "Add a solar radiation page for June to August, with weather from the nearest station."
- "Show a small chart of the result values under the map."

To add a page by hand: copy `apps/examples/src/examples/SunHours.tsx`, change
it, and add it to `PAGES` in `apps/examples/src/main.tsx`.

## What is in this repo

```
apps/examples/      START HERE: 4 small example pages (React + Vite + Leaflet)
apps/base/api/      Cloudflare Worker: holds INFRARED_API_KEY, proxies the SDK and S3
apps/base/client/   A bigger reference app (3D map, sign-in, drawing tools). Needs a Mapbox token.
packages/sdk/       The Infrared TypeScript SDK (built files only, see "For maintainers")
packages/*          Parts the reference app uses (map, primitives, UI)
docs/cloudflare.md  Deploy to Cloudflare, databases and storage, Wrangler commands
```

**Why a Worker?** The SDK runs in the browser, but the browser must not know
your key, and the Infrared API and its S3 buckets do not send CORS headers
for every response. So the browser sends every SDK request to your Worker
(`/infrared/*`). The Worker adds the key and relays the S3 uploads and
downloads (`/infrared/s3-proxy/*`). See
`apps/base/api/src/domains/infrared-proxy/routes.ts`.

## Deploy to Cloudflare

> **WARNING: an unprotected Worker spends YOUR tokens for anyone.** The
> Worker adds your API key to every request it receives. If you deploy it
> without protection, anyone who finds its URL can run analyses and empty
> your AItoken balance. CORS does not stop this: it blocks other web pages,
> not scripts. So the Worker **fails closed**: a deployed Worker without an
> `APP_PASSWORD` secret refuses every analysis request (`503`). Do the three
> steps below.

### A safer setup in three steps

**1. Set an app password (required; the Worker checks it).**

```bash
cd apps/base/api
npx wrangler secret put INFRARED_API_KEY --env production
npx wrangler secret put APP_PASSWORD --env production   # choose a long random text
```

When `APP_PASSWORD` is set, every `/infrared/*` request without the header
`X-App-Password: <that text>` gets `401`. In the examples app, type the
password once in the **App password** field (top right); the browser keeps
it in localStorage. The password is never built into the JavaScript bundle.
Share it only with the people who may spend your tokens, and change it
(`wrangler secret put` again) if it leaks.

Locally, `apps/base/api/.dev.vars` has `ALLOW_OPEN_PROXY_FOR_LOCAL_DEV=true`,
so `npm run dev` works without a password, on localhost only. A deployed
Worker never reads `.dev.vars`; never put that flag in `wrangler.toml`. To
try the password flow locally, add `APP_PASSWORD=some-text` to `.dev.vars`
and restart `npm run dev`.

**2. Allow only your own site (CORS).** In `apps/base/api/wrangler.toml`,
under `[env.production.vars]`:

```toml
ALLOWED_ORIGINS = "https://<your-app>.pages.dev"
```

**3. Deploy.**

```bash
npm run deploy:production                          # in apps/base/api
# in the root .env: VITE_API_URL=https://<your-worker>.<you>.workers.dev
npm run deploy --workspace apps/examples           # from the repo root
```

**Better protection (optional):**

- **Real login:** put the Worker and the site behind
  [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/applications/)
  (free for small teams). Only people you invite by email can open them.
- **A daily token budget:** count the tokens that the Worker lets through in
  a Cloudflare KV or D1 row per day, and answer `429` above your limit. Also
  keep the account balance small: top up only what you plan to spend.

More details: [docs/cloudflare.md](./docs/cloudflare.md).

## For maintainers

### Update the SDK

`packages/sdk` holds the **built** output of `@infrared-city/infrared-sdk-ts`
(no source, no source maps). Until the SDK is on public npm, it comes from
GitHub Packages:

```bash
NPM_TOKEN=<GitHub token with read:packages> npm run update-sdk -- 0.12.13-next.18
npm install
npm run typecheck && npm run build
```

`scripts/update-sdk.mjs` downloads the tarball, checks its sha512 integrity
and its Apache-2.0 license, and replaces `packages/sdk` with `dist/`, the WASM
glue, `LICENSE`, `NOTICE` and a trimmed `package.json`. When the SDK is on
public npm, add `--registry https://registry.npmjs.org` (no token needed), or
replace the vendored copy with a normal npm dependency.

After an update, run the four examples against staging once (put
the staging `INFRARED_BASE_URL` and a staging key in
`apps/base/api/.dev.vars`).

### Known follow-ups

- `apps/base/client` type-check (`tsc -b`) has old errors from the source
  repo; `vite build` works. Its SDK calls were ported to the new SDK and the
  app builds and loads, but a full signed-in run was not tested here.
- The package manager is npm (`.npmrc` sets `legacy-peer-deps=true` because
  of an old `web-ifc` peer range in the reference app).

## License

[Apache-2.0](./LICENSE). The vendored SDK in `packages/sdk` is also
Apache-2.0 (see `packages/sdk/LICENSE` and `packages/sdk/NOTICE`).
