import { describe, expect, it } from 'vitest'
import { mergeBuildings } from '../core/buildings.merge-geometry'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import type { BuildingTransform } from '../core/buildings.transforms'

// No mock needed -- computeMeshCentroid is now local to the package

function createTriangleMesh(meshId: number, offsetX = 0, offsetY = 0): DotBimMesh {
  return {
    mesh_id: meshId,
    coordinates: [
      0 + offsetX,
      0 + offsetY,
      0,
      10 + offsetX,
      0 + offsetY,
      0,
      5 + offsetX,
      10 + offsetY,
      0,
    ],
    indices: [0, 1, 2],
  }
}

function createMeshWithoutIndices(meshId: number): DotBimMesh {
  return {
    mesh_id: meshId,
    coordinates: [0, 0, 0, 10, 0, 0, 5, 10, 0],
  }
}

function createEmptyMesh(meshId: number): DotBimMesh {
  return {
    mesh_id: meshId,
    coordinates: [],
    indices: [],
  }
}

describe('mergeBuildings', () => {
  describe('empty input', () => {
    it('should return geometry with 0 vertices for empty record', () => {
      const result = mergeBuildings({})

      expect(result.vertexCount).toBe(0)
      expect(result.triangleCount).toBe(0)
      expect(result.positions).toHaveLength(0)
      expect(result.normals).toHaveLength(0)
      expect(result.indices).toHaveLength(0)
      expect(result.buildingIndices).toHaveLength(0)
      expect(result.buildingIds).toHaveLength(0)
      expect(result.buildingRanges).toHaveLength(0)
    })

    it('should return geometry with 0 vertices when all meshes are empty', () => {
      const meshes: Record<string, DotBimMesh> = {
        'empty-1': createEmptyMesh(1),
        'empty-2': createEmptyMesh(2),
      }

      const result = mergeBuildings(meshes)

      expect(result.vertexCount).toBe(0)
      expect(result.triangleCount).toBe(0)
      expect(result.buildingIds).toHaveLength(0)
    })
  })

  describe('single building', () => {
    it('should merge a single building correctly', () => {
      const meshes: Record<string, DotBimMesh> = {
        'building-a': createTriangleMesh(1),
      }

      const result = mergeBuildings(meshes)

      expect(result.vertexCount).toBe(3)
      expect(result.triangleCount).toBe(1)
      expect(result.buildingIds).toEqual(['building-a'])
      expect(result.buildingRanges).toEqual([[0, 3]])

      expect(result.positions[0]).toBe(0)
      expect(result.positions[3]).toBe(10)
      expect(result.positions[6]).toBe(5)

      expect(Array.from(result.indices)).toEqual([0, 1, 2])
      expect(Array.from(result.buildingIndices)).toEqual([0, 0, 0])
    })

    it('should compute normals for a single building', () => {
      const meshes: Record<string, DotBimMesh> = {
        'building-a': createTriangleMesh(1),
      }

      const result = mergeBuildings(meshes)

      expect(result.normals).toHaveLength(9)
      for (let i = 0; i < 3; i++) {
        const nz = result.normals[i * 3 + 2]
        expect(Math.abs(nz)).toBeGreaterThan(0)
      }
    })
  })

  describe('multiple buildings', () => {
    it('should merge 2+ buildings with correct positions, normals, and indices', () => {
      const meshes: Record<string, DotBimMesh> = {
        'building-a': createTriangleMesh(1, 0, 0),
        'building-b': createTriangleMesh(2, 100, 0),
      }

      const result = mergeBuildings(meshes)

      expect(result.vertexCount).toBe(6)
      expect(result.triangleCount).toBe(2)
      expect(result.buildingIds).toEqual(['building-a', 'building-b'])
      expect(result.buildingRanges).toEqual([
        [0, 3],
        [3, 3],
      ])

      expect(result.positions[0]).toBe(0)
      expect(result.positions[3]).toBe(10)
      expect(result.positions[6]).toBe(5)
      expect(result.positions[9]).toBe(100)
      expect(result.positions[12]).toBe(110)
      expect(result.positions[15]).toBe(105)

      expect(result.indices[3]).toBe(3)
      expect(result.indices[4]).toBe(4)
      expect(result.indices[5]).toBe(5)

      expect(Array.from(result.buildingIndices)).toEqual([0, 0, 0, 1, 1, 1])
    })
  })

  describe('transforms', () => {
    it('should apply transforms before merging', () => {
      const meshes: Record<string, DotBimMesh> = {
        'building-a': createTriangleMesh(1),
      }

      const transforms: Record<string, BuildingTransform> = {
        'building-a': {
          meshId: 'building-a',
          deltaX: 50,
          deltaY: 25,
          rotation: 0,
        },
      }

      const result = mergeBuildings(meshes, transforms)

      expect(result.positions[0]).toBe(50)
      expect(result.positions[1]).toBe(25)
      expect(result.positions[3]).toBe(60)
      expect(result.positions[6]).toBe(55)
    })
  })

  describe('missing indices', () => {
    it('should generate sequential indices when mesh has no indices', () => {
      const meshes: Record<string, DotBimMesh> = {
        'no-indices': createMeshWithoutIndices(1),
      }

      const result = mergeBuildings(meshes)

      expect(result.vertexCount).toBe(3)
      expect(Array.from(result.indices)).toEqual([0, 1, 2])
    })
  })

  describe('empty mesh skipping', () => {
    it('should skip empty meshes (0 coordinates)', () => {
      const meshes: Record<string, DotBimMesh> = {
        'real-building': createTriangleMesh(1),
        'empty-building': createEmptyMesh(2),
        'another-real': createTriangleMesh(3, 50, 0),
      }

      const result = mergeBuildings(meshes)

      expect(result.buildingIds).toEqual(['real-building', 'another-real'])
      expect(result.vertexCount).toBe(6)
    })
  })

  describe('typed arrays', () => {
    it('should return Float32Array for positions, normals, and buildingIndices', () => {
      const meshes: Record<string, DotBimMesh> = {
        building: createTriangleMesh(1),
      }

      const result = mergeBuildings(meshes)

      expect(result.positions).toBeInstanceOf(Float32Array)
      expect(result.normals).toBeInstanceOf(Float32Array)
      expect(result.buildingIndices).toBeInstanceOf(Float32Array)
    })

    it('should return Uint32Array for indices', () => {
      const meshes: Record<string, DotBimMesh> = {
        building: createTriangleMesh(1),
      }

      const result = mergeBuildings(meshes)

      expect(result.indices).toBeInstanceOf(Uint32Array)
    })
  })
})
