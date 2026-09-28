// Annotation pins for the plan map: the highest and lowest AREA of the layer on
// screen (found in the data, so they always match the map), plus hand-written
// notes per analysis ("interesting because..."). Each pin shows the value
// from the data at its point, so its text cannot contradict the colours.
import type { AnalysisId } from '../demo/analyses'
import type { DemoScene, Variant } from '../demo/scene'
import { SCENE_SIZE_M } from '../demo/scene-layout'
import type { DemoResult, FacadeResult } from './results'

/** A value at a point, in metres. */
type Point = { v: number; x: number; y: number }

export interface Note {
  x: number
  y: number
  kind: 'high' | 'low' | 'note'
  label: string
  /** The value to show, when it is not the map value at (x, y) (facade pins: the wall mean). */
  value?: number
}

/** The value under the cursor or at a pin, as text and a legend colour. */
export interface MapTip {
  text: string
  color?: string
}

const NOTE_ICON = { high: '▲', low: '▼', note: 'i' } as const

/**
 * One pin as HTML (the 2D map and the 3D view use the same). Two lines: the
 * place ("Oak grove") in bold, then what it means and the value.
 */
export function noteHtml(n: Note & { tip: MapTip | null }): string {
  const safe = (t: string) => t.replace(/[<>&]/g, '')
  const cut = n.label.indexOf(': ')
  const head = cut < 0 ? n.label : n.label.slice(0, cut)
  const rest = cut < 0 ? '' : n.label.slice(cut + 2)
  const value = n.tip ? `<em>${safe(n.tip.text)}</em>` : ''
  const body = [safe(rest), value].filter(Boolean).join(' · ')
  return `<div class="note-pin k-${n.kind}"><b>${NOTE_ICON[n.kind]}</b><span><strong>${safe(head)}</strong>${body ? `<br>${body}` : ''}</span></div>`
}

/** Words for the high and low pins, per analysis (Difference mode uses "change"). */
const WORDS: Partial<Record<AnalysisId, [string, string]>> = {
  utci: ['Hottest', 'Coolest'],
  solar: ['Most sun energy', 'Least sun energy'],
  'sun-hours': ['Most sun', 'Least sun'],
  'sun-hours-winter': ['Most sun', 'Least sun'],
  svf: ['Most open sky', 'Least open sky'],
  daylight: ['Most direct sun', 'Least direct sun'],
  'daylight-winter': ['Most direct sun', 'Least direct sun'],
  wind: ['Windiest', 'Calmest'],
  'facade-sun': ['Sunniest walls', 'Darkest walls'],
}

/**
 * Hand-written notes: [x, y, text, only in this variant?] in metres. Written
 * after looking at the results; re-check them when the scene or a period changes.
 */
export const NOTES: Partial<
  Record<AnalysisId, ReadonlyArray<readonly [number, number, string, Variant?]>>
> = {
  utci: [
    [300, 30, 'Car park: bare asphalt, no shade', 'baseline'],
    [300, 30, 'Car park: maples and grass strips cool it', 'greener-street'],
    [300, 180, 'Oak grove: shade cools'],
    [395, 135, 'Lake: water stays cooler'],
  ],
  solar: [
    [60, 304, 'Narrow canyon: little sun reaches the ground'],
    [470, 180, 'Pines: dense crowns'],
  ],
  'sun-hours': [
    [60, 304, 'Canyon: no direct sun'],
    [348, 330, 'Hill tower: shadow to the north'],
    [330, 250, 'Fan shadows: one ray per hourly sun position'],
  ],
  'sun-hours-winter': [
    [470, 180, 'Pines keep their needles'],
    [300, 180, 'Bare oaks let more sun through'],
  ],
  svf: [
    [60, 304, 'Canyon: only a strip of sky'],
    [420, 385, 'Hill top: open sky'],
  ],
  daylight: [
    [186, 428, 'North of tall blocks: no direct sun all day (not dark)'],
    [300, 195, 'Oak grove: shade falls north of the crowns (low autumn sun)'],
    [348, 322, 'Hill tower: little direct sun to its north'],
  ],
  'daylight-winter': [
    [300, 195, 'Oak grove after leaf fall: bright again'],
    [470, 190, 'Pines stay dark'],
  ],
  wind: [
    [60, 304, 'Deep canyon: wind skims over it'],
    [375, 298, 'Hill tower: calm wake behind it'],
    [300, 128, 'Cross street: wind shoots into the park'],
  ],
  'wind-comfort': [[375, 298, 'Behind the hill tower']],
}

