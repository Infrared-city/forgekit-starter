import type { Layer } from 'deck.gl'
import { COORDINATE_SYSTEM, LineLayer, PolygonLayer } from 'deck.gl'
import { computeMeshCentroid } from '../core/buildings.geo-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'

/**
 * Computes the maximum Z coordinate (height) of a mesh
 */
function computeMeshMaxZ(mesh: DotBimMesh): number {
  const coords = mesh.coordinates
  let maxZ = -Infinity
  for (let i = 2; i < coords.length; i += 3) {
    if (coords[i] > maxZ) {
      maxZ = coords[i]
    }
  }
  return maxZ === -Infinity ? 0 : maxZ
}

interface GizmoLine {
  source: [number, number, number]
  target: [number, number, number]
  color: [number, number, number, number]
  axis: 'x' | 'y'
}

interface ArrowPolygon {
  polygon: [number, number, number][]
  color: [number, number, number, number]
}

export interface GizmoLayerOptions {
  lineLength?: number
  elevation?: number
  rotation?: number // Building rotation in degrees
  dragAxis?: 'x' | 'y' | null // Which axis is being dragged
  dragDelta?: { x: number; y: number } | null // Live drag offset in meters
}

/**
 * Creates arrow head triangle polygon with base at axis end, tip extending outward
 */
function createArrowPolygon(
  axisEnd: [number, number, number],
  dirX: number,
  dirY: number,
  size: number,
): [number, number, number][] {
  const perpX = -dirY
  const perpY = dirX
  const halfWidth = size * 0.5
  const tipOffset = size

  // Tip extends OUTWARD from axis end (in direction of axis)
  const tip: [number, number, number] = [
    axisEnd[0] + dirX * tipOffset,
    axisEnd[1] + dirY * tipOffset,
    axisEnd[2],
  ]

  // Base vertices are AT the axis end, spread perpendicular
  return [
    tip,
    [axisEnd[0] + perpX * halfWidth, axisEnd[1] + perpY * halfWidth, axisEnd[2]],
    [axisEnd[0] - perpX * halfWidth, axisEnd[1] - perpY * halfWidth, axisEnd[2]],
  ]
}

/**
 * Creates gizmo layers (LineLayer + PolygonLayer) displaying building-aligned X/Y orientation axes
 * at the building centroid. Uses METER_OFFSETS coordinate system.
 * - X-axis (red): aligned with building's local X direction (rotated by building rotation)
 * - Y-axis (green): aligned with building's local Y direction (perpendicular to X)
 * - Arrow heads at end of each axis
 * - Interactive: pickable lines for dragging
 */
export function createGizmoLayers(
  mesh: DotBimMesh,
  origin: [number, number],
  options: GizmoLayerOptions = {},
): Layer[] {
  const {
    lineLength = 20,
    elevation = 5,
    rotation = 0,
    dragAxis = null,
    dragDelta = null,
  } = options

  const centroid = computeMeshCentroid(mesh)
  const maxZ = computeMeshMaxZ(mesh)
  const gizmoZ = maxZ + elevation // Place gizmo above the building
  const angleRad = (rotation * Math.PI) / 180

  // Building-aligned axis directions
  // X-axis direction (rotated from +X)
  const xDirX = Math.cos(angleRad)
  const xDirY = Math.sin(angleRad)

  // Y-axis direction (perpendicular to X, rotated from +Y)
  const yDirX = -Math.sin(angleRad)
  const yDirY = Math.cos(angleRad)

  // Compute effective lengths based on drag
  let effectiveXLength = lineLength
  let effectiveYLength = lineLength

  if (dragDelta && dragAxis) {
    const { x: dx, y: dy } = dragDelta

    if (dragAxis === 'x') {
      // Project onto X direction
      const projection = dx * xDirX + dy * xDirY
      effectiveXLength = lineLength + projection
    } else if (dragAxis === 'y') {
      // Project onto Y direction
      const projection = dx * yDirX + dy * yDirY
      effectiveYLength = lineLength + projection
    }
  }

  // Axis endpoints - positioned above the building
  const xAxisEnd: [number, number, number] = [
    centroid.x + effectiveXLength * xDirX,
    centroid.y + effectiveXLength * xDirY,
    gizmoZ,
  ]

  const yAxisEnd: [number, number, number] = [
    centroid.x + effectiveYLength * yDirX,
    centroid.y + effectiveYLength * yDirY,
    gizmoZ,
  ]

  const basePosition: [number, number, number] = [centroid.x, centroid.y, gizmoZ]

  // Line data
  const lines: GizmoLine[] = [
    {
      source: basePosition,
      target: xAxisEnd,
      color: [255, 0, 0, 255],
      axis: 'x',
    },
    {
      source: basePosition,
      target: yAxisEnd,
      color: [0, 255, 0, 255],
      axis: 'y',
    },
  ]

  // Arrow data - increased size for better visibility
  const arrows: ArrowPolygon[] = [
    {
      polygon: createArrowPolygon(xAxisEnd, xDirX, xDirY, 5),
      color: [255, 0, 0, 255],
    },
    {
      polygon: createArrowPolygon(yAxisEnd, yDirX, yDirY, 5),
      color: [0, 255, 0, 255],
    },
  ]

  // Outline layer (black, wider, behind main lines) for better visibility
  const outlineLayer = new LineLayer({
    id: 'gizmo-lines-outline',
    data: lines,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getColor: [0, 0, 0, 200],
    getWidth: 12,
    widthUnits: 'pixels',
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [origin[0], origin[1], 0],
  })

  const lineLayer = new LineLayer({
    id: 'gizmo-lines',
    data: lines,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getColor: (d) => d.color,
    getWidth: 8,
    widthUnits: 'pixels',
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [origin[0], origin[1], 0],
  })

  const arrowLayer = new PolygonLayer({
    id: 'gizmo-arrows',
    data: arrows,
    getPolygon: (d) => d.polygon,
    getFillColor: (d) => d.color,
    filled: true,
    stroked: false,
    extruded: false,
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [origin[0], origin[1], 0],
  })

  return [outlineLayer, lineLayer, arrowLayer]
}
