/**
 * Analysis Colors: Wind Visualization
 *
 * Color scales for wind speed and wind comfort analysis.
 * Colors are sourced from registry.json.
 */

import { rgbToHex } from './helpers'
import { AnalysisVisualization } from './registry'
import type { RGB } from './types'

// Get wind configurations from registry
const windSpeedViz = new AnalysisVisualization({ analysisType: 'wind-speed' })
const windComfortViz = new AnalysisVisualization({
  analysisType: 'wind-comfort',
})

/**
 * Wind speed RGB colors (from registry)
 */
export const windSpeedRGB: RGB[] = windSpeedViz.standardColors

/**
 * Wind speed hex colors
 */
export const windSpeedColors: string[] = windSpeedRGB.map(rgbToHex)

/**
 * Wind speed color scale for Plotly
 */
export const windSpeedColorScale: [number, string][] = windSpeedColors.map((color, i) => [
  i / (windSpeedColors.length - 1),
  color,
])

/**
 * Wind comfort RGB colors (from registry)
 */
export const windComfortRGB: RGB[] = windComfortViz.standardColors

/**
 * Wind comfort hex colors
 */
export const windComfortColors: string[] = windComfortRGB.map(rgbToHex)

/**
 * Wind comfort color scale for Plotly
 */
export const windComfortColorScale: [number, string][] = windComfortColors.map((color, i) => [
  i / (windComfortColors.length - 1),
  color,
])

/**
 * Compass direction bins in degrees (22.5° intervals)
 */
export const compassDirectionBins = [
  0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5,
] as const

/**
 * Compass direction labels
 */
export const compassDirectionLabels = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const

/**
 * Get wind speed color for a normalized value (0-1)
 */
export function getWindSpeedColor(value: number): string {
  const clampedValue = Math.max(0, Math.min(1, value))
  const index = Math.floor(clampedValue * (windSpeedColors.length - 1))
  return windSpeedColors[index]
}

/**
 * Get wind comfort color for a normalized value (0-1)
 */
export function getWindComfortColor(value: number): string {
  const clampedValue = Math.max(0, Math.min(1, value))
  const index = Math.floor(clampedValue * (windComfortColors.length - 1))
  return windComfortColors[index]
}

/**
 * Get compass direction label for an angle in degrees
 */
export function getCompassDirection(angle: number): string {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const index = Math.round(normalizedAngle / 22.5) % 16
  return compassDirectionLabels[index]
}

/**
 * Get compass direction bin index for an angle
 */
export function getCompassDirectionBinIndex(angle: number): number {
  const normalizedAngle = ((angle % 360) + 360) % 360
  return Math.round(normalizedAngle / 22.5) % 16
}

/**
 * Convert wind speed to normalized value
 */
export function normalizeWindSpeed(
  speed: number,
  maxSpeed: number = 15, // From registry wind-speed steps
): number {
  return Math.max(0, Math.min(1, speed / maxSpeed))
}

/**
 * Get wind speed color for actual speed value
 */
export function getWindSpeedColorForValue(speed: number, maxSpeed: number = 15): string {
  const normalized = normalizeWindSpeed(speed, maxSpeed)
  return getWindSpeedColor(normalized)
}

/**
 * Get AnalysisVisualization for a PWC variant
 */
export function getPWCVisualization(variant: string): AnalysisVisualization {
  return new AnalysisVisualization({
    analysisType: 'pedestrian-wind-comfort',
    variant,
  })
}
