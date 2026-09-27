# Infrared SDK in the reference app

This file tells you where the reference app (`apps/base/client`) calls the
Infrared TypeScript SDK. For the SDK itself (area runs, result shapes,
facades, terrain, weather, seasons, required inputs), read the one
reference: [AGENTS.md "SDK reference"](../../../AGENTS.md#sdk-reference).
Beginners start in `apps/examples`, not here.

## Where the SDK is used

| File | What it does |
|---|---|
| `src/lib/sdk.ts` | `sdkCoreReady` loads the WASM core once (`initializeCore`). `createSdk({ getToken })` makes the one `InfraredClient`. |
| `src/composition/adapters.ts` | Weather adapter: `client.weather.getWeatherFileFromLocation(lat, lon, radiusKm)` and `getWeatherFileFromIdentifier(id)`. |
| `packages/primitives/analysis/react/analysis.area-run-api.ts` | The area run (`runArea` / `runAreaAndWait`) of the Analysis tab. |
| `packages/primitives/analysis/react/analysis.area-preview-api.ts` | The free cost check before a run. |
| `packages/primitives/{buildings,vegetation,ground-materials}` | Site data layers. See the README in each folder. |

## The rules that also apply here

- The browser never holds the API key. `createSdk` sends every request to
  the Worker (`<API>/infrared/*`) with a placeholder key; the Worker in
  `apps/base/api` adds `INFRARED_API_KEY`. Presigned S3 uploads and result
  downloads go through `<API>/infrared/s3-proxy/*` (no CORS on S3).
- When a user is signed in, `getToken` adds `Authorization: Bearer <JWT>`,
  and that user's account pays. Without a token, the Worker's key pays.
- `main.tsx` waits for `sdkCoreReady` before the first render: tiling,
  merge and geometry calls need the WASM core.
- Every run costs AItokens. Show the cost check first.

## Setup

```bash
cp apps/base/api/.dev.vars.example apps/base/api/.dev.vars   # put INFRARED_API_KEY here
cp .env.example .env                                         # root .env: put VITE_MAPBOX_TOKEN here
npm install
npm run dev:api        # the Worker, port 8787
npm run dev:client     # this app, port 3001
```

Vite reads the root `.env` (`envDir`). Leave `VITE_API_URL` unset in
development: Vite forwards `/api` to the Worker. See the root README "Deploy to Cloudflare" before you deploy.
