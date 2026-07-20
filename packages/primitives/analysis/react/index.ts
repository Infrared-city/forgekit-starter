// React / framework-coupled exports for @forge-kit/analysis

export { useAreaBitmapLayer } from './analysis.area-bitmap-hook'
export {
  type AreaBitmapLayerOptions,
  createAreaBitmapLayer,
  sampleAreaResultAt,
} from './analysis.area-bitmap-layer'
export {
  type AreaPreviewData,
  type AreaPreviewQueryResult,
  createUseAreaPreview,
} from './analysis.area-preview-api'
export {
  AREA_RUN_TIMEOUT_MS,
  buildSdkInput,
  computeGridBounds,
  computeLegendBounds,
  createUseRunArea,
  GROUND_MATERIALS_ANALYSIS_TYPES,
  gridToNestedList,
  polygonCentroid,
  type RunAreaInput,
  type UseRunAreaResult,
  VEGETATION_ANALYSIS_TYPES,
  WEATHER_REQUIRED_TYPES,
} from './analysis.area-run-api'
export type { AreaAnalysisTabDeps } from './analysis.area-tab-deps'
export { imageDataToCanvas, matrixToImageData } from './analysis.grid-layer'
export { type AnalysisInvalidationDeps, setupAnalysisInvalidation } from './analysis.invalidation'
export {
  type MergeStrategyOpts,
  resolveMergeStrategy,
} from './analysis.merge-strategy'
export {
  type AnalysisDateFilters,
  type AreaRunResult,
  DEFAULT_DATE_FILTERS,
  getAnalysisInitialState,
  type PrebuiltAreaBitmap,
  useAnalysisStore,
} from './analysis.store'
export {
  type AnalysisApiClient,
  createWeatherHooks,
  type FullWeatherData,
  type WeatherSdkClient,
  weatherKeys,
} from './analysis.weather-api'
