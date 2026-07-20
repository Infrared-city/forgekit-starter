import type { Polygon as GeoJsonPolygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import {
  MAX_TREE_COUNT,
  needsFallbackPrompt,
  parseTreesGeoJson,
  processImportedTrees,
} from '../core/vegetation.import-utils'
import type { TreesFeatureCollection } from '../core/vegetation.sdk-types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A 10x10 square polygon centred at (0, 0). Points with `|x|, |y| < 5`
 * are inside. */
const insidePolygon: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-5, -5],
      [5, -5],
      [5, 5],
      [-5, 5],
      [-5, -5],
    ],
  ],
}

const fallback = { height: 8, crownDiameter: 4 }

function point(
  lng: number,
  lat: number,
  props: Record<string, unknown> | null = {},
): Record<string, unknown> {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: props,
  }
}

function fc(features: Array<Record<string, unknown>>): TreesFeatureCollection {
  return { type: 'FeatureCollection', features } as TreesFeatureCollection
}

function makeFile(content: unknown, name = 'trees.geojson'): File {
  const text = typeof content === 'string' ? content : JSON.stringify(content)
  return new File([text], name, { type: 'application/geo+json' })
}

// ---------------------------------------------------------------------------
// parseTreesGeoJson
// ---------------------------------------------------------------------------

describe('parseTreesGeoJson', () => {
  it('accepts a pure-Point FeatureCollection', async () => {
    const file = makeFile(fc([point(1, 1, { height: 10, crownDiameter: 5 })]))
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.featureCollection.features).toHaveLength(1)
    }
  })

  it('wraps a bare Point geometry into a FeatureCollection', async () => {
    const file = makeFile({ type: 'Point', coordinates: [1, 2] })
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.featureCollection.features).toHaveLength(1)
      expect(result.featureCollection.features[0]?.geometry.type).toBe('Point')
    }
  })

  it('wraps a bare Point Feature into a FeatureCollection', async () => {
    const file = makeFile(point(0, 0, { height: 5 }))
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.featureCollection.features).toHaveLength(1)
    }
  })

  it('rejects a file with any non-Point feature (whole-file reject)', async () => {
    const polygonFeature = {
      type: 'Feature',
      geometry: {
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
      },
      properties: {},
    }
    const file = makeFile(fc([point(0, 0), polygonFeature]))
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Point/)
      expect(result.error).toMatch(/Polygon/)
    }
  })

  it('rejects a bare non-Point geometry root with a friendly error', async () => {
    const file = makeFile({
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
    })
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Polygon/)
    }
  })

  it('rejects an empty FeatureCollection', async () => {
    const file = makeFile(fc([]))
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/no features/i)
    }
  })

  it('rejects an array root', async () => {
    const file = makeFile([])
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(false)
  })

  it('rejects invalid JSON', async () => {
    const file = makeFile('not valid json')
    const result = await parseTreesGeoJson(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Invalid JSON/i)
    }
  })

  it('rejects files over the 5 MB size cap', async () => {
    // Build a fake File with size > 5 MB by stubbing `.size` and `.text()`.
    const oversize = new File(['{}'], 'big.geojson')
    Object.defineProperty(oversize, 'size', { value: 6 * 1024 * 1024 })
    const result = await parseTreesGeoJson(oversize)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/too large/i)
    }
  })

  it('accepts uncoercible height values at parse time (processing handles fallback)', async () => {
    // Regression: an earlier draft used `z.coerce.number().finite()` for
    // height, which rejected `{ "height": "tall" }` at parse time and
    // never gave `processImportedTrees` a chance to apply the user's
    // fallback. The schema must stay loose — fallback is the processing
    // step's job, not the parser's.
    const file = makeFile(fc([point(0, 0, { height: 'tall', crownDiameter: 5 })]))
    const parsed = await parseTreesGeoJson(file)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const result = processImportedTrees(parsed.featureCollection, insidePolygon, fallback)
    expect(result.fallbackAppliedCount).toBe(1)
    const props = result.features[0]?.properties as Record<string, unknown>
    expect(props.height).toBe(fallback.height)
    expect(props.crownDiameter).toBe(fallback.crownDiameter)
  })
})

// ---------------------------------------------------------------------------
// needsFallbackPrompt
// ---------------------------------------------------------------------------

