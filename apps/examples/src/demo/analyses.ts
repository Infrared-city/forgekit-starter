// The analyses of the demo explorer: what each one needs, how it is coloured,
// and a short plain-language explanation. The pre-compute script and the
// "Run it yourself" button both build their SDK request here, so the two
// always send the same thing.
import type { AnalysesName } from '@infrared-city/infrared-sdk-ts'
import type { DemoScene } from './scene.ts'
import { DEMO_CENTER } from './scene-layout.ts'

export type AnalysisId =
  | 'utci'
  | 'solar'
  | 'sun-hours'
  | 'sun-hours-winter'
  | 'svf'
  | 'daylight'
  | 'daylight-winter'
  | 'wind'
  | 'wind-comfort'
  | 'facade-sun'

/**
 * Pairs an analysis with its winter (leaf-off) twin, same geometry, same
 * kind of period, computed after staging turned deciduous leaf-off on
 * ("Leaf-off for DA/DSH", lambda-models #418). See `WINTER_OF` in
 * `Explorer.tsx` for the summer/winter toggle.
 */
export const WINTER_OF: Partial<Record<AnalysisId, AnalysisId>> = {
  daylight: 'daylight-winter',
  'sun-hours': 'sun-hours-winter',
}

type Period = {
  start: { month: number; day: number; hour: number }
  end: { month: number; day: number; hour: number }
}

export interface DemoAnalysis {
  id: AnalysisId
  label: string
  analysisType: AnalysesName
  unit: string
  /** Fixed colour range, so baseline and variant compare by eye. */
  min: number
  max: number
  /** Difference map range: -diff .. +diff. */
  diff: number
  /** Colour ramp name (see explorer/colors.ts). */
  ramp: 'heat' | 'sun' | 'sky' | 'wind'
  /** When the period needs weather rows from the nearest station. */
  period?: Period
  needsWeather: boolean
  /** Result on building walls (3D) instead of the ground. */
  facades?: boolean
  /** Wind models see buildings only, so the variant cannot change them. */
  buildingsOnly?: boolean
  /** Which scene parts the model reads. */
  uses: { trees: boolean; ground: boolean; terrain: boolean }
  when: string
  explain: string
}

const JULY_AFTERNOONS: Period = {
  start: { month: 7, day: 1, hour: 13 },
  end: { month: 7, day: 31, hour: 16 },
}
const JULY_DAYTIME: Period = {
  start: { month: 7, day: 1, hour: 5 },
  end: { month: 7, day: 31, hour: 20 },
}
const EQUINOX_DAY: Period = {
  start: { month: 3, day: 21, hour: 8 },
  end: { month: 3, day: 21, hour: 17 },
}
const DECEMBER_DAYS: Period = {
  start: { month: 12, day: 1, hour: 9 },
  end: { month: 12, day: 31, hour: 15 },
}
// Same day and hours as EQUINOX_DAY, shifted to the winter solstice: DSH's
// winter twin (leaf-off on staging changes the trees, not the geometry).
const WINTER_SOLSTICE_DAY: Period = {
  start: { month: 12, day: 21, hour: 8 },
  end: { month: 12, day: 21, hour: 17 },
}
const WHOLE_YEAR: Period = {
  start: { month: 1, day: 1, hour: 0 },
  end: { month: 12, day: 31, hour: 23 },
}

const ALL = { trees: true, ground: false, terrain: true }

