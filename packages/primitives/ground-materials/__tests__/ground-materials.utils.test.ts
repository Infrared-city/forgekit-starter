import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FeatureCollection, GroundMaterialRegistry } from '../core/ground-materials.sdk-types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock the draw-hook module for getDrawInstance
vi.mock('../react/ground-materials.draw-hook', () => ({
  getDrawInstance: vi.fn(),
}))

// Mock SDK functions (now inlined in the primitive package)
vi.mock('../core/ground-materials.sdk-types', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../core/ground-materials.sdk-types')>()
  return {
    ...actual,
    mapNamesToUuids: vi.fn(),
    buildGroundMaterialBody: vi.fn(),
  }
})

import { buildGroundMaterialBody, mapNamesToUuids } from '../core/ground-materials.sdk-types'
import { getDrawInstance } from '../react/ground-materials.draw-hook'
import { buildAnalysisGroundMaterials } from '../react/ground-materials.utils'

// ─── Test fixtures ────────────────────────────────────────────────────────────

const mockRegistry: GroundMaterialRegistry = {
  version: '1.0',
  uuid: 'registry-uuid',
  materials: {
    'uuid-vegetation': {
      name: 'vegetation',
      displayName: 'Vegetation',
      diffuseColor: [0.2, 0.6, 0.1],
      specularColor: [0, 0, 0],
      shine: 0,
      reflectivity: 0.2,
      emissiveColor: [0, 0, 0],
      opacity: 1,
      thickness: 0.1,
      density: 1000,
      thermalConductivity: 0.5,
      specificHeat: 1000,
      solarAbsorptance: 0.7,
      thermalAbsorptance: 0.9,
      visibleAbsorptance: 0.7,
      roughness: 0.5,
      porosity: 0.3,
      carbonFactor: 0,
      uuid: 'uuid-vegetation',
    },
  },
}

const mockFetchedElements: Record<string, FeatureCollection> = {
  'uuid-vegetation': {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
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
        properties: { material: 'vegetation' },
      },
    ],
  },
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildAnalysisGroundMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with draw features present', () => {
    it('should use draw instance features and return collected+cleaned materials', () => {
      const drawFeatures = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
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
            properties: { material: 'vegetation' },
          },
        ],
      }

      vi.mocked(getDrawInstance).mockReturnValue({
        getAll: () => drawFeatures,
      } as unknown as ReturnType<typeof getDrawInstance>)

      const uuidKeyed = {
        'uuid-vegetation': {
          type: 'FeatureCollection' as const,
          features: [drawFeatures.features[0]],
        },
      }
      vi.mocked(mapNamesToUuids).mockReturnValue(uuidKeyed)

      const builtResult = {
        'uuid-vegetation': {
          type: 'FeatureCollection' as const,
          features: [
            {
              ...drawFeatures.features[0],
              properties: { material: 'vegetation' },
            },
          ],
        },
      }
      vi.mocked(buildGroundMaterialBody).mockReturnValue(builtResult)

      const result = buildAnalysisGroundMaterials(mockFetchedElements, mockRegistry)

      expect(getDrawInstance).toHaveBeenCalled()
      expect(mapNamesToUuids).toHaveBeenCalledWith(
        expect.objectContaining({
          vegetation: expect.objectContaining({
            type: 'FeatureCollection',
          }),
        }),
        mockRegistry,
      )
      expect(buildGroundMaterialBody).toHaveBeenCalledWith(uuidKeyed, mockRegistry)
      expect(result).toEqual(builtResult)
    })

    it('should skip features without material property', () => {
      const drawFeatures = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
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
            properties: {},
          },
        ],
      }

      vi.mocked(getDrawInstance).mockReturnValue({
        getAll: () => drawFeatures,
      } as unknown as ReturnType<typeof getDrawInstance>)

      // Empty because no material property on the feature
      vi.mocked(mapNamesToUuids).mockReturnValue({})
      vi.mocked(buildGroundMaterialBody).mockReturnValue({})

      const result = buildAnalysisGroundMaterials(mockFetchedElements, mockRegistry)

      // buildGroundMaterialBody returns empty => no features => undefined
      expect(result).toBeUndefined()
    })

    it('should use user_material property as fallback', () => {
      const drawFeatures = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
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
            properties: { user_material: 'concrete' },
          },
        ],
      }

      vi.mocked(getDrawInstance).mockReturnValue({
        getAll: () => drawFeatures,
      } as unknown as ReturnType<typeof getDrawInstance>)

      vi.mocked(mapNamesToUuids).mockReturnValue({})
      vi.mocked(buildGroundMaterialBody).mockReturnValue({})

      buildAnalysisGroundMaterials(mockFetchedElements, mockRegistry)

      // Should have grouped by 'concrete' from user_material
      expect(mapNamesToUuids).toHaveBeenCalledWith(
        expect.objectContaining({
          concrete: expect.objectContaining({
            type: 'FeatureCollection',
          }),
        }),
        mockRegistry,
      )
    })
  })

  describe('with no draw instance', () => {
    it('should fall back to fetched elements', () => {
      vi.mocked(getDrawInstance).mockReturnValue(null)

      const builtResult = {
        'uuid-vegetation': {
          type: 'FeatureCollection' as const,
          features: [
            {
              type: 'Feature' as const,
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
              properties: { material: 'vegetation' },
            },
          ],
        },
      }
      vi.mocked(buildGroundMaterialBody).mockReturnValue(builtResult)

      const result = buildAnalysisGroundMaterials(mockFetchedElements, mockRegistry)

      expect(mapNamesToUuids).not.toHaveBeenCalled()
      expect(buildGroundMaterialBody).toHaveBeenCalledWith(
        expect.objectContaining({
          'uuid-vegetation': expect.objectContaining({
            type: 'FeatureCollection',
          }),
        }),
        mockRegistry,
      )
      expect(result).toEqual(builtResult)
    })

    it('should return undefined when no fetched elements either', () => {
      vi.mocked(getDrawInstance).mockReturnValue(null)

      const result = buildAnalysisGroundMaterials(undefined, mockRegistry)

      expect(buildGroundMaterialBody).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe('with draw instance that throws on getAll()', () => {
    it('should fall back gracefully to fetched elements', () => {
      vi.mocked(getDrawInstance).mockReturnValue({
        getAll: () => {
          throw new Error('Draw context destroyed')
        },
      } as unknown as ReturnType<typeof getDrawInstance>)

      const builtResult = {
        'uuid-vegetation': {
          type: 'FeatureCollection' as const,
          features: [
            {
              type: 'Feature' as const,
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
              properties: { material: 'vegetation' },
            },
          ],
        },
      }
      vi.mocked(buildGroundMaterialBody).mockReturnValue(builtResult)

      const result = buildAnalysisGroundMaterials(mockFetchedElements, mockRegistry)

      expect(mapNamesToUuids).not.toHaveBeenCalled()
      expect(buildGroundMaterialBody).toHaveBeenCalled()
      expect(result).toEqual(builtResult)
    })
  })

  describe('empty results', () => {
    it('should return undefined when buildGroundMaterialBody returns empty collections', () => {
      vi.mocked(getDrawInstance).mockReturnValue(null)
      vi.mocked(buildGroundMaterialBody).mockReturnValue({
        'uuid-vegetation': {
          type: 'FeatureCollection' as const,
          features: [],
        },
      })

      const result = buildAnalysisGroundMaterials(mockFetchedElements, mockRegistry)
      expect(result).toBeUndefined()
    })
  })
})
