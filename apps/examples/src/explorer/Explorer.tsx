// The demo explorer: every analysis on one synthetic 512 m scene, pre-computed,
// so it works offline without a key. Pick an analysis, then Baseline, Greener
// street, or the Difference (greener street minus baseline).
import { useEffect, useMemo, useState } from 'react'
import {
  ANALYSES,
  type AnalysisId,
  analysisById,
  type DemoAnalysis,
  WINTER_OF,
} from '../demo/analyses'
import { buildDemoScene, type DemoScene, VARIANT_INFO, VARIANTS, type Variant } from '../demo/scene'
import { SCENE_SIZE_M } from '../demo/scene-layout'
import { type ColorScale, colorOf, gridToCanvas } from './colors'
import { ClassLegend, ContinuousLegend, classColor, LAWSON } from './Legend'
import { PlanMap } from './PlanMap'
import { RunYourself } from './RunYourself'
import {
  type DemoResult,
  difference,
  type FacadeResult,
  loadResult,
  regionStats,
  type Stats,
} from './results'
import { Scene3D } from './Scene3D'
import { planCanvas } from './scene-image'

type Mode = Variant | 'diff'
type View = 'map' | '3d'
const MODES: ReadonlyArray<[Mode, string]> = [
  ...VARIANTS.map((v): [Mode, string] => [v, VARIANT_INFO[v].label]),
  ['diff', 'Difference'],
]

/** The analysis that toggles to `id` in winter, if any (the reverse of `WINTER_OF`). */
function summerOf(id: AnalysisId): AnalysisId | null {
  const found = (Object.entries(WINTER_OF) as Array<[AnalysisId, AnalysisId]>).find(
    ([, winter]) => winter === id,
  )
  return found ? found[0] : null
}

const scenes = new Map<Variant, DemoScene>()
function sceneOf(v: Variant): DemoScene {
  if (!scenes.has(v)) scenes.set(v, buildDemoScene(v))
  return scenes.get(v) as DemoScene
}

/** Settings in the URL (#demo?a=utci&m=diff&v=3d), so a view can be shared. */
function readHash(): { a: AnalysisId; m: Mode; v: View } {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const a = ANALYSES.some((x) => x.id === q.get('a')) ? (q.get('a') as AnalysisId) : 'utci'
  const m = MODES.some(([id]) => id === q.get('m')) ? (q.get('m') as Mode) : 'diff'
  return { a, m, v: q.get('v') === '3d' ? '3d' : 'map' }
}

function scaleFor(a: DemoAnalysis, mode: Mode): ColorScale {
  return mode === 'diff'
    ? { ramp: 'diverging', min: -a.diff, max: a.diff }
    : { ramp: a.ramp, min: a.min, max: a.max }
}

