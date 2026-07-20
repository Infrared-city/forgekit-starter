import { describe, expect, it } from 'vitest'
import { mergeVegetationMeshes } from '../core/vegetation.merge-geometry'
import type { DotBimMesh } from '../core/vegetation.sdk-types'

const tetra: DotBimMesh = {
  mesh_id: 1,
  coordinates: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  indices: [0, 1, 2, 0, 1, 3, 0, 2, 3, 1, 2, 3],
}

const square: DotBimMesh = {
  mesh_id: 2,
  coordinates: [10, 10, 0, 11, 10, 0, 11, 11, 0, 10, 11, 0],
  indices: [0, 1, 2, 0, 2, 3],
}

describe('mergeVegetationMeshes', () => {
  it('returns an empty geometry for an empty input array', () => {
    const merged = mergeVegetationMeshes([])
    expect(merged.vertexCount).toBe(0)
    expect(merged.triangleCount).toBe(0)
    expect(merged.treeIds).toEqual([])
  })

  it('skips meshes with empty coordinates', () => {
    const merged = mergeVegetationMeshes([{ mesh_id: 0, coordinates: [] }, tetra])
    expect(merged.treeIds).toEqual(['1'])
    expect(merged.vertexCount).toBe(4)
  })

  it('concatenates positions, applies vertex offsets to indices', () => {
    const merged = mergeVegetationMeshes([tetra, square])
    expect(merged.treeIds).toEqual(['1', '2'])
    expect(merged.vertexCount).toBe(4 + 4)
    expect(merged.triangleCount).toBe((tetra.indices!.length + square.indices!.length) / 3)
    // Tetra owns indices 0..3, square 4..7
    expect(merged.indices[0]).toBe(0)
    expect(merged.indices[tetra.indices!.length]).toBe(4)
  })

  it('emits per-tree treeIndex per vertex', () => {
    const merged = mergeVegetationMeshes([tetra, square])
    expect(merged.treeIndices[0]).toBe(0)
    expect(merged.treeIndices[3]).toBe(0)
    expect(merged.treeIndices[4]).toBe(1)
    expect(merged.treeIndices[7]).toBe(1)
  })

  it('reports per-tree vertex ranges', () => {
    const merged = mergeVegetationMeshes([tetra, square])
    expect(merged.treeRanges).toEqual([
      [0, 4],
      [4, 4],
    ])
  })
})