describe('needsFallbackPrompt', () => {
  it('returns false when every feature has in-range height + crownDiameter', () => {
    const input = fc([
      point(0, 0, { height: 10, crownDiameter: 5 }),
      point(1, 1, { height: 5, crownDiameter: 3 }),
    ])
    expect(needsFallbackPrompt(input)).toBe(false)
  })

  it('returns true when any feature is missing height', () => {
    const input = fc([
      point(0, 0, { height: 10, crownDiameter: 5 }),
      point(1, 1, { crownDiameter: 3 }),
    ])
    expect(needsFallbackPrompt(input)).toBe(true)
  })

  it('returns true when any feature is missing crownDiameter', () => {
    const input = fc([point(0, 0, { height: 10 })])
    expect(needsFallbackPrompt(input)).toBe(true)
  })

  it('returns true when height is out-of-range', () => {
    const input = fc([point(0, 0, { height: 100, crownDiameter: 5 })])
    expect(needsFallbackPrompt(input)).toBe(true)
  })

  it('accepts numeric-string coercion ("5.2" is in range)', () => {
    const input = fc([point(0, 0, { height: '5.2', crownDiameter: '3' })])
    expect(needsFallbackPrompt(input)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// processImportedTrees
// ---------------------------------------------------------------------------

describe('processImportedTrees', () => {
  it('coerces numeric strings without applying fallback when in range', () => {
    const input = fc([point(0, 0, { height: '5.2', crownDiameter: '3' })])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.fallbackAppliedCount).toBe(0)
    expect(result.features).toHaveLength(1)
    const props = result.features[0]?.properties as Record<string, unknown>
    expect(props.height).toBe(5.2)
    expect(props.crownDiameter).toBe(3)
  })

  it('applies fallback for missing height and counts it', () => {
    const input = fc([point(0, 0, { crownDiameter: 4 })])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.fallbackAppliedCount).toBe(1)
    expect(result.features).toHaveLength(1)
    const props = result.features[0]?.properties as Record<string, unknown>
    expect(props.height).toBe(fallback.height)
    expect(props.crownDiameter).toBe(fallback.crownDiameter)
    expect(result.warnings.some((w) => /fallback/i.test(w))).toBe(true)
  })

  it('applies fallback for out-of-range height', () => {
    const input = fc([point(0, 0, { height: 100, crownDiameter: 5 })])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.fallbackAppliedCount).toBe(1)
    const props = result.features[0]?.properties as Record<string, unknown>
    expect(props.height).toBe(fallback.height)
    expect(props.crownDiameter).toBe(fallback.crownDiameter)
  })

  it('applies fallback for out-of-range crownDiameter', () => {
    const input = fc([point(0, 0, { height: 10, crownDiameter: 50 })])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.fallbackAppliedCount).toBe(1)
    const props = result.features[0]?.properties as Record<string, unknown>
    expect(props.height).toBe(fallback.height)
    expect(props.crownDiameter).toBe(fallback.crownDiameter)
  })

  it('drops features outside the polygon and reports the count', () => {
    const input = fc([
      point(0, 0, { height: 10, crownDiameter: 5 }),
      point(100, 100, { height: 10, crownDiameter: 5 }),
    ])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.droppedOutsideCount).toBe(1)
    expect(result.features).toHaveLength(1)
    expect(result.warnings.some((w) => /outside/i.test(w))).toBe(true)
  })

  it('returns an empty result when no trees fall inside the polygon', () => {
    const input = fc([
      point(100, 100, { height: 10, crownDiameter: 5 }),
      point(200, 200, { height: 10, crownDiameter: 5 }),
    ])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.features).toEqual([])
    expect(result.droppedOutsideCount).toBe(2)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('enforces the 500-tree cap and warns', () => {
    const inputFeatures: Array<Record<string, unknown>> = []
    // 600 trees, all inside the polygon (spread across a tiny grid so each
    // point is unique but well within [-5, 5]).
    for (let i = 0; i < 600; i++) {
      const lng = (i % 30) * 0.1 - 1.5
      const lat = Math.floor(i / 30) * 0.1 - 1.5
      inputFeatures.push(point(lng, lat, { height: 10, crownDiameter: 5 }))
    }
    const result = processImportedTrees(fc(inputFeatures), insidePolygon, fallback)

    expect(result.features.length).toBe(MAX_TREE_COUNT)
    expect(result.warnings.some((w) => /500/.test(w))).toBe(true)
  })

  it('assigns UUIDs to features missing valid v4 ids', () => {
    const input = fc([point(0, 0, { height: 10, crownDiameter: 5 })])
    const result = processImportedTrees(input, insidePolygon, fallback)

    expect(result.features).toHaveLength(1)
    expect(typeof result.features[0]?.id).toBe('string')
    expect(String(result.features[0]?.id)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('preserves an existing valid UUID id', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000'
    const feature = point(0, 0, { height: 10, crownDiameter: 5 })
    feature.id = validUuid
    const input = fc([feature])
    const result = processImportedTrees(input, insidePolygon, fallback)
    expect(result.features[0]?.id).toBe(validUuid)
  })

  it('returns the polygon clip as feature-array shape (caller dict-keys by id)', () => {
    const input = fc([point(0, 0, { height: 10, crownDiameter: 5 })])
    const result = processImportedTrees(input, insidePolygon, fallback)

    // Caller would build the store dict via `Object.fromEntries` of [id, f]
    // — sanity-check the shape we hand back supports that pattern.
    const dict = Object.fromEntries(result.features.map((f) => [String(f.id), f]))
    expect(Object.keys(dict)).toHaveLength(1)
  })
})
