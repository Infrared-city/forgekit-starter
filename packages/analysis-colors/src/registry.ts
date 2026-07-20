/**
 * Analysis Colors: Registry
 *
 * AnalysisVisualization class transforms registry configurations
 * into render-ready colors and bins for visualization.
 */

import registry from '../registry.json'
import { extendColors, linearInterpolation, rgbToHex } from './helpers'
import type {
  AnalysisVisualizationOptions,
  ModelsRegistry,
  RGB,
  RGBA,
  VisualConfiguration,
} from './types'

// Type assertion for imported JSON
const modelsRegistry = registry as unknown as ModelsRegistry

/**
 * AnalysisVisualization class transforms registry configurations
 * into render-ready colors and bins for visualization.
 */
export class AnalysisVisualization {
  /** Analysis type identifier */
  readonly analysisType: string

  /** Variant name (if applicable) */
  readonly variant?: string

  /** Visual configuration from registry */
  readonly config: VisualConfiguration

  /** Original palette from config */
  readonly standardColors: RGB[]

  /** Extended colors for mesh rendering */
  readonly meshColors: RGB[]

  /** Extended colors for legend display */
  readonly legendColors: RGB[]

  /** Extended colors for chart bars */
  readonly barColors: RGB[]

  /** Hex colors for legend */
  readonly legendColorsHex: string[]

  /** Hex colors for bars */
  readonly barColorsHex: string[]

  /** Value range [min, max] */
  readonly steps: [number, number]

  /** Bin boundaries for mesh coloring */
  readonly meshBins: number[]

  /** Bin boundaries for bars */
  readonly barBins: (number | string)[]

  /** Whether this is a categorical (non-numeric) scale */
  readonly isCategorical: boolean

  constructor(options: AnalysisVisualizationOptions) {
    this.analysisType = options.analysisType
    this.variant = options.variant

    // Get visual configuration from registry
    this.config = this.getVisualConfiguration(options)

    // Check if categorical (string steps)
    this.isCategorical = this.config.steps.some((s) => typeof s === 'string')

    // Store original colors
    this.standardColors = this.config.colors

    // Extend colors based on subdivision factors
    this.meshColors = extendColors(this.standardColors, this.config.resultSubdivisionFactor)
    this.legendColors = extendColors(this.standardColors, this.config.legendSubdivisionFactor)
    this.barColors = extendColors(this.standardColors, this.config.barsSubdivisionFactor)

    // Convert to hex strings
    this.legendColorsHex = this.legendColors.map(rgbToHex)
    this.barColorsHex = this.barColors.map(rgbToHex)

    // Calculate steps (with potential API overrides)
    this.steps = this.calculateSteps(options)

    // Generate bins
    this.meshBins = this.generateBins(this.meshColors.length)
    this.barBins = this.config.steps
  }

  /**
   * Get visual configuration from registry, handling variants
   */
  private getVisualConfiguration(options: AnalysisVisualizationOptions): VisualConfiguration {
    const visualConfigs = modelsRegistry.visualConfigurations
    const configEntry = visualConfigs[options.analysisType]

    if (!configEntry) {
      throw new Error(`No visual configuration found for analysis type: ${options.analysisType}`)
    }

    // Check if this is a variant-based config
    if (this.isVariantConfig(configEntry)) {
      if (!options.variant) {
        throw new Error(
          `Analysis type "${options.analysisType}" requires a variant. ` +
            `Available variants: ${Object.keys(configEntry).join(', ')}`,
        )
      }

      const variantConfig = (configEntry as Record<string, VisualConfiguration>)[options.variant]
      if (!variantConfig) {
        throw new Error(
          `Unknown variant "${options.variant}" for analysis type "${options.analysisType}". ` +
            `Available variants: ${Object.keys(configEntry).join(', ')}`,
        )
      }

      return variantConfig
    }

    return configEntry as VisualConfiguration
  }

