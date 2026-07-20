import { computeMeshCentroid } from './buildings.geo-utils'
import type { DotBimMesh } from './buildings.sdk-types'

export interface BuildingTransform {
  meshId: string
  deltaX: number // meters offset in X direction
  deltaY: number // meters offset in Y direction
  rotation: number // degrees (counter-clockwise)
}

/**
 * Translates a mesh by delta X/Y in meters.
 * Returns a new mesh with transformed coordinates.
 */
export function translateMesh(mesh: DotBimMesh, deltaX: number, deltaY: number): DotBimMesh {
  const newCoordinates = [...mesh.coordinates]

  for (let i = 0; i < newCoordinates.length; i += 3) {
    newCoordinates[i] += deltaX // X
    newCoordinates[i + 1] += deltaY // Y
    // Z remains unchanged at i+2
  }

  return {
    ...mesh,
    coordinates: newCoordinates,
  }
}

/**
 * Rotates a mesh around its centroid by the given angle in degrees.
 * Positive angle rotates counter-clockwise (viewed from above).
 * Returns a new mesh with transformed coordinates.
 */
export function rotateMesh(mesh: DotBimMesh, angleDegrees: number): DotBimMesh {
  const centroid = computeMeshCentroid(mesh)
  const angleRadians = (angleDegrees * Math.PI) / 180
  const cos = Math.cos(angleRadians)
  const sin = Math.sin(angleRadians)

  const newCoordinates = [...mesh.coordinates]

  for (let i = 0; i < newCoordinates.length; i += 3) {
    // Translate to origin
    const x = newCoordinates[i] - centroid.x
    const y = newCoordinates[i + 1] - centroid.y

    // Rotate
    const rotatedX = x * cos - y * sin
    const rotatedY = x * sin + y * cos

    // Translate back
    newCoordinates[i] = rotatedX + centroid.x
    newCoordinates[i + 1] = rotatedY + centroid.y
    // Z remains unchanged
  }

  return {
    ...mesh,
    coordinates: newCoordinates,
  }
}

/**
 * Applies a combined transform (translation + rotation) to a mesh.
 * Order: first rotate, then translate.
 * Returns a new mesh with transformed coordinates.
 */
export function applyTransform(mesh: DotBimMesh, transform: BuildingTransform): DotBimMesh {
  let transformed = mesh

  // Apply rotation first (around original centroid)
  if (transform.rotation !== 0) {
    transformed = rotateMesh(transformed, transform.rotation)
  }

  // Then apply translation
  if (transform.deltaX !== 0 || transform.deltaY !== 0) {
    transformed = translateMesh(transformed, transform.deltaX, transform.deltaY)
  }

  return transformed
}
