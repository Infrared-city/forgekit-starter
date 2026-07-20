/**
 * Analysis Colors: Helper Utilities
 *
 * Color manipulation and interpolation utilities.
 */

// ============================================
// Type Definitions
// ============================================

export type RGB = [number, number, number]
export type RGBA = [number, number, number, number]
export type ColorScale = [number, string][]

// ============================================
// Color Conversion
// ============================================

/**
 * Convert RGB array to hex string
 */
export function rgbToHex(rgb: RGB): string {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

/**
 * Convert hex string to RGB array
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

// ============================================
// Color Interpolation
// ============================================

/**
 * Linear interpolation between two RGB colors
 */
export function interpolateRgb(color1: RGB, color2: RGB, t: number): RGB {
  const clampedT = Math.max(0, Math.min(1, t))
  return [
    Math.round(color1[0] + clampedT * (color2[0] - color1[0])),
    Math.round(color1[1] + clampedT * (color2[1] - color1[1])),
    Math.round(color1[2] + clampedT * (color2[2] - color1[2])),
  ]
}

/**
 * Linear interpolation across a color palette
 */
export function linearInterpolation(
  value: number,
  minValue: number,
  maxValue: number,
  colors: RGB[],
): RGB {
  if (value >= maxValue) {
    return colors[colors.length - 1]
  }

  if (value <= minValue) {
    return colors[0]
  }

  const numSegments = colors.length - 1
  const segmentWidth = (maxValue - minValue) / numSegments
  let segmentIndex = Math.floor((value - minValue) / segmentWidth)
  segmentIndex = Math.max(0, Math.min(segmentIndex, numSegments - 1))

  const lowerBound = minValue + segmentIndex * segmentWidth
  const upperBound = lowerBound + segmentWidth
  const startColor = colors[segmentIndex]
  const endColor = colors[segmentIndex + 1]

  const t = (value - lowerBound) / (upperBound - lowerBound)

  const interpolated = interpolateRgb(startColor, endColor, t)

  // Clamp to valid range
  return interpolated.map((c) => Math.min(255, Math.max(0, c))) as RGB
}

/**
 * Extend a color palette by interpolating between colors
 */
export function extendColors(colors: RGB[], factor: number): RGB[] {
  const numSegments = colors.length * factor
  const totalSteps = numSegments - 1
  const interpolatedColors: RGB[] = []

  for (let step = 0; step < numSegments; step++) {
    const delta = step / totalSteps
    const scaledIndex = delta * (colors.length - 1)
    const roundedIndex = Math.min(Math.floor(scaledIndex), colors.length - 2)
    const localDelta = scaledIndex - roundedIndex

    const startColor = colors[roundedIndex]
    const endColor = colors[roundedIndex + 1]
    const interpolated = interpolateRgb(startColor, endColor, localDelta)

    interpolatedColors.push(interpolated)
  }

  return interpolatedColors
}

// ============================================
// Color Scale Generation
// ============================================

/**
 * Create a stepped color scale from colors array
 */
export function createSteppedColorScale(colors: string[], steps: number): ColorScale {
  const scale: ColorScale = []
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

/**
 * Create a gradient color scale from colors array
 */
export function createGradientColorScale(colors: string[]): ColorScale {
  return colors.map((color, i) => [i / (colors.length - 1), color])
}

/**
 * Get color from a color scale at a specific value
 */
export function getColorFromScale(scale: ColorScale, value: number): string {
  const clampedValue = Math.max(0, Math.min(1, value))

  for (let i = 0; i < scale.length - 1; i++) {
    if (clampedValue >= scale[i][0] && clampedValue <= scale[i + 1][0]) {
      return scale[i][1]
    }
  }

  return scale[scale.length - 1][1]
}

// ============================================
// Mesh Color Generation
// ============================================

/**
 * Generate vertex colors for mesh based on analysis data
 */
export function generateMeshColors(
  values: number[],
  minValue: number,
  maxValue: number,
  colorPalette: RGB[],
): Float32Array {
  const colors = new Float32Array(values.length * 3)

  for (let i = 0; i < values.length; i++) {
    const normalizedValue = (values[i] - minValue) / (maxValue - minValue)
    const rgb = linearInterpolation(normalizedValue, 0, 1, colorPalette)

    colors[i * 3] = rgb[0] / 255
    colors[i * 3 + 1] = rgb[1] / 255
    colors[i * 3 + 2] = rgb[2] / 255
  }

  return colors
}

/**
 * Generate vertex colors with alpha for mesh
 */
export function generateMeshColorsWithAlpha(
  values: number[],
  minValue: number,
  maxValue: number,
  colorPalette: RGB[],
  alpha: number = 1.0,
): Float32Array {
  const colors = new Float32Array(values.length * 4)

  for (let i = 0; i < values.length; i++) {
    const normalizedValue = (values[i] - minValue) / (maxValue - minValue)
    const rgb = linearInterpolation(normalizedValue, 0, 1, colorPalette)

    colors[i * 4] = rgb[0] / 255
    colors[i * 4 + 1] = rgb[1] / 255
    colors[i * 4 + 2] = rgb[2] / 255
    colors[i * 4 + 3] = alpha
  }

  return colors
}

// ============================================
// Analysis Matrix Normalization
// ============================================

/**
 * Convert PWC Lawson category string to numeric value.
 * Returns null for unknown categories (will be rendered as transparent).
 *
 * Lawson wind comfort categories:
 * - A: Sitting long (most comfortable)
 * - B: Sitting short
 * - C: Standing
 * - D: Walking slow
 * - E: Walking fast
 * - S: Uncomfortable (LDDC criteria)
 * - S15: Uncomfortable - 15% exceedance (2001 criteria)
 * - S20: Uncomfortable - 20% exceedance (most uncomfortable)
 */
export function pwcCategoryToNumber(category: string): number | null {
  switch (category) {
    case 'A':
      return 0
    case 'B':
      return 1
    case 'C':
      return 2
    case 'D':
      return 3
    case 'E':
      return 4
    case 'S':
      return 5
    case 'S15':
      return 5
    case 'S20':
      return 6
    default:
      return null
  }
}

/**
 * Normalize an analysis matrix to numbers.
 * If values are already numbers, returns as-is.
 * If values are strings (e.g., PWC categories), converts using the provided converter.
 * Null/undefined values in the result will be rendered as transparent.
 *
 * @param matrix - The input matrix (can contain numbers, strings, or null)
 * @param converter - Optional function to convert non-numeric values to numbers
 * @returns A matrix of numbers (or null for transparent pixels)
 */
export function normalizeAnalysisMatrix<T>(
  matrix: T[][],
  converter?: (value: T) => number | null,
): (number | null)[][] {
  if (!matrix || matrix.length === 0) return []

  const firstRow = matrix[0]
  if (!firstRow || firstRow.length === 0) return []

  // Check if already numeric by sampling first non-null value
  const firstValue = firstRow[0]
  if (typeof firstValue === 'number') {
    return matrix as unknown as (number | null)[][]
  }

  // Convert using provided converter or return null for non-numbers
  const defaultConverter = (v: T): number | null => {
    if (typeof v === 'number') return v
    if (v === null || v === undefined) return null
    return null
  }

  const convert = converter ?? defaultConverter

  return matrix.map((row) => row.map(convert))
}
