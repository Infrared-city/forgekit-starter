import type { PickingInfo } from '@deck.gl/core'
import type { DeckGLRef } from '@deck.gl/react'
import type { MapOverlayProps, MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { Building2 } from 'lucide-react'
import type { MjolnirGestureEvent } from 'mjolnir.js'
import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { MergedGeometry } from './core/buildings.merge-geometry'
import { clearMeshCache } from './core/buildings.mesh-cache'
import { computeMeshOrientation } from './core/buildings.orientation'
import type { DotBimMesh } from './core/buildings.sdk-types'
import type { BuildingTransform } from './core/buildings.transforms'
import { applyTransform } from './core/buildings.transforms'
import type { BuildingsSdkClient } from './react/buildings.api'
import { useAsyncBuildingsGeometry } from './react/buildings.async-geometry'
import { createGizmoLayers } from './react/buildings.gizmo-layer'
import { createBuildingsLayer } from './react/buildings.layers'
import { getBuildingsInitialState, useBuildingsStore } from './react/buildings.store'
import type { BuildingTooltipDeps } from './react/buildings.tooltip-deps'

// ---------------------------------------------------------------------------
// Dependency interfaces
// ---------------------------------------------------------------------------

/**
 * Dependencies required by the buildings plugin hook (`useBuildingsMapPlugin`).
 *
 * Provided by the composition root (app route) so that the buildings package
 * does not depend on the map interface store directly.
 */
export interface BuildingsDeps {
  /**
   * User-drawn polygon to fetch buildings inside. When `null` the plugin
   * produces zero layers and no network request is made.
   *
   * The polygon is threaded from the analysis store (`areaPolygon`) via the
   * composition root so the buildings primitive stays store-agnostic.
   */
  polygon: GeoJsonPolygon | null
  /**
   * True while the user is actively editing the polygon (see fn-51
   * `areaDrawing`). Mid-draw fetches are suppressed: the composition root
   * gate is applied inside the hook as `effectivePolygon = isDrawing ? null
   * : polygon`.
   */
  isDrawing: boolean
  /** Current drag interaction state */
  dragState: {
    isDragging: boolean
    dragAxis: 'x' | 'y' | null
    dragDeltaMeters: { x: number; y: number }
    initialTransform: { deltaX: number; deltaY: number } | null
  }
  /** SDK client for fetching building data */
  apiClient: BuildingsSdkClient
  /** Map interface state -- injected to avoid direct store dependency */
  mapState: {
    selectedMeshId: string | null
    hoveredMeshId: string | null
    layerVisibility: { buildings: boolean; groundMaterials: boolean }
  }
  /** Start drag on a gizmo axis */
  startDrag: (
    axis: 'x' | 'y',
    mouseMeters: { x: number; y: number },
    initialTransform: { deltaX: number; deltaY: number },
  ) => void
  /** Update drag position */
  updateDrag: (mouseMeters: { x: number; y: number }) => void
  /** End drag */
  endDrag: () => void
  /** Select a mesh by ID */
  selectMesh: (id: string | null) => void
  /** Convert local meters to lat/lng */
  metersToLatLng: (
    meters: { x: number; y: number },
    origin: [number, number],
  ) => { lat: number; lng: number }
  /** Convert lat/lng to local meters */
  latLngToMeters: (
    coords: { lat: number; lng: number },
    origin: [number, number],
  ) => { x: number; y: number }
  /** Compute mesh centroid */
  computeMeshCentroid: (mesh: DotBimMesh) => { x: number; y: number; z: number }
  /** Overlay component injected from the app layer. */
  OverlayComponent: ComponentType<{ deps: BuildingTooltipDeps }>
  /** Optional vertical lift (m) for the buildings layer's `coordinateOrigin`.
   *  Composition root computes from `groundElevationM + manualElevationOffsetM`
   *  when 3D Tiles are on; defaults to 0. See `BuildingLayerOptions.zOffsetM`. */
  zOffsetM?: number
  /** Render EVERY building in the store instead of culling to `polygon`. Set for
   *  BYO-uploaded buildings, whose store set IS the user's whole model — the
   *  `polygon` may be a smaller centered analysis AOI, and culling to it would
   *  hide the buildings the user uploaded outside it. Defaults to false (the
   *  fetched-set path still trims to the drawn area). */
  renderAllBuildings?: boolean
}

/** Pre-resolved data passed to the pure factory. */
export interface BuildingsPluginData {
  buildings: Record<string, DotBimMesh> | undefined
  mergedGeometry: MergedGeometry | null
  buildingTransforms: Record<string, BuildingTransform>
  origin: [number, number]
  dragState: BuildingsDeps['dragState']
  mapState: BuildingsDeps['mapState']
  startDrag: BuildingsDeps['startDrag']
  updateDrag: BuildingsDeps['updateDrag']
  endDrag: BuildingsDeps['endDrag']
  selectMesh: BuildingsDeps['selectMesh']
  metersToLatLng: BuildingsDeps['metersToLatLng']
  latLngToMeters: BuildingsDeps['latLngToMeters']
  computeMeshCentroid: BuildingsDeps['computeMeshCentroid']
  OverlayComponent: ComponentType<{ deps: BuildingTooltipDeps }>
  zOffsetM?: number
}

// ---------------------------------------------------------------------------
// Pure factory -- no React hooks, safe to call anywhere
// ---------------------------------------------------------------------------

/**
 * Pure factory that assembles a `MapPlugin` for the buildings primitive.
 *
 * Does NOT call any React hooks. All reactive data must be pre-resolved and
 * passed in via `data`. Use `useBuildingsMapPlugin` for the full React
 * integration (data fetching + store subscription + memoisation).
 *
 * @param data - Pre-resolved buildings data and interaction state
 * @returns A MapPlugin instance with layers, drag handlers, shortcuts, overlay, and cleanup lifecycle
 */
export function createBuildingsPlugin(data: BuildingsPluginData): MapPlugin {
  const {
    buildings,
    mergedGeometry,
    buildingTransforms,
    origin,
    dragState,
    mapState,
    startDrag,
    updateDrag,
    endDrag,
    selectMesh,
    metersToLatLng,
    latLngToMeters,
    computeMeshCentroid,
    OverlayComponent: TooltipImpl,
    zOffsetM,
  } = data

  const { selectedMeshId, hoveredMeshId, layerVisibility } = mapState
  const isGroundMaterialsActive = layerVisibility.groundMaterials

  return {
    id: 'buildings',
    panelLabel: 'Buildings',
    panelIcon: Building2,

    cleanup: () => {
      clearMeshCache()
      useBuildingsStore.setState(getBuildingsInitialState())
    },

    // Drag interaction -- handles gizmo-based building translation
    onDragStart: (info: unknown, event: unknown) => {
      const pickInfo = info as PickingInfo
      const gestureEvent = event as MjolnirGestureEvent
      if (pickInfo.layer?.id === 'gizmo-lines' && pickInfo.object && selectedMeshId) {
        const gizmoObj = pickInfo.object as { axis: 'x' | 'y' }
        const axis = gizmoObj.axis
        const metersPos = latLngToMeters(
          { lng: pickInfo.coordinate![0], lat: pickInfo.coordinate![1] },
          origin,
        )
        const currentTransform = buildingTransforms[selectedMeshId]
        const initialTransform = {
          deltaX: currentTransform?.deltaX || 0,
          deltaY: currentTransform?.deltaY || 0,
        }
        startDrag(axis, metersPos, initialTransform)
        gestureEvent.stopPropagation()
        return true // consume -- disables map pan
      }
    },

    onDrag: (info: unknown) => {
      const pickInfo = info as PickingInfo
      if (
        dragState.isDragging &&
        pickInfo.coordinate &&
        selectedMeshId &&
        buildings &&
        buildings[selectedMeshId]
      ) {
        const metersPos = latLngToMeters(
          { lng: pickInfo.coordinate[0], lat: pickInfo.coordinate[1] },
          origin,
        )
        updateDrag(metersPos)

        const selectedMesh = buildings[selectedMeshId]
        const currentTransform = buildingTransforms[selectedMeshId]

        const naturalOrientation = computeMeshOrientation(selectedMesh)
        const userRotation = currentTransform?.rotation || 0
        const totalRotation = naturalOrientation + userRotation
        const angleRad = (totalRotation * Math.PI) / 180

        const { x: dx, y: dy } = dragState.dragDeltaMeters
        let deltaMoved = { x: 0, y: 0 }

        if (dragState.dragAxis === 'x') {
          const projection = dx * Math.cos(angleRad) + dy * Math.sin(angleRad)
          deltaMoved = {
            x: projection * Math.cos(angleRad),
            y: projection * Math.sin(angleRad),
          }
        } else if (dragState.dragAxis === 'y') {
          const projection = dx * -Math.sin(angleRad) + dy * Math.cos(angleRad)
          deltaMoved = {
            x: projection * -Math.sin(angleRad),
            y: projection * Math.cos(angleRad),
          }
        }

        if (dragState.initialTransform) {
          useBuildingsStore.getState().updateBuildingTransform(selectedMeshId, {
            deltaX: dragState.initialTransform.deltaX + deltaMoved.x,
            deltaY: dragState.initialTransform.deltaY + deltaMoved.y,
          })
        }
      }
    },

    onDragEnd: () => {
      if (dragState.isDragging) {
        endDrag()
      }
    },

    // Keyboard shortcuts -- R to reset transform
    shortcuts: [
      {
        key: 'r',
        handler: () => {
          if (selectedMeshId) {
            useBuildingsStore.getState().clearBuildingTransform(selectedMeshId)
          }
        },
        description: 'Reset building transform',
      },
    ],

    Overlay: ({ deckRef: overlayDeckRef }: MapOverlayProps) => {
      const tooltipDeps: BuildingTooltipDeps = {
        deckRef: overlayDeckRef as React.RefObject<DeckGLRef | null>,
        origin,
        buildings,
        selectedMeshId,
        dragState,
        selectMesh,
        computeMeshCentroid,
        metersToLatLng,
      }
      return <TooltipImpl deps={tooltipDeps} />
    },

    layers: (_context: MapPluginContext) => {
      const layerArray = []
      const hideDeckLayers = isGroundMaterialsActive

      if (mergedGeometry) {
        layerArray.push(
          createBuildingsLayer(mergedGeometry, origin, {
            selectedId: selectedMeshId || undefined,
            hoveredId: hoveredMeshId || undefined,
            visible: layerVisibility.buildings && !hideDeckLayers,
            zOffsetM,
          }),
        )
      }

      if (selectedMeshId && buildings && buildings[selectedMeshId] && !hideDeckLayers) {
        const selectedMesh = buildings[selectedMeshId]
        const transform = buildingTransforms[selectedMeshId]
        const transformedMesh = transform ? applyTransform(selectedMesh, transform) : selectedMesh
        const naturalOrientation = computeMeshOrientation(selectedMesh)
        const userRotation = transform?.rotation || 0

        layerArray.push(
          ...createGizmoLayers(transformedMesh, origin, {
            rotation: naturalOrientation + userRotation,
            dragAxis: dragState.dragAxis,
            dragDelta: dragState.isDragging ? dragState.dragDeltaMeters : null,
          }),
        )
      }

      return layerArray.filter(Boolean)
    },
  }
}

// ---------------------------------------------------------------------------
// React hook -- fetches data, subscribes to stores, calls factory
// ---------------------------------------------------------------------------

/**
 * React hook that creates a MapPlugin for the buildings primitive.
 *
 * Handles data fetching (React Query), store subscription (Zustand), and
 * geometry memoisation. Delegates plugin assembly to `createBuildingsPlugin`.
 *
 * @param deps - Injected dependencies from the composition root
 * @returns The memoised plugin instance and the fetched buildings data
 */
export function useBuildingsMapPlugin(deps: BuildingsDeps): {
  plugin: MapPlugin
  buildings: Record<string, DotBimMesh> | undefined
} {
  // `apiClient` stays in BuildingsDeps for caller compat but is unused here — the
  // plugin no longer fetches (the caller owns that), so it's not destructured.
  const { polygon, isDrawing, dragState, mapState, renderAllBuildings } = deps

  // Mid-draw gating: do not fetch while the user is actively editing the
  // polygon. This is the composition-boundary gate described in the task
  // spec — the hook itself stays store-agnostic.
  const effectivePolygon = isDrawing ? null : polygon

  // Read buildings from the primitive store. Writers are
  // `useBuildingsMutation` (preferred) or `useBuildingsInArea` mirror
  // (legacy). Plugin no longer fetches — that's the caller's job.
  const { buildings: storeBuildings, buildingTransforms } = useBuildingsStore(
    useShallow((s) => ({
      buildings: s.buildings,
      buildingTransforms: s.buildingTransforms,
    })),
  )

  // Polygon filter + merge run time-sliced off the render tick (the top
  // project-open freeze at city scale) — `buildings`, `mergedGeometry` AND
  // `origin` arrive as ONE consistent snapshot (geometry positions are
  // METER_OFFSETS relative to the origin they were computed against; a live
  // origin over a stale mesh would displace the whole city during the stale
  // window after a polygon redraw). Stale-while-revalidate on change;
  // mid-draw + null-polygon still gate synchronously to zero layers.
  const { buildings, mergedGeometry, origin } = useAsyncBuildingsGeometry(
    storeBuildings,
    effectivePolygon,
    buildingTransforms,
    { renderAll: renderAllBuildings ?? false },
  )

  const plugin: MapPlugin = useMemo(
    () =>
      createBuildingsPlugin({
        buildings,
        mergedGeometry,
        buildingTransforms,
        origin,
        dragState,
        mapState,
        startDrag: deps.startDrag,
        updateDrag: deps.updateDrag,
        endDrag: deps.endDrag,
        selectMesh: deps.selectMesh,
        metersToLatLng: deps.metersToLatLng,
        latLngToMeters: deps.latLngToMeters,
        computeMeshCentroid: deps.computeMeshCentroid,
        OverlayComponent: deps.OverlayComponent,
        zOffsetM: deps.zOffsetM,
      }),
    [
      mergedGeometry,
      buildings,
      buildingTransforms,
      origin,
      dragState,
      mapState,
      deps.startDrag,
      deps.updateDrag,
      deps.endDrag,
      deps.selectMesh,
      deps.metersToLatLng,
      deps.latLngToMeters,
      deps.computeMeshCentroid,
      deps.OverlayComponent,
      deps.zOffsetM,
    ],
  )

  return { plugin, buildings }
}
