import type { Polygon as GeoJSONPolygon } from 'geojson'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  type AnalysesName,
  PwcCriteria,
  ThermalComfortStatisticsSubType,
} from '../core/analysis.sdk-types'
import type {
  AnalysisConfig,
  AnalysisViewport,
  AreaRunResult,
  PrebuiltAreaBitmap,
} from '../core/analysis.types'

// Re-export types so existing consumers can still import from this file (and
// the `@forge-kit/analysis` barrel). `AreaRunResult` now lives in `core/` so
// the framework-agnostic samplers can consume it without a `core → react` edge.
export type { AnalysisConfig, AnalysisViewport, AreaRunResult, PrebuiltAreaBitmap }

/**
 * Status enum for the area-tiled-analysis RUN lifecycle ONLY.
 *
 * There is intentionally NO `'previewing'` value — preview pending/error state
 * lives in React Query inside `useAreaPreview` (task 4). Mixing preview state
 * into the run status would mean a re-fetching preview could briefly wipe a
 * successful run layer; splitting them avoids that class of bug entirely.
 */
export type AreaStatus = 'idle' | 'running' | 'success' | 'error'

/**
 * Date filters shape sent to `POST /infrared/analyses/run-area`.
 *
 * Mirrors the Python API's `DateFilters` Pydantic model and the SDK's
 * `TimeFilters` type. Defined inline here (rather than re-exporting from
 * `@infrared/sdk`) so the store stays decoupled from SDK internals.
 */
export interface AnalysisDateFilters {
  period: {
    start: { month: number; day: number; hour: number }
    end: { month: number; day: number; hour: number }
  }
  /** Optional per-day repeating window forwarded to the weather service —
   *  mirrors the SDK `TimeFilters.filter` shape (e.g. `{ hour: '9-18' }`). */
  filter?: { day?: string; hour?: string }
}

/** Sensible default: June 1–30, 9 am – 5 pm (standard summer daylight). */
export const DEFAULT_DATE_FILTERS: AnalysisDateFilters = {
  period: {
    start: { month: 6, day: 1, hour: 9 },
    end: { month: 6, day: 30, hour: 17 },
  },
}

// `AreaRunResult` moved to `core/analysis.types.ts` (imported + re-exported
// above) so the framework-agnostic samplers can consume it without a
// `core → react` layering edge.

interface AnalysisState {
  /**
   * Currently-active analysis configuration. Written by the area-run hook
   * so downstream subscribers (invalidation adapter, AI workflows bridge)
   * can detect the active run. No longer read by any panel UI — the
   * area-only `AreaAnalysisTab` reads `areaAnalysisType` directly from the
   * store instead. NOT persisted.
   */
  activeConfig: AnalysisConfig | null
  /** Selected weather-station identifier. Used by the invalidation adapter. NOT persisted. */
  selectedStationId: string | null

  // ─── Area-tiled-analysis slice ───────────────────────────────────────────
  // The area slice is the ONLY run unit. It has NO tile-level state and
  // NO preview state — the preview lives in React Query (task 4); the
  // store tracks only the RUN lifecycle.

  /**
   * Whether area mode is toggled on. Flipped by `WorkflowPanel`'s Draw handler;
   * gates the editable polygon layer inside the analysis plugin
   * (`analysis.area-draw-hook.ts`). The legacy `AreaModeToggle` UI writer was
   * removed in fn-52…area.5. NOT persisted.
   */
  areaMode: boolean
  /** True while the user is actively drawing a polygon. Drives the map route's
   *  controller override (`doubleClickZoom: false`) in task 3. NOT persisted. */
  areaDrawing: boolean
  /** Completed polygon written by the draw layer after validation. */
  areaPolygon: GeoJSONPolygon | null
  /** Analysis type the area run targets. */
  areaAnalysisType: AnalysesName | null
  /** Status of the area RUN lifecycle only. */
  areaStatus: AreaStatus
  /** Merged result returned from `POST /infrared/analyses/run-area`. */
  areaResult: AreaRunResult | null
  /** Human-readable error shown under the area tab when `areaStatus === 'error'`. */
  areaError: string | null
  /** Preview metadata snapshotted at run start — tile count + estimated time.
   *  Populated by the UI before calling `start()` so the running-state card
   *  can show progress info without re-querying the preview endpoint. */
  areaRunMeta: { tileCount: number; estimatedTimeS: number; startedAt: number } | null
  /** Live tile progress streamed from the SSE endpoint during a run. */
  areaProgress: { succeeded: number; failed: number; total: number; phase: string } | null
  /** Time window of the last successful area run, used by the app layer to
   *  query the billing-service for the real token cost of that run. The
   *  primitive only emits the window; the app handles the billing fetch so
   *  this package stays free of app-level dependencies. */
  lastRunWindow: { startedAt: string; completedAt: string; analysisType: AnalysesName } | null

