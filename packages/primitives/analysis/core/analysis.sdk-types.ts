/**
 * Analysis SDK types inlined from `@infrared/sdk`.
 *
 * Inlined into this primitive package after the SDK was removed.
 * These types are self-contained -- no SDK imports required.
 */

// ---------------------------------------------------------------------------
// Enums (as const objects, matching SDK pattern)
// ---------------------------------------------------------------------------

export const AnalysesName = {
  WindSpeed: 'wind-speed',
  DaylightAvailability: 'daylight-availability',
  DirectSunHours: 'direct-sun-hours',
  SkyViewFactors: 'sky-view-factors',
  SolarRadiation: 'solar-radiation',
  ThermalComfortIndex: 'thermal-comfort-index',
  PedestrianWindComfort: 'pedestrian-wind-comfort',
  ThermalComfortStatistics: 'thermal-comfort-statistics',
} as const

export type AnalysesName = (typeof AnalysesName)[keyof typeof AnalysesName]

export const PwcCriteria = {
  VDI387: 'vdi-387',
  Lawson1970: 'lawson-1970',
  Lawson2001: 'lawson-2001',
  LawsonLDDC: 'lawson-lddc',
  Davenport: 'davenport',
  NEN8100Comfort: 'nen-8100-comfort',
  NEN8100Safety: 'nen-8100-safety',
} as const

export type PwcCriteria = (typeof PwcCriteria)[keyof typeof PwcCriteria]

export const ThermalComfortStatisticsSubType = {
  ColdStress: 'cold-stress',
  ThermalComfort: 'thermal-comfort',
  HeatStress: 'heat-stress',
} as const

export type ThermalComfortStatisticsSubType =
  (typeof ThermalComfortStatisticsSubType)[keyof typeof ThermalComfortStatisticsSubType]

export const ExecutionConfig = {
  Async: 'async',
} as const

export type ExecutionConfig = (typeof ExecutionConfig)[keyof typeof ExecutionConfig]

// ---------------------------------------------------------------------------
// Time types
// ---------------------------------------------------------------------------

export interface TimeFilterStamp {
  month: number
  day: number
  hour: number
}

export interface TimeFilterPeriod {
  start: TimeFilterStamp
  end: TimeFilterStamp
}

export interface TimeFilter {
  day?: string
  hour?: string
}

export interface TimeFilters {
  period: TimeFilterPeriod
  filter?: TimeFilter
}

// ---------------------------------------------------------------------------
// Weather data types
// ---------------------------------------------------------------------------

export interface WeatherDataPoint {
  dryBulbTemperature?: number | null
  dewPointTemperature?: number | null
  relativeHumidity?: number | null
  atmosphericStationPressure?: number | null
  extraterrestrialHorizontalRadiation?: number | null
  extraterrestrialDirectNormalRadiation?: number | null
  horizontalInfraredRadiationIntensity?: number | null
  globalHorizontalRadiation?: number | null
  directNormalRadiation?: number | null
  diffuseHorizontalRadiation?: number | null
  globalHorizontalIlluminance?: number | null
  directNormalIlluminance?: number | null
  diffuseHorizontalIlluminance?: number | null
  zenithLuminance?: number | null
  windDirection?: number | null
  windSpeed?: number | null
  totalSkyCover?: number | null
  opaqueSkyCover?: number | null
  visibility?: number | null
  ceilingHeight?: number | null
  presentWeatherObservation?: number | null
  presentWeatherCodes?: number | null
  precipitableWater?: number | null
  aerosolOpticalDepth?: number | null
  snowDepth?: number | null
  daysSinceLastSnowfall?: number | null
  albedo?: number | null
  liquidPrecipitationDepth?: number | null
  liquidPrecipitationQuantity?: number | null
}

export interface EPWData {
  year: number[]
  month: number[]
  day: number[]
  hour: number[]
  minute: number[]
  dryBulbTemperature: number[]
  dewPointTemperature: number[]
  relativeHumidity: number[]
  atmosphericStationPressure: number[]
  extraterrestrialHorizontalRadiation: number[]
  extraterrestrialDirectNormalRadiation: number[]
  horizontalInfraredRadiationIntensity: number[]
  globalHorizontalRadiation: number[]
  directNormalRadiation: number[]
  diffuseHorizontalRadiation: number[]
  globalHorizontalIlluminance: number[]
  directNormalIlluminance: number[]
  diffuseHorizontalIlluminance: number[]
  zenithLuminance: number[]
  windDirection: number[]
  windSpeed: number[]
  totalSkyCover: number[]
  opaqueSkyCover: number[]
  visibility: number[]
  ceilingHeight: number[]
  presentWeatherObservation: number[]
  presentWeatherCodes: number[]
  precipitableWater: number[]
  aerosolOpticalDepth: number[]
  snowDepth: number[]
  daysSinceLastSnowfall: number[]
  albedo: number[]
  liquidPrecipitationDepth: number[]
  liquidPrecipitationQuantity: number[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Analysis types that include location fields (latitude/longitude).
 */
export const LOCATION_ANALYSIS_TYPES: readonly string[] = [
  AnalysesName.DirectSunHours,
  AnalysesName.DaylightAvailability,
  AnalysesName.SolarRadiation,
  AnalysesName.ThermalComfortIndex,
  AnalysesName.ThermalComfortStatistics,
] as const

/**
 * Analysis types supported for grid-based tiling.
 */
export const TILING_SUPPORTED_TYPES: ReadonlySet<string> = new Set([
  AnalysesName.WindSpeed,
  AnalysesName.PedestrianWindComfort,
  AnalysesName.DaylightAvailability,
  AnalysesName.DirectSunHours,
  AnalysesName.SkyViewFactors,
  AnalysesName.SolarRadiation,
  AnalysesName.ThermalComfortIndex,
  AnalysesName.ThermalComfortStatistics,
])

/**
 * Thermal model weather field names (camelCase).
 */
export const THERMAL_WEATHER_FIELDS: readonly string[] = [
  'horizontalInfraredRadiationIntensity',
  'diffuseHorizontalRadiation',
  'directNormalRadiation',
  'globalHorizontalRadiation',
  'dryBulbTemperature',
  'windSpeed',
  'relativeHumidity',
] as const
