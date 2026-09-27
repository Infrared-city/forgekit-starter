// The ground of the demo scene: a 2 m raster of materials (asphalt, concrete,
// grass, water, sand), turned into non-overlapping GeoJSON layers for the SDK.
// Also the georeference: metres from the south-west corner <-> [lon, lat].

import type { Variant } from './scene.ts'
import {
  COURTYARD,
  DEMO_CENTER,
  GREEN_STREET,
  HILL,
  LAKE,
  LAKE_RING,
  MAIN_STREET,
  PATHS,
  PLAYGROUND,
  type Rect,
  SCENE_SIZE_M,
  STREETS,
} from './scene-layout.ts'

export type Feature = {
  type: 'Feature'
  geometry: Record<string, unknown>
  properties: Record<string, unknown>
}
export type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] }

/** Ground classes on a 2 m raster, and the SDK layer name of each. */
export const GROUND_CELL_M = 2
export const GROUND_N = SCENE_SIZE_M / GROUND_CELL_M
export const GROUND_LAYERS = ['concrete', 'asphalt', 'vegetation', 'water', 'soil'] as const
const CONCRETE = 0
const ASPHALT = 1
const GRASS = 2
const WATER = 3
const SOIL = 4

// ---- Georeference -----------------------------------------------------------
// The same local projection the Infrared kernel uses (spherical Earth, the
// south-west corner as origin). 256 m to each side of DEMO_CENTER.
const R = 6_371_000
const DEG = Math.PI / 180
const HALF = SCENE_SIZE_M / 2
export const ORIGIN = {
  lat: DEMO_CENTER.lat - HALF / (R * DEG),
  lon: DEMO_CENTER.lon - HALF / (R * DEG * Math.cos((DEMO_CENTER.lat - HALF / (R * DEG)) * DEG)),
}
const M_PER_DEG_LAT = R * DEG
const M_PER_DEG_LON = R * DEG * Math.cos(ORIGIN.lat * DEG)

export function toLonLat(x: number, y: number): [number, number] {
  return [ORIGIN.lon + x / M_PER_DEG_LON, ORIGIN.lat + y / M_PER_DEG_LAT]
}

/** The analysis area: the 512 m square, as a GeoJSON polygon ([lon, lat]). */
export const DEMO_POLYGON = {
  type: 'Polygon' as const,
  coordinates: [
    [
      toLonLat(0, 0),
      toLonLat(SCENE_SIZE_M, 0),
      toLonLat(SCENE_SIZE_M, SCENE_SIZE_M),
      toLonLat(0, SCENE_SIZE_M),
      toLonLat(0, 0),
    ],
  ],
}

export const inRect = (x: number, y: number, [x0, y0, x1, y1]: Rect) =>
  x >= x0 && x < x1 && y >= y0 && y < y1

/** Height of the terrain (the hill) at (x, y), in metres. */
export function terrainHeight(x: number, y: number): number {
  const r = Math.hypot(x - HILL.cx, y - HILL.cy)
  if (r >= HILL.radius) return 0
  return HILL.height * 0.5 * (1 + Math.cos((Math.PI * r) / HILL.radius))
}

export function inLake(x: number, y: number, grow = 0): boolean {
  const dx = (x - LAKE.cx) / (LAKE.rx + grow)
  const dy = (y - LAKE.cy) / (LAKE.ry + grow)
  return dx * dx + dy * dy <= 1
}

/** A smooth curve through the control points (Catmull-Rom), as short segments. */
function smooth(points: ReadonlyArray<readonly [number, number]>): Array<[number, number]> {
  const out: Array<[number, number]> = []
  const p = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))]
  for (let i = 0; i < points.length - 1; i++) {
    for (let k = 0; k < 12; k++) {
      const t = k / 12
      const [a, b, c, d] = [p(i - 1), p(i), p(i + 1), p(i + 2)]
      const f = (j: 0 | 1) =>
        0.5 *
        (2 * b[j] +
          (-a[j] + c[j]) * t +
          (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t +
          (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t)
      out.push([f(0), f(1)])
    }
  }
  out.push([...points[points.length - 1]] as [number, number])
  return out
}
const CURVES = PATHS.map((p) => ({ half: p.width / 2, line: smooth(p.points) }))

export function nearCurve(x: number, y: number): boolean {
  for (const { half, line } of CURVES) {
    for (let i = 0; i < line.length - 1; i++) {
      const [ax, ay] = line[i]
      const [bx, by] = line[i + 1]
      const vx = bx - ax
      const vy = by - ay
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)))
      if (Math.hypot(x - ax - t * vx, y - ay - t * vy) <= half) return true
    }
  }
  return false
}

