// Example 4 — "Which facades get sun?"
// Analysis: direct-sun-hours with `analysisSurfaces: 'all'`. The sensors
// sit on the building walls and roofs, not on the ground. Billing is per building batch
// (use previewAreaBatches, not previewArea, to price it).
import type { SurfaceColumns } from '@infrared-city/infrared-sdk-ts'
import { useMemo, useState } from 'react'
import { FacadeScene } from '../components/FacadeScene'
import { Legend } from '../components/Legend'
import { MapView } from '../components/MapView'
import { PlacePicker } from '../components/PlacePicker'
import { type LatLon, squareAround } from '../lib/geo'
import { errorText, getClient } from '../lib/infrared'
import { isSurfaceColumns } from '../lib/surfaces'

const SCALE = { min: 0, max: 11, unit: 'sun hours on 21 June, 8-18 h' }

export function FacadeView() {
  const [center, setCenter] = useState<LatLon>({ lat: 48.2167, lon: 16.3959 })
  const polygon = useMemo(() => squareAround(center, 512), [center])
  const [status, setStatus] = useState('Pick a place, check the cost, then run.')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<SurfaceColumns | null>(null)

  const input = useMemo(
    () => ({
      analysisType: 'direct-sun-hours',
      analysisSurfaces: 'all',
      latitude: center.lat,
      longitude: center.lon,
      dateFilters: {
        period: { start: { month: 6, day: 21, hour: 8 }, end: { month: 6, day: 21, hour: 18 } },
      },
    }),
    [center],
  )

  async function withClient(work: (c: Awaited<ReturnType<typeof getClient>>) => Promise<void>) {
    setBusy(true)
    try {
      await work(await getClient())
    } catch (err) {
      setStatus(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  const checkCost = () =>
    withClient(async (client) => {
      setStatus('Reading buildings...')
      const buildings = await client.buildings.getBuildingsInArea(polygon)
      const p = await client.previewAreaBatches(input, polygon, { buildings })
      setStatus(
        `${p.plannedJobCount} job(s), about ${p.estimatedCostTokens} AItokens, ${p.sensorCount} sensors.`,
      )
    })

  const run = () =>
    withClient(async (client) => {
      setResult(null)
      setStatus('Reading buildings and trees...')
      const buildings = await client.buildings.getBuildingsInArea(polygon)
      const vegetation = await client.vegetation.getArea(polygon)
      const r = await client.runAreaAndWait(input, polygon, {
        buildings,
        vegetation,
        onProgress: (s) => setStatus(`Running: ${s.completedCount} of ${s.totalCount} job(s) done`),
      })
      if (!isSurfaceColumns(r)) throw new Error('Expected a facade (surface) result')
      setResult(r)
      setStatus(`Done: ${r.surfaceCount} surfaces, ${r.sensorCount} sensors.`)
    })

  return (
    <section className="example">
      <div className="panel">
        <h2>Facade view</h2>
        <p>
          Direct sun hours on every building wall and roof in a 512 m square. Drag to orbit the 3D
          view.
        </p>
        <PlacePicker onPlace={setCenter} disabled={busy} />
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
        <Legend scale={SCALE} />
      </div>
      {result ? (
        <FacadeScene result={result} scale={SCALE} />
      ) : (
        <MapView center={center} area={polygon} onPick={setCenter} />
      )}
    </section>
  )
}
