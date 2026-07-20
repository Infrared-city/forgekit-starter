// @forge-kit/indoor-analysis -- Indoor analysis primitive package
// Re-exports core (framework-agnostic) + react (framework-coupled) + plugin

// Core exports
export {
  type AnalysisState,
  type AnalysisStep,
  type ConfirmResponse,
  formatIfcTypeName,
  type HeatmapPoint,
  type HeatmapPointData,
  INDOOR_ANALYSIS_TIMEOUT,
  type IndoorAnalysisType,
  ifcGlobalIdToUuid,
  type PresignResponse,
  type SpatialTreeNode,
  SUPPORTED_INDOOR_ANALYSES,
} from './core'

// Plugin factory + deps
export { createIndoorAnalysisPlugin, type IndoorAnalysisDeps } from './plugin'

// React exports
export {
  configureIndoorAnalysisApi,
  confirmUpload,
  getIndoorAnalysisInitialState,
  HeatmapOverlay,
  presignUpload,
  type RunDaylightFactorInput,
  type RunIndoorAnalysisParams,
  runIndoorAnalysis,
  uploadToS3,
  useAnalysisStore,
  useHeatmapOverlay,
  useRunDaylightFactor,
} from './react'
