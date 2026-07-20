# @forge-kit/ground-materials

Ground materials processing for the Infrared platform — GeoJSON parsing, material registry, Zod validation schemas, and Mapbox draw integration.

## Installation

Nothing to install — this is a workspace package, consumed from source via
the aliases in `apps/base/client/vite.aliases.ts` (and the matching tsconfig
`paths`).

## Subpath Exports

| Import | Description |
|--------|-------------|
| `@forge-kit/ground-materials` | Full barrel — core + react + plugin |
| `@forge-kit/ground-materials/core` | Framework-agnostic: material registry, GeoJSON parsing, Zod schemas. No React/Zustand. Safe for Node.js. |
| `@forge-kit/ground-materials/react` | React hooks, Zustand store, Mapbox draw integration, query hooks |

## Peer Dependencies

Full usage requires `react`, `zustand`, `@tanstack/react-query`, and `mapbox-gl`. All are marked optional — the `./core` subpath works without any of them.

## Headless / Node.js Usage

```ts
import {
  GROUND_MATERIAL_REGISTRY,
  GROUND_MATERIAL_LIST,
  parseGeoJsonFile,
  processImportedFeatures,
  processMultiMaterialImport,
  FeatureCollectionSchema,
  MultiMaterialImportSchema,
} from '@forge-kit/ground-materials/core'

// Access the full material registry
for (const material of GROUND_MATERIAL_LIST) {
  console.log(material.name, material.color, material.albedo)
}

// Parse and validate a GeoJSON file (single FeatureCollection shape)
const result = await parseGeoJsonFile(file)
if (result.ok) {
  const processed = processImportedFeatures(
    result.featureCollection,
    boundaryViewport,
    metersToLatLng,
  )
}

// Validate with Zod schemas
const validated = FeatureCollectionSchema.parse(geojson)
const multi = MultiMaterialImportSchema.parse(rawObject)
```

### Material registry

```ts
import {
  GROUND_MATERIAL_REGISTRY,
  GROUND_MATERIAL_ORDER,
  mapNamesToUuids,
  mapUuidsToNames,
} from '@forge-kit/ground-materials/core'

// Registry is keyed by UUID
const asphalt = GROUND_MATERIAL_REGISTRY['asphalt-uuid']

// Convert between names and UUIDs
const uuids = mapNamesToUuids(['asphalt', 'grass'], GROUND_MATERIAL_REGISTRY)
const names = mapUuidsToNames(uuids, GROUND_MATERIAL_REGISTRY)
```

### GeoJSON import utilities

```ts
import {
  detectNonWgs84,
  filterPolygonFeatures,
  ensureFeatureUuids,
  buildBoundaryPolygon,
} from '@forge-kit/ground-materials/core'

// Detect if coordinates are not in WGS84
const isProjected = detectNonWgs84(featureCollection)

// Filter to polygon features only
const polygons = filterPolygonFeatures(featureCollection)

// Ensure all features have unique IDs
const withIds = ensureFeatureUuids(polygons)
```

## GeoJSON Import

Imported polygons flow through the same draw + commit pipeline as user-drawn ones, so the result is indistinguishable downstream (analysis payload, picking, edit/delete). Two upload shapes are supported on the same drop zone via a Single / Multi-material tab toggle. Each upload offers a per-upload **Replace** vs **Add** mode: Replace wipes every existing draw feature before committing the new ones; Add merges them on top of the current state.

### Single FeatureCollection with per-feature `material`

When the file is a `FeatureCollection` whose features carry a `properties.material` string, each feature is routed to the matching registry entry. Unknown / missing names fall back to the currently-selected panel material (or `DEFAULT_FALLBACK_MATERIAL` = `"asphalt"` if nothing is selected). When every feature has a valid known label the panel material picker is hidden — there is nothing to pick.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "material": "asphalt" },
      "geometry": { "type": "Polygon", "coordinates": [/* ... */] }
    },
    {
      "type": "Feature",
      "properties": { "material": "grass" },
      "geometry": { "type": "Polygon", "coordinates": [/* ... */] }
    }
  ]
}
```

Pipeline (`processImportedFeatures`):

1. Filter non-polygon features (whole-file reject if mixed-geometry).
2. Flatten MultiPolygons into individual Polygons (parent properties — including `material` — are copied to each child).
3. Truncate at the global `MAX_POLYGON_COUNT` cap.
4. Clip to the project boundary; drop polygons fully outside.
5. Mark self-intersecting polygons invalid (kinks) — kept in output but block Save Changes until edited.
6. Assign UUIDs via `ensureFeatureUuids`.

Returns `ProcessResult { features, warnings, filteredNonPolygonCount, outsideBoundaryCount, invalidCount }`.

### Multi-material dict `{ name: FeatureCollection }`

When the file is a plain object whose values are themselves FeatureCollections, the top-level key is the material name for every feature inside that group. This is convenient when the source data already has one collection per material — no per-feature `material` property required.

```json
{
  "asphalt": {
    "type": "FeatureCollection",
    "features": [/* polygons */]
  },
  "grass": {
    "type": "FeatureCollection",
    "features": [/* polygons */]
  }
}
```

Pipeline (`processMultiMaterialImport`):

- Validated by `MultiMaterialImportSchema` (Zod `z.record(z.string(), FeatureCollectionSchema)`).
- The group key is injected into every PARENT feature's `properties.material` BEFORE flatten, so MultiPolygon children inherit the right group.
- The same filter → flatten → clip → kinks-mark pipeline runs once per group.
- `MAX_POLYGON_COUNT` is enforced on the AGGREGATE output (not per group); later groups are truncated first when the limit is hit.
- Empty groups emit a group-prefixed warning and are dropped silently.
- Duplicate keys in the JSON are resolved by the JSON parser (last-wins). No pre-parse detection.

Returns `MultiMaterialProcessResult { features, warnings, invalidCount, groupStats: Record<string, { in: number; out: number }> }`.

> The shared filter→flatten→clip→kinks-mark pipeline (`runImportPipeline`) is internal to the package and not part of the public surface.

## React Usage

```ts
import { useGroundMaterialsMapPlugin } from '@forge-kit/ground-materials'
import type { GroundMaterialsDeps } from '@forge-kit/ground-materials'