export const ANALYSES: readonly DemoAnalysis[] = [
  {
    id: 'utci',
    label: 'Heat stress (UTCI)',
    analysisType: 'thermal-comfort-index',
    unit: '°C UTCI',
    min: 24,
    max: 34,
    diff: 3,
    ramp: 'heat',
    period: JULY_AFTERNOONS,
    needsWeather: true,
    uses: { trees: true, ground: true, terrain: true },
    when: 'July afternoons, 13:00-16:00, typical weather',
    explain:
      'UTCI is the "feels like" temperature for a person outdoors. It combines air temperature, sun, wind and humidity. Above 26 °C is moderate heat stress, above 32 °C strong, above 38 °C very strong. Shade from trees and buildings, and cool surfaces like grass and water, lower it.',
  },
  {
    id: 'solar',
    label: 'Solar radiation',
    analysisType: 'solar-radiation',
    unit: 'kWh/m²',
    min: 0,
    max: 200,
    diff: 60,
    ramp: 'sun',
    period: JULY_DAYTIME,
    needsWeather: true,
    uses: ALL,
    when: 'July, all daylight hours, typical weather',
    explain:
      'How much sun energy reaches the ground in July. High values mean hot pavement and a strong need for shade. Street canyons and tree crowns get much less.',
  },
  {
    id: 'sun-hours',
    label: 'Sun hours',
    analysisType: 'direct-sun-hours',
    unit: 'hours',
    min: 0,
    max: 10,
    diff: 6,
    ramp: 'sun',
    period: EQUINOX_DAY,
    needsWeather: false,
    uses: ALL,
    when: '21 March (equinox), 08:00-17:00',
    explain:
      'How many hours of direct sun a spot gets on one day. The sun is low in March, so long shadows show where courtyards, the narrow canyon and north sides of blocks stay in the shade.',
  },
  {
    id: 'sun-hours-winter',
    label: 'Sun hours (winter)',
    analysisType: 'direct-sun-hours',
    unit: 'hours',
    min: 0,
    max: 10,
    diff: 6,
    ramp: 'sun',
    period: WINTER_SOLSTICE_DAY,
    needsWeather: false,
    uses: ALL,
    when: '21 December (winter solstice), 08:00-17:00',
    explain:
      "The same sun-hours question at the darkest time of year, with staging's deciduous leaf-off model on. The sun is even lower than at the equinox, and bare tree crowns let far more of it through than a leafy summer crown would.",
  },
  {
    id: 'svf',
    label: 'Sky view factor',
    analysisType: 'sky-view-factors',
    unit: '% open sky',
    min: 0,
    max: 100,
    diff: 50,
    ramp: 'sky',
    needsWeather: false,
    uses: ALL,
    when: 'No time or weather: geometry only',
    explain:
      'How much of the sky you see when you look up. 100 % is an open field; a deep street canyon or a dense tree crown gives low values. Low sky view keeps heat in at night.',
  },
  {
    id: 'daylight',
    label: 'Daylight',
    analysisType: 'daylight-availability',
    unit: '% of hours',
    min: 0,
    max: 100,
    diff: 50,
    ramp: 'sky',
    period: DECEMBER_DAYS,
    needsWeather: false,
    uses: ALL,
    when: 'December, 09:00-15:00 (the darkest month)',
    explain:
      'The share of daytime hours with enough daylight on the ground, in December. Deep canyons, courtyards and the north side of tall blocks get too little; open squares and the park are bright.',
  },
  {
    id: 'daylight-winter',
    label: 'Daylight (leaf-off)',
    analysisType: 'daylight-availability',
    unit: '% of hours',
    min: 0,
    max: 100,
    diff: 50,
    ramp: 'sky',
    period: DECEMBER_DAYS,
    needsWeather: false,
    uses: ALL,
    when: "December, 09:00-15:00, with staging's deciduous leaf-off model on",
    explain:
      'The same December daylight question, recomputed after staging turned on deciduous leaf-off: bare tree crowns let much more daylight through than a leafy crown would, so the park reads brighter under the trees.',
  },
  {
    id: 'wind',
    label: 'Wind speed',
    analysisType: 'wind-speed',
    unit: 'm/s',
    min: 0,
    max: 8,
    diff: 2,
    ramp: 'wind',
    needsWeather: false,
    buildingsOnly: true,
    uses: { trees: false, ground: false, terrain: false },
    when: '5 m/s wind from the west (270°), 1.5 m above ground',
    explain:
      'Wind speed at pedestrian height for one wind: 5 m/s from the west. Blocks slow the wind behind them (the wake) and speed it up along streets and corners. This model uses buildings only, so the street trees do not change it.',
  },
  {
    id: 'wind-comfort',
    label: 'Wind comfort',
    analysisType: 'pedestrian-wind-comfort',
    unit: 'Lawson 2001 class',
    min: 0,
    max: 5,
    diff: 2,
    ramp: 'wind',
    period: WHOLE_YEAR,
    needsWeather: true,
    buildingsOnly: true,
    uses: { trees: false, ground: false, terrain: false },
    when: 'Wind rose of a whole year, Lawson 2001 criteria',
    explain:
      'Is it comfortable to sit, stand or walk here, over a whole year of wind? The model uses the local wind rose and rates each spot with the Lawson criteria. It uses buildings only, so the street trees do not change it.',
  },
  {
    id: 'facade-sun',
    label: 'Facade sun hours',
    analysisType: 'direct-sun-hours',
    unit: 'hours',
    min: 0,
    max: 10,
    diff: 6,
    ramp: 'sun',
    period: EQUINOX_DAY,
    needsWeather: false,
    facades: true,
    uses: ALL,
    when: '21 March (equinox), 08:00-17:00, on every wall',
    explain:
      'Direct sun hours on the building walls, not on the ground. Low walls in the canyon get little sun; street trees shade the lower floors on Linden Street. Look at it in the 3D view.',
  },
]

export const analysisById = (id: AnalysisId) => ANALYSES.find((a) => a.id === id) as DemoAnalysis

/**
 * The SDK request for one analysis on one scene: `input` for
 * `runAreaAndWait(input, DEMO_POLYGON, options)`. `weatherData` are the rows
 * from `client.weather.filterWeatherData(station, { period })`.
 */
export function buildRequest(a: DemoAnalysis, scene: DemoScene, weatherData?: unknown[]) {
  const input: Record<string, unknown> & { analysisType: string } = { analysisType: a.analysisType }
  if (a.id === 'wind') {
    input.windSpeed = 5
    input.windDirection = 270
  } else if (a.id === 'wind-comfort') {
    input.criteria = 'lawson-2001'
  } else if (a.id !== 'svf') {
    input.latitude = DEMO_CENTER.lat
    input.longitude = DEMO_CENTER.lon
  }
  if (a.period) input.dateFilters = { period: a.period }
  if (a.needsWeather) {
    if (!weatherData) throw new Error(`${a.label} needs weather rows`)
    input.weatherData = weatherData
  }
  if (a.facades) input.analysisSurfaces = 'facades'
  if (a.uses.terrain) {
    // The hill. `auto-align` seats buildings and trees on the terrain.
    input.groundGeometry = scene.groundGeometry
    input.terrainAlignment = 'auto-align'
  }
  const options: Record<string, unknown> = { buildings: scene.buildings }
  if (a.uses.trees) options.vegetation = scene.vegetation
  if (a.uses.ground) options.groundMaterials = scene.groundMaterials
  if (a.id === 'wind') {
    // Several wind tiles: blend them along the wind direction (no seams).
    options.strategy = 'directional_blend'
    options.windDirectionDeg = 270
  }
  return { input, options }
}
