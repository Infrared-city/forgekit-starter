# @forge-kit/buildings

Buildings geometry processing for the Infrared platform — mesh transforms, coordinate math, DotBim parsing, and deck.gl layers.

## Installation

Nothing to install — this is a workspace package, consumed from source via
the aliases in `apps/base/client/vite.aliases.ts` (and the matching tsconfig
`paths`).

## Subpath Exports

| Import | Description |
|--------|-------------|
| `@forge-kit/buildings` | Full barrel — core + react + plugin |
| `@forge-kit/buildings/core` | Framework-agnostic: mesh transforms, coordinate math, DotBim parsing. No React/Zustand/deck.gl. Safe for Node.js. |
| `@forge-kit/buildings/react` | React hooks, Zustand store, deck.gl layers |

## Peer Dependencies

Full usage requires `react`, `zustand`, `@tanstack/react-query`, `deck.gl`, and `@deck.gl/*` packages. All are marked optional — the `./core` subpath works without any of them.

## The contract (data + fetch + render, persistence-agnostic)

This primitive — like `@forge-kit/vegetation` and `@forge-kit/ground-materials` — follows the **store + explicit mutation + render-from-store** contract. The primitive provides the data lane; the consuming app picks the storage lane.

```
┌──────────────────────────────────────────────────────────────────┐
│  useBuildingsMutation(sdk).mutate(polygon)                       │  ← consumer triggers
│           │                                                       │
│           ▼ writes on success                                     │
│  useBuildingsStore  { buildings, allBuildings, status, ... }     │  ← single source of truth
│           ▲                            │                          │
│  consumer │ persists wherever          │ plugin reads             │
│           │ they want (R2, IDB, ...)   ▼                          │
│  warehouse / IDB / S3 / nothing    deck.gl SimpleMeshLayer        │
└──────────────────────────────────────────────────────────────────┘
```

**The primitive does NOT prescribe a cache strategy.** Apps decide:
- `apps/platform` persists to its R2 warehouse (chokepoint 6) — uses the warehouse adapter in `apps/platform/client/src/composition/geometry-layer-registry.ts`.
- `apps/base` uses React Query's IDB persister — the deprecated `useBuildingsInArea` (`useQuery`) wraps the same fetch and writes to the store.
- An external consumer could use localStorage, S3, none-at-all.

## Headless / Node.js Usage

```ts
import {
  computeOriginFromPolygon,
  dotBimToSimpleMesh,
  mergeBuildings,
  computeMeshCentroid,
} from '@forge-kit/buildings/core'

// Compute a local-coordinate origin from a GeoJSON polygon
const origin = computeOriginFromPolygon(polygon)

// Parse a DotBim mesh into a simple indexed format
const mesh = dotBimToSimpleMesh(dotBimData)

// Merge multiple building meshes into a single geometry
const merged = mergeBuildings(meshes, origin)

// Get the centroid of a mesh for camera targeting
const center = computeMeshCentroid(mesh)
```

### Mesh transforms

```ts
import { applyTransform, rotateMesh, translateMesh } from '@forge-kit/buildings/core'

const rotated = rotateMesh(mesh, Math.PI / 4, [0, 0, 1])
const moved = translateMesh(mesh, [10, 20, 0])
const transformed = applyTransform(mesh, { rotation, translation, scale })
```

## React Usage

### Recommended: explicit-trigger mutation (matches vegetation + ground-materials)

```ts
import { useBuildingsMapPlugin, useBuildingsMutation, useBuildingsStore } from '@forge-kit/buildings'

// In your composition root:
const mutation = useBuildingsMutation(sdkClient)
const { plugin } = useBuildingsMapPlugin(deps)

// Read data from the store (plugin reads from here too):
const { buildings, status } = useBuildingsStore((s) => ({ buildings: s.buildings, status: s.status }))

// Fire the SDK when YOU decide — once at project-create, on user click, etc:
mutation.mutate(polygon)
```

### Deprecated: auto-firing React Query variant

```ts
import { useBuildingsInArea } from '@forge-kit/buildings'

// Auto-fires when polygon is non-null. Convenient for demos, but
// bakes React Query in as the cache strategy. Mirrors data into
// `useBuildingsStore` on success so the plugin's read path stays
// uniform.
const { data, isLoading } = useBuildingsInArea(polygon, sdk)
```

Use `useBuildingsMutation` in new code. `useBuildingsInArea` is retained for `apps/base` back-compat — it will be removed once that app migrates.

### Zustand store

```ts
import { useBuildingsStore } from '@forge-kit/buildings/react'

// Read the data slice — set by either mutation hook above.
const buildings = useBuildingsStore((s) => s.buildings)            // filtered to polygon
const allBuildings = useBuildingsStore((s) => s.allBuildings)      // unfiltered (tile-based)
const status = useBuildingsStore((s) => s.status)                  // 'idle' | 'loading' | 'ready' | 'error'

// Per-mesh translation/rotation overrides (independent of data slice)
const transforms = useBuildingsStore((s) => s.buildingTransforms)
```

### deck.gl layers

```ts
import { createBuildingsLayer, createBuildingMeshLayers } from '@forge-kit/buildings/react'

// SimpleMeshLayer for building meshes
const layers = createBuildingMeshLayers(meshes, options)
```

## Development

```bash
bun run --cwd packages/primitives/buildings build
bun run --cwd packages/primitives/buildings typecheck
bun run --cwd packages/primitives/buildings test:run
```
