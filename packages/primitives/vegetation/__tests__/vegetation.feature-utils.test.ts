import type { Polygon as GeoJsonPolygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import { areaFeaturesToCollection, stablePolygonKey } from '../core/vegetation.feature-utils'

describe('stablePolygonKey', () => {
  it('returns the same string for deep-equal polygons with different identities', () => {
    const a: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    }
    const b: GeoJsonPolygon = JSON.parse(JSON.stringify(a))
    expect(a).not.toBe(b)
    expect(stablePolygonKey(a)).toBe(stablePolygonKey(b))
  })

  it('returns "null" for a null polygon', () => {
    expect(stablePolygonKey(null)).toBe('null')
  })
})

describe('areaFeaturesToCollection', () => {
  it('wraps the features dict into a FeatureCollection', () => {
    const collection = areaFeaturesToCollection({
      features: {
        a: { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} },
        b: { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 1] }, properties: {} },
      },
      polygon: null,
      totalTrees: 2,
      executionTime: 0,
    })
    expect(collection.type).toBe('FeatureCollection')
    expect(collection.features).toHaveLength(2)
  })

  it('preserves feature order from Object.values()', () => {
    const collection = areaFeaturesToCollection({
      features: {
        '1': { id: '1' },
        '2': { id: '2' },
      },
      polygon: null,
      totalTrees: 2,
      executionTime: 0,
    })
    expect(collection.features?.map((f) => (f as Record<string, unknown>).id)).toEqual(['1', '2'])
  })
})
