import type { Polygon as GeoJSONPolygon } from 'geojson'
import type { AnalysesName as AnalysesNameType } from './analysis.sdk-types'

// ---------------------------------------------------------------------------
// Framework-agnostic analysis types
// ---------------------------------------------------------------------------
//
// The only run unit is area-tiled analysis. Its wire shape (`AreaRunResult`)
// lives here in `core/` so framework-agnostic consumers — the pure region
// samplers, headless/Worker code — can import it without reaching into
// `react/`. `react/analysis.store.ts` re-exports it for existing consumers.

/**
 * Result of a successful area run.
 *
 * Mirrors the server response from `POST /infrared/analyses/run-area` verbatim
 * (after snake→camel conversion). `mergedGrid` cells are `null` where the
 * server returned NaN (outside polygon / tile gap), which the BitmapLayer
 * renders as transparent pixels.
 *
 * `gridShape` is `(height, width)` in CELLS (not tiles). Each cell is
 * `CELL_SIZE_M = 1.0` meter per the SDK's tiling module. A plain shape that
 * mirrors the JSON wire format and is deliberately decoupled from SDK
 * internals — consumers (client, headless, Worker) MUST NOT import this type
 * from the SDK's tiling subpath; the server owns all SDK tile types.
 */
export interface AreaRunResult {
  /** Merged, polygon-clipped grid. `null` = NaN = outside polygon / gap. */
  mergedGrid: (number | null)[][]
  /** `[height, width]` in CELLS (not tiles). */
  gridShape: readonly [number, number]
  /** Lat/lng bounds of the merged grid, computed server-side. */
  gridBounds: { west: number; south: number; east: number; north: number }
  /** The polygon the run was performed on. */
  polygon: GeoJSONPolygon
  /** The analysis type the run was performed for. */
  analysisType: string
  failedJobs: string[]
  skippedJobs: string[]
  totalJobs: number
  succeededJobs: number
  /** Global min across all tile legend values (from API). Undefined if API didn't return legends. */
  minLegend?: number
  /** Global max across all tile legend values (from API). Undefined if API didn't return legends. */
  maxLegend?: number
  /** Heatmap pixels pre-colorized off the main thread (platform decode
   *  worker). When present AND its `variant` matches the live store variant,
   *  `useAreaBitmapLayer` skips the full-grid scan + per-cell colorize; when
   *  absent or stale (e.g. the user switched PWC criteria), the render path
   *  falls back to the main-thread build. Purely an optimization — never a
   *  source of truth (`mergedGrid` stays canonical for sampling/KPIs). */
  prebuiltBitmap?: PrebuiltAreaBitmap
}

/** North-up RGBA pixels for the area heatmap, built off the main thread. */
export interface PrebuiltAreaBitmap {
  /** RGBA, length = width × height × 4, row 0 = top (already south→north flipped). */
  pixels: Uint8ClampedArray<ArrayBuffer>
  width: number
  height: number
  /** Color-scale domain the pixels were baked with. */
  min: number
  max: number
  /** Color-scale variant (PWC criteria / TCS subtype) baked into the pixels. */
  variant?: string
}

/** Viewport for building / analysis fetches (used by the area-preview hook). */
export interface AnalysisViewport {
  latitude: number
  longitude: number
  width: number
  height: number
}

/**
 * Currently-active analysis configuration. Retained as a permissive bag
 * because the `activeConfig` store slot is still written by the area-run
 * hook (which only reads `analysisType` off of it) for downstream
 * consumers that subscribe to the active config. No UI in the area-only
 * panel surface reads it back.
 */
export interface AnalysisConfig {
  analysisType: AnalysesNameType
  [key: string]: unknown
}

/**
 * Color scale function that maps a value to RGBA. Returns transparent for
 * null values. Consumed by the area bitmap layer. `analysis.color-scales.ts`
 * defines an identical alias locally — this export is kept so
 * `react/analysis.area-bitmap-layer.ts` can import the type from the
 * framework-agnostic `core/` subpath instead of reaching into the color
 * scales module.
 */
export type ColorScaleFn = (value: number | null) => [number, number, number, number]
