// ABOUTME: Verifies nearest-finite-cell search used for corridor/path error steering.
// ABOUTME: Locks south-row-zero georeferencing and no-finite-cell degradation.

import { describe, expect, it } from 'vitest'
import type { NumericResultGrid } from '../core/grid-alignment'
import { nearestFiniteCell } from '../core/grid-nearest'

const BOUNDS = { west: 16.0, south: 48.0, east: 16.01, north: 48.01 }

function grid(mergedGrid: (number | null)[][]): NumericResultGrid {
  return { mergedGrid, gridShape: [3, 3], gridBounds: { ...BOUNDS } }
}

describe('nearestFiniteCell', () => {
  it('finds the closest finite cell to an off-data position', () => {
    // Only the north-east cell (row 2, col 2 — row zero is SOUTH) is finite.
    const g = grid([
      [null, null, null],
      [null, null, null],
      [null, null, 4.5],
    ])
    const nearest = nearestFiniteCell(g, [16.0, 48.0])
    expect(nearest).toMatchObject({ row: 2, col: 2, value: 4.5 })
    expect(nearest!.lon).toBeCloseTo(16.0 + (2.5 / 3) * 0.01, 6)
    expect(nearest!.lat).toBeCloseTo(48.0 + (2.5 / 3) * 0.01, 6)
    expect(nearest!.distanceM).toBeGreaterThan(0)
  })

  it('prefers the nearer of two finite cells', () => {
    const g = grid([
      [1, null, null],
      [null, null, null],
      [null, null, 9],
    ])
    // Query at the south-west corner → the SW cell (row 0, col 0) wins.
    expect(nearestFiniteCell(g, [16.0, 48.0])).toMatchObject({ row: 0, col: 0, value: 1 })
  })

  it('returns null for all-null or malformed grids', () => {
    expect(
      nearestFiniteCell(
        grid([
          [null, null, null],
          [null, null, null],
          [null, null, null],
        ]),
        [16.0, 48.0],
      ),
    ).toBeNull()
    expect(
      nearestFiniteCell({ mergedGrid: [[1]], gridShape: [0, 0], gridBounds: BOUNDS }, [16.0, 48.0]),
    ).toBeNull()
  })
})
