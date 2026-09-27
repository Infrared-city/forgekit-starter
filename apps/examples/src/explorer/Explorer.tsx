// The demo explorer: every analysis on one synthetic 512 m scene, pre-computed,
// so it works offline without a key. Pick an analysis, then Baseline, Greener
// (greener street and car park), or the Difference (greener minus baseline).
import { useEffect, useMemo, useState } from 'react'
import {
  ANALYSES,
  type AnalysisId,
  analysisById,
  type DemoAnalysis,
  WINTER_OF,
} from '../demo/analyses'
import { buildDemoScene, type DemoScene, VARIANT_INFO, VARIANTS, type Variant } from '../demo/scene'
import { AnalysisPicker } from './AnalysisPicker'
import { notesFor } from './annotations'
import { type ColorScale, colorOf } from './colors'
import { ClassLegend, ContinuousLegend, classColor, LAWSON } from './Legend'
import { buildingMeans, colorCanvas, valueAt } from './layers'
import { type MapTip, PlanMap, type Probe } from './PlanMap'
import { RunYourself } from './RunYourself'
import { type DemoResult, difference, loadResult, regionStats } from './results'
import { Scene3D } from './Scene3D'
import { fmt, StatsLine, StatsTable } from './StatsLine'
import './explorer.css'
import './panel.css'
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
  // `value` is set in 3D when the mouse is on a wall or roof cell.
  const [hover, setHover] = useState<{ x: number; y: number; value?: number } | null>(null)
  const [probes, setProbes] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [showNotes, setShowNotes] = useState(true)
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
  const means = useMemo(
    () => (shown?.kind === 'facades' ? buildingMeans(shown, 'walls') : null),
    [shown],
  )
  const images = useMemo(() => {
    const layer = shown ? colorCanvas(shown, scale) : null
    const roofs = shown?.kind === 'facades' ? buildingMeans(shown, 'roofs') : null
    const roofColor = (id: string) => {
      const v = roofs?.get(id)
      if (v === undefined || Number.isNaN(v)) return null
      const [r, g, b] = colorOf(scale, v).map(Math.round)
      return `rgb(${r},${g},${b})`
    }
    return {
      plan: planCanvas(scene, layer, { roofColor: roofs ? roofColor : undefined }).toDataURL(),
      ground: planCanvas(scene, layer, { trees: false }),
    }
  }, [shown, means, scene, scale.ramp, scale.min, scale.max]) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = shown ? regionStats(shown) : null
  const diff = mode === 'diff'
  const hoverValue =
    hover?.value ?? (hover && shown ? valueAt(shown, scene, hover.x, hover.y) : null)
  const rgb = (c: ArrayLike<number>) =>
    `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
  /** The value at (x, y) of the layer on screen, as tooltip text and colour. */
  const tipAt = (x: number, y: number): MapTip | null => {
    const v = shown ? valueAt(shown, scene, x, y) : null
    if (!shown || v === null || (diff && a.buildingsOnly)) return null
    const cls = categorical && !diff ? (shown.legend?.[v] ?? '') : null
    return cls !== null
      ? { text: `${cls} ${LAWSON[cls] ?? ''}`.trim(), color: rgb(classColor(cls)) }
      : { text: fmt(v, a.unit, diff), color: rgb(colorOf(scale, v)) }
  }
  const tip =
    hover?.value !== undefined
      ? { text: fmt(hover.value, a.unit, diff), color: rgb(colorOf(scale, hover.value)) }
      : hover
        ? tipAt(hover.x, hover.y)
        : null
  const probeTips: Probe[] = probes.map((p) => ({ ...p, tip: tipAt(p.x, p.y) }))
  const notes = useMemo(
    () =>
      shown && !(diff && a.buildingsOnly)
        ? notesFor(analysisId, shown, scene, { diff, categorical: !!categorical, means, variant })
        : [],
    [shown, scene, analysisId, diff, categorical, means, a, variant],
  )
  // Memoised: the 3D view rebuilds its labels only when the pins change, not on hover
  // (tipAt reads shown, scene and scale, so they are in the list).
  const noteTips = useMemo(
    () =>
      showNotes
        ? notes.map((n) => ({
            ...n,
            tip:
              n.value === undefined
                ? tipAt(n.x, n.y)
                : { text: fmt(n.value, a.unit, diff), color: rgb(colorOf(scale, n.value)) },
          }))
        : [],
    [notes, showNotes, shown, scene, scale.ramp, scale.min, scale.max],
  )

  return (
    <section className="explorer">
      <div className="ex-controls">
        <h2>Demo explorer</h2>
        <p className="muted">
          A made-up 512 m site: city blocks on the left, a park with a lake and a hill on the right.
          Every result is pre-computed with the Infrared SDK, so this page needs no key.
        </p>
        <AnalysisPicker
          analyses={pickableAnalyses}
          value={summerBase ?? analysisId}
          onChange={(id) => set({ a: id })}
        />
        {(winterTwin || summerBase) && (
          <fieldset className="segmented small" aria-label="Leaf state">
            <button
              type="button"
              className={leaf === 'summer' ? 'on' : ''}
              aria-pressed={leaf === 'summer'}
              onClick={() => summerBase && set({ a: summerBase })}
            >
              Leaves on
            </button>
            <button
              type="button"
              className={leaf === 'winter' ? 'on' : ''}
              aria-pressed={leaf === 'winter'}
              onClick={() => winterTwin && set({ a: winterTwin })}
            >
              Leaves off
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
        <label className="notes-toggle">
          <input
            type="checkbox"
            checked={showNotes}
            onChange={(e) => setShowNotes(e.target.checked)}
          />{' '}
          Notes
        </label>
        {view === 'map' ? (
          <PlanMap
            image={images.plan}
            onHover={setHover}
            tip={tip}
            probes={probeTips}
            onPick={(p) => setProbes((ps) => [...ps.slice(-4), { id: Date.now(), ...p }])}
            onRemoveProbe={(id) => setProbes((ps) => ps.filter((p) => p.id !== id))}
            notes={noteTips}
          />
        ) : (
          <Scene3D
            scene={scene}
            ground={images.ground}
            facades={shown?.kind === 'facades' ? { result: shown, scale } : null}
            notes={noteTips}
            onHover={setHover}
            tip={tip}
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
                  ? 'Move over the map to read a value. Click to pin a probe (up to 5).'
                  : 'Move over the scene to read a value. Drag to turn, scroll to zoom.')}
        </div>
      </div>

      <div className="ex-info">
        <header className="ex-head">
          <h3>{a.label}</h3>
          <p className="when">{a.when}</p>
        </header>
        {categorical && !diff ? (
          <ClassLegend labels={shown.legend ?? []} />
        ) : (
          <ContinuousLegend scale={scale} unit={a.unit} diff={diff} />
        )}
        {a.buildingsOnly && mode !== 'baseline' && (
          <p className="note">
            This model uses buildings only. The greener variant changes trees and ground, not
            buildings, so the result is the same {diff ? '(no difference)' : 'as the baseline'}.
          </p>
        )}
        {diff && categorical && (
          <p className="note">Wind comfort classes have no difference map.</p>
        )}
        {stats && !categorical && !(diff && a.buildingsOnly) && (
          <StatsTable unit={a.unit} diff={diff}>
            <StatsLine
              label={a.facades ? 'Walls on Linden St.' : 'Linden Street'}
              s={stats.street}
              a={a}
              diff={diff}
            />
            <StatsLine label="Car park" s={stats.lot} a={a} diff={diff} />
            <StatsLine label="Park" s={stats.park} a={a} diff={diff} />
            <StatsLine label="Roofs" s={stats.roofs} a={a} diff={diff} />
            <StatsLine
              label={a.facades ? 'All walls' : 'Whole site'}
              s={stats.all}
              a={a}
              diff={diff}
            />
          </StatsTable>
        )}
        <p className="explain">{a.explain}</p>
        {diff && (
          <p className="callout">
            <b>Difference</b> = {VARIANT_INFO[compared].label.toLowerCase()} minus baseline.{' '}
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
