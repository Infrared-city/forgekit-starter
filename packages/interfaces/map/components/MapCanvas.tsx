import {
  AmbientLight,
  DirectionalLight,
  FlyToInterpolator,
  LightingEffect,
  type PickingInfo,
} from '@deck.gl/core'
import DeckGL, { type DeckGLRef } from '@deck.gl/react'
import type { MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'
import { getCursorForMode } from '@infrared/mapbox-theme'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Map, type MapRef } from 'react-map-gl'
import { useShallow } from 'zustand/react/shallow'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { usePluginLayers } from '../hooks/usePluginLayers'
import { usePointerEvents } from '../hooks/usePointerEvents'
import type { PlacesClient } from '../lib/places.types'
import type { ViewState } from '../map.store'
import { useMapStore } from '../map.store'
import { LocationSearch } from './LocationSearch'

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

/**
 * Shape of the controller-override object accepted by `MapCanvas`. A minimal
 * subset that is merged into the DeckGL controller config at render time.
 * Keep this narrow on purpose — if a new override field is needed, add it
 * explicitly here rather than widening to `Partial<ControllerOptions>` and
 * coupling the interface to deck.gl internals.
 */
export interface MapControllerOverride {
  /** Disable DeckGL's double-click zoom. Used by area-mode polygon draw. */
  doubleClickZoom?: boolean
}

export interface MapCanvasProps {
  /** Plugins that contribute layers, panels, and lifecycle hooks. */
  plugins: MapPlugin[]
  /** Optional React children rendered inside the Mapbox Map component (e.g., DrawControl). */
  mapChildren?: React.ReactNode
  /**
   * Controller overrides merged into the DeckGL controller config AND
   * mirrored onto the underlying Mapbox `<Map>` so both handlers respect
   * the override (Mapbox's own double-click handler fires independently
   * of DeckGL's when the base layer has interaction enabled).
   */
  controllerOverride?: MapControllerOverride
  /**
   * Numeric building IDs to hide from Mapbox's native fill-extrusion layer.
   * When our custom MergedBuildingsLayer renders its own geometry, the
   * overlapping Mapbox 3D buildings cause z-fighting. This filter hides
   * only the specific buildings we render ourselves.
   */
  hiddenBuildingIds?: number[]
  /**
   * Google Places client used by the floating LocationSearch overlay. The
   * composition root wires this with the host app's API base URL + JWT
   * resolver (see `createPlacesClient`). Hidden when omitted — the overlay
   * itself does not render.
   */
  placesClient?: PlacesClient
}

/**
 * Plugin-driven map canvas host.
 *
 * Composes DeckGL layers from registered MapPlugin instances, calls lifecycle
 * hooks (onMapReady / onMapDestroy), delegates drag/keyboard to plugins, and
 * renders plugin overlays.
 *
 * Does NOT import from buildings, analysis, or ground-materials packages.
 * All primitive behavior is wired through the plugin system.
 */
