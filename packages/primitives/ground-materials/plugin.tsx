import { computeOriginFromPolygon } from '@forge-kit/geo-core'
import type { MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { Shapes } from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { GroundMaterialColorMode } from './core/ground-materials.colors'
import type { GroundMaterialRegistry } from './core/ground-materials.sdk-types'
import type { GroundMaterialsViewport, MetersToLatLngFn } from './core/ground-materials.types'
import {
  setGroundMaterialsApiClient,
  useGroundMaterialRegistry,
} from './react/ground-materials.api'
import type { GroundMaterialsSdkClient } from './react/ground-materials.area-api'
import { useGroundMaterialsAreaMutation } from './react/ground-materials.area-api'
import { createGroundMaterialsAreaLayer } from './react/ground-materials.area-layer'
import { setMetersToLatLng } from './react/ground-materials.config'
import { useGroundMaterialsDraw } from './react/ground-materials.draw-hook'
import type { GroundMaterialsPanelDeps } from './react/ground-materials.panel-deps'
import { type MaterialLayers, useGroundMaterialsStore } from './react/ground-materials.store'

// ---------------------------------------------------------------------------
// Dependency interfaces
// ---------------------------------------------------------------------------

/**
 * API client interface expected by ground-materials hooks.
 * Matches the `api` shape from `@/lib/api`.
 */
export interface GroundMaterialsApiClient {
  get: <T>(path: string, timeout?: number) => Promise<T>
  post: <T>(path: string, data: unknown, timeout?: number) => Promise<T>
}

/**
 * Dependencies required by the ground-materials plugin hook.
 * Provided by the composition root so the package does not depend
 * on the map interface store or app-level utilities directly.
 */
export interface GroundMaterialsDeps {
  /** Legacy API client (501-guarded collect/clean endpoints). */
  apiClient: GroundMaterialsApiClient
  /**
   * New SDK client used by the SDK area-display path
   * (`useGroundMaterialsAreaMutation`). Receives `client.groundMaterials.getArea`.
   */
  sdkClient: GroundMaterialsSdkClient
  /** User-drawn polygon used as the area for `getArea(polygon)`. */
  polygon: GeoJsonPolygon | null
  /** True while the user is mid-draw — suppresses store-reset side-effects. */
  isDrawing: boolean
  /** Whether the SDK display layer is currently rendered. */
  displayEnabled: boolean
  /** Scene base lift (m) for the surface display layers — composition root
   *  threads `groundElevationM + manualElevationOffsetM` when Google 3D Tiles
   *  are on so surfaces sit on the photogrammetry floor; defaults to 0. The
   *  per-material render-z stack is added on top of this base. */
  zOffsetM?: number
  /** Whether the manual-draw layer is currently visible */
  isGroundMaterialsActive: boolean
  /** Active theme for the on-map fill treatment (pastel softening). Default
   *  `light`. The registry `diffuseColor` (sim input) is never modified. */
  colorMode?: GroundMaterialColorMode
  /** Set a named layer's visibility in the map interface */
  setLayer: (name: string, visible: boolean) => void
  /** Get the current buildings viewport from the map interface */
  getBuildingsViewport: () => GroundMaterialsViewport
  /** Convert local meters to lat/lng using a geographic origin */
  metersToLatLng: MetersToLatLngFn
  /** Panel component injected from the app layer. */
  PanelComponent: ComponentType<{ deps: GroundMaterialsPanelDeps }>
}

// ---------------------------------------------------------------------------
// Pre-resolved data passed to the pure factory
// ---------------------------------------------------------------------------

export interface GroundMaterialsPluginData {
  panelDeps: GroundMaterialsPanelDeps
  PanelComponent: ComponentType<{ deps: GroundMaterialsPanelDeps }>
  /** SDK-fetched material layers to render. `null` skips rendering. */
  areaLayers: MaterialLayers | null
  /** Material registry — used to look up fill colours by layer name. */
  registry: GroundMaterialRegistry | undefined
  /** Master flag — when false, the SDK display layers are hidden. */
  displayEnabled: boolean
  /** Scene base lift (m) for the surface display layers (3D-tiles). Default 0. */
  zOffsetM?: number
  /** Shared METER_OFFSETS origin `[lng, lat]` (the SAME `computeOriginFromPolygon`
   *  buildings use). When set, the surface renders in buildings' depth space so
   *  they occlude it; when null, the legacy LNGLAT path is used. */
  origin?: [number, number] | null
  /** Active theme for the on-map pastel fill treatment. Default `light`. */
  colorMode?: GroundMaterialColorMode
}

// ---------------------------------------------------------------------------
// Pure factory -- no React hooks, safe to call anywhere
// ---------------------------------------------------------------------------

/**
 * Pure factory that assembles a `MapPlugin` for the ground-materials primitive.
 *
 * Does NOT call any React hooks. Use `useGroundMaterialsMapPlugin` for the
 * full React integration (draw hook, registry fetching).
 */
export function createGroundMaterialsPlugin(data: GroundMaterialsPluginData): MapPlugin {
  const {
    PanelComponent: PanelImpl,
    areaLayers,
    registry,
    displayEnabled,
    zOffsetM = 0,
    origin = null,
    colorMode = 'light',
  } = data
  return {
    id: 'ground-materials',
    panelLabel: 'Ground Materials',
    panelIcon: Shapes,
    Panel: () => <PanelImpl deps={data.panelDeps} />,

    onMapReady: () => {
      // MapboxDraw lifecycle is managed by DrawControl (React component
      // rendered via mapChildren). This hook is available for future use.
    },

    onMapDestroy: () => {
      // Cleanup is handled by DrawControl's useControl cleanup callback.
    },

    cleanup: () => {
      useGroundMaterialsStore.getState().resetSession()
      useGroundMaterialsStore.getState().clearArea()
    },

    layers: (_ctx: MapPluginContext) => {
      if (!displayEnabled || !areaLayers || !registry) return []
      return createGroundMaterialsAreaLayer(areaLayers, registry, {
        visible: true,
        zOffsetM,
        coordinateOrigin: origin,
        colorMode,
      })
    },
  }
}

// ---------------------------------------------------------------------------
// React hook -- fetches data, subscribes to stores, calls factory
// ---------------------------------------------------------------------------

/**
 * React hook that creates a MapPlugin for the ground-materials primitive.
 *
 * Ground materials uses Mapbox GL Draw (not DeckGL layers), so it hooks into
 * the map lifecycle via `onMapReady` / `onMapDestroy`. The DrawControl
 * component is rendered as a child of the react-map-gl Map component.
 *
 * @param deps - Injected dependencies from the composition root
 * @returns The plugin instance, drawProps for DrawControl, and the material registry
 */
export function useGroundMaterialsMapPlugin(deps: GroundMaterialsDeps): {
  plugin: MapPlugin
  drawProps: ReturnType<typeof useGroundMaterialsDraw>
  registry: ReturnType<typeof useGroundMaterialRegistry>['data']
  areaMutation: ReturnType<typeof useGroundMaterialsAreaMutation>
} {
  // Set module-level API client for all ground-materials hooks
  setGroundMaterialsApiClient(deps.apiClient)
  // Set module-level metersToLatLng for import processing
  setMetersToLatLng(deps.metersToLatLng)

  // `useGroundMaterialsDraw` returns a memoized object — forward it as
  // `drawProps` directly so consumers (composition root → context) get a
  // stable reference. `setVisible` is pulled out separately for the
  // visibility effect below.
  const drawProps = useGroundMaterialsDraw()
  const { setVisible } = drawProps

  const { data: registry } = useGroundMaterialRegistry()

  const areaMutation = useGroundMaterialsAreaMutation(deps.sdkClient)

  const { areaLayers } = useGroundMaterialsStore(useShallow((s) => ({ areaLayers: s.areaLayers })))

  useEffect(() => {
    setVisible(deps.isGroundMaterialsActive)
  }, [deps.isGroundMaterialsActive, setVisible])

  // Build panel deps from the injected deps
  const panelDeps: GroundMaterialsPanelDeps = useMemo(
    () => ({
      getBuildingsViewport: deps.getBuildingsViewport,
      setLayer: deps.setLayer,
    }),
    [deps.getBuildingsViewport, deps.setLayer],
  )

  const PanelComp = deps.PanelComponent
  const zOffsetM = deps.zOffsetM ?? 0

  // Shared METER_OFFSETS origin — MUST be bit-identical to buildings/trees so
  // all three project from the same point and share one depth space. Same
  // inputs as buildings: the SAME `effectivePolygon` (composition root) + the
  // SAME `isDrawing` gate + the SAME `computeOriginFromPolygon` (geo-core).
  // Memoised on the polygon identity (this hook is plain React; an inline
  // `computeOriginFromPolygon` would return a fresh array each render).
  const origin = useMemo<[number, number] | null>(
    () => (!deps.isDrawing && deps.polygon ? computeOriginFromPolygon(deps.polygon) : null),
    [deps.isDrawing, deps.polygon],
  )

  const colorMode = deps.colorMode ?? 'light'

  const plugin: MapPlugin = useMemo(
    () =>
      createGroundMaterialsPlugin({
        panelDeps,
        PanelComponent: PanelComp,
        areaLayers,
        registry,
        displayEnabled: deps.displayEnabled,
        zOffsetM,
        origin,
        colorMode,
      }),
    [panelDeps, PanelComp, areaLayers, registry, deps.displayEnabled, zOffsetM, origin, colorMode],
  )

  // Memoize the result wrapper so every consumer downstream (composition
  // root → MapPluginsContext → deck overlay, draw control, layer loaders)
  // sees stable references across renders.
  return useMemo(
    () => ({
      plugin,
      drawProps,
      registry,
      areaMutation,
    }),
    [plugin, drawProps, registry, areaMutation],
  )
}
