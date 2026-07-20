/**
 * fn-52 WorkflowPanel — progressive-disclosure sidebar for `/map`.
 *
 * Replaces the legacy "one plugin panel per tab" SegmentedControl shell in
 * `routes/map.tsx`. The panel gates controls on the derived
 * `useWorkflowStep()` (task 1) so the user is walked through:
 *
 *   search → station → draw → drawing → loading → ready → error
 *
 * The analysis tab body is rendered directly (no tab bar — this starter
 * template ships a single Analysis view; the plugin architecture still
 * supports adding more tabs, see the ground-materials note in
 * `composition/map-plugins.ts`).
 *
 * This file lives in the composition layer (`apps/base/client/src/composition/`)
 * — it is NOT a primitive. It owns tab state, renders the primitive-level
 * `WeatherStationSelector`, and uses `@turf/area` for the polygon area
 * label. All store subscriptions use `useShallow` to avoid identity churn.
 */
import { useAnalysisStore } from '@forge-kit/analysis'
import { useMapStore } from '@forge-kit/map-interface'
import { useQuery } from '@tanstack/react-query'
import turfArea from '@turf/area'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { Crosshair, Loader2 } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, InlineError } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { WeatherStationSelector } from '@/components/domains/analysis'
import { useAuthStore } from '@/lib/auth.store'
import { createSdk } from '@/lib/sdk'

const sdk = createSdk({ getToken: () => useAuthStore.getState().idToken ?? '' })

import { useWorkflowStep, type WorkflowStepQueryState } from './useWorkflowStep'

// ---------------------------------------------------------------------------
// Public deps surface
// ---------------------------------------------------------------------------

/**
 * Dependencies injected into `WorkflowPanel` by `routes/map.tsx`.
 *
 * Using the deps-injection pattern keeps the panel testable in isolation
 * (the test suite passes `<div data-testid="analysis-body" />` etc. as
 * mock panel bodies and mock query state).
 */
export interface WorkflowPanelDeps {
  /**
   * Rendered inside the Analysis tab body — always mounted (see the
   * eager-mount rationale in the module docstring).
   */
  analysisPanel: ReactNode
  /**
   * Buildings-in-area query state threaded from the
   * `useBuildingsInArea(areaPolygon)` hook call in `MapRouteChosenHooks`.
   * Driving the workflow step derivation from the composition root (and
   * NOT from inside `WorkflowPanel`) matches the plugin-contract
   * convention that React Query hooks live in the composition layer.
   */
  buildingsQueryState: {
    isLoading: boolean
    isError: boolean
    isSuccess: boolean
    refetch: () => void
  }
  /**
   * Optional "Layers" section rendered above the tab bar once the
   * polygon is committed. Assembled by `MapRouteChosenHooks` using
   * `LayerLoaders` so the mutation/store wiring stays at the
   * composition root.
   */
  layerLoaders?: ReactNode
}

// ---------------------------------------------------------------------------
// Shared `useWeatherStations` hook (composition layer, deduped query)
// ---------------------------------------------------------------------------

/**
 * Composition-layer `useWeatherStations` hook.
 *
 * Emits a single React Query observer keyed on `['weather', 'stations', lat, lng]`.
 * React Query deduplicates observers by query-key, so rendering
 * `WorkflowPanel` (which registers TWO observers: one for the top-level
 * `WeatherStationSelector` and one for `GeneralInfoCard`'s station-label
 * lookup) collapses to exactly one network request regardless of how
 * many additional observers elsewhere in the tree subscribe to the
 * same key.
 *
 * Since fn-52.5 the analysis plugin no longer mounts its own internal
 * weather-station query observer (the legacy `AnalysisPanel` shell that
 * owned it has been deleted in favour of `AreaAnalysisTab`), so this
 * composition-layer hook is the sole producer of weather observers on
 * the /map route. The body-only `analysisTabBody` node injected into
 * the Analysis tab renders `AreaAnalysisTab` directly, which does not
 * register a weather query at all.
 *
 * The hook is defined outside the component so its identity is stable
 * across re-renders — `WeatherStationSelector`'s `'use no memo'` opt-out
 * from React Compiler means an unstable hook prop would re-run its own
 * effects on every render.
 *
 * Progressive-disclosure gate: callers pass `Number.NaN` for `lat`/`lng`
 * when the user has not yet chosen a location, which disables the
 * React Query observer via the `Number.isFinite` check below. This is
 * load-bearing — the map store's default viewport lat/lng (whole-world
 * view) ARE finite, so without the explicit NaN gate a `/map` mount
 * with `hasUserChosenLocation === false` would fire an unwanted
 * `/infrared/weather/stations` request before the user has picked a
 * place.
 */
