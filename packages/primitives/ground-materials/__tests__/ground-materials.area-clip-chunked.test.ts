/**
 * `clipAreaLayersToPolygonChunked` — time-sliced twin of the sync clip.
 * Contract: IDENTICAL output (shared per-feature `clipFeatureAgainst` step;
 * pinned here), plus abort semantics. Mirrors the buildings/vegetation
 * chunked-geometry suites.
 */
import type { Polygon } from 'geojson'
import { describe, expect, it, vi } from 'vitest'
import {
  clipAreaLayersToPolygon,
  clipAreaLayersToPolygonChunked,
} from '../core/ground-materials.area-clip'
import type { LooseMaterialLayers } from '../core/ground-materials.area-normalize'

/** Unit square clip polygon. */
const SQUARE: Polygon = {
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

const poly = (coords: number[][]): Record<string, unknown> => ({
  type: 'Feature',
  properties: { material: 'asphalt' },
  geometry: { type: 'Polygon', coordinates: [coords] },
})

/** Mixed fixture: inside, straddling, outside, MultiPolygon, empty layer. */
function makeLayers(): LooseMaterialLayers {
  return {
    asphalt: {
      type: 'FeatureCollection',
      features: [
        poly([
          [0.1, 0.1],
          [0.4, 0.1],
          [0.4, 0.4],
          [0.1, 0.4],
          [0.1, 0.1],
        ]), // wholly inside
        poly([
          [0.8, 0.8],
          [1.5, 0.8],
          [1.5, 1.5],
          [0.8, 1.5],
          [0.8, 0.8],
        ]), // straddles the NE corner
        poly([
          [5, 5],
          [6, 5],
          [6, 6],
          [5, 6],
          [5, 5],
        ]), // wholly outside → dropped
        {
          type: 'Feature',
          properties: { material: 'asphalt' },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [0.2, 0.5],
                  [0.6, 0.5],
                  [0.6, 0.7],
                  [0.2, 0.7],
                  [0.2, 0.5],
                ],
              ],
              [
                [
                  [7, 7],
                  [8, 7],
                  [8, 8],
                  [7, 8],
                  [7, 7],
                ],
              ],
            ],
          },
        },
      ],
    },
    grass: { type: 'FeatureCollection', features: [] },
  } as unknown as LooseMaterialLayers
}

describe('clipAreaLayersToPolygonChunked', () => {
  it('produces output identical to the synchronous clip (drop/trim/flatten/properties)', async () => {
    const layers = makeLayers()
    const sync = clipAreaLayersToPolygon(layers, SQUARE)
    const chunked = await clipAreaLayersToPolygonChunked(layers, SQUARE, { sliceMs: 0 })

    expect(chunked).not.toBeNull()
    expect(JSON.parse(JSON.stringify(chunked))).toEqual(JSON.parse(JSON.stringify(sync)))
    // The fixture must actually exercise drop + trim for the pin to mean
    // anything: 2 kept polygons + 1 trimmed + 1 flattened-Multi part.
    expect((sync.asphalt?.features ?? []).length).toBe(3)
    expect((sync.grass?.features ?? []).length).toBe(0)
  })

  it('yields between features and returns null when aborted', async () => {
    const yieldNow = vi.fn(async () => {})
    let calls = 0
    const result = await clipAreaLayersToPolygonChunked(makeLayers(), SQUARE, {
      sliceMs: 0,
      yieldNow,
      shouldAbort: () => ++calls > 2,
    })
    expect(result).toBeNull()
    expect(yieldNow.mock.calls.length).toBeGreaterThan(0)
  })
})
