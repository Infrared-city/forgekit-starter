// Builds the demo scene from scene-layout.ts. Deterministic: the same variant
// always gives the same geometry, so the pre-computed results stay valid.
//
// Everything here is a plain SDK input:
//   buildings      { id: { mesh_id, coordinates: [x,y,z,...], indices } }  metres, SW frame
//   vegetation     { id: GeoJSON Point feature }  [lon, lat], height_m, diameter_m, genus
//   groundMaterials{ layer: GeoJSON FeatureCollection }  asphalt, concrete, vegetation, water, soil
//   groundGeometry { id: mesh }  the terrain (the hill), metres, SW frame
//
// The ground raster and the georeference are in ground.ts.

import {
  type FeatureCollection,
  groundLayers,
  groundRaster,
  inLake,
  inRect,
  nearCurve,
  streetClass,
  terrainHeight,
  toLonLat,
} from './ground.ts'
import {
  BLOCKS,
  COURTYARD,
  COURTYARD_TREES,
  GREEN_STREET,
  LAKE_RING,
  MAIN_STREET,
  PLAYGROUND,
  type Rect,
  SCENE_SIZE_M,
  TREE_CLUSTERS,
} from './scene-layout.ts'

export {
  DEMO_POLYGON,
  GROUND_CELL_M,
  GROUND_LAYERS,
  GROUND_N,
  groundRaster,
  ORIGIN,
  terrainHeight,
  toLonLat,
} from './ground.ts'

// The scenarios. To add one, see "Add a variant" in AGENTS.md.
export type Variant = 'baseline' | 'greener-street'
export const VARIANTS: readonly Variant[] = ['baseline', 'greener-street']
export const VARIANT_INFO: Record<Variant, { label: string; what: string }> = {
  baseline: { label: 'Baseline', what: 'The site as it is.' },
  'greener-street': {
    label: 'Greener street',
    what: 'Linden Street keeps 7 m of asphalt instead of 18 m, gets grass strips and two rows of lime trees. Everything else is the same.',
  },
}

export interface Mesh {
  mesh_id: number
  coordinates: number[]
  indices: number[]
}
export interface Box {
  id: string
  rect: Rect
  height: number
}
export interface Tree {
  id: string
  x: number
  y: number
  genus: string
  height: number
  crown: number
}
type Feature = FeatureCollection['features'][number]

// ---- Small helpers ------------------------------------------------------------

