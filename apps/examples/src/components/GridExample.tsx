// Shared page for every "result on the ground" example:
// pick a place -> check the cost -> run -> show the grid on the map.
import type {
  AnalysesName,
  InfraredClient,
  RunAreaAndWaitOptions,
  RunAreaInput,
} from '@infrared-city/infrared-sdk-ts'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { gridToDataUrl, meanOf, type Scale } from '../lib/colors'
import { type LatLon, type Polygon, squareAround } from '../lib/geo'
import { errorText, getClient } from '../lib/infrared'
import { Legend } from './Legend'
import { MapView, type Overlay } from './MapView'
import { PlacePicker } from './PlacePicker'

export interface Prepared {
  input: RunAreaInput
  options?: RunAreaAndWaitOptions
}

export interface GridExampleProps {
  title: string
  intro: ReactNode
  analysisType: AnalysesName
  scale: Scale
  start: LatLon
  /** Build the request: read buildings, trees, weather... `say` shows progress. */
  prepare: (
    client: InfraredClient,
    ctx: { center: LatLon; polygon: Polygon; say: (s: string) => void },
  ) => Promise<Prepared>
  /** Extra inputs for this example (date, wind direction, ...). */
  controls?: ReactNode
}

export function GridExample(props: GridExampleProps) {
  const [center, setCenter] = useState<LatLon>(props.start)
  const [sizeM, setSizeM] = useState(512)
  const polygon = useMemo(() => squareAround(center, sizeM), [center, sizeM])
  const [status, setStatus] = useState('Pick a place, check the cost, then run.')
  const [busy, setBusy] = useState(false)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [mean, setMean] = useState<number | null>(null)

  const [classes, setClasses] = useState<readonly string[] | null>(null)

  // A new analysis type makes the old picture wrong: clear it.
  useEffect(() => {
    setOverlay(null)
    setMean(null)
    setClasses(null)
  }, [props.analysisType])

  const pick = (p: LatLon) => {
    setCenter(p)
    setOverlay(null)
    setMean(null)
  }

  async function checkCost() {
    setBusy(true)
    try {
      const client = await getClient()
      const p = await client.previewAreaWithPricing(polygon, { analysisType: props.analysisType })
      // pricingSource 'fallback' = the Worker did not answer (wrong app
      // password, Worker not running): the number is only an offline guess.
      const source =
        p.pricingSource === 'remote'
          ? 'live price'
          : 'offline estimate: the Worker refused or did not answer. Check the app password, or set APP_PASSWORD on the Worker'
      setStatus(
        `${p.tileCount} tile(s), about ${p.estimatedCostTokens} AItokens (${source}), about ${p.estimatedTimeS} s.`,
      )
    } catch (err) {
      setStatus(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  async function run() {
    setBusy(true)
    setOverlay(null)
    setMean(null)
    try {
      const client = await getClient()
      const { input, options } = await props.prepare(client, { center, polygon, say: setStatus })
      setStatus('Submitting the analysis...')
      const result = await client.runAreaAndWait(input, polygon, {
        ...options,
        onProgress: (s) =>
          setStatus(`Running: ${s.completedCount} of ${s.totalCount} tile(s) done`),
      })
      if (!('mergedGrid' in result)) throw new Error('Expected a ground grid result')
      const [rows, cols] = result.gridShape
      if (!result.bounds) throw new Error('The result has no bounds')
      // Categorical results (wind comfort) carry `legend`: cell value i means legend[i].
      const scale = result.legend
        ? { min: 0, max: Math.max(1, result.legend.length - 1), unit: props.scale.unit }
        : props.scale
      setOverlay({
        url: gridToDataUrl(result.mergedGrid, rows, cols, scale),
        bounds: result.bounds,
      })
      setClasses(result.legend ?? null)
      setMean(result.legend ? null : meanOf(result.mergedGrid))
      const failed = result.failedJobs.length
      setStatus(failed ? `Done, but ${failed} tile(s) failed.` : 'Done.')
    } catch (err) {
      setStatus(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="example">
      <div className="panel">
        <h2>{props.title}</h2>
        <div className="intro">{props.intro}</div>
        <PlacePicker onPlace={pick} disabled={busy} />
        <label>
          Area size{' '}
          <select
            value={sizeM}
            onChange={(e) => {
              setSizeM(Number(e.target.value))
              setOverlay(null)
            }}
            disabled={busy}
          >
            <option value={256}>256 m (one wind tile)</option>
            <option value={512}>512 m (one solar tile)</option>
            <option value={1024}>1024 m (more tiles, more tokens)</option>
          </select>
        </label>
        {props.controls}
        <div className="buttons">
          <button type="button" onClick={checkCost} disabled={busy}>
            1. Check cost
          </button>
          <button type="button" className="primary" onClick={run} disabled={busy}>
            2. Run (spends AItokens)
          </button>
        </div>
        <p className="status" data-testid="status">
          {status}
        </p>
        {mean !== null && (
          <p data-testid="mean">
            Mean: {mean.toFixed(1)} {props.scale.unit}
          </p>
        )}
        {classes ? (
          <p data-testid="classes">Classes, low to high: {classes.join(', ')}</p>
        ) : (
          <Legend scale={props.scale} />
        )}
      </div>
      <MapView center={center} area={polygon} overlay={overlay} onPick={pick} />
    </section>
  )
}
