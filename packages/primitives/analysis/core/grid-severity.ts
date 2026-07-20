// ABOUTME: Ranks multi-metric severity hotspots across registration-aligned result grids.
// ABOUTME: Percentile-normalizes each metric so unlike units combine without named thresholds.

import { alignNumericGrid, type NumericResultGrid } from './grid-alignment'
import {
  centroidToLonLat,
  componentToPolygon,
  connectedComponents,
  type MaskComponent,
} from './grid-mask-polygon'
import { haversineM, quantile } from './sample-stats'

export type SeverityDirection = 'higher-is-worse' | 'lower-is-worse'
export type SeverityCombineMode = 'weighted-mean' | 'max'

export interface SeverityMetricInput {
  id: string
  label?: string
  grid: NumericResultGrid
  direction: SeverityDirection
  /** Relative weight for weighted-mean combining. Defaults to 1. */
  weight?: number
}

export interface SeverityMetricSummary {
  id: string
  label: string
  direction: SeverityDirection
  weight: number
  /** Share of the target frame's combined cells this metric contributed to. */
  coverage: number
}

export interface SeverityRegionMetricStats {
  id: string
  label: string
  /** Mean raw metric value inside the region (original units). */
  meanValue: number
  /** Worst raw value by the metric's direction (max or min). */
  worstValue: number
  meanSeverity: number
}

export interface SeverityRegion {
  id: string
  rank: number
  cellCount: number
  shareOfFinite: number
  approxAreaM2: number
  centroid: [number, number]
  polygon: Array<[number, number]> | null
  holeCount: number
  severity: { mean: number; min: number; max: number; p50: number }
  metrics: SeverityRegionMetricStats[]
}

export interface SeverityHotspotsResult {
  gridShape: [number, number]
  gridBounds: NumericResultGrid['gridBounds']
  combine: SeverityCombineMode
  topShare: number
  /** Combined-severity cutoff that defines a hotspot cell (0..1). */
  severityThreshold: number
  totalFinite: number
  hotspotCellCount: number
  metrics: SeverityMetricSummary[]
  regions: SeverityRegion[]
  warnings: string[]
}

export type RankSeverityHotspotsResult = SeverityHotspotsResult | { error: string }

export interface RankSeverityHotspotsOptions {
  combine?: SeverityCombineMode
  /** Top share of combined severity that counts as hotspot. Default 0.15. */
  topShare?: number
  /** Maximum ranked regions returned. Default 5, cap 10. */
  limit?: number
  /** Drop components smaller than this cell count. Default 3. */
  minCells?: number
  /** Polygon simplification budget. Default 24. */
  maxVertices?: number
}

export const MAX_SEVERITY_METRICS = 8
const DEFAULT_TOP_SHARE = 0.15
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const DEFAULT_MIN_CELLS = 3
const DEFAULT_MAX_VERTICES = 24

interface AlignedMetric {
  input: SeverityMetricInput
  label: string
  weight: number
  /** Per-cell severity 0..1 on the target frame; null off-footprint. */
  severity: (number | null)[][]
  /** Aligned raw values on the target frame (original units). */
  values: (number | null)[][]
}

function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** Percentile rank of `value` within sorted ascending `sorted` (0..1). */
function percentileOf(sorted: number[], value: number): number {
  let low = 0
  let high = sorted.length
  while (low < high) {
    const mid = (low + high) >> 1
    if (sorted[mid] <= value) low = mid + 1
    else high = mid
  }
  return sorted.length > 1 ? (low - 1) / (sorted.length - 1) : 0.5
}

function severityGrid(
  aligned: NumericResultGrid,
  direction: SeverityDirection,
  warnings: string[],
  label: string,
): (number | null)[][] {
  const [rows, cols] = aligned.gridShape
  const finite: number[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const value = finiteOrNull(aligned.mergedGrid[row]?.[col])
      if (value !== null) finite.push(value)
    }
  }
  finite.sort((a, b) => a - b)
  const constant = finite.length > 0 && finite[0] === finite[finite.length - 1]
  if (constant) {
    warnings.push(`${label} has a constant value; it cannot differentiate severity.`)
  }
  const severity: (number | null)[][] = new Array(rows)
  for (let row = 0; row < rows; row++) {
    const severityRow = new Array<number | null>(cols).fill(null)
    for (let col = 0; col < cols; col++) {
      const value = finiteOrNull(aligned.mergedGrid[row]?.[col])
      if (value === null) continue
      if (constant) {
        severityRow[col] = 0.5
        continue
      }
      const percentile = percentileOf(finite, value)
      severityRow[col] = direction === 'higher-is-worse' ? percentile : 1 - percentile
    }
    severity[row] = severityRow
  }
  return severity
}

