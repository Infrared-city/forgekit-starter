// Pre-computes the demo explorer results (apps/examples/public/demo-results/).
//
//   npm run demo:precompute -- --preview            free: prints tiles and AItokens
//   npm run demo:precompute -- --run                runs what is missing (spends AItokens)
//   npm run demo:precompute -- --run --only utci --variant greener-street --force
//   npm run demo:precompute -- --refresh-manifest   copy units, ranges, texts from analyses.ts;
//                                                   warn when the scene changed since a run
//
// The API key comes from INFRARED_API_KEY (environment) or apps/base/api/.dev.vars.
// It is never written anywhere. INFRARED_BASE_URL selects another API (maintainers).
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { InfraredClient, initializeCore, VERSION } from '@infrared-city/infrared-sdk-ts'
import { ANALYSES, buildRequest, type DemoAnalysis } from '../src/demo/analyses.ts'
import { buildDemoScene, DEMO_POLYGON, VARIANTS, type Variant } from '../src/demo/scene.ts'
import { DEMO_CENTER } from '../src/demo/scene-layout.ts'
import { isSurfaceColumns, type PlainSurface, surfacesFromColumns } from '../src/lib/surfaces.ts'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../public/demo-results')
const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const value = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

function readKey(): { apiKey: string; baseUrl?: string } {
  const env: Record<string, string | undefined> = { ...process.env }
  const devVars = resolve(here, '../../base/api/.dev.vars')
  if (existsSync(devVars)) {
    for (const line of readFileSync(devVars, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (m?.[2] && !env[m[1]]) env[m[1]] = m[2]
    }
  }
  if (!env.INFRARED_API_KEY)
    throw new Error('Set INFRARED_API_KEY (environment or apps/base/api/.dev.vars)')
  return { apiKey: env.INFRARED_API_KEY, baseUrl: env.INFRARED_BASE_URL || undefined }
}

// ---- Compact storage ----------------------------------------------------------
// Ground grids: Uint16, value = min + q * step, q = 65535 means "no value".
// Class grids (wind comfort): Uint8 class index, 255 = "no value".
// Facades: small JSON. Everything gzip-compressed.

function encodeGrid(grid: ArrayLike<number>, legend?: readonly string[]) {
  if (legend) {
    const out = new Uint8Array(grid.length)
    for (let i = 0; i < grid.length; i++) out[i] = Number.isFinite(grid[i]) ? grid[i] : 255
    return { bytes: out, encoding: 'u8' as const }
  }
  let lo = Number.POSITIVE_INFINITY
  let hi = Number.NEGATIVE_INFINITY
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i]
    if (Number.isFinite(v)) {
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
  }
  const step = hi > lo ? (hi - lo) / 65534 : 1
  const out = new Uint16Array(grid.length)
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i]
    out[i] = Number.isFinite(v) ? Math.round((v - lo) / step) : 65535
  }
  return { bytes: new Uint8Array(out.buffer), encoding: 'u16' as const, offset: lo, step }
}

function encodeFacades(plain: Record<string, PlainSurface>) {
  const surfaces: Record<string, unknown> = {}
  for (const [key, s] of Object.entries(plain)) {
    surfaces[key] = {
      origin: s.origin.map((v) => Math.round(v * 1000) / 1000),
      uAxis: s.uAxis,
      vAxis: s.vAxis,
      gridSize: s.gridSize,
      nu: s.nu,
      nv: s.nv,
      values: s.values.map((v) => (v === null ? null : Math.round(v * 100) / 100)),
    }
  }
  return new TextEncoder().encode(JSON.stringify({ surfaces }))
}

// ---- Main ------------------------------------------------------------------------

const manifestPath = resolve(OUT, 'manifest.json')
type Entry = Record<string, unknown> & { analysis: string; variant: string }
const manifest: {
  sdkVersion: string
  center: typeof DEMO_CENTER
  polygon: typeof DEMO_POLYGON
  results: Entry[]
} = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : { sdkVersion: VERSION, center: DEMO_CENTER, polygon: DEMO_POLYGON, results: [] }

