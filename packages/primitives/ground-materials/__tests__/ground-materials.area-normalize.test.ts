import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  type LooseMaterialLayers,
  normalizeSdkAreaLayers,
} from '../core/ground-materials.area-normalize'
import { GROUND_MATERIAL_REGISTRY } from '../core/ground-materials.sdk-types'

function fc(features: Array<Record<string, unknown>>): LooseMaterialLayers[string] {
  return { type: 'FeatureCollection', features }
}

function pointFeature(
  lng: number,
  lat: number,
  properties: Record<string, unknown> | null = {},
): Record<string, unknown> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng, lat],
          [lng + 1, lat],
          [lng + 1, lat + 1],
          [lng, lat],
        ],
      ],
    },
    properties,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('normalizeSdkAreaLayers', () => {
  it('stamps properties.material on every feature for a known layer', () => {
    const input: LooseMaterialLayers = {
      asphalt: fc([pointFeature(0, 0), pointFeature(1, 1)]),
    }
    const out = normalizeSdkAreaLayers(input, GROUND_MATERIAL_REGISTRY)
    expect(Object.keys(out)).toEqual(['asphalt'])
    expect(out.asphalt.features).toHaveLength(2)
    for (const f of out.asphalt.features ?? []) {
      const props = f.properties as Record<string, unknown>
      expect(props.material).toBe('asphalt')
    }
  })

  it('matches layer names case-insensitively and outputs the canonical name', () => {
    const input: LooseMaterialLayers = {
      Asphalt: fc([pointFeature(0, 0)]),
      WATER: fc([pointFeature(2, 2)]),
    }
    const out = normalizeSdkAreaLayers(input, GROUND_MATERIAL_REGISTRY)
    expect(Object.keys(out).sort()).toEqual(['asphalt', 'water'])
    expect((out.asphalt.features?.[0].properties as Record<string, unknown>).material).toBe(
      'asphalt',
    )
    expect((out.water.features?.[0].properties as Record<string, unknown>).material).toBe('water')
  })

  it('drops unknown layers with a console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const input: LooseMaterialLayers = {
      asphalt: fc([pointFeature(0, 0)]),
      foobar: fc([pointFeature(2, 2)]),
    }
    const out = normalizeSdkAreaLayers(input, GROUND_MATERIAL_REGISTRY)
    expect(Object.keys(out)).toEqual(['asphalt'])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(/foobar/)
  })

  it('overwrites a pre-existing properties.material with the registry name', () => {
    const input: LooseMaterialLayers = {
      asphalt: fc([pointFeature(0, 0, { material: 'wrong', other: 1 })]),
    }
    const out = normalizeSdkAreaLayers(input, GROUND_MATERIAL_REGISTRY)
    const props = out.asphalt.features?.[0].properties as Record<string, unknown>
    expect(props.material).toBe('asphalt')
    expect(props.other).toBe(1)
  })

  it('handles features with null properties without crashing', () => {
    const input: LooseMaterialLayers = {
      water: fc([pointFeature(0, 0, null)]),
    }
    const out = normalizeSdkAreaLayers(input, GROUND_MATERIAL_REGISTRY)
    const props = out.water.features?.[0].properties as Record<string, unknown>
    expect(props.material).toBe('water')
  })

  it('passes empty FeatureCollections through with no features', () => {
    const input: LooseMaterialLayers = {
      concrete: fc([]),
    }
    const out = normalizeSdkAreaLayers(input, GROUND_MATERIAL_REGISTRY)
    expect(out.concrete.features).toEqual([])
  })
})