function combineCell(
  metrics: AlignedMetric[],
  row: number,
  col: number,
  combine: SeverityCombineMode,
): number | null {
  let weightSum = 0
  let weighted = 0
  let max: number | null = null
  for (const metric of metrics) {
    const severity = metric.severity[row]?.[col]
    if (severity === null || severity === undefined) continue
    weightSum += metric.weight
    weighted += severity * metric.weight
    max = max === null ? severity : Math.max(max, severity)
  }
  if (weightSum === 0 || max === null) return null
  return combine === 'max' ? max : weighted / weightSum
}

function boundedNumber(value: number | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function cellAreaM2(grid: NumericResultGrid): number {
  const [rows, cols] = grid.gridShape
  if (rows <= 0 || cols <= 0) return 0
  const { west, south, east, north } = grid.gridBounds
  const middleLat = (south + north) / 2
  const heightM = haversineM(south, west, north, west) / rows
  const widthM = haversineM(middleLat, west, middleLat, east) / cols
  return heightM * widthM
}

function regionMetricStats(
  metrics: AlignedMetric[],
  component: MaskComponent,
): SeverityRegionMetricStats[] {
  return metrics.map((metric) => {
    let sumValue = 0
    let sumSeverity = 0
    let count = 0
    let worst: number | null = null
    for (const [row, col] of component.cells) {
      const value = finiteOrNull(metric.values[row]?.[col])
      const severity = metric.severity[row]?.[col]
      if (value === null || severity === null || severity === undefined) continue
      sumValue += value
      sumSeverity += severity
      count++
      const isWorse =
        worst === null ||
        (metric.input.direction === 'higher-is-worse' ? value > worst : value < worst)
      if (isWorse) worst = value
    }
    return {
      id: metric.input.id,
      label: metric.label,
      meanValue: count > 0 ? round2(sumValue / count) : Number.NaN,
      worstValue: worst !== null ? round2(worst) : Number.NaN,
      meanSeverity: count > 0 ? round2(sumSeverity / count) : Number.NaN,
    }
  })
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function rankSeverityHotspots(
  metricInputs: SeverityMetricInput[],
  options: RankSeverityHotspotsOptions = {},
): RankSeverityHotspotsResult {
  if (metricInputs.length === 0) return { error: 'At least one severity metric is required.' }
  if (metricInputs.length > MAX_SEVERITY_METRICS) {
    return { error: `At most ${MAX_SEVERITY_METRICS} severity metrics are supported per call.` }
  }
  if (new Set(metricInputs.map((metric) => metric.id)).size !== metricInputs.length) {
    return { error: 'Severity metric ids must be unique.' }
  }
  const target = metricInputs[0].grid
  const combine = options.combine ?? 'weighted-mean'
  const topShare = boundedNumber(options.topShare, DEFAULT_TOP_SHARE, 0.01, 0.5)
  const limit = Math.floor(boundedNumber(options.limit, DEFAULT_LIMIT, 1, MAX_LIMIT))
  const minCells = Math.floor(boundedNumber(options.minCells, DEFAULT_MIN_CELLS, 1, 10_000))
  const maxVertices = Math.floor(boundedNumber(options.maxVertices, DEFAULT_MAX_VERTICES, 4, 64))

  const warnings: string[] = []
  const aligned: AlignedMetric[] = []
  for (const input of metricInputs) {
    const alignedGrid = alignNumericGrid(target, input.grid)
    if (!alignedGrid) {
      return { error: `Metric ${input.id} has an invalid or non-georeferenced grid.` }
    }
    const label = input.label?.trim() || input.id
    if (alignedGrid.sourceCoverage < 0.5) {
      warnings.push(
        `${label} covers only ${Math.round(alignedGrid.sourceCoverage * 100)}% of the target frame; its severity is partial.`,
      )
    }
    aligned.push({
      input,
      label,
      weight: boundedNumber(input.weight, 1, 0.01, 100),
      severity: severityGrid(alignedGrid, input.direction, warnings, label),
      values: alignedGrid.mergedGrid,
    })
  }

  const [rows, cols] = target.gridShape
  const combined: (number | null)[][] = new Array(rows)
  const combinedFinite: number[] = []
  for (let row = 0; row < rows; row++) {
    const combinedRow = new Array<number | null>(cols).fill(null)
    for (let col = 0; col < cols; col++) {
      const value = combineCell(aligned, row, col, combine)
      combinedRow[col] = value
      if (value !== null) combinedFinite.push(value)
    }
    combined[row] = combinedRow
  }
  if (combinedFinite.length === 0) {
    return { error: 'No cells carry severity evidence from the selected metrics.' }
  }
  combinedFinite.sort((a, b) => a - b)
  const severityThreshold = quantile(combinedFinite, 1 - topShare)

  const mask: boolean[][] = new Array(rows)
  let hotspotCellCount = 0
  for (let row = 0; row < rows; row++) {
    const maskRow = new Array<boolean>(cols).fill(false)
    for (let col = 0; col < cols; col++) {
      const value = combined[row]?.[col]
      if (value !== null && value !== undefined && value >= severityThreshold) {
        maskRow[col] = true
        hotspotCellCount++
      }
    }
    mask[row] = maskRow
  }

  const area = cellAreaM2(target)
  const components = connectedComponents(mask, target.gridShape)
    .filter((component) => component.size >= minCells)
    .map((component) => {
      let sum = 0
      let max = 0
      let min = Number.POSITIVE_INFINITY
      const severities: number[] = []
      for (const [row, col] of component.cells) {
        const value = combined[row]?.[col]
        if (value === null || value === undefined) continue
        sum += value
        max = Math.max(max, value)
        min = Math.min(min, value)
        severities.push(value)
      }
      severities.sort((a, b) => a - b)
      return {
        component,
        severityMass: sum,
        max,
        min: Number.isFinite(min) ? min : 0,
        p50: quantile(severities, 0.5),
      }
    })
    // Severity mass (sum of combined severity) ranks large-and-severe first.
    .sort((a, b) => b.severityMass - a.severityMass)
    .slice(0, limit)

  const regions: SeverityRegion[] = components.map((entry, index) => {
    const { component } = entry
    const polygon = componentToPolygon(component, target.gridShape, target.gridBounds, maxVertices)
    const firstCell = component.cells[0] ?? [0, 0]
    return {
      id: `hotspot-r${firstCell[0]}-c${firstCell[1]}-n${component.size}`,
      rank: index + 1,
      cellCount: component.size,
      shareOfFinite: combinedFinite.length > 0 ? component.size / combinedFinite.length : 0,
      approxAreaM2: Math.round(component.size * area),
      centroid: centroidToLonLat(component, target.gridShape, target.gridBounds),
      polygon: polygon?.ring ?? null,
      holeCount: polygon?.holeCount ?? 0,
      severity: {
        mean: round2(component.size > 0 ? entry.severityMass / component.size : 0),
        min: round2(entry.min),
        max: round2(entry.max),
        p50: round2(entry.p50),
      },
      metrics: regionMetricStats(aligned, component),
    }
  })

  const metricsSummaries: SeverityMetricSummary[] = aligned.map((metric) => {
    let contributing = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (combined[row]?.[col] === null || combined[row]?.[col] === undefined) continue
        if (metric.severity[row]?.[col] !== null && metric.severity[row]?.[col] !== undefined) {
          contributing++
        }
      }
    }
    return {
      id: metric.input.id,
      label: metric.label,
      direction: metric.input.direction,
      weight: metric.weight,
      coverage: combinedFinite.length > 0 ? round2(contributing / combinedFinite.length) : 0,
    }
  })

  return {
    gridShape: [...target.gridShape],
    gridBounds: { ...target.gridBounds },
    combine,
    topShare,
    severityThreshold: round2(severityThreshold),
    totalFinite: combinedFinite.length,
    hotspotCellCount,
    metrics: metricsSummaries,
    regions,
    warnings,
  }
}
