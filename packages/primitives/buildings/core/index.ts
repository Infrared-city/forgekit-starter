// Buildings core -- framework-agnostic exports
// No React, Zustand, or TanStack Query imports allowed in this directory.

export { computeMeshCentroid } from './buildings.geo-utils'
export {
  type MergedGeometry,
  mergeBuildings,
  mergeBuildingsChunked,
} from './buildings.merge-geometry'
export type { MeshCacheStats } from './buildings.mesh-cache'
export {
  bufferGeometryToSimpleMesh,
  clearMeshCache,
  computeOriginFromPolygon,
  computeOriginFromViewport,
  dotBimToSimpleMesh,
  filterBuildingsByPolygon,
  filterBuildingsByPolygonChunked,
  getBufferGeometryFromDotBimMesh,
  getDotBimMeshFromBufferGeometry,
  getMeshCacheStats,
  type SimpleMeshFormat,
} from './buildings.mesh-utils'
export { computeMeshOrientation } from './buildings.orientation'
export type { DotBimMesh } from './buildings.sdk-types'
export { createTimeSlicer, type TimeSliceOpts, type TimeSlicer } from './buildings.timeslice'
export {
  applyTransform,
  type BuildingTransform,
  rotateMesh,
  translateMesh,
} from './buildings.transforms'
export type { Viewport } from './buildings.types'
