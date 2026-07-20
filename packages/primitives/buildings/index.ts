// @forge-kit/buildings -- Buildings primitive package
// Re-exports core (framework-agnostic) + react (framework-coupled) + plugin

// Core exports
export {
  applyTransform,
  type BuildingTransform,
  bufferGeometryToSimpleMesh,
  clearMeshCache,
  computeMeshCentroid,
  computeMeshOrientation,
  computeOriginFromPolygon,
  computeOriginFromViewport,
  type DotBimMesh,
  dotBimToSimpleMesh,
  getBufferGeometryFromDotBimMesh,
  getDotBimMeshFromBufferGeometry,
  getMeshCacheStats,
  type MergedGeometry,
  type MeshCacheStats,
  mergeBuildings,
  rotateMesh,
  type SimpleMeshFormat,
  translateMesh,
  type Viewport,
} from './core'
// Plugin factory + hook
export {
  type BuildingsDeps,
  type BuildingsPluginData,
  createBuildingsPlugin,
  useBuildingsMapPlugin,
} from './plugin'
// React exports
export {
  type BuildingLayerOptions,
  type BuildingsApiClient,
  type BuildingsFetchOptions,
  type BuildingsGeometrySnapshot,
  type BuildingsInAreaData,
  type BuildingsSdkClient,
  buildingKeys,
  createBuildingMeshLayers,
  createBuildingsLayer,
  createGizmoLayers,
  type GizmoLayerOptions,
  getBuildingsInitialState,
  isPolygonSafeToFetch,
  MergedBuildingsLayer,
  type MergedBuildingsLayerProps,
  stablePolygonKey,
  useAsyncBuildingsGeometry,
  useBuildingsInArea,
  useBuildingsMutation,
  useBuildingsStore,
} from './react'
