/**
 * Chunked (time-sliced) twins of the project-load hot path:
 * `mergeBuildingsChunked` / `filterBuildingsByPolygonChunked`.
 *
 * The contract is IDENTICAL OUTPUT to the synchronous originals — the
 * chunking only inserts event-loop yields between buildings so a city-scale
 * merge no longer freezes the viewport. Equality is pinned against the real
 * sync implementations, not re-derived expectations.
 */
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { describe, expect, it, vi } from 'vitest'
import { mergeBuildings, mergeBuildingsChunked } from '../core/buildings.merge-geometry'
import {
  filterBuildingsByPolygon,
  filterBuildingsByPolygonChunked,
} from '../core/buildings.mesh-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import type { BuildingTransform } from '../core/buildings.transforms'

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

/** Mixed fixture: indexed, unindexed, empty, transformed. */
function makeMeshes(count = 40): Record<string, DotBimMesh> {
  const meshes: Record<string, DotBimMesh> = {}
  for (let i = 0; i < count; i++) {
    if (i % 7 === 3) {
      meshes[`empty-${i}`] = { mesh_id: i, coordinates: [], indices: [] }
    } else if (i % 5 === 2) {
      meshes[`noidx-${i}`] = { mesh_id: i, coordinates: [0, 0, 0, 10 + i, 0, 0, 5, 10, i] }
    } else {
      meshes[`tri-${i}`] = createTriangleMesh(i, i * 20, i * 10)
    }
  }
  return meshes
}

const TRANSFORMS: Record<string, BuildingTransform> = {
  'tri-0': { deltaX: 5, deltaY: -3 },
  'noidx-2': { deltaX: -1, deltaY: 2 },
}

/** ~100m square around the origin, so meshes near (0,0) pass and far ones fail. */
const POLYGON: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-0.001, -0.001],
      [0.002, -0.001],
      [0.002, 0.002],
      [-0.001, 0.002],
      [-0.001, -0.001],
    ],
  ],
}

describe('mergeBuildingsChunked', () => {
  it('produces output identical to the synchronous mergeBuildings (incl. transforms)', async () => {
    const meshes = makeMeshes()
    const sync = mergeBuildings(meshes, TRANSFORMS)
    const chunked = await mergeBuildingsChunked(meshes, TRANSFORMS, { sliceMs: 0 })

    expect(chunked).not.toBeNull()
    expect(Array.from(chunked!.positions)).toEqual(Array.from(sync.positions))
    expect(Array.from(chunked!.normals)).toEqual(Array.from(sync.normals))
    expect(Array.from(chunked!.indices)).toEqual(Array.from(sync.indices))
    expect(Array.from(chunked!.buildingIndices)).toEqual(Array.from(sync.buildingIndices))
    expect(chunked!.buildingIds).toEqual(sync.buildingIds)
    expect(chunked!.buildingRanges).toEqual(sync.buildingRanges)
    expect(chunked!.vertexCount).toBe(sync.vertexCount)
    expect(chunked!.triangleCount).toBe(sync.triangleCount)
  })

  it('handles the empty-input contract identically', async () => {
    const sync = mergeBuildings({})
    const chunked = await mergeBuildingsChunked({}, undefined, { sliceMs: 0 })
    expect(chunked).toEqual(sync)
  })

  it('yields to the event loop between slices (sliceMs 0 forces a yield per building)', async () => {
    const yieldNow = vi.fn(async () => {})
    await mergeBuildingsChunked(makeMeshes(10), undefined, { sliceMs: 0, yieldNow })
    expect(yieldNow.mock.calls.length).toBeGreaterThan(0)
  })

  it('returns null promptly when aborted mid-merge and never resolves a partial result', async () => {
    let calls = 0
    const result = await mergeBuildingsChunked(makeMeshes(30), undefined, {
      sliceMs: 0,
      yieldNow: async () => {},
      shouldAbort: () => ++calls > 3,
    })
    expect(result).toBeNull()
  })
})

describe('filterBuildingsByPolygonChunked', () => {
  it('produces output identical to the synchronous filterBuildingsByPolygon', async () => {
    const meshes = makeMeshes()
    const sync = filterBuildingsByPolygon(meshes, POLYGON)
    const chunked = await filterBuildingsByPolygonChunked(meshes, POLYGON, { sliceMs: 0 })

    expect(chunked).not.toBeNull()
    expect(Object.keys(chunked!)).toEqual(Object.keys(sync))
    // The sync filter must actually discriminate for this pin to mean anything.
    expect(Object.keys(sync).length).toBeGreaterThan(0)
    expect(Object.keys(sync).length).toBeLessThan(Object.keys(meshes).length)
    for (const id of Object.keys(sync)) expect(chunked![id]).toBe(sync[id])
  })

  it('returns null when aborted', async () => {
    const result = await filterBuildingsByPolygonChunked(makeMeshes(30), POLYGON, {
      sliceMs: 0,
      yieldNow: async () => {},
      shouldAbort: () => true,
    })
    expect(result).toBeNull()
  })
})
