// @forge-kit/analysis -- Analysis primitive package
// Re-exports core (framework-agnostic) + react (framework-coupled) + plugin
//
// The public surface is area-tiled analysis + color scales + constants/icons.

// Core exports
export {
  ANALYSIS_ICONS,
  ANALYSIS_TYPE_LABELS,
  ANALYSIS_TYPE_OPTIONS,
  AnalysesName,
  type AnalysisColorScaleFn,
  type AnalysisConfig,
  type AnalysisViewport,
  buildAnalysisColorAttribute,
  type ColorScaleFn,
  type ColorScaleOptions,
  createColorScaleForAnalysis,
  createHeatmapColorScale,
  createRegistryColorScale,
  createUtciColorScale,
  createWindColorScale,
  getAnalysisIcon,
  getColorFromPalette,
  PWC_CRITERIA_LABELS,
  PWC_CRITERIA_OPTIONS,
  type PwcCriteria,
  type SimpleMeshFormatWithColors,
  type SplittableDateFilters,
  splitDateFiltersForFetch,
  TCS_SUBTYPE_LABELS,
  TCS_SUBTYPE_OPTIONS,
  type ThermalComfortStatisticsSubType,
  TILING_SUPPORTED_TYPES,
} from './core'

// Plugin factory + hook
export {
  type AnalysisDeps,
  type AnalysisUIConfig,
  createAnalysisPlugin,
  type UseAnalysisMapPluginResult,
  useAnalysisMapPlugin,
} from './plugin'

// React exports
export {
  type AnalysisApiClient,
  type AnalysisDateFilters,
  type AnalysisInvalidationDeps,
  AREA_RUN_TIMEOUT_MS,
  type AreaAnalysisTabDeps,
  type AreaBitmapLayerOptions,
  type AreaPreviewData,
  type AreaPreviewQueryResult,
  type AreaRunResult,
  buildSdkInput,
  computeGridBounds,
  computeLegendBounds,
  createAreaBitmapLayer,
  createUseAreaPreview,
  createUseRunArea,
  createWeatherHooks,
  type FullWeatherData,
  GROUND_MATERIALS_ANALYSIS_TYPES,
  getAnalysisInitialState,
  gridToNestedList,
  imageDataToCanvas,
  type MergeStrategyOpts,
  matrixToImageData,
  type PrebuiltAreaBitmap,
  polygonCentroid,
  type RunAreaInput,
  resolveMergeStrategy,
  sampleAreaResultAt,
  setupAnalysisInvalidation,
  type UseRunAreaResult,
  useAnalysisStore,
  useAreaBitmapLayer,
  VEGETATION_ANALYSIS_TYPES,
  WEATHER_REQUIRED_TYPES,
  type WeatherSdkClient,
  weatherKeys,
} from './react'
