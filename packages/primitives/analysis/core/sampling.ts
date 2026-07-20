/**
 * Pure region-sampling helpers — the SINGLE sampler shared by SDK results, AI
 * grid sub-results, and the comparison study's whole-site scope. Now also the
 * server-side (Cloudflare Worker) sampler once a grid is decoded from R2.
 *
 * Everything here consumes an `AreaRunResult` (the decoded grid) and is BLIND to
 * the source: an SDK result grid and a decoded AI grid sub-result go through the
 * exact same code. `sampleGrid` dispatches on a framework-free `SampleGeometry`
 * (point radius walk / polygon mask walk / whole grid); the client adapter
 * (`spatial-pin/hooks/pin-sampling-adapter.ts`) maps `SpatialPin` → geometry.
 *
 * Grid row 0 is the SOUTHERN row — confirmed by `react/analysis.grid-layer.ts`
 * which applies `srcY = height - 1 - y` when painting the bitmap, and by
 * `computeGridBounds` walking northward from a SW origin. Samples must follow
 * the same convention or a point reads the latitudinally-mirrored cell.
 *
 * Framework-agnostic — no React / Zustand / DOM imports (this is `core/`).
 */

import type { AreaRunResult } from './analysis.types'
import { pointInPolygon, polygonBbox } from './polygon-mask'

// Re-exported so `/sampling` consumers (Worker code that must NOT touch the
// `/core` barrel — it drags icons/color-scales into the bundle) get the grid
// type from the same specifier. Type-only: nothing lands in the JS output.
export type { AreaRunResult } from './analysis.types'

import {
  EMPTY_NUMERIC_SAMPLE,
  haversineM,
  summariseCategorical,
  summariseNumeric,
} from './sample-stats'

export const SAMPLE_RADIUS_M = 25

export interface SampleStats {
  count: number
  mean: number
  min: number
  max: number
  p25: number
  p50: number
  p75: number
}

export interface SampleResult {
  kind: 'numeric'
  stats: SampleStats
  histogram: number[]
  histRange: [number, number]
}

export interface CategoricalSampleResult {
  kind: 'categorical'
  count: number
  breakdown: Record<string, number>
  modeCategory: string | null
}

/**
 * Framework-free geometry the samplers dispatch on. The client `SpatialPin` is
 * mapped onto this by the client-side adapter; a Worker constructs it directly
 * from a GeoJSON point/polygon. Adding a geometry kind = one arm here + one
 * branch in `sampleGrid` + one test, inherited by every consumer.
 */
export type SampleGeometry =
  | { kind: 'point'; lon: number; lat: number; radiusM?: number }
  | { kind: 'polygon'; ring: [number, number][] }
  | { kind: 'site' }

/** The single dispatcher. Any grid (SDK or decoded AI sub-result) is sampled —
 *  adding a new simulation/source needs no registration here. */
export function sampleGrid(
  grid: AreaRunResult,
  geometry: SampleGeometry,
): SampleResult | CategoricalSampleResult | null {
  if (geometry.kind === 'site') return sampleWholeGrid(grid)
  if (geometry.kind === 'polygon') return sampleRegionPolygon(grid, geometry.ring)
  return sampleRegionRadius(grid, geometry.lon, geometry.lat, geometry.radiusM ?? SAMPLE_RADIUS_M)
}

/** Polygon variant: walks the ring's bbox in grid cells and keeps cells whose
 *  center falls inside the ring. Same output shapes as `sampleRegionRadius`. */
export function sampleRegionPolygon(
  grid: AreaRunResult,
  ring: [number, number][],
): SampleResult | CategoricalSampleResult | null {
  if (ring.length < 3) return null
  const { west, south, east, north } = grid.gridBounds
  const [rWest, rSouth, rEast, rNorth] = polygonBbox(ring)
  if (rNorth < south || rSouth > north || rEast < west || rWest > east) return null
  const [rows, cols] = grid.gridShape
  if (rows <= 0 || cols <= 0) return null

  const rowOf = (lat: number) => Math.floor(((lat - south) / Math.max(north - south, 1e-12)) * rows)
  const colOf = (lon: number) => Math.floor(((lon - west) / Math.max(east - west, 1e-12)) * cols)
  const r0 = Math.max(0, rowOf(rSouth))
  const r1 = Math.min(rows - 1, rowOf(rNorth))
  const c0 = Math.max(0, colOf(rWest))
  const c1 = Math.min(cols - 1, colOf(rEast))

  const numericValues: number[] = []
  const categoricalValues: string[] = []
  for (let r = r0; r <= r1; r++) {
    const row = grid.mergedGrid[r]
    if (!row) continue
    const cellLat = south + ((r + 0.5) / rows) * (north - south)
    for (let c = c0; c <= c1; c++) {
      const cellLon = west + ((c + 0.5) / cols) * (east - west)
      if (!pointInPolygon(cellLon, cellLat, ring)) continue
      const v = row[c]
      if (v == null) continue
      if (typeof v === 'number' && Number.isFinite(v)) numericValues.push(v)
      else if (typeof v === 'string') categoricalValues.push(v)
    }
  }
  if (categoricalValues.length > numericValues.length) {
    return summariseCategorical(categoricalValues)
  }
  if (numericValues.length === 0) return EMPTY_NUMERIC_SAMPLE
  return summariseNumeric(numericValues)
}

