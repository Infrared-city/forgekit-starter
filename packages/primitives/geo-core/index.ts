// @forge-kit/geo-core — the ONE shared lng/lat <-> local-meters projection.
//
// Buildings, trees, and the ground-materials surface MUST agree on this math so
// they share one deck.gl METER_OFFSETS depth space. This package is the single
// source of truth — every render-family fork re-exports from here. Keep it
// dependency-free (only @turf/bbox + geojson types) so any primitive can import it.
//
// Equirectangular (tangent-plane) approximation — exact enough for a bounded
// site (sub-km), which is the only scale these layers render at.

import turfBbox from '@turf/bbox'
import type { Polygon as GeoJsonPolygon } from 'geojson'

/** Geographic SW-corner origin `[lng, lat]` of a polygon — the shared
 *  `coordinateOrigin` for all METER_OFFSETS map geometry. */
export function computeOriginFromPolygon(polygon: GeoJsonPolygon): [number, number] {
  const [west, south] = turfBbox(polygon)
  return [west, south]
}

/** Metres per degree of LONGITUDE at a given latitude. */
export function metersPerDegLng(lat: number): number {
  return 111_320 * Math.cos((lat * Math.PI) / 180)
}

/** Metres per degree of LATITUDE (constant — equirectangular approximation). */
export const METERS_PER_DEG_LAT = 110_540

/** Project lng/lat to LOCAL metres from `origin`. The single source of truth
 *  for buildings / trees / surfaces — they MUST agree so the shared depth
 *  buffer sorts them. */
export function latLngToMetersLocal(
  origin: [number, number],
  lng: number,
  lat: number,
): [number, number] {
  const [originLng, originLat] = origin
  return [(lng - originLng) * metersPerDegLng(originLat), (lat - originLat) * METERS_PER_DEG_LAT]
}

/** Inverse of `latLngToMetersLocal`. */
export function metersToLatLng(origin: [number, number], x: number, y: number): [number, number] {
  const [originLng, originLat] = origin
  return [originLng + x / metersPerDegLng(originLat), originLat + y / METERS_PER_DEG_LAT]
}

/** A center-based viewport in geographic coords whose `width`/`height` are in
 *  METRES (not degrees). */
export interface TangentPlaneViewport {
  latitude: number
  longitude: number
  width: number
  height: number
}

/** SW-corner origin `[lng, lat]` from a center-based viewport with metre
 *  extents — the non-polygon origin path (e.g. drag/gizmo before a boundary
 *  exists). Same family as {@link computeOriginFromPolygon}. */
export function computeOriginFromViewport(viewport: TangentPlaneViewport): [number, number] {
  const metersPerLng = metersPerDegLng(viewport.latitude)
  return [
    viewport.longitude - viewport.width / 2 / metersPerLng,
    viewport.latitude - viewport.height / 2 / METERS_PER_DEG_LAT,
  ]
}
export { createTimeSlicer, type TimeSliceOpts, type TimeSlicer } from './timeslice'