function colorCanvas(r: DemoResult, scale: ColorScale): HTMLCanvasElement | null {
  if (r.kind !== 'grid') return null
  if (!r.legend) return gridToCanvas(r.values, r.rows, r.cols, scale)
  // Classes: value i means legend[i]; colour by the class letter.
  const canvas = gridToCanvas(r.values, r.rows, r.cols, { ramp: 'wind', min: 0, max: 1 })
  const ctx = canvas.getContext('2d')
  const img = ctx?.getImageData(0, 0, r.cols, r.rows)
  if (!ctx || !img) return canvas
  for (let row = 0; row < r.rows; row++) {
    for (let c = 0; c < r.cols; c++) {
      const v = r.values[row * r.cols + c]
      if (Number.isNaN(v)) continue
      const o = ((r.rows - 1 - row) * r.cols + c) * 4
      img.data.set(classColor(r.legend[v] ?? ''), o)
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

/** Mean value on each building's walls (facade results), by building id. */
function buildingMeans(r: FacadeResult): Map<string, number> {
  const sums = new Map<string, [number, number]>()
  for (const [key, s] of Object.entries(r.surfaces)) {
    const id = key.slice(0, key.lastIndexOf('/'))
    const acc = sums.get(id) ?? [0, 0]
    for (const v of s.values) {
      if (v === null) continue
      acc[0] += v
      acc[1]++
    }
    sums.set(id, acc)
  }
  return new Map([...sums].map(([id, [sum, n]]) => [id, n ? sum / n : Number.NaN]))
}

function valueAt(r: DemoResult, scene: DemoScene, x: number, y: number): number | null {
  if (r.kind === 'grid') {
    const v =
      r.values[
        Math.floor((y * r.rows) / SCENE_SIZE_M) * r.cols + Math.floor((x * r.cols) / SCENE_SIZE_M)
      ]
    return Number.isNaN(v) ? null : v
  }
  const b = scene.boxes.find(({ rect: [x0, y0, x1, y1] }) => x >= x0 && x < x1 && y >= y0 && y < y1)
  const v = b ? buildingMeans(r).get(b.id) : undefined
  return v === undefined || Number.isNaN(v) ? null : v
}

function fmt(value: number, unit: string, diff: boolean) {
  const v = Math.abs(value) < 0.05 ? 0 : value
  const s = Math.abs(v) >= 20 ? v.toFixed(0) : v.toFixed(1)
  return `${diff && v > 0 ? '+' : ''}${s} ${unit}`
}

function StatsLine({
  label,
  s,
  a,
  diff,
}: {
  label: string
  s: Stats
  a: DemoAnalysis
  diff: boolean
}) {
  if (Number.isNaN(s.mean)) return null
  const extreme = diff ? (Math.abs(s.min) > Math.abs(s.max) ? s.min : s.max) : null
  return (
    <li>
      <b>{label}</b>: mean {fmt(s.mean, a.unit, diff)}
      {extreme !== null && Math.abs(extreme) > 0.05 && (
        <>, strongest {fmt(extreme, a.unit, true)}</>
      )}
      {!diff && (
        <>
          {' '}
          (from {fmt(s.min, '', false).trim()} to {fmt(s.max, a.unit, false)})
        </>
      )}
    </li>
  )
}

export function Explorer() {
  const [{ a: analysisId, m: mode, v: view }, setState] = useState(readHash)
  const a = analysisById(analysisId)
  const [loaded, setLoaded] = useState<{
    key: string
    base: DemoResult
    variant: DemoResult
  } | null>(null)
  const [live, setLive] = useState<Record<string, DemoResult>>({})
  const [error, setError] = useState('')
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  // The variant that "Difference" compares with the baseline: the last one picked.
  const [compared, setCompared] = useState<Variant>(
    mode !== 'diff' && mode !== 'baseline' ? mode : VARIANTS[1],
  )

  // Winter twins (daylight-winter, sun-hours-winter) live only behind the
  // Leaf state toggle below, not in the main list.
  const pickableAnalyses = ANALYSES.filter((x) => !summerOf(x.id))
  const winterTwin = WINTER_OF[analysisId]
  const summerBase = summerOf(analysisId)
  const leaf: 'summer' | 'winter' = winterTwin ? 'summer' : 'winter'

  const set = (patch: Partial<{ a: AnalysisId; m: Mode; v: View }>) => {
    const next = { a: analysisId, m: mode, v: view, ...patch }
    if (patch.a && analysisById(patch.a).facades) next.v = '3d'
    if (patch.m && patch.m !== 'diff' && patch.m !== 'baseline') setCompared(patch.m)
    setState(next)
    window.history.replaceState(null, '', `#demo?a=${next.a}&m=${next.m}&v=${next.v}`)
  }

  useEffect(() => {
    let stale = false
    setError('')
    Promise.all([loadResult(analysisId, 'baseline'), loadResult(analysisId, compared)])
      .then(
        ([base, variant]) =>
          !stale && setLoaded({ key: `${analysisId}/${compared}`, base, variant }),
      )
      .catch((err) => !stale && setError(err instanceof Error ? err.message : String(err)))
    return () => {
      stale = true
    }
  }, [analysisId, compared])

  const variant: Variant = mode === 'diff' ? compared : mode
  const scene = sceneOf(variant)
  const shown = useMemo(() => {
    if (!loaded || loaded.key !== `${analysisId}/${compared}`) return null
    const base = live[`${analysisId}/baseline`] ?? loaded.base
    const other = a.buildingsOnly ? base : (live[`${analysisId}/${compared}`] ?? loaded.variant)
    return mode === 'baseline' ? base : mode === 'diff' ? difference(base, other) : other
  }, [loaded, live, analysisId, mode, compared, a])

  const scale = scaleFor(a, mode)
  const categorical = shown?.kind === 'grid' && shown.legend
  const images = useMemo(() => {
    const layer = shown ? colorCanvas(shown, scale) : null
    const means = shown?.kind === 'facades' ? buildingMeans(shown) : null
    const roofColor = (id: string) => {
      const v = means?.get(id)
      if (v === undefined || Number.isNaN(v)) return null
      const [r, g, b] = colorOf(scale, v).map(Math.round)
      return `rgb(${r},${g},${b})`
    }
    return {
      plan: planCanvas(scene, layer, { roofColor: means ? roofColor : undefined }).toDataURL(),
      ground: planCanvas(scene, layer, { trees: false }),
    }
  }, [shown, scene, scale.ramp, scale.min, scale.max]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = shown ? regionStats(shown) : null
  const diff = mode === 'diff'
  const hoverValue = hover && shown ? valueAt(shown, scene, hover.x, hover.y) : null

  return (
    <section className="explorer">
      <div className="ex-controls">
        <h2>Demo explorer</h2>
        <p className="muted">
          A made-up 512 m site: city blocks on the left, a park with a lake and a hill on the right.
          Every result is pre-computed with the Infrared SDK, so this page needs no key.
        </p>
        <label className="pick">
          Analysis{' '}
          <select
            value={analysisId}
            onChange={(e) => set({ a: e.target.value as AnalysisId })}
            data-testid="analysis"
          >
            {pickableAnalyses.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        {(winterTwin || summerBase) && (
          <fieldset className="segmented small" aria-label="Leaf state">
            <button
              type="button"
              className={leaf === 'summer' ? 'on' : ''}
              aria-pressed={leaf === 'summer'}
              onClick={() => summerBase && set({ a: summerBase })}
            >
              Summer
            </button>
            <button
              type="button"
              className={leaf === 'winter' ? 'on' : ''}
              aria-pressed={leaf === 'winter'}
              onClick={() => winterTwin && set({ a: winterTwin })}
            >
              Winter (leaf-off)
            </button>
          </fieldset>
        )}
        <fieldset className="segmented" aria-label="Scenario">
          {MODES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={id === mode ? 'on' : ''}
              aria-pressed={id === mode}
              onClick={() => set({ m: id })}
            >
              {label}
            </button>
          ))}
        </fieldset>
        <fieldset className="segmented small" aria-label="View">
          {(['map', '3d'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={id === view ? 'on' : ''}
              aria-pressed={id === view}
              onClick={() => set({ v: id })}
            >
              {id === 'map' ? 'Map' : '3D'}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="ex-view">
        {view === 'map' ? (
          <PlanMap image={images.plan} onHover={setHover} />
        ) : (
          <Scene3D
            scene={scene}
            ground={images.ground}
            facades={shown?.kind === 'facades' ? { result: shown, scale } : null}
          />
        )}
        <div className="readout" data-testid="readout">
          {error ||
            (!shown
              ? 'Loading...'
              : hover
                ? diff && a.buildingsOnly
                  ? 'No change: this model uses buildings only.'
                  : hoverValue === null
                    ? `${Math.round(hover.x)} m, ${Math.round(hover.y)} m: no value (building or outside)`
                    : `${Math.round(hover.x)} m, ${Math.round(hover.y)} m: ${
                        categorical && !diff
                          ? `${shown.legend?.[hoverValue]} (${LAWSON[shown.legend?.[hoverValue] ?? ''] ?? ''})`
                          : fmt(hoverValue, a.unit, diff)
                      }`
                : view === 'map'
                  ? 'Move over (or tap) the map to read a value.'
                  : 'Drag to turn, scroll or pinch to zoom.')}
        </div>
      </div>

      <div className="ex-info">
        <h3>{a.label}</h3>
        <p className="muted">{a.when}</p>
        {categorical && !diff ? (
          <ClassLegend labels={shown.legend ?? []} />
        ) : (
          <ContinuousLegend scale={scale} unit={a.unit} diff={diff} />
        )}
        {a.buildingsOnly && mode !== 'baseline' && (
          <p className="note">
            This model uses buildings only. The greener street changes trees and ground, not
            buildings, so the result is the same {diff ? '(no difference)' : 'as the baseline'}.
          </p>
        )}
        {diff && categorical && (
          <p className="note">Wind comfort classes have no difference map.</p>
        )}
        {stats && !categorical && !(diff && a.buildingsOnly) && (
          <ul className="stats" data-testid="stats">
            <StatsLine
              label={a.facades ? 'Walls on Linden Street' : 'Linden Street'}
              s={stats.street}
              a={a}
              diff={diff}
            />
            {!a.facades && <StatsLine label="Park" s={stats.park} a={a} diff={diff} />}
            <StatsLine
              label={a.facades ? 'All walls' : 'Whole site'}
              s={stats.all}
              a={a}
              diff={diff}
            />
          </ul>
        )}
        <p>{a.explain}</p>
        {diff && (
          <p className="muted">
            Difference = {VARIANT_INFO[compared].label.toLowerCase()} minus baseline.{' '}
            {VARIANT_INFO[compared].what}
          </p>
        )}
        <RunYourself
          key={`${analysisId}/${mode}`}
          analysis={a}
          variant={diff ? null : variant}
          onResult={(r) => setLive((l) => ({ ...l, [`${analysisId}/${variant}`]: r }))}
        />
      </div>
    </section>
  )
}
