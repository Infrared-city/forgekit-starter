// Ground-materials core -- framework-agnostic exports
// No React, Zustand, or TanStack Query imports allowed in this directory.

export {
  clipAreaLayersToPolygon,
  clipAreaLayersToPolygonChunked,
} from './ground-materials.area-clip'
export {
  normalizeAreaPolygonCoordinates,
  normalizeRingPolygon,
  type RingPolygon,
} from './ground-materials.area-geometry'
export {
  type LooseFeatureCollection,
  type LooseMaterialLayers,
  normalizeSdkAreaLayers,
} from './ground-materials.area-normalize'
export { type GroundMaterialColorMode, pastelizeGroundColor } from './ground-materials.colors'
export {
  darkenColor,
  generateDrawStyles,
  loadMaterialPatterns,
  rgbToHex,
  setDrawLayerVisibility,
} from './ground-materials.draw-styles'
export {
  MAX_POLYGON_COUNT,
  type PipelineCounts,
  type PipelineResult,
  runImportPipeline,
} from './ground-materials.import-pipeline'
export type {
  ParseError,
  ParseResult,
  ParseSuccess,
  ProcessResult,
} from './ground-materials.import-utils'
export {
  buildBoundaryPolygon,
  detectNonWgs84,
  parseGeoJsonFile,
  processImportedFeatures,
} from './ground-materials.import-utils'
export type {
  GroupStats,
  MultiMaterialProcessResult,
} from './ground-materials.multi-import'
export { processMultiMaterialImport } from './ground-materials.multi-import'
export {
  ANALYSIS_ABOVE_SURFACES_M,
  analysisAboveSurfacesZ,
  DEFAULT_RENDER_Z,
  groundMaterialRenderZ,
  MATERIAL_RENDER_Z,
  RENDER_Z_STEP_M,
  SIM_RENDER_HIERARCHY,
  TOP_SURFACE_RENDER_Z,
} from './ground-materials.render-z'
export type { CollectParamsInput, MultiMaterialImport } from './ground-materials.sdk-types'
// SDK types, schemas, constants, and utilities (inlined from @infrared/sdk/ground-materials)
export {
  buildGroundMaterialBody,
  CleanBodySchema,
  CleanResponseSchema,
  CollectParamsSchema,
  CollectResponseSchema,
  ensureFeatureUuids,
  FeatureCollectionSchema,
  filterPolygonFeatures,
  GROUND_MATERIAL_LIST,
  GROUND_MATERIAL_NAME_LIST,
  GROUND_MATERIAL_ORDER,
  GROUND_MATERIAL_REGISTRY,
  GroundMaterialRegistryElementSchema,
  GroundMaterialRegistrySchema,
  MultiMaterialImportSchema,
  mapNamesToUuids,
  mapUuidsToNames,
  regroupCleanResults,
  sortGroundMaterialsFeatures,
} from './ground-materials.sdk-types'
export type {
  CleanBody,
  CleanResponse,
  CollectParams,
  CollectResponse,
  DrawEventState,
  DrawModes,
  FeatureCollection,
  GroundMaterialNameType,
  GroundMaterialRegistry,
  GroundMaterialRegistryElement,
  GroundMaterialsViewport,
  GroundMaterialType,
  ImportPreviewState,
  MetersToLatLngFn,
} from './ground-materials.types'
