import {
  AreaRunError,
  type AreaState,
  AreaTimeoutError,
  type InfraredClient,
  TiledRunError,
} from '@infrared-city/infrared-sdk-ts'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { splitDateFiltersForFetch } from '../core/analysis.date-filters'
import type { AnalysesName } from '../core/analysis.sdk-types'
import { resolveMergeStrategy } from './analysis.merge-strategy'
import type { AnalysisDateFilters, AreaRunResult } from './analysis.store'
import { useAnalysisStore } from './analysis.store'

/**
 * Maximum wall-clock time the client waits for area analysis.
 * 15 minutes matches the previous Lambda timeout.
 */
export const AREA_RUN_TIMEOUT_MS = 15 * 60 * 1000

const AREA_RUN_TOAST_ID = 'area-run'

/**
 * Input accepted by the `start()` function of the `useRunArea` hook.
 */
export interface RunAreaInput {
  polygon: GeoJSONPolygon
  analysisType: AnalysesName
  /** Pre-fetched buildings dict from React Query cache. */
  buildings?: Record<string, unknown>
  weatherData?: unknown
  dateFilters?: unknown
  /**
   * SDK-fetched ground-material layers keyed by layer name. Matches the
   * `.layers` field returned from `client.groundMaterials.getArea(polygon)`.
   * When supplied, the SDK injects per-tile ground materials and the
   * analysis run benefits from them without an extra fetch.
   */
  groundMaterials?: Record<string, { features?: Array<Record<string, unknown>> }>
  /**
   * SDK-fetched vegetation features keyed by stable id. Matches the
   * `.features` field returned from `client.vegetation.getArea(polygon)`.
   */
  vegetation?: Record<string, Record<string, unknown>>
  [extra: string]: unknown
}

export interface UseRunAreaResult {
  start: (input: RunAreaInput) => Promise<void>
  cancel: () => void
  status: 'idle' | 'running' | 'success' | 'error'
}

/**
 * Compute geographic (WGS84) bounds for a merged area grid.
 *
 * Ported from the Python API's `_compute_grid_bounds`.
 */
export function computeGridBounds(
  polygon: Record<string, unknown>,
  gridRows: number,
  gridCols: number,
): { west: number; south: number; east: number; north: number } {
  if (gridRows <= 0 || gridCols <= 0) {
    return { west: 0, south: 0, east: 0, north: 0 }
  }

  const METERS_PER_DEG_LAT = 111_320
  const CELL_SIZE_M = 1.0

  const coords = (polygon as { coordinates: number[][][] }).coordinates[0]
  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  const originLon = Math.min(...lngs)
  const originLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const centerLat = (originLat + maxLat) / 2

  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180)
  if (metersPerDegLng < 1e-6) {
    return { west: 0, south: 0, east: 0, north: 0 }
  }

  const swLng = originLon
  const swLat = originLat

  const gridWidthM = gridCols * CELL_SIZE_M
  const gridHeightM = gridRows * CELL_SIZE_M

  return {
    west: swLng,
    south: swLat,
    east: swLng + gridWidthM / metersPerDegLng,
    north: swLat + gridHeightM / METERS_PER_DEG_LAT,
  }
}

/**
 * Convert Float64Array merged grid to nested list with NaN → null.
 */
export function gridToNestedList(
  grid: Float64Array,
  rows: number,
  cols: number,
): (number | null)[][] {
  const result: (number | null)[][] = []
  for (let r = 0; r < rows; r++) {
    const row: (number | null)[] = []
    for (let c = 0; c < cols; c++) {
      const val = grid[r * cols + c]
      row.push(Number.isNaN(val) ? null : val)
    }
    result.push(row)
  }
  return result
}

/**
 * Compute (min, max) of a Float64Array, ignoring NaN cells. Returns
 * `[undefined, undefined]` when the grid is empty or all-NaN.
 */
