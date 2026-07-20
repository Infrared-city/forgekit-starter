import { describe, expect, it } from 'vitest'
import type { AreaRunResult } from '../core/analysis.types'
import { sampleGrid } from '../core/sampling'

// 4x4 grid, cell value = row index. Row 0 = SOUTH (per the orientation
// invariant in sampling.ts). Bounds are a 1°x1° box at the origin.
const grid = {
  analysisType: 'test',
  gridShape: [4, 4],
  gridBounds: { west: 0, south: 0, east: 1, north: 1 },
  mergedGrid: [
    [0, 0, 0, 0], // south row
    [1, 1, 1, 1],
    [2, 2, 2, 2],
    [3, 3, 3, 3], // north row
  ],
  polygon: { type: 'Polygon', coordinates: [] },
  failedJobs: [],
  skippedJobs: [],
  totalJobs: 16,
  succeededJobs: 16,
} as unknown as AreaRunResult

describe('sampleGrid', () => {
  it('site scope averages the whole grid', () => {
    const r = sampleGrid(grid, { kind: 'site' })
    expect(r?.kind).toBe('numeric')
    if (r?.kind === 'numeric') expect(r.stats.mean).toBeCloseTo(1.5)
  })

  it('point near the south edge reads low rows, not the mirrored north', () => {
    const r = sampleGrid(grid, { kind: 'point', lon: 0.5, lat: 0.1, radiusM: 1 })
    expect(r?.kind).toBe('numeric')
    if (r?.kind === 'numeric') expect(r.stats.mean).toBeLessThan(1.5)
  })

  it('polygon over the north half reads high rows', () => {
    const ring: [number, number][] = [
      [0, 0.55],
      [1, 0.55],
      [1, 1],
      [0, 1],
      [0, 0.55],
    ]
    const r = sampleGrid(grid, { kind: 'polygon', ring })
    expect(r?.kind).toBe('numeric')
    if (r?.kind === 'numeric') expect(r.stats.mean).toBeGreaterThan(2)
  })

  it('returns null for a point outside the grid bounds', () => {
    const r = sampleGrid(grid, { kind: 'point', lon: 5, lat: 5 })
    expect(r).toBeNull()
  })

  it('samples an in-bounds point with radiusM omitted (defaults to SAMPLE_RADIUS_M)', () => {
    // No radiusM supplied — sampleGrid falls back to SAMPLE_RADIUS_M rather than
    // passing undefined through to the radius math. Locks in the default-radius
    // path now that it's reachable from non-client callers (e.g. the Worker).
    const r = sampleGrid(grid, { kind: 'point', lon: 0.5, lat: 0.5 })
    expect(r?.kind).toBe('numeric')
    if (r?.kind === 'numeric') expect(r.stats.count).toBeGreaterThan(0)
  })
})