/** Point-radius variant. Returns null when the point sits outside the grid
 *  bounds entirely. Takes plain `lon`/`lat` (not a `SpatialPin`) so it stays
 *  framework-free; the client adapter unwraps the pin. */
export function sampleRegionRadius(
  grid: AreaRunResult,
  lon: number,
  lat: number,
  radiusM: number,
): SampleResult | CategoricalSampleResult | null {
  const { west, south, east, north } = grid.gridBounds
  if (lat < south || lat > north || lon < west || lon > east) return null
  const [rows, cols] = grid.gridShape
  if (rows <= 0 || cols <= 0) return null
  const cellHeightM = haversineM(south, west, north, west) / rows
  const cellWidthM = haversineM(south, west, south, east) / cols
  const rowRadius = Math.max(1, Math.ceil(radiusM / Math.max(cellHeightM, 1e-6)))
  const colRadius = Math.max(1, Math.ceil(radiusM / Math.max(cellWidthM, 1e-6)))
  const fracY = (lat - south) / Math.max(north - south, 1e-12)
  const fracX = (lon - west) / Math.max(east - west, 1e-12)
  const centerRow = Math.floor(fracY * rows)
  const centerCol = Math.floor(fracX * cols)

  const numericValues: number[] = []
  const categoricalValues: string[] = []
  for (let dr = -rowRadius; dr <= rowRadius; dr++) {
    const r = centerRow + dr
    if (r < 0 || r >= rows) continue
    const row = grid.mergedGrid[r]
    if (!row) continue
    for (let dc = -colRadius; dc <= colRadius; dc++) {
      const c = centerCol + dc
      if (c < 0 || c >= cols) continue
      // Approximate cell-center distance from the point in metres. Using the
      // mean cell size keeps the walk cheap (no haversine per cell on
      // dense grids).
      const dxM = dc * cellWidthM
      const dyM = dr * cellHeightM
      if (dxM * dxM + dyM * dyM > radiusM * radiusM) continue
      const v = row[c]
      if (v == null) continue
      if (typeof v === 'number' && Number.isFinite(v)) {
        numericValues.push(v)
      } else if (typeof v === 'string') {
        categoricalValues.push(v)
      }
    }
  }

  // Pick the dominant value-type. Categorical-only path is defensive — most
  // platform runs encode PWC classes as numeric indices at this layer.
  if (categoricalValues.length > numericValues.length) {
    return summariseCategorical(categoricalValues)
  }
  if (numericValues.length === 0) {
    // No valid cells in the radius (mask / failure region). Surface as a
    // zeroed sample so the row still renders with "—".
    return EMPTY_NUMERIC_SAMPLE
  }
  return summariseNumeric(numericValues)
}

/** Whole-site sampling — the `'site'` pseudo-scope of the comparison grid.
 *  Walks the FULL mergedGrid once; same output shapes as the region samplers so
 *  a whole-site cell and a point cell are interchangeable downstream. */
export function sampleWholeGrid(grid: AreaRunResult): SampleResult | CategoricalSampleResult {
  const numericValues: number[] = []
  const categoricalValues: string[] = []
  for (const row of grid.mergedGrid) {
    if (!row) continue
    for (const v of row) {
      if (v == null) continue
      if (typeof v === 'number' && Number.isFinite(v)) numericValues.push(v)
      else if (typeof v === 'string') categoricalValues.push(v)
    }
  }
  if (categoricalValues.length > numericValues.length) {
    return summariseCategorical(categoricalValues)
  }
  if (numericValues.length === 0) return EMPTY_NUMERIC_SAMPLE
  return summariseNumeric(numericValues)
}
