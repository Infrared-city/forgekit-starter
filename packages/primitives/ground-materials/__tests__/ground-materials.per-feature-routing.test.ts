import type { Feature } from 'geojson'
import { describe, expect, it } from 'vitest'
import type { GroundMaterialRegistry } from '../core/ground-materials.sdk-types'
import {
  buildFallbackWarning,
  DEFAULT_FALLBACK_MATERIAL,
  resolvePerFeatureMaterials,
} from '../react/ground-materials.utils'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeRegistryElement(name: string, uuid: string) {
  return {
    name,
    displayName: name,
    diffuseColor: [0.1, 0.1, 0.1],
    specularColor: [0, 0, 0],
    shine: 0,
    reflectivity: 0.05,
    emissiveColor: [0, 0, 0],
    opacity: 1,
    thickness: 0.1,
    density: 1000,
    thermalConductivity: 0.5,
    specificHeat: 1000,
    solarAbsorptance: 0.9,
    thermalAbsorptance: 0.9,
    visibleAbsorptance: 0.9,
    roughness: 0.8,
    porosity: 0.05,
    carbonFactor: 0,
    uuid,
  } as const
}

const registry: GroundMaterialRegistry = {
  version: '1.0',
  uuid: 'registry-uuid',
  materials: {
    'uuid-asphalt': makeRegistryElement('asphalt', 'uuid-asphalt'),
    'uuid-concrete': makeRegistryElement('concrete', 'uuid-concrete'),
    'uuid-vegetation': makeRegistryElement('vegetation', 'uuid-vegetation'),
  },
}

function makeFeature(id: string, properties: Record<string, unknown> = {}): Feature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    },
    properties,
  }
}

// ---------------------------------------------------------------------------
// resolvePerFeatureMaterials -- pure routing helper
// ---------------------------------------------------------------------------

