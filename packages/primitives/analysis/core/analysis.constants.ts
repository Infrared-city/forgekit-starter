import {
  AnalysesName,
  type AnalysesName as AnalysesNameType,
  PwcCriteria,
  type PwcCriteria as PwcCriteriaType,
  ThermalComfortStatisticsSubType,
  type ThermalComfortStatisticsSubType as ThermalComfortStatisticsSubTypeType,
} from './analysis.sdk-types'

// ─── Analysis type labels ───────────────────────────────────────────────────────

/** Map lookup: `AnalysesName` -> human-readable label */
export const ANALYSIS_TYPE_LABELS: Record<AnalysesNameType, string> = {
  [AnalysesName.DirectSunHours]: 'Direct Sun Hours',
  [AnalysesName.DaylightAvailability]: 'Daylight Availability',
  [AnalysesName.SolarRadiation]: 'Solar Radiation',
  [AnalysesName.SkyViewFactors]: 'Sky View Factors',
  [AnalysesName.WindSpeed]: 'Wind Speed',
  [AnalysesName.PedestrianWindComfort]: 'Pedestrian Wind Comfort',
  [AnalysesName.ThermalComfortIndex]: 'Thermal Comfort Index',
  [AnalysesName.ThermalComfortStatistics]: 'Thermal Comfort Statistics',
}

/** Array variant for `<select>` / dropdown options, derived from the map. */
export const ANALYSIS_TYPE_OPTIONS = Object.entries(ANALYSIS_TYPE_LABELS).map(([value, label]) => ({
  value: value as AnalysesNameType,
  label,
}))

// ─── Pedestrian Wind Comfort criteria labels ────────────────────────────────────

export const PWC_CRITERIA_LABELS: Record<PwcCriteriaType, string> = {
  [PwcCriteria.Lawson2001]: 'Lawson 2001',
  [PwcCriteria.Lawson1970]: 'Lawson 1970',
  [PwcCriteria.LawsonLDDC]: 'Lawson LDDC',
  [PwcCriteria.NEN8100Comfort]: 'NEN 8100 Comfort',
  [PwcCriteria.NEN8100Safety]: 'NEN 8100 Safety',
  [PwcCriteria.VDI387]: 'VDI 387',
  [PwcCriteria.Davenport]: 'Davenport',
}

export const PWC_CRITERIA_OPTIONS = Object.entries(PWC_CRITERIA_LABELS).map(([value, label]) => ({
  value: value as PwcCriteriaType,
  label,
}))

// ─── Thermal Comfort Statistics subtype labels ──────────────────────────────────

export const TCS_SUBTYPE_LABELS: Record<ThermalComfortStatisticsSubTypeType, string> = {
  [ThermalComfortStatisticsSubType.ColdStress]: 'Cold Stress',
  [ThermalComfortStatisticsSubType.ThermalComfort]: 'Thermal Comfort',
  [ThermalComfortStatisticsSubType.HeatStress]: 'Heat Stress',
}

export const TCS_SUBTYPE_OPTIONS = Object.entries(TCS_SUBTYPE_LABELS).map(([value, label]) => ({
  value: value as ThermalComfortStatisticsSubTypeType,
  label,
}))
