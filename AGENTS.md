# forgekit-starter — guide for AI coding tools

You help a person who is new to coding build a small app on Infrared's urban
microclimate SDK. Keep changes small, keep the app running, and explain what
you did in plain words. Read this whole file before the first edit.

## The five rules

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
   `client.previewAreaBatches`; see "SDK reference" below). Never start runs
   in a loop, on page load, or in tests. Never repeat a submit that had an unknown result: poll the jobs.
4. **Never deploy an open Worker.** The Worker adds the owner's key to every
   request, so an unprotected deployed Worker lets anyone with its URL spend
   the owner's tokens. Before any deploy (`wrangler deploy`, `npm run
   deploy*`), make sure the user has set `APP_PASSWORD`
   (`npx wrangler secret put APP_PASSWORD --env production`) and
   `ALLOWED_ORIGINS` to their own site (Cloudflare Access is better still).
   The Worker fails closed (503 without `APP_PASSWORD`); NEVER weaken that
   check, and NEVER put `ALLOW_OPEN_PROXY_FOR_LOCAL_DEV` in `wrangler.toml`
   or a deployed environment. If the password is missing, STOP and tell the
   user the risk in plain words. See README "Deploy".
5. **Pass the geometry explicitly.** Read buildings / trees / ground with the
   SDK (or use the user's own), then pass the returned objects to the run.

## Layout

```
apps/examples/        START HERE. React + Vite + Leaflet: demo explorer + 4 example pages. Port 3002.
  src/demo/             the demo site: scene-layout.ts (plain numbers), scene.ts + ground.ts
                        (-> SDK inputs), analyses.ts (one request builder per analysis)
  src/explorer/         the demo explorer page (plan map, 3D view, legends, difference maps)
  public/demo-results/  pre-computed results + manifest.json (generated, do not edit by hand)
  scripts/precompute-demo.ts   runs the demo analyses and writes public/demo-results/
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

## Demo explorer and variants

The `#demo` page shows pre-computed results for a synthetic 512 m site. It
never calls the API on load (the "Run it yourself" button is the only paid
path, and it asks for a cost check first). The scene is plain SDK input:
buildings are `{ id: { mesh_id, coordinates, indices } }` in metres from the
site's south-west corner, trees are GeoJSON points (`height_m`, `diameter_m`,
`genus`), ground materials are non-overlapping GeoJSON layers, and the hill is
`groundGeometry` with `terrainAlignment: 'auto-align'`. Keep the generator
deterministic (seeded random, no `Math.random`): the stored results are only
valid for the exact scene (`sceneHash` in the manifest).

**Add a variant** (for example "fewer cars", "a new tower"):

1. `src/demo/scene.ts`: add the name to `Variant`, `VARIANTS` and
   `VARIANT_INFO` (label + one plain sentence of what changes).
2. Put the new numbers in `src/demo/scene-layout.ts` and branch on the variant
   where the scene is built: `groundClass` in `ground.ts` (materials),
   `sceneTrees` / `buildingBoxes` in `scene.ts` (trees, buildings). Change
   ONLY what the variant is about; everything else must stay identical, or
   the difference map shows noise.
3. Check the cost, then run only the new variant (spends AItokens; use a
   staging key if you are a maintainer):
   `npm run demo:precompute --workspace apps/examples -- --preview --variant <name>`, then
   `... -- --run --variant <name>`. The wind models read buildings only: the
   script skips them for a variant, and the explorer shows the baseline.
4. `npm run demo:precompute --workspace apps/examples -- --refresh-manifest`
   must print no `OUT OF DATE` line. The explorer picks the variant up from
   `VARIANTS` (buttons and difference map); nothing else to wire.

If you change the baseline scene or an analysis period, rerun the affected
analyses with `--run --force --only <ids>`. Look at the maps before you
commit: shadows must fall away from the sun, buildings must sit in the holes
of the grid (NaN), and the difference must be zero away from the change.

## SDK reference

For `@infrared-city/infrared-sdk-ts` 0.12.13-next.18 (the copy in
`packages/sdk`). This section is the one complete reference: README and the
code comments link here. Every snippet compiles against `packages/sdk`, and
every request shape passes the SDK's own validators (`prepareAreaPayload`).

