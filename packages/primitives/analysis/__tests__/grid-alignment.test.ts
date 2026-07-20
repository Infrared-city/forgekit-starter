// ABOUTME: Defines registration-safe alignment and difference grids for spatial comparisons.
// ABOUTME: Prevents index-wise scenario subtraction when result shapes or bounds differ.

import { describe, expect, it } from 'vitest'
import {
  alignNumericGrid,
  buildDifferenceGrid,
  MIN_DIFFERENCE_GRID_COVERAGE,
  type NumericResultGrid,
} from '../core/grid-alignment'

function grid(
  mergedGrid: (number | null)[][],
  bounds = { west: 0, south: 0, east: 4, north: 1 },
): NumericResultGrid {
  return {
    mergedGrid,
    gridShape: [mergedGrid.length, mergedGrid[0]?.length ?? 0],
    gridBounds: bounds,
  }
}

describe('alignNumericGrid', () => {
  it('samples source values at reference cell centers and preserves partial overlap', () => {
    const reference = grid([[1, 2, 3, 4]])
    const source = grid([[10, 20]], { west: 0, south: 0, east: 2, north: 1 })

    expect(alignNumericGrid(reference, source)).toEqual({
      mergedGrid: [[10, 20, null, null]],
      gridShape: [1, 4],
      gridBounds: reference.gridBounds,
      sourceCoverage: 0.5,
    })
  })

  it('returns null for degenerate grids', () => {
    expect(alignNumericGrid(grid([[1]]), { ...grid([[2]]), gridShape: [0, 0] })).toBeNull()
  })

  it('returns null instead of throwing when grid fields are missing', () => {
    const valid = grid([[1, 2]])
    const missingShape = { mergedGrid: [[1]], gridBounds: valid.gridBounds }
    const missingBounds = { mergedGrid: [[1]], gridShape: [1, 1] }

    expect(alignNumericGrid(missingShape as unknown as NumericResultGrid, valid)).toBeNull()
    expect(alignNumericGrid(valid, missingShape as unknown as NumericResultGrid)).toBeNull()
    expect(alignNumericGrid(missingBounds as unknown as NumericResultGrid, valid)).toBeNull()
    expect(alignNumericGrid(valid, missingBounds as unknown as NumericResultGrid)).toBeNull()
    expect(alignNumericGrid(null as unknown as NumericResultGrid, valid)).toBeNull()
    expect(buildDifferenceGrid(missingShape as unknown as NumericResultGrid, valid)).toBeNull()
    expect(buildDifferenceGrid(valid, missingBounds as unknown as NumericResultGrid)).toBeNull()
  })
})

describe('buildDifferenceGrid', () => {
  it('subtracts a georeferenced reference from the current grid without index alignment', () => {
    const current = grid([[10, 20, 30, 40]])
    const reference = grid([[1, 2]], { west: 0, south: 0, east: 2, north: 1 })

    expect(buildDifferenceGrid(current, reference)).toEqual({
      mergedGrid: [[9, 18, null, null]],
      gridShape: [1, 4],
      gridBounds: current.gridBounds,
      maxAbs: 18,
      referenceCoverage: 0.5,
    })
  })

  it('rejects comparisons with too little shared ground', () => {
    const current = grid([[10, 20, 30, 40]])
    const reference = grid([[1]], { west: 0, south: 0, east: 1, north: 1 })

    expect(MIN_DIFFERENCE_GRID_COVERAGE).toBe(0.5)
    expect(buildDifferenceGrid(current, reference)).toBeNull()
  })

  it('rejects low-overlap pairs from bounds alone without any per-cell work', () => {
    const cellTrap = (
      rows: number,
      cols: number,
      bounds: NumericResultGrid['gridBounds'],
    ): NumericResultGrid => ({
      mergedGrid: new Proxy([] as (number | null)[][], {
        get(target, prop) {
          if (typeof prop === 'string' && Number.isInteger(Number(prop))) {
            throw new Error('cell values must not be read before the bounds pre-check rejects')
          }
          return Reflect.get(target, prop)
        },
      }),
      gridShape: [rows, cols],
      gridBounds: bounds,
    })
    const current = cellTrap(2000, 2000, { west: 0, south: 0, east: 4, north: 1 })
    const reference = cellTrap(2000, 2000, { west: 3.9, south: 0, east: 8, north: 1 })

    expect(buildDifferenceGrid(current, reference)).toBeNull()
  })
})
