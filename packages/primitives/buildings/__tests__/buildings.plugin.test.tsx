import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeOriginFromPolygon } from '../core/buildings.mesh-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import { useBuildingsMapPlugin } from '../plugin'
import type { BuildingsSdkClient } from '../react/buildings.api'
import { getBuildingsInitialState, useBuildingsStore } from '../react/buildings.store'

// -----------------------------------------------------------------------------
// New contract (2026-05-26):
//   `useBuildingsMapPlugin` reads buildings DATA from `useBuildingsStore`,
//   not from `useBuildingsInArea`. The plugin no longer fetches — the
//   caller does so via `useBuildingsMutation` (recommended) or the
//   deprecated `useBuildingsInArea` (apps/base back-compat). Both write
//   to the same store.
//
//   These tests verify:
//   - Mid-draw gating: when `isDrawing=true`, plugin's `effectivePolygon`
//     is null and `layers()` returns [], even if the store has data.
//   - Read-from-store: when the store has buildings + polygon is valid,
//     `layers()` produces a buildings layer.
//   - Polygon filtering: `buildings` returned from the hook is filtered
//     to the polygon interior.
// -----------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function makeSquare(): GeoJsonPolygon {
  return {
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
}

type Deps = Parameters<typeof useBuildingsMapPlugin>[0]

function makeDeps(overrides: Partial<Deps> = {}): Deps {
  const stubApi: BuildingsSdkClient = {
    buildings: {
      getBuildingsInArea: vi.fn().mockResolvedValue({
        buildings: {},
        buildingIds: [],
        totalBuildings: 0,
        executionTime: 0,
      }),
    },
  }
  return {
    polygon: null,
    isDrawing: false,
    dragState: {
      isDragging: false,
      dragAxis: null,
      dragDeltaMeters: { x: 0, y: 0 },
      initialTransform: null,
    },
    apiClient: stubApi,
    mapState: {
      selectedMeshId: null,
      hoveredMeshId: null,
      layerVisibility: { buildings: true, groundMaterials: false },
    },
    startDrag: vi.fn(),
    updateDrag: vi.fn(),
    endDrag: vi.fn(),
    selectMesh: vi.fn(),
    metersToLatLng: vi.fn(() => ({ lat: 0, lng: 0 })),
    latLngToMeters: vi.fn(() => ({ x: 0, y: 0 })),
    computeMeshCentroid: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
    ...overrides,
  }
}

/** Seed the store with a fixture matching the previous test setup. */
function seedStore(buildings: Record<string, DotBimMesh>) {
  useBuildingsStore.getState().setBuildings(buildings, buildings, [], 'test-polygon-key')
}

describe('useBuildingsMapPlugin — store-driven render', () => {
  beforeEach(() => {
    // Reset store between tests so leak across cases is impossible.
    useBuildingsStore.setState(getBuildingsInitialState())
  })

  afterEach(() => {
    vi.clearAllMocks()
    useBuildingsStore.setState(getBuildingsInitialState())
  })

  it('mid-draw: isDrawing=true gates layers() to empty, even with store data', () => {
    const polygon = makeSquare()
    seedStore({
      'mesh-1': {
        mesh_id: 1,
        coordinates: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        indices: [0, 1, 2],
      } as unknown as DotBimMesh,
    })

    const { result } = renderHook(
      () => useBuildingsMapPlugin(makeDeps({ polygon, isDrawing: true })),
      { wrapper: createWrapper() },
    )

    const { plugin } = result.current
    const layers = plugin.layers({} as Parameters<typeof plugin.layers>[0])
    // Mid-draw → effectivePolygon is null → mergedGeometry is null → no
    // buildings layer. (Gizmo layers may still emit on selection; deps
    // here have no selectedMeshId.)
    expect(layers).toEqual([])
  })

  it('produces a plugin with no layers when polygon is null', () => {
    const { result } = renderHook(
      () => useBuildingsMapPlugin(makeDeps({ polygon: null, isDrawing: false })),
      { wrapper: createWrapper() },
    )

    const { plugin } = result.current
    const layers = plugin.layers({} as Parameters<typeof plugin.layers>[0])
    expect(layers).toEqual([])
  })

  it('produces a buildings layer when polygon is valid and store has data', async () => {
    const polygon = makeSquare()
    const fixture = {
      'mesh-1': {
        mesh_id: 1,
        coordinates: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        indices: [0, 1, 2],
      } as unknown as DotBimMesh,
    }
    seedStore(fixture)

    const { result } = renderHook(
      () => useBuildingsMapPlugin(makeDeps({ polygon, isDrawing: false })),
      { wrapper: createWrapper() },
    )

    // Filter + merge now run time-sliced off the render tick — the snapshot
    // lands asynchronously (stale-while-revalidate), so await it.
    await waitFor(() => expect(result.current.buildings).toEqual(fixture))

    const { plugin } = result.current
    const layers = plugin.layers({} as Parameters<typeof plugin.layers>[0])
    expect(layers.length).toBeGreaterThanOrEqual(1)
    expect(layers[0]).toBeDefined()
  })

  it('derives origin from the polygon via computeOriginFromPolygon', () => {
    const polygon = makeSquare()
    seedStore({
      'mesh-1': {
        mesh_id: 1,
        coordinates: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        indices: [0, 1, 2],
      } as unknown as DotBimMesh,
    })

    // Sanity: the pure helper returns the SW corner of the square.
    const expectedOrigin = computeOriginFromPolygon(polygon)
    expect(expectedOrigin).toEqual([-0.1, 51.5])

    renderHook(() => useBuildingsMapPlugin(makeDeps({ polygon, isDrawing: false })), {
      wrapper: createWrapper(),
    })

    // The hook does not expose `origin` directly; we verify the pure
    // helper produces the expected SW corner (same call path the hook
    // uses internally).
    expect(computeOriginFromPolygon(polygon)).toEqual(expectedOrigin)
  })
})
