import { BitmapLayer } from '@deck.gl/layers'
import type {
  MapOverlayProps,
  MapPanelProps,
  MapPlugin,
  MapPluginContext,
} from '@forge-kit/plugin-contracts'
import type { Layer } from 'deck.gl'
import { BarChart3 } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { useCallback, useMemo, useRef } from 'react'
import type { TimeFilters } from './core/analysis.sdk-types'
import type { AnalysisViewport } from './core/analysis.types'
import { useAreaBitmapLayer } from './react/analysis.area-bitmap-hook'
import { useAreaDrawLayer } from './react/analysis.area-draw-hook'
import type { AreaPreviewQueryResult } from './react/analysis.area-preview-api'
import type { UseRunAreaResult } from './react/analysis.area-run-api'
import type { AreaAnalysisTabDeps } from './react/analysis.area-tab-deps'
import { useAnalysisStore } from './react/analysis.store'

// ---------------------------------------------------------------------------
// Dependency interfaces -- function-based DI contract
// ---------------------------------------------------------------------------

/**
 * Cross-domain data dependencies injected from the composition root.
 * This is the pure DI contract -- no UI or framework concerns leak into
 * this interface.
 *
 * The analysis package does not depend on any map store, ground-materials
 * store, or app-level query keys. Polygon-origin computation is owned by
 * the buildings primitive via `computeOriginFromPolygon`.
 */
export interface AnalysisDeps {
  /** Find weather stations near a location */
  getWeatherStations: (lat: number, lng: number) => Promise<any[]>
  /** Fetch full weather data for a station */
  getWeatherData: (identifier: string, filters?: TimeFilters) => Promise<any>
  /** Get current viewport for analysis bounds */
  getViewport: () => AnalysisViewport
  /** Optional vertical lift (m) for the area-bitmap bounds — the TOTAL elevation
   *  above WGS-84 (scene-base + `analysisAboveSurfacesZ`), not a raw tile lift. */
  zOffsetM?: number
  /** Optional area-heatmap opacity (0..1, default 1) — composition roots
   *  thread a slider value so the basemap stays readable under the raster. */
  areaOpacity?: number
}

/**
 * UI wiring dependencies needed by the analysis plugin's React rendering
 * layer. Kept separate from AnalysisDeps to preserve a clean data DI
 * boundary while allowing the composition root to inject app-specific
 * UI callbacks (layer visibility, run-area hook, preview hook).
 *
 * The only run unit the plugin wires is the area-tiled `useRunArea` hook
 * below.
 */
export interface AnalysisUIConfig {
  /** Set the analysis layer visibility in the map interface */
  setAnalysisLayerVisible: (visible: boolean) => void
  /** Get the buildings viewport for cache sync */
  getBuildingsViewport: () => AnalysisViewport
  /** Get layer visibility state from the map interface */
  getLayerVisibility: () => { analysis: boolean; groundMaterials: boolean }
  /** Hook from createUseAreaPreview(apiClient). Reads `areaPolygon` +
   *  `areaAnalysisType` from the store, POSTs `/infrared/analyses/preview-area`,
   *  returns a narrow query-result shape for the cost card. */
  useAreaPreview: () => AreaPreviewQueryResult
  /** Hook from `createUseRunArea(apiClient)` in the composition root.
   *  Returns `{ start, cancel, status }`. `start` POSTs once to
   *  `/infrared/analyses/run-area` (15-min timeout) and mirrors the lifecycle
   *  into the analysis store. Invoked at the plugin level so the hook
   *  survives panel unmount. */
  useRunArea: () => UseRunAreaResult
  /** Pre-fetched buildings dict from React Query (wired from
   *  `useBuildingsInArea().data`). Forwarded to the run endpoint. */
  getBuildings: () => Record<string, unknown> | undefined
  /** SDK ground-material layers from `useGroundMaterialsStore.areaLayers`.
   *  Forwarded to `runAreaAndWait` opts. */
  getGroundMaterials: () =>
    | Record<string, { features?: Array<Record<string, unknown>> }>
    | undefined
  /** SDK vegetation features from `useVegetationStore`. */
  getVegetation: () => Record<string, Record<string, unknown>> | undefined
  /** Panel component injected from the app layer. */
  PanelComponent: ComponentType<{ deps: AreaAnalysisTabDeps }>
  /** Overlay component injected from the app layer. */
  OverlayComponent: ComponentType
}

// ---------------------------------------------------------------------------
// Internal render-data interface
// ---------------------------------------------------------------------------

