// ABOUTME: Finds and ranks deterministic spatial regions from filtered numeric result grids.
// ABOUTME: Returns exact patch statistics and georeferenced polygon evidence without model vision.

import type { AreaRunResult } from './analysis.types'
import { alignNumericGrid, type NumericResultGrid } from './grid-alignment'
import { computeFilterMask, type HighlightPredicate, resolveHighlight } from './grid-filter'
import {
  centroidToLonLat,
  componentToPolygon,
  connectedComponents,
  type MaskComponent,
} from './grid-mask-polygon'
import { haversineM, quantile } from './sample-stats'

export type RegionRankBy = 'cells' | 'mean' | 'max'

export interface FindResultRegionsOptions {
  /** Drop components smaller than this exact matched-cell count. Defaults to 1. */
  minCells?: number
  /** Maximum ranked components returned. Defaults to 10 and caps at 50. */
  limit?: number
  /** Primary descending rank. Deterministic scan order breaks final ties. */
  rankBy?: RegionRankBy
  /** Polygon simplification budget. Defaults to 24 vertices. */
  maxVertices?: number
  /** Condition whose values drive mean/max ranking for combined queries. */
  rankConditionId?: string
}

export interface ResultRegionStats {
  count: number
  mean: number
  min: number
  max: number
  p50: number
}

export interface ResultRegion {
  id: string
  rank: number
  cellCount: number
  shareOfFinite: number
  shareOfMatches: number
  approxAreaM2: number
  centroid: [number, number]
  polygon: Array<[number, number]> | null
  holeCount: number
  stats: ResultRegionStats
  conditionStats?: ResultRegionConditionStats[]
}

export type RegionCombineMode = 'all' | 'any'

export interface ResultRegionConditionInput {
  id: string
  label?: string
  grid: NumericResultGrid
  predicate: HighlightPredicate
}

export interface ResultRegionConditionSummary {
  id: string
  label: string
  rule: string
  resolvedThreshold: number | null
  resolvedRange: { min: number; max: number } | null
  matchCount: number
  totalFinite: number
  matchShare: number
  sourceCoverage: number
}

export interface ResultRegionConditionStats {
  id: string
  label: string
  stats: ResultRegionStats
}

export interface ResultRegionQuery {
  rule: string
  resolvedThreshold: number | null
  resolvedRange: { min: number; max: number } | null
  matchCount: number
  totalFinite: number
  matchShare: number
  matchedValueRange: { min: number; max: number } | null
  componentCount: number
  regions: ResultRegion[]
  combine?: RegionCombineMode
  conditions?: ResultRegionConditionSummary[]
  rankConditionId?: string
}

export type FindResultRegionsResult = ResultRegionQuery | { error: string }

type NumericGrid = Pick<AreaRunResult, 'gridShape' | 'gridBounds'> & {
  mergedGrid: (number | null)[][]
}

interface AlignedCondition {
  id: string
  label: string
  grid: NumericResultGrid
}

