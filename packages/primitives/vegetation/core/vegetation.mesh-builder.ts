import {
  CANOPY_FRACTION_OF_TOTAL,
  DEFAULT_TOTAL_HEIGHT,
  type ResolvedDims,
  resolveFeatureDims,
  TRUNK_FRACTION_OF_TOTAL,
  type TreeArchetype,
} from './vegetation.feature-dims'
import { latLngToMetersLocal } from './vegetation.geo-utils'
import {
  CANOPY_COLOR,
  pushConeCanopy,
  pushEllipsoidCanopy,
  pushSphereCanopy,
  pushTrunk,
} from './vegetation.mesh-primitives'
import type { DotBimMesh } from './vegetation.sdk-types'

export type { TreeArchetype } from './vegetation.feature-dims'

export interface TreeMeshOptions {
  trunkRadius?: number
  /**
   * @deprecated Use `totalHeight` instead. Kept for API back-compat — when
   * set without `totalHeight`, it's interpreted as the trunk component of a
   * `totalHeight = trunkHeight / TRUNK_FRACTION_OF_TOTAL` tree. New code
   * should pass `totalHeight` directly.
   */
  trunkHeight?: number
  trunkSegments?: number
  canopyRadius?: number
  /**
   * @deprecated Canopy height now follows from `canopyRadius` (sphere). The
   * field is kept on the option type for back-compat with the old test
   * fixtures; it has no effect on the emitted geometry.
   */
  canopyHeight?: number
  canopySegments?: number
  /** Total tree height (trunk base → top of canopy sphere). Drives trunk
   *  height + canopy center via the constant ratio. Default 8 m. */
  totalHeight?: number
}

const DEFAULTS: Required<Omit<TreeMeshOptions, 'totalHeight'>> & {
  totalHeight: number
} = {
  trunkRadius: 0.2,
  trunkHeight: DEFAULT_TOTAL_HEIGHT * TRUNK_FRACTION_OF_TOTAL,
  trunkSegments: 6,
  canopyRadius: (DEFAULT_TOTAL_HEIGHT * CANOPY_FRACTION_OF_TOTAL) / 2,
  canopyHeight: DEFAULT_TOTAL_HEIGHT * CANOPY_FRACTION_OF_TOTAL,
  canopySegments: 8,
  totalHeight: DEFAULT_TOTAL_HEIGHT,
}

/** Template cache key resolution: round to nearest 0.5 m so the cache is
 * bounded even when imports carry many slightly-different sizes. */
const TEMPLATE_ROUNDING_M = 0.5

interface TreeTemplate {
  coordinates: number[]
  indices: number[]
  colors: number[]
}

