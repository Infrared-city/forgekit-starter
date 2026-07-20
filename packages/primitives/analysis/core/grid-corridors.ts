// ABOUTME: Finds deterministic result-weighted least-cost corridors on numeric grids.
// ABOUTME: Treats no-data as barriers and returns exact cell, value, cost, and distance evidence.

import { MinHeap } from './corridor-structures'
import type { NumericResultGrid } from './grid-alignment'
import { haversineM, summariseNumeric } from './sample-stats'
import type { SampleStats } from './sampling'

export type GridCorridorPreference = 'lower' | 'higher'

export interface GridCorridorOptions {
  preference?: GridCorridorPreference
  costPower?: number
  diagonal?: boolean
  /**
   * Total Dijkstra expansion budget for the whole call. findGridCorridor
   * spends it on the single solve and defaults to
   * DEFAULT_SINGLE_CORRIDOR_MAX_EXPANDED; findGridCorridorNetwork shares it
   * across every terminal-pair solve and defaults to
   * DEFAULT_CORRIDOR_MAX_EXPANDED.
   */
  maxExpanded?: number
  maxSnapRadius?: number
}

export interface GridCorridorCell {
  row: number
  col: number
  position: [number, number]
  value: number
  normalizedValue: number
  traversalCost: number
}

export interface GridCorridorEndpoint {
  requested: [number, number]
  position: [number, number]
  row: number
  col: number
  snapped: boolean
}

export interface GridCorridor {
  preference: GridCorridorPreference
  start: GridCorridorEndpoint
  end: GridCorridorEndpoint
  cells: GridCorridorCell[]
  totalCost: number
  lengthM: number
  expandedCells: number
  stats: SampleStats
}

export type GridCorridorResult = GridCorridor | { error: string }

/** Internal to the corridor modules; not part of the public core surface. */
export interface GridContext {
  grid: NumericResultGrid
  rows: number
  cols: number
  min: number
  max: number
  preference: GridCorridorPreference
  costPower: number
  diagonal: boolean
  maxExpanded: number
  maxSnapRadius: number
  rowStepM: number
  colStepM: number
}

/** Internal solve failure; exhausted distinguishes budget from disconnection. */
export interface CorridorSolveFailure {
  error: string
  exhausted?: boolean
}

// Network default: sized so a worst-case default call (shared across a full
// 6-terminal network) stays well under a second on the main thread — measured
// ~0.7us per expansion.
export const DEFAULT_CORRIDOR_MAX_EXPANDED = 200_000
// Single-corridor default: the original findGridCorridor budget, preserved so
// external core consumers see no behavior change from the shared-budget rework.
export const DEFAULT_SINGLE_CORRIDOR_MAX_EXPANDED = 250_000

const DEFAULT_SNAP_RADIUS = 8
const MIN_STEP_COST = 0.05
const CARDINAL_NEIGHBORS = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
] as const
const DIAGONAL_NEIGHBORS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
] as const

/**
 * Internal to the corridor modules; not part of the public core surface.
 * defaultMaxExpanded is required so each entry point states its own default
 * budget explicitly — sharing this context must never shrink one silently.
 */
export function corridorContext(
  grid: NumericResultGrid,
  options: GridCorridorOptions,
  defaultMaxExpanded: number,
): GridContext | { error: string } {
  const [rows, cols] = grid.gridShape
  const { west, south, east, north } = grid.gridBounds
  if (
    !Array.isArray(grid.mergedGrid) ||
    !(rows > 0) ||
    !(cols > 0) ||
    !(east > west) ||
    !(north > south)
  ) {
    return { error: 'A valid georeferenced numeric grid is required.' }
  }
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const value = grid.mergedGrid[row]?.[col]
      if (typeof value !== 'number' || !Number.isFinite(value)) continue
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { error: 'The grid contains no finite cells for corridor routing.' }
  }
  const costPower =
    typeof options.costPower === 'number' && Number.isFinite(options.costPower)
      ? Math.min(4, Math.max(0.25, options.costPower))
      : 1
  const maxExpanded =
    typeof options.maxExpanded === 'number' && Number.isFinite(options.maxExpanded)
      ? Math.max(1, Math.floor(options.maxExpanded))
      : defaultMaxExpanded
  const maxSnapRadius =
    typeof options.maxSnapRadius === 'number' && Number.isFinite(options.maxSnapRadius)
      ? Math.max(0, Math.floor(options.maxSnapRadius))
      : DEFAULT_SNAP_RADIUS
  const midLat = (south + north) / 2
  const rowStepM = haversineM(south, west, south + (north - south) / rows, west)
  const colStepM = haversineM(midLat, west, midLat, west + (east - west) / cols)
  return {
    grid,
    rows,
    cols,
    min,
    max,
    preference: options.preference ?? 'lower',
    costPower,
    diagonal: options.diagonal ?? true,
    maxExpanded,
    maxSnapRadius,
    rowStepM,
    colStepM,
  }
}

