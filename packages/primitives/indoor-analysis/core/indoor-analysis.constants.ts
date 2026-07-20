import type { IndoorAnalysisType } from './indoor-analysis.types'

/** All supported indoor analysis types with display labels */
export const SUPPORTED_INDOOR_ANALYSES: {
  value: IndoorAnalysisType
  label: string
}[] = [{ value: 'daylight-factor', label: 'Daylight Factor' }]

/** Timeout for indoor analysis API requests (3 minutes) */
export const INDOOR_ANALYSIS_TIMEOUT = 180_000
