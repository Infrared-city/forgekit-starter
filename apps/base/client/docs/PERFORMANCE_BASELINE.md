# Performance Baseline

**Date:** 2026-02-19
**Commit:** 1f233be
**Branch:** fn-22-review-and-refactor-client-app-for

This document establishes performance baselines after architecture improvements (Epics fn-5, fn-22).

---

## Bundle Sizes

| Chunk | Raw (KB) | Gzip (KB) | Description |
|-------|----------|-----------|-------------|
| index-*.js | 812 KB | 252 KB | Main application bundle (app code) |
| vendor-deck-*.js | 772 KB | 204 KB | deck.gl and 3D layers |
| vendor-mapbox-*.js | 1,703 KB | 471 KB | Mapbox GL JS + react-map-gl |
| vendor-three-*.js | 73 KB | 20 KB | THREE.js (geometry ops) |
| vendor-react-query-*.js | 44 KB | 14 KB | TanStack Query |
| MapCanvas-*.js | 29 KB | 11 KB | Map canvas lazy chunk |
| geometry.worker-*.js | 73 KB | - | Web worker (separate thread) |
| mapbox-gl-*.js | 1 KB | 0.4 KB | Mapbox GL shim |
| **Total JS** | **3,507 KB** | **972 KB** | All JavaScript (incl. worker) |
| **Total JS (main thread)** | **3,434 KB** | **972 KB** | Excluding web worker |
| index.css | 33 KB | 6.3 KB | Styles |

### Observations

- **Manual chunk splitting configured** (fn-5) - deck.gl, three.js, react-query, and React are split into dedicated vendor chunks
- Main bundle reduced from 1,391 KB (pre-split monolith) to 812 KB (42% reduction)
- Chunk splitting introduces overhead (duplicate module refs, chunk loaders) that increases raw totals; this is the accepted trade-off for better caching and parallel loading
- Web worker (73 KB) runs off main thread and does not affect initial load
- **This is the accepted baseline** — previous 3,032 KB baseline was pre-chunk-splitting and is no longer comparable

---

## Layer Architecture

| Building Count | Layer Count | Notes |
|----------------|-------------|-------|
| 1 | 1 | 1 SimpleMeshLayer per building |
| 100 | 100 | N buildings = N layers |
| 500 | 500 | N buildings = N layers |
| 1000 | 1000 | N buildings = N layers |

### Current Architecture

```
buildings.layers.ts:
Object.entries(meshes).map(([meshId, mesh]) => (
  new SimpleMeshLayer({ id: `building-${meshId}`, ... })
))
```

**Impact:** Each building creates a separate GPU draw call. At 1000 buildings, this means 1000 draw calls per frame.

---

## FPS Metrics

> **Note:** FPS measurements require running the application and using Chrome DevTools Performance panel. These values should be filled in during manual testing.

| Building Count | Avg FPS | Min FPS | Frame Drops | Notes |
|----------------|---------|---------|-------------|-------|
| 100 | TBD | TBD | TBD | |
| 500 | TBD | TBD | TBD | |
| 1000 | TBD | TBD | TBD | |

### Measurement Methodology

1. Navigate to /map route
2. Adjust viewport to contain target building count
3. Open Chrome DevTools > Performance panel
4. Record 10-second interaction (pan, zoom, rotate)
5. Note average FPS from summary

---

## Load Times

| Metric | Time (ms) | Notes |
|--------|-----------|-------|
| Initial /map route load | TBD | Time from navigation to first paint |
| Buildings API fetch | TBD | Time for /infrared/buildings response |
| First paint with buildings | TBD | Time until buildings render |
| Time to Interactive | TBD | |

### Measurement Methodology

1. Open Chrome DevTools > Network panel
2. Enable "Disable cache"
3. Navigate to /map
4. Note timings from Performance and Network panels

---

## Memory Usage

| Metric | Value | Notes |
|--------|-------|-------|
| Mesh cache size | Unbounded | No LRU, no size limit |
| Estimated cache memory at 500 buildings | TBD | |
| Estimated cache memory at 1000 buildings | TBD | |

### Current Implementation

```typescript
// buildings.mesh-utils.ts
const meshCache = new Map<string, SimpleMeshFormat>()
// No eviction, grows indefinitely
```

---

## Store Middleware Status

| Store | subscribeWithSelector | persist | Notes |
|-------|----------------------|---------|-------|
| map.store.ts | Yes | Yes | Properly configured |
| analysis.store.ts | No | Yes | **Missing subscribeWithSelector** - causes full re-renders |

---

## Key Technical Debt

1. **Layer-per-building architecture** - Primary performance bottleneck
2. **No bundle splitting** - deck.gl, three.js, react-query all in one chunk
3. **Unbounded mesh cache** - Memory leak potential
4. **Inconsistent store middleware** - analysis.store missing subscribeWithSelector
5. **Synchronous geometry processing** - computeVertexNormals blocks main thread

---

## Success Targets (Post-Implementation)

| Metric | Baseline | Target | Improvement |
|--------|----------|--------|-------------|
| Layers at 1000 buildings | 1000 | <= 15 | 98% reduction |
| FPS at 1000 buildings | TBD | >= 30 | TBD |
| Initial load time | TBD | -30% | TBD |
| Main bundle (gzip) | 252 KB | < 250 KB | Maintain |
| Mesh cache memory | Unbounded | <= 100 MB | Bounded |

---

## Bundle Splitting Configuration

After implementing Task 6, the following manual chunks are configured in `vite.config.ts`:

```typescript
manualChunks: {
  'vendor-deck': ['deck.gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/mesh-layers'],
  'vendor-mapbox': ['mapbox-gl', 'react-map-gl'],
  'vendor-three': ['three'],
  'vendor-react-query': ['@tanstack/react-query'],
  'vendor-react': ['react', 'react-dom'],
}
```

### Bundle Analysis

Run `bun run build:analyze` to generate `dist/stats.html` which provides an interactive visualization of:
- Chunk sizes (raw and gzipped)
- Module tree structure
- Import relationships
- Treeshaking effectiveness

---

## How to Update This Document

After implementing changes, run measurements again and update:

```bash
# Build and measure bundle sizes
cd apps/base/client
bun run build:analyze

# View chunk sizes
ls -la dist/assets/*.js

# Open bundle visualization
open dist/stats.html

# Update this document with new measurements
```
