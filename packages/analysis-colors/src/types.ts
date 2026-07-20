/**
 * Analysis Colors: Type Definitions
 *
 * TypeScript types for the ModelsRegistry color system.
 */

/**
 * RGB color tuple [red, green, blue] with values 0-255
 */
export type RGB = [number, number, number]

/**
 * RGBA color tuple [red, green, blue, alpha] with values 0-255
 */
export type RGBA = [number, number, number, number]

/**
 * Color interpolation method
 */
export type ColorInterpolation = 'linear' | 'binned'

/**
 * Legend type for value mapping
 */
export type LegendType = 'linear' | 'equal_ranges' | 'unequal_ranges'

/**
 * Legend bound handling
 */
export type LegendBoundHandling = 'open' | 'closed'

/**
 * Visual configuration for an analysis type
 */
export interface VisualConfiguration {
  /** Color palette as RGB tuples */
  colors: RGB[]

  /** Value range [min, max] or categorical labels */
  steps: (number | string)[]

  /** Interpolation method */
  colorInterpolation: ColorInterpolation

  /** Subdivision factor for mesh colors (extends palette) */
  resultSubdivisionFactor: number

  /** Subdivision factor for legend display */
  legendSubdivisionFactor: number

  /** Subdivision factor for chart bars */
  barsSubdivisionFactor: number

  /** Legend type */
  legendType: LegendType

  /** How to handle values below min */
  legendMinHandling: LegendBoundHandling

  /** How to handle values above max */
  legendMaxHandling: LegendBoundHandling

  /** Unit label (e.g., "m/s", "% of time", "kWh/m2") */
  unit?: string

  /** Description/info text */
  info?: string

  /** Human-readable labels for categorical steps */
  stepsNames?: string[]
}

/**
 * Model registry entry for an analysis model
 */
export interface ModelRegistryEntry {
  version: string
  name: string
  batching: boolean
  visualConfigurations?: Partial<VisualConfiguration>
  depreciationCreateDate?: string
  depreciationRunDate?: string
}

/**
 * Visual configurations section with variants support
 */
export interface VisualConfigurationsMap {
  /** Simple configs (single visual config per analysis) or variant configs */
  [analysisType: string]:
    | VisualConfiguration
    | {
        /** Variant configs keyed by the SDK's wire values (e.g. lawson-2001,
         *  vdi-387 — the PwcCriteria value, not the human norm name). */
        [variant: string]: VisualConfiguration
      }
}

/**
 * Complete models registry structure
 */
export interface ModelsRegistry {
  _id?: { $oid: string }
  uuid: string
  version: string

  /** Global analysis models */
  global: Record<string, ModelRegistryEntry>

  /** Local/weather-specific model overrides (deprecated) */
  local: Record<string, Record<string, ModelRegistryEntry>>

  /** Visual configurations for all analysis types */
  visualConfigurations: VisualConfigurationsMap

  /** Validation rules per analysis type */
  validations: Record<string, Array<{ key: string; op: string }>>

  /** Environment identifier */
  env: string

  /** SageMaker endpoint name */
  sagemakerEndpoint?: string
}

/**
 * Options for creating an AnalysisVisualization
 */
export interface AnalysisVisualizationOptions {
  /** Analysis type (e.g., "wind-speed", "thermal-comfort-index") */
  analysisType: string

  /** Variant name for analyses with multiple configs (e.g., "lawson-2001") */
  variant?: string

  /** Override min value from API response */
  minLegend?: number

  /** Override max value from API response */
  maxLegend?: number
}
