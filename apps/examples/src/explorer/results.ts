// Loads the pre-computed demo results from public/demo-results/ (no key, no
// network other than this site). See scripts/precompute-demo.ts for the format.
import { type AnalysisId, analysisById } from '../demo/analyses'
import type { Variant } from '../demo/scene'
import { MAIN_STREET, PARKING_LOT, SCENE_SIZE_M } from '../demo/scene-layout'

export interface ManifestEntry {
  analysis: AnalysisId
  variant: Variant
  file: string
  kind: 'grid' | 'facades'
  analysisType: string
  unit: string
  when: string
  sdkVersion: string
  date: string
  estimatedTokens: number
  rows?: number
  cols?: number
  encoding?: 'u16' | 'u8'
  offset?: number
  step?: number
  legend?: string[]
}
export interface Manifest {
  sdkVersion: string
  results: ManifestEntry[]
}

export interface GridResult {
  kind: 'grid'
  rows: number
  cols: number
  values: Float32Array
  /** Class names for categorical results (wind comfort): value i = legend[i]. */
  legend?: string[]
}
export interface Surface {
  readonly origin: readonly number[]
  readonly uAxis: readonly number[]
  readonly vAxis: readonly number[]
  readonly gridSize: number
  readonly nu: number
  readonly nv: number
  readonly values: ReadonlyArray<number | null>
}
export interface FacadeResult {
  kind: 'facades'
  surfaces: Record<string, Surface>
}
export type DemoResult = GridResult | FacadeResult

/** A roof: a horizontal surface grid (both axes flat). Walls have a vertical axis. */
export const isRoof = (s: Surface) => Math.abs(s.uAxis[2]) < 0.01 && Math.abs(s.vAxis[2]) < 0.01

const BASE = `${import.meta.env.BASE_URL}demo-results/`

let manifest: Promise<Manifest> | undefined
export function loadManifest(): Promise<Manifest> {
  manifest ??= fetch(`${BASE}manifest.json`).then((r) => {
    if (!r.ok) throw new Error(`No demo results (HTTP ${r.status})`)
    return r.json() as Promise<Manifest>
  })
  return manifest
}

