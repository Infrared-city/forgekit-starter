import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GroundMaterialsApiClient } from '../plugin'
import {
  GroundMaterialsUnavailableError,
  setGroundMaterialsApiClient,
  useCleanGroundMaterials,
  useCollectAndProcessGroundMaterials,
  useCollectGroundMaterials,
} from '../react/ground-materials.api'

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

/**
 * Build a stand-in `ApiError`-shaped object. The primitive's 501 guard is a
 * structural `status === 501` check, so we do NOT need the real `ApiError`
 * class from `apps/base/client` -- any object with a `status` field works.
 */
function makeStatusError(status: number, message: string) {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

type MockClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

function installMockClient(): MockClient {
  const client: MockClient = {
    get: vi.fn(),
    post: vi.fn(),
  }
  setGroundMaterialsApiClient(client as unknown as GroundMaterialsApiClient)
  return client
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ground-materials mutations: 501 -> GroundMaterialsUnavailableError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useCollectAndProcessGroundMaterials', () => {
    let client: MockClient

    beforeEach(() => {
      client = installMockClient()
    })

    it('rethrows a 501 error as GroundMaterialsUnavailableError with a friendly message', async () => {
      client.post.mockRejectedValueOnce(
        makeStatusError(501, 'Ground materials collect is not yet implemented in the Python port'),
      )

      const { result } = renderHook(() => useCollectAndProcessGroundMaterials(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          latitude: 0,
          longitude: 0,
          distance: 100,
          source: 'mapbox',
          defaultMaterial: 'asphalt',
        })
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      const error = result.current.error
      expect(error).toBeInstanceOf(GroundMaterialsUnavailableError)
      expect((error as GroundMaterialsUnavailableError).message).toBe(
        'Ground materials service is temporarily unavailable.',
      )
      expect((error as GroundMaterialsUnavailableError).serverMessage).toBe(
        'Ground materials collect is not yet implemented in the Python port',
      )
    })

    it('passes through non-501 errors unchanged', async () => {
      const original = makeStatusError(500, 'Upstream SDK crashed')
      client.post.mockRejectedValueOnce(original)

      const { result } = renderHook(() => useCollectAndProcessGroundMaterials(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          latitude: 0,
          longitude: 0,
          distance: 100,
          source: 'mapbox',
          defaultMaterial: 'asphalt',
        })
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      // Not wrapped -- the original error surfaces untouched
      expect(result.current.error).not.toBeInstanceOf(GroundMaterialsUnavailableError)
      expect((result.current.error as Error).message).toBe('Upstream SDK crashed')
    })

    it('does not match a 501-like error that uses a different field name', async () => {
      // Duck-typing is strict: only `status === 501` matches. A `statusCode`
      // field must NOT be misinterpreted, so the plain error surfaces.
      const notQuite = new Error('Different shape') as Error & { statusCode: number }
      notQuite.statusCode = 501
      client.post.mockRejectedValueOnce(notQuite)

      const { result } = renderHook(() => useCollectAndProcessGroundMaterials(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          latitude: 0,
          longitude: 0,
          distance: 100,
          source: 'mapbox',
          defaultMaterial: 'asphalt',
        })
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).not.toBeInstanceOf(GroundMaterialsUnavailableError)
    })

    it('passes through success responses unchanged', async () => {
      const payload = { asphalt: { type: 'FeatureCollection', features: [] } }
      client.post.mockResolvedValueOnce({ data: payload })

      const { result } = renderHook(() => useCollectAndProcessGroundMaterials(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          latitude: 0,
          longitude: 0,
          distance: 100,
          source: 'mapbox',
          defaultMaterial: 'asphalt',
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(payload)
    })
  })

  describe('useCleanGroundMaterials', () => {
    it('rethrows a 501 error as GroundMaterialsUnavailableError', async () => {
      const client = installMockClient()
      client.post.mockRejectedValueOnce(makeStatusError(501, 'Clean endpoint disabled'))

      const { result } = renderHook(() => useCleanGroundMaterials(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          latitude: 0,
          longitude: 0,
          distance: 100,
          layers: {},
          default: 'asphalt',
        })
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error).toBeInstanceOf(GroundMaterialsUnavailableError)
    })
  })

  describe('useCollectGroundMaterials', () => {
    it('rethrows a 501 error as GroundMaterialsUnavailableError', async () => {
      const client = installMockClient()
      client.post.mockRejectedValueOnce(makeStatusError(501, 'Collect endpoint disabled'))

      const { result } = renderHook(() => useCollectGroundMaterials(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          latitude: 0,
          longitude: 0,
          distance: 100,
          source: 'mapbox',
          defaultMaterial: 'asphalt',
        })
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error).toBeInstanceOf(GroundMaterialsUnavailableError)
    })
  })
})