describe('resolvePerFeatureMaterials', () => {
  it('routes every labeled feature to its declared material', () => {
    const features = [
      makeFeature('a', { material: 'asphalt' }),
      makeFeature('b', { material: 'concrete' }),
      makeFeature('c', { material: 'vegetation' }),
    ]
    const result = resolvePerFeatureMaterials(features, registry, null)

    expect(result.assignments).toEqual([
      { id: 'a', materialName: 'asphalt' },
      { id: 'b', materialName: 'concrete' },
      { id: 'c', materialName: 'vegetation' },
    ])
    expect(result.usedFallback).toBe(false)
    expect(result.unknownNames).toEqual([])
    expect(result.missingCount).toBe(0)
  })

  it('falls back partial-labeled features to the panel material', () => {
    const features = [
      makeFeature('a', { material: 'asphalt' }),
      makeFeature('b', {}),
      makeFeature('c', { material: 'vegetation' }),
    ]
    const result = resolvePerFeatureMaterials(features, registry, 'concrete')

    expect(result.assignments).toEqual([
      { id: 'a', materialName: 'asphalt' },
      { id: 'b', materialName: 'concrete' },
      { id: 'c', materialName: 'vegetation' },
    ])
    expect(result.usedFallback).toBe(true)
    expect(result.missingCount).toBe(1)
    expect(result.unknownNames).toEqual([])
    expect(result.fallbackMaterial).toBe('concrete')
  })

  it('routes unknown names to the panel fallback and records them', () => {
    const features = [
      makeFeature('a', { material: 'gold' }),
      makeFeature('b', { material: 'silver' }),
      makeFeature('c', { material: 'gold' }),
    ]
    const result = resolvePerFeatureMaterials(features, registry, 'concrete')

    expect(result.assignments).toEqual([
      { id: 'a', materialName: 'concrete' },
      { id: 'b', materialName: 'concrete' },
      { id: 'c', materialName: 'concrete' },
    ])
    expect(result.usedFallback).toBe(true)
    expect(result.unknownNames).toEqual(['gold', 'silver']) // distinct, order preserved
    expect(result.missingCount).toBe(0)
  })

  it('falls back to "asphalt" when neither feature label nor panel material is valid', () => {
    const features = [makeFeature('a', {}), makeFeature('b', { material: 'unobtanium' })]
    const result = resolvePerFeatureMaterials(features, registry, null)

    expect(result.fallbackMaterial).toBe(DEFAULT_FALLBACK_MATERIAL)
    expect(result.assignments.every((a) => a.materialName === 'asphalt')).toBe(true)
    expect(result.usedFallback).toBe(true)
    expect(result.missingCount).toBe(1)
    expect(result.unknownNames).toEqual(['unobtanium'])
  })

  it('falls back to "asphalt" when panel material is itself unknown to the registry', () => {
    const features = [makeFeature('a', {})]
    const result = resolvePerFeatureMaterials(features, registry, 'phantom')

    expect(result.fallbackMaterial).toBe('asphalt')
    expect(result.assignments[0]).toEqual({ id: 'a', materialName: 'asphalt' })
  })

  it('drops features without an id and survives a null registry', () => {
    const features = [{ ...makeFeature('a', { material: 'asphalt' }), id: undefined } as Feature]
    const result = resolvePerFeatureMaterials(features, null, null)

    expect(result.assignments).toEqual([])
  })

  it('routes every feature through the panel fallback when the registry has not loaded', () => {
    // Registry query still in-flight: we cannot validate any label, so every
    // feature -- labeled or not -- must route through `currentMaterial`. The
    // downstream analysis-body builder drops unknown material keys, so
    // trusting arbitrary labels here would cause silent data loss.
    const features = [makeFeature('a', { material: 'gold' }), makeFeature('b', {})]
    const result = resolvePerFeatureMaterials(features, null, 'concrete')

    expect(result.fallbackMaterial).toBe('concrete')
    expect(result.assignments).toEqual([
      { id: 'a', materialName: 'concrete' }, // unverifiable label → panel fallback
      { id: 'b', materialName: 'concrete' }, // missing label → panel fallback
    ])
    expect(result.usedFallback).toBe(true)
    expect(result.missingCount).toBe(1)
    expect(result.unknownNames).toEqual(['gold'])
  })

  it('falls back to "asphalt" when the registry is missing AND no panel material is set', () => {
    const features = [makeFeature('a', { material: 'gold' }), makeFeature('b', {})]
    const result = resolvePerFeatureMaterials(features, null, null)

    expect(result.fallbackMaterial).toBe(DEFAULT_FALLBACK_MATERIAL)
    expect(result.assignments).toEqual([
      { id: 'a', materialName: 'asphalt' },
      { id: 'b', materialName: 'asphalt' },
    ])
  })
})

// ---------------------------------------------------------------------------
// buildFallbackWarning -- aggregated warning string
// ---------------------------------------------------------------------------

describe('buildFallbackWarning', () => {
  it('returns null when no fallback occurred', () => {
    expect(
      buildFallbackWarning({
        assignments: [],
        unknownNames: [],
        missingCount: 0,
        usedFallback: false,
        fallbackMaterial: 'asphalt',
      }),
    ).toBeNull()
  })

  it('summarises unknown names + missing count in one sentence', () => {
    const warning = buildFallbackWarning({
      assignments: [],
      unknownNames: ['gold', 'silver'],
      missingCount: 2,
      usedFallback: true,
      fallbackMaterial: 'asphalt',
    })
    expect(warning).toContain('gold, silver')
    expect(warning).toContain('2 features without a material label')
    expect(warning).toContain('asphalt')
  })

  it('singularises when only one unknown name and zero missing', () => {
    const warning = buildFallbackWarning({
      assignments: [],
      unknownNames: ['gold'],
      missingCount: 0,
      usedFallback: true,
      fallbackMaterial: 'concrete',
    })
    expect(warning).toContain('unknown material:')
    expect(warning).not.toContain('materials:')
    expect(warning).toContain('concrete')
  })
})