/**
 * Inputs for the pure `createAnalysisPlugin` factory.
 *
 * The only layer families the plugin emits are `areaBitmapLayer` and
 * `areaDrawLayer`, both of which are passed through unchanged.
 */
export interface AnalysisRenderData {
  /** Stable panel component (must keep same reference across renders). */
  Panel: ComponentType<MapPanelProps>
  /** Overlay component for area draw legend. */
  Overlay: ComponentType
  layerVisibility: { analysis: boolean; groundMaterials: boolean }
  buildingsViewport: AnalysisViewport
  /**
   * Area-mode polygon draw layer (`@deck.gl-community/editable-layers`
   * `EditableGeoJsonLayer`). `null` when area mode is off. Included in the
   * plugin's `layers` callback when non-null AND not hidden by the
   * ground-materials exclusive pointer grab (`hideDeckLayers`). Explicitly
   * NOT gated by `layerVisibility.analysis` — the user opted into drawing
   * via the area tab, so toggling the analysis layer visibility off must
   * not silently drop the draw handles.
   */
  areaDrawLayer: Layer | null
  /**
   * Merged area-analysis bitmap layer. `null` until an area run succeeds
   * (`areaStatus === 'success'`). Gated by `layerVisibility.analysis` so
   * the layer visibility toggle in the map panel controls area results,
   * and by `!hideDeckLayers` so ground-materials draw mode takes over
   * exclusive pointer control without leaking through.
   */
  areaBitmapLayer: Layer | null
  isGroundMaterialsActive: boolean
}

// ---------------------------------------------------------------------------
// Internal: build MapPlugin from pre-resolved render data
// ---------------------------------------------------------------------------

/**
 * Pure factory that assembles a MapPlugin for the analysis primitive.
 *
 * Does NOT call any React hooks. All reactive data must be pre-resolved.
 * Use `useAnalysisMapPlugin` for the full React integration.
 *
 * The `layers()` callback emits at most two layers — `areaBitmapLayer`
 * (the merged run result) and `areaDrawLayer` (the polygon edit handles).
 */
export function createAnalysisPlugin(data: AnalysisRenderData): MapPlugin {
  const {
    Panel,
    Overlay,
    layerVisibility,
    areaDrawLayer,
    areaBitmapLayer,
    isGroundMaterialsActive,
  } = data

  return {
    id: 'analysis',
    requires: ['buildings'],
    panelLabel: 'Analysis',
    panelIcon: BarChart3,
    Panel,

    Overlay: (_props: MapOverlayProps) => {
      const OverlayImpl = Overlay
      return <OverlayImpl />
    },

    cleanup: () => {
      useAnalysisStore.getState().resetSession()
    },

    layers: (_context: MapPluginContext) => {
      const layerArray: Layer[] = []
      const hideDeckLayers = isGroundMaterialsActive

      // Merged area-analysis bitmap (gated by `layerVisibility.analysis` +
      // `!hideDeckLayers`). When hidden, keep a same-id placeholder instead of
      // dropping it: deck's _finalize() never clears internalState, so re-adding
      // the cached instance later trips assert(!internalState). A same-id layer
      // makes deck transfer state instead of re-initializing.
      if (areaBitmapLayer) {
        layerArray.push(
          layerVisibility.analysis && !hideDeckLayers
            ? areaBitmapLayer
            : new BitmapLayer({ id: 'analysis-area-bitmap', visible: false }),
        )
      }

      // Area-mode polygon draw layer. Positioned AFTER the bitmap layer
      // so the vertex handles remain clickable on top of any heatmap
      // visualization. NOT gated by `layerVisibility.analysis` (see the
      // field docstring on `AnalysisRenderData` for the rationale) —
      // only by the ground-materials exclusive pointer grab.
      if (areaDrawLayer && !hideDeckLayers) {
        layerArray.push(areaDrawLayer)
      }

      return layerArray
    },
  }
}

// ---------------------------------------------------------------------------
// useAnalysisMapPlugin -- React hook (full layer + panel support)
// ---------------------------------------------------------------------------

/**
 * Return shape of {@link useAnalysisMapPlugin}.
 *
 * - `plugin` -- full MapPlugin used by the map interface's layer pipeline.
 *               Its `Panel` renders `AreaAnalysisTab` directly for routes
 *               that mount plugin panels without a workflow wrapper.
 * - `analysisTabBody` -- body-only node (`<AreaAnalysisTab deps=... />`)
 *               suitable for injection into the fn-52 `WorkflowPanel`
 *               Analysis tab slot. Identical content to `plugin.Panel`;
 *               exposed as a separate `ReactNode` so the WorkflowPanel
 *               can mount it without going through the `<plugin.Panel />`
 *               component-type boundary.
 *
 * Both surfaces share the same `areaAnalysisTabDeps` (same run/cancel
 * callbacks, same preview hook), so the run hook's abort-controller ref
 * and the preview query observer each exist as exactly one instance
 * across the plugin lifetime.
 */
