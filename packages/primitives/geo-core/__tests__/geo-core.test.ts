import type { Polygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import {
  computeOriginFromPolygon,
  computeOriginFromViewport,
  latLngToMetersLocal,
  METERS_PER_DEG_LAT,
  metersPerDegLng,
  metersToLatLng,
} from '../index'

const square = (): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [16.3, 48.2],
      [16.4, 48.2],
      [16.4, 48.3],
      [16.3, 48.3],
      [16.3, 48.2],
    ],
  ],
})

describe('geo-core', () => {
  it('origin is the bbox SW corner', () => {
    expect(computeOriginFromPolygon(square())).toEqual([16.3, 48.2])
  })

  it('origin vertex maps to (0,0) in meters', () => {
    const o = computeOriginFromPolygon(square())
    expect(latLngToMetersLocal(o, o[0], o[1])).toEqual([0, 0])
  })

  it('latLngToMetersLocal uses 111320*cosLat / 110540', () => {
    const [x, y] = latLngToMetersLocal([16.3, 48.2], 16.4, 48.3)
    expect(x).toBeCloseTo(0.1 * metersPerDegLng(48.2), 3)
    expect(y).toBeCloseTo(0.1 * METERS_PER_DEG_LAT, 3)
  })

  it('metersToLatLng round-trips latLngToMetersLocal', () => {
    const o: [number, number] = [16.3, 48.2]
    const [x, y] = latLngToMetersLocal(o, 16.37, 48.25)
    const [lng, lat] = metersToLatLng(o, x, y)
    expect(lng).toBeCloseTo(16.37, 9)
    expect(lat).toBeCloseTo(48.25, 9)
  })

  it('computeOriginFromViewport derives the SW corner from center + metre extent', () => {
    const vp = { longitude: 16.3, latitude: 48.2, width: 1000, height: 1000 }
    const [lng, lat] = computeOriginFromViewport(vp)
    expect(lng).toBeCloseTo(16.3 - 500 / metersPerDegLng(48.2), 12)
    expect(lat).toBeCloseTo(48.2 - 500 / METERS_PER_DEG_LAT, 12)
  })

  it('metersPerDegLng stays finite and > 0 at the pole (no div-by-zero)', () => {
    // JS Math.cos(90deg) is ~6.12e-17, never exactly 0 → factor is tiny but finite.
    expect(metersPerDegLng(90)).toBeGreaterThan(0)
    expect(Number.isFinite(metersPerDegLng(90))).toBe(true)
  })

  it('metersToLatLng / computeOriginFromViewport stay finite at the pole', () => {
    const [lng, lat] = metersToLatLng([0, 90], 100, 100)
    expect(Number.isFinite(lng)).toBe(true)
    expect(Number.isFinite(lat)).toBe(true)
    const [olng, olat] = computeOriginFromViewport({
      longitude: 0,
      latitude: 90,
      width: 1000,
      height: 1000,
    })
    expect(Number.isFinite(olng)).toBe(true)
    expect(Number.isFinite(olat)).toBe(true)
  })

  it('round-trips in the southern hemisphere (negative lat/lng)', () => {
    const o: [number, number] = [-58.4, -34.6] // Buenos Aires
    const [x, y] = latLngToMetersLocal(o, -58.35, -34.55)
    const [lng, lat] = metersToLatLng(o, x, y)
    expect(lng).toBeCloseTo(-58.35, 9)
    expect(lat).toBeCloseTo(-34.55, 9)
  })
})
