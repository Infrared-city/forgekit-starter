/**
 * Analysis Colors
 *
 * Color scales and utilities for analysis result visualization.
 * Configuration sourced from registry.json.
 */

// Heatmap exports
export {
  createHeatmapScale,
  dayNightColors,
  defaultHeatmapColorScale,
  defaultHeatmapColors,
  defaultHeatmapRGB,
  getHeatmapColor,
  getHeatmapColorHex,
  getHeatmapColorInterpolated,
} from './heatmap'
// Helper exports
export {
  type ColorScale,
  createGradientColorScale,
  createSteppedColorScale,
  extendColors,
  generateMeshColors,
  generateMeshColorsWithAlpha,
  getColorFromScale,
  hexToRgb,
  hslToRgb,
  interpolateRgb,
  linearInterpolation,
  normalizeAnalysisMatrix,
  pwcCategoryToNumber,
  rgbToHex,
} from './helpers'
// Registry class and factory
export {
  AnalysisVisualization,
  createColorScaleFromRegistry,
} from './registry'
// Types
export type {
  AnalysisVisualizationOptions,
  ColorInterpolation,
  LegendBoundHandling,
  LegendType,
  ModelRegistryEntry,
  ModelsRegistry,
  RGB,
  RGBA,
  VisualConfiguration,
  VisualConfigurationsMap,
} from './types'
// UTCI exports
export {
  getTCSVisualization,
  getUtciColor,
  getUtciSimplifiedStress,
  getUtciSimplifiedThermalStressLabel,
  getUtciThermalStress,
  getUtciThermalStressLabel,
  getUtciValueColor,
  simplifiedUtciDomains,
  simplifiedUtciStressLabels,
  thermalComfortIndexColors,
  thermalComfortIndexRGB,
  utciColorScaleSimplified,
  utciComfortBandsCategoryOrder,
  utciComfortBandsColorMap,
  utciDomains,
  utciHourlyColorScale,
  utciStressLabels,
  utciStressLabelsTitles,
  utciStressTimeLabels,
  utciTailwindHeatmapColorScale,
} from './utci'
// Wind exports
export {
  compassDirectionBins,
  compassDirectionLabels,
  getCompassDirection,
  getCompassDirectionBinIndex,
  getPWCVisualization,
  getWindComfortColor,
  getWindSpeedColor,
  getWindSpeedColorForValue,
  normalizeWindSpeed,
  windComfortColorScale,
  windComfortColors,
  windComfortRGB,
  windSpeedColorScale,
  windSpeedColors,
  windSpeedRGB,
} from './wind'