function save(entry: Entry) {
  manifest.results = manifest.results.filter(
    (e) => !(e.analysis === entry.analysis && e.variant === entry.variant),
  )
  manifest.results.push(entry)
  manifest.results.sort((a, b) =>
    `${a.analysis}/${a.variant}`.localeCompare(`${b.analysis}/${b.variant}`),
  )
  manifest.sdkVersion = VERSION
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

/**
 * A fingerprint of the scene inputs this analysis reads (wind: buildings only).
 * When it changes, the stored result is out of date.
 */
function sceneHash(a: DemoAnalysis, variant: Variant): string {
  const s = buildDemoScene(variant)
  const inputs = [
    s.buildings,
    a.uses.trees ? s.vegetation : null,
    a.uses.ground ? s.groundMaterials : null,
    a.uses.terrain ? s.groundGeometry : null,
  ]
  return createHash('sha256').update(JSON.stringify(inputs)).digest('hex').slice(0, 16)
}

/** Keep the manifest's descriptive fields in step with analyses.ts (no API call). */
function refreshManifest() {
  for (const e of manifest.results) {
    const a = ANALYSES.find((x) => x.id === e.analysis)
    if (a)
      Object.assign(e, {
        analysisType: a.analysisType,
        unit: a.unit,
        legendMin: a.min,
        legendMax: a.max,
        when: a.when,
      })
    if (!a) continue
    const hash = sceneHash(a, e.variant as Variant)
    e.sceneHash ??= hash
    if (e.sceneHash !== hash)
      console.log(`OUT OF DATE: ${e.file} (the scene changed; run it again)`)
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Updated ${manifest.results.length} manifest entries`)
}

async function main() {
  if (flag('refresh-manifest')) return refreshManifest()
  const { apiKey, baseUrl } = readKey()
  // Threaded core (Node 22+, SDK 0.13+): speeds up the facade (surface) merge.
  // 4 threads is the best measured setting; more is slower.
  await initializeCore({ threads: Math.min(4, availableParallelism()) })
  const client = new InfraredClient({ apiKey, ...(baseUrl ? { baseUrl } : {}) })
  mkdirSync(OUT, { recursive: true })
  const only = value('only')?.split(',')
  const variants = (value('variant') ? [value('variant')] : VARIANTS) as Variant[]
  const weatherCache = new Map<string, unknown[]>()
  const stations = await client.weather.getWeatherFileFromLocation(DEMO_CENTER.lat, DEMO_CENTER.lon)
  if (stations.length === 0) throw new Error('No weather station near the demo site')
  const weather = async (a: DemoAnalysis) => {
    if (!a.needsWeather || !a.period) return undefined
    const key = JSON.stringify(a.period)
    if (!weatherCache.has(key)) {
      weatherCache.set(
        key,
        await client.weather.filterWeatherData(stations[0].uuid, { period: a.period }),
      )
    }
    return weatherCache.get(key)
  }
  let total = 0
  for (const a of ANALYSES) {
    if (only && !only.includes(a.id)) continue
    for (const variant of variants) {
      // Wind models read buildings only: the variant has the same buildings.
      if (a.buildingsOnly && variant !== 'baseline') continue
      const file = `${a.id}.${variant}.${a.facades ? 'json' : 'bin'}.gz`
      if (flag('run') && !flag('force') && existsSync(resolve(OUT, file))) {
        console.log(`skip ${file} (exists; --force to redo)`)
        continue
      }
      const scene = buildDemoScene(variant)
      const { input, options } = buildRequest(a, scene, await weather(a))
      const cost = a.facades
        ? await client.previewAreaBatches(input, DEMO_POLYGON, options)
        : await client.previewAreaWithPricing(DEMO_POLYGON, { analysisType: a.analysisType })
      const tokens = cost.estimatedCostTokens
      total += tokens
      console.log(`${a.id} / ${variant}: about ${tokens} AItokens`, JSON.stringify(cost))
      if (!flag('run')) continue
      const started = Date.now()
      const result = await client.runAreaAndWait(input, DEMO_POLYGON, {
        ...options,
        onProgress: (s) => process.stdout.write(`\r  ${s.completedCount}/${s.totalCount} done   `),
      })
      process.stdout.write('\n')
      const base = {
        analysis: a.id,
        variant,
        file,
        analysisType: a.analysisType,
        unit: a.unit,
        legendMin: a.min,
        legendMax: a.max,
        when: a.when,
        sdkVersion: VERSION,
        date: new Date().toISOString().slice(0, 10),
        estimatedTokens: tokens,
        seconds: Math.round((Date.now() - started) / 1000),
        sceneHash: sceneHash(a, variant),
      }
      if (isSurfaceColumns(result)) {
        const plain = surfacesFromColumns(result)
        writeFileSync(resolve(OUT, file), gzipSync(encodeFacades(plain), { level: 9 }))
        save({
          ...base,
          kind: 'facades',
          surfaceCount: result.surfaceCount,
          sensorCount: result.sensorCount,
        })
      } else {
        if (result.failedJobs.length) throw new Error(`${result.failedJobs.length} tile(s) failed`)
        const enc = encodeGrid(result.mergedGrid, result.legend)
        writeFileSync(resolve(OUT, file), gzipSync(enc.bytes, { level: 9 }))
        const { bytes: _b, ...encoding } = enc
        save({
          ...base,
          kind: 'grid',
          rows: result.gridShape[0],
          cols: result.gridShape[1],
          bounds: result.bounds,
          ...encoding,
          legend: result.legend,
        })
      }
      console.log(`  wrote ${file}`)
    }
  }
  console.log(
    `Total: about ${total} AItokens${flag('run') ? '' : ' (preview only, nothing submitted)'}`,
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? `${err.name}: ${err.message}` : err)
  process.exit(1)
})
