import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGroundMaterialsAreaMutation } from '../react/ground-materials.area-api'
import {
  getGroundMaterialsInitialState,
  useGroundMaterialsStore,
} from '../react/ground-materials.store'

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

// The mutation now does ONE whole-AOI `getRaw(lat, lon, distance, 'fgb')` call
// (not the tiled, Mapbox-default `getArea`); getRaw returns the name-keyed layers
// dict directly.
function makeSdk(
  rawLayers: Record<string, unknown> = { grass: { type: 'FeatureCollection', features: [] } },
) {
  const getRaw = vi.fn().mockResolvedValue(rawLayers)
  return { client: { groundMaterials: { getRaw } }, getRaw }
}

afterEach(() => {
  useGroundMaterialsStore.setState(getGroundMaterialsInitialState())
  vi.restoreAllMocks()
})

describe('useGroundMaterialsAreaMutation', () => {
  it('fetches whole-AOI via getRaw(fgb) and writes the layers to the store', async () => {
    const { client, getRaw } = makeSdk()
    const { result } = renderHook(() => useGroundMaterialsAreaMutation(client as never), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate(makeValidSquare())
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // ONE call (no per-tile fan-out) with the 'fgb' source (never 'mapbox').
    expect(getRaw).toHaveBeenCalledTimes(1)
    expect(getRaw.mock.calls[0][3]).toBe('fgb')
    // lat/lon/distance are numbers derived from the polygon bbox.
    expect(typeof getRaw.mock.calls[0][0]).toBe('number')
    expect(typeof getRaw.mock.calls[0][2]).toBe('number')
    expect(useGroundMaterialsStore.getState().areaStatus).toBe('ready')
  })

  it('runs clean-v3 via the injected cleaner with center + radius params', async () => {
    const { client, getRaw } = makeSdk()
    const cleaner = {
      cleanV3: vi.fn().mockResolvedValue({ grass: { type: 'FeatureCollection', features: [] } }),
    }
    const { result } = renderHook(
      () => useGroundMaterialsAreaMutation(client as never, { cleaner, zStep: 0.05 }),
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.mutate(makeValidSquare())
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRaw).toHaveBeenCalledTimes(1)
    expect(cleaner.cleanV3).toHaveBeenCalledTimes(1)
    const params = cleaner.cleanV3.mock.calls[0][1] as Record<string, unknown>
    expect(params.zStep).toBe(0.05)
    expect(typeof params.latitude).toBe('number')
    expect(typeof params.longitude).toBe('number')
    expect(typeof params.distance).toBe('number')
  })

  it('skips clean-v3 when no cleaner is supplied (raw fgb layers)', async () => {
    const { client, getRaw } = makeSdk()
    const { result } = renderHook(() => useGroundMaterialsAreaMutation(client as never), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate(makeValidSquare())
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRaw).toHaveBeenCalledTimes(1)
    expect(getRaw.mock.calls[0][3]).toBe('fgb')
  })

  it('shouldCommit:false returns the FULL result (incl. rawLayers) without writing the store', async () => {
    // Phase C "B": the scenario-keyed fetch re-route fetches without polluting
    // the global store, then writes its own slot from `rawLayers` — so the
    // return MUST carry the RAW (unclipped) layers.
    const { client } = makeSdk()
    const { result } = renderHook(() => useGroundMaterialsAreaMutation(client as never), {
      wrapper: createWrapper(),
    })

    let out: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined
    await act(async () => {
      out = await result.current.mutateAsync({
        polygon: makeValidSquare(),
        shouldCommit: () => false,
      })
    })

    // RAW layers are returned (vs the old empty `{ layers: {}, totalFeatures: 0 }`).
    expect(out?.rawLayers).toBeDefined()
    expect(Object.keys(out?.rawLayers ?? {})).toContain('grass')
    // ...but the GLOBAL store was NOT committed.
    expect(useGroundMaterialsStore.getState().rawAreaLayers).toBeNull()
    expect(useGroundMaterialsStore.getState().areaStatus).not.toBe('ready')
  })
})
