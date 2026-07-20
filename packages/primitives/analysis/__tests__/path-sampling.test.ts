// ABOUTME: Defines ordered georeferenced sampling profiles along user and assistant paths.
// ABOUTME: Covers interpolation, grid lookup, null evidence, distance, and sample bounds.

import { describe, expect, it } from 'vitest'
import type { AreaRunResult } from '../core/analysis.types'
import { sampleNumericPath } from '../core/path-sampling'

function grid(mergedGrid: (number | null)[][]): AreaRunResult {
  return {
    analysisType: 'wind-speed',
    mergedGrid,
    gridShape: [mergedGrid.length, mergedGrid[0]?.length ?? 0],
    gridBounds: { west: 0, south: 0, east: 0.04, north: 0.01 },
  } as AreaRunResult
}

describe('sampleNumericPath', () => {
  it('returns an ordered endpoint-inclusive profile through georeferenced cells', () => {
    const profile = sampleNumericPath(
      grid([[1, 2, 3, 4]]),
      [
        [0.005, 0.005],
        [0.035, 0.005],
      ],
      { spacingM: 1_200 },
    )

    expect(profile).not.toBeNull()
    expect(profile?.points.map((point) => point.value)).toEqual([1, 2, 3, 4])
    expect(profile?.points.map((point) => [point.row, point.col])).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ])
    expect(profile?.points[0].distanceM).toBe(0)
    expect(profile?.points.at(-1)?.distanceM).toBeCloseTo(profile?.lengthM ?? 0, 6)
    expect(profile?.stats).toMatchObject({ count: 4, mean: 2.5, min: 1, max: 4 })
  })

  it('interpolates across every segment and caps dense profiles without losing endpoints', () => {
    const coordinates: [number, number][] = [
      [0.005, 0.005],
      [0.015, 0.005],
      [0.015, 0.009],
    ]
    const profile = sampleNumericPath(grid([[1, 2, 3, 4]]), coordinates, {
      spacingM: 1,
      maxSamples: 3,
    })

    expect(profile?.points).toHaveLength(3)
    expect(profile?.points[0].position).toEqual(coordinates[0])
    expect(profile?.points.at(-1)?.position).toEqual(coordinates.at(-1))
    expect(profile?.lengthM).toBeGreaterThan(1_000)
    expect(profile?.spacingM).toBeCloseTo((profile?.lengthM ?? 0) / 2, 6)
  })

  it('keeps null samples in the route while excluding them from statistics', () => {
    const profile = sampleNumericPath(
      grid([[1, null, 3, 4]]),
      [
        [0.005, 0.005],
        [0.035, 0.005],
      ],
      { spacingM: 1_200 },
    )

    expect(profile?.points.map((point) => point.value)).toEqual([1, null, 3, 4])
    expect(profile?.finiteCount).toBe(3)
    expect(profile?.stats).toMatchObject({ count: 3, mean: 8 / 3, min: 1, max: 4 })
  })

  it('rejects paths and grids that cannot produce a profile', () => {
    expect(sampleNumericPath(grid([[1]]), [[0, 0]])).toBeNull()
    expect(
      sampleNumericPath({ ...grid([[1]]), gridShape: [0, 0] } as AreaRunResult, [
        [0, 0],
        [0.01, 0.01],
      ]),
    ).toBeNull()
  })
})
