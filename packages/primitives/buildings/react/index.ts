// Buildings React integration exports
// These modules depend on React, Zustand, TanStack Query, deck.gl, etc.

export {
  type BuildingsApiClient,
  type BuildingsFetchOptions,
  type BuildingsInAreaData,
  type BuildingsSdkClient,
  buildingKeys,
  isPolygonSafeToFetch,
  stablePolygonKey,
  useBuildingsInArea,
  useBuildingsMutation,
} from './buildings.api'
export {
  type BuildingsGeometrySnapshot,
  useAsyncBuildingsGeometry,
} from './buildings.async-geometry'
export { createGizmoLayers, type GizmoLayerOptions } from './buildings.gizmo-layer'
export {
  type BuildingLayerOptions,
  createBuildingMeshLayers,
  createBuildingsLayer,
} from './buildings.layers'
export { MergedBuildingsLayer, type MergedBuildingsLayerProps } from './buildings.merged-layer'
export {
  type BuildingsStatus,
  getBuildingsInitialState,
  useBuildingsStore,
} from './buildings.store'
export type { BuildingTooltipDeps } from './buildings.tooltip-deps'
