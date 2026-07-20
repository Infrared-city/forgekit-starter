import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface ViewState {
  latitude: number
  longitude: number
  zoom: number
  pitch: number
  bearing: number
}

export interface BuildingsViewport {
  latitude: number
  longitude: number
  width: number
  height: number
}

export interface DragState {
  isDragging: boolean
  dragAxis: 'x' | 'y' | null
  dragStartMeters: { x: number; y: number } | null
  dragDeltaMeters: { x: number; y: number }
  initialTransform: { deltaX: number; deltaY: number } | null
}

/** Target shape accepted by `hydrateLocation` / `flyToLocation`. */
export interface LocationTarget {
  latitude: number
  longitude: number
  zoom: number
}

/**
 * One-shot deck.gl fly-to request. When non-null, `MapCanvas` passes the
 * target into DeckGL's controlled `viewState` prop together with
 * `transitionDuration` + `FlyToInterpolator`, which is how deck.gl animates
 * a controlled camera. Once the transition ends (`interactionState.inTransition`
 * flips false) `MapCanvas` calls `clearPendingFlyTo()` so subsequent camera
 * updates do not accidentally re-trigger the interpolator.
 */
export interface PendingFlyTo {
  latitude: number
  longitude: number
  zoom: number
}

/**
 * Human-readable address captured from the Mapbox SearchBox retrieve feature.
 * Populated by `LocationSearch.handleRetrieve` after a successful pick and
 * cleared by any reset action. Intentionally kept as a flat struct of
 * primitives + nullable strings so that downstream selectors can shallow
 * compare identity without walking nested objects.
 *
 */
export interface PickedAddress {
  formatted: string
  name: string | null
  placeName: string | null
  /** Google place id when the address came from the Places combobox. Null for
   *  legacy callers (e.g. URL hydration without a fresh pick). */
  placeId?: string | null
  /** Google place types — used by downstream UI to label the pick (city vs
   *  street vs POI). Optional + additive; existing consumers ignore it. */
  types?: string[]
}

interface MapState {
  selectedMeshId: string | null
  hoveredMeshId: string | null
  draftPosition: { lng: number; lat: number } | null
  dragState: DragState

  // The viewport used for building fetches (intentionally throttled).
  buildingsViewport: BuildingsViewport

  layers: {
    buildings: boolean
    analysis: boolean
    markers: boolean
    groundMaterials: boolean
    groundMaterialsDisplay: boolean
    vegetation: boolean
  }

  viewState: ViewState

  /**
   * True once the user has chosen a location (or we hydrated one from URL).
   * Drives route-level gating so plugin-producing hooks
   * (`useMapPlugins` / `useViewportSync`) are only mounted after a pick,
   * and guards `beforeLoad` against re-running hydration mid-flyTo.
   */
  hasUserChosenLocation: boolean

  /**
   * One-shot fly-to request consumed by `MapCanvas`. Non-null while a
   * deck.gl camera transition is in flight; cleared on `interactionState.inTransition`
   * falling edge. See the `PendingFlyTo` docstring for the full contract.
   */
  pendingFlyTo: PendingFlyTo | null

  /**
   * Address captured from the last successful Mapbox SearchBox retrieve.
   * Non-persisted in the store — see `PickedAddress`. `null` at world view
   * and after any reset. Used by the fn-52 workflow panel to show the
   * resolved place name alongside the weather station selector.
   */
  pickedAddress: PickedAddress | null

