import type { DotBimMesh } from './buildings.sdk-types'

/**
 * Computes the geometric centroid from DotBimMesh coordinates.
 * Coordinates are in local meters [x, y, z, x, y, z, ...].
 *
 * This is a local copy of the function originally in the map domain's geo-utils.
 * Kept here so the buildings package is self-contained and does not depend on the
 * map interface package for a pure geometry utility.
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