/** Mean of a (2r+1)² window where at least 70 % of the cells have a value. */
function windowMean(
  v: Float32Array,
  rows: number,
  cols: number,
  row: number,
  col: number,
  r: number,
) {
  let sum = 0
  let n = 0
  for (let i = row - r; i <= row + r; i++) {
    for (let j = col - r; j <= col + r; j++) {
      if (i < 0 || j < 0 || i >= rows || j >= cols) return Number.NaN
      const x = v[i * cols + j]
      if (Number.isNaN(x)) continue
      sum += x
      n++
    }
  }
  return n >= 0.7 * (2 * r + 1) ** 2 ? sum / n : Number.NaN
}

/**
 * The centre (metres) of the highest and lowest 9 m area of a grid, at least
 * 12 m from the edge (a model edge is not a finding). An extreme that covers
 * more than 3 % of the site (a plateau, e.g. 100 % direct sun on the open lawn)
 * has no single place, so it gets no pin (null).
 */
function gridExtremes(r: DemoResult & { kind: 'grid' }) {
  const cell = SCENE_SIZE_M / r.cols
  const rad = Math.max(1, Math.round(4 / cell))
  const edge = Math.round(12 / cell)
  const all: Point[] = []
  // Every 3rd cell is enough for 9 m windows and keeps this fast.
  for (let row = edge; row < r.rows - edge; row += 3) {
    for (let col = edge; col < r.cols - edge; col += 3) {
      const m = windowMean(r.values, r.rows, r.cols, row, col, rad)
      if (!Number.isNaN(m)) all.push({ v: m, x: (col + 0.5) * cell, y: (row + 0.5) * cell })
    }
  }
  if (all.length === 0) return null
  let hi = all[0]
  let lo = all[0]
  for (const p of all) {
    if (p.v > hi.v) hi = p
    if (p.v < lo.v) lo = p
  }
  const tol = 0.01 * (hi.v - lo.v)
  const plateau = (e: Point) =>
    all.filter((p) => Math.abs(p.v - e.v) <= tol).length > 0.03 * all.length
  return { hi: plateau(hi) ? null : hi, lo: plateau(lo) ? null : lo }
}

/** Facades: the roof centre of the building with the highest and lowest wall mean. */
function facadeExtremes(r: FacadeResult, scene: DemoScene, means: Map<string, number>) {
  let hi: { v: number; id: string } | null = null
  let lo: { v: number; id: string } | null = null
  for (const [id, v] of means) {
    if (Number.isNaN(v)) continue
    if (!hi || v > hi.v) hi = { v, id }
    if (!lo || v < lo.v) lo = { v, id }
  }
  const centre = (e: { v: number; id: string } | null) => {
    const b = e && scene.boxes.find((x) => x.id === e.id)
    if (!e || !b) return null
    const [x0, y0, x1, y1] = b.rect
    return { v: e.v, x: (x0 + x1) / 2, y: (y0 + y1) / 2, wall: true }
  }
  const h = centre(hi)
  const l = centre(lo)
  return h && l && Object.keys(r.surfaces).length ? { hi: h, lo: l } : null
}

/** All pins for one layer. `diff` = the layer is a difference map. */
export function notesFor(
  id: AnalysisId,
  shown: DemoResult,
  scene: DemoScene,
  opts: {
    diff: boolean
    categorical: boolean
    means: Map<string, number> | null
    variant: Variant
  },
): Note[] {
  const out: Note[] = []
  const written: Note[] = opts.diff
    ? []
    : (NOTES[id] ?? [])
        .filter(([, , , only]) => !only || only === opts.variant)
        .map(([x, y, label]) => ({ x, y, kind: 'note', label }))
  if (!opts.categorical) {
    const ext =
      shown.kind === 'grid'
        ? gridExtremes(shown)
        : opts.means
          ? facadeExtremes(shown, scene, opts.means)
          : null
    const [hiWord, loWord] = opts.diff
      ? ['Biggest increase', 'Biggest decrease']
      : (WORDS[id] ?? ['Highest', 'Lowest'])
    const pins: Array<[Point | null, 'high' | 'low', string]> = ext
      ? [
          [ext.hi, 'high', hiWord],
          [ext.lo, 'low', loWord],
        ]
      : []
    const big = Math.max(...pins.map(([p]) => (p ? Math.abs(p.v) : 0)))
    for (const [p, kind, word] of pins) {
      if (!p) continue
      // A difference pin must be a real change: at least a quarter of the largest one.
      if (opts.diff && (Math.abs(p.v) < 0.25 * big || Math.abs(p.v) < 0.05)) continue
      // A written note next to the extreme takes it over: one pin, not two.
      const near = written.find((n) => n.kind === 'note' && Math.hypot(n.x - p.x, n.y - p.y) < 40)
      if (near) {
        near.kind = kind
        near.label = `${word} · ${near.label}`
      } else out.push({ x: p.x, y: p.y, kind, label: word, ...('wall' in p ? { value: p.v } : {}) })
    }
  }
  out.push(...written)
  return out
}
