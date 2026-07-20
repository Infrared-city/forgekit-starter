// ABOUTME: Finds the nearest finite grid cell to a lon/lat position, unbounded by snap radius.
// ABOUTME: Powers actionable corridor/path error steering instead of bare failure text.

import type { NumericResultGrid } from './grid-alignment'
import { haversineM } from './sample-stats'

export interface NearestFiniteCell {
  row: number
  col: number
  value: number
  /** Cell-center coordinates. */
  lon: number
  lat: number
  /** Ground distance from the query position to the cell center. */
  distanceM: number
}

function cellCenter(
  grid: NumericResultGrid,
  row: number,
  col: number,
): { lon: number; lat: number } {
  const [rows, cols] = grid.gridShape
  const { west, south, east, north } = grid.gridBounds
  return {
    lon: west + ((col + 0.5) / cols) * (east - west),
    lat: south + ((row + 0.5) / rows) * (north - south),
  }
}

/**
 * Nearest finite cell to `position` ([lon, lat]) by ground distance, searched
 * over the WHOLE grid (row zero at the south edge, matching grid-alignment).
 * Returns null when the grid is malformed or has no finite cells.
 */
export function nearestFiniteCell(
  grid: NumericResultGrid,
  position: [number, number],
): NearestFiniteCell | null {
  if (!Array.isArray(grid.mergedGrid) || !Array.isArray(grid.gridShape)) return null
  const [rows, cols] = grid.gridShape
  const bounds = grid.gridBounds
  if (!(rows > 0) || !(cols > 0) || !bounds || !(bounds.east > bounds.west)) return null
  const [lon, lat] = position
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null

  let best: NearestFiniteCell | null = null
  for (let row = 0; row < rows; row++) {
    const gridRow = grid.mergedGrid[row]
    if (!gridRow) continue
    for (let col = 0; col < cols; col++) {
      const value = gridRow[col]
      if (typeof value !== 'number' || !Number.isFinite(value)) continue
      const center = cellCenter(grid, row, col)
      const distanceM = haversineM(lat, lon, center.lat, center.lon)
      if (!best || distanceM < best.distanceM) {
        best = {
          row,
          col,
          value,
          lon: center.lon,
          lat: center.lat,
          distanceM: Math.round(distanceM),
        }
      }
    }
  }
  return best
}
