// ABOUTME: Verifies multi-metric severity ranking: normalization, alignment, combining, regions.
// ABOUTME: Guards direction handling and partial-coverage warnings for rank_hotspots.

import { describe, expect, it } from 'vitest'
import type { NumericResultGrid } from '../core/grid-alignment'
import { rankSeverityHotspots } from '../core/grid-severity'

const BOUNDS = { west: 16.0, south: 48.0, east: 16.01, north: 48.01 }

/** 6x6 grid whose values rise toward the north-east corner. */
function gradientGrid(scale = 1): NumericResultGrid {
  const mergedGrid = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => (row + col) * scale),
  )
  return { mergedGrid, gridShape: [6, 6], gridBounds: { ...BOUNDS } }
}

/** 6x6 grid whose values rise toward the south-west corner. */
function inverseGradientGrid(): NumericResultGrid {
  const mergedGrid = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => (10 - row - col) * 3),
  )
  return { mergedGrid, gridShape: [6, 6], gridBounds: { ...BOUNDS } }
}

describe('rankSeverityHotspots', () => {
  it('ranks the shared worst corner across metrics with different units and directions', () => {
    const result = rankSeverityHotspots(
      [
        { id: 'heat', grid: gradientGrid(1), direction: 'higher-is-worse' },
        // Same spatial pattern but inverted values + lower-is-worse → same corner is worst.
        { id: 'comfort', grid: inverseGradientGrid(), direction: 'lower-is-worse' },
      ],
      { topShare: 0.2, minCells: 1 },
    )

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.regions.length).toBeGreaterThan(0)
    const top = result.regions[0]
    // NE corner = row 5, col 5 → centroid in the north-east of the bounds.
    expect(top.centroid[0]).toBeGreaterThan((BOUNDS.west + BOUNDS.east) / 2)
    expect(top.centroid[1]).toBeGreaterThan((BOUNDS.south + BOUNDS.north) / 2)
    expect(top.severity.max).toBeGreaterThan(0.9)
    // Per-region min is a real statistic over the region's own cells.
    expect(top.severity.min).toBeGreaterThan(0)
    expect(top.severity.min).toBeLessThanOrEqual(top.severity.max)
    expect(top.metrics).toEqual([
      expect.objectContaining({ id: 'heat' }),
      expect.objectContaining({ id: 'comfort' }),
    ])
    // Raw per-metric evidence stays in original units.
    expect(top.metrics[0].worstValue).toBe(10)
    expect(result.metrics.map((metric) => metric.coverage)).toEqual([1, 1])
  })

  it('respects weights under weighted-mean combining', () => {
    const heavy = rankSeverityHotspots(
      [
        { id: 'a', grid: gradientGrid(1), direction: 'higher-is-worse', weight: 10 },
        { id: 'b', grid: inverseGradientGrid(), direction: 'higher-is-worse', weight: 0.01 },
      ],
      { topShare: 0.2, minCells: 1 },
    )
    expect('error' in heavy).toBe(false)
    if ('error' in heavy) return
    // Metric a dominates → hotspot follows a's worst (NE) corner.
    expect(heavy.regions[0].centroid[0]).toBeGreaterThan((BOUNDS.west + BOUNDS.east) / 2)
  })

  it('warns on partial coverage and constant metrics instead of failing', () => {
    const offsetBounds = {
      west: BOUNDS.west + 0.005,
      south: BOUNDS.south + 0.005,
      east: BOUNDS.east + 0.005,
      north: BOUNDS.north + 0.005,
    }
    const partial: NumericResultGrid = {
      mergedGrid: Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 7)),
      gridShape: [6, 6],
      gridBounds: offsetBounds,
    }
    const result = rankSeverityHotspots(
      [
        { id: 'main', grid: gradientGrid(), direction: 'higher-is-worse' },
        { id: 'flat', label: 'Flat metric', grid: partial, direction: 'higher-is-worse' },
      ],
      { minCells: 1 },
    )
    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.warnings.join(' ')).toContain('Flat metric')
    expect(result.warnings.join(' ')).toContain('constant value')
  })

  it('rejects empty, oversized, and duplicate metric sets', () => {
    expect(rankSeverityHotspots([])).toEqual({
      error: 'At least one severity metric is required.',
    })
    const metric = { id: 'm', grid: gradientGrid(), direction: 'higher-is-worse' as const }
    expect(
      rankSeverityHotspots(
        Array.from({ length: 9 }, (_, index) => ({ ...metric, id: `m${index}` })),
      ),
    ).toEqual({ error: 'At most 8 severity metrics are supported per call.' })
    expect(rankSeverityHotspots([metric, metric])).toEqual({
      error: 'Severity metric ids must be unique.',
    })
  })
})
