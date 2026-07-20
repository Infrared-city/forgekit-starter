/**
 * Analysis Colors: UTCI Thermal Comfort
 *
 * Color scales for Universal Thermal Climate Index visualization.
 * Colors are sourced from registry.json.
 */

import { rgbToHex } from './helpers'
import { AnalysisVisualization } from './registry'
import type { RGB } from './types'

// Get thermal comfort configurations from registry
const tciViz = new AnalysisVisualization({
  analysisType: 'thermal-comfort-index',
})

/**
 * UTCI thermal stress domain boundaries in Celsius
 */
export const utciDomains = [-40, -27, -13, 0, 9, 26, 32, 38, 46] as const

/**
 * Simplified UTCI comfort domains
 */
export const simplifiedUtciDomains = [9, 18, 26] as const

/**
 * UTCI stress labels
 */
export const utciStressLabels = [
  'extreme cold stress',
  'very strong cold stress',
  'strong cold stress',
  'moderate cold stress',
  'slight cold stress',
  'no thermal stress',
  'moderate heat stress',
  'strong heat stress',
  'very strong heat stress',
  'extreme heat stress',
] as const

/**
 * UTCI stress labels in title case
 */
export const utciStressLabelsTitles = [
  'Extreme Cold Stress',
  'Very Strong Cold Stress',
  'Strong Cold Stress',
  'Moderate Cold Stress',
  'Slight Cold Stress',
  'No Thermal Stress',
  'Moderate Heat Stress',
  'Strong Heat Stress',
  'Very Strong Heat Stress',
  'Extreme Heat Stress',
] as const

/**
 * Simplified UTCI stress labels
 */
export const simplifiedUtciStressLabels = [
  'Uncomfortable <br /><i>out of range</i>',
  'Comfortable <br /><i>9-18ºC</i>',
  'Optimal <br /><i>18-26ºC</i>',
  'Uncomfortable <br /><i>out of range</i>',
] as const

/**
 * Color mapping for each UTCI thermal stress category
 */
export const utciComfortBandsColorMap: Record<string, string> = {
  'extreme cold stress': '#1e1b4b',
  'very strong cold stress': '#1d4ed8',
  'strong cold stress': '#3b82f6',
  'moderate cold stress': '#22d3ee',
  'slight cold stress': '#86efac',
  'no thermal stress': '#bef264',
  'moderate heat stress': '#facc15',
  'strong heat stress': '#f97316',
  'very strong heat stress': '#dc2626',
  'extreme heat stress': '#7f1d1d',
}

/**
 * Category order for consistent rendering
 */
export const utciComfortBandsCategoryOrder = [
  'extreme cold stress',
  'very strong cold stress',
  'strong cold stress',
  'moderate cold stress',
  'slight cold stress',
  'no thermal stress',
  'moderate heat stress',
  'strong heat stress',
  'very strong heat stress',
  'extreme heat stress',
] as const

/**
 * Thermal Comfort Index colors from registry
 */
export const thermalComfortIndexRGB: RGB[] = tciViz.standardColors
export const thermalComfortIndexColors: string[] = thermalComfortIndexRGB.map(rgbToHex)

/**
 * Tailwind-based heatmap color scale for UTCI
 */
export const utciTailwindHeatmapColorScale: [number, string][] = (() => {
  const labels = Object.values(utciComfortBandsColorMap)
  const steps = labels.length
  const scale: [number, string][] = []

  for (let i = 0; i < steps; i++) {
    const start = i / steps
    const end = (i + 1) / steps
    const color = labels[i]
    scale.push([start, color])
    scale.push([end, color])
  }
  return scale
})()

/**
 * Hourly UTCI color scale (cold to hot gradient)
 */
export const utciHourlyColorScale: [number, string][] = [
  [0.0, '#3b82f6'],
  [0.25, '#93c5fd'],
  [0.5, '#ffffff'],
  [0.75, '#fecaca'],
  [1.0, '#dc2626'],
]

/**
 * Simplified UTCI color scale
 */
export const utciColorScaleSimplified: [number, string][] = [
  [0, '#f1f5f9'],
  [0.333, '#bbf7d0'],
  [0.666, '#86efac'],
  [1.0, '#f1f5f9'],
]

/**
 * Get the thermal stress index for a UTCI value
 */
export function getUtciThermalStress(
  utci: number,
  domains: readonly number[] = utciDomains,
): number {
  for (let i = 0; i < domains.length; i++) {
    if (utci < domains[i]) return i
  }
  return domains.length
}

/**
 * Get the thermal stress label for a UTCI value
 */
export function getUtciThermalStressLabel(value: number): string {
  const idx = utciDomains.findIndex((d) => value < d)
  const index = idx === -1 ? utciStressLabels.length - 1 : idx
  return utciStressLabels[index]
}

/**
 * Get the simplified thermal stress index
 */
export function getUtciSimplifiedStress(
  utci: number,
  domains: readonly number[] = simplifiedUtciDomains,
): number {
  for (let i = 0; i < domains.length; i++) {
    if (utci < domains[i]) return i
  }
  return domains.length
}

/**
 * Get the simplified thermal stress label
 */
export function getUtciSimplifiedThermalStressLabel(value: number): string {
  const idx = simplifiedUtciDomains.findIndex((d) => value < d)
  const index = idx === -1 ? simplifiedUtciStressLabels.length - 1 : idx
  return simplifiedUtciStressLabels[index]
}

/**
 * Get the color for a UTCI thermal stress category
 */
export function getUtciColor(label: string): string {
  return utciComfortBandsColorMap[label] || '#gray'
}

/**
 * Get the color for a UTCI value
 */
export function getUtciValueColor(value: number): string {
  const label = getUtciThermalStressLabel(value)
  return getUtciColor(label)
}

/**
 * Time labels for 24-hour display
 */
export const utciStressTimeLabels = [
  '12AM',
  '1AM',
  '2AM',
  '3AM',
  '4AM',
  '5AM',
  '6AM',
  '7AM',
  '8AM',
  '9AM',
  '10AM',
  '11AM',
  '12PM',
  '1PM',
  '2PM',
  '3PM',
  '4PM',
  '5PM',
  '6PM',
  '7PM',
  '8PM',
  '9PM',
  '10PM',
  '11PM',
] as const

/**
 * Get AnalysisVisualization for a TCS variant
 */
export function getTCSVisualization(
  variant: 'heat-stress' | 'cold-stress' | 'thermal-comfort',
  minLegend?: number,
  maxLegend?: number,
): AnalysisVisualization {
  return new AnalysisVisualization({
    analysisType: 'thermal-comfort-statistics',
    variant,
    minLegend,
    maxLegend,
  })
}
