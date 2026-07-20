/**
 * Analysis Color Scales
 *
 * Factory functions for creating analysis-type-specific color scales
 * using the @infrared/analysis-colors package.
 */

import {
  // Registry-based visualization
  AnalysisVisualization,
  // Heatmap colors
  defaultHeatmapRGB,
  // UTCI colors
  getUtciValueColor,
  hexToRgb,
  linearInterpolation,
  type RGB,
  // Wind colors
  windSpeedRGB,
} from '@infrared/analysis-colors'
import { AnalysesName, type AnalysesName as AnalysesNameType } from './analysis.sdk-types'

/** Color scale function that maps a value to RGBA. Returns transparent for null values. */
export type ColorScaleFn = (value: number | null) => [number, number, number, number]

/** Transparent RGBA value for null/undefined inputs */
const TRANSPARENT: [number, number, number, number] = [0, 0, 0, 0]

/** Options for creating a color scale */
export interface ColorScaleOptions {
  /** Override minimum value (from API response minLegend) */
  minLegend?: number
  /** Override maximum value (from API response maxLegend) */
  maxLegend?: number
  /** Variant for PWC/TCS analysis types */
  variant?: string
}

/** Map analysis type to registry key */
function getRegistryKey(analysisType: AnalysesNameType): string {
  // AnalysesName values are already kebab-case strings that match registry keys
  // Just return the analysis type directly since the SDK uses kebab-case
  return analysisType
}

/**
 * Create a color scale function for the given analysis type.
 * Returns RGBA values as [r, g, b, a] where each component is 0-255.
 *
 * @param analysisType - The analysis type
 * @param options - Optional min/max legend values from API response
 */
export function createColorScaleForAnalysis(
  analysisType: AnalysesNameType,
  options?: ColorScaleOptions,
): ColorScaleFn {
  const { minLegend, maxLegend, variant } = options ?? {}

  // Use registry-based visualization when we have dynamic min/max
  if (minLegend !== undefined || maxLegend !== undefined) {
    return createRegistryColorScale(analysisType, { minLegend, maxLegend, variant })
  }

  // Legacy behavior for analyses without dynamic ranges
  switch (analysisType) {
    case AnalysesName.ThermalComfortIndex:
    case AnalysesName.ThermalComfortStatistics:
      return createUtciColorScale()

    case AnalysesName.WindSpeed:
    case AnalysesName.PedestrianWindComfort:
      return createWindColorScale()
    default:
      return createHeatmapColorScale()
  }
}

/**
 * Create a color scale using the registry-based AnalysisVisualization.
 * This uses minLegend/maxLegend to set the actual data range for proper color mapping.
 */
export function createRegistryColorScale(
  analysisType: AnalysesNameType,
  options: ColorScaleOptions,
): ColorScaleFn {
  const { minLegend, maxLegend, variant } = options
  const registryKey = getRegistryKey(analysisType)

  try {
    const viz = new AnalysisVisualization({
      analysisType: registryKey,
      variant,
      minLegend,
      maxLegend,
    })

    return (value): [number, number, number, number] => {
      if (value === null || value === undefined) return TRANSPARENT
      const rgba = viz.getRGBA(value)
      return rgba
    }
  } catch (error) {
    console.warn(`Failed to create registry color scale for ${analysisType}:`, error)
    // Fallback to heatmap
    return createHeatmapColorScale()
  }
}

/**
 * Default heatmap color scale (blue -> cyan -> green -> yellow -> red)
 * For solar/daylight analyses where values are typically normalized 0-1
 */
export function createHeatmapColorScale(): ColorScaleFn {
  return (value): [number, number, number, number] => {
    if (value === null || value === undefined) return TRANSPARENT
    const rgb = linearInterpolation(value, 0, 1, defaultHeatmapRGB)
    return [rgb[0], rgb[1], rgb[2], 255]
  }
}

/**
 * UTCI thermal comfort color scale
 * Maps UTCI temperature values to comfort band colors
 * Input values should be UTCI temperatures in Celsius (-40 to +46)
 */
export function createUtciColorScale(): ColorScaleFn {
  return (value): [number, number, number, number] => {
    if (value === null || value === undefined) return TRANSPARENT
    // getUtciValueColor expects UTCI temperature in Celsius
    // If value is normalized (0-1), scale to UTCI range (-40 to +46)
    const utciTemp =
      value <= 1 && value >= 0
        ? value * 86 - 40 // Scale 0-1 to -40 to +46
        : value // Already in Celsius

    const hex = getUtciValueColor(utciTemp)
    const rgb = hexToRgb(hex)
    return [rgb[0], rgb[1], rgb[2], 255]
  }
}

/**
 * Wind speed color scale (blue -> green -> orange -> red)
 * For wind analyses where values represent speed or PWC categories (0-6)
 * PWC categories are normalized to 0-1 range for color interpolation
 */
export function createWindColorScale(): ColorScaleFn {
  return (value): [number, number, number, number] => {
    if (value === null || value === undefined) return TRANSPARENT
    // Normalize: PWC categories are 0-6, wind speed could be > 1
    // Map to 0-1 range for color interpolation
    const normalized = value > 1 ? Math.min(1, value / 6) : value
    const rgb = linearInterpolation(normalized, 0, 1, windSpeedRGB)
    return [rgb[0], rgb[1], rgb[2], 255]
  }
}

/**
 * Get RGB color for a value using the specified color palette
 */
export function getColorFromPalette(
  value: number,
  minValue: number,
  maxValue: number,
  palette: RGB[],
): [number, number, number, number] {
  const rgb = linearInterpolation(value, minValue, maxValue, palette)
  return [rgb[0], rgb[1], rgb[2], 255]
}

/**
 * Resolve the color-scale `variant` for an analysis type from the two
 * variant-carrying settings (PWC criteria / TCS subtype). Single source of
 * truth shared by `useAreaBitmapLayer` (main-thread render) and the
 * platform's grid-codec worker (off-thread bitmap build) — the two must
 * agree or a prebuilt bitmap would silently render with the wrong ramp.
 */
export function colorScaleVariantFor(
  analysisType: string,
  opts: { pwcCriteria?: string; tcsSubtype?: string },
): string | undefined {
  if (analysisType === 'pedestrian-wind-comfort') return opts.pwcCriteria
  if (analysisType === 'thermal-comfort-statistics') return opts.tcsSubtype
  return undefined
}
