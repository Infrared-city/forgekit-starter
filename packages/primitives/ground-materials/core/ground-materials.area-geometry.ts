/**
 * Geometry normaliser for the deck.gl extruded surface render.
 *
 * Why this exists — the crash:
 *   The SDK `/ground-material/clean-v3` pipeline stamps 3D coordinates
 *   `[lon, lat, z]` (per-material z-steps) onto every vertex. PR #156 switched
 *   the surface render from a flat `GeoJsonLayer` (which ignores the embedded
 *   z) to an EXTRUDED `PolygonLayer` whose height is driven by `getElevation`.
 *
 *   deck.gl's `PolygonLayer` tessellates with a fixed `positionSize` derived
 *   from `positionFormat` (default `XYZ` → 3). It walks the flat coordinate
 *   array in strides of that size. If a feature's rings are NOT uniformly 3D —
 *   e.g. `@turf/intersect` (run by the boundary clip) drops z and emits 2D
 *   `[lon, lat]` coords, so a feature ends up with mixed 2D/3D vertices — the
 *   stride read mis-aligns: a 2D vertex's `x` lands in the previous vertex's
 *   `z` slot and every subsequent coordinate shifts by one. The corrupted
 *   lon/lat then blow past valid mercator range on the GPU preproject pass →
 *   `@math.gl/web-mercator: assertion failed`. A `null` / degenerate ring trips
 *   the winding normaliser → `Cannot read properties of null (reading 'pos')`.
 *
 *   The simpler materials (asphalt / soil / water — one small feature each)
 *   stay uniformly shaped and initialise fine; the busier ones
 *   (concrete / vegetation — many features, holes, post-clip slivers) hit the
 *   mixed-dimensionality / degenerate paths and crash.
 *
 * The fix:
 *   Project EVERY vertex down to a uniform 2D `[lon, lat]` (stripping the
 *   embedded z so `getElevation` is the SOLE height source), guarantee
 *   consistent ring dimensionality, and drop null / degenerate rings the flat
 *   fill used to tolerate. The layer factory then renders these 2D polygons
 *   with `positionFormat: 'XY'` so `positionSize` is unambiguously 2.
 */
import type { Position } from 'geojson'

/** A GeoJSON ring-array polygon: `[outerRing, ...holes]`, each ring a list of positions. */
export type RingPolygon = Position[][]

/** Minimum vertices for a usable ring (3 distinct + a closing point). */
const MIN_RING_VERTICES = 4

/**
 * Mercator projection hard limit for latitude.
 * deck.gl's `projectFlat` (via `@math.gl/web-mercator`) asserts that
 * |lat| ≤ this value; any larger value — even if finite — throws
 * `@math.gl/web-mercator: assertion failed` in `_updateIndices`.
 */
const MERCATOR_MAX_LAT = 85.0511287798066

/**
 * A vertex is usable only if it is an array whose first two entries are finite
 * numbers AND within valid WGS-84 / web-mercator degree range:
 *   lon ∈ [-180, 180], lat ∈ [-MERCATOR_MAX_LAT, MERCATOR_MAX_LAT].
 *
 * Guards against:
 *   - `null` holes, `undefined`, NaN/Infinity → not finite
 *   - short tuples → length check
 *   - out-of-range but finite values: e.g. lat=91 (polar overshoot), lon=200
 *     (wrap artefact), or projected CRS metres leaking from @turf/intersect
 *     (e.g. [1_800_000, 6_100_000]) — these all pass Number.isFinite yet
 *     crash deck.gl's mercator preproject pass.
 */
function isFiniteVertex(coord: unknown): coord is Position {
  return (
    Array.isArray(coord) &&
    coord.length >= 2 &&
    Number.isFinite(coord[0]) &&
    Number.isFinite(coord[1]) &&
    coord[0] >= -180 &&
    coord[0] <= 180 &&
    coord[1] >= -MERCATOR_MAX_LAT &&
    coord[1] <= MERCATOR_MAX_LAT
  )
}

/**
 * Reduce one ring to clean 2D vertices: keep only finite vertices, project each
 * to `[lon, lat]` (dropping any embedded z), and collapse consecutive duplicate
 * points (which produce zero-area slivers earcut chokes on). Returns `null` if
 * the ring has fewer than `MIN_RING_VERTICES` usable vertices afterwards.
 */
function normalizeRing(ring: unknown): Position[] | null {
  if (!Array.isArray(ring)) return null
  const out: Position[] = []
  for (const coord of ring) {
    if (!isFiniteVertex(coord)) continue
    const point: Position = [coord[0], coord[1]]
    const prev = out[out.length - 1]
    if (prev && prev[0] === point[0] && prev[1] === point[1]) continue
    out.push(point)
  }
  return out.length >= MIN_RING_VERTICES ? out : null
}

/**
 * Normalise a single GeoJSON ring-array polygon for the extruded layer.
 *
 * - Every output vertex is 2D `[lon, lat]` — embedded z stripped.
 * - Null / non-finite vertices dropped; consecutive duplicates collapsed.
 * - Degenerate rings (< 4 usable vertices) dropped. A dropped OUTER ring
 *   discards the whole polygon (returns `null`); dropped holes are simply
 *   omitted.
 */
export function normalizeRingPolygon(coordinates: unknown): RingPolygon | null {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null
  const outer = normalizeRing(coordinates[0])
  if (!outer) return null
  const rings: Position[][] = [outer]
  for (let i = 1; i < coordinates.length; i++) {
    const hole = normalizeRing(coordinates[i])
    if (hole) rings.push(hole)
  }
  return rings
}

/**
 * Normalise a polygon's `coordinates` for the extruded `PolygonLayer`, handling
 * both `Polygon` (`Position[][]`) and `MultiPolygon` (`Position[][][]`) inputs.
 *
 * Returns a FLAT LIST of single `RingPolygon`s — one for a Polygon, one PER PART
 * for a MultiPolygon — so each entry is a standalone polygon the layer can render
 * as its own data item. This is load-bearing: deck.gl's `PolygonLayer.getPolygon`
 * accepts a single polygon (`[outerRing, ...holes]`) but NOT a per-feature
 * MultiPolygon — handing it the extra nesting level makes it read coordinate
 * arrays as scalar lon/lat → corrupted values → `@math.gl/web-mercator: assertion
 * failed`. `@turf/intersect` (the boundary clip) routinely splits the busier
 * materials (concrete / vegetation) into MultiPolygons, so they MUST be split
 * here. Returns `[]` when nothing usable remains.
 */
export function normalizeAreaPolygonCoordinates(
  coordinates: unknown,
  type: string | undefined,
): RingPolygon[] {
  if (type === 'MultiPolygon') {
    if (!Array.isArray(coordinates)) return []
    const polys: RingPolygon[] = []
    for (const poly of coordinates) {
      const normalized = normalizeRingPolygon(poly)
      if (normalized) polys.push(normalized)
    }
    return polys
  }
  // Default to Polygon shape — wrap the single result in the list.
  const single = normalizeRingPolygon(coordinates)
  return single ? [single] : []
}