function finiteValue(ctx: GridContext, row: number, col: number): number | null {
  const value = ctx.grid.mergedGrid[row]?.[col]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function cellPosition(ctx: GridContext, row: number, col: number): [number, number] {
  const { west, south, east, north } = ctx.grid.gridBounds
  return [
    west + ((col + 0.5) / ctx.cols) * (east - west),
    south + ((row + 0.5) / ctx.rows) * (north - south),
  ]
}

function requestedCell(
  ctx: GridContext,
  position: [number, number],
): { row: number; col: number } | null {
  const [lon, lat] = position
  const { west, south, east, north } = ctx.grid.gridBounds
  if (lon < west || lon > east || lat < south || lat > north) return null
  return {
    row: Math.min(ctx.rows - 1, Math.floor(((lat - south) / (north - south)) * ctx.rows)),
    col: Math.min(ctx.cols - 1, Math.floor(((lon - west) / (east - west)) * ctx.cols)),
  }
}

function resolveEndpoint(
  ctx: GridContext,
  requested: [number, number],
): GridCorridorEndpoint | { error: string } {
  const target = requestedCell(ctx, requested)
  if (!target) return { error: 'Corridor endpoints must fall within the result grid bounds.' }
  if (finiteValue(ctx, target.row, target.col) !== null) {
    return {
      requested,
      position: cellPosition(ctx, target.row, target.col),
      row: target.row,
      col: target.col,
      snapped: false,
    }
  }
  for (let radius = 1; radius <= ctx.maxSnapRadius; radius++) {
    const candidates: Array<{ row: number; col: number; distance: number }> = []
    for (let row = target.row - radius; row <= target.row + radius; row++) {
      for (let col = target.col - radius; col <= target.col + radius; col++) {
        if (row < 0 || row >= ctx.rows || col < 0 || col >= ctx.cols) continue
        if (Math.max(Math.abs(row - target.row), Math.abs(col - target.col)) !== radius) continue
        if (finiteValue(ctx, row, col) === null) continue
        candidates.push({
          row,
          col,
          distance: (row - target.row) ** 2 + (col - target.col) ** 2,
        })
      }
    }
    candidates.sort((a, b) => a.distance - b.distance || a.row - b.row || a.col - b.col)
    const nearest = candidates[0]
    if (nearest) {
      return {
        requested,
        position: cellPosition(ctx, nearest.row, nearest.col),
        row: nearest.row,
        col: nearest.col,
        snapped: true,
      }
    }
  }
  return { error: `No finite endpoint cell found within ${ctx.maxSnapRadius} grid cells.` }
}

function normalizedValue(ctx: GridContext, value: number): number {
  return ctx.max > ctx.min ? (value - ctx.min) / (ctx.max - ctx.min) : 0.5
}

function traversalCost(ctx: GridContext, value: number): number {
  const normalized = normalizedValue(ctx, value)
  const preferred = ctx.preference === 'lower' ? normalized : 1 - normalized
  return MIN_STEP_COST + preferred ** ctx.costPower
}

function gridIndex(ctx: GridContext, row: number, col: number): number {
  return row * ctx.cols + col
}

function cellFromIndex(ctx: GridContext, index: number): { row: number; col: number } {
  return { row: Math.floor(index / ctx.cols), col: index % ctx.cols }
}

function reconstruct(previous: Int32Array, endIndex: number): number[] {
  const indexes: number[] = []
  let current = endIndex
  while (current >= 0) {
    indexes.push(current)
    current = previous[current] ?? -1
  }
  return indexes.reverse()
}

/** Internal to the corridor modules; not part of the public core surface. */
export function solveCorridor(
  ctx: GridContext,
  startRequest: [number, number],
  endRequest: [number, number],
  budget = ctx.maxExpanded,
): GridCorridor | CorridorSolveFailure {
  const start = resolveEndpoint(ctx, startRequest)
  if ('error' in start) return start
  const end = resolveEndpoint(ctx, endRequest)
  if ('error' in end) return end
  const size = ctx.rows * ctx.cols
  const distances = new Float64Array(size)
  distances.fill(Number.POSITIVE_INFINITY)
  const previous = new Int32Array(size)
  previous.fill(-1)
  const visited = new Uint8Array(size)
  const startIndex = gridIndex(ctx, start.row, start.col)
  const endIndex = gridIndex(ctx, end.row, end.col)
  if (startIndex === endIndex) {
    return { error: 'Corridor endpoints must resolve to different finite grid cells.' }
  }
  const queue = new MinHeap()
  distances[startIndex] = 0
  queue.push({ index: startIndex, priority: 0 })
  let expandedCells = 0
  const neighbors = ctx.diagonal
    ? [...CARDINAL_NEIGHBORS, ...DIAGONAL_NEIGHBORS]
    : CARDINAL_NEIGHBORS

  while (queue.size > 0 && expandedCells < budget) {
    const entry = queue.pop()
    if (!entry || visited[entry.index]) continue
    visited[entry.index] = 1
    expandedCells++
    if (entry.index === endIndex) break
    const current = cellFromIndex(ctx, entry.index)
    const currentValue = finiteValue(ctx, current.row, current.col)
    if (currentValue === null) continue
    const currentCost = traversalCost(ctx, currentValue)
    for (const [rowOffset, colOffset] of neighbors) {
      const row = current.row + rowOffset
      const col = current.col + colOffset
      if (row < 0 || row >= ctx.rows || col < 0 || col >= ctx.cols) continue
      const value = finiteValue(ctx, row, col)
      if (value === null) continue
      const index = gridIndex(ctx, row, col)
      if (visited[index]) continue
      const isDiagonal = rowOffset !== 0 && colOffset !== 0
      if (
        isDiagonal &&
        (finiteValue(ctx, current.row, col) === null || finiteValue(ctx, row, current.col) === null)
      ) {
        continue
      }
      const stepDistanceM = Math.hypot(rowOffset * ctx.rowStepM, colOffset * ctx.colStepM)
      const stepCost = ((currentCost + traversalCost(ctx, value)) / 2) * stepDistanceM
      const candidate = distances[entry.index] + stepCost
      if (candidate >= distances[index]) continue
      distances[index] = candidate
      previous[index] = entry.index
      queue.push({ index, priority: candidate })
    }
  }

  if (!visited[endIndex]) {
    return queue.size > 0
      ? { error: `No corridor found within the ${budget}-cell expansion budget.`, exhausted: true }
      : { error: 'No finite-cell corridor connects the endpoints.' }
  }
  const indexes = reconstruct(previous, endIndex)
  const cells = indexes.map((index): GridCorridorCell => {
    const { row, col } = cellFromIndex(ctx, index)
    const value = finiteValue(ctx, row, col)
    if (value === null) throw new Error('Corridor reconstruction crossed a no-data cell.')
    return {
      row,
      col,
      position: cellPosition(ctx, row, col),
      value,
      normalizedValue: normalizedValue(ctx, value),
      traversalCost: traversalCost(ctx, value),
    }
  })
  let lengthM = 0
  for (let index = 1; index < cells.length; index++) {
    const from = cells[index - 1].position
    const to = cells[index].position
    lengthM += haversineM(from[1], from[0], to[1], to[0])
  }
  return {
    preference: ctx.preference,
    start,
    end,
    cells,
    totalCost: distances[endIndex],
    lengthM,
    expandedCells,
    stats: summariseNumeric(cells.map((cell) => cell.value)).stats,
  }
}

export function findGridCorridor(
  grid: NumericResultGrid,
  start: [number, number],
  end: [number, number],
  options: GridCorridorOptions = {},
): GridCorridorResult {
  const ctx = corridorContext(grid, options, DEFAULT_SINGLE_CORRIDOR_MAX_EXPANDED)
  if ('error' in ctx) return ctx
  const solved = solveCorridor(ctx, start, end)
  return 'error' in solved ? { error: solved.error } : solved
}
