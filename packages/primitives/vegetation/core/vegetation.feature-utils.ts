import type { Polygon as GeoJsonPolygon } from 'geojson'
import type { AreaVegetation, GeoJsonFeatureCollection } from './vegetation.sdk-types'

/**
 * Stable, canonical query-key fragment for a GeoJSON polygon.
 *
 * Mirrors `stablePolygonKey` from `@forge-kit/buildings/react` (duplicated
 * here to avoid cross-primitive coupling). Two deep-equal polygons with
 * different object identities produce the same key.
 */
export function stablePolygonKey(polygon: GeoJsonPolygon | null): string {
  return JSON.stringify(polygon?.coordinates ?? null)
}

/**
 * Convert an `AreaVegetation.features` dict to a `GeoJsonFeatureCollection`
 * suitable for `client.vegetation.convertToMesh(...)`.
 */
export function areaFeaturesToCollection(area: AreaVegetation): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: Object.values(area.features),
  }
}

/**
 * Ray-cast point-in-ring test. Ring is `[[lng, lat], ...]`. Returns true
 * when `(lng, lat)` lies strictly inside `ring`. Holes are not handled
 * here — the caller composes outer + holes for full Polygon containment.
 */
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Point-in-Polygon: outer ring includes, holes exclude. Polygons drawn
 * by the area-tool do not carry holes, but the implementation handles
 * them for completeness.
 */
function pointInPolygon(lng: number, lat: number, polygon: GeoJsonPolygon): boolean {
  const [outer, ...holes] = polygon.coordinates
  if (!outer) return false
  if (!pointInRing(lng, lat, outer)) return false
  for (const hole of holes) {
    if (pointInRing(lng, lat, hole)) return false
  }
  return true
}

/**
 * Filter a vegetation features dict to only those whose Point geometry
 * is inside `polygon`. Non-Point features and features with non-numeric
 * coordinates are dropped. Used to crop trees to the user-drawn polygon
 * (SDK `getArea` returns a bbox-clipped circle per tile).
 */
export function filterFeaturesInsidePolygon(
  features: Record<string, Record<string, unknown>>,
  polygon: GeoJsonPolygon,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {}
  for (const [id, feature] of Object.entries(features)) {
    const geom = feature.geometry as { type?: string; coordinates?: [number, number] } | undefined
    if (geom?.type !== 'Point' || !geom.coordinates) continue
    const [lng, lat] = geom.coordinates
    if (typeof lng !== 'number' || typeof lat !== 'number') continue
    if (pointInPolygon(lng, lat, polygon)) out[id] = feature
  }
  return out
}
