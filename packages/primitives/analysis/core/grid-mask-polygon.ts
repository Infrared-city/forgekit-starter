// ABOUTME: Pure mask → connected components → boundary trace → simplified lon/lat polygon.
// ABOUTME: Turns a filter match mask into an EXACT data-defined region outline (no model vision).

/**
 * A boolean match mask (from `grid-filter`) is a raster region; this module
 * extracts vector geometry from it:
 *   1. 4-connected components (flood fill).
 *   2. the largest component.
 *   3. a crisp cell-edge boundary ring, traced with the region interior kept
 *      on the LEFT of every directed edge → an outer, counter-clockwise ring.
 *   4. Douglas-Peucker simplification to ≤ maxVertices.
 * Corners map to lon/lat with the grid's row-0-is-SOUTH convention (matching
 * `grid-thumbnail.ts:cutoutToRgba` and `tile-geometry.ts`).
 *
 * Pure + framework-free, unit-tested against concrete shapes.
 */

import type { AreaRunResult } from './analysis.types'

type LonLatBBox = AreaRunResult['gridBounds']

export interface MaskComponent {
  /** [r, c] cells belonging to this component. */
  cells: Array<[number, number]>
  size: number
  /** centroid cell (fractional row/col) — for narration + pin anchoring. */
  centroidRC: { r: number; c: number }
}

/** 4-connectivity flood fill of the true cells. Deterministic order. */
export function connectedComponents(
  mask: boolean[][],
  gridShape: readonly [number, number],
): MaskComponent[] {
  const [rows, cols] = gridShape
  const seen: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false))
  const components: MaskComponent[] = []
  for (let r0 = 0; r0 < rows; r0++) {
    for (let c0 = 0; c0 < cols; c0++) {
      if (!mask[r0]?.[c0] || seen[r0][c0]) continue
      const cells: Array<[number, number]> = []
      const stack: Array<[number, number]> = [[r0, c0]]
      seen[r0][c0] = true
      let sumR = 0
      let sumC = 0
      while (stack.length > 0) {
        const [r, c] = stack.pop() as [number, number]
        cells.push([r, c])
        sumR += r + 0.5
        sumC += c + 0.5
        const neighbors: Array<[number, number]> = [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ]
        for (const [nr, nc] of neighbors) {
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
          if (mask[nr]?.[nc] && !seen[nr][nc]) {
            seen[nr][nc] = true
            stack.push([nr, nc])
          }
        }
      }
      components.push({
        cells,
        size: cells.length,
        centroidRC: { r: sumR / cells.length, c: sumC / cells.length },
      })
    }
  }
  return components
}

/** Largest component by cell count; ties broken by earliest scan position. */
export function largestComponent(components: MaskComponent[]): MaskComponent | null {
  let best: MaskComponent | null = null
  for (const component of components) {
    if (!best || component.size > best.size) best = component
  }
  return best
}

type Corner = { x: number; y: number } // grid-corner coords: x∈[0,cols], y∈[0,rows]
type Edge = { a: Corner; b: Corner } // directed, region interior on the LEFT

const cornerKey = (p: Corner): string => `${p.x},${p.y}`

/**
 * Directed boundary edges of a cell set, each oriented with the interior on
 * its LEFT (math orientation: x east, y north, CCW). Cell (r,c) has corners
 * SW(c,r) SE(c+1,r) NE(c+1,r+1) NW(c,r+1); a side is a boundary edge when the
 * neighbor across it is not in the set.
 */
function boundaryEdges(cellSet: Set<string>, cells: Array<[number, number]>): Edge[] {
  const has = (r: number, c: number) => cellSet.has(`${r},${c}`)
  const edges: Edge[] = []
  for (const [r, c] of cells) {
    const SW = { x: c, y: r }
    const SE = { x: c + 1, y: r }
    const NE = { x: c + 1, y: r + 1 }
    const NW = { x: c, y: r + 1 }
    if (!has(r - 1, c)) edges.push({ a: SW, b: SE }) // south side, going east
    if (!has(r, c + 1)) edges.push({ a: SE, b: NE }) // east side, going north
    if (!has(r + 1, c)) edges.push({ a: NE, b: NW }) // north side, going west
    if (!has(r, c - 1)) edges.push({ a: NW, b: SW }) // west side, going south
  }
  return edges
}

function signedArea(ring: Corner[]): number {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i]
    const q = ring[(i + 1) % ring.length]
    sum += p.x * q.y - q.x * p.y
  }
  return sum / 2
}

/** −90° (right), 0° (straight), +90° (left), 180° (back) rank for a turn from
 *  d_in to d_out; smaller = more clockwise. Keeps the outer trace hugging the
 *  boundary at pinch corners. */
function turnRank(din: Corner, dout: Corner): number {
  const cross = din.x * dout.y - din.y * dout.x // >0 left, <0 right
  const dot = din.x * dout.x + din.y * dout.y // >0 straight, <0 back
  if (cross < 0) return 0 // right
  if (cross === 0 && dot > 0) return 1 // straight
  if (cross > 0) return 2 // left
  return 3 // back (dot<0, cross==0)
}