function useWeatherStations(lat: number, lng: number) {
  const query = useQuery({
    queryKey: ['weather', 'stations', lat, lng],
    queryFn: async () => {
      return sdk.weather.getWeatherFileFromLocation(lat, lng, 1000) as Promise<any[]>
    },
    staleTime: 10 * 60 * 1000,
    // Use finite-number checks, not `!!value`: `0` is a valid coordinate
    // (equator / prime meridian) and must not disable the query. The
    // WorkflowPanel passes `Number.NaN` in the search step so the query
    // stays disabled until the user has actually picked a location.
    enabled: Number.isFinite(lat) && Number.isFinite(lng),
  })
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

// ---------------------------------------------------------------------------
// GeneralInfoCard subcomponent
// ---------------------------------------------------------------------------

interface GeneralInfoCardProps {
  /** Resolved place name from the Mapbox SearchBox retrieve. `null` until a pick lands. */
  addressLabel: string | null
  /** Selected station id from the analysis store. `null` until the user picks a station. */
  selectedStationId: string | null
  /** Committed polygon from the analysis store (fn-51). `null` until draw is committed. */
  areaPolygon: GeoJSONPolygon | null
  /** Latitude used to key the weather-station query. */
  latitude: number
  /** Longitude used to key the weather-station query. */
  longitude: number
}

/**
 * Three-line summary card:
 *   - address (from the Mapbox SearchBox retrieve)
 *   - selected weather station name
 *   - polygon area in m² (via `@turf/area`, memoised on a stable polygon key)
 *
 * Shows `—` for any field that is not yet available. The polygon area is
 * memoised on the polygon's canonical JSON so repeated renders with the
 * same geometry do not recompute the O(n) turf integral.
 */
function GeneralInfoCard({
  addressLabel,
  selectedStationId,
  areaPolygon,
  latitude,
  longitude,
}: GeneralInfoCardProps) {
  'use no memo' // Opts out of React Compiler -- calls injected hook (useWeatherStations)

  // Second observer; same queryKey ['weather', 'stations', lat, lng] → deduped to one fetch by React Query.
  const { data: stations } = useWeatherStations(latitude, longitude)

  const stationLabel = useMemo<string | null>(() => {
    if (!selectedStationId) return null
    if (!stations || !Array.isArray(stations)) return null
    const hit = stations.find((s) => {
      const st = s as { uuid?: string; fileName?: string }
      return st.uuid === selectedStationId || st.fileName === selectedStationId
    }) as
      | {
          uuid?: string
          fileName?: string
          location_data?: { city?: string | null }
        }
      | undefined
    if (!hit) return null
    return hit.location_data?.city ?? hit.fileName ?? hit.uuid ?? null
  }, [stations, selectedStationId])

  // Memoise the polygon area label on a STABLE polygon key (not the
  // object identity). Two deep-equal polygons with different references
  // must collapse to the same key so the O(n) turf integral is not
  // recomputed on every render — store updates may produce a fresh
  // object even for an unchanged shape.
  //
  // Pattern: write the latest polygon into a ref on every render (a
  // plain JS assignment, not a React state update) and consume it
  // inside the memo through the ref. The memo's dep list is ONLY the
  // stable key, which is itself memoised on the polygon reference, so
  // the turf call runs exactly once per actual geometry change. The
  // ref write is safe because every render sees the same reference
  // inside the memo body (commit-phase ordering) and the ref never
  // outlives the component.
  const stablePolygonKey = useMemo(
    () => (areaPolygon ? JSON.stringify(areaPolygon.coordinates) : null),
    [areaPolygon],
  )
  const polygonRef = useRef(areaPolygon)
  polygonRef.current = areaPolygon
  const areaLabel = useMemo<string | null>(() => {
    if (!stablePolygonKey) return null
    const polygon = polygonRef.current
    if (!polygon) return null
    try {
      const m2 = turfArea(polygon)
      return `${Math.round(m2).toLocaleString()} m²`
    } catch {
      return null
    }
  }, [stablePolygonKey])

  const Row = ({ label, value }: { label: string; value: string | null }) => (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-foreground flex-1 truncate">{value ?? '—'}</span>
    </div>
  )

  return (
    <div className="rounded-md border border-border bg-card p-3 space-y-1.5">
      <Row label="Place" value={addressLabel} />
      <Row label="Station" value={stationLabel} />
      <Row label="Area" value={areaLabel} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Buildings loading banner with elapsed timer
// ---------------------------------------------------------------------------

function BuildingsLoadingBanner() {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading buildings in area…</span>
      </div>
      <span className="tabular-nums">
        {elapsed > 0 &&
          (elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`)}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main WorkflowPanel
// ---------------------------------------------------------------------------

export function WorkflowPanel({ deps }: { deps: WorkflowPanelDeps }) {
  'use no memo' // Opts out of React Compiler -- calls injected hook (useWeatherStations for WeatherStationSelector)

  // --- Map store subscription (address + chosen-location flag + viewport) ---
  const { pickedAddress, hasUserChosenLocation, buildingsViewportLat, buildingsViewportLng } =
    useMapStore(
      useShallow((s) => ({
        pickedAddress: s.pickedAddress,
        hasUserChosenLocation: s.hasUserChosenLocation,
        buildingsViewportLat: s.buildingsViewport.latitude,
        buildingsViewportLng: s.buildingsViewport.longitude,
      })),
    )

  // --- Analysis store subscription ---
  //
  // Subscribes via `useShallow` to the exact set the fn-52.4 spec
  // enumerates: `selectedStationId`, `areaPolygon`, `areaMode`,
  // `areaDrawing`, plus the `setAreaMode` and `setAreaPolygon` actions.
  // Also subscribes to `areaStatus` so the Redraw affordance can block
  // while an area run is in flight — clearing `areaPolygon` mid-run
  // would otherwise race the in-flight `setAreaResult` call in
  // `analysis.area-run-api.ts` and resurrect a stale bitmap on top of
  // a polygon the user is currently redrawing.
  //
  // Why both actions: "Draw Area" and "Redraw area" are physically the
  // same button family but drive DIFFERENT store transitions.
  //
  //   - Initial Draw (areaMode === false, polygon === null)
  //       → `setAreaMode(true)` — the draw layer then mounts in
  //         `'draw'` mode and the user clicks vertices.
  //
  //   - Redraw (areaMode === true, polygon !== null, areaStatus !== 'running')
  //       → `setAreaPolygon(null)` to clear the committed polygon,
  //         which transitions the draw layer from `'view'` mode back
  //         to `'draw'` mode (see `analysis.area-draw-hook.ts`: the
  //         layer's mode is gated on `areaPolygon == null`). We then
  //         call `setAreaMode(true)` defensively in case a future
  //         refactor ever leaves area mode off between commits — it
  //         is already `true` in today's flow, so this is a no-op in
  //         the common case.
  const {
    selectedStationId,
    areaPolygon,
    areaMode,
    areaDrawing,
    areaStatus,
    setAreaMode,
    setAreaPolygon,
  } = useAnalysisStore(
    useShallow((s) => ({
      selectedStationId: s.selectedStationId,
      areaPolygon: s.areaPolygon,
      areaMode: s.areaMode,
      areaDrawing: s.areaDrawing,
      areaStatus: s.areaStatus,
      setAreaMode: s.setAreaMode,
      setAreaPolygon: s.setAreaPolygon,
    })),
  )

  // --- Derived workflow step ---
  const queryState: WorkflowStepQueryState = useMemo(
    () => ({
      isLoading: deps.buildingsQueryState.isLoading,
      isError: deps.buildingsQueryState.isError,
      isSuccess: deps.buildingsQueryState.isSuccess,
    }),
    [
      deps.buildingsQueryState.isLoading,
      deps.buildingsQueryState.isError,
      deps.buildingsQueryState.isSuccess,
    ],
  )

  const { step } = useWorkflowStep({
    hasUserChosenLocation,
    selectedStationId,
    areaPolygon,
    areaDrawing,
    buildingsQueryState: queryState,
  })

  // --- Draw Area button gating ---
  const isAreaRunInFlight = areaStatus === 'running'
  const drawDisabled = step === 'search' || step === 'station' || selectedStationId == null
  // `areaMode` tweaks the tooltip copy when the button is enabled:
  // on a warm load (area mode persisted on in a future schema bump,
  // or flipped by an external code path) the user should see "ready
  // to draw" rather than the generic "click to draw". `areaMode` is
  // currently transient (not persisted), so the `true` branch is
  // primarily a forward-compat affordance — but it also gives the
  // fn-52.4 store subscription a first-class read site so the
  // `useShallow` selector is never dead weight.
  const drawTitle = drawDisabled
    ? 'Select a weather station first'
    : areaMode
      ? 'Area mode on — click to draw a polygon on the map'
      : 'Click to draw a polygon on the map'
  // The Redraw affordance (step === 'ready') has its OWN disabled
  // state: it must block while an area run is in flight to prevent
  // racing the in-flight `setAreaResult` callback with a polygon
  // clear. Separate from `drawDisabled` because the initial-draw
  // button is not reachable in the `ready` step.
  const redrawDisabled = isAreaRunInFlight
  const redrawTitle = redrawDisabled
    ? 'Cancel the in-flight run before redrawing'
    : 'Clear the polygon and redraw'

  const handleDraw = useCallback(() => {
    // Defensive guard: belt-and-braces against a race with store mutations
    // that could flip `selectedStationId` to null between the render and
    // the click. Without the guard, the user could briefly enter draw
    // mode without a weather station selected (which the run pipeline
    // would then reject, confusing the UX).
    if (!selectedStationId) return

    // Block the Redraw path while a run is in flight. Clearing
    // `areaPolygon` here would race the run's eventual
    // `setAreaResult(...)` callback, which could resurrect a stale
    // bitmap on top of a polygon the user is currently redrawing.
    // The `redrawDisabled` prop on the button already prevents the
    // click in the common case; this guard is a second layer of
    // defence against a store transition landing between the render
    // and the click dispatch.
    if (isAreaRunInFlight) return

    // Redraw path: a committed polygon exists. Clearing it transitions
    // the draw layer from `'view'` mode back to `'draw'` mode (the
    // layer's mode is gated on `areaPolygon == null` inside
    // `analysis.area-draw-hook.ts`). Without this the user's click on
    // "Redraw area" would be a no-op — area mode is already on, and
    // re-calling `setAreaMode(true)` alone does not clear the polygon.
    // `setAreaPolygon(null)` also invalidates any previous run result
    // (`analysis.store.ts` resets status/result/error on polygon set).
    if (areaPolygon) {
      setAreaPolygon(null)
    }
    // Ensure area mode is on for both the initial-draw and the redraw
    // path. The fn-52.4 spec explicitly calls for `setAreaMode(true)`
    // on both the Draw Area and Redraw affordances, so we call it
    // unconditionally. In today's flow `areaMode` is already `true`
    // after the first draw commit, so this reduces to a zustand shallow
    // set of the same value — a no-op in terms of observable state.
    setAreaMode(true)
  }, [selectedStationId, areaPolygon, isAreaRunInFlight, setAreaMode, setAreaPolygon])

  const handleRetry = useCallback(() => {
    deps.buildingsQueryState.refetch()
  }, [deps.buildingsQueryState])

  // Tab buttons are only clickable once buildings are ready. Before
  // that, both buttons render as `disabled` (the Analysis tab is still
  // eager-mounted below, just hidden by the `hidden` class).
  const tabsDisabled = step !== 'ready'

  const addressLabel = pickedAddress?.formatted ?? pickedAddress?.placeName ?? null

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h3
          className="text-sm font-semibold text-card-foreground truncate"
          title={addressLabel ?? undefined}
        >
          {addressLabel ?? 'Selected location'}
        </h3>
      </div>

      {/* General info — the lat/lng we pass into `GeneralInfoCard` are
          deliberately NaN-gated on `hasUserChosenLocation`. The shared
          `useWeatherStations` hook's `enabled` flag is
          `Number.isFinite(lat) && Number.isFinite(lng)`, and the map
          store's default viewport lat/lng (whole-world view) ARE
          finite, so passing them through unconditionally would fire a
          `/infrared/weather/stations` request before the user has even
          picked a location. NaN kills the observer cleanly while
          keeping the component mounted (which is required to preserve
          the `useMemo` identities on stable polygon key etc.). */}
      <div className="px-4 pt-3 pb-2">
        <GeneralInfoCard
          addressLabel={addressLabel}
          selectedStationId={selectedStationId}
          areaPolygon={areaPolygon}
          latitude={hasUserChosenLocation ? buildingsViewportLat : Number.NaN}
          longitude={hasUserChosenLocation ? buildingsViewportLng : Number.NaN}
        />
      </div>

      {/* Weather station selector — mounted once the user has chosen a
          location. Uses the shared composition-layer `useWeatherStations`
          hook so it shares the query cache with `GeneralInfoCard` above
          — React Query dedupes the two observers on the shared
          `['weather', 'stations', lat, lng]` key, collapsing them to
          exactly one network call. Since fn-52.5 the analysis plugin no
          longer mounts its own internal weather query observer (the
          body-only `analysisTabBody` injected into the Analysis tab
          consumes the plugin's run/preview hooks only), so no third
          observer is mounted in this workflow. The `step !== 'search'`
          render gate is technically redundant with the NaN gate inside
          `GeneralInfoCard` (the query would be disabled anyway), but it
          keeps the progressive DOM disclosure clean. */}
      {step !== 'search' && (
        <div className="px-4 pb-3">
          <WeatherStationSelector
            latitude={buildingsViewportLat}
            longitude={buildingsViewportLng}
            useWeatherStations={useWeatherStations}
          />
        </div>
      )}

      {/* Draw Area button — hidden once a polygon is committed; replaced
          by a "Redraw" link that re-enters draw mode. The Redraw link
          is blocked while `areaStatus === 'running'` — clearing the
          polygon mid-run would race the in-flight
          `setAreaResult(...)` callback and resurrect a stale bitmap. */}
      <div className="px-4 pb-3">
        {step === 'ready' ? (
          <button
            type="button"
            onClick={handleDraw}
            disabled={redrawDisabled}
            title={redrawTitle}
            className={
              redrawDisabled
                ? 'text-xs text-muted-foreground/60 underline underline-offset-2 cursor-not-allowed'
                : 'text-xs text-primary underline underline-offset-2 hover:text-primary/80'
            }
          >
            Redraw area
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={drawDisabled}
            title={drawTitle}
            onClick={handleDraw}
            className="w-full"
          >
            <Crosshair className="h-4 w-4 mr-1.5" />
            Draw Area
          </Button>
        )}
      </div>

      {/* Loading / error banner above the tabs */}
      {step === 'loading' && <BuildingsLoadingBanner />}
      {step === 'error' && (
        <div className="px-4 pb-3">
          <InlineError message="Failed to load buildings in area" onRetry={handleRetry} />
        </div>
      )}

      {/* Layers section — explicit-load rows for ground materials + trees */}
      {step === 'ready' && deps.layerLoaders}

      {/* Analysis panel body. `tabsDisabled` is retained as a gate on the
          "ready" step so downstream consumers of `step` stay meaningful,
          even though this single-tab layout has nothing left to disable
          visually. */}
      <div className="flex-1 min-h-0 overflow-y-auto" aria-busy={tabsDisabled}>
        {deps.analysisPanel}
      </div>
    </div>
  )
}
