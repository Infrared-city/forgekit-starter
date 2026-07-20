import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BuildingsSdkClient } from '../react/buildings.api'
import {
  buildingKeys,
  isPolygonSafeToFetch,
  stablePolygonKey,
  useBuildingsInArea,
  useBuildingsMutation,
} from '../react/buildings.api'
import { getBuildingsInitialState, useBuildingsStore } from '../react/buildings.store'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function makeValidSquare(): GeoJsonPolygon {
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

/** A bowtie polygon (self-intersecting outer ring) -- invalid per OGC. */
function makeBowtie(): GeoJsonPolygon {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [1, 1],
        [1, 0],
        [0, 1],
        [0, 0],
      ],
    ],
  }
}

function makeMockSdkClient(
  response = {
    buildings: {} as Record<string, unknown>,
    buildingIds: [] as number[],
    totalBuildings: 0,
    executionTime: 0,
  },
): {
  client: BuildingsSdkClient
  getBuildingsInArea: ReturnType<typeof vi.fn>
} {
  const getBuildingsInArea = vi.fn().mockResolvedValue(response)
  return {
    client: { buildings: { getBuildingsInArea } },
    getBuildingsInArea,
  }
}

// ---------------------------------------------------------------------------
// stablePolygonKey
// ---------------------------------------------------------------------------

describe('stablePolygonKey', () => {
  it('returns the same string for deep-equal polygons with different identities', () => {
    const a = makeValidSquare()
    const b = makeValidSquare() // different object identity
    expect(a).not.toBe(b)
    expect(stablePolygonKey(a)).toBe(stablePolygonKey(b))
  })

  it('returns "null" (serialised) for a null polygon', () => {
    expect(stablePolygonKey(null)).toBe('null')
  })

  it('differs for polygons with different coordinates', () => {
    const a = makeValidSquare()
    const b: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2.0, 41.0],
          [2.01, 41.0],
          [2.01, 41.01],
          [2.0, 41.01],
          [2.0, 41.0],
        ],
      ],
    }
    expect(stablePolygonKey(a)).not.toBe(stablePolygonKey(b))
  })
})

// ---------------------------------------------------------------------------
// isPolygonSafeToFetch
// ---------------------------------------------------------------------------

