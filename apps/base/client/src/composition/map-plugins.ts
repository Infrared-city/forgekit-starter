/**
 * Map plugin composition -- wires primitive plugins with their dependencies.
 *
 * This module is the single place that knows which primitives participate in
 * the map interface and how their cross-dependencies are satisfied.
 * The route calls `useMapPlugins()` and receives fully assembled plugins.
 */
import {
  type AnalysisDeps,
  type AnalysisUIConfig,
  createUseAreaPreview,
  createUseRunArea,
  useAnalysisMapPlugin,
  useAnalysisStore,
} from '@forge-kit/analysis'
import { useBuildingsInArea, useBuildingsMapPlugin } from '@forge-kit/buildings'
import { useGroundMaterialsMapPlugin, useGroundMaterialsStore } from '@forge-kit/ground-materials'
import {
  type BuildingsViewport,
  computeMeshCentroid,
  type DragState,
  latLngToMeters,
  metersToLatLng,
  useMapStore,
} from '@forge-kit/map-interface'
import type { MapPlugin } from '@forge-kit/plugin-contracts'
import { useVegetationMapPlugin, useVegetationStore } from '@forge-kit/vegetation'
import { type ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AreaAnalysisTab, AreaDrawLegend } from '@/components/domains/analysis'
import { BuildingTooltip } from '@/components/domains/buildings'
import { GroundMaterialsPanel } from '@/components/domains/ground-materials'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth.store'
import { createSdk } from '@/lib/sdk'

const sdk = createSdk({ getToken: () => useAuthStore.getState().idToken ?? '' })

import { createWeatherAdapter } from './adapters'

// Create the useAreaPreview / useRunArea hooks at module level. Both
// factories take the InfraredClient directly — the SDK now exposes
// `client.previewAreaWithPricing(polygon, opts)` and `client.runAreaAndWait(...)`,
// so the granular tile/merge surface that the old factories required is
// no longer threaded through the composition root.
const useAreaPreview = createUseAreaPreview(sdk)
const useRunArea = createUseRunArea(sdk)

// Create stable adapter instances at module level (no React state needed)
const weatherAdapter = createWeatherAdapter(sdk)

/**
 * Result of the map plugin composition hook.
 *
 * - `plugins` -- ordered array of MapPlugins for MapCanvas
 * - `drawProps` -- callback props for DrawControl (ground-materials)
 * - `registry` -- ground material registry for DrawControl
 * - `analysisTabBody` -- body-only analysis tab content for injection
 *   into the fn-52 `WorkflowPanel.deps.analysisPanel` slot. Rendering
 *   the full analysis `plugin.Panel` here would duplicate the header,
 *   weather station selector, and status footer that the WorkflowPanel
 *   shell already owns — so the hook exposes a dedicated body-only
 *   node alongside the plugin.
 */
export interface MapPluginsResult {
  plugins: MapPlugin[]
  drawProps: ReturnType<typeof useGroundMaterialsMapPlugin>['drawProps']
  registry: ReturnType<typeof useGroundMaterialsMapPlugin>['registry']
  groundMaterialsAreaMutation: ReturnType<typeof useGroundMaterialsMapPlugin>['areaMutation']
  vegetationMutation: ReturnType<typeof useVegetationMapPlugin>['mutation']
  analysisTabBody: ReactNode
}

/**
 * Compose all map plugins with their dependencies.
 *
 * Must be called inside a React component (it uses hooks internally).
 * Returns the assembled plugins plus data needed by the route for rendering.
 */