export function MapCanvas({
  plugins,
  mapChildren,
  controllerOverride,
  hiddenBuildingIds,
  placesClient,
}: MapCanvasProps) {
  const {
    viewState,
    setViewState,
    selectedMeshId,
    hoveredMeshId,
    pendingFlyTo,
    clearPendingFlyTo,
  } = useMapStore(
    useShallow((s) => ({
      viewState: s.viewState,
      setViewState: s.setViewState,
      selectedMeshId: s.selectedMeshId,
      hoveredMeshId: s.hoveredMeshId,
      pendingFlyTo: s.pendingFlyTo,
      clearPendingFlyTo: s.clearPendingFlyTo,
    })),
  )

  const isGroundMaterialsActive = useMapStore((s) => s.layers.groundMaterials)
  const dragState = useMapStore((s) => s.dragState)

  // --- Controlled-camera fly-to ---
  //
  // DeckGL is the single source of truth for the camera (its `viewState` prop
  // is controlled). That means calling `mapboxMap.flyTo(...)` on the nested
  // `<Map>` is a no-op — DeckGL immediately overrides with whatever is in its
  // `viewState` prop on the next frame.
  //
  // To animate the camera we have to push a new `viewState` into DeckGL with
  // `transitionDuration` + `transitionInterpolator` set. deck.gl then
  // interpolates between the *current* viewState and the *incoming* viewState
  // over `transitionDuration` ms and fires `onViewStateChange` with each
  // intermediate frame. Feeding those frames back via `setViewState` keeps
  // our Zustand store in sync with the animation.
  //
  // We use a one-shot `pendingFlyTo` in the store so the transition props are
  // present for exactly one render (the render that kicks the animation) and
  // are then cleared on `interactionState.inTransition` falling edge. Leaving
  // the transition props on `viewState` permanently would cause every
  // subsequent setViewState to accidentally re-trigger the interpolator.
  const flyToInterpolatorRef = useRef(new FlyToInterpolator({ speed: 1.6 }))
  const wasInTransitionRef = useRef(false)

  // Scene-wide lighting for architectural maquette aesthetic
  const lightingEffect = useMemo(() => {
    const ambient = new AmbientLight({ color: [255, 248, 240], intensity: 0.65 })
    const keyLight = new DirectionalLight({
      color: [255, 250, 245],
      intensity: 0.6,
      direction: [-1, -1, -3],
      // _shadow omitted: MergedBuildingsLayer uses baked vertex-shader lighting;
      // enabling shadow mapping caused self-shadow acne on building walls.
    })
    const fillLight = new DirectionalLight({
      color: [230, 235, 245],
      intensity: 0.25,
      direction: [1, 0.5, -2],
    })
    return new LightingEffect({ ambient, keyLight, fillLight })
  }, [])

  const effects = useMemo(() => [lightingEffect], [lightingEffect])

  const effectiveViewState = pendingFlyTo
    ? {
        ...viewState,
        latitude: pendingFlyTo.latitude,
        longitude: pendingFlyTo.longitude,
        zoom: pendingFlyTo.zoom,
        transitionDuration: 1500,
        transitionInterpolator: flyToInterpolatorRef.current,
      }
    : viewState

  // --- Plugin-driven keyboard shortcuts ---
  usePointerEvents(isGroundMaterialsActive)
  useKeyboardShortcuts(plugins)

  // --- Plugin layer composition ---
  const queryClient = useQueryClient()

  const context: MapPluginContext = useMemo(
    () => ({
      viewport: {
        latitude: viewState.latitude,
        longitude: viewState.longitude,
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
      },
      selectedMeshId,
      hoveredMeshId,
      queryClient,
    }),
    [viewState, selectedMeshId, hoveredMeshId, queryClient],
  )

  const allLayers = usePluginLayers(plugins, context)

  // --- Click / hover handlers ---
  const selectMesh = useMapStore((s) => s.selectMesh)
  const setHoveredMesh = useMapStore((s) => s.setHoveredMesh)

  const handleClick = useCallback(
    (info: PickingInfo) => {
      if (dragState.isDragging || isGroundMaterialsActive) return
      if (
        info.layer?.id === 'gizmo-lines' ||
        info.layer?.id === 'gizmo-arrows' ||
        info.layer?.id === 'gizmo-lines-outline'
      )
        return

      // Forward to plugin event handlers
      if (info.coordinate) {
        const event = {
          type: 'click' as const,
          coordinate: info.coordinate as [number, number],
          layer: info.layer?.id,
          object: info.object,
        }
        for (const p of plugins) {
          p.onMapEvent?.(event)
        }
      }

      if (info.picked && info.layer?.id === 'buildings-merged') {
        const buildingId = (info.object as { buildingId?: string } | undefined)?.buildingId
        if (buildingId) {
          selectMesh(buildingId)
          return
        }
      }
      if (selectedMeshId) selectMesh(null)
    },
    [dragState.isDragging, isGroundMaterialsActive, selectedMeshId, selectMesh, plugins],
  )

  const handleHover = useCallback(
    (info: PickingInfo) => {
      // Forward to plugin event handlers
      if (info.coordinate) {
        const event = {
          type: 'hover' as const,
          coordinate: info.coordinate as [number, number],
          layer: info.layer?.id,
          object: info.object,
        }
        for (const p of plugins) {
          p.onMapEvent?.(event)
        }
      }

      if (info.picked && info.layer?.id === 'buildings-merged') {
        setHoveredMesh((info.object as { buildingId?: string } | undefined)?.buildingId ?? null)
      } else {
        setHoveredMesh(null)
      }
    },
    [setHoveredMesh, plugins],
  )

  // --- Plugin drag handlers ---
  const pluginsRef = useRef(plugins)
  useEffect(() => {
    pluginsRef.current = plugins
  }, [plugins])

  const handleDragStart = useCallback((info: PickingInfo, event: unknown) => {
    for (const p of pluginsRef.current) {
      if (p.onDragStart?.(info, event)) return // consumed
    }
  }, [])

  const handleDragMove = useCallback((info: PickingInfo) => {
    for (const p of pluginsRef.current) {
      p.onDrag?.(info)
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    for (const p of pluginsRef.current) {
      p.onDragEnd?.()
    }
  }, [])

  // --- Map lifecycle hooks ---
  const mapRef = useRef<MapRef>(null)
  const deckRef = useRef<DeckGLRef>(null)

  // Call onMapReady when the Mapbox map instance loads
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (map) {
      for (const p of pluginsRef.current) {
        p.onMapReady?.(map)
      }
    }
  }, [])

  // Hide Mapbox's native fill-extrusion buildings when we render our own
  // Hide only the Mapbox fill-extrusion buildings that we render ourselves via
  // MergedBuildingsLayer. Buildings outside our loaded area remain visible.
  // Re-applied on 'style.load' so the filter survives Mapbox style reloads.
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const applyFilter = () => {
      if (!map.isStyleLoaded()) return
      for (const layer of map.getStyle().layers ?? []) {
        if (layer.type === 'fill-extrusion') {
          if (hiddenBuildingIds && hiddenBuildingIds.length > 0) {
            // Filter out only the specific buildings we render via deck.gl
            map.setFilter(layer.id, ['!', ['in', ['id'], ['literal', hiddenBuildingIds]]])
          } else {
            map.setFilter(layer.id, null)
          }
        }
      }
    }

    applyFilter()
    map.on('style.load', applyFilter)
    return () => {
      map.off('style.load', applyFilter)
    }
  }, [hiddenBuildingIds])

  // Call onMapDestroy on unmount
  useEffect(() => {
    return () => {
      for (const p of pluginsRef.current) {
        p.onMapDestroy?.()
      }
    }
  }, [])

  const mapCursor = useMemo(() => {
    if (dragState.isDragging) return getCursorForMode('edit')
    if (hoveredMeshId) return 'pointer'
    return getCursorForMode('default')
  }, [dragState.isDragging, hoveredMeshId])

  // --- Plugin overlays ---
  const overlayPlugins = plugins.filter((p) => p.Overlay)

  return (
    <div className="absolute inset-0" role="application" aria-label="Interactive 3D map">
      <div role="status" aria-live="polite" className="sr-only">
        {selectedMeshId
          ? `Building ${selectedMeshId.slice(0, 8)} selected. Press Escape to deselect, R to reset transforms.`
          : 'No building selected. Click a building to select it.'}
      </div>

      <DeckGL
        ref={deckRef}
        effects={effects}
        viewState={effectiveViewState}
        onViewStateChange={({ viewState: vs, interactionState }) => {
          const { latitude, longitude, zoom, pitch, bearing } = vs as ViewState
          setViewState({ latitude, longitude, zoom, pitch, bearing })

          // Clear `pendingFlyTo` once deck.gl reports the transition is
          // done. Using a falling-edge detector (prev=true → now=false)
          // avoids clearing before the animation even starts, which would
          // cancel the flight.
          const inTransition = interactionState?.inTransition === true
          if (wasInTransitionRef.current && !inTransition) {
            if (useMapStore.getState().pendingFlyTo) {
              clearPendingFlyTo()
            }
          }
          wasInTransitionRef.current = inTransition
        }}
        onClick={handleClick}
        onHover={handleHover}
        onDragStart={handleDragStart}
        onDrag={handleDragMove}
        onDragEnd={handleDragEnd}
        layers={allLayers}
        controller={{
          dragPan: !dragState.isDragging,
          // Merge caller-supplied override fields (e.g. `doubleClickZoom`
          // set by the map route while area-mode polygon drawing is
          // active) into the default controller config.
          ...(controllerOverride ?? {}),
        }}
        getCursor={() => mapCursor}
        style={{ width: '100%', height: '100%' }}
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/city-intelligence-lab/clx1l60ye01oj01qrbsj106mw"
          onLoad={handleMapLoad}
          // Mapbox has its own double-click handler that fires
          // independently of DeckGL's controller. Mirror the
          // `doubleClickZoom` override onto `<Map>` so the polygon
          // terminator double-click cannot zoom the base map either.
          doubleClickZoom={controllerOverride?.doubleClickZoom}
        >
          {mapChildren}
        </Map>
      </DeckGL>

      {/* Plugin overlays (e.g., building tooltip) */}
      {overlayPlugins.map((p) => {
        const OverlayComponent = p.Overlay!
        return <OverlayComponent key={p.id} context={context} deckRef={deckRef} />
      })}

      {/* Location search overlay — owns retrieve/reset handlers and drives
          the deck.gl camera fly-to via the `pendingFlyTo` store action.
          Mounts only when the composition root supplies a places client. */}
      {placesClient && <LocationSearch placesClient={placesClient} />}
    </div>
  )
}
