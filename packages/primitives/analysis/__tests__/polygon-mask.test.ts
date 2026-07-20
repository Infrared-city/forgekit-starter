import { describe, expect, it } from 'vitest'
import { pointInPolygon, polygonBbox, polygonCentroid } from '../core/polygon-mask'

const triangle: [number, number][] = [
  [0, 0],
  [4, 0],
  [2, 4],
]

describe('pointInPolygon', () => {
  it('detects inside / outside on a triangle', () => {
    expect(pointInPolygon(2, 1, triangle)).toBe(true)
    expect(pointInPolygon(0.1, 3.9, triangle)).toBe(false)
    expect(pointInPolygon(5, 1, triangle)).toBe(false)
  })

  it('rejects degenerate rings', () => {
    expect(pointInPolygon(0, 0, [[0, 0]] as [number, number][])).toBe(false)
  })
})

describe('polygonCentroid / polygonBbox', () => {
  it('centroid of a square is its centre', () => {
    const square: [number, number][] = [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ]
    expect(polygonCentroid(square)).toEqual([1, 1])
    expect(polygonBbox(square)).toEqual([0, 0, 2, 2])
  })
})
