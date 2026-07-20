import type { Feature, FeatureCollection, Polygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import { processMultiMaterialImport } from '../core/ground-materials.multi-import'
import { MultiMaterialImportSchema } from '../core/ground-materials.sdk-types'
import type { GroundMaterialsViewport, MetersToLatLngFn } from '../core/ground-materials.types'

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

/**
 * Deterministic meters→lat/lng conversion for tests. Origin is the centre,
 * meters map 1:1 to micro-degrees so a viewport of width=10/height=10 metres
 * centered at (0,0) becomes a polygon spanning roughly [-5..5] in both axes.
 */
const metersToLatLng: MetersToLatLngFn = (meters, origin) => ({
  lat: origin[1] + meters.y,
  lng: origin[0] + meters.x,
})

/** A 10x10 viewport centered at (0,0). */
const viewport: GroundMaterialsViewport = {
  latitude: 0,
  longitude: 0,
  width: 10,
  height: 10,
}

function makePolygon(coords: number[][]): Feature<Polygon> {
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  }
}

/** A small polygon fully inside the [-5..5] viewport. */
function insidePolygon(): Feature<Polygon> {
  return makePolygon([
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
    [-1, -1],
  ])
}

/** A polygon entirely outside the viewport. */
function outsidePolygon(): Feature<Polygon> {
  return makePolygon([
    [100, 100],
    [110, 100],
    [110, 110],
    [100, 110],
    [100, 100],
  ])
}

function fc(features: Feature[]): FeatureCollection {
  return { type: 'FeatureCollection', features }
}

// ---------------------------------------------------------------------------
// Schema rejection
// ---------------------------------------------------------------------------

