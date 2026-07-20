import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isPolygonSafeToFetch, useVegetationMeshesMutation } from '../react/vegetation.api'
import { getVegetationInitialState, useVegetationStore } from '../react/vegetation.store'

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

// The mutation now does ONE whole-AOI `getGeoJson(lat, lon, distance, 'fgb')`
// call (not the tiled `getArea`); getGeoJson returns a FeatureCollection whose
// `features` is an ARRAY (the mutation keys it into the id-dict downstream expects).
function makeSdk(
  features: Array<Record<string, unknown>> = [
    {
      id: '1',
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      properties: { natural: 'tree' },
    },
  ],
) {
  const getGeoJson = vi.fn().mockResolvedValue({ features })
  return { client: { vegetation: { getGeoJson } }, getGeoJson }
}

afterEach(() => {
  useVegetationStore.setState(getVegetationInitialState())
  vi.restoreAllMocks()
})

describe('isPolygonSafeToFetch', () => {
  it('accepts a valid closed square', () => {
    expect(isPolygonSafeToFetch(makeValidSquare())).toBe(true)
  })

  it('rejects null', () => {
    expect(isPolygonSafeToFetch(null)).toBe(false)
  })

  it('rejects a bowtie (self-intersection)', () => {
    expect(isPolygonSafeToFetch(makeBowtie())).toBe(false)
  })
})

describe('useVegetationMeshesMutation', () => {
  it('fetches whole-AOI via getGeoJson(fgb) and builds meshes locally', async () => {
    const { client, getGeoJson } = makeSdk()
    const { result } = renderHook(() => useVegetationMeshesMutation(client), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate(makeValidSquare())
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // ONE call (no per-tile fan-out) with the 'fgb' source.
    expect(getGeoJson).toHaveBeenCalledTimes(1)
    expect(getGeoJson.mock.calls[0][3]).toBe('fgb')
    expect(typeof getGeoJson.mock.calls[0][0]).toBe('number') // lat
    expect(typeof getGeoJson.mock.calls[0][2]).toBe('number') // distance

    const state = useVegetationStore.getState()
    expect(state.status).toBe('ready')
    expect(state.totalTrees).toBe(1)
    expect(state.meshes).toHaveLength(1)
    expect(state.features).not.toBeNull()
  })

  it('writes empty meshes when getGeoJson returns zero features', async () => {
    const { client } = makeSdk([])
    const { result } = renderHook(() => useVegetationMeshesMutation(client), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate(makeValidSquare())
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = useVegetationStore.getState()
    expect(state.status).toBe('ready')
    expect(state.totalTrees).toBe(0)
    expect(state.meshes).toEqual([])
  })

  it('rejects invalid polygons before hitting the SDK', async () => {
    const { client, getGeoJson } = makeSdk()
    const { result } = renderHook(() => useVegetationMeshesMutation(client), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate(makeBowtie())
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(getGeoJson).not.toHaveBeenCalled()
    expect(useVegetationStore.getState().status).toBe('error')
  })

  it('shouldCommit:false returns the FULL processed result without writing the store', async () => {
    // Phase C "B": a suppress-and-keep caller (scenario-keyed fetch re-route)
    // fetches without polluting the global store, then writes its own slot from
    // the returned data — so the return MUST carry meshes + features + count.
    const { client } = makeSdk()
    const { result } = renderHook(() => useVegetationMeshesMutation(client), {
      wrapper: createWrapper(),
    })

    let out: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined
    await act(async () => {
      out = await result.current.mutateAsync({
        polygon: makeValidSquare(),
        shouldCommit: () => false,
      })
    })

    // Full data is returned (vs the old empty `{ meshes: [], totalTrees: 0 }`).
    expect(out?.totalTrees).toBe(1)
    expect(out?.meshes).toHaveLength(1)
    expect(Object.keys(out?.features ?? {})).toHaveLength(1)
    // ...but the GLOBAL store was NOT committed with the trees (setMeshes,
    // which flips status→'ready', never ran — only the initial setLoading did).
    expect(useVegetationStore.getState().status).not.toBe('ready')
    expect(useVegetationStore.getState().totalTrees).toBe(0)
  })
})