/**
 * Chain boundary edges into closed rings (interior on left → outer ring is
 * CCW). Returns every ring; callers pick the outer one by max signed area.
 */
function traceRings(edges: Edge[]): Corner[][] {
  const outgoing = new Map<string, Edge[]>()
  for (const edge of edges) {
    const key = cornerKey(edge.a)
    const list = outgoing.get(key)
    if (list) list.push(edge)
    else outgoing.set(key, [edge])
  }
  const used = new Set<Edge>()
  const rings: Corner[][] = []

  for (const startEdge of edges) {
    if (used.has(startEdge)) continue
    const ring: Corner[] = [startEdge.a]
    let current = startEdge
    used.add(current)
    // Follow until we return to the ring's first corner.
    for (let guard = 0; guard < edges.length + 1; guard++) {
      ring.push(current.b)
      const candidates = (outgoing.get(cornerKey(current.b)) ?? []).filter((e) => !used.has(e))
      if (candidates.length === 0) break
      const din = { x: current.b.x - current.a.x, y: current.b.y - current.a.y }
      candidates.sort(
        (e1, e2) =>
          turnRank(din, { x: e1.b.x - e1.a.x, y: e1.b.y - e1.a.y }) -
          turnRank(din, { x: e2.b.x - e2.a.x, y: e2.b.y - e2.a.y }),
      )
      current = candidates[0]
      used.add(current)
      if (
        cornerKey(current.a) === cornerKey(startEdge.a) &&
        cornerKey(current.b) === cornerKey(ring[1])
      ) {
        break
      }
    }
    // Drop the trailing corner that closed back onto the start.
    if (ring.length > 1 && cornerKey(ring[ring.length - 1]) === cornerKey(ring[0])) ring.pop()
    if (ring.length >= 3) rings.push(ring)
  }
  return rings
}

function perpDistance(p: Corner, a: Corner, b: Corner): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len
}

/** Douglas-Peucker on an OPEN polyline (endpoints fixed). */
function douglasPeucker(points: Corner[], epsilon: number): Corner[] {
  if (points.length < 3) return points.slice()
  let maxDist = 0
  let index = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], points[0], points[points.length - 1])
    if (d > maxDist) {
      maxDist = d
      index = i
    }
  }
  if (maxDist <= epsilon) return [points[0], points[points.length - 1]]
  const left = douglasPeucker(points.slice(0, index + 1), epsilon)
  const right = douglasPeucker(points.slice(index), epsilon)
  return [...left.slice(0, -1), ...right]
}

/** DP for a CLOSED ring: anchor vertex 0 AND the vertex farthest from it, DP
 *  each half. Anchoring two far-apart points (vs. only vertex 0) avoids the
 *  degenerate simplifications that made concave rings self-cross. */
function douglasPeuckerClosed(ring: Corner[], epsilon: number): Corner[] {
  const n = ring.length
  if (n <= 3) return ring.slice()
  let m = 0
  let maxD = -1
  for (let i = 1; i < n; i++) {
    const d = Math.hypot(ring[i].x - ring[0].x, ring[i].y - ring[0].y)
    if (d > maxD) {
      maxD = d
      m = i
    }
  }
  const chainA = ring.slice(0, m + 1) // 0..m
  const chainB = [...ring.slice(m), ring[0]] // m..n-1, 0
  const sa = douglasPeucker(chainA, epsilon)
  const sb = douglasPeucker(chainB, epsilon)
  return [...sa.slice(0, -1), ...sb.slice(0, -1)]
}

function orient(a: Corner, b: Corner, c: Corner): number {
  const v = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  return v > 0 ? 1 : v < 0 ? -1 : 0
}

function onSegment(a: Corner, b: Corner, p: Corner): boolean {
  return (
    Math.min(a.x, b.x) <= p.x &&
    p.x <= Math.max(a.x, b.x) &&
    Math.min(a.y, b.y) <= p.y &&
    p.y <= Math.max(a.y, b.y)
  )
}

function segmentsIntersect(p1: Corner, p2: Corner, p3: Corner, p4: Corner): boolean {
  const o1 = orient(p1, p2, p3)
  const o2 = orient(p1, p2, p4)
  const o3 = orient(p3, p4, p1)
  const o4 = orient(p3, p4, p2)
  if (o1 !== o2 && o3 !== o4) return true
  if (o1 === 0 && onSegment(p1, p2, p3)) return true
  if (o2 === 0 && onSegment(p1, p2, p4)) return true
  if (o3 === 0 && onSegment(p3, p4, p1)) return true
  if (o4 === 0 && onSegment(p3, p4, p2)) return true
  return false
}

/** True when no two NON-adjacent edges of the closed ring touch or cross —
 *  i.e. the polygon is simple. O(n²); n is small (≤ a few hundred). */
export function ringIsSimple(ring: Corner[]): boolean {
  const n = ring.length
  if (n < 3) return false
  for (let i = 0; i < n; i++) {
    const a1 = ring[i]
    const a2 = ring[(i + 1) % n]
    for (let j = i + 1; j < n; j++) {
      // Skip adjacent edges (they legitimately share a vertex).
      if (j === i) continue
      if ((j + 1) % n === i || (i + 1) % n === j) continue
      const b1 = ring[j]
      const b2 = ring[(j + 1) % n]
      if (segmentsIntersect(a1, a2, b1, b2)) return false
    }
  }
  return true
}