  // ─── Per-type analysis config ────────────────────────────────────────────

  /** Wind speed in m/s (1–100). Used by wind-speed analysis. */
  windSpeed: number
  /** Wind direction in degrees (0–360). Used by wind-speed analysis. */
  windDirection: number
  /** Time period for date-dependent analyses (solar, UTCI, TCS, PWC). */
  dateFilters: AnalysisDateFilters
  /** TCS subtype: thermal_comfort | heat_stress | cold_stress. */
  tcsSubtype: string
  /** PWC criteria: lawson_2001 | lawson_1970 | etc. */
  pwcCriteria: string

  setWindSpeed: (speed: number) => void
  setWindDirection: (direction: number) => void
  setDateFilters: (filters: AnalysisDateFilters) => void
  setTcsSubtype: (subtype: string) => void
  setPwcCriteria: (criteria: string) => void

  setActiveConfig: (config: AnalysisConfig | null) => void
  setSelectedStationId: (id: string | null) => void
  /** Reset transient session state. Kept so the plugin `cleanup` callback
   *  continues to have a single place to clear transient state. */
  resetSession: () => void

  // ─── Area-tiled-analysis actions ─────────────────────────────────────────

  /**
   * Toggle area mode on/off. When turning OFF, this calls `resetArea()`
   * internally to clear polygon + analysis type + run state + drawing flag.
   * When turning ON, it does NOT auto-populate `areaAnalysisType` — that
   * policy lives in the panel code (task 4).
   */
  setAreaMode: (on: boolean) => void
  /** Set the drawing flag — drives the map route's controller override. */
  setAreaDrawing: (drawing: boolean) => void
  /**
   * Set the polygon. Callers are expected to validate the polygon before
   * calling (invalid polygons never enter the store). Setting the polygon
   * invalidates any prior run: clears `areaResult`, clears `areaError`, and
   * sets `areaStatus` to `'idle'`.
   */
  setAreaPolygon: (polygon: GeoJSONPolygon | null) => void
  /**
   * Set the analysis type. Also invalidates any prior run (a different type
   * means the cached merged grid is no longer meaningful).
   */
  setAreaAnalysisType: (type: AnalysesName | null) => void
  setAreaStatus: (status: AreaStatus) => void
  /**
   * Set the run result. Passing a non-null result also sets
   * `areaStatus = 'success'` and clears `areaError`. Passing `null` leaves
   * status alone (used by `resetArea` + `setAreaPolygon` / `setAreaAnalysisType`).
   */
  setAreaResult: (result: AreaRunResult | null) => void
  /** Set the error. Non-null also flips `areaStatus` to `'error'`. */
  setAreaError: (error: string | null) => void
  /** Snapshot preview metadata at run start. */
  setAreaRunMeta: (meta: { tileCount: number; estimatedTimeS: number } | null) => void
  /** Update live tile progress from SSE stream. */
  setAreaProgress: (
    progress: { succeeded: number; failed: number; total: number; phase: string } | null,
  ) => void
  /** Snapshot the time window of the last successful run for billing lookup. */
  setLastRunWindow: (
    window: { startedAt: string; completedAt: string; analysisType: AnalysesName } | null,
  ) => void
  /**
   * Reset the area slice to its initial state (polygon, analysis type,
   * status, result, error, AND `areaDrawing` → `false`). Does NOT clear
   * `areaMode` — the caller decides whether mode goes off.
   *
   * Clearing `areaDrawing` here is defensive: if the user toggles area mode
   * off mid-draw, or an error path calls `resetArea`, we must not leave
   * `doubleClickZoom: false` stuck on the map route controller while the
   * draw layer is unmounting.
   */
  resetArea: () => void
}

// Initial state for store reset and testing
const initialState = {
  activeConfig: null as AnalysisConfig | null,
  selectedStationId: null as string | null,
  // ─── Area-tiled-analysis slice ─────────────────────────────────────────
  areaMode: false,
  areaDrawing: false,
  areaPolygon: null as GeoJSONPolygon | null,
  areaAnalysisType: null as AnalysesName | null,
  areaStatus: 'idle' as AreaStatus,
  areaResult: null as AreaRunResult | null,
  areaError: null as string | null,
  areaRunMeta: null as { tileCount: number; estimatedTimeS: number; startedAt: number } | null,
  areaProgress: null as { succeeded: number; failed: number; total: number; phase: string } | null,
  lastRunWindow: null as {
    startedAt: string
    completedAt: string
    analysisType: AnalysesName
  } | null,
  // Per-type config
  windSpeed: 10,
  windDirection: 180,
  dateFilters: { ...DEFAULT_DATE_FILTERS } as AnalysisDateFilters,
  tcsSubtype: ThermalComfortStatisticsSubType.ThermalComfort as string,
  pwcCriteria: PwcCriteria.Lawson2001 as string,
}

