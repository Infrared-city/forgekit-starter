import type { Polygon as GeoJsonPolygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import { computeOriginFromPolygon, computeOriginFromViewport } from '../core/buildings.mesh-utils'

describe('computeOriginFromPolygon', () => {
  it('returns the SW corner [minLng, minLat] for a square polygon in London', () => {
    const londonSquare: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-0.1, 51.5],
          [-0.09, 51.5],
          [-0.09, 51.51],
          [-0.1, 51.51],
          [-0.1, 51.5],
        ],
      ],
    }

    const [lng, lat] = computeOriginFromPolygon(londonSquare)
    expect(lng).toBeCloseTo(-0.1, 10)
    expect(lat).toBeCloseTo(51.5, 10)
  })

  it('is independent of winding order (ring orientation does not affect the bbox)', () => {
    const ccw: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-0.1, 51.5],
          [-0.09, 51.5],
          [-0.09, 51.51],
          [-0.1, 51.51],
          [-0.1, 51.5],
        ],
      ],
    }
    const cw: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-0.1, 51.5],
          [-0.1, 51.51],
          [-0.09, 51.51],
          [-0.09, 51.5],
          [-0.1, 51.5],
        ],
      ],
    }
    expect(computeOriginFromPolygon(ccw)).toEqual(computeOriginFromPolygon(cw))
  })

  it('handles irregular polygons: SW corner is the minimum over all vertices', () => {
    const irregular: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2.1, 41.4],
          [2.15, 41.405],
          [2.14, 41.42],
          [2.11, 41.415],
          [2.095, 41.41],
          [2.1, 41.4],
        ],
      ],
    }
    const [lng, lat] = computeOriginFromPolygon(irregular)
    expect(lng).toBeCloseTo(2.095, 10)
    expect(lat).toBeCloseTo(41.4, 10)
  })
})

describe('computeOriginFromViewport', () => {
  it('still derives SW corner from a center+width viewport (regression)', () => {
    // Sanity check that the existing helper still works alongside the
    // new polygon variant.
    const [lng, lat] = computeOriginFromViewport({
      latitude: 51.5,
      longitude: -0.1,
      width: 512,
      height: 512,
    })
    expect(lng).toBeLessThan(-0.1)
    expect(lat).toBeLessThan(51.5)
  })
})
