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
 * Pairs an analysis with its leaf-off twin: same geometry, the week after
 * leaf fall instead of the week before (see LEAVES_ON_WEEK). See `WINTER_OF`
 * in `Explorer.tsx` for the "Leaves on / Leaves off" toggle.
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
  /** Result on building walls and roofs (3D) instead of the ground. */
  facades?: boolean
  /** Wind models see buildings only, so the variant cannot change them. */
  buildingsOnly?: boolean
  /**
   * The period has this many days: the explorer divides the stored totals by it
   * and shows a mean per day (a month smooths the hour-by-hour shadow steps).
   */
  perDay?: number
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
// The leaf-fall pair for daylight and sun hours: the model makes deciduous
// trees bare from November to March (northern hemisphere, from the period's
// month; lambda-models `season.rs`). The last week of October and the first
// week of November have almost the same sun, so the difference is the leaves.
// Seven days also blur the hourly shadow snapshots into smooth edges.
const LEAVES_ON_WEEK: Period = {
  start: { month: 10, day: 25, hour: 9 },
  end: { month: 10, day: 31, hour: 15 },
}
const LEAVES_OFF_WEEK: Period = {
  start: { month: 11, day: 1, hour: 9 },
  end: { month: 11, day: 7, hour: 15 },
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
    unit: 'h/day',
    min: 0,
    max: 7,
    diff: 4,
    ramp: 'sun',
    period: LEAVES_ON_WEEK,
    perDay: 7,
    needsWeather: false,
    uses: ALL,
    when: '25-31 October, 09:00-15:00, leaves on: mean hours of direct sun per day (7 at most)',
    explain:
      'How many hours of direct sun a spot gets on a late-October day, while the trees still have their leaves. The autumn sun is low, so long shadows show where the narrow canyon, the north sides of blocks and the ground behind the hill tower stay in the shade.',
  },
  {
    id: 'sun-hours-winter',
    label: 'Sun hours (leaf-off)',
    analysisType: 'direct-sun-hours',
    unit: 'h/day',
    min: 0,
    max: 7,
    diff: 4,
    ramp: 'sun',
    period: LEAVES_OFF_WEEK,
    perDay: 7,
    needsWeather: false,
    uses: ALL,
    when: '1-7 November, 09:00-15:00, deciduous trees bare (7 h/day at most)',
    explain:
      'One week later, after leaf fall. The sun path is almost the same, but bare deciduous crowns let most of the sun through, so their shadows fade. Pines keep their needles and still cast full shadows.',
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
    period: LEAVES_ON_WEEK,
    needsWeather: false,
    uses: ALL,
    when: '25-31 October, 09:00-15:00, leaves on',
    explain:
      'The share of daytime hours with enough daylight on the ground in late October, with leafy trees. Deep canyons, courtyards and the north side of tall blocks get too little; open lawns are bright.',
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
    period: LEAVES_OFF_WEEK,
    needsWeather: false,
    uses: ALL,
    when: '1-7 November, 09:00-15:00, deciduous trees bare',
    explain:
      'One week later, after leaf fall: the sun is almost the same, but bare deciduous crowns let much more daylight through, so the ground under oaks, limes and maples gets brighter. Pines keep their needles and stay dark.',
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
    label: 'Facade and roof sun hours',
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
    when: '21 March (equinox), 08:00-17:00, on every wall and roof',
    explain:
      'Direct sun hours on the building walls and roofs, not on the ground. Roofs get sun almost all day, except where a taller neighbour shades them; low walls in the canyon get little sun. In March the street trees are still bare, so they shade the lower floors on Linden Street only a little. Look at it in the 3D view.',
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
  // 'all' = walls and roofs ('facades' would be walls only, 'roofs' roofs only).
  if (a.facades) input.analysisSurfaces = 'all'
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
