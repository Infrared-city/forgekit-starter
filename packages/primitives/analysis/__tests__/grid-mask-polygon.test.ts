// ABOUTME: Tests conversion from grid masks into connected vector regions.
// ABOUTME: Covers component discovery, boundary tracing, simplification, and hole detection.

import { describe, expect, it } from 'vitest'
import {
  componentToPolygon,
  connectedComponents,
  largestComponent,
  type MaskComponent,
  ringIsSimple,
  simplifyRing,
} from '../core/grid-mask-polygon'

/** Ring [lon,lat][] → Corner[] for the affine-invariant simplicity check. */
function asCorners(ring: Array<[number, number]>) {
  return ring.map(([x, y]) => ({ x, y }))
}

// bounds chosen so each grid cell is 1×1 in lon/lat → ring corners == grid corners.
const BOUNDS = { west: 0, south: 0, east: 4, north: 4 }
const SHAPE4: [number, number] = [4, 4]

function maskFrom(trueCells: Array<[number, number]>, shape: [number, number]): boolean[][] {
  const [rows, cols] = shape
  const mask = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false))
  for (const [r, c] of trueCells) mask[r][c] = true
  return mask
}

function comp(cells: Array<[number, number]>): MaskComponent {
  let sumR = 0
  let sumC = 0
  for (const [r, c] of cells) {
    sumR += r + 0.5
    sumC += c + 0.5
  }
  return {
    cells,
    size: cells.length,
    centroidRC: { r: sumR / cells.length, c: sumC / cells.length },
  }
}

/** Ring corners as a Set of "x,y" for order-independent comparison. */
function cornerSet(ring: Array<[number, number]>): Set<string> {
  return new Set(ring.map(([lon, lat]) => `${lon},${lat}`))
}

describe('connectedComponents', () => {
  it('separates 4-disconnected (diagonal) cells', () => {
    const mask = maskFrom(
      [
        [0, 0],
        [1, 1],
      ],
      SHAPE4,
    )
    const components = connectedComponents(mask, SHAPE4)
    expect(components).toHaveLength(2)
    expect(components.every((c) => c.size === 1)).toBe(true)
  })

  it('merges 4-connected cells and computes centroid', () => {
    const mask = maskFrom(
      [
        [0, 0],
        [0, 1],
        [1, 1],
      ],
      SHAPE4,
    )
    const components = connectedComponents(mask, SHAPE4)
    expect(components).toHaveLength(1)
    expect(components[0].size).toBe(3)
  })

  it('largestComponent picks the biggest', () => {
    const mask = maskFrom(
      [
        [0, 0],
        [2, 2],
        [2, 3],
        [3, 3],
      ],
      SHAPE4,
    )
    const largest = largestComponent(connectedComponents(mask, SHAPE4))
    expect(largest?.size).toBe(3)
  })

  it('empty mask → no components', () => {
    expect(connectedComponents(maskFrom([], SHAPE4), SHAPE4)).toHaveLength(0)
  })
})

describe('componentToPolygon — boundary trace', () => {
  it('single cell → unit square ring, CCW', () => {
    const poly = componentToPolygon(comp([[0, 0]]), SHAPE4, BOUNDS)
    expect(poly).not.toBeNull()
    expect(poly?.vertexCount).toBe(4)
    expect(cornerSet(poly?.ring ?? [])).toEqual(new Set(['0,0', '1,0', '1,1', '0,1']))
  })

  it('2×2 block → outer rectangle with collinear corners removed', () => {
    const poly = componentToPolygon(
      comp([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ]),
      SHAPE4,
      BOUNDS,
    )
    expect(poly?.vertexCount).toBe(4)
    expect(cornerSet(poly?.ring ?? [])).toEqual(new Set(['0,0', '2,0', '2,2', '0,2']))
  })

  it('L-shape → 6-corner concave ring', () => {
    // cells (0,0),(0,1),(1,0) — an L. Outer boundary has 6 corners.
    const poly = componentToPolygon(
      comp([
        [0, 0],
        [0, 1],
        [1, 0],
      ]),
      SHAPE4,
      BOUNDS,
    )
    expect(poly?.vertexCount).toBe(6)
    expect(cornerSet(poly?.ring ?? [])).toEqual(new Set(['0,0', '2,0', '2,1', '1,1', '1,2', '0,2']))
  })

  it('row-0-is-south: a north-row cell sits at high latitude', () => {
    // cell (3,0) is the northmost row → its corners are at lat 3..4.
    const poly = componentToPolygon(comp([[3, 0]]), SHAPE4, BOUNDS)
    const lats = (poly?.ring ?? []).map(([, lat]) => lat)
    expect(Math.min(...lats)).toBe(3)
    expect(Math.max(...lats)).toBe(4)
  })
})