export interface UseAnalysisMapPluginResult {
  plugin: MapPlugin
  analysisTabBody: ReactNode
}

/**
 * React hook that creates a fully-functional MapPlugin for the analysis
 * primitive, including both panel UI and area-tiled map layer rendering.
 *
 * This is the primary public API. It takes the static `AnalysisDeps`
 * surface (kept for backwards compatibility, see the note above
 * `isGroundMaterialsActive` below) together with the injected
 * plugin-level hooks from `AnalysisUIConfig` and wires them into the
 * two area-layer hooks (`useAreaDrawLayer`, `useAreaBitmapLayer`) and
 * the `useRunArea` lifecycle. The hook does NOT mount any internal
 * React Query observer of its own -- `useAreaPreview` is received from
 * `uiConfig`, and the weather-station observer that used to live here
 * under the legacy `AnalysisPanel` shell is gone (the composition
 * layer's `WorkflowPanel` owns the weather query now).
 *
 * @param deps - Cross-domain data/invalidation dependencies
 * @param uiConfig - UI wiring (layer visibility, area hooks)
 * @returns `{ plugin, analysisTabBody }` -- see {@link UseAnalysisMapPluginResult}
 */
export function useAnalysisMapPlugin(
  deps: AnalysisDeps,
  uiConfig: AnalysisUIConfig,
): UseAnalysisMapPluginResult {
  'use no memo' // Opts out of React Compiler -- hook references (uiConfig.useAreaPreview, uiConfig.useRunArea) are injected values, not stable module-level identities
  const buildingsViewport = deps.getViewport()
  const layerVisibility = uiConfig.getLayerVisibility()

  // Stabilise object references: extract primitives so useMemo deps don't break
  // on every render when the getter functions return new object literals.
  const vpLat = buildingsViewport.latitude
  const vpLng = buildingsViewport.longitude
  const vpW = buildingsViewport.width
  const vpH = buildingsViewport.height
  const stableViewport = useMemo<AnalysisViewport>(
    () => ({ latitude: vpLat, longitude: vpLng, width: vpW, height: vpH }),
    [vpLat, vpLng, vpW, vpH],
  )

  const layerAnalysis = layerVisibility.analysis
  const layerGM = layerVisibility.groundMaterials
  const stableLayerVisibility = useMemo(
    () => ({ analysis: layerAnalysis, groundMaterials: layerGM }),
    [layerAnalysis, layerGM],
  )

  // `deps.getWeatherStations` / `deps.getWeatherData` are still part of
  // the public `AnalysisDeps` contract for backwards compatibility with
  // composition roots that pass weather adapters, but the plugin no
  // longer wires an internal `useWeatherStations` hook — the fn-52
  // `WorkflowPanel` owns its own composition-layer weather query
  // observer and injects a hook into `WeatherStationSelector` directly.
  // Keeping the fields on the interface (without consuming them here)
  // preserves the DI surface without dragging an unused query observer
  // into every analysis plugin consumer. Task 7 (epic composition
  // cleanup) is the right place to remove them from `AnalysisDeps`
  // entirely.

  const isGroundMaterialsActive = stableLayerVisibility.groundMaterials

  // Area-mode polygon draw layer. The hook subscribes to areaMode /
  // areaPolygon / areaDrawing from the store and returns either `null`
  // (when area mode is off) or an EditableGeoJsonLayer instance. Invoked
  // here at the plugin level — NOT inside `AreaAnalysisTab` — because
  // the layer must land in the plugin's `layers` callback during map
  // render, which fires regardless of which tab the sidebar panel is on.
  const areaDrawLayer = useAreaDrawLayer()

  // Merged area-run bitmap layer. The hook reads `areaResult` + `areaStatus`
  // from the store and returns `null` until the run succeeds. Like the draw
  // layer, invoked at the plugin level so the bitmap renders regardless of
  // which tab the sidebar panel is on. `deps.zOffsetM` lifts the raster to
  // the photogrammetry terrain when Google 3D Tiles are on.
  const areaBitmapLayer = useAreaBitmapLayer(deps.zOffsetM ?? 0, deps.areaOpacity ?? 1)

  // Run-area hook. Mounted at the plugin level so an in-flight run survives
  // panel unmount / tab switches — leaving the map route itself is a
  // cancellation point (the hook's unmount effect aborts the in-flight
  // fetch), but everything inside the route keeps the run alive.
  const { start: runAreaStart, cancel: runAreaCancel } = uiConfig.useRunArea()

  // --- Build deps for child components ---
  //
  // `areaAnalysisTabDeps` is the single source of truth for the area-tab
  // wiring. Both surfaces (the full `StablePanel` used by non-workflow
  // routes AND the body-only `analysisTabBody` node injected into the
  // fn-52 `WorkflowPanel`) consume the same object so the run hook's
  // abort-controller ref and the preview query observer each exist as
  // exactly one instance across the plugin lifetime.
  // Stable location getter that reads lat/lon from the injected viewport.
  // The composition root wires `getViewport` to `buildingsViewport` (the
  // picked address), which is exactly the location the server needs for
  // weather auto-fetch and sun-vector calculations.
  const getLocation = useCallback(() => {
    const vp = deps.getViewport()
    return { latitude: vp.latitude, longitude: vp.longitude }
  }, [deps.getViewport])

  const areaAnalysisTabDeps: AreaAnalysisTabDeps = useMemo(
    () => ({
      useAreaPreview: uiConfig.useAreaPreview,
      onRunArea: runAreaStart,
      onCancelArea: runAreaCancel,
      getLocation,
      getBuildings: uiConfig.getBuildings,
      getGroundMaterials: uiConfig.getGroundMaterials,
      getVegetation: uiConfig.getVegetation,
    }),
    [
      uiConfig.useAreaPreview,
      runAreaStart,
      runAreaCancel,
      getLocation,
      uiConfig.getBuildings,
      uiConfig.getGroundMaterials,
      uiConfig.getVegetation,
    ],
  )

  // Stable Panel component reference. The route renders this directly via
  // `<plugin.Panel />`, and React unmounts/remounts whenever a component's
  // type identity changes. We MUST hand back the same function reference on
  // every render -- otherwise every plugin recompute would tear down the
  // entire panel subtree (including long-lived query observers inside it).
  //
  // Pattern: write the latest deps into a ref on every render, then read
  // them inside the stable component body. The ref write is safe (a normal
  // JS assignment, not a React state update) and avoids an extra effect
  // round-trip that would otherwise let the child render with stale deps.
  const panelDepsRef = useRef(areaAnalysisTabDeps)
  panelDepsRef.current = areaAnalysisTabDeps
  // Capture component ref once — callers must pass a stable module-level
  // import, not an inline closure. The empty deps array is intentional:
  // changing the Panel identity would unmount the entire panel subtree.
  const panelRef = useRef(uiConfig.PanelComponent)
  const StablePanel = useMemo<ComponentType<MapPanelProps>>(
    () =>
      function AreaAnalysisTabHost(_props: MapPanelProps) {
        const Comp = panelRef.current
        return <Comp deps={panelDepsRef.current} />
      },
    [],
  )

  const OverlayImpl = uiConfig.OverlayComponent

  const plugin = useMemo(
    () =>
      createAnalysisPlugin({
        Panel: StablePanel,
        Overlay: OverlayImpl,
        layerVisibility: stableLayerVisibility,
        buildingsViewport: stableViewport,
        areaDrawLayer,
        areaBitmapLayer,
        isGroundMaterialsActive,
      }),
    [
      stableLayerVisibility,
      stableViewport,
      areaDrawLayer,
      areaBitmapLayer,
      isGroundMaterialsActive,
      StablePanel,
      OverlayImpl,
    ],
  )

  // Body-only tab content for injection into the fn-52 WorkflowPanel. Renders
  // only the area-tiled tab body — analysis type picker, per-type
  // `AreaCostCard`, run-lifecycle UI. The WorkflowPanel shell owns the
  // location header, top-level WeatherStationSelector, Draw Area button,
  // and tab chrome, so a full-shell panel here would duplicate them. Reuses
  // the same `areaAnalysisTabDeps` as `StablePanel` so both surfaces share
  // the single plugin-level `useRunArea` abort-controller ref. In practice
  // only ONE of the two surfaces is mounted at a time.
  const analysisTabBody = useMemo<ReactNode>(() => {
    const Comp = panelRef.current
    return <Comp deps={areaAnalysisTabDeps} />
  }, [areaAnalysisTabDeps])

  return useMemo(() => ({ plugin, analysisTabBody }), [plugin, analysisTabBody])
}