export function computeLegendBounds(grid: Float64Array): [number | undefined, number | undefined] {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i]
    if (Number.isNaN(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [undefined, undefined]
  return [min, max]
}

/** Analysis types that need pre-fetched weather data on the input. */
export const WEATHER_REQUIRED_TYPES = new Set([
  'solar-radiation',
  'thermal-comfort-index',
  'thermal-comfort-statistics',
  'pedestrian-wind-comfort',
])

/**
 * Analysis types that consume ground-material layers server-side.
 * Currently only the thermal-comfort family uses surface albedo /
 * material props in its sim — sending ground-materials to a solar or
 * wind run just inflates the payload with no effect on results.
 */
export const GROUND_MATERIALS_ANALYSIS_TYPES = new Set<string>([
  'thermal-comfort-index',
  'thermal-comfort-statistics',
])

/**
 * Analysis types that consume vegetation features server-side.
 * Solar + thermal suite (sun-hours, daylight, solar-radiation, SVF,
 * TCI, TCS). Wind models do not currently apply vegetation effects.
 */
export const VEGETATION_ANALYSIS_TYPES = new Set<string>([
  'direct-sun-hours',
  'daylight-availability',
  'solar-radiation',
  'sky-view-factors',
  'thermal-comfort-index',
  'thermal-comfort-statistics',
])

/** Approximate polygon centroid (lng, lat). SDK overrides per-tile for
 *  location-aware analyses; this is just the initial Zod seed. */
export function polygonCentroid(polygon: Record<string, unknown>): {
  latitude: number
  longitude: number
} {
  const ring = (polygon as { coordinates: number[][][] }).coordinates[0]
  let sx = 0
  let sy = 0
  const n = ring.length - 1 // last point repeats the first in a closed ring
  for (let i = 0; i < n; i++) {
    sx += ring[i][0]
    sy += ring[i][1]
  }
  return { latitude: sy / n, longitude: sx / n }
}

/** Build the camelCase AnalysisInput payload — SDK re-serializes to kebab.
 *  `weatherData`: row array OR columnar EPW object — `runAreaAndWait`
 *  distinguishes the two internally and only period-filters the object
 *  shape; this function passes either through verbatim. */
export function buildSdkInput(
  input: RunAreaInput,
  weatherData: unknown[] | Record<string, unknown> | undefined,
  centroid: { latitude: number; longitude: number },
): Record<string, unknown> {
  const sdkInput: Record<string, unknown> = { ...input }
  sdkInput.analysisType = input.analysisType
  // Per-tile geometries injected by SDK via opts.buildings; empty top-level avoids leaking caller payload.
  sdkInput.geometries = {}
  // SVF / Wind don't need lat/lon; harmless to omit for them.
  if (input.analysisType !== 'sky-view-factors' && input.analysisType !== 'wind-speed') {
    sdkInput.latitude = centroid.latitude
    sdkInput.longitude = centroid.longitude
  }
  if (weatherData) {
    sdkInput.weatherData = weatherData
  }
  // Strip fields the SDK doesn't expect on AnalysisInput. `buildings`,
  // `groundMaterials`, and `vegetation` are passed through `opts` on
  // `runAreaAndWait`, not on the inner analysis payload.
  delete sdkInput.polygon
  delete sdkInput.buildings
  delete sdkInput.groundMaterials
  delete sdkInput.vegetation
  return sdkInput
}

/**
 * Create a `useRunArea` React hook bound to an InfraredClient.
 *
 * Replaces the granular `runTiles` + `mergeResults` pair with a single
 * `client.runAreaAndWait(input, polygon, opts)` call. Per-tile building
 * fetch is delegated to the server via `opts.buildings = { fetch: true }`.
 */
export function createUseRunArea(client: InfraredClient) {
  return function useRunArea(): UseRunAreaResult {
    const abortRef = useRef<AbortController | null>(null)
    const status = useAnalysisStore((s) => s.areaStatus)

    const start = useCallback(async (input: RunAreaInput) => {
      if (abortRef.current) {
        abortRef.current.abort()
      }

      const controller = new AbortController()
      abortRef.current = controller

      const startedAt = new Date().toISOString()

      const store = useAnalysisStore.getState()
      store.setAreaStatus('running')
      store.setAreaError(null)
      store.setAreaProgress(null)
      store.setLastRunWindow(null)

      try {
        const polygon = input.polygon as unknown as Record<string, unknown>
        const analysisType = input.analysisType as string

        let weatherData: unknown[] | undefined
        if (WEATHER_REQUIRED_TYPES.has(analysisType)) {
          // Caller-supplied weather data takes priority — e.g. when a
          // scenario provides its own EPW override and skips station
          // selection entirely.
          const callerWeather = (input as { weatherData?: unknown[] }).weatherData
          if (Array.isArray(callerWeather) && callerWeather.length > 0) {
            weatherData = callerWeather
          } else {
            const stationId = useAnalysisStore.getState().selectedStationId
            if (!stationId) {
              throw new Error(
                'No weather station selected — the platform usually auto-selects the nearest station on project create. Open the Climate panel and pick one manually if this persists.',
              )
            }
            const df = input.dateFilters as AnalysisDateFilters | undefined
            if (!df) {
              throw new Error('Date filters required for this analysis type')
            }
            // Windows the endpoint can't express as one start≤end range
            // (Dec→Jan wrap, month-straddling design weeks) fetch as
            // calendar halves and concatenate rows — one unsplit request
            // 422s ("start-day cannot be greater than end-day").
            const parts: unknown[][] = []
            for (const window of splitDateFiltersForFetch(df)) {
              parts.push(
                (await client.weather.filterWeatherData(
                  stationId,
                  window as never,
                )) as unknown as unknown[],
              )
            }
            weatherData = parts.flat()
          }
        }

        if (controller.signal.aborted) return

        const centroid = polygonCentroid(polygon)
        const sdkInput = buildSdkInput(input, weatherData, centroid)

        if (controller.signal.aborted) return

        let lastState: AreaState | undefined

        const groundMaterialsForRun =
          GROUND_MATERIALS_ANALYSIS_TYPES.has(analysisType) &&
          input.groundMaterials &&
          Object.keys(input.groundMaterials).length > 0
            ? input.groundMaterials
            : undefined
        const vegetationForRun =
          VEGETATION_ANALYSIS_TYPES.has(analysisType) &&
          input.vegetation &&
          Object.keys(input.vegetation).length > 0
            ? input.vegetation
            : undefined

        if (groundMaterialsForRun) {
          console.debug('[useRunArea] groundMaterials layers →', Object.keys(groundMaterialsForRun))
        }
        const strategyOpts = resolveMergeStrategy(input, analysisType)

        // SDK 0.8+ `assignBuildingsToTiles` consumes any caller-supplied
        // buildings dict (server still does per-tile coord translation).
        const runOpts = {
          buildings:
            input.buildings && Object.keys(input.buildings).length > 0
              ? (input.buildings as Record<string, unknown>)
              : undefined,
          groundMaterials: groundMaterialsForRun,
          vegetation: vegetationForRun,
          areaTimeout: AREA_RUN_TIMEOUT_MS / 1000,
          ...strategyOpts,
          onProgress: (state: AreaState) => {
            if (controller.signal.aborted) return
            lastState = state
            useAnalysisStore.getState().setAreaProgress({
              succeeded: state.completedCount,
              failed: state.failedCount,
              total: state.totalCount,
              phase: 'analysis',
            })
          },
        }
        console.debug(
          '[area-run-api] FINAL opts →',
          JSON.stringify({ ...runOpts, onProgress: '[fn]' }),
        )

        // Geometry guard: empty tiles make the backend 400 ("must contain
        // geometry data") — happens when a reloaded project's buildings never
        // persisted to R2 (blob_key null). Fail fast with an actionable hint.
        const bCount = runOpts.buildings ? Object.keys(runOpts.buildings as object).length : 0
        const vCount = vegetationForRun ? Object.keys(vegetationForRun).length : 0
        if (bCount === 0 && vCount === 0) {
          const message =
            'No building data loaded for this site. Use "Bring in site data" to load buildings, then run.'
          toast.error(message, { id: AREA_RUN_TOAST_ID })
          store.setAreaStatus('error')
          store.setAreaError(message)
          return
        }

        const result = await client.runAreaAndWait(sdkInput as never, polygon, runOpts)

        if (controller.signal.aborted) return

        if (result.failedJobs.length > 0) {
          console.warn(
            `[useRunArea] ${result.failedJobs.length} tiles failed:`,
            result.failedJobs.map((f) => `${f.tileId}: ${f.error ?? 'unknown'}`),
          )
        }

        const [gridRows, gridCols] = result.gridShape
        const gridBounds = computeGridBounds(polygon, gridRows, gridCols)
        const [minLegend, maxLegend] = computeLegendBounds(result.mergedGrid)
        const totalJobs = lastState?.totalCount ?? 0
        const succeededJobs = Math.max(
          0,
          totalJobs - result.failedJobs.length - result.skippedJobs.length,
        )

        const storeResult: AreaRunResult = {
          mergedGrid: gridToNestedList(result.mergedGrid, gridRows, gridCols),
          gridShape: [gridRows, gridCols],
          gridBounds,
          polygon: input.polygon,
          analysisType: input.analysisType,
          failedJobs: result.failedJobs.map((f) => f.tileId),
          skippedJobs: [...result.skippedJobs],
          totalJobs,
          succeededJobs,
          minLegend,
          maxLegend,
        }

        useAnalysisStore.getState().setLastRunWindow({
          startedAt,
          completedAt: new Date().toISOString(),
          analysisType: analysisType as never,
        })
        useAnalysisStore.getState().setAreaResult(storeResult)
        toast.success('Area analysis complete', { id: AREA_RUN_TOAST_ID })
      } catch (err) {
        if (controller.signal.aborted) return

        let message: string
        if (err instanceof AreaTimeoutError) {
          message = `Area analysis timed out after ${AREA_RUN_TIMEOUT_MS / 60_000} min`
        } else if (err instanceof TiledRunError || err instanceof AreaRunError) {
          message = err.message
        } else {
          message = err instanceof Error && err.message ? err.message : 'Area analysis failed'
        }
        useAnalysisStore.getState().setAreaError(message)
        // Clear lastRunWindow on the failure path too. The success path
        // sets it; the run-start clears it; without this clear, a future
        // refactor that drops the run-start clear could leak a previous
        // run's cost into an error state.
        useAnalysisStore.getState().setLastRunWindow(null)
        toast.error(message, { id: AREA_RUN_TOAST_ID })
      } finally {
        const s = useAnalysisStore.getState()
        s.setAreaProgress(null)
        // Abort-mid-run leaks 'running' otherwise — success/error branches early-return on aborted signal.
        if (controller.signal.aborted && s.areaStatus === 'running') s.setAreaStatus('idle')
        if (abortRef.current === controller) abortRef.current = null
      }
    }, [])

    const cancel = useCallback(() => {
      const controller = abortRef.current
      if (controller) {
        controller.abort()
      }
      abortRef.current = null
      useAnalysisStore.getState().setAreaStatus('idle')
      toast('Cancelled', { id: AREA_RUN_TOAST_ID })
    }, [])

    useEffect(() => {
      return () => {
        if (abortRef.current) {
          abortRef.current.abort()
          abortRef.current = null
        }
      }
    }, [])

    return { start, cancel, status }
  }
}
