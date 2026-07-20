export {
  areaFeaturesToCollection,
  filterFeaturesInsidePolygon,
  stablePolygonKey,
} from './vegetation.feature-utils'
export { computeOriginFromPolygon, latLngToMetersLocal } from './vegetation.geo-utils'
export {
  MAX_TREE_COUNT,
  needsFallbackPrompt,
  type ProcessTreesResult,
  parseTreesGeoJson,
  processImportedTrees,
  type TreeFallback,
  type TreeParseError,
  type TreeParseResult,
  type TreeParseSuccess,
} from './vegetation.import-utils'
export {
  type MergedVegetationGeometry,
  mergeVegetationMeshes,
  mergeVegetationMeshesChunked,
} from './vegetation.merge-geometry'
export {
  type FeaturesToDotBimMeshesOptions,
  featuresToDotBimMeshes,
  featuresToDotBimMeshesWithStats,
  type TreeMeshOptions,
} from './vegetation.mesh-builder'
export {
  type AreaVegetation,
  type DotBimMesh,
  ensureTreeFeatureUuids,
  type GeoJsonFeatureCollection,
  type TreesFeatureCollection,
  TreesFeatureCollectionSchema,
} from './vegetation.sdk-types'
export { createTimeSlicer, type TimeSliceOpts, type TimeSlicer } from './vegetation.timeslice'
export { VEGETATION_DEFAULT_COLOR, type Viewport } from './vegetation.types'
