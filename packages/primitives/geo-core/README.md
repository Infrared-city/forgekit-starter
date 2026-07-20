# @forge-kit/geo-core

Shared low-level utilities for the geometry primitives (buildings, vegetation,
ground-materials). Single flat entry — `import { … } from '@forge-kit/geo-core'`;
no `/core` / `/react` subpaths, no React dependency anywhere.

## Why it exists

Buildings, trees, and surfaces must project from the **identical** SW-corner
origin to share one METER_OFFSETS depth space on the map. This package is the
single source of truth for that projection — and, since 2026-07, for the
shared cooperative time-slicer the primitives use on their render-adjacent
CPU hot paths.

## API

### Projection

| Export | What |
|---|---|
| `computeOriginFromPolygon(polygon)` | `[lng, lat]` SW corner of a boundary polygon — THE shared origin. |
| `computeOriginFromViewport(viewport)` | SW corner from a center-based viewport with metre extents (pre-boundary flows). |
| `metersPerDegLng(lat)` / `METERS_PER_DEG_LAT` | Tangent-plane projection constants. |

### Time-slicing (`timeslice.ts`)

| Export | What |
|---|---|
| `createTimeSlicer(opts)` | Cooperative slicer for per-item CPU loops: call `await slicer.checkpoint()` once per item; it yields to the event loop every `sliceMs` (default 12 ms, MessageChannel hop) and resolves `false` when `opts.shouldAbort()` asks the loop to abandon (callers return `null`). |
| `TimeSliceOpts` / `TimeSlicer` | Options (`sliceMs`, `shouldAbort`, injectable `yieldNow` for tests) and the slicer handle. |

Use the slicer when the inputs are plain objects/arrays (GeoJSON, `number[]`
meshes) — structured-cloning those across a worker boundary costs about as
much main-thread time as the work itself, so a worker is the wrong tool.
Consumers: `mergeBuildingsChunked` / `filterBuildingsByPolygonChunked`
(buildings), `mergeVegetationMeshesChunked` (vegetation),
`clipAreaLayersToPolygonChunked` (ground-materials). Each chunked twin shares
its per-item step with its synchronous original and pins output equality in
tests — copy that pattern for new consumers.

## Development

```bash
bun run --cwd packages/primitives/geo-core build
bun run --cwd packages/primitives/geo-core test:run
```
