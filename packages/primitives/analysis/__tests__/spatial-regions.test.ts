// ABOUTME: Defines deterministic result-region discovery over numeric analysis grids.
// ABOUTME: Covers patch ranking, statistics, georeferencing, filters, and invalid predicates.

import { describe, expect, it } from 'vitest'
import type { AreaRunResult } from '../core/analysis.types'
import { findCombinedResultRegions, findResultRegions } from '../core/spatial-regions'

function grid(mergedGrid: (number | null)[][]): AreaRunResult {
  return {
    analysisType: 'thermal-comfort-index',
    gridShape: [mergedGrid.length, mergedGrid[0]?.length ?? 0],
    gridBounds: { west: 10, south: 50, east: 10.05, north: 50.04 },
    mergedGrid,
    polygon: { type: 'Polygon', coordinates: [] },
    failedJobs: [],
    skippedJobs: [],
    totalJobs: mergedGrid.length * (mergedGrid[0]?.length ?? 0),
    succeededJobs: mergedGrid.flat().filter((value) => value !== null).length,
  } as unknown as AreaRunResult
}

describe('findResultRegions', () => {
  it('finds and ranks every connected patch with exact per-patch statistics', () => {
    const result = findResultRegions(
      grid([
        [9, 9, null, 1, 1],
        [9, null, null, 1, 1],
        [null, null, 8, null, 1],
        [2, 2, null, 7, 7],
      ]),
      { op: 'gte', value: 7 },
    )

    expect(result).not.toHaveProperty('error')
    if ('error' in result) throw new Error(result.error)
    expect(result.rule).toBe('≥ 7')
    expect(result.matchCount).toBe(6)
    expect(result.componentCount).toBe(3)
    expect(result.regions).toHaveLength(3)
    expect(result.regions.map((region) => region.cellCount)).toEqual([3, 2, 1])
    expect(result.regions[0].shareOfFinite).toBeCloseTo(3 / 13, 10)
    expect(result.regions[0].shareOfMatches).toBeCloseTo(3 / 6, 10)
    expect(result.regions[0]).toMatchObject({
      id: 'region-r0-c0-n3',
      rank: 1,
      stats: { count: 3, mean: 9, min: 9, max: 9, p50: 9 },
      holeCount: 0,
    })
    expect(result.regions[1].stats).toMatchObject({
      count: 2,
      mean: 7,
      min: 7,
      max: 7,
      p50: 7,
    })
    expect(result.regions[0].polygon).not.toBeNull()
    expect(result.regions[0].approxAreaM2).toBeGreaterThan(0)
  })

  it('applies minimum-size and result-limit options after deterministic ranking', () => {
    const result = findResultRegions(
      grid([
        [9, 9, null, 1, 1],
        [9, null, null, 1, 1],
        [null, null, 8, null, 1],
        [2, 2, null, 7, 7],
      ]),
      { op: 'gte', value: 7 },
      { minCells: 2, limit: 1 },
    )

    if ('error' in result) throw new Error(result.error)
    expect(result.componentCount).toBe(3)
    expect(result.regions).toHaveLength(1)
    expect(result.regions[0].id).toBe('region-r0-c0-n3')
  })

  it('can rank patches by mean while preserving scan order as the final tie-breaker', () => {
    const result = findResultRegions(
      grid([
        [7, 7, null, 9],
        [null, null, null, 9],
      ]),
      { op: 'gte', value: 7 },
      { rankBy: 'mean' },
    )

    if ('error' in result) throw new Error(result.error)
    expect(result.regions.map((region) => region.stats.mean)).toEqual([9, 7])
    expect(result.regions.map((region) => region.rank)).toEqual([1, 2])
  })

  it('maps component centroids and polygon corners using row zero as the south edge', () => {
    const result = findResultRegions(
      grid([
        [10, null],
        [null, null],
      ]),
      { op: 'gte', value: 10 },
    )

    if ('error' in result) throw new Error(result.error)
    expect(result.regions[0].centroid).toEqual([10.0125, 50.01])
    const polygon = result.regions[0].polygon ?? []
    expect(polygon).toHaveLength(4)
    const expected = [
      [10, 50],
      [10.025, 50],
      [10.025, 50.02],
      [10, 50.02],
    ]
    for (let index = 0; index < expected.length; index++) {
      expect(polygon[index]?.[0]).toBeCloseTo(expected[index][0], 10)
      expect(polygon[index]?.[1]).toBeCloseTo(expected[index][1], 10)
    }
  })

  it('resolves percentile predicates before reporting patches', () => {
    const result = findResultRegions(grid([[1, 2, 3, 4]]), {
      op: 'top-percent',
      percent: 25,
    })

    if ('error' in result) throw new Error(result.error)
    expect(result.rule).toContain('top 25%')
    expect(result.resolvedThreshold).toBe(4)
    expect(result.matchCount).toBe(1)
  })

  it('returns exact empty-match evidence without fabricating a region', () => {
    const result = findResultRegions(grid([[1, 2, null]]), { op: 'gt', value: 100 })

    if ('error' in result) throw new Error(result.error)
    expect(result).toMatchObject({
      matchCount: 0,
      totalFinite: 2,
      matchShare: 0,
      matchedValueRange: null,
      componentCount: 0,
      regions: [],
    })
  })

  it('returns a clear error for an invalid predicate', () => {
    const result = findResultRegions(grid([[1, 2]]), { op: 'between', min: 5, max: 2 })

    expect(result).toEqual({
      error:
        'Could not resolve the region predicate - check op/value/percent (percentile filters need finite result cells).',
    })
  })
})

