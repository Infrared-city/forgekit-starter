import type { Feature } from 'geojson'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getGroundMaterialsInitialState,
  useGroundMaterialsStore,
} from '../react/ground-materials.store'

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makeFeature(id: string): Feature {
  return {
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
    id,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useGroundMaterialsStore', () => {
  beforeEach(() => {
    useGroundMaterialsStore.setState(getGroundMaterialsInitialState())
  })

  describe('setMaterial', () => {
    it('should set current material', () => {
      useGroundMaterialsStore.getState().setMaterial('vegetation')
      expect(useGroundMaterialsStore.getState().currentMaterial).toBe('vegetation')
    })

    it('should allow clearing material with null', () => {
      useGroundMaterialsStore.getState().setMaterial('concrete')
      useGroundMaterialsStore.getState().setMaterial(null)
      expect(useGroundMaterialsStore.getState().currentMaterial).toBeNull()
    })

    it('should replace previous material', () => {
      useGroundMaterialsStore.getState().setMaterial('vegetation')
      useGroundMaterialsStore.getState().setMaterial('asphalt')
      expect(useGroundMaterialsStore.getState().currentMaterial).toBe('asphalt')
    })
  })

  describe('setMode', () => {
    it('should set current mode', () => {
      useGroundMaterialsStore.getState().setMode('draw_polygon')
      expect(useGroundMaterialsStore.getState().currentMode).toBe('draw_polygon')
    })

    it('should allow switching between modes', () => {
      useGroundMaterialsStore.getState().setMode('draw_polygon')
      useGroundMaterialsStore.getState().setMode('direct_select')
      expect(useGroundMaterialsStore.getState().currentMode).toBe('direct_select')
    })

    it('should default to simple_select', () => {
      expect(useGroundMaterialsStore.getState().currentMode).toBe('simple_select')
    })
  })

  describe('addCreated', () => {
    it('should add features to lastCreatedFeatures', () => {
      const feature = makeFeature('f-1')
      useGroundMaterialsStore.getState().addCreated([feature])
      expect(useGroundMaterialsStore.getState().lastCreatedFeatures).toEqual([feature])
    })

    it('should set actionableState and isEditing to true', () => {
      useGroundMaterialsStore.getState().addCreated([makeFeature('f-1')])
      expect(useGroundMaterialsStore.getState().actionableState).toBe(true)
      expect(useGroundMaterialsStore.getState().isEditing).toBe(true)
    })

    it('should accumulate features across multiple calls', () => {
      useGroundMaterialsStore.getState().addCreated([makeFeature('f-1')])
      useGroundMaterialsStore.getState().addCreated([makeFeature('f-2')])
      expect(useGroundMaterialsStore.getState().lastCreatedFeatures).toHaveLength(2)
    })

    it('should not deduplicate features with the same id', () => {
      const feature = makeFeature('f-1')
      useGroundMaterialsStore.getState().addCreated([feature])
      useGroundMaterialsStore.getState().addCreated([feature])
      expect(useGroundMaterialsStore.getState().lastCreatedFeatures).toHaveLength(2)
    })
  })

  describe('addUpdated', () => {
    it('should add features to lastUpdatedFeatures', () => {
      const feature = makeFeature('u-1')
      useGroundMaterialsStore.getState().addUpdated([feature])
      expect(useGroundMaterialsStore.getState().lastUpdatedFeatures).toEqual([feature])
    })

    it('should set actionableState and isEditing to true', () => {
      useGroundMaterialsStore.getState().addUpdated([makeFeature('u-1')])
      expect(useGroundMaterialsStore.getState().actionableState).toBe(true)
      expect(useGroundMaterialsStore.getState().isEditing).toBe(true)
    })

    it('should accumulate features across multiple calls', () => {
      useGroundMaterialsStore.getState().addUpdated([makeFeature('u-1')])
      useGroundMaterialsStore.getState().addUpdated([makeFeature('u-2')])
      expect(useGroundMaterialsStore.getState().lastUpdatedFeatures).toHaveLength(2)
    })
  })

  describe('addDeleted', () => {
    it('should add features to lastDeletedFeatures', () => {
      const feature = makeFeature('d-1')
      useGroundMaterialsStore.getState().addDeleted([feature])
      expect(useGroundMaterialsStore.getState().lastDeletedFeatures).toEqual([feature])
    })

    it('should set actionableState and isEditing to true', () => {
      useGroundMaterialsStore.getState().addDeleted([makeFeature('d-1')])
      expect(useGroundMaterialsStore.getState().actionableState).toBe(true)
      expect(useGroundMaterialsStore.getState().isEditing).toBe(true)
    })
  })

  describe('resetSession', () => {
    it('should reset all state to initial values', () => {
      // Set up non-initial state
      useGroundMaterialsStore.getState().setMaterial('concrete')
      useGroundMaterialsStore.getState().setMode('draw_polygon')
      useGroundMaterialsStore.getState().addCreated([makeFeature('f-1')])
      useGroundMaterialsStore.getState().addUpdated([makeFeature('u-1')])
      useGroundMaterialsStore.getState().addDeleted([makeFeature('d-1')])

      // Reset
      useGroundMaterialsStore.getState().resetSession()

      const state = useGroundMaterialsStore.getState()
      expect(state.currentMaterial).toBeNull()
      expect(state.currentMode).toBe('simple_select')
      expect(state.lastCreatedFeatures).toEqual([])
      expect(state.lastUpdatedFeatures).toEqual([])
      expect(state.lastDeletedFeatures).toEqual([])
      expect(state.actionableState).toBe(false)
      expect(state.isEditing).toBe(false)
    })

    it('should also reset import preview state', () => {
      useGroundMaterialsStore.getState().setImportPreview(['id-1', 'id-2'], ['warn-1'])
      useGroundMaterialsStore.getState().resetSession()

      const state = useGroundMaterialsStore.getState()
      expect(state.importPreviewIds).toEqual([])
      expect(state.importWarnings).toEqual([])
      expect(state.importError).toBeNull()
    })
  })

  describe('setImportPreview', () => {
    it('should store preview IDs and warnings', () => {
      useGroundMaterialsStore.getState().setImportPreview(['id-1', 'id-2'], ['crs-warning'])
      const state = useGroundMaterialsStore.getState()
      expect(state.importPreviewIds).toEqual(['id-1', 'id-2'])
      expect(state.importWarnings).toEqual(['crs-warning'])
    })

    it('should clear any existing import error', () => {
      useGroundMaterialsStore.getState().setImportError('previous error')
      useGroundMaterialsStore.getState().setImportPreview(['id-1'], [])
      expect(useGroundMaterialsStore.getState().importError).toBeNull()
    })
  })

  describe('setImportError', () => {
    it('should store error message', () => {
      useGroundMaterialsStore.getState().setImportError('Invalid GeoJSON')
      expect(useGroundMaterialsStore.getState().importError).toBe('Invalid GeoJSON')
    })

    it('should clear preview IDs and warnings', () => {
      useGroundMaterialsStore.getState().setImportPreview(['id-1'], ['warn-1'])
      useGroundMaterialsStore.getState().setImportError('validation failed')
      const state = useGroundMaterialsStore.getState()
      expect(state.importPreviewIds).toEqual([])
      expect(state.importWarnings).toEqual([])
    })
  })

  describe('clearImport', () => {
    it('should clear all import state', () => {
      useGroundMaterialsStore.getState().setImportPreview(['id-1'], ['warn-1'])
      useGroundMaterialsStore.getState().clearImport()
      const state = useGroundMaterialsStore.getState()
      expect(state.importPreviewIds).toEqual([])
      expect(state.importWarnings).toEqual([])
      expect(state.importError).toBeNull()
    })

    it('should clear import error', () => {
      useGroundMaterialsStore.getState().setImportError('some error')
      useGroundMaterialsStore.getState().clearImport()
      expect(useGroundMaterialsStore.getState().importError).toBeNull()
    })
  })

  describe('multi-step scenarios', () => {
    it('should handle: user selects material, draws feature, saves', () => {
      const { getState } = useGroundMaterialsStore

      // Step 1: User picks a material
      getState().setMaterial('vegetation')
      expect(getState().currentMaterial).toBe('vegetation')

      // Step 2: Enters draw mode
      getState().setMode('draw_polygon')
      expect(getState().currentMode).toBe('draw_polygon')

      // Step 3: Creates a feature
      const feature = makeFeature('drawn-1')
      getState().addCreated([feature])
      expect(getState().lastCreatedFeatures).toHaveLength(1)
      expect(getState().actionableState).toBe(true)
      expect(getState().isEditing).toBe(true)

      // Step 4: After saving, reset session
      getState().resetSession()
      expect(getState().currentMaterial).toBeNull()
      expect(getState().lastCreatedFeatures).toEqual([])
      expect(getState().actionableState).toBe(false)
    })

    it('should handle: user imports GeoJSON, previews, then clears', () => {
      const { getState } = useGroundMaterialsStore

      // Step 1: Import preview arrives
      getState().setImportPreview(['import-1', 'import-2'], ['Filtered 3 point features'])
      expect(getState().importPreviewIds).toHaveLength(2)
      expect(getState().importWarnings).toHaveLength(1)

      // Step 2: User clears the import
      getState().clearImport()
      expect(getState().importPreviewIds).toEqual([])
      expect(getState().importWarnings).toEqual([])
      expect(getState().importError).toBeNull()
    })
  })

  describe('subscriptions (subscribeWithSelector)', () => {
    it('should support fine-grained subscriptions to currentMaterial', () => {
      const callback = vi.fn()

      const unsubscribe = useGroundMaterialsStore.subscribe(
        (state) => state.currentMaterial,
        callback,
      )

      // This should trigger callback
      useGroundMaterialsStore.getState().setMaterial('concrete')
      expect(callback).toHaveBeenCalledWith('concrete', null)

      // Changing mode should NOT trigger the material callback
      useGroundMaterialsStore.getState().setMode('draw_polygon')
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()
    })
  })
})
