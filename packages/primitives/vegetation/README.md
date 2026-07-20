# @forge-kit/vegetation

Vegetation primitive for the Infrared platform — tree GeoJSON parsing, per-feature DotBim mesh sizing, deck.gl 3D tree layer, and import pipeline for user-uploaded tree files.

## Installation

Nothing to install — this is a workspace package, consumed from source via
the aliases in `apps/base/client/vite.aliases.ts` (and the matching tsconfig
`paths`).

## Subpath Exports

| Import | Description |
|--------|-------------|
| `@forge-kit/vegetation` | Full barrel — core + react + plugin |
| `@forge-kit/vegetation/core` | Framework-agnostic: mesh builder, geo utils, Zod parser, import pipeline. No React/Zustand. Safe for Node.js. |
| `@forge-kit/vegetation/react` | React Query mutation, Zustand store, deck.gl layer factory |

## Peer Dependencies

Full usage requires `react`, `zustand`, `@tanstack/react-query`, `deck.gl` (`@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/mesh-layers`). All are marked optional — the `./core` subpath works without any of them.

## Headless / Node.js Usage

```ts
import {
  computeOriginFromPolygon,
  featuresToDotBimMeshes,
  featuresToDotBimMeshesWithStats,
  parseTreesGeoJson,
  processImportedTrees,
  needsFallbackPrompt,
  TreesFeatureCollectionSchema,
  MAX_TREE_COUNT,
} from '@forge-kit/vegetation/core'

// Build per-tree DotBim meshes from a feature dict (SDK or import shape).
const origin = computeOriginFromPolygon(polygon)
const meshes = featuresToDotBimMeshes(featuresById, origin)

// Same call, also returns the template cache size for instrumentation.
const { meshes, templateCount } = featuresToDotBimMeshesWithStats(featuresById, origin)

// Validate a raw object against the schema directly.
const parsed = TreesFeatureCollectionSchema.parse(raw)
```

### Per-feature mesh sizing

`featuresToDotBimMeshes(features, origin, opts?)` reads `properties.height` and `properties.crownDiameter` per feature and builds a tree mesh sized to those values. Missing / non-finite / out-of-range values fall back to the merged defaults — SDK-fetched trees (which carry no props) all collapse to a single shared template and keep the original fast path.

| Property | Range (m) | Fallback |
|----------|-----------|----------|
| `height` | `[1, 30]` | `defaults.trunkHeight` (2.5 m) |
| `crownDiameter` | `[1, 20]` | `2 * defaults.canopyRadius` (4.0 m) |

Templates are cached per call, keyed by `(height, crownDiameter)` rounded to the nearest **0.5 m**, so imports with many slightly-different sizes still hit a bounded number of template builds. The cache is function-scoped — no module-level state. `featuresToDotBimMeshesWithStats(...)` returns `{ meshes, templateCount }` for asserting cache bucketing in tests.

Options shape (`FeaturesToDotBimMeshesOptions`) is `{ defaults?: TreeMeshOptions }`. Override individual dimensions:

```ts
featuresToDotBimMeshes(features, origin, {
  defaults: { trunkRadius: 0.3, canopyRadius: 2.5 },
})
```

## GeoJSON Import

Trees are imported from a `.geojson` file containing **Point** features only. Each point's `properties.height` and `properties.crownDiameter` drives the per-tree mesh size; missing values prompt the user once for a fallback pair per file.

### Property contract

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "height": 12.5, "crownDiameter": 6 },
      "geometry": { "type": "Point", "coordinates": [13.405, 52.52] }
    }
  ]
}
```

- `height` and `crownDiameter` accept both numbers and numeric strings (e.g. `"12.5"`) — the schema is intentionally loose, and `Number()` coercion + range-check + fallback all happen during `processImportedTrees`, not during parsing.
- Out-of-range values (`height ∉ [1, 30]`, `crownDiameter ∉ [1, 20]`) are treated as invalid and replaced with the user fallback, with a warning. Both dimensions are replaced together to keep tree proportions intact.
- Mixed-geometry files (any non-Point feature) are rejected wholesale with a geometry-named error.
- File-size cap: 5 MB.
- Post-clip cap: `MAX_TREE_COUNT` (500) trees per file — excess features are dropped with a warning.

### Pipeline functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `parseTreesGeoJson(file)` | Read + validate; wraps bare Feature / bare Point geometry; rejects mixed-geometry; enforces 5 MB cap | `Promise<TreeParseResult>` (discriminated `{ ok: true; featureCollection } \| { ok: false; error }`) |
| `needsFallbackPrompt(fc)` | Scan for missing / non-finite / out-of-range `height` or `crownDiameter` | `boolean` |
| `processImportedTrees(fc, polygon, fallback)` | Coerce + fallback per feature → clip to polygon → cap → assign UUIDs | `ProcessTreesResult` |
| `ensureTreeFeatureUuids(features)` | Assign v4 UUIDs to features missing a valid id (mutates in place) | `Array<Record<string, unknown>>` |

`ProcessTreesResult` shape:

```ts
{
  features: Array<Record<string, unknown>>  // ARRAY — caller dict-keys by id
  warnings: string[]
  droppedOutsideCount: number               // points outside the polygon
  fallbackAppliedCount: number              // features that used fallback values
  invalidCount: number                      // reserved; always 0 today
}
```

`processImportedTrees` accepts either a `Polygon` geometry or a `Feature<Polygon>` for the polygon arg.

## React Usage

```ts
import { useVegetationMapPlugin } from '@forge-kit/vegetation'
import type { VegetationDeps } from '@forge-kit/vegetation'