describe('MultiMaterialImportSchema', () => {
  it('accepts a valid multi-material dict', () => {
    const input = {
      asphalt: fc([insidePolygon()]),
      concrete: fc([insidePolygon()]),
    }
    const result = MultiMaterialImportSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejects a bare FeatureCollection root', () => {
    const input = fc([insidePolygon()])
    const result = MultiMaterialImportSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejects an object whose values are not FeatureCollections', () => {
    const input = { asphalt: { foo: 'bar' } }
    const result = MultiMaterialImportSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejects an array root', () => {
    const result = MultiMaterialImportSchema.safeParse([insidePolygon()])
    expect(result.success).toBe(false)
  })

  it('rejects primitive roots', () => {
    expect(MultiMaterialImportSchema.safeParse('asphalt').success).toBe(false)
    expect(MultiMaterialImportSchema.safeParse(42).success).toBe(false)
    expect(MultiMaterialImportSchema.safeParse(null).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// processMultiMaterialImport
// ---------------------------------------------------------------------------

describe('processMultiMaterialImport', () => {
  it('processes a valid two-group input and tags every output feature with its group', () => {
    const input = {
      asphalt: fc([insidePolygon()]),
      concrete: fc([insidePolygon()]),
    }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features.length).toBe(2)
    expect(result.groupStats).toEqual({
      asphalt: { in: 1, out: 1 },
      concrete: { in: 1, out: 1 },
    })

    const materials = result.features.features
      .map((f) => f.properties?.material as string | undefined)
      .sort()
    expect(materials).toEqual(['asphalt', 'concrete'])

    // Every feature gets a freshly-assigned UUID id
    for (const feat of result.features.features) {
      expect(typeof feat.id).toBe('string')
    }
  })

  it('preserves the group material on every MultiPolygon child after @turf/flatten', () => {
    // A MultiPolygon with two parts — both must inherit `material = vegetation`.
    const multi: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-2, -2],
              [-1, -2],
              [-1, -1],
              [-2, -1],
              [-2, -2],
            ],
          ],
          [
            [
              [1, 1],
              [2, 1],
              [2, 2],
              [1, 2],
              [1, 1],
            ],
          ],
        ],
      },
    }
    const result = processMultiMaterialImport({ vegetation: fc([multi]) }, viewport, metersToLatLng)

    expect(result.features.features.length).toBe(2)
    for (const feat of result.features.features) {
      expect(feat.properties?.material).toBe('vegetation')
    }
    expect(result.groupStats.vegetation.out).toBe(2)
  })

  it('drops features outside the boundary per group and warns', () => {
    const input = {
      asphalt: fc([insidePolygon(), outsidePolygon()]),
    }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features.length).toBe(1)
    expect(result.features.features[0]?.properties?.material).toBe('asphalt')
    expect(result.groupStats.asphalt).toEqual({ in: 2, out: 1 })
    expect(result.warnings.some((w) => /asphalt.*outside the project boundary/i.test(w))).toBe(true)
  })

  it('drops non-polygon features per group and warns', () => {
    const point: Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    }
    const input = {
      asphalt: fc([point, insidePolygon()]),
    }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features.length).toBe(1)
    expect(result.groupStats.asphalt).toEqual({ in: 2, out: 1 })
    expect(result.warnings.some((w) => /asphalt.*non-polygon/i.test(w))).toBe(true)
  })

  it('warns and drops empty groups silently', () => {
    const input = {
      asphalt: fc([insidePolygon()]),
      concrete: fc([]),
    }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features.length).toBe(1)
    expect(result.groupStats.concrete).toEqual({ in: 0, out: 0 })
    expect(result.warnings.some((w) => /concrete.*empty/i.test(w))).toBe(true)
  })

  it('rejects a bare FeatureCollection root with a friendly toggle hint', () => {
    const input = fc([insidePolygon()])
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features).toEqual([])
    expect(result.warnings.length).toBe(1)
    expect(result.warnings[0]).toMatch(/single-material/i)
  })

  it('rejects schema-invalid roots (non-FC values)', () => {
    const input = { asphalt: { not: 'a feature collection' } }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features).toEqual([])
    expect(result.warnings[0]).toMatch(/Not a valid multi-material object/i)
    expect(result.groupStats).toEqual({})
  })

  it('accepts JSON last-wins for duplicate keys (parser collapses before us)', () => {
    // Simulate what `JSON.parse` already produced: a single key with the
    // last duplicate's value. No pre-parse detection is attempted — this
    // documents that behaviour.
    const lastWinsConcrete = fc([insidePolygon()])
    const input = {
      // Pretend the JSON was `{"concrete": [first], "concrete": [last]}`.
      concrete: lastWinsConcrete,
    }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features.length).toBe(1)
    expect(result.features.features[0]?.properties?.material).toBe('concrete')
    expect(result.groupStats.concrete).toEqual({ in: 1, out: 1 })
  })

  it('returns an empty result with a friendly warning when nothing intersects the boundary', () => {
    const input = { asphalt: fc([outsidePolygon()]) }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.features.features).toEqual([])
    // Either the boundary warning or a generic "no polygons intersect" warning is acceptable;
    // both communicate the empty-output state to the caller.
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('enforces the aggregate MAX_POLYGON_COUNT cap by counting flatten-admitted polygons, not clip survivors', () => {
    // Regression for an early bug where the aggregate budget was decremented
    // by `clipped.length` only. A group whose polygons all clip OUTSIDE the
    // boundary would then consume 0 budget and let an arbitrary number of
    // subsequent polygons through.
    //
    // Strategy: group A is 480 polygons that all clip out (work done = 480,
    // survivors = 0). Group B is 50 inside polygons. With the fix the budget
    // is 500 - 480 = 20, so B must be truncated to 20. Without the fix
    // budget stays at 500 and B passes through fully.
    const groupAOutside = Array.from({ length: 480 }, () => outsidePolygon())
    const groupBInside = Array.from({ length: 50 }, () => insidePolygon())
    const input = {
      a_outside: fc(groupAOutside),
      b_inside: fc(groupBInside),
    }
    const result = processMultiMaterialImport(input, viewport, metersToLatLng)

    expect(result.groupStats.a_outside.in).toBe(480)
    expect(result.groupStats.a_outside.out).toBe(0) // all clipped out
    expect(result.groupStats.b_inside.in).toBe(50)
    // Budget after group A: 500 - 480 = 20 → group B must be truncated to 20.
    expect(result.groupStats.b_inside.out).toBe(20)
    expect(result.warnings.some((w) => /exceeded the 500-feature limit/i.test(w))).toBe(true)
  })
})
