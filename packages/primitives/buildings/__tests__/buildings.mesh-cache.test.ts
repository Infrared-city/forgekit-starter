import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearMeshCache,
  getCachedMesh,
  getMeshCacheStats,
  hasCachedMesh,
  invalidateMesh,
  setCachedMesh,
} from '../core/buildings.mesh-cache'
import type { SimpleMeshFormat } from '../core/buildings.mesh-utils'

// Helper to create a mock mesh with a specific size
function createMockMesh(vertexCount: number): SimpleMeshFormat {
  return {
    attributes: {
      positions: { value: new Float32Array(vertexCount * 3), size: 3 },
      normals: { value: new Float32Array(vertexCount * 3), size: 3 },
    },
    indices: { value: new Uint32Array(vertexCount), size: 1 },
  }
}

describe('buildings.mesh-cache', () => {
  beforeEach(() => {
    clearMeshCache()
  })

  describe('getCachedMesh', () => {
    it('should return undefined for uncached mesh', () => {
      const result = getCachedMesh('nonexistent')
      expect(result).toBeUndefined()
    })

    it('should return cached mesh after setting', () => {
      const mesh = createMockMesh(100)
      setCachedMesh('test-id', mesh)

      const result = getCachedMesh('test-id')
      expect(result).toBe(mesh)
    })
  })

  describe('setCachedMesh', () => {
    it('should store mesh in cache', () => {
      const mesh = createMockMesh(100)
      setCachedMesh('mesh-1', mesh)

      expect(hasCachedMesh('mesh-1')).toBe(true)
    })

    it('should track cache size', () => {
      const mesh = createMockMesh(100)
      setCachedMesh('mesh-1', mesh)

      const stats = getMeshCacheStats()
      expect(stats.entries).toBe(1)
      expect(stats.sizeBytes).toBeGreaterThan(0)
    })
  })

  describe('invalidateMesh', () => {
    it('should remove mesh from cache', () => {
      const mesh = createMockMesh(100)
      setCachedMesh('mesh-1', mesh)
      expect(hasCachedMesh('mesh-1')).toBe(true)

      const removed = invalidateMesh('mesh-1')
      expect(removed).toBe(true)
      expect(hasCachedMesh('mesh-1')).toBe(false)
    })

    it('should return false for non-existent mesh', () => {
      const removed = invalidateMesh('nonexistent')
      expect(removed).toBe(false)
    })

    it('should update cache size after invalidation', () => {
      const mesh = createMockMesh(100)
      setCachedMesh('mesh-1', mesh)

      const statsBefore = getMeshCacheStats()
      invalidateMesh('mesh-1')
      const statsAfter = getMeshCacheStats()

      expect(statsAfter.sizeBytes).toBeLessThan(statsBefore.sizeBytes)
      expect(statsAfter.entries).toBe(0)
    })
  })

  describe('clearMeshCache', () => {
    it('should clear all entries', () => {
      setCachedMesh('mesh-1', createMockMesh(100))
      setCachedMesh('mesh-2', createMockMesh(100))
      setCachedMesh('mesh-3', createMockMesh(100))

      expect(getMeshCacheStats().entries).toBe(3)

      clearMeshCache()

      const stats = getMeshCacheStats()
      expect(stats.entries).toBe(0)
      expect(stats.sizeBytes).toBe(0)
    })
  })

  describe('getMeshCacheStats', () => {
    it('should return correct stats for empty cache', () => {
      const stats = getMeshCacheStats()

      expect(stats.entries).toBe(0)
      expect(stats.sizeBytes).toBe(0)
      expect(stats.maxSizeBytes).toBe(100 * 1024 * 1024)
      expect(stats.utilizationPercent).toBe(0)
    })

    it('should return correct utilization percentage', () => {
      const mesh = createMockMesh(1000)
      setCachedMesh('mesh-1', mesh)

      const stats = getMeshCacheStats()
      expect(stats.utilizationPercent).toBeGreaterThan(0)
      expect(stats.utilizationPercent).toBeLessThan(1)
    })
  })

  describe('LRU eviction', () => {
    it('should update access time on get', () => {
      const mesh1 = createMockMesh(100)
      const mesh2 = createMockMesh(100)

      setCachedMesh('mesh-1', mesh1)
      setCachedMesh('mesh-2', mesh2)

      getCachedMesh('mesh-1')

      expect(hasCachedMesh('mesh-1')).toBe(true)
      expect(hasCachedMesh('mesh-2')).toBe(true)
    })
  })
})
