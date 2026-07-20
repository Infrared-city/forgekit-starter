// ---- Components ----

export { CoordinateDisplay, useCoordinateTracker } from './components/CoordinateDisplay'
export { LayerControls } from './components/LayerControls'
export { LocationSearch } from './components/LocationSearch'
export type { MapCanvasProps, MapControllerOverride } from './components/MapCanvas'
export { MapCanvas } from './components/MapCanvas'
export { MapCanvasWithSuspense } from './components/MapCanvas.lazy'
export { MapLoadingSkeleton } from './components/MapLoadingSkeleton'
export { SearchCombobox, type SearchPickedPlace } from './components/SearchCombobox'
// ---- Hooks ----
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
export { usePluginLayers } from './hooks/usePluginLayers'
export { usePointerEvents } from './hooks/usePointerEvents'
export { useViewportSync } from './hooks/useViewportSync'
export type { PlacesClientConfig } from './lib/places.client'
// ---- Places client ----
export { createPlacesClient, PlacesApiError } from './lib/places.client'
export type {
  AutocompleteOptions,
  DetailsOptions,
  LocationBias,
  PlaceDetails,
  PlaceSuggestion,
  PlacesClient,
} from './lib/places.types'
export {
  clearRecents,
  getRecents,
  pushRecent,
  type RecentPlace,
} from './lib/recent-places'
// ---- Geo Utils ----
export {
  computeMeshCentroid,
  computeOriginFromViewport,
  latLngToMeters,
  metersToLatLng,
} from './map.geo-utils'
export type { MapPoint, MarkerLayerOptions } from './map.marker-layer'
// ---- Marker Layer ----
export { createMarkerLayer } from './map.marker-layer'
export type {
  BuildingsViewport,
  DragState,
  LocationTarget,
  PendingFlyTo,
  PickedAddress,
  ViewState,
} from './map.store'
// ---- Store ----
export { getMapInitialState, useMapStore } from './map.store'
// ---- Map Utils ----
export {
  calculateDistance,
  filterPointsByBounds,
  getRectangleVertices,
  getSouthWestFromViewPort,
} from './map.utils'

// ---- Types (re-exported from plugin-contracts for consumer convenience) ----
export type {
  KeyboardShortcut,
  LngLatType,
  MapEvent,
  MapPanelProps,
  MapPlugin,
  MapPluginContext,
  MapViewport,
} from './types'