describe('isPolygonSafeToFetch', () => {
  it('is false for null', () => {
    expect(isPolygonSafeToFetch(null)).toBe(false)
  })

  it('is false for an open ring (fewer than 4 coordinates)', () => {
    const open: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
      ],
    }
    expect(isPolygonSafeToFetch(open)).toBe(false)
  })

  it('is false for a self-intersecting (bowtie) polygon', () => {
    expect(isPolygonSafeToFetch(makeBowtie())).toBe(false)
  })

  it('is true for a well-formed square polygon', () => {
    expect(isPolygonSafeToFetch(makeValidSquare())).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildingKeys.area
// ---------------------------------------------------------------------------

describe('buildingKeys.area', () => {
  it('produces the canonical ["buildings", "area", <stable key>] tuple', () => {
    const polygon = makeValidSquare()
    const key = buildingKeys.area(polygon)
    expect(key[0]).toBe('buildings')
    expect(key[1]).toBe('area')
    expect(key[2]).toBe(stablePolygonKey(polygon))
  })

  it('dedupes deep-equal polygons with different identities', () => {
    const keyA = buildingKeys.area(makeValidSquare())
    const keyB = buildingKeys.area(makeValidSquare())
    expect(keyA).toEqual(keyB)
  })

  it('returns the null-sentinel key for a null polygon', () => {
    const key = buildingKeys.area(null)
    expect(key[2]).toBe('null')
  })
})

// ---------------------------------------------------------------------------
// useBuildingsInArea
// ---------------------------------------------------------------------------

describe('useBuildingsInArea', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls SDK getBuildingsInArea with polygon when the polygon is valid', async () => {
    const polygon = makeValidSquare()
    const { client, getBuildingsInArea } = makeMockSdkClient({
      buildings: {
        'mesh-1': { meshId: 1, osmId: 1, coordinates: [0, 0, 0, 1, 0, 0, 0, 1, 0] },
      },
      buildingIds: [1],
      totalBuildings: 1,
      executionTime: 0.1,
    })

    const { result } = renderHook(() => useBuildingsInArea(polygon, client), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getBuildingsInArea).toHaveBeenCalledTimes(1)
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.buildings['mesh-1']).toBeDefined()
    expect(result.current.data?.buildingIds).toEqual([1])
  })

  it('does not fetch when polygon is null', () => {
    const { client, getBuildingsInArea } = makeMockSdkClient()

    const { result } = renderHook(() => useBuildingsInArea(null, client), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getBuildingsInArea).not.toHaveBeenCalled()
  })

  it('does not fetch when polygon is self-intersecting (bowtie)', () => {
    const { client, getBuildingsInArea } = makeMockSdkClient()

    const { result } = renderHook(() => useBuildingsInArea(makeBowtie(), client), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getBuildingsInArea).not.toHaveBeenCalled()
  })

  it('does not fetch when polygon has an open ring', () => {
    const open: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
      ],
    }
    const { client, getBuildingsInArea } = makeMockSdkClient()

    const { result } = renderHook(() => useBuildingsInArea(open, client), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getBuildingsInArea).not.toHaveBeenCalled()
  })

  it('dedupes two hook instances that receive deep-equal polygons', async () => {
    const { client, getBuildingsInArea } = makeMockSdkClient()
    const polygonA = makeValidSquare()
    const polygonB = makeValidSquare()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result: resultA } = renderHook(() => useBuildingsInArea(polygonA, client), {
      wrapper: Wrapper,
    })
    const { result: resultB } = renderHook(() => useBuildingsInArea(polygonB, client), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(resultA.current.isSuccess).toBe(true))
    await waitFor(() => expect(resultB.current.isSuccess).toBe(true))

    expect(getBuildingsInArea).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// useBuildingsMutation — stale-write guard (cross-project race)
// ---------------------------------------------------------------------------

describe('useBuildingsMutation shouldCommit guard', () => {
  afterEach(() => {
    useBuildingsStore.setState(getBuildingsInitialState())
  })

  it('commits when shouldCommit is absent (legacy bare-polygon call)', async () => {
    const { client } = makeMockSdkClient({
      buildings: { '1': { osmId: 1 } as never },
      polygon: null,
      totalFeatures: 1,
      executionTime: 0,
    })
    const { result } = renderHook(() => useBuildingsMutation(client), { wrapper: createWrapper() })

    result.current.mutate(makeValidSquare())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useBuildingsStore.getState().status).toBe('ready')
  })

  it('commits when shouldCommit returns true (project still active)', async () => {
    const { client } = makeMockSdkClient({
      buildings: { '1': { osmId: 1 } as never },
      polygon: null,
      totalFeatures: 1,
      executionTime: 0,
    })
    const { result } = renderHook(() => useBuildingsMutation(client), { wrapper: createWrapper() })

    result.current.mutate({ polygon: makeValidSquare(), shouldCommit: () => true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useBuildingsStore.getState().status).toBe('ready')
    expect(useBuildingsStore.getState().buildings).not.toBeNull()
  })

  it('DISCARDS the write when shouldCommit returns false (project switched away)', async () => {
    const { client, getBuildingsInArea } = makeMockSdkClient({
      buildings: { '1': { osmId: 1 } as never },
      polygon: null,
      totalFeatures: 1,
      executionTime: 0,
    })
    const { result } = renderHook(() => useBuildingsMutation(client), { wrapper: createWrapper() })

    // Simulate a project switch landing during the fetch: the store gets
    // cleared, and the guard reports the initiating project is no longer active.
    result.current.mutate({ polygon: makeValidSquare(), shouldCommit: () => false })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // The SDK was still called (the fetch ran) ...
    expect(getBuildingsInArea).toHaveBeenCalledTimes(1)
    // ... but the buildings were NOT written into the (now other project's) store.
    expect(useBuildingsStore.getState().buildings).toBeNull()
    expect(useBuildingsStore.getState().status).not.toBe('ready')
  })
})