  selectMesh: (id: string | null) => void
  setHoveredMesh: (id: string | null) => void
  setDraftPosition: (pos: { lng: number; lat: number } | null) => void
  toggleLayer: (layer: keyof MapState['layers']) => void
  setLayer: (layer: keyof MapState['layers'], value: boolean) => void
  setViewState: (viewState: Partial<ViewState>) => void
  setBuildingsViewport: (viewport: BuildingsViewport) => void
  startDrag: (
    axis: 'x' | 'y',
    startPos: { x: number; y: number },
    initialTransform: { deltaX: number; deltaY: number },
  ) => void
  updateDrag: (currentPos: { x: number; y: number }) => void
  endDrag: () => void
  /**
   * Synchronous snap used by URL hydration. Merges the target
   * into `viewState` (preserves current pitch/bearing), updates
   * `buildingsViewport.latitude/longitude`, and sets `hasUserChosenLocation`
   * to true. Safe to call outside React via `useMapStore.getState()`.
   */
  hydrateLocation: (target: LocationTarget) => void
  /**
   * Kick off an animated deck.gl fly-to to a picked location. Sets
   * `hasUserChosenLocation=true`, pre-seeds `buildingsViewport.lat/lng` with
   * the target, and stores `pendingFlyTo` for `MapCanvas` to consume on the
   * next render. Intentionally does NOT write `viewState` — the animation
   * streams through `DeckGL.onViewStateChange` and `viewState` converges on
   * the target naturally.
   */
  flyToLocation: (target: LocationTarget) => void
  /**
   * Revert `viewState`, `buildingsViewport.latitude/longitude`, and the flag
   * back to world defaults regardless of previous state. Snaps `viewState`
   * synchronously — use only when no in-flight animation needs to remain
   * visible (e.g. SSR hydration / programmatic reset).
   */
  resetToWorldView: () => void
  /**
   * Animated reset to world view. Mirrors `flyToLocation` but targets the
   * hardcoded world defaults and flips `hasUserChosenLocation=false`.
   * Stores `pendingFlyTo` for `MapCanvas` and snaps `buildingsViewport`
   * without touching `viewState`.
   */
  flyToWorldView: () => void
  /** Clear `pendingFlyTo`. Called by `MapCanvas` when `interactionState.inTransition` flips false. */
  clearPendingFlyTo: () => void
  /**
   * Set (or clear, by passing `null`) the address captured from the last
   * Mapbox SearchBox retrieve.
   */
  setPickedAddress: (address: PickedAddress | null) => void
  /** Reset transient session state (selection, hover, drag, layers). Preserves viewState, buildingsViewport. Also clears `hasUserChosenLocation` and `pickedAddress`. */
  resetSession: () => void
}

// World-view defaults: boot with a zoomed-out "whole world" view so the user
// is prompted to search before any plugin hooks mount.
const DEFAULT_LAT = 20
const DEFAULT_LNG = 0
const DEFAULT_ZOOM = 1.5
const DEFAULT_PITCH = 0
const DEFAULT_BEARING = 0
const DEFAULT_AREA = { width: 512, height: 512 }

// Initial state for store reset and testing
const initialState = {
  selectedMeshId: null as string | null,
  hoveredMeshId: null as string | null,
  draftPosition: null as { lng: number; lat: number } | null,
  dragState: {
    isDragging: false,
    dragAxis: null as 'x' | 'y' | null,
    dragStartMeters: null as { x: number; y: number } | null,
    dragDeltaMeters: { x: 0, y: 0 },
    initialTransform: null as { deltaX: number; deltaY: number } | null,
  },
  layers: {
    buildings: true,
    analysis: true,
    markers: true,
    groundMaterials: false,
    groundMaterialsDisplay: true,
    vegetation: true,
  },
  viewState: {
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    zoom: DEFAULT_ZOOM,
    pitch: DEFAULT_PITCH,
    bearing: DEFAULT_BEARING,
  },
  buildingsViewport: {
    // Stored as CENTER of the 512m x 512m query window (matches Infrared API expectation).
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    width: DEFAULT_AREA.width,
    height: DEFAULT_AREA.height,
  },
  hasUserChosenLocation: false,
  pendingFlyTo: null as PendingFlyTo | null,
  pickedAddress: null as PickedAddress | null,
}

/**
 * Map store with subscribeWithSelector middleware for fine-grained subscriptions.
 *
 * Cross-domain subscription example:
 * ```typescript
 * // Subscribe only to selectedMeshId changes (won't fire for other state changes)
 * useEffect(() => {
 *   const unsubscribe = useMapStore.subscribe(
 *     (state) => state.selectedMeshId,
 *     (selectedMeshId) => console.log('Selection changed:', selectedMeshId)
 *   )
 *   return unsubscribe
 * }, [])
 * ```
 */
