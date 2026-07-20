import { beforeEach, describe, expect, it } from 'vitest'
import { getBuildingsInitialState, useBuildingsStore } from '../react/buildings.store'

describe('useBuildingsStore', () => {
  beforeEach(() => {
    useBuildingsStore.setState(getBuildingsInitialState())
  })

  describe('updateBuildingTransform', () => {
    it('should create new transform for building', () => {
      useBuildingsStore.getState().updateBuildingTransform('mesh-1', { deltaX: 10 })
      expect(useBuildingsStore.getState().buildingTransforms['mesh-1']).toEqual({
        deltaX: 10,
        deltaY: 0,
        rotation: 0,
      })
    })

    it('should merge with existing transform', () => {
      useBuildingsStore.getState().updateBuildingTransform('mesh-1', { deltaX: 10 })
      useBuildingsStore.getState().updateBuildingTransform('mesh-1', { deltaY: 5 })
      expect(useBuildingsStore.getState().buildingTransforms['mesh-1']).toEqual({
        deltaX: 10,
        deltaY: 5,
        rotation: 0,
      })
    })

    it('should handle multiple buildings', () => {
      useBuildingsStore.getState().updateBuildingTransform('mesh-1', { deltaX: 10 })
      useBuildingsStore.getState().updateBuildingTransform('mesh-2', { rotation: 45 })
      expect(useBuildingsStore.getState().buildingTransforms['mesh-1'].deltaX).toBe(10)
      expect(useBuildingsStore.getState().buildingTransforms['mesh-2'].rotation).toBe(45)
    })
  })

  describe('clearBuildingTransform', () => {
    it('should remove transform for specific building', () => {
      useBuildingsStore.getState().updateBuildingTransform('mesh-1', { deltaX: 10 })
      useBuildingsStore.getState().updateBuildingTransform('mesh-2', { deltaX: 20 })
      useBuildingsStore.getState().clearBuildingTransform('mesh-1')

      expect(useBuildingsStore.getState().buildingTransforms['mesh-1']).toBeUndefined()
      expect(useBuildingsStore.getState().buildingTransforms['mesh-2']).toBeDefined()
    })

    it('should handle clearing non-existent transform', () => {
      useBuildingsStore.getState().clearBuildingTransform('non-existent')
      expect(useBuildingsStore.getState().buildingTransforms).toEqual({})
    })
  })

  describe('persistence', () => {
    it('should have buildingTransforms in initial state', () => {
      expect(useBuildingsStore.getState().buildingTransforms).toEqual({})
    })
  })

  describe('multi-step scenarios', () => {
    it('should handle: apply transform, modify it, then clear it', () => {
      const { getState } = useBuildingsStore

      getState().updateBuildingTransform('mesh-A', { deltaX: 30 })
      expect(getState().buildingTransforms['mesh-A'].deltaX).toBe(30)

      getState().updateBuildingTransform('mesh-A', { deltaY: 15, rotation: 45 })
      expect(getState().buildingTransforms['mesh-A']).toEqual({
        deltaX: 30,
        deltaY: 15,
        rotation: 45,
      })

      getState().clearBuildingTransform('mesh-A')
      expect(getState().buildingTransforms['mesh-A']).toBeUndefined()
    })
  })
})