/** Drop vertices collinear with their neighbours (tidies cell-edge staircases'
 *  straight runs; exact, epsilon-free). Ring in/out. */
function removeCollinear(ring: Corner[]): Corner[] {
  if (ring.length < 3) return ring.slice()
  const out: Corner[] = []
  for (let i = 0; i < ring.length; i++) {
    const prev = ring[(i - 1 + ring.length) % ring.length]
    const cur = ring[i]
    const next = ring[(i + 1) % ring.length]
    const cross = (cur.x - prev.x) * (next.y - prev.y) - (cur.y - prev.y) * (next.x - prev.x)
    if (cross !== 0) out.push(cur)
  }
  return out.length >= 3 ? out : ring.slice()
}

/**
 * Simplify a closed ring to ≤ maxVertices while STAYING SIMPLE (no
 * self-intersection). `ring` in is the raw cell-boundary trace, which is
 * always simple; we only accept a simplified candidate that is both within
 * the vertex cap AND still simple. If no escalation reaches that, we return
 * the raw ring unchanged — correctness (a simple polygon) wins over the
 * vertex budget, since a self-crossing outline is worse than an over-detailed
 * one (thin annulus / deeply-notched regions are the shapes that hit this).
 */
export function simplifyRing(ring: Corner[], maxVertices: number): Corner[] {
  if (ring.length <= maxVertices) return ring
  // Vertex count is monotonically non-increasing in epsilon, so the FIRST
  // (smallest) epsilon that fits the cap keeps the MOST detail. Fine steps
  // land closer to the budget on concave shapes (thin bands collapse
  // bimodally and just get the coarse result — still simple).
  let epsilon = 0.35
  for (let attempt = 0; attempt < 64; attempt++) {
    const simplified = douglasPeuckerClosed(ring, epsilon)
    if (simplified.length <= maxVertices && simplified.length >= 3 && ringIsSimple(simplified)) {
      return simplified
    }
    epsilon *= 1.2
  }
  return ring // guaranteed simple; may exceed maxVertices for pathological shapes
}

export interface RegionPolygon {
  /** OUTER boundary as an open ring, [lon, lat] — matches PinGeometry
   *  'polygon'. For a donut-shaped match (e.g. a hot band around a building's
   *  null footprint) this silhouette ENCLOSES the unmatched hole(s); the exact
   *  matched area is the caller's cell count, not this ring's area. */
  ring: Array<[number, number]>
  vertexCount: number
  /** Number of enclosed unmatched holes in the region (0 for a solid blob). */
  holeCount: number
}

/** Corner (grid-index space) → lon/lat, row-0-is-south. */
function cornerToLonLat(corner: Corner, gridShape: readonly [number, number], bounds: LonLatBBox) {
  const [rows, cols] = gridShape
  const lon = bounds.west + (corner.x / cols) * (bounds.east - bounds.west)
  const lat = bounds.south + (corner.y / rows) * (bounds.north - bounds.south)
  return [lon, lat] as [number, number]
}

/**
 * Trace the outer boundary of a component and return a simplified lon/lat
 * ring. Null when the component is empty or degenerate.
 */
export function componentToPolygon(
  component: MaskComponent,
  gridShape: readonly [number, number],
  bounds: LonLatBBox,
  maxVertices = 24,
): RegionPolygon | null {
  if (component.cells.length === 0) return null
  const cellSet = new Set(component.cells.map(([r, c]) => `${r},${c}`))
  const edges = boundaryEdges(cellSet, component.cells)
  if (edges.length < 3) return null
  const rings = traceRings(edges)
  if (rings.length === 0) return null
  // Outer ring = the largest positive (CCW) signed area; the rest are holes
  // (CW, negative area) — a single 4-connected component has exactly one
  // outer boundary plus zero+ enclosed holes.
  let outer = rings[0]
  let bestArea = signedArea(rings[0])
  let holeCount = 0
  for (const ring of rings) {
    const area = signedArea(ring)
    if (area > bestArea) {
      bestArea = area
      outer = ring
    }
    if (area < 0) holeCount++
  }
  const tidy = removeCollinear(outer)
  const simplified = simplifyRing(tidy, maxVertices)
  const ring = simplified.map((corner) => cornerToLonLat(corner, gridShape, bounds))
  return { ring, vertexCount: ring.length, holeCount }
}

/** Centroid cell → lon/lat point (region label anchor). */
export function centroidToLonLat(
  component: MaskComponent,
  gridShape: readonly [number, number],
  bounds: LonLatBBox,
): [number, number] {
  const [rows, cols] = gridShape
  const lon = bounds.west + (component.centroidRC.c / cols) * (bounds.east - bounds.west)
  const lat = bounds.south + (component.centroidRC.r / rows) * (bounds.north - bounds.south)
  return [lon, lat]
}