// ---- Ground -----------------------------------------------------------------------

function mainStreetClass(x: number, variant: Variant): number {
  const { x0, x1, sidewalk } = MAIN_STREET
  if (x < x0 + sidewalk || x >= x1 - sidewalk) return CONCRETE
  if (variant === 'baseline') return ASPHALT
  return x >= GREEN_STREET.asphaltX0 && x < GREEN_STREET.asphaltX1 ? ASPHALT : GRASS
}

export function streetClass(x: number, y: number): number | null {
  let hit: number | null = null
  for (const s of STREETS) {
    if (!inRect(x, y, s.rect)) continue
    const [x0, y0, x1, y1] = s.rect
    const northSouth = x1 - x0 < y1 - y0
    const [p, a, b] = northSouth ? [x, x0, x1] : [y, y0, y1]
    if (p >= a + s.sidewalk && p < b - s.sidewalk) return ASPHALT
    hit = CONCRETE
  }
  return hit
}

function groundClass(x: number, y: number, variant: Variant): number {
  if (x < 256) {
    // Cross streets run through the main street: their asphalt wins there.
    const street = streetClass(x, y)
    if (street === ASPHALT) return ASPHALT
    if (x >= MAIN_STREET.x0 && x < MAIN_STREET.x1) return mainStreetClass(x, variant)
    if (street !== null) return street
    const [cx0, cy0, cx1, cy1] = COURTYARD.rect
    const d = COURTYARD.depth
    if (inRect(x, y, [cx0 + d, cy0 + d, cx1 - d, cy1 - d])) return GRASS
    return CONCRETE // forecourts, plazas, the ground under the buildings
  }
  if (inLake(x, y)) return WATER
  const ring = inLake(x, y, LAKE_RING.offset + LAKE_RING.width) && !inLake(x, y, LAKE_RING.offset)
  if (ring || nearCurve(x, y)) return CONCRETE
  if (inRect(x, y, PLAYGROUND)) return SOIL
  return GRASS
}

/** The ground raster: GROUND_N x GROUND_N cells of 2 m, row 0 = SOUTH edge. */
export function groundRaster(variant: Variant): Uint8Array {
  const out = new Uint8Array(GROUND_N * GROUND_N)
  for (let r = 0; r < GROUND_N; r++) {
    for (let c = 0; c < GROUND_N; c++) {
      out[r * GROUND_N + c] = groundClass(
        (c + 0.5) * GROUND_CELL_M,
        (r + 0.5) * GROUND_CELL_M,
        variant,
      )
    }
  }
  return out
}

/**
 * The raster as GeoJSON layers. Rows of equal cells become rectangles, and equal
 * rectangles on consecutive rows merge, so the layers never overlap (the SDK
 * would otherwise pick a winner by its own material order).
 */
export function groundLayers(raster: Uint8Array): Record<string, FeatureCollection> {
  const layers: Record<string, FeatureCollection> = {}
  for (const name of GROUND_LAYERS) layers[name] = { type: 'FeatureCollection', features: [] }
  let open = new Map<string, { c0: number; c1: number; cls: number; r0: number }>()
  const emit = (run: { c0: number; c1: number; cls: number; r0: number }, r1: number) => {
    const [x0, y0, x1, y1] = [run.c0, run.r0, run.c1, r1].map((v) => v * GROUND_CELL_M)
    const ring = [
      toLonLat(x0, y0),
      toLonLat(x1, y0),
      toLonLat(x1, y1),
      toLonLat(x0, y1),
      toLonLat(x0, y0),
    ]
    layers[GROUND_LAYERS[run.cls]].features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [ring.map(([lon, lat]) => [lon, lat, 0])] },
      properties: {},
    })
  }
  for (let r = 0; r <= GROUND_N; r++) {
    const next = new Map<string, { c0: number; c1: number; cls: number; r0: number }>()
    if (r < GROUND_N) {
      let c0 = 0
      for (let c = 1; c <= GROUND_N; c++) {
        const cls = raster[r * GROUND_N + c0]
        if (c < GROUND_N && raster[r * GROUND_N + c] === cls) continue
        const key = `${c0}:${c}:${cls}`
        next.set(key, open.get(key) ?? { c0, c1: c, cls, r0: r })
        c0 = c
      }
    }
    for (const [key, run] of open) if (!next.has(key)) emit(run, r)
    open = next
  }
  return layers
}
