/**
 * Pure stats/geometry helpers shared by the point-radius and polygon sample
 * walks (`sampling.ts`). Both sampling paths MUST produce identical result
 * shapes, so the summarisers live in exactly one place.
 *
 * Framework-agnostic — no React / Zustand / DOM imports (this is `core/`).
 */

import type { CategoricalSampleResult, SampleResult, SampleStats } from './sampling'

export const HIST_BINS = 12

export function summariseNumeric(values: number[]): SampleResult {
  const sorted = [...values].sort((a, b) => a - b)
  let sum = 0
  for (const v of values) sum += v
  const min = sorted[0] ?? 0
  const max = sorted[sorted.length - 1] ?? 0
  const stats: SampleStats = {
    count: values.length,
    mean: sum / values.length,
    min,
    max,
    p25: quantile(sorted, 0.25),
    p50: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
  }
  const hist = buildHistogram(values, min, max)
  return { kind: 'numeric', stats, histogram: hist.bins, histRange: hist.range }
}

export const EMPTY_NUMERIC_SAMPLE: SampleResult = {
  kind: 'numeric',
  stats: { count: 0, mean: 0, min: 0, max: 0, p25: 0, p50: 0, p75: 0 },
  histogram: [],
  histRange: [0, 0],
}

export function summariseCategorical(values: string[]): CategoricalSampleResult {
  const breakdown: Record<string, number> = {}
  for (const v of values) breakdown[v] = (breakdown[v] ?? 0) + 1
  let modeCategory: string | null = null
  let modeCount = -1
  for (const [k, v] of Object.entries(breakdown)) {
    if (v > modeCount) {
      modeCategory = k
      modeCount = v
    }
  }
  return { kind: 'categorical', count: values.length, breakdown, modeCategory }
}

export function buildHistogram(
  values: number[],
  lo: number,
  hi: number,
): { bins: number[]; range: [number, number] } {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || values.length === 0) {
    return { bins: [], range: [0, 0] }
  }
  const top = hi > lo ? hi : lo + 1e-6
  const span = top - lo
  const bins = new Array<number>(HIST_BINS).fill(0)
  for (const v of values) {
    let i = Math.floor(((v - lo) / span) * HIST_BINS)
    if (i < 0) i = 0
    else if (i >= HIST_BINS) i = HIST_BINS - 1
    bins[i]++
  }
  return { bins, range: [lo, top] }
}

export function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0
  const idx = Math.max(0, Math.min(sortedAsc.length - 1, Math.floor(q * sortedAsc.length)))
  return sortedAsc[idx] ?? 0
}

// Haversine in metres — adequate for the small bbox sizes we deal with.
const EARTH_RADIUS_M = 6_371_000

export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const dφ = ((lat2 - lat1) * Math.PI) / 180
  const dλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}
