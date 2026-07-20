import type { DotBimMesh } from '@forge-kit/buildings'
import {
  computeOriginFromViewport as geoComputeOriginFromViewport,
  metersToLatLng as geoMetersToLatLng,
  latLngToMetersLocal,
} from '@forge-kit/geo-core'

/**
 * Computes the geometric centroid from DotBimMesh coordinates.
 * Coordinates are in local meters [x, y, z, x, y, z, ...].
 */
export function computeMeshCentroid(mesh: DotBimMesh): { x: number; y: number; z: number } {
  const coords = mesh.coordinates
  const vertexCount = coords.length / 3

  if (vertexCount === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  let sumX = 0
  let sumY = 0
  let sumZ = 0

  for (let i = 0; i < coords.length; i += 3) {
    sumX += coords[i]
    sumY += coords[i + 1]
    sumZ += coords[i + 2]
  }

  return {
    x: sumX / vertexCount,
    y: sumY / vertexCount,
    z: sumZ / vertexCount,
  }
}

/**
 * Converts local meters to lat/lng using the viewport origin (SW corner
 * [lng, lat]). Thin wrapper over the shared geo-core projection; preserves the
 * `{ x, y }` -> `{ lat, lng }` shape its callers expect.
 */
export function metersToLatLng(
  meters: { x: number; y: number },
  origin: [number, number],
): { lat: number; lng: number } {
  const [lng, lat] = geoMetersToLatLng(origin, meters.x, meters.y)
  return { lat, lng }
}

/**
 * Computes the geographic origin (SW corner) [lng, lat] from a center-based
 * viewport. Thin wrapper over the shared geo-core projection.
 */
export function computeOriginFromViewport(viewport: {
  latitude: number
  longitude: number
  width: number
  height: number
}): [number, number] {
  return geoComputeOriginFromViewport(viewport)
}

/**
 * Converts lat/lng to local meters using the viewport origin (SW corner
 * [lng, lat]). Thin wrapper over the shared geo-core projection; preserves the
 * `{ lat, lng }` -> `{ x, y }` shape its callers expect.
 */
export function latLngToMeters(
  coords: { lat: number; lng: number },
  origin: [number, number],
): { x: number; y: number } {
  const [x, y] = latLngToMetersLocal(origin, coords.lng, coords.lat)
  return { x, y }
}