export const useMapStore = create<MapState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    selectMesh: (id) => set({ selectedMeshId: id }),
    setHoveredMesh: (id) => set({ hoveredMeshId: id }),
    setDraftPosition: (pos) => set({ draftPosition: pos }),
    toggleLayer: (layer) =>
      set((state) => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] },
      })),
    setLayer: (layer, value) =>
      set((state) => ({
        layers: { ...state.layers, [layer]: value },
      })),
    setViewState: (viewState) =>
      set((state) => ({
        viewState: { ...state.viewState, ...viewState },
      })),
    setBuildingsViewport: (viewport) => set({ buildingsViewport: viewport }),
    startDrag: (axis, startPos, initialTransform) =>
      set({
        dragState: {
          isDragging: true,
          dragAxis: axis,
          dragStartMeters: startPos,
          dragDeltaMeters: { x: 0, y: 0 },
          initialTransform,
        },
      }),
    updateDrag: (currentPos) =>
      set((state) => {
        if (!state.dragState.dragStartMeters) return state
        return {
          dragState: {
            ...state.dragState,
            dragDeltaMeters: {
              x: currentPos.x - state.dragState.dragStartMeters.x,
              y: currentPos.y - state.dragState.dragStartMeters.y,
            },
          },
        }
      }),
    endDrag: () =>
      set({
        dragState: {
          isDragging: false,
          dragAxis: null,
          dragStartMeters: null,
          dragDeltaMeters: { x: 0, y: 0 },
          initialTransform: null,
        },
      }),
    hydrateLocation: ({ latitude, longitude, zoom }) =>
      set((state) => ({
        viewState: {
          ...state.viewState,
          latitude,
          longitude,
          zoom,
        },
        buildingsViewport: {
          ...state.buildingsViewport,
          latitude,
          longitude,
        },
        hasUserChosenLocation: true,
      })),
    flyToLocation: ({ latitude, longitude, zoom }) =>
      set((state) => ({
        // viewState is intentionally left alone. DeckGL will animate from
        // the current viewState to `pendingFlyTo` (merged into the
        // controlled `viewState` prop by `MapCanvas`) and each interpolated
        // frame will stream back through `onViewStateChange`.
        pendingFlyTo: { latitude, longitude, zoom },
        buildingsViewport: {
          ...state.buildingsViewport,
          latitude,
          longitude,
        },
        hasUserChosenLocation: true,
      })),
    resetToWorldView: () =>
      set((state) => ({
        viewState: {
          ...state.viewState,
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          zoom: DEFAULT_ZOOM,
          pitch: DEFAULT_PITCH,
          bearing: DEFAULT_BEARING,
        },
        buildingsViewport: {
          ...state.buildingsViewport,
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
        },
        hasUserChosenLocation: false,
        pendingFlyTo: null,
        pickedAddress: null,
      })),
    flyToWorldView: () =>
      set((state) => ({
        // Same pattern as flyToLocation but with world-view coordinates.
        pendingFlyTo: {
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          zoom: DEFAULT_ZOOM,
        },
        buildingsViewport: {
          ...state.buildingsViewport,
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
        },
        hasUserChosenLocation: false,
        pickedAddress: null,
      })),
    clearPendingFlyTo: () => set({ pendingFlyTo: null }),
    setPickedAddress: (address) => set({ pickedAddress: address }),
    resetSession: () =>
      set({
        selectedMeshId: initialState.selectedMeshId,
        hoveredMeshId: initialState.hoveredMeshId,
        draftPosition: initialState.draftPosition,
        dragState: { ...initialState.dragState },
        layers: { ...initialState.layers },
        hasUserChosenLocation: initialState.hasUserChosenLocation,
        pickedAddress: initialState.pickedAddress,
      }),
  })),
)

// Export for testing - allows resetting store to initial state
export const getMapInitialState = () => ({ ...initialState })