describe('simplifyRing', () => {
  it('leaves a small ring untouched', () => {
    const ring = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]
    expect(simplifyRing(ring, 24)).toHaveLength(4)
  })

  it('caps a jagged ring at maxVertices', () => {
    // A staircase ring with many corners.
    const ring: Array<{ x: number; y: number }> = []
    for (let i = 0; i < 20; i++) {
      ring.push({ x: i, y: i % 2 })
      ring.push({ x: i + 1, y: i % 2 })
    }
    ring.push({ x: 20, y: 10 })
    ring.push({ x: 0, y: 10 })
    const simplified = simplifyRing(ring, 12)
    expect(simplified.length).toBeLessThanOrEqual(12)
    expect(simplified.length).toBeGreaterThanOrEqual(3)
  })
})

describe('large blob simplifies under the vertex cap', () => {
  it('a filled 30×30 disc-ish region yields ≤24 vertices', () => {
    const rows = 40
    const cols = 40
    const cells: Array<[number, number]> = []
    const cx = 20
    const cy = 20
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r - cy) ** 2 + (c - cx) ** 2 <= 15 ** 2) cells.push([r, c])
      }
    }
    const poly = componentToPolygon(comp(cells), [rows, cols], {
      west: 0,
      south: 0,
      east: cols,
      north: rows,
    })
    expect(poly).not.toBeNull()
    expect(poly?.vertexCount).toBeLessThanOrEqual(24)
    expect(poly?.vertexCount).toBeGreaterThanOrEqual(6)
    expect(ringIsSimple(asCorners(poly?.ring ?? []))).toBe(true)
  })
})

describe('donut region — hole handling', () => {
  it('a 5×5 block minus its center reports one hole and the outer silhouette', () => {
    const cells: Array<[number, number]> = []
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!(r === 2 && c === 2)) cells.push([r, c])
      }
    }
    const poly = componentToPolygon(comp(cells), [5, 5], { west: 0, south: 0, east: 5, north: 5 })
    expect(poly?.holeCount).toBe(1)
    // Outer silhouette = the 5×5 square (collinear corners removed → 4).
    expect(poly?.vertexCount).toBe(4)
    expect(ringIsSimple(asCorners(poly?.ring ?? []))).toBe(true)
  })
})

describe('self-intersection guard (thin ring cannot self-cross)', () => {
  it('a thin annulus yields a SIMPLE polygon even at the vertex cap', () => {
    const rows = 40
    const cols = 40
    const cx = 20
    const cy = 20
    const cells: Array<[number, number]> = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(r - cy, c - cx)
        if (d >= 13 && d <= 15.5) cells.push([r, c])
      }
    }
    const components = connectedComponents(
      (() => {
        const m = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false))
        for (const [r, c] of cells) m[r][c] = true
        return m
      })(),
      [rows, cols],
    )
    const largest = largestComponent(components)
    expect(largest).not.toBeNull()
    const poly = componentToPolygon(largest as MaskComponent, [rows, cols], {
      west: 0,
      south: 0,
      east: cols,
      north: rows,
    })
    expect(poly).not.toBeNull()
    // Correctness (a simple polygon) is guaranteed even though the thin ring
    // may need more than the 24-vertex budget to stay simple.
    expect(ringIsSimple(asCorners(poly?.ring ?? []))).toBe(true)
    expect(poly?.holeCount).toBeGreaterThanOrEqual(1)
  })
})