### Basics

- The SDK is WASM-first. `initializeCore({ url })` must finish before tiling,
  merge or geometry work. `getClient()` in `src/lib/infrared.ts` does it once.
- An **area run** cuts a GeoJSON polygon into tiles, submits one job per
  tile (facade runs: one job per building batch), polls, and merges.
- GeoJSON order is ALWAYS `[longitude, latitude]` (WGS84).
- The run reads nothing by itself. Pass buildings, trees and ground materials
  in `options`. If you leave out `buildings`, the model sees an empty site.
- The **site frame** is metres from the south-west corner of the polygon's
  bounding box: x east, y north, z up. Your own meshes, the terrain and the
  facade results use it.

### An area run, end to end

```ts
import {
  AreaTimeoutError,
  JobFailedError,
  ReadMarginError,
  SubmissionUncertainError,
} from '@infrared-city/infrared-sdk-ts'
import { squareAround } from '../lib/geo'
import { errorText, getClient } from '../lib/infrared'

const client = await getClient()
const center = { lat: 48.2082, lon: 16.3738 }
const polygon = squareAround(center, 512) // coordinates are [lon, lat]

// 1. Free cost check. Show it, and run only when the user agrees.
const cost = await client.previewAreaWithPricing(polygon, { analysisType: 'direct-sun-hours' })
// cost.tileCount, cost.estimatedCostTokens, cost.estimatedTimeS, cost.tokensPerJob,
// cost.pricingSource: 'remote' (live price) or 'fallback' (the Worker did not answer)

// 2. Site data (free, no key). Read with the SAME polygon that you run.
const buildings = await client.buildings.getBuildingsInArea(polygon)
const vegetation = await client.vegetation.getArea(polygon)

// 3. Run (spends AItokens).
const stop = new AbortController() // stop.abort(): no new submits, no more waiting
try {
  const result = await client.runAreaAndWait(
    {
      analysisType: 'direct-sun-hours',
      latitude: center.lat,
      longitude: center.lon,
      dateFilters: {
        period: { start: { month: 6, day: 21, hour: 8 }, end: { month: 6, day: 21, hour: 18 } },
      },
    },
    polygon,
    {
      buildings,
      vegetation,
      signal: stop.signal,
      onProgress: (s) => console.log(`${s.completedCount} of ${s.totalCount} done`),
    },
  )
  if (!('mergedGrid' in result)) throw new Error('Expected a ground grid')
  console.log(result.gridShape, result.bounds, result.failedJobs.length)
} catch (err) {
  if (err instanceof SubmissionUncertainError) {
    // The server may have accepted jobs. Do NOT submit again: check each one
    // with client.jobs.getStatus(id) for id of err.acceptedJobIds.
  } else if (err instanceof AreaTimeoutError) {
    // err.areaState has the counts. The jobs still run (default limit: 3600 s).
  } else if (err instanceof ReadMarginError) {
    // Read the site data again with the same polygon and no smaller analysisType.
  } else if (err instanceof JobFailedError) {
    // Report the failure. Do not retry in a loop.
  }
  console.error(errorText(err)) // show err.message to the user
}
```

- `onProgress(state)`: `completedCount`, `failedCount`, `runningCount`,
  `pendingCount`, `totalCount`, `isComplete`.
- `signal` stops new submits and the wait. It does NOT cancel jobs that the
  server accepted (also a submit that was in flight): they finish and they
  bill.
- More than 100 tiles is refused, and the message names the cost. Pass
  `maxTilesOverride` only when the user agrees to that cost.
- Other typed errors: `GeodataError` (and subclasses, site data),
  `WeatherServiceError`, `WeatherModelInputsError`, `EpwParseError`,
  `JobTimeoutError`, `InvalidOptionError`. The SDK checks most request
  fields and throws a `TypeError` before it sends anything. It does not
  check `criteria` or `windDirection` (see the table below).

### Ground grid result

`runAreaAndWait` returns `{ mergedGrid, gridShape: [rows, cols], bounds?,
legend?, failedJobs, skippedJobs, executionTime }`.

