import { computeMeshCentroid } from './buildings.geo-utils'
import type { DotBimMesh } from './buildings.sdk-types'

/**
 * Computes the principal orientation angle of a building mesh using PCA
 * on the XY projection of vertices.
 * Returns angle in degrees (0-180) measured counter-clockwise from East (+X axis).
 *
 * This represents the building's "natural" orientation - the direction of its
 * primary axis (longest dimension).
 */
export function computeMeshOrientation(mesh: DotBimMesh): number {
  const centroid = computeMeshCentroid(mesh)
  const coords = mesh.coordinates

  // Build covariance matrix for XY plane
  let cxx = 0
  let cxy = 0
  let cyy = 0
  let count = 0

  for (let i = 0; i < coords.length; i += 3) {
    const x = coords[i] - centroid.x
    const y = coords[i + 1] - centroid.y

    cxx += x * x
    cxy += x * y
    cyy += y * y
    count++
  }

  if (count === 0) return 0

  cxx /= count
  cxy /= count
  cyy /= count

  // Compute eigenvalues and eigenvectors
  // For 2x2 symmetric matrix: [[cxx, cxy], [cxy, cyy]]
  const trace = cxx + cyy
  const det = cxx * cyy - cxy * cxy
  const lambda1 = trace / 2 + Math.sqrt((trace * trace) / 4 - det)

  // Eigenvector for largest eigenvalue (principal axis)
  // (cxx - lambda1) * vx + cxy * vy = 0
  let vx: number, vy: number

  if (Math.abs(cxy) > 1e-10) {
    vx = lambda1 - cyy
    vy = cxy
  } else if (cxx > cyy) {
    vx = 1
    vy = 0
  } else {
    vx = 0
    vy = 1
  }

  // Normalize
  const mag = Math.sqrt(vx * vx + vy * vy)
  if (mag > 0) {
    vx /= mag
    vy /= mag
  }

  // Convert to angle in degrees (atan2 gives angle from East, counter-clockwise)
  const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI

  // Normalize to [0, 180) since orientation is bidirectional
  return ((angleDeg % 180) + 180) % 180
}
