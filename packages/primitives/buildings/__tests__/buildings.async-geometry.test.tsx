/**
 * `useAsyncBuildingsGeometry` — consistent snapshot (incl. origin),
 * stale-while-revalidate, abort-on-change, and the two-stage split (the
 * polygon filter must NOT re-run on transform churn — gizmo drags mutate
 * transforms per pointer frame). The chunked compute itself is pinned
 * against the sync implementations in buildings.chunked-geometry.test.ts.
 */
import { renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { describe, expect, it, vi } from 'vitest'

const { filterSpy } = vi.hoisted(() => ({ filterSpy: vi.fn() }))

vi.mock('../core/buildings.mesh-utils', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../core/buildings.mesh-utils')>()
  return {
    ...orig,
    filterBuildingsByPolygonChunked: (...args: unknown[]) => {
      filterSpy(...args)
      return (orig.filterBuildingsByPolygonChunked as (...a: unknown[]) => Promise<unknown>)(
        ...args,
      )
    },
  }
})

import { mergeBuildings } from '../core/buildings.merge-geometry'
import { computeOriginFromPolygon } from '../core/buildings.mesh-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import type { BuildingTransform } from '../core/buildings.transforms'
import { useAsyncBuildingsGeometry } from '../react/buildings.async-geometry'

const SQUARE: GeoJsonPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [-0.1, 51.5],
      [-0.09, 51.5],
      [-0.09, 51.51],
      [-0.1, 51.51],
      [-0.1, 51.5],
    ],
  ],
}

const MESHES: Record<string, DotBimMesh> = {
  'mesh-1': { mesh_id: 1, coordinates: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] },
}

const NO_TRANSFORMS: Record<string, BuildingTransform> = {}

describe('useAsyncBuildingsGeometry', () => {
  it('resolves to a consistent filtered+merged+origin snapshot and clears isComputing', async () => {
    const { result } = renderHook(() => useAsyncBuildingsGeometry(MESHES, SQUARE, NO_TRANSFORMS))

    // Initial render: empty snapshot, computation pending.
    expect(result.current.buildings).toBeUndefined()
    expect(result.current.mergedGeometry).toBeNull()
    expect(result.current.origin).toEqual([0, 0])

    await waitFor(() => expect(result.current.buildings).toEqual(MESHES))
    expect(result.current.isComputing).toBe(false)
    // Origin belongs to the SAME snapshot — the polygon the buildings were
    // filtered against (METER_OFFSETS frame of the merged positions).
    expect(result.current.origin).toEqual(computeOriginFromPolygon(SQUARE))
    const expected = mergeBuildings(MESHES, NO_TRANSFORMS)
    expect(Array.from(result.current.mergedGeometry!.positions)).toEqual(
      Array.from(expected.positions),
    )
    expect(result.current.mergedGeometry!.buildingIds).toEqual(expected.buildingIds)
  })

  it('resets synchronously when the polygon goes null (mid-draw gate)', async () => {
    const { result, rerender } = renderHook(
      ({ polygon }: { polygon: GeoJsonPolygon | null }) =>
        useAsyncBuildingsGeometry(MESHES, polygon, NO_TRANSFORMS),
      { initialProps: { polygon: SQUARE as GeoJsonPolygon | null } },
    )
    await waitFor(() => expect(result.current.buildings).toBeDefined())

    rerender({ polygon: null })
    expect(result.current.buildings).toBeUndefined()
    expect(result.current.mergedGeometry).toBeNull()
    expect(result.current.origin).toEqual([0, 0])
    expect(result.current.isComputing).toBe(false)
  })

  it('settles on the LAST input under rapid changes (stale results discarded)', async () => {
    const other: Record<string, DotBimMesh> = {
      'mesh-2': { mesh_id: 2, coordinates: [0, 0, 0, 2, 0, 0, 0, 2, 0], indices: [0, 1, 2] },
    }
    const { result, rerender } = renderHook(
      ({ meshes }: { meshes: Record<string, DotBimMesh> }) =>
        useAsyncBuildingsGeometry(meshes, SQUARE, NO_TRANSFORMS),
      { initialProps: { meshes: MESHES } },
    )
    rerender({ meshes: other })

    await waitFor(() => expect(result.current.buildings).toEqual(other))
    expect(result.current.mergedGeometry!.buildingIds).toEqual(['mesh-2'])
  })

  it('re-merges WITHOUT re-filtering when only transforms change (gizmo-drag churn)', async () => {
    const { result, rerender } = renderHook(
      ({ transforms }: { transforms: Record<string, BuildingTransform> }) =>
        useAsyncBuildingsGeometry(MESHES, SQUARE, transforms),
      { initialProps: { transforms: NO_TRANSFORMS } },
    )
    await waitFor(() => expect(result.current.mergedGeometry).not.toBeNull())
    const filterCallsAfterSettle = filterSpy.mock.calls.length

    // A drag frame: fresh transforms object, same buildings + polygon.
    rerender({ transforms: { 'mesh-1': { deltaX: 5, deltaY: 0 } } })
    await waitFor(() =>
      expect(result.current.mergedGeometry!.positions[0]).toBe(
        mergeBuildings(MESHES, { 'mesh-1': { deltaX: 5, deltaY: 0 } }).positions[0],
      ),
    )

    // The polygon filter is transform-independent and MUST NOT have re-run —
    // the old code kept these as separate memo boundaries for exactly this
    // reason (per-frame drag churn).
    expect(filterSpy.mock.calls.length).toBe(filterCallsAfterSettle)
  })
})
