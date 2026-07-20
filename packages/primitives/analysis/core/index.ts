// ABOUTME: Exposes framework-agnostic analysis computation and sampling primitives.
// ABOUTME: Keeps React, Zustand, and TanStack Query outside the core package surface.

// Analysis core — framework-agnostic exports
// No React, Zustand, or TanStack Query imports allowed in this directory.

export {
  type ColorScaleFn,
  type ColorScaleOptions,
  colorScaleVariantFor,
  createColorScaleForAnalysis,
  createHeatmapColorScale,
  createRegistryColorScale,
  createUtciColorScale,
  createWindColorScale,
  getColorFromPalette,
} from './analysis.color-scales'
export { buildAnalysisColorAttribute, type SimpleMeshFormatWithColors } from './analysis.colors'
export {
  ANALYSIS_TYPE_LABELS,
  ANALYSIS_TYPE_OPTIONS,
  PWC_CRITERIA_LABELS,
  PWC_CRITERIA_OPTIONS,
  TCS_SUBTYPE_LABELS,
  TCS_SUBTYPE_OPTIONS,
} from './analysis.constants'
export {
  type SplittableDateFilters,
  splitDateFiltersForFetch,
} from './analysis.date-filters'
export { flatGridToRgba, scanFlatGridDomain } from './analysis.grid-colorize'
export { ANALYSIS_ICONS, getAnalysisIcon } from './analysis.icons'
export {
  AnalysesName,
  type PwcCriteria,
  type ThermalComfortStatisticsSubType,
  TILING_SUPPORTED_TYPES,
} from './analysis.sdk-types'
export type {
  AnalysisConfig,
  AnalysisViewport,
  AreaRunResult,
  ColorScaleFn as AnalysisColorScaleFn,
  PrebuiltAreaBitmap,
} from './analysis.types'
export {
  type AlignedNumericGrid,
  alignNumericGrid,
  buildDifferenceGrid,
  type DifferenceGrid,
  MIN_DIFFERENCE_GRID_COVERAGE,
  type NumericResultGrid,
} from './grid-alignment'
export {
  findGridCorridorNetwork,
  type GridCorridorNetwork,
  type GridCorridorNetworkEdge,
  type GridCorridorNetworkResult,
  type GridCorridorTerminal,
} from './grid-corridor-network'
export {
  DEFAULT_CORRIDOR_MAX_EXPANDED,
  DEFAULT_SINGLE_CORRIDOR_MAX_EXPANDED,
  findGridCorridor,
  type GridCorridor,
  type GridCorridorCell,
  type GridCorridorEndpoint,
  type GridCorridorOptions,
  type GridCorridorPreference,
  type GridCorridorResult,
} from './grid-corridors'
export {
  computeFilterMask,
  type FilterMask,
  type HighlightOp,
  type HighlightPredicate,
  type ResolvedHighlight,
  resolveHighlight,
} from './grid-filter'
export {
  centroidToLonLat,
  componentToPolygon,
  connectedComponents,
  largestComponent,
  type MaskComponent,
  type RegionPolygon,
  ringIsSimple,
  simplifyRing,
} from './grid-mask-polygon'
export { type NearestFiniteCell, nearestFiniteCell } from './grid-nearest'
export {
  MAX_SEVERITY_METRICS,
  type RankSeverityHotspotsOptions,
  type RankSeverityHotspotsResult,
  rankSeverityHotspots,
  type SeverityCombineMode,
  type SeverityDirection,
  type SeverityHotspotsResult,
  type SeverityMetricInput,
  type SeverityMetricSummary,
  type SeverityRegion,
  type SeverityRegionMetricStats,
} from './grid-severity'
export {
  type NumericPathProfile,
  type PathSamplePoint,
  type PathSamplingOptions,
  pathLengthM,
  sampleNumericPath,
} from './path-sampling'
export { pointInPolygon, polygonBbox, polygonCentroid } from './polygon-mask'
export {
  buildHistogram,
  EMPTY_NUMERIC_SAMPLE,
  HIST_BINS,
  haversineM,
  quantile,
  summariseCategorical,
  summariseNumeric,
} from './sample-stats'
export type {
  CategoricalSampleResult,
  SampleGeometry,
  SampleResult,
  SampleStats,
} from './sampling'
export {
  SAMPLE_RADIUS_M,
  sampleGrid,
  sampleRegionPolygon,
  sampleRegionRadius,
  sampleWholeGrid,
} from './sampling'
export {
  type FindResultRegionsOptions,
  type FindResultRegionsResult,
  findCombinedResultRegions,
  findResultRegions,
  type RegionCombineMode,
  type RegionRankBy,
  type ResultRegion,
  type ResultRegionConditionInput,
  type ResultRegionConditionStats,
  type ResultRegionConditionSummary,
  type ResultRegionQuery,
  type ResultRegionStats,
} from './spatial-regions'
