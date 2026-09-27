// "Run it yourself": send the same demo request to Infrared with the live SDK.
// Optional. It needs the Worker (`npm run dev`) with your key in
// apps/base/api/.dev.vars. Nothing runs on page load; the cost check is free.
import type { RunAreaAndWaitOptions, RunAreaInput } from '@infrared-city/infrared-sdk-ts'
import { useState } from 'react'
import { buildRequest, type DemoAnalysis } from '../demo/analyses'
import { buildDemoScene, DEMO_POLYGON, type Variant } from '../demo/scene'
import { DEMO_CENTER } from '../demo/scene-layout'
import { errorText, getClient } from '../lib/infrared'
import { type DemoResult, perDay } from './results'

interface Props {
  analysis: DemoAnalysis
  variant: Variant | null
  onResult: (r: DemoResult) => void
}

async function prepare(analysis: DemoAnalysis, variant: Variant, say: (s: string) => void) {
  const client = await getClient()
  const scene = buildDemoScene(variant)
  let weatherData: unknown[] | undefined
  if (analysis.needsWeather && analysis.period) {
    say('Reading the nearest weather station...')
    const stations = await client.weather.getWeatherFileFromLocation(
      DEMO_CENTER.lat,
      DEMO_CENTER.lon,
    )
    if (stations.length === 0) throw new Error('No weather station within 100 km')
    weatherData = await client.weather.filterWeatherData(stations[0].uuid, {
      period: analysis.period,
    })
  }
  const { input, options } = buildRequest(analysis, scene, weatherData)
  return { client, input: input as RunAreaInput, options: options as RunAreaAndWaitOptions }
}

export function RunYourself({ analysis, variant, onResult }: Props) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function work(run: boolean) {
    if (!variant) return
    setBusy(true)
    try {
      const { client, input, options } = await prepare(analysis, variant, setStatus)
      if (!run) {
        const p = analysis.facades
          ? await client.previewAreaBatches(input, DEMO_POLYGON, options)
          : await client.previewAreaWithPricing(DEMO_POLYGON, {
              analysisType: analysis.analysisType,
            })
        const live =
          'pricingSource' in p && p.pricingSource !== 'remote'
            ? ' (offline estimate: the Worker did not answer; check the App password)'
            : ''
        setStatus(`About ${p.estimatedCostTokens} AItokens${live}. Nothing was submitted.`)
        return
      }
      setStatus('Submitting...')
      const r = await client.runAreaAndWait(input, DEMO_POLYGON, {
        ...options,
        onProgress: (s) => setStatus(`Running: ${s.completedCount} of ${s.totalCount} done`),
      })
      if ('surfaces' in r) {
        const surfaces = Object.fromEntries(
          Object.entries(r.surfaces).map(([k, s]) => [
            k,
            {
              ...s,
              values: Array.from(s.values, (v) => (v === null || Number.isNaN(v) ? null : v)),
            },
          ]),
        )
        onResult(perDay({ kind: 'facades', surfaces }, analysis.perDay ?? 1))
      } else {
        const [rows, cols] = r.gridShape
        const grid: DemoResult = {
          kind: 'grid',
          rows,
          cols,
          values: Float32Array.from(r.mergedGrid),
          legend: r.legend ? [...r.legend] : undefined,
        }
        onResult(perDay(grid, analysis.perDay ?? 1))
      }
      setStatus('Done. The map now shows your live result.')
    } catch (err) {
      setStatus(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="run-yourself">
      <summary>Run it yourself (live SDK)</summary>
      <p>
        Sends this exact scene to Infrared and shows your own result. You need{' '}
        <code>npm run dev</code> with your API key in <code>apps/base/api/.dev.vars</code>. A run
        spends AItokens: check the cost first (free).
      </p>
      {variant ? (
        <div className="buttons">
          <button type="button" onClick={() => work(false)} disabled={busy}>
            1. Check cost
          </button>
          <button type="button" className="primary" onClick={() => work(true)} disabled={busy}>
            2. Run (spends AItokens)
          </button>
        </div>
      ) : (
        <p className="muted">Pick Baseline or Greener first.</p>
      )}
      {status && (
        <p className="status" data-testid="run-status">
          {status}
        </p>
      )}
    </details>
  )
}
