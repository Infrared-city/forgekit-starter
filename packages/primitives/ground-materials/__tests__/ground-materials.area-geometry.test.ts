import type { Position } from 'geojson'
import { describe, expect, it } from 'vitest'
import {
  normalizeAreaPolygonCoordinates,
  normalizeRingPolygon,
} from '../core/ground-materials.area-geometry'

/** True iff every vertex in every ring is exactly 2D (`[lon, lat]`). */
function allVertices2D(rings: Position[][]): boolean {
  return rings.every((ring) => ring.every((c) => c.length === 2))
}

describe('normalizeRingPolygon', () => {
  it('strips embedded z from clean-v3 3D coords (every vertex → [lon, lat])', () => {
    // clean-v3 stamps [lon, lat, z] per-material — concrete here at z=0.2.
    const coords = [
      [
        [16.37, 48.2, 0.2],
        [16.38, 48.2, 0.2],
        [16.38, 48.21, 0.2],
        [16.37, 48.21, 0.2],
        [16.37, 48.2, 0.2],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    expect(allVertices2D(out)).toBe(true)
    expect(out[0][0]).toEqual([16.37, 48.2]) // z dropped
  })

  it('preserves holes while stripping z (concrete/vegetation with cutouts)', () => {
    const coords = [
      [
        [0, 0, 0.2],
        [10, 0, 0.2],
        [10, 10, 0.2],
        [0, 10, 0.2],
        [0, 0, 0.2],
      ],
      [
        [3, 3, 0.2],
        [6, 3, 0.2],
        [6, 6, 0.2],
        [3, 6, 0.2],
        [3, 3, 0.2],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    expect(out).toHaveLength(2) // outer + 1 hole retained
    expect(allVertices2D(out)).toBe(true)
  })

  it('produces uniform 2D output from a MIXED 2D/3D ring (the stride-misalignment crash)', () => {
    // turf intersect (the boundary clip) drops z on some vertices → a feature
    // ends up with mixed [lon,lat,z] and [lon,lat]. positionSize=3 then walks
    // the flat array out of stride. Normalizer must flatten ALL to 2D.
    const coords = [
      [
        [0, 0, 0.2],
        [10, 0], // 2D — dropped z
        [10, 10, 0.2],
        [0, 10], // 2D
        [0, 0, 0.2],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    expect(allVertices2D(out)).toBe(true)
  })

  it('drops null / non-finite vertices (the "reading \'pos\'" crash)', () => {
    const coords = [
      [[0, 0, 0.2], null, [10, 0, 0.2], [10, 10, 0.2], [0, 10, 0.2], [0, 0, 0.2]],
    ] as unknown
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    // 5 finite vertices survive; every one finite + 2D.
    expect(out[0]).toHaveLength(5)
    expect(out[0].every((c) => Number.isFinite(c[0]) && Number.isFinite(c[1]))).toBe(true)
  })

  it('drops NaN/Infinity vertices', () => {
    const coords = [
      [
        [0, 0],
        [Number.NaN, 5],
        [10, 0],
        [10, 10],
        [0, 0],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    expect(out[0].every((c) => Number.isFinite(c[0]) && Number.isFinite(c[1]))).toBe(true)
  })

  it('collapses consecutive duplicate points (zero-area slivers earcut chokes on)', () => {
    const coords = [
      [
        [0, 0],
        [0, 0], // duplicate
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    // the leading duplicate is collapsed
    expect(out[0]).toHaveLength(5)
  })

  it('drops a degenerate ring entirely (< 4 usable vertices)', () => {
    const coords = [
      [
        [0, 0, 0.2],
        [0, 0, 0.2],
        [0, 0, 0.2],
      ],
    ]
    expect(normalizeRingPolygon(coords)).toBeNull()
  })

  it('drops a degenerate HOLE but keeps the outer ring', () => {
    const coords = [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
      [
        // collapses to a single point → degenerate hole, dropped
        [5, 5],
        [5, 5],
        [5, 5],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    expect(out).toHaveLength(1) // outer kept, bad hole dropped
  })

  it('returns null for empty / non-array input', () => {
    expect(normalizeRingPolygon([])).toBeNull()
    expect(normalizeRingPolygon(null)).toBeNull()
    expect(normalizeRingPolygon(undefined)).toBeNull()
  })
})

describe('normalizeAreaPolygonCoordinates', () => {
  it('returns a single-polygon list for a Polygon (one entry, z stripped)', () => {
    const out = normalizeAreaPolygonCoordinates(
      [
        [
          [0, 0, 0.2],
          [1, 0, 0.2],
          [1, 1, 0.2],
          [0, 0, 0.2],
        ],
      ],
      'Polygon',
    )
    expect(out).toHaveLength(1)
    expect(allVertices2D(out[0])).toBe(true)
  })

  it('SPLITS a MultiPolygon into separate single polygons (PolygonLayer-safe)', () => {
    // The crux of the mercator-assertion fix: a MultiPolygon must become N
    // standalone single polygons, NOT one nested Position[][][] — deck.gl's
    // PolygonLayer mis-reads the extra nesting and crashes the projector.
    const out = normalizeAreaPolygonCoordinates(
      [
        [
          [
            [0, 0, 0.8],
            [1, 0, 0.8],
            [1, 1, 0.8],
            [0, 0, 0.8],
          ],
        ],
        [
          [
            [5, 5, 0.8],
            [6, 5, 0.8],
            [6, 6, 0.8],
            [5, 5, 0.8],
          ],
        ],
      ],
      'MultiPolygon',
    )
    expect(out).toHaveLength(2)
    for (const poly of out) {
      // each entry is a SINGLE polygon: poly[0] is a ring, poly[0][0] a coord pair
      expect(allVertices2D(poly)).toBe(true)
      expect(typeof poly[0][0][0]).toBe('number') // depth-2, not a nested MultiPolygon
    }
  })

  it('drops degenerate sub-polygons of a MultiPolygon, keeps the good ones', () => {
    const out = normalizeAreaPolygonCoordinates(
      [
        [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
        [
          // degenerate part
          [
            [5, 5],
            [5, 5],
          ],
        ],
      ],
      'MultiPolygon',
    )
    expect(out).toHaveLength(1)
  })

  it('returns an empty list when nothing usable remains', () => {
    expect(
      normalizeAreaPolygonCoordinates(
        [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        'Polygon',
      ),
    ).toHaveLength(0)
    expect(normalizeAreaPolygonCoordinates([], 'MultiPolygon')).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Lon/lat RANGE validation — the @math.gl/web-mercator assertion crash
// ---------------------------------------------------------------------------
// deck.gl's mercator projection asserts |lat| ≤ 85.051129 and lon is a real
// degree value. A coordinate that is finite but out of valid range (e.g.
// lat=91, lon=200, or a meter-space CRS value like [1_800_000, 6_100_000])
// passes Number.isFinite yet crashes projectFlat in _updateIndices.
// The concrete material (many features + holes + post-clip slivers) is the
// most exposed path. The range guard must drop any vertex that lies outside
// lon ∈ [-180, 180] and lat ∈ [-85.0511287798066, 85.0511287798066], treating
// the ring the same as a ring with non-finite vertices.
describe('range guard — out-of-valid-mercator-range vertices', () => {
  it('drops a feature whose outer ring contains an out-of-range latitude (lat=91)', () => {
    // A post-clip sliver can emit lat > 85.05 or, in pathological cases, > 90.
    const coords = [
      [
        [16.37, 91.0], // lat out of mercator range → whole outer ring invalid
        [16.38, 91.0],
        [16.38, 91.1],
        [16.37, 91.0],
      ],
    ]
    expect(normalizeRingPolygon(coords)).toBeNull()
  })

  it('drops a feature whose outer ring contains an out-of-range longitude (lon=200)', () => {
    const coords = [
      [
        [200.0, 48.2], // lon out of [-180, 180]
        [200.1, 48.2],
        [200.1, 48.3],
        [200.0, 48.2],
      ],
    ]
    expect(normalizeRingPolygon(coords)).toBeNull()
  })

  it('drops a feature whose outer ring contains a projected-metre coordinate', () => {
    // @turf/intersect clip output that leaks CRS meters instead of degrees.
    // Finite numbers, but wildly outside [-180, 180] / [-85, 85] degree space.
    const coords = [
      [
        [1_800_000, 6_100_000],
        [1_800_100, 6_100_000],
        [1_800_100, 6_100_100],
        [1_800_000, 6_100_000],
      ],
    ]
    expect(normalizeRingPolygon(coords)).toBeNull()
  })

  it('drops an out-of-range HOLE but keeps the valid outer ring', () => {
    const coords = [
      // valid outer ring (Vienna area)
      [
        [16.37, 48.2],
        [16.38, 48.2],
        [16.38, 48.21],
        [16.37, 48.21],
        [16.37, 48.2],
      ],
      // hole with an out-of-range vertex — must be dropped, outer kept
      [
        [16.371, 91.0],
        [16.372, 91.0],
        [16.372, 91.01],
        [16.371, 91.0],
      ],
    ]
    const out = normalizeRingPolygon(coords)
    expect(out).not.toBeNull()
    if (!out) return
    expect(out).toHaveLength(1) // outer only, bad hole dropped
  })

  it('keeps valid in-range vertices and drops out-of-range ones from the same ring', () => {
    // The out-of-range vertex is dropped per-vertex; remaining vertices are
    // checked for ring validity (≥ 4 usable).
    const coords = [
      [
        [16.37, 48.2],
        [16.38, 48.2],
        [16.38, 48.21],
        [16.37, 48.21],
        [200.0, 48.2], // out-of-range lon — dropped
        [16.37, 48.2], // closing vertex, valid
      ],
    ]
    const out = normalizeRingPolygon(coords)
    // 5 valid vertices remain (the out-of-range one is dropped, closing kept)
    expect(out).not.toBeNull()
    if (!out) return
    // all surviving vertices must be within mercator range
    for (const coord of out[0]) {
      expect(Math.abs(coord[0])).toBeLessThanOrEqual(180)
      expect(Math.abs(coord[1])).toBeLessThanOrEqual(85.0512)
    }
  })
})