/** A seeded random number generator (mulberry32), so every run is the same. */
function random(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- Buildings, trees, terrain ------------------------------------------------------

/** A closed box with outward-facing triangles. */
function boxMesh([x0, y0, x1, y1]: Rect, h: number): Mesh {
  const coordinates = [
    x0,
    y0,
    0,
    x1,
    y0,
    0,
    x1,
    y1,
    0,
    x0,
    y1,
    0,
    x0,
    y0,
    h,
    x1,
    y0,
    h,
    x1,
    y1,
    h,
    x0,
    y1,
    h,
  ]
  const indices = [
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0,
    4, 3, 4, 7,
  ]
  return { mesh_id: 0, coordinates, indices }
}

export function buildingBoxes(): Box[] {
  const [x0, y0, x1, y1] = COURTYARD.rect
  const d = COURTYARD.depth
  const h = COURTYARD.height
  return [
    { id: 'courtyard-s', rect: [x0, y0, x1, y0 + d], height: h },
    { id: 'courtyard-n', rect: [x0, y1 - d, x1, y1], height: h },
    { id: 'courtyard-w', rect: [x0, y0 + d, x0 + d, y1 - d], height: h },
    { id: 'courtyard-e', rect: [x1 - d, y0 + d, x1, y1 - d], height: h },
    ...BLOCKS,
  ]
}

function isFreeForTree(x: number, y: number): boolean {
  if (x < 262 || x > 508 || y < 4 || y > 508) return false
  if (inLake(x, y, LAKE_RING.offset + LAKE_RING.width + 2)) return false
  if (inRect(x, y, PLAYGROUND)) return false
  return !nearCurve(x, y) && !nearCurve(x + 2, y) && !nearCurve(x - 2, y)
}

export function sceneTrees(variant: Variant): Tree[] {
  const rnd = random(20260927)
  const trees: Tree[] = []
  TREE_CLUSTERS.forEach((cl, k) => {
    let placed = 0
    for (let attempt = 0; placed < cl.count && attempt < cl.count * 40; attempt++) {
      // Gaussian offset (Box-Muller) gives an organic, dense-in-the-middle cluster.
      const r = cl.spread * Math.sqrt(-2 * Math.log(1 - rnd()))
      const a = 2 * Math.PI * rnd()
      const x = cl.cx + r * Math.cos(a)
      const y = cl.cy + r * Math.sin(a)
      const crown = cl.crown[0] + rnd() * (cl.crown[1] - cl.crown[0])
      const height = cl.height[0] + rnd() * (cl.height[1] - cl.height[0])
      const genus = cl.genus[Math.floor(rnd() * cl.genus.length)]
      if (!isFreeForTree(x, y)) continue
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 0.45 * (t.crown + crown))) continue
      trees.push({
        id: `park-${k}-${placed}`,
        x: round(x),
        y: round(y),
        genus,
        height: round(height),
        crown: round(crown),
      })
      placed++
    }
  })
  COURTYARD_TREES.forEach(([x, y], i) => {
    trees.push({ id: `courtyard-${i}`, x, y, genus: 'Acer', height: 10, crown: 8 })
  })
  if (variant === 'greener-street') {
    // Two rows of lime trees in the new grass strips, every 10 m, not in crossings.
    const rows = [
      (MAIN_STREET.x0 + MAIN_STREET.sidewalk + GREEN_STREET.asphaltX0) / 2,
      (GREEN_STREET.asphaltX1 + MAIN_STREET.x1 - MAIN_STREET.sidewalk) / 2,
    ]
    for (const x of rows) {
      for (let y = 5; y < SCENE_SIZE_M; y += GREEN_STREET.treeSpacing) {
        if (streetClass(x, y - 4) !== null || streetClass(x, y + 4) !== null) continue
        trees.push({
          id: `street-${x < 124 ? 'w' : 'e'}-${y}`,
          x,
          y,
          genus: 'Tilia',
          height: 11,
          crown: 7,
        })
      }
    }
  }
  return trees
}
const round = (v: number) => Math.round(v * 10) / 10

/** The terrain: a regular 8 m grid mesh over the whole square, with the hill. */
function terrainMesh(): Mesh {
  const step = 8
  const n = SCENE_SIZE_M / step + 1
  const coordinates: number[] = []
  const indices: number[] = []
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++)
      coordinates.push(i * step, j * step, round(terrainHeight(i * step, j * step)))
  }
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = j * n + i
      // Counter-clockwise from above: the normals point up.
      indices.push(a, a + 1, a + n + 1, a, a + n + 1, a + n)
    }
  }
  return { mesh_id: 0, coordinates, indices }
}

// ---- The whole scene --------------------------------------------------------------

export interface DemoScene {
  variant: Variant
  boxes: Box[]
  trees: Tree[]
  ground: Uint8Array
  /** SDK inputs. Pass them to `runAreaAndWait` as `options` / input fields. */
  buildings: Record<string, Mesh>
  vegetation: Record<string, Feature>
  groundMaterials: Record<string, FeatureCollection>
  groundGeometry: Record<string, Mesh>
}

export function buildDemoScene(variant: Variant): DemoScene {
  const boxes = buildingBoxes()
  const trees = sceneTrees(variant)
  const ground = groundRaster(variant)
  const vegetation: Record<string, Feature> = {}
  for (const t of trees) {
    vegetation[t.id] = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: toLonLat(t.x, t.y) },
      properties: { natural: 'tree', genus: t.genus, height_m: t.height, diameter_m: t.crown },
    }
  }
  return {
    variant,
    boxes,
    trees,
    ground,
    buildings: Object.fromEntries(boxes.map((b) => [b.id, boxMesh(b.rect, b.height)])),
    vegetation,
    groundMaterials: groundLayers(ground),
    groundGeometry: { terrain: terrainMesh() },
  }
}
