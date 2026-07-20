// React / framework-coupled exports

export {
  analysisKeys,
  GroundMaterialsUnavailableError,
  groundMaterialsKeys,
  setGroundMaterialsApiClient,
  useCleanGroundMaterials,
  useCollectAndProcessGroundMaterials,
  useCollectGroundMaterials,
  useGroundMaterialRegistry,
} from './ground-materials.api'
export {
  type GroundMaterialsAreaResult,
  type GroundMaterialsSdkClient,
  useGroundMaterialsAreaMutation,
} from './ground-materials.area-api'
export {
  createGroundMaterialsAreaLayer,
  type GroundMaterialsAreaLayerOptions,
} from './ground-materials.area-layer'
export { getMetersToLatLng, setMetersToLatLng } from './ground-materials.config'
export { DrawControl, getDrawInstance, useGroundMaterialsDraw } from './ground-materials.draw-hook'
export type { GroundMaterialsPanelDeps } from './ground-materials.panel-deps'
export {
  type GroundMaterialsAreaStatus,
  getGroundMaterialsInitialState,
  type MaterialLayers,
  type SdkFeatureCollection,
  useGroundMaterialsStore,
} from './ground-materials.store'
export {
  buildAnalysisGroundMaterials,
  buildFallbackWarning,
  DEFAULT_FALLBACK_MATERIAL,
  type PerFeatureMaterialResolution,
  resolvePerFeatureMaterials,
} from './ground-materials.utils'
