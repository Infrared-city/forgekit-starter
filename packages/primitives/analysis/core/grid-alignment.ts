// ABOUTME: Aligns numeric result grids by georeferenced cell centers for exact comparison.
// ABOUTME: Builds registration-safe candidate-minus-reference grids with overlap guards.

export interface NumericResultGrid {
  mergedGrid: (number | null)[][]
  gridShape: [number, number]
  gridBounds: { west: number; south: number; east: number; north: number }
}

export interface AlignedNumericGrid extends NumericResultGrid {
  sourceCoverage: number
}

export interface DifferenceGrid extends NumericResultGrid {
  maxAbs: number
  referenceCoverage: number
}

export const MIN_DIFFERENCE_GRID_COVERAGE = 0.5

/**
 * Alignment is cell-center based, with row zero at the south edge. It never
 * subtracts equal array indexes unless those indexes also occupy the same
 * ground. Cells outside the source bounds, or null on either side, remain
 * null: footprint changes are evidence and must not become fabricated values.
 * Difference grids additionally require at least half of the candidate bounds
 * to overlap the reference so a precise-looking but spatially weak delta is
 * rejected before rendering or region extraction.
 */

type Bounds = NumericResultGrid['gridBounds']

interface NarrowGrid {
  grid: (number | null)[][]
  rows: number
  cols: number
  bounds: Bounds
}

function narrow(grid: NumericResultGrid): NarrowGrid | null {
  // External/JSON callers can pass structurally incomplete grids; validate
  // before destructuring so malformed input degrades to null, never a throw.
  if (!grid || !Array.isArray(grid.mergedGrid) || !Array.isArray(grid.gridShape)) return null
  const bounds = grid.gridBounds
  if (!bounds || typeof bounds !== 'object') return null
  const [rows, cols] = grid.gridShape
  if (!(rows > 0) || !(cols > 0)) return null
  if (!(bounds.east > bounds.west) || !(bounds.north > bounds.south)) return null
  return { grid: grid.mergedGrid, rows, cols, bounds }
}

function coverageRatio(target: Bounds, source: Bounds): number {
  const area = Math.max(0, target.east - target.west) * Math.max(0, target.north - target.south)
  const width = Math.min(target.east, source.east) - Math.max(target.west, source.west)
  const height = Math.min(target.north, source.north) - Math.max(target.south, source.south)
  const intersection = Math.max(0, width) * Math.max(0, height)
  return area > 0 ? intersection / area : 0
}

export function alignNumericGrid(
  target: NumericResultGrid,
  source: NumericResultGrid,
): AlignedNumericGrid | null {
  const targetGrid = narrow(target)
  const sourceGrid = narrow(source)
  if (!targetGrid || !sourceGrid) return null

  const sourceCoverage = coverageRatio(targetGrid.bounds, sourceGrid.bounds)
  const sourceLonSpan = sourceGrid.bounds.east - sourceGrid.bounds.west
  const sourceLatSpan = sourceGrid.bounds.north - sourceGrid.bounds.south
  const mergedGrid: (number | null)[][] = new Array(targetGrid.rows)

  for (let row = 0; row < targetGrid.rows; row++) {
    const alignedRow = new Array<number | null>(targetGrid.cols).fill(null)
    const lat =
      targetGrid.bounds.south +
      ((row + 0.5) / targetGrid.rows) * (targetGrid.bounds.north - targetGrid.bounds.south)
    const sourceRowIndex = Math.floor(
      ((lat - sourceGrid.bounds.south) / sourceLatSpan) * sourceGrid.rows,
    )
    const sourceRow =
      sourceRowIndex >= 0 && sourceRowIndex < sourceGrid.rows
        ? sourceGrid.grid[sourceRowIndex]
        : undefined
    if (sourceRow) {
      for (let col = 0; col < targetGrid.cols; col++) {
        const lon =
          targetGrid.bounds.west +
          ((col + 0.5) / targetGrid.cols) * (targetGrid.bounds.east - targetGrid.bounds.west)
        const sourceColIndex = Math.floor(
          ((lon - sourceGrid.bounds.west) / sourceLonSpan) * sourceGrid.cols,
        )
        if (sourceColIndex < 0 || sourceColIndex >= sourceGrid.cols) continue
        const value = sourceRow[sourceColIndex]
        if (value !== null && value !== undefined && Number.isFinite(value)) {
          alignedRow[col] = value
        }
      }
    }
    mergedGrid[row] = alignedRow
  }

  return {
    mergedGrid,
    gridShape: [targetGrid.rows, targetGrid.cols],
    gridBounds: { ...targetGrid.bounds },
    sourceCoverage,
  }
}

export function buildDifferenceGrid(
  current: NumericResultGrid,
  reference: NumericResultGrid,
): DifferenceGrid | null {
  const currentGrid = narrow(current)
  const referenceGrid = narrow(reference)
  if (!currentGrid || !referenceGrid) return null
  // Bounds-only coverage pre-check: weak overlap must be rejected before any
  // O(rows*cols) sampling. alignNumericGrid computes the same ratio, so pairs
  // at or above the threshold behave exactly as before.
  const referenceCoverage = coverageRatio(currentGrid.bounds, referenceGrid.bounds)
  if (referenceCoverage < MIN_DIFFERENCE_GRID_COVERAGE) return null
  const alignedReference = alignNumericGrid(current, reference)
  if (!alignedReference) return null

  const mergedGrid: (number | null)[][] = new Array(currentGrid.rows)
  let maxAbs = 0
  for (let row = 0; row < currentGrid.rows; row++) {
    const differenceRow = new Array<number | null>(currentGrid.cols).fill(null)
    for (let col = 0; col < currentGrid.cols; col++) {
      const currentValue = currentGrid.grid[row]?.[col]
      const referenceValue = alignedReference.mergedGrid[row]?.[col]
      if (
        currentValue === null ||
        currentValue === undefined ||
        !Number.isFinite(currentValue) ||
        referenceValue === null ||
        referenceValue === undefined ||
        !Number.isFinite(referenceValue)
      ) {
        continue
      }
      const difference = currentValue - referenceValue
      differenceRow[col] = difference
      maxAbs = Math.max(maxAbs, Math.abs(difference))
    }
    mergedGrid[row] = differenceRow
  }

  return {
    mergedGrid,
    gridShape: [...current.gridShape],
    gridBounds: { ...current.gridBounds },
    maxAbs,
    referenceCoverage: alignedReference.sourceCoverage,
  }
}
