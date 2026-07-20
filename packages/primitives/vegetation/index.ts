// @forge-kit/vegetation -- Vegetation primitive package
// Re-exports core (framework-agnostic) + react (framework-coupled) + plugin

// Core exports
export {
  type AreaVegetation,
  areaFeaturesToCollection,
  computeOriginFromPolygon,
  type DotBimMesh,
  type FeaturesToDotBimMeshesOptions,
  featuresToDotBimMeshes,
  featuresToDotBimMeshesWithStats,
  type GeoJsonFeatureCollection,
  MAX_TREE_COUNT,
  type MergedVegetationGeometry,
  mergeVegetationMeshes,
  mergeVegetationMeshesChunked,
  needsFallbackPrompt,
  type ProcessTreesResult,
  parseTreesGeoJson,
  processImportedTrees,
  stablePolygonKey,
  type TreeFallback,
  type TreeMeshOptions,
  type TreeParseError,
  type TreeParseResult,
  type TreeParseSuccess,
  type TreesFeatureCollection,
  TreesFeatureCollectionSchema,
  VEGETATION_DEFAULT_COLOR,
  type Viewport,
} from './core'
// Plugin factory + hook
export {
  createVegetationPlugin,
  type UseVegetationMapPluginResult,
  useVegetationMapPlugin,
  type VegetationDeps,
  type VegetationPluginData,
} from './plugin'
// React exports
export {
  createVegetationLayer,
  getVegetationInitialState,
  isPolygonSafeToFetch,
  useAsyncVegetationGeometry,
  useVegetationMeshesMutation,
  useVegetationStore,
  type VegetationGeometrySnapshot,
  type VegetationLayerOptions,
  type VegetationMeshesResult,
  type VegetationSdkClient,
  type VegetationStatus,
  vegetationKeys,
} from './react'
