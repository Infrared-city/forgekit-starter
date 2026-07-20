/**
 * Analysis Colors: Heatmap Scales
 *
 * Color scales for general analysis visualization.
 * Colors are sourced from registry.json.
 */

import { linearInterpolation, rgbToHex } from './helpers'
import { AnalysisVisualization } from './registry'
import type { RGB } from './types'

// Get solar-radiation config as default heatmap (has a good general-purpose palette)
const defaultViz = new AnalysisVisualization({
  analysisType: 'solar-radiation',
})

/**
 * Default heatmap RGB colors (from registry solar-radiation config)
 */
export const defaultHeatmapRGB: RGB[] = defaultViz.standardColors

/**
 * Default heatmap hex colors
 */
export const defaultHeatmapColors: string[] = defaultHeatmapRGB.map(rgbToHex)

/**
 * 10-step default heatmap color scale for Plotly
 */
export const defaultHeatmapColorScale: [number, string][] = (() => {
  const scale: [number, string][] = []
  const colors = defaultHeatmapColors
  const steps = colors.length

  for (let i = 0; i < steps; i++) {
    const start = i / steps
    const end = (i + 1) / steps
    scale.push([start, colors[i]])
    scale.push([end, colors[i]])
  }
  return scale
})()

/**
 * Day/Night colors for time-based visualizations
 */
export const dayNightColors = {
  Day: '#f1c40f', // Gold
  Night: '#2c3e50', // Dark slate
} as const

/**
 * Get heatmap color for a normalized value (0-1)
 */
export function getHeatmapColor(value: number): string {
  const clampedValue = Math.max(0, Math.min(1, value))
  const index = Math.floor(clampedValue * (defaultHeatmapColors.length - 1))
  return defaultHeatmapColors[index]
}

/**
 * Get heatmap color with linear interpolation
 */
export function getHeatmapColorInterpolated(value: number): string {
  const rgb = linearInterpolation(value, 0, 1, defaultHeatmapRGB)
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

/**
 * Get heatmap color as hex with interpolation
 */
export function getHeatmapColorHex(value: number): string {
  const rgb = linearInterpolation(value, 0, 1, defaultHeatmapRGB)
  return rgbToHex(rgb)
}

/**
 * Create a custom heatmap color scale
 */
export function createHeatmapScale(colors: string[], steps: number = 10): [number, string][] {
  const scale: [number, string][] = []
  const colorCount = colors.length

  for (let i = 0; i < steps; i++) {
    const colorIndex = Math.floor((i / steps) * colorCount)
    const start = i / steps
    const end = (i + 1) / steps
    scale.push([start, colors[colorIndex]])
    scale.push([end, colors[colorIndex]])
  }

  return scale
}