describe('findCombinedResultRegions', () => {
  const heat = grid([[35, 35, 25, 35]])
  const wind = grid([[0.5, 3]])
  const conditions = [
    {
      id: 'heat',
      label: 'Heat',
      grid: heat,
      predicate: { op: 'gte' as const, value: 30 },
    },
    {
      id: 'wind',
      label: 'Still air',
      grid: wind,
      predicate: { op: 'lte' as const, value: 1 },
    },
  ]

  it('finds conjunction patches across georeferenced grids and reports each condition', () => {
    const result = findCombinedResultRegions(conditions, 'all', {
      rankBy: 'mean',
      rankConditionId: 'heat',
    })

    if ('error' in result) throw new Error(result.error)
    expect(result.rule).toContain('Heat')
    expect(result.rule).toContain('AND')
    expect(result.combine).toBe('all')
    expect(result.matchCount).toBe(2)
    expect(result.totalFinite).toBe(4)
    expect(result.componentCount).toBe(1)
    expect(result.conditions).toEqual([
      expect.objectContaining({ id: 'heat', matchCount: 3, totalFinite: 4 }),
      expect.objectContaining({ id: 'wind', matchCount: 2, totalFinite: 4 }),
    ])
    expect(result.regions[0]).toMatchObject({
      cellCount: 2,
      conditionStats: [
        { id: 'heat', label: 'Heat', stats: { count: 2, mean: 35, min: 35, max: 35, p50: 35 } },
        {
          id: 'wind',
          label: 'Still air',
          stats: { count: 2, mean: 0.5, min: 0.5, max: 0.5, p50: 0.5 },
        },
      ],
    })
  })

  it('supports disjunctions while keeping disconnected patches separate', () => {
    const result = findCombinedResultRegions(conditions, 'any')

    if ('error' in result) throw new Error(result.error)
    expect(result.rule).toContain('OR')
    expect(result.matchCount).toBe(3)
    expect(result.componentCount).toBe(2)
    expect(result.regions.map((region) => region.cellCount)).toEqual([2, 1])
  })

  it('rejects unknown ranking evidence instead of silently using another condition', () => {
    expect(findCombinedResultRegions(conditions, 'all', { rankConditionId: 'missing' })).toEqual({
      error: 'Unknown rank condition: missing.',
    })
  })

  it('ranks disconnected patches by the selected condition rather than the anchor values', () => {
    const result = findCombinedResultRegions(
      [
        {
          id: 'anchor',
          grid: grid([[30, null, 30]]),
          predicate: { op: 'gte', value: 0 },
        },
        {
          id: 'priority',
          grid: grid([[1, null, 5]]),
          predicate: { op: 'gte', value: 0 },
        },
      ],
      'all',
      { rankBy: 'mean', rankConditionId: 'priority' },
    )

    if ('error' in result) throw new Error(result.error)
    expect(result.regions.map((region) => region.id)).toEqual([
      'region-r0-c2-n1',
      'region-r0-c0-n1',
    ])
  })
})