export function useMapPlugins(viewport: BuildingsViewport, dragState: DragState): MapPluginsResult {
  'use no memo' // Opts out of React Compiler -- hook references passed as config values
  const selectedMeshId = useMapStore((s) => s.selectedMeshId)
  const hoveredMeshId = useMapStore((s) => s.hoveredMeshId)
  const layers = useMapStore((s) => s.layers)
  const setLayer = useMapStore((s) => s.setLayer)
  const selectMesh = useMapStore((s) => s.selectMesh)
  const startDrag = useMapStore((s) => s.startDrag)
  const updateDrag = useMapStore((s) => s.updateDrag)
  const endDrag = useMapStore((s) => s.endDrag)

  // Area polygon + drawing state from the analysis store. The buildings
  // primitive stays store-agnostic; the composition root threads these
  // values into `BuildingsDeps`. `useShallow` keeps the selection tuple
  // referentially stable across unrelated store updates.
  const { areaPolygon, areaDrawing } = useAnalysisStore(
    useShallow((s) => ({
      areaPolygon: s.areaPolygon,
      areaDrawing: s.areaDrawing,
    })),
  )

  // Clear ground-materials + vegetation stores whenever the area polygon
  // is cleared (Redraw) or replaced. The dedicated effect lives here —
  // LayerLoaders unmounts when `step !== 'ready'`, so its in-house
  // effect cannot catch the polygon → null transition.
  useEffect(() => {
    if (areaPolygon == null) {
      useGroundMaterialsStore.getState().clearArea()
      useVegetationStore.getState().clear()
    }
  }, [areaPolygon])

  // --- Buildings plugin ---
  const mapState = useMemo(
    () => ({
      selectedMeshId,
      hoveredMeshId,
      layerVisibility: { buildings: layers.buildings, groundMaterials: layers.groundMaterials },
    }),
    [selectedMeshId, hoveredMeshId, layers.buildings, layers.groundMaterials],
  )

  const { plugin: buildingsPlugin } = useBuildingsMapPlugin({
    polygon: areaPolygon,
    isDrawing: areaDrawing,
    dragState,
    apiClient: sdk,
    mapState,
    startDrag,
    updateDrag,
    endDrag,
    selectMesh,
    metersToLatLng,
    latLngToMeters,
    computeMeshCentroid,
    OverlayComponent: BuildingTooltip,
  })

  // --- Buildings-in-area query for passing cached data to analysis runs.
  // React Query deduplicates this with the identical call in map.tsx and
  // inside the buildings plugin, so no extra fetch is triggered.
  const effectivePolygon = areaDrawing ? null : areaPolygon
  const buildingsInAreaQuery = useBuildingsInArea(effectivePolygon, sdk)
  const getBuildings = useCallback(
    () => buildingsInAreaQuery.data?.allBuildings as Record<string, unknown> | undefined,
    [buildingsInAreaQuery.data],
  )

  // --- Analysis plugin adapters ---
  const setAnalysisLayerVisible = useCallback(
    (visible: boolean) => setLayer('analysis', visible),
    [setLayer],
  )

  const getBuildingsViewport = useCallback(() => useMapStore.getState().buildingsViewport, [])

  const getViewportFn = useCallback(() => viewport, [viewport])
  // Memoize the returned object so the analysis plugin sees a stable identity
  // when individual flags are unchanged. Without this, every render allocates
  // a fresh `{ analysis, groundMaterials }` literal and the plugin treats it
  // as a new value even though both booleans are stable.
  const layerVisibility = useMemo(
    () => ({ analysis: layers.analysis, groundMaterials: layers.groundMaterials }),
    [layers.analysis, layers.groundMaterials],
  )
  const getLayerVisibility = useCallback(() => layerVisibility, [layerVisibility])

  const analysisDeps: AnalysisDeps = useMemo(
    () => ({
      getWeatherStations: weatherAdapter.getWeatherStations,
      getWeatherData: weatherAdapter.getWeatherData,
      getViewport: getViewportFn,
    }),
    [getViewportFn],
  )

  // Use `rawAreaLayers` (unfiltered SDK output) for the analysis run so layers
  // outside the local display registry (e.g. `grass`, `sand`) still reach the
  // backend, matching Python SDK parity. `areaLayers` (registry-normalized)
  // stays scoped to the display layer.
  const getGroundMaterials = useCallback(
    () => useGroundMaterialsStore.getState().rawAreaLayers ?? undefined,
    [],
  )
  const getVegetation = useCallback(() => useVegetationStore.getState().features ?? undefined, [])

  const analysisUIConfig: AnalysisUIConfig = useMemo(
    () => ({
      setAnalysisLayerVisible,
      getBuildingsViewport,
      getLayerVisibility,
      useAreaPreview,
      useRunArea,
      getBuildings,
      getGroundMaterials,
      getVegetation,
      PanelComponent: AreaAnalysisTab,
      OverlayComponent: AreaDrawLegend,
    }),
    [
      setAnalysisLayerVisible,
      getBuildingsViewport,
      getLayerVisibility,
      getBuildings,
      getGroundMaterials,
      getVegetation,
    ],
  )

  const { plugin: analysisPlugin, analysisTabBody } = useAnalysisMapPlugin(
    analysisDeps,
    analysisUIConfig,
  )

  // --- Ground materials plugin ---
  // Ground Materials SDK path is not shipped yet, so the primitive is
  // intentionally NOT surfaced as a tab in `WorkflowPanel`. The plugin
  // stays assembled here so `DrawControl` still wires through
  // `drawProps` + `registry` (routes/map.tsx renders the mapbox-gl-draw
  // surface via `mapChildren`) and so the primitive keeps type-checking.
  // To re-enable the sidebar UX, add a second tab slot in
  // `apps/base/client/src/composition/WorkflowPanel.tsx` and thread
  // `groundMaterialsPlugin.Panel` into it (called with `panelContext`)
  // via the same deps pattern used for the analysis tab body.
  // DO NOT delete the primitive package.
  const setLayerAdapter = useCallback(
    (name: string, visible: boolean) => setLayer(name as keyof typeof layers, visible),
    [setLayer],
  )

  const {
    plugin: groundMaterialsPlugin,
    drawProps,
    registry,
    areaMutation: groundMaterialsAreaMutation,
  } = useGroundMaterialsMapPlugin({
    apiClient: api,
    sdkClient: sdk,
    polygon: areaPolygon,
    isDrawing: areaDrawing,
    displayEnabled: layers.groundMaterialsDisplay,
    isGroundMaterialsActive: layers.groundMaterials,
    setLayer: setLayerAdapter,
    getBuildingsViewport,
    metersToLatLng,
    PanelComponent: GroundMaterialsPanel,
  })

  // --- Vegetation plugin ---
  const { plugin: vegetationPlugin, mutation: vegetationMutation } = useVegetationMapPlugin({
    polygon: areaPolygon,
    isDrawing: areaDrawing,
    apiClient: sdk,
    visible: layers.vegetation,
  })

  // --- Assemble ---
  // deck.gl layer render order is array order bottom→top. Ground-materials
  // polygons sit lowest so building extrusions + analysis bitmaps render on
  // top; vegetation trees sit between the materials and the buildings.
  const plugins: MapPlugin[] = useMemo(
    () => [groundMaterialsPlugin, vegetationPlugin, buildingsPlugin, analysisPlugin],
    [groundMaterialsPlugin, vegetationPlugin, buildingsPlugin, analysisPlugin],
  )

  // Memoize the result so consumers (`routes/map.lazy.tsx` feeds these
  // fields into `mapChildren` + `layerLoadersNode` useMemos) get stable
  // references. Without this, a fresh literal each render invalidates the
  // downstream memos every parent re-render. Mirrors the apps/platform
  // fix landed in commit 153587d.
  return useMemo(
    () => ({
      plugins,
      drawProps,
      registry,
      groundMaterialsAreaMutation,
      vegetationMutation,
      analysisTabBody,
    }),
    [
      plugins,
      drawProps,
      registry,
      groundMaterialsAreaMutation,
      vegetationMutation,
      analysisTabBody,
    ],
  )
}