- `mergedGrid` is a flat `Float32Array` or `Float64Array`, 1 m cells,
  `mergedGrid[row * cols + col]`. **Row 0 is the SOUTH edge.** Flip the rows
  to draw north-up (`gridToDataUrl` in `src/lib/colors.ts` does it).
- `NaN` = no value (for example a building footprint). Skip it in means.
- Place the image with `result.bounds` (`[west, south, east, north]`), not
  with the polygon. `bounds` is optional in the type: check it.
- `legend` is set only on class results (`pedestrian-wind-comfort`): cell
  value `i` means `legend[i]`.
- `failedJobs` lists tiles that failed. Their cells have no value.

### Facades and roofs

Put `analysisSurfaces` in the input: `'facades'` (walls), `'roofs'` or
`'all'` (the demo uses `'all'`). Only `sky-view-factors`, `solar-radiation`,
`direct-sun-hours` and `daylight-availability` accept it. The two thermal
analyses and the wind analyses refuse it.

```ts
import { isVertical, type SurfaceAnalysisResponse } from '@infrared-city/infrared-sdk-ts'

const input = {
  analysisType: 'direct-sun-hours',
  analysisSurfaces: 'all',
  latitude: center.lat,
  longitude: center.lon,
  dateFilters: {
    period: { start: { month: 3, day: 21, hour: 8 }, end: { month: 3, day: 21, hour: 17 } },
  },
}
// Facade jobs are building batches: price them with previewAreaBatches, not previewArea.
const plan = await client.previewAreaBatches(input, polygon, { buildings })
// plan.plannedJobCount, plan.sensorCount. This call is offline: its
// estimatedCostTokens uses the default price. With the price from
// previewAreaWithPricing (live when cost.pricingSource === 'remote'):
const facadeTokens = plan.plannedJobCount * cost.tokensPerJob

const r = await client.runAreaAndWait(input, polygon, { buildings, vegetation })
if (!('surfaces' in r)) throw new Error('Expected a surface result')
const facades: SurfaceAnalysisResponse = r
for (const [key, s] of Object.entries(facades.surfaces)) {
  const buildingId = key.slice(0, key.lastIndexOf('/')) // keys are "<buildingId>/<n>"
  const kind = isVertical(s) ? 'wall' : 'roof'
  for (let j = 0; j < s.nv; j++) {
    for (let i = 0; i < s.nu; i++) {
      const value = s.values[j * s.nu + i] // null = no sensor in this cell
      // Cell centre: origin + i*gridSize*uAxis + j*gridSize*vAxis.
      // Cell corners: the same with (i ± 0.5, j ± 0.5).
      void [buildingId, kind, value]
    }
  }
}
```

- Result: `{ surfaces, aggregates, sensorCount, minLegend, maxLegend }`.
  Each surface is a flat grid of `nu` x `nv` square cells of `gridSize`
  metres. `uAxis` and `vAxis` are unit vectors in the site frame.
- **`origin` is the CENTRE of cell (0, 0)**, not a corner. It sits a small
  offset (`surfaceOffset`, default about 0.1 m) outside the building.
- Wall or roof: `isVertical(s)` is true for a wall. A flat roof has both axes
  horizontal (`uAxis[2]` and `vAxis[2]` are 0).
- `aggregates` holds `{ area, mean, peak }` per building, in groups (for
  example `aggregates.buildings[buildingId]`).
- To draw: two triangles per cell (see `src/components/FacadeScene.tsx`).
  For exact cell shapes on odd walls, set `emitCellTris: true` and use
  `surfaceTriangles(s)`.

### Terrain

Put the terrain mesh in the input as `groundGeometry`, and add
`terrainAlignment`:

```ts
const terrain = {
  // x, y, z triplets in the site frame (metres); z = height.
  coordinates: [0, 0, 0, 512, 0, 0, 512, 512, 20, 0, 512, 20],
  // Triangles, counter-clockwise seen from above (normals up).
  indices: [0, 1, 2, 0, 2, 3],
}
const terrainInput = {
  analysisType: 'sky-view-factors',
  groundGeometry: { terrain },
  terrainAlignment: 'auto-align',
}
```

