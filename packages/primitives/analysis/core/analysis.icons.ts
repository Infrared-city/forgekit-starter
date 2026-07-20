import { BarChart3, CloudSun, Eye, type LucideIcon, Sun, Thermometer, Wind } from 'lucide-react'
import { AnalysesName, type AnalysesName as AnalysesNameType } from './analysis.sdk-types'

export const ANALYSIS_ICONS: Record<AnalysesNameType, LucideIcon> = {
  [AnalysesName.DirectSunHours]: Sun,
  [AnalysesName.DaylightAvailability]: CloudSun,
  [AnalysesName.SolarRadiation]: Sun,
  [AnalysesName.SkyViewFactors]: Eye,
  [AnalysesName.WindSpeed]: Wind,
  [AnalysesName.PedestrianWindComfort]: Wind,
  [AnalysesName.ThermalComfortIndex]: Thermometer,
  [AnalysesName.ThermalComfortStatistics]: BarChart3,
}

export function getAnalysisIcon(type: AnalysesNameType): LucideIcon {
  return ANALYSIS_ICONS[type] ?? BarChart3
}