/**
 * Analysis store with subscribeWithSelector middleware for fine-grained subscriptions.
 *
 * Cross-domain subscription example:
 * ```typescript
 * // Subscribe only to activeConfig changes (won't fire for other state changes)
 * useEffect(() => {
 *   const unsubscribe = useAnalysisStore.subscribe(
 *     (state) => state.activeConfig,
 *     (activeConfig) => console.log('Config changed:', activeConfig)
 *   )
 *   return unsubscribe
 * }, [])
 * ```
 */
export const useAnalysisStore = create<AnalysisState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setActiveConfig: (config) => set({ activeConfig: config }),
    setSelectedStationId: (id) => set({ selectedStationId: id }),
    resetSession: () =>
      set({
        activeConfig: initialState.activeConfig,
      }),

    // ─── Per-type config actions ──────────────────────────────────────────
    setWindSpeed: (speed) => set({ windSpeed: speed }),
    setWindDirection: (direction) => set({ windDirection: direction }),
    setDateFilters: (filters) => set({ dateFilters: filters }),
    setTcsSubtype: (subtype) => set({ tcsSubtype: subtype }),
    setPwcCriteria: (criteria) => set({ pwcCriteria: criteria }),

    // ─── Area-tiled-analysis actions ─────────────────────────────────────
    setAreaMode: (on) => {
      if (on) {
        set({ areaMode: true })
      } else {
        // Turning mode OFF delegates to resetArea() for all the polygon +
        // type + run + drawing state so the reset contract lives in a
        // single place. We flip areaMode ourselves first because resetArea
        // intentionally leaves areaMode untouched (task 5's run hook calls
        // resetArea on error retry without disabling area mode).
        set({ areaMode: false })
        get().resetArea()
      }
    },
    setAreaDrawing: (drawing) => set({ areaDrawing: drawing }),
    setAreaPolygon: (polygon) =>
      // Setting the polygon invalidates any prior run: clear result +
      // error + reset status to 'idle'. Callers validate the polygon
      // before calling.
      set({
        areaPolygon: polygon,
        areaResult: null,
        areaError: null,
        areaStatus: 'idle',
        lastRunWindow: null,
      }),
    setAreaAnalysisType: (type) =>
      // A different analysis type means the cached merged grid is no
      // longer meaningful, so we invalidate the run (same contract as
      // setAreaPolygon).
      set({
        areaAnalysisType: type,
        areaResult: null,
        areaError: null,
        areaStatus: 'idle',
        lastRunWindow: null,
      }),
    setAreaStatus: (status) => set({ areaStatus: status }),
    setAreaResult: (result) => {
      if (result === null) {
        // Clearing the result is a pure data op — leave status alone so
        // callers (resetArea, setAreaPolygon, setAreaAnalysisType) can
        // decide on the status transition themselves.
        set({ areaResult: null })
      } else {
        set({
          areaResult: result,
          areaStatus: 'success',
          areaError: null,
        })
      }
    },
    setAreaError: (error) => {
      if (error === null) {
        set({ areaError: null })
      } else {
        set({ areaError: error, areaStatus: 'error' })
      }
    },
    setAreaRunMeta: (meta) =>
      set({
        areaRunMeta: meta ? { ...meta, startedAt: Date.now() } : null,
      }),
    setAreaProgress: (progress) => set({ areaProgress: progress }),
    setLastRunWindow: (window) => set({ lastRunWindow: window }),
    resetArea: () =>
      set({
        areaDrawing: initialState.areaDrawing,
        areaPolygon: initialState.areaPolygon,
        areaAnalysisType: initialState.areaAnalysisType,
        areaStatus: initialState.areaStatus,
        areaResult: initialState.areaResult,
        areaError: initialState.areaError,
        areaRunMeta: initialState.areaRunMeta,
        areaProgress: initialState.areaProgress,
        lastRunWindow: initialState.lastRunWindow,
        // areaMode is intentionally NOT reset — the caller decides whether
        // mode goes off (task 5's run hook calls resetArea on error retry
        // without disabling area mode).
      }),
  })),
)

// Export for testing - allows resetting store to initial state
export const getAnalysisInitialState = () => ({ ...initialState })
