// ABOUTME: Samples ordered numeric result values along georeferenced multi-segment paths.
// ABOUTME: Returns bounded distance profiles with exact grid cells and aggregate statistics.

import type { AreaRunResult } from './analysis.types'
import { haversineM, summariseNumeric } from './sample-stats'
import type { SampleStats } from './sampling'

export interface PathSamplePoint {
  index: number
  distanceM: number
  position: [number, number]
  row: number | null
  col: number | null
  value: number | null
}

export interface NumericPathProfile {
  lengthM: number
  spacingM: number
  finiteCount: number
  points: PathSamplePoint[]
  stats: SampleStats | null
}

export interface PathSamplingOptions {
  /** Desired maximum distance between samples. Defaults to 25 m. */
  spacingM?: number
  /** Hard profile-size bound including both endpoints. Defaults to 512. */
  maxSamples?: number
}

interface Segment {
  from: [number, number]
  to: [number, number]
  startM: number
  lengthM: number
}

const DEFAULT_SPACING_M = 25
const DEFAULT_MAX_SAMPLES = 512
const MAX_SAMPLES_LIMIT = 2_048

function positive(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

function sampleLimit(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_MAX_SAMPLES
  return Math.min(MAX_SAMPLES_LIMIT, Math.max(2, Math.floor(value)))
}

function buildSegments(coordinates: [number, number][]): Segment[] {
  const segments: Segment[] = []
  let startM = 0
  for (let index = 1; index < coordinates.length; index++) {
    const from = coordinates[index - 1]
    const to = coordinates[index]
    const lengthM = haversineM(from[1], from[0], to[1], to[0])
    if (!(lengthM > 0)) continue
    segments.push({ from, to, startM, lengthM })
    startM += lengthM
  }
  return segments
}

export function pathLengthM(coordinates: [number, number][]): number {
  const segments = buildSegments(coordinates)
  const lastSegment = segments[segments.length - 1]
  return lastSegment ? lastSegment.startM + lastSegment.lengthM : 0
}

function positionAt(segments: Segment[], distanceM: number): [number, number] {
  const last = segments[segments.length - 1]
  const segment =
    segments.find((candidate) => distanceM <= candidate.startM + candidate.lengthM) ?? last
  const progress = Math.min(1, Math.max(0, (distanceM - segment.startM) / segment.lengthM))
  return [
    segment.from[0] + (segment.to[0] - segment.from[0]) * progress,
    segment.from[1] + (segment.to[1] - segment.from[1]) * progress,
  ]
}

function gridValueAt(
  grid: AreaRunResult,
  position: [number, number],
): Pick<PathSamplePoint, 'row' | 'col' | 'value'> {
  const [rows, cols] = grid.gridShape
  const { west, south, east, north } = grid.gridBounds
  const [lon, lat] = position
  if (
    !(rows > 0) ||
    !(cols > 0) ||
    !(east > west) ||
    !(north > south) ||
    lon < west ||
    lon > east ||
    lat < south ||
    lat > north
  ) {
    return { row: null, col: null, value: null }
  }
  const row = Math.min(rows - 1, Math.floor(((lat - south) / (north - south)) * rows))
  const col = Math.min(cols - 1, Math.floor(((lon - west) / (east - west)) * cols))
  const value = grid.mergedGrid[row]?.[col]
  return {
    row,
    col,
    value: typeof value === 'number' && Number.isFinite(value) ? value : null,
  }
}

export function sampleNumericPath(
  grid: AreaRunResult,
  coordinates: [number, number][],
  options: PathSamplingOptions = {},
): NumericPathProfile | null {
  if (coordinates.length < 2) return null
  const [rows, cols] = grid.gridShape
  if (!(rows > 0) || !(cols > 0) || !Array.isArray(grid.mergedGrid)) return null
  const segments = buildSegments(coordinates)
  if (segments.length === 0) return null

  const lengthM = pathLengthM(coordinates)
  if (!Number.isFinite(lengthM)) return null
  const desiredSpacingM = positive(options.spacingM, DEFAULT_SPACING_M)
  const intervals = Math.min(
    Math.ceil(lengthM / desiredSpacingM),
    sampleLimit(options.maxSamples) - 1,
  )
  const spacingM = lengthM / intervals
  const points: PathSamplePoint[] = []
  const values: number[] = []

  for (let index = 0; index <= intervals; index++) {
    const distanceM = index === intervals ? lengthM : index * spacingM
    const position =
      index === 0
        ? coordinates[0]
        : index === intervals
          ? coordinates[coordinates.length - 1]
          : positionAt(segments, distanceM)
    const sample = gridValueAt(grid, position)
    if (sample.value !== null) values.push(sample.value)
    points.push({ index, distanceM, position, ...sample })
  }

  return {
    lengthM,
    spacingM,
    finiteCount: values.length,
    points,
    stats: values.length > 0 ? summariseNumeric(values).stats : null,
  }
}