/** Bytes of a .gz file. Some servers already un-gzip it: check the magic bytes. */
async function gunzip(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not load ${url} (HTTP ${res.status})`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export function decodeGrid(e: ManifestEntry, raw: Uint8Array): GridResult {
  const rows = e.rows ?? 0
  const cols = e.cols ?? 0
  const values = new Float32Array(rows * cols)
  if (e.encoding === 'u8') {
    for (let i = 0; i < values.length; i++) values[i] = raw[i] === 255 ? Number.NaN : raw[i]
  } else {
    const q = new Uint16Array(raw.buffer, raw.byteOffset, values.length)
    const offset = e.offset ?? 0
    const step = e.step ?? 1
    for (let i = 0; i < values.length; i++)
      values[i] = q[i] === 65535 ? Number.NaN : offset + q[i] * step
  }
  return { kind: 'grid', rows, cols, values, legend: e.legend }
}

const cache = new Map<string, Promise<DemoResult>>()

/** One result. A variant that the manifest does not have falls back to baseline. */
export async function loadResult(analysis: AnalysisId, variant: Variant): Promise<DemoResult> {
  const m = await loadManifest()
  const e =
    m.results.find((r) => r.analysis === analysis && r.variant === variant) ??
    m.results.find((r) => r.analysis === analysis && r.variant === 'baseline')
  if (!e) throw new Error(`No pre-computed result for ${analysis}`)
  const key = e.file
  const days = analysisById(analysis).perDay ?? 1
  if (!cache.has(key)) {
    cache.set(
      key,
      gunzip(BASE + e.file).then((raw) =>
        perDay(
          e.kind === 'facades'
            ? ({ kind: 'facades', ...JSON.parse(new TextDecoder().decode(raw)) } as FacadeResult)
            : decodeGrid(e, raw),
          days,
        ),
      ),
    )
  }
  return cache.get(key) as Promise<DemoResult>
}

/** Totals over a period of `days` days -> a mean per day. */
export function perDay(r: DemoResult, days: number): DemoResult {
  if (days === 1) return r
  if (r.kind === 'grid') return { ...r, values: r.values.map((v) => v / days) }
  const surfaces: Record<string, Surface> = {}
  for (const [k, s] of Object.entries(r.surfaces))
    surfaces[k] = { ...s, values: s.values.map((v) => (v === null ? null : v / days)) }
  return { kind: 'facades', surfaces }
}

/** variant - baseline, cell by cell (NaN where either has no value). */
export function difference(base: DemoResult, variant: DemoResult): DemoResult {
  if (base.kind === 'grid' && variant.kind === 'grid') {
    const values = new Float32Array(base.values.length)
    for (let i = 0; i < values.length; i++) values[i] = variant.values[i] - base.values[i]
    return { kind: 'grid', rows: base.rows, cols: base.cols, values }
  }
  if (base.kind === 'facades' && variant.kind === 'facades') {
    const surfaces: Record<string, Surface> = {}
    for (const [key, s] of Object.entries(base.surfaces)) {
      const v = variant.surfaces[key]
      if (!v || v.values.length !== s.values.length) continue
      surfaces[key] = {
        ...s,
        values: s.values.map((b, i) =>
          b === null || v.values[i] === null ? null : (v.values[i] as number) - b,
        ),
      }
    }
    return { kind: 'facades', surfaces }
  }
  throw new Error('Cannot compare a grid with a facade result')
}

export interface Stats {
  mean: number
  min: number
  max: number
}
function stats(values: Iterable<number | null>): Stats {
  let sum = 0
  let n = 0
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const v of values) {
    if (v === null || Number.isNaN(v)) continue
    sum += v
    n++
    min = Math.min(min, v)
    max = Math.max(max, v)
  }
  return { mean: n ? sum / n : Number.NaN, min, max }
}

/** Statistics for the whole square, Linden Street and the car park (both greened), and the park. */
export function regionStats(
  r: DemoResult,
): Record<'all' | 'street' | 'park' | 'lot' | 'roofs', Stats> {
  if (r.kind === 'facades') {
    // Walls only: roofs (sun almost all day) would hide the differences between walls.
    const all = Object.values(r.surfaces)
      .filter((s) => !isRoof(s))
      .flatMap((s) => s.values)
    // Walls that face Linden Street: in the planes x = 108 and x = 140.
    const facesStreet = (s: Surface) =>
      Math.abs(s.uAxis[0]) < 0.01 &&
      Math.abs(s.vAxis[0]) < 0.01 &&
      [MAIN_STREET.x0 - 4, MAIN_STREET.x1 + 4].some((x) => Math.abs(s.origin[0] - x) < 1)
    const street = Object.values(r.surfaces)
      .filter(facesStreet)
      .flatMap((s) => s.values)
    const roofs = Object.values(r.surfaces)
      .filter(isRoof)
      .flatMap((s) => s.values)
    return {
      all: stats(all),
      street: stats(street),
      park: stats([]),
      lot: stats([]),
      roofs: stats(roofs),
    }
  }
  const cell = SCENE_SIZE_M / r.cols
  const pick = (test: (x: number, y: number) => boolean) => {
    const out: number[] = []
    for (let row = 0; row < r.rows; row++) {
      for (let c = 0; c < r.cols; c++)
        if (test((c + 0.5) * cell, (row + 0.5) * cell)) out.push(r.values[row * r.cols + c])
    }
    return out
  }
  const [lx0, ly0, lx1, ly1] = PARKING_LOT
  const inLot = (x: number, y: number) => x >= lx0 && x < lx1 && y >= ly0 && y < ly1
  return {
    all: stats(r.values),
    street: stats(pick((x) => x >= MAIN_STREET.x0 && x < MAIN_STREET.x1)),
    park: stats(pick((x, y) => x >= 256 && !inLot(x, y))),
    lot: stats(pick(inLot)),
    roofs: stats([]),
  }
}