- `terrainAlignment`: `'auto-align'` seats buildings and trees on the
  terrain before the model runs. `'assume-aligned'` keeps your coordinates,
  and the model requires them to sit on the terrain already. `'as-is'` keeps
  your coordinates with no alignment rule. Set it explicitly.
- Accepted by `sky-view-factors`, `solar-radiation`, `direct-sun-hours`,
  `daylight-availability` and the two thermal analyses. The wind analyses
  refuse `groundGeometry`; for them `terrainAlignment` is only
  `'to-ground'` or `'as-is'`.
- The SDK refuses a terrain mesh with too many triangles. An 8 m grid over
  512 m (the demo hill) is fine.

### Your own geometry

- Buildings: `{ [id]: { mesh_id: 0, coordinates: [x, y, z, ...], indices } }`
  in the site frame. Read with the same polygon: a bare map has no frame of
  its own.
- Trees: `{ [id]: GeoJSON Point Feature }`, coordinates `[lon, lat]`,
  `properties: { height_m, diameter_m, genus }`. The genus picks the crown
  shape and whether the tree is deciduous (`Quercus`, `Tilia`, `Acer`) or
  evergreen (`Pinus`, `Picea`). A tree without a known genus counts as a
  deciduous broadleaf.
- Ground materials: `{ [layer]: GeoJSON FeatureCollection }` of polygons
  (`[lon, lat]`), with exactly these layer names: `asphalt`, `concrete`,
  `soil`, `vegetation` (grass), `water`. Any other name is refused. Keep the
  layers from overlapping.
- The objects from `client.buildings.getBuildingsInArea`,
  `client.vegetation.getArea` and `client.groundMaterials.getArea` carry
  their read margin. Pass the WHOLE object, not its inner map. The default
  read is wide enough for every analysis. A read with
  `{ analysisType: 'wind-speed' }` is smaller, and a solar or thermal run
  then throws `ReadMarginError`.

### Seasons: leaf-off trees

The model makes **deciduous** trees bare in the cold half of the year. It
picks the state from the month of `dateFilters` and the latitude:

| Latitude | Leaf-off months |
|---|---|
| north of 23.5° N | November to March |
| south of 23.5° S | May to September |
| tropics (between) | never (always leaf-on) |

- Evergreens (pines, spruces, palms) never lose their leaves.
- The TS SDK has no option to force the leaf state. It drops a `leafState` /
  `leaf-state` field from every request, so daylight, sun hours, solar and
  thermal all use the season rule. To compare leaves on and off, run two
  short windows on each side of the change (the demo uses 25-31 October and
  1-7 November). The sun changes a little between them too, so this is
  close to, but not exactly, a leaves-only difference.
- Keep a window inside one season. Do not let it cross the change.

### Time windows (`dateFilters`)

`dateFilters: { period: { start: { month, day, hour }, end: { month, day, hour } } }`

- It is a **mask, not a span**: month AND day AND hour are each a range.
  1 March 08:00 to 30 September 18:00 = hours 8-18 of days 1-30 of months
  3-9. So "20 June to 10 July" does not work as one window: split it into
  two runs (20-30 June and 1-10 July).
- Both ends are inclusive. 8:00 to 18:00 is 11 hourly steps.
- A window that wraps the year (December to January) is refused: split it
  into two runs. A day that its month does not have (31 June) is refused.
- `direct-sun-hours` counts every selected hour, also at night. Keep the
  hours between sunrise and sunset. The maximum = hours per day x days.

### Weather

- Station rows (free, no key):

  ```ts
  const period = { start: { month: 7, day: 1, hour: 13 }, end: { month: 7, day: 31, hour: 16 } }
  const stations = await client.weather.getWeatherFileFromLocation(center.lat, center.lon)
  // radius in km (default 100), at most 10 stations, nearest first
  const weatherData = await client.weather.filterWeatherData(stations[0].uuid, { period })
  const utciInput = {
    analysisType: 'thermal-comfort-index',
    latitude: center.lat,
    longitude: center.lon,
    weatherData,
    dateFilters: { period }, // the SAME period as the filter
  }
  ```