interface RegionCandidate extends Omit<ResultRegion, 'rank'> {
  scanIndex: number
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50
const DEFAULT_MAX_VERTICES = 24

function positiveInteger(value: number | undefined, fallback: number, maximum?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const integer = Math.max(1, Math.floor(value))
  return maximum === undefined ? integer : Math.min(maximum, integer)
}

function valuesForComponent(grid: NumericGrid, component: MaskComponent): number[] {
  const values: number[] = []
  for (const [row, col] of component.cells) {
    const value = grid.mergedGrid[row]?.[col]
    if (value !== null && value !== undefined && Number.isFinite(value)) values.push(value)
  }
  return values
}

function statsFor(values: number[]): ResultRegionStats {
  const sorted = [...values].sort((a, b) => a - b)
  let sum = 0
  for (const value of values) sum += value
  return {
    count: values.length,
    mean: values.length > 0 ? sum / values.length : 0,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    p50: quantile(sorted, 0.5),
  }
}

function approximateCellAreaM2(grid: NumericGrid): number {
  const [rows, cols] = grid.gridShape
  if (rows <= 0 || cols <= 0) return 0
  const { west, south, east, north } = grid.gridBounds
  const middleLat = (south + north) / 2
  const heightM = haversineM(south, west, north, west) / rows
  const widthM = haversineM(middleLat, west, middleLat, east) / cols
  return heightM * widthM
}

function candidateFor(
  grid: NumericGrid,
  component: MaskComponent,
  scanIndex: number,
  totalFinite: number,
  matchCount: number,
  cellAreaM2: number,
  maxVertices: number,
  conditions?: AlignedCondition[],
): RegionCandidate {
  const values = valuesForComponent(grid, component)
  const polygon = componentToPolygon(component, grid.gridShape, grid.gridBounds, maxVertices)
  const firstCell = component.cells[0] ?? [0, 0]
  return {
    id: `region-r${firstCell[0]}-c${firstCell[1]}-n${component.size}`,
    scanIndex,
    cellCount: component.size,
    shareOfFinite: totalFinite > 0 ? component.size / totalFinite : 0,
    shareOfMatches: matchCount > 0 ? component.size / matchCount : 0,
    approxAreaM2: component.size * cellAreaM2,
    centroid: centroidToLonLat(component, grid.gridShape, grid.gridBounds),
    polygon: polygon?.ring ?? null,
    holeCount: polygon?.holeCount ?? 0,
    stats: statsFor(values),
    conditionStats: conditions?.map((condition) => ({
      id: condition.id,
      label: condition.label,
      stats: statsFor(valuesForComponent(condition.grid, component)),
    })),
  }
}

function conditionStatsFor(
  candidate: RegionCandidate,
  rankConditionId: string | undefined,
): ResultRegionStats {
  if (!rankConditionId) return candidate.stats
  return (
    candidate.conditionStats?.find((condition) => condition.id === rankConditionId)?.stats ??
    candidate.stats
  )
}

function compareCandidates(
  rankBy: RegionRankBy,
  rankConditionId: string | undefined,
  a: RegionCandidate,
  b: RegionCandidate,
): number {
  const aStats = conditionStatsFor(a, rankConditionId)
  const bStats = conditionStatsFor(b, rankConditionId)
  const primary =
    rankBy === 'mean'
      ? bStats.mean - aStats.mean
      : rankBy === 'max'
        ? bStats.max - aStats.max
        : b.cellCount - a.cellCount
  if (primary !== 0) return primary
  const bySize = b.cellCount - a.cellCount
  return bySize !== 0 ? bySize : a.scanIndex - b.scanIndex
}

/** Resolve one numeric predicate and return its ranked 4-connected regions. */
export function findResultRegions(
  grid: NumericGrid,
  predicate: HighlightPredicate,
  options: FindResultRegionsOptions = {},
): FindResultRegionsResult {
  const resolved = resolveHighlight(predicate, grid.mergedGrid)
  if (!resolved) {
    return {
      error:
        'Could not resolve the region predicate - check op/value/percent (percentile filters need finite result cells).',
    }
  }

  const filter = computeFilterMask(grid.mergedGrid, grid.gridShape, resolved)
  const components = connectedComponents(filter.mask, grid.gridShape)
  const minCells = positiveInteger(options.minCells, 1)
  const limit = positiveInteger(options.limit, DEFAULT_LIMIT, MAX_LIMIT)
  const maxVertices = positiveInteger(options.maxVertices, DEFAULT_MAX_VERTICES)
  const rankBy = options.rankBy ?? 'cells'
  const cellAreaM2 = approximateCellAreaM2(grid)
  const regions = components
    .map((component, scanIndex) =>
      candidateFor(
        grid,
        component,
        scanIndex,
        filter.totalFinite,
        filter.matchCount,
        cellAreaM2,
        maxVertices,
      ),
    )
    .filter((candidate) => candidate.cellCount >= minCells)
    .sort((a, b) => compareCandidates(rankBy, undefined, a, b))
    .slice(0, limit)
    .map(({ scanIndex: _scanIndex, ...region }, index) => ({ ...region, rank: index + 1 }))

  return {
    rule: resolved.description,
    resolvedThreshold: resolved.resolvedThreshold,
    resolvedRange: resolved.resolvedRange,
    matchCount: filter.matchCount,
    totalFinite: filter.totalFinite,
    matchShare: filter.matchShare,
    matchedValueRange:
      filter.matchedMin !== null && filter.matchedMax !== null
        ? { min: filter.matchedMin, max: filter.matchedMax }
        : null,
    componentCount: components.length,
    regions,
  }
}

function isFiniteCell(grid: NumericResultGrid, row: number, col: number): boolean {
  const value = grid.mergedGrid[row]?.[col]
  return value !== null && value !== undefined && Number.isFinite(value)
}

/** Combine predicates over georeferenced grids and return exact ranked patches. */
export function findCombinedResultRegions(
  conditions: ResultRegionConditionInput[],
  combine: RegionCombineMode = 'all',
  options: FindResultRegionsOptions = {},
): FindResultRegionsResult {
  if (conditions.length === 0) return { error: 'At least one region condition is required.' }
  const ids = new Set<string>()
  for (const condition of conditions) {
    if (ids.has(condition.id)) return { error: `Duplicate region condition: ${condition.id}.` }
    ids.add(condition.id)
  }
  if (options.rankConditionId && !ids.has(options.rankConditionId)) {
    return { error: `Unknown rank condition: ${options.rankConditionId}.` }
  }

  const target = conditions[0].grid
  const aligned = conditions.map((condition) => {
    const resolved = resolveHighlight(condition.predicate, condition.grid.mergedGrid)
    const grid = alignNumericGrid(target, condition.grid)
    if (!resolved || !grid) return null
    return {
      id: condition.id,
      label: condition.label?.trim() || condition.id,
      resolved,
      grid,
      filter: computeFilterMask(grid.mergedGrid, grid.gridShape, resolved),
    }
  })
  const invalidIndex = aligned.indexOf(null)
  if (invalidIndex !== -1) {
    return { error: `Could not resolve region condition: ${conditions[invalidIndex].id}.` }
  }
  const resolvedConditions = aligned.filter(
    (condition): condition is NonNullable<typeof condition> => Boolean(condition),
  )
  const [rows, cols] = target.gridShape
  const mask: boolean[][] = []
  const conditionMatches = new Array<number>(resolvedConditions.length).fill(0)
  let totalFinite = 0
  let matchCount = 0
  let matchedMin = Number.POSITIVE_INFINITY
  let matchedMax = Number.NEGATIVE_INFINITY

  for (let row = 0; row < rows; row++) {
    const maskRow = new Array<boolean>(cols).fill(false)
    for (let col = 0; col < cols; col++) {
      if (!resolvedConditions.every((condition) => isFiniteCell(condition.grid, row, col))) {
        continue
      }
      totalFinite++
      const matches = resolvedConditions.map((condition, index) => {
        const matchesCondition = condition.filter.mask[row]?.[col] === true
        if (matchesCondition) conditionMatches[index]++
        return matchesCondition
      })
      const matchesCombined = combine === 'any' ? matches.some(Boolean) : matches.every(Boolean)
      if (!matchesCombined) continue
      maskRow[col] = true
      matchCount++
      const anchorValue = resolvedConditions[0].grid.mergedGrid[row]?.[col]
      if (typeof anchorValue === 'number' && Number.isFinite(anchorValue)) {
        matchedMin = Math.min(matchedMin, anchorValue)
        matchedMax = Math.max(matchedMax, anchorValue)
      }
    }
    mask.push(maskRow)
  }

  const components = connectedComponents(mask, target.gridShape)
  const minCells = positiveInteger(options.minCells, 1)
  const limit = positiveInteger(options.limit, DEFAULT_LIMIT, MAX_LIMIT)
  const maxVertices = positiveInteger(options.maxVertices, DEFAULT_MAX_VERTICES)
  const rankBy = options.rankBy ?? 'cells'
  const cellAreaM2 = approximateCellAreaM2(target)
  const regionConditions = resolvedConditions.map(({ id, label, grid }) => ({ id, label, grid }))
  const regions = components
    .map((component, scanIndex) =>
      candidateFor(
        target,
        component,
        scanIndex,
        totalFinite,
        matchCount,
        cellAreaM2,
        maxVertices,
        regionConditions,
      ),
    )
    .filter((candidate) => candidate.cellCount >= minCells)
    .sort((a, b) => compareCandidates(rankBy, options.rankConditionId, a, b))
    .slice(0, limit)
    .map(({ scanIndex: _scanIndex, ...region }, index) => ({ ...region, rank: index + 1 }))
  const joiner = combine === 'any' ? ' OR ' : ' AND '

  return {
    rule: resolvedConditions
      .map((condition) => `${condition.label} ${condition.resolved.description}`)
      .join(joiner),
    resolvedThreshold: null,
    resolvedRange: null,
    matchCount,
    totalFinite,
    matchShare: totalFinite > 0 ? matchCount / totalFinite : 0,
    matchedValueRange: matchCount > 0 ? { min: matchedMin, max: matchedMax } : null,
    componentCount: components.length,
    regions,
    combine,
    conditions: resolvedConditions.map((condition, index) => ({
      id: condition.id,
      label: condition.label,
      rule: condition.resolved.description,
      resolvedThreshold: condition.resolved.resolvedThreshold,
      resolvedRange: condition.resolved.resolvedRange,
      matchCount: conditionMatches[index],
      totalFinite,
      matchShare: totalFinite > 0 ? conditionMatches[index] / totalFinite : 0,
      sourceCoverage: condition.grid.sourceCoverage,
    })),
    rankConditionId: options.rankConditionId ?? resolvedConditions[0].id,
  }
}