// In your composition root:
const deps: VegetationDeps = {
  sdkClient,
  getPolygon: () => polygon,
  // ... other deps
}

const vegetationPlugin = useVegetationMapPlugin(deps)
// Returns a MapPlugin with the 3D tree layer (no Panel — UI mounts in the app).
```

### Tree import: end-to-end recipe

This is the canonical consumer recipe locked in by the in-app `ImportTreesSection`. Mirror it in any tree-import UI:

```ts
import {
  computeOriginFromPolygon,
  featuresToDotBimMeshes,
  needsFallbackPrompt,
  parseTreesGeoJson,
  processImportedTrees,
  stablePolygonKey,
  type TreeFallback,
} from '@forge-kit/vegetation/core'
import { isPolygonSafeToFetch, useVegetationStore } from '@forge-kit/vegetation/react'

async function importTrees(
  file: File,
  polygon: GeoJSON.Polygon,
  mode: 'replace' | 'add',
) {
  // 0. Gate on a safe analysis polygon (valid, non-self-intersecting).
  if (!isPolygonSafeToFetch(polygon)) {
    return toast.error('Draw a valid polygon first.')
  }

  // 1. Parse + narrow.
  const parsed = await parseTreesGeoJson(file)
  if (!parsed.ok) return toast.error(parsed.error)

  // 2. Optional fallback prompt.
  let fallback: TreeFallback = { height: 10, crownDiameter: 5 }
  if (needsFallbackPrompt(parsed.featureCollection)) {
    const picked = await promptForFallback() // your UI
    if (!picked) return // cancel aborts upload
    fallback = picked
  }

  // 3. Run the import pipeline.
  const result = processImportedTrees(parsed.featureCollection, polygon, fallback)
  for (const w of result.warnings) toast.warning(w)
  if (result.features.length === 0) return

  // 4. Merge into the existing features dict.
  const incoming = Object.fromEntries(
    result.features.map((f) => [String(f.id), f]),
  )
  const existing = useVegetationStore.getState().features ?? {}
  const merged = mode === 'replace' ? incoming : { ...existing, ...incoming }

  // 5. Build per-tree meshes in local metres.
  const meshes = featuresToDotBimMeshes(merged, computeOriginFromPolygon(polygon))

  // 6. Commit in a single store write.
  useVegetationStore
    .getState()
    .setMeshes(meshes, merged, Object.keys(merged).length, stablePolygonKey(polygon))
}
```

Notes:

- `useVegetationStore.features` is `Record<string, Record<string, unknown>> | null` — a dict keyed by feature `id`, nullable when the store hasn't received any features yet.
- `setMeshes(meshes, features, totalTrees, polygonKey)` is the 4-arg signature — passing the features dict alongside the meshes keeps the analysis run able to forward imported trees through `getVegetation` without re-fetching.
- `stablePolygonKey(polygon)` (core export) produces a stable cache key for the polygon. `isPolygonSafeToFetch(polygon)` (react export) is the documented gate before any import, mirroring how the SDK fetch path gates itself.
- Replace mode wipes BOTH SDK-fetched trees and previously imported ones (single `features` dict, no source discriminator). The user can re-fetch SDK trees after.

### Zustand store

```ts
import { useVegetationStore } from '@forge-kit/vegetation/react'

const features = useVegetationStore((s) => s.features)
const meshes = useVegetationStore((s) => s.meshes)
const status = useVegetationStore((s) => s.status)
```

### SDK fetch

```ts
import { useVegetationMeshesMutation } from '@forge-kit/vegetation/react'

const mutation = useVegetationMeshesMutation(sdkClient)
mutation.mutate(polygon) // fetches SDK trees, clips to polygon, writes store

// Or the object form for advanced control:
mutation.mutate({
  polygon,
  shouldCommit: () => stillCurrent, // skip the store write if context changed
})
```

## Development

```bash
bun run --cwd packages/primitives/vegetation build
bun run --cwd packages/primitives/vegetation typecheck
bun run --cwd packages/primitives/vegetation test:run
```
