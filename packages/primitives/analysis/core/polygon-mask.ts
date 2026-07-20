/**
 * Pure polygon helpers for polygon-shaped sample regions. Ray-cast even-odd
 * point-in-polygon over an OPEN ring of `[lon, lat]` vertices (no closing
 * duplicate — the test is cyclic via the trailing index). No deps.
 *
 * Framework-agnostic — lives in `core/` so both the client and headless/Worker
 * code can consume the samplers that use these helpers.
 */

export function pointInPolygon(lon: number, lat: number, ring: [number, number][]): boolean {
  if (ring.length < 3) return false
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi
    if (intersects) inside = !inside
  }
  return inside
}

/** Arithmetic-mean centroid of the ring — sufficient for anchoring the pin
 *  card/marker; NOT an area-weighted centroid (overkill for small AOIs). */
export function polygonCentroid(ring: [number, number][]): [number, number] {
  if (ring.length === 0) return [0, 0]
  let sx = 0
  let sy = 0
  for (const [x, y] of ring) {
    sx += x
    sy += y
  }
  return [sx / ring.length, sy / ring.length]
}

/** Bounding box of the ring: [west, south, east, north]. */
export function polygonBbox(ring: [number, number][]): [number, number, number, number] {
  let west = Number.POSITIVE_INFINITY
  let south = Number.POSITIVE_INFINITY
  let east = Number.NEGATIVE_INFINITY
  let north = Number.NEGATIVE_INFINITY
  for (const [x, y] of ring) {
    if (x < west) west = x
    if (x > east) east = x
    if (y < south) south = y
    if (y > north) north = y
  }
  return [west, south, east, north]
}