// In your composition root:
const deps: GroundMaterialsDeps = {
  apiClient,
  getViewport: () => viewport,
  getPolygon: () => polygon,
  // ... other deps
}

const groundMaterialsPlugin = useGroundMaterialsMapPlugin(deps)
// Returns a MapPlugin with draw controls and material panel
```

### Area fetch: swappable `clean-v3` cleaner

`useGroundMaterialsAreaMutation(sdkClient, cleanOptions?)` fetches + cleans
ground materials over a polygon via a single whole-AOI SDK `getRaw` call
(`source: 'fgb'` → Overture, R2-file-indexed — NOT the tiled, Mapbox-default
`getArea` fan-out), then runs `clean-v3` over the result. The optional second
argument forwards a swappable clean-v3 backend to the SDK (needs
`@infrared-city/infrared-sdk-ts` ≥ 0.12.2):

```ts
const mutation = useGroundMaterialsAreaMutation(sdkClient, {
  cleaner, // a GroundMaterialCleaner (e.g. a Web Worker bridge running cleanV3Local)
  zStep,   // per-layer z-step for local/custom cleaners (ignored by the remote cleaner)
})
```

**Omit `cleanOptions` (or `cleaner`) to preserve the default behaviour** — the
SDK's remote gateway `clean-v3`. Supplying a cleaner lets the caller run the
clip client-side (e.g. off the main thread in a worker). The primitive stays
free of a hard SDK dependency: the cleaner is typed by the local structural
`GroundMaterialCleanerLike` interface.

The `mutate` input also accepts a per-call object `{ polygon, shouldCommit? }`
(in addition to the hook-level `cleanOptions`). `shouldCommit: () => false` skips
the global-store write but still returns the full result, so a suppress-and-keep
caller (e.g. a scenario-keyed slot writer) can build its own slot:

```ts
mutation.mutate({ polygon, shouldCommit: () => stillCurrent })
```

### Import: committing previews from the draw hook

`useGroundMaterialsDraw()` exposes three sibling helpers that commit a set of `addPreviewFeatures`-created previews back into the draw layer. Pick the one that matches the upload mode:

| Helper | Material source | Returns |
|--------|-----------------|---------|
| `confirmPreviewFeatures(materialName, ids)` | One name applied to all | `void` |
| `confirmPreviewFeaturesPerFeature(ids)` | Each feature's `properties.material` | `{ ids: string[]; warning: string \| null }` |
| `replaceAllWithPreview(ids, materialFor, materialName?)` | `'global'` or `'per-feature'` | `{ ids: string[]; warning: string \| null }` — wipes existing features first, in a single store transaction |

```ts
import {
  useGroundMaterialsDraw,
  resolvePerFeatureMaterials,
  buildFallbackWarning,
  DEFAULT_FALLBACK_MATERIAL,
} from '@forge-kit/ground-materials/react'

const draw = useGroundMaterialsDraw(deps)

// Add mode, single material across all imported features:
draw.confirmPreviewFeatures('asphalt', previewIds)

// Add mode, per-feature routing from `properties.material`:
const { ids, warning } = draw.confirmPreviewFeaturesPerFeature(previewIds)
if (warning) toast.warning(warning)

// Replace mode, per-feature routing — single React render:
const result = draw.replaceAllWithPreview(previewIds, 'per-feature')
```

`resolvePerFeatureMaterials(features, registry, currentMaterial)` is the pure helper the per-feature confirmers use under the hood. It returns a `PerFeatureMaterialResolution` you can introspect (`assignments`, `unknownNames`, `missingCount`, `usedFallback`, `fallbackMaterial`) and pair with `buildFallbackWarning(resolution)` to produce the aggregated toast string yourself. The fallback chain is: feature label → panel `currentMaterial` → `DEFAULT_FALLBACK_MATERIAL`.

> The `*PerFeature` and `replaceAllWithPreview` return shape (`{ ids, warning }`) is intentionally different from the original `confirmPreviewFeatures`, which returns `void`. The fallback warning is single-string aggregated across all features — emit it once.

### Zustand store

```ts
import { useGroundMaterialsStore } from '@forge-kit/ground-materials/react'

const features = useGroundMaterialsStore((s) => s.features)
```

## Development

```bash
bun run --cwd packages/primitives/ground-materials build
bun run --cwd packages/primitives/ground-materials typecheck
bun run --cwd packages/primitives/ground-materials test:run
```
