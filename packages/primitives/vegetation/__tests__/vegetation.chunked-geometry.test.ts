/**
 * `mergeVegetationMeshesChunked` — time-sliced twin of the sync merge.
 * Contract: IDENTICAL output (shared per-tree steps; pinned here), plus
 * abort semantics. Mirrors buildings.chunked-geometry.test.ts.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  mergeVegetationMeshes,
  mergeVegetationMeshesChunked,
} from '../core/vegetation.merge-geometry'
import type { DotBimMesh } from '../core/vegetation.sdk-types'

/** Mixed fixture: indexed, unindexed, empty, with and without colors. */
function makeMeshes(count = 25): DotBimMesh[] {
  const meshes: DotBimMesh[] = []
  for (let i = 0; i < count; i++) {
    if (i % 6 === 4) {
      meshes.push({ mesh_id: i, coordinates: [], indices: [] })
    } else if (i % 4 === 1) {
      meshes.push({ mesh_id: i, coordinates: [0, 0, 0, 10 + i, 0, 0, 5, 10, i] })
    } else {
      meshes.push({
        mesh_id: i,
        coordinates: [i, 0, 0, 10 + i, 0, 0, 5 + i, 10, 0],
        indices: [0, 1, 2],
        colors: i % 2 === 0 ? [255, 0, 0, 0, 255, 0, 0, 0, 255] : undefined,
      } as DotBimMesh)
    }
  }
  return meshes
}

describe('mergeVegetationMeshesChunked', () => {
  it('produces output identical to the synchronous mergeVegetationMeshes', async () => {
    const meshes = makeMeshes()
    const sync = mergeVegetationMeshes(meshes)
    const chunked = await mergeVegetationMeshesChunked(meshes, { sliceMs: 0 })

    expect(chunked).not.toBeNull()
    expect(Array.from(chunked!.positions)).toEqual(Array.from(sync.positions))
    expect(Array.from(chunked!.normals)).toEqual(Array.from(sync.normals))
    expect(Array.from(chunked!.indices)).toEqual(Array.from(sync.indices))
    expect(Array.from(chunked!.treeIndices)).toEqual(Array.from(sync.treeIndices))
    expect(Array.from(chunked!.colors)).toEqual(Array.from(sync.colors))
    expect(chunked!.hasColors).toBe(sync.hasColors)
    expect(chunked!.treeIds).toEqual(sync.treeIds)
    expect(chunked!.treeRanges).toEqual(sync.treeRanges)
    expect(chunked!.vertexCount).toBe(sync.vertexCount)
    expect(chunked!.triangleCount).toBe(sync.triangleCount)
  })

  it('handles the empty-input contract identically', async () => {
    const sync = mergeVegetationMeshes([])
    const chunked = await mergeVegetationMeshesChunked([], { sliceMs: 0 })
    expect(chunked).toEqual(sync)
  })

  it('yields between slices and returns null when aborted', async () => {
    const yieldNow = vi.fn(async () => {})
    let calls = 0
    const result = await mergeVegetationMeshesChunked(makeMeshes(20), {
      sliceMs: 0,
      yieldNow,
      shouldAbort: () => ++calls > 3,
    })
    expect(result).toBeNull()
    expect(yieldNow.mock.calls.length).toBeGreaterThan(0)
  })
})