- Your own `.epw` file: `const weather = client.weather.parseEpw(text)` and
  pass `weather` (not `weatherData`) with `dateFilters`. Only
  `solar-radiation` and the two thermal analyses take an EPW. Never pass
  both `weather` and `weatherData`.
- A gap in a required weather column is refused, not filled in.

### Analysis types and their required inputs

| analysisType | Needs (besides the geometry) | Output | Notes |
|---|---|---|---|
| `direct-sun-hours` | `latitude`, `longitude`, `dateFilters`. No weather. | hours | See the night-hour rule above. |
| `daylight-availability` | `latitude`, `longitude`, `dateFilters`. No weather. | % of hours | |
| `sky-view-factors` | nothing | % of open sky, 0-100 | No time, no weather. |
| `solar-radiation` | `latitude`, `longitude`, `dateFilters`, and `weatherData` or `weather` | kWh/m² | Weather is required. |
| `wind-speed` | `windSpeed` (m/s), `windDirection` (degrees, where the wind comes FROM: 270 = west) | m/s | Buildings only. Several tiles: add `strategy: 'directional_blend', windDirectionDeg` to `options`. |
| `pedestrian-wind-comfort` | `criteria`, and a wind rose: `weatherData` + `dateFilters` (the SDK makes the `windSpeed` / `windDirection` lists), or both lists yourself | comfort class (`legend`) | Buildings only. |
| `thermal-comfort-index` (UTCI) | `latitude`, `longitude`, `dateFilters`, and `weatherData` or `weather` | °C UTCI | Uses buildings, trees AND ground materials. |
| `thermal-comfort-statistics` | as UTCI, plus `subtype`: `thermal-comfort`, `heat-stress` or `cold-stress` | % of hours | Long windows are slow. |

- `criteria`: `lawson-2001`, `lawson-lddc`, `lawson-1970`, `davenport`,
  `vdi-3787`, `nen-8100-comfort`, `nen-8100-safety`. The SDK does not check
  the spelling; the server does, after the submit.
- Use a whole number from 0 to 359 for `windDirection`. The SDK does not
  check it.
- Wind analyses use buildings only. Solar, daylight, sun hours, sky view and
  thermal use trees. Only the two thermal analyses use ground materials.
- The six thermal controls (`physics`, `wallAlbedo`, `wallAbsorptivity`,
  `canopyTransmissivity`, `groundAlbedo`, `groundDtMax`) are only for the two
  thermal analyses. Any other analysis refuses them.

Use a FIXED colour range per analysis so runs compare (sun hours 0 to the
window maximum, wind 0-15 m/s, UTCI about -40 to 46 °C, SVF / daylight 0-100).

### Area sizes and cost

- Solar, daylight and thermal tiles: 512 m x 512 m. Smaller costs the same.
  Default to a 512 m square (`squareAround(center, 512)`).
- Wind tiles: 256 m apart with overlap. 512 m square = 4 tiles, 256 m = 1.
- About 10 AItokens per job; `pedestrian-wind-comfort` about 50. The live
  price is `tokensPerJob` from `previewAreaWithPricing`.
- Facade runs bill per building batch: dense areas have more jobs.

## Good default prompts to suggest

- "Add a sky view factor page that works like the Sun hours page."
- "Let me upload my own .epw weather file in the UTCI page."
- "Compare two dates for sun hours and show the difference map."
- "Add a button that downloads the result as a PNG."
- "Save the last result in the browser so a reload keeps it."

## Security and data rules

- Never print, log or commit keys, tokens or presigned URLs.
- `.dev.vars` and `.env` are gitignored. Keep it that way.
- `APP_PASSWORD` (Worker secret) makes `/infrared/*` answer `401` unless the
  request has `X-App-Password`. Without `APP_PASSWORD` the proxy answers
  `503`, except on localhost with `ALLOW_OPEN_PROXY_FOR_LOCAL_DEV=true` in
  `.dev.vars` (local development only). The examples app sends it from the
  "App password" field (localStorage). Never put the password in code, in
  `VITE_*` variables or in the bundle. A cost check that says "offline
  estimate" means the Worker did not answer: often a wrong password.
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