function buildTreeTemplate(opts: {
  trunkRadius: number
  trunkHeight: number
  trunkSegments: number
  canopyRadius: number
  canopySegments: number
  canopyHeight: number
  archetype: TreeArchetype
}): TreeTemplate {
  const { trunkRadius, trunkHeight, trunkSegments, canopyRadius, canopySegments } = opts
  const coords: number[] = []
  const indices: number[] = []
  const colors: number[] = []

  pushTrunk(coords, indices, colors, trunkRadius, trunkHeight, trunkSegments)

  const baseStart = coords.length / 3
  if (opts.archetype === 'conical') {
    // Conifer: base ring at the trunk top, apex at the tree top.
    pushConeCanopy(
      coords,
      indices,
      colors,
      baseStart,
      canopyRadius,
      trunkHeight,
      trunkHeight + opts.canopyHeight,
      canopySegments,
      CANOPY_COLOR,
    )
  } else if (opts.archetype === 'columnar') {
    // Stretched crown: vertical radius from the crown height, horizontal
    // from the (narrow) crown radius.
    pushEllipsoidCanopy(
      coords,
      indices,
      colors,
      baseStart,
      canopyRadius,
      opts.canopyHeight / 2,
      trunkHeight + opts.canopyHeight / 2,
      canopySegments,
      CANOPY_COLOR,
    )
  } else {
    // Canopy CENTER sits at trunk_top + canopy_radius — so the lowest canopy
    // vertex meets the trunk top, and the canopy_radius drives both
    // horizontal AND vertical extent (round, not stretched).
    pushSphereCanopy(
      coords,
      indices,
      colors,
      baseStart,
      canopyRadius,
      trunkHeight + canopyRadius,
      canopySegments,
      CANOPY_COLOR,
    )
  }

  return { coordinates: coords, indices, colors }
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

/** Optional second arg. Only `defaults` is supported today; this shape is
 * deliberate so future per-call knobs (e.g. instrumentation hooks) can be
 * added without another breaking signature change. */
export interface FeaturesToDotBimMeshesOptions {
  defaults?: TreeMeshOptions
}

interface BuildResult {
  meshes: DotBimMesh[]
  templateCount: number
}

function buildMeshes(
  features: Record<string, Record<string, unknown>>,
  origin: [number, number],
  opts: FeaturesToDotBimMeshesOptions,
): BuildResult {
  const merged = { ...DEFAULTS, ...(opts.defaults ?? {}) }
  // Caller-supplied `trunkHeight` (legacy tests) overrides the totalHeight-
  // derived trunk. Caller-supplied `canopyRadius` overrides the derived
  // canopy. Caller-supplied `totalHeight` flows into per-feature defaults.
  const defaults = merged

  const templateCache = new Map<string, TreeTemplate>()
  const getTemplate = (dims: ResolvedDims) => {
    const keyHeight = roundToStep(dims.trunkHeight, TEMPLATE_ROUNDING_M)
    const keyRadius = roundToStep(dims.canopyRadius, TEMPLATE_ROUNDING_M)
    const keyCanopyH = roundToStep(dims.canopyHeight, TEMPLATE_ROUNDING_M)
    const key = `${dims.archetype}|${keyHeight}|${keyRadius}|${keyCanopyH}`
    const cached = templateCache.get(key)
    if (cached) return cached
    const built = buildTreeTemplate({
      trunkRadius: defaults.trunkRadius,
      trunkHeight: dims.trunkHeight,
      trunkSegments: defaults.trunkSegments,
      canopyRadius: dims.canopyRadius,
      canopySegments: defaults.canopySegments,
      canopyHeight: dims.canopyHeight,
      archetype: dims.archetype,
    })
    templateCache.set(key, built)
    return built
  }

  const out: DotBimMesh[] = []
  let meshId = 0
  for (const feature of Object.values(features)) {
    const geom = feature.geometry as { type?: string; coordinates?: [number, number] } | undefined
    if (geom?.type !== 'Point' || !geom.coordinates) continue
    const [lng, lat] = geom.coordinates
    if (typeof lng !== 'number' || typeof lat !== 'number') continue

    const dims = resolveFeatureDims(feature, defaults)
    const template = getTemplate(dims)

    const [x, y] = latLngToMetersLocal(origin, lng, lat)
    const coords = new Array<number>(template.coordinates.length)
    for (let i = 0; i < template.coordinates.length; i += 3) {
      coords[i] = template.coordinates[i] + x
      coords[i + 1] = template.coordinates[i + 1] + y
      coords[i + 2] = template.coordinates[i + 2]
    }
    out.push({
      mesh_id: meshId++,
      coordinates: coords,
      indices: template.indices,
      colors: template.colors,
    })
  }

  return { meshes: out, templateCount: templateCache.size }
}

/**
 * Convert a vegetation feature dict to per-tree DotBim meshes in
 * polygon-bbox-SW local metres. `origin` is the SW corner `[lng, lat]`
 * returned by `computeOriginFromPolygon(polygon)` — the same origin the
 * deck.gl layer uses as `coordinateOrigin` under METER_OFFSETS.
 *
 * Per-feature sizing reads `properties.height` (TOTAL tree height, OSM
 * semantics), `properties.circumference` (OSM trunk circumference, m), and
 * `properties.diameter_crown` (OSM) or `properties.crownDiameter` (canonical
 * camelCase). Heights are clamped to [3, 25] m, trunk to [1, 5] m, canopy
 * radius to [1.5, 7] m so garbage upstream values can never produce towering
 * rockets. When neither height nor circumference is present, the default 8 m
 * is jittered ±20% from a stable hash of the feature id.
 * `properties.archetype` ('round' | 'conical' | 'columnar') switches the
 * crown primitive; anything else renders the classic round crown.
 *
 * Trunk emits at z=0 (trunk base on ground). Vertical lift for Google 3D
 * Tiles is applied at the layer's `coordinateOrigin[2]`, never here, so
 * the same mesh data renders on flat-earth and photogrammetry-elevated
 * frames without double-counting.
 *
 * Per-vertex colors (brown trunk + green canopy) are emitted on the
 * returned `colors` field. The mesh layer reads them as a vertex
 * attribute so a single `SimpleMeshLayer` renders both materials.
 *
 * Templates are cached per call, keyed by
 * `(archetype, trunkHeight, canopyRadius, canopyHeight)` rounded to the
 * nearest 0.5 m. Cache lives in function scope only — no module-level state.
 *
 * Non-Point features and features with non-numeric coordinates are
 * skipped. `mesh_id` is a sequential index; the merge step records ids
 * separately for picking.
 */
export function featuresToDotBimMeshes(
  features: Record<string, Record<string, unknown>>,
  origin: [number, number],
  opts: FeaturesToDotBimMeshesOptions = {},
): DotBimMesh[] {
  return buildMeshes(features, origin, opts).meshes
}

/**
 * Same as `featuresToDotBimMeshes` but also returns the number of distinct
 * templates built during the call. Exposed so tests (and future caller-
 * side instrumentation) can assert template-cache bucketing without
 * touching module-level state.
 */
export function featuresToDotBimMeshesWithStats(
  features: Record<string, Record<string, unknown>>,
  origin: [number, number],
  opts: FeaturesToDotBimMeshesOptions = {},
): BuildResult {
  return buildMeshes(features, origin, opts)
}