  /**
   * Check if config entry is a variant-based configuration
   */
  private isVariantConfig(config: unknown): config is Record<string, VisualConfiguration> {
    if (!config || typeof config !== 'object') return false
    // If it has 'colors' array directly, it's a single config
    if (Array.isArray((config as Record<string, unknown>).colors)) return false
    // Otherwise it's a variant map
    return true
  }

  /**
   * Calculate steps from config with potential API overrides
   */
  private calculateSteps(options: AnalysisVisualizationOptions): [number, number] {
    const configSteps = this.config.steps

    // For categorical scales, use index range
    if (this.isCategorical) {
      return [0, configSteps.length - 1]
    }

    // Get numeric steps from config
    let min = configSteps[0] as number
    let max = configSteps[configSteps.length - 1] as number

    // Override with API response values if provided
    if (options.minLegend !== undefined) {
      min = options.minLegend
    }
    if (options.maxLegend !== undefined) {
      max = options.maxLegend
    }

    return [min, max]
  }

  /**
   * Generate evenly-spaced bin boundaries
   */
  private generateBins(numColors: number): number[] {
    const [min, max] = this.steps
    const bins: number[] = []
    const step = (max - min) / numColors

    for (let i = 0; i <= numColors; i++) {
      bins.push(min + step * i)
    }

    return bins
  }

  /**
   * Get color for a value using configured interpolation method
   */
  getColor(value: number): RGB {
    if (this.config.colorInterpolation === 'binned') {
      return this.getBinnedColor(value)
    }
    return this.getLinearColor(value)
  }

  /**
   * Get color using linear interpolation
   */
  getLinearColor(value: number): RGB {
    return linearInterpolation(value, this.steps[0], this.steps[1], this.meshColors)
  }

  /**
   * Get color using binned/stepped interpolation
   */
  getBinnedColor(value: number): RGB {
    const binIndex = this.meshBins.findIndex((step) => value < step)
    const colorIndex = binIndex === -1 ? this.meshColors.length - 1 : Math.max(0, binIndex - 1)
    return this.meshColors[colorIndex]
  }

  /**
   * Get hex color string for a value
   */
  getHexColor(value: number): string {
    return rgbToHex(this.getColor(value))
  }

  /**
   * Get RGBA color for a value (with alpha = 255)
   */
  getRGBA(value: number, alpha: number = 255): RGBA {
    const rgb = this.getColor(value)
    return [rgb[0], rgb[1], rgb[2], alpha]
  }

  /**
   * Get color for a categorical step index
   */
  getCategoricalColor(index: number): RGB {
    const clampedIndex = Math.max(0, Math.min(index, this.standardColors.length - 1))
    return this.standardColors[clampedIndex]
  }

  /**
   * Get all available analysis types
   */
  static getAnalysisTypes(): string[] {
    return Object.keys(modelsRegistry.visualConfigurations)
  }

  /**
   * Get available variants for an analysis type
   */
  static getVariants(analysisType: string): string[] | null {
    const config = modelsRegistry.visualConfigurations[analysisType]
    if (!config) return null

    // Check if single config (has colors directly)
    if (Array.isArray((config as Record<string, unknown>).colors)) {
      return null // No variants
    }

    return Object.keys(config)
  }

  /**
   * Get the raw registry data
   */
  static getRegistry(): ModelsRegistry {
    return modelsRegistry
  }
}

/**
 * Create a color scale function from registry configuration
 */
export function createColorScaleFromRegistry(
  analysisType: string,
  variant?: string,
  minLegend?: number,
  maxLegend?: number,
): (value: number | null) => RGBA {
  const viz = new AnalysisVisualization({
    analysisType,
    variant,
    minLegend,
    maxLegend,
  })

  return (value: number | null): RGBA => {
    if (value === null || value === undefined) {
      return [0, 0, 0, 0] // Transparent
    }
    return viz.getRGBA(value)
  }
}
