# forgekit-starter — guide for AI coding tools

You help a person who is new to coding build a small app on Infrared's urban
microclimate SDK. Keep changes small, keep the app running, and explain what
you did in plain words. Read this whole file before the first edit.

## The four rules

1. **The API key never goes to the browser.** It lives only in
   `apps/base/api/.dev.vars` (local) or a Worker secret (deployed). Never put
   it in client code, `.env`, `VITE_*` variables, a commit, or a chat reply.
   The browser SDK uses a placeholder key; the Worker replaces it.
2. **All SDK traffic goes through the Worker proxy.** Browser client:
   `baseUrl = <API>/infrared`, and a custom `fetch` that rewrites Infrared S3
   URLs to `<API>/infrared/s3-proxy/<host>/<path>`. Use `getClient()` from
   `apps/examples/src/lib/infrared.ts`; do not make a second client setup.
   Do not remove the S3 relay: presigned uploads and result downloads fail
   in the browser without it (no CORS).
3. **Every run costs AItokens.** Always offer a free cost check first
   (`client.previewAreaWithPricing` or, for facades,
   `client.previewAreaBatches`). Never start runs in a loop, on page load, or
   in tests. Never repeat a submit that had an unknown result: poll the jobs.
4. **Pass the geometry explicitly.** Read buildings / trees / ground with the
   SDK (or use the user's own), then pass the returned objects to the run.

## Layout

```
apps/examples/        START HERE. React + Vite + Leaflet, 4 example pages. Port 3002.
  src/lib/infrared.ts   the one SDK client (WASM init, proxy base URL, S3 rewrite)
  src/lib/geo.ts        squareAround(center, sizeM), geocode(address)
  src/lib/colors.ts     grid -> PNG with a FIXED value range, legend ramp
  src/components/       GridExample (pick place -> cost -> run -> map), MapView, FacadeScene
  src/examples/         SunHours, WindAround, HeatMap, FacadeView
  src/main.tsx          PAGES list: add a new page here
apps/base/api/        Hono Cloudflare Worker. Port 8787. The ONLY place with INFRARED_API_KEY.
  src/domains/infrared-proxy/routes.ts   /infrared/* and /infrared/s3-proxy/*
apps/base/client/     Big reference app (Mapbox, sign-in, plugins). Only for advanced users.
packages/sdk/         Vendored BUILT SDK. Never edit by hand; see README "For maintainers".
```

Commands: `npm install`, `npm run dev` (Worker + examples),
`npm run typecheck`, `npm run build`. Dev server logs show errors; the
browser console shows SDK errors.

A new page: copy `apps/examples/src/examples/SunHours.tsx`, change
`analysisType`, `scale`, `prepare`, add it to `PAGES` in `src/main.tsx`.
Keep each file under 400 lines. Do not add a new framework or state library
for a small feature.

## How the SDK works (`@infrared-city/infrared-sdk-ts`, 0.12.13-next.18)

- It is WASM-first. `initializeCore({ url })` must finish before tiling,
  merge or geometry work. `getClient()` does it once.
- An **area run** splits a GeoJSON polygon (`[longitude, latitude]` order,
  WGS84) into tiles, submits one job per tile, polls, and merges:
  `client.runAreaAndWait(input, polygon, options)`.
- Result for a ground run: `{ mergedGrid, gridShape: [rows, cols], bounds:
  [west, south, east, north], failedJobs, legend? }`. `mergedGrid` is a flat
  typed array, 1 m cells, **row 0 is the SOUTH edge** (flip rows to draw
  north-up; `gridToDataUrl` does it). `NaN` = building or outside the area.
  Place the image with `result.bounds`, not with the polygon.
- Result for a facade run (`analysisSurfaces: 'facades'`): `{ surfaces,
  aggregates, sensorCount, minLegend, maxLegend }`. Each surface is a grid:
  cell (i, j) = `origin + i*gridSize*uAxis + j*gridSize*vAxis`, value
  `values[j*nu + i]`, metres from the area's south-west corner, z up. See
  `FacadeScene.tsx`.
- Check the shape: `if ('mergedGrid' in result)` (ground) or
  `if ('surfaces' in result)` (facades).
- Site data (no key, public hosts): `client.buildings.getBuildingsInArea(polygon)`,
  `client.vegetation.getArea(polygon)`, `client.groundMaterials.getArea(polygon)`
  (slowest; only the two thermal analyses use it). Pass the WHOLE returned
  object in `options` (`{ buildings, vegetation, groundMaterials }`), not only
  its inner map: the SDK checks the read margin and throws `ReadMarginError`
  if it is too small. Read with the same polygon you run.
- Weather (no key): `client.weather.getWeatherFileFromLocation(lat, lon)`
  (radius in km, default 100, nearest first) then
  `client.weather.filterWeatherData(stations[0].uuid, { period })` gives
  hourly rows. Pass them as `weatherData` with the same `dateFilters`. Or
  bring an `.epw` file: `client.weather.parseEpw(text)` as `weather`.
- Cost: `client.previewAreaWithPricing(polygon, { analysisType })` ->
  `{ tileCount, estimatedCostTokens, estimatedTimeS }`. Facades:
  `client.previewAreaBatches(input, polygon, { buildings })` ->
  `{ plannedJobCount, estimatedCostTokens, sensorCount }`.
- Progress: `options.onProgress(state)` with `completedCount`, `totalCount`.
  Cancel: `options.signal` (an `AbortSignal`).
- Errors are typed: `ReadMarginError`, `AreaTimeoutError`, `JobFailedError`,
  `GeodataError` (and subclasses), `WeatherServiceError`,
  `WeatherModelInputsError`, `EpwParseError`. Show `err.message` to the user.
- A run above 100 tiles is refused with a message that names the cost; pass
  `maxTilesOverride` only when the user agrees to that cost.

## Analysis types and their required inputs

`dateFilters: { period: { start: { month, day, hour }, end: { month, day, hour } } }`
selects month AND day AND hour ranges (a mask, not a span). It cannot wrap
the year (Dec -> Jan): split it into two runs.

| analysisType | Needs | Unit / output | Notes |
|---|---|---|---|
| `direct-sun-hours` | `latitude`, `longitude`, `dateFilters` (the solar TIME PERIOD). No weather. | hours | Keep the hours between sunrise and sunset: night hours count as sun. Max = number of hours in the window. |
| `daylight-availability` | `latitude`, `longitude`, `dateFilters`. No weather. | % | |
| `sky-view-factors` | nothing extra | % of open sky, 0-100 | Cheapest to explain. |
| `solar-radiation` | `latitude`, `longitude`, `dateFilters`, `weatherData` (station rows) or `weather` (EPW) | kWh/m² | Weather is REQUIRED. |
| `wind-speed` | `windSpeed` (m/s, number), `windDirection` (whole degrees, where the wind comes FROM: 270 = west) | m/s | Buildings only. Several tiles: `strategy: 'directional_blend', windDirectionDeg`. |
| `pedestrian-wind-comfort` | `criteria` (`lawson-2001`, `lawson-lddc`, `lawson-1970`, `davenport`, `vdi-3787`, `nen-8100-comfort`, `nen-8100-safety`; exact spelling), and a WIND ROSE: `weatherData` rows + `dateFilters` (the SDK builds the paired `windSpeed`/`windDirection` lists), or set both lists yourself | comfort class | Buildings only. About 50 AItokens per tile. |
| `thermal-comfort-index` (UTCI) | `latitude`, `longitude`, `dateFilters`, `weatherData` or `weather` | °C UTCI | Pass buildings, trees AND ground materials. |
| `thermal-comfort-statistics` | as UTCI, plus `subtype` (`thermal-comfort`, `heat-stress` or `cold-stress`) | % of hours | Long windows are slow. |

Wind analyses ignore trees and ground materials. Solar, daylight, sky view
and thermal use trees. Only the two thermal analyses use ground materials.

Use a FIXED colour range per analysis so runs compare (sun hours 0 to window
hours, wind 0-15 m/s, UTCI about -40 to 46 °C, SVF / daylight 0-100).

## Area sizes and cost

- Solar, daylight and thermal tiles: 512 m x 512 m. Smaller costs the same.
  Default to a 512 m square (`squareAround(center, 512)`).
- Wind tiles: 256 m apart with overlap. 512 m square = 4 tiles, 256 m = 1.
- About 10 AItokens per tile; `pedestrian-wind-comfort` about 50. Facade runs
  bill per building batch (dense areas: more jobs).

## Good default prompts to suggest

- "Add a sky view factor page that works like the Sun hours page."
- "Let me upload my own .epw weather file in the UTCI page."
- "Compare two dates for sun hours and show the difference map."
- "Add a button that downloads the result as a PNG."
- "Save the last result in the browser so a reload keeps it."

## Security and data rules

- Never print, log or commit keys, tokens or presigned URLs.
- `.dev.vars` and `.env` are gitignored. Keep it that way.
- The deployed Worker is not protected by a login: tell the user that anyone
  with the URL can spend their tokens, and suggest Cloudflare Access.
- Maintainers can point the Worker at another API (for example staging) with
  `INFRARED_BASE_URL` in `.dev.vars`.

## Advanced

- `@infrared-city/infrared-sdk-ts/worker` runs the SDK in a Web Worker
  (`serveSdkWorker()` in the worker file, `createWorkerClient({ worker,
  module, config })` on the page) so big sites do not freeze the page. Its
  `fetch` must forward `init.signal`, and it needs the same S3 rewrite.
- `client.runArea(...)` returns a schedule you can save
  (`areaScheduleToJSON`) and merge later (`client.mergeAreaJobs`).
- `renderGridPng(grid2d, { analysisType })` renders with Infrared's own
  colour registry.
- The reference app (`apps/base/client`) follows a plugin architecture:
  primitives never import interfaces, interfaces never import apps. See
  `apps/base/client/docs/DOMAIN_TEMPLATE.md` and `docs/cloudflare.md`.
