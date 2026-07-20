import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CleanBody,
  CollectParams,
  CollectParamsInput,
  CollectResponse,
  FeatureCollection,
  GroundMaterialRegistry,
} from '../core/ground-materials.sdk-types'
import type { GroundMaterialsApiClient } from '../plugin'

// Local response envelope -- matches the inline pattern used by other primitives
// (e.g. `BuildingsApiResponse` in buildings.api.ts) so this package no longer
// reaches into the legacy TypeScript API schemas workspace path.
interface ApiResponse<T> {
  data: T
}

// ---------------------------------------------------------------------------
// Typed "temporarily unavailable" error for 501 responses
// ---------------------------------------------------------------------------
// The Python API returns 501 Not Implemented for the three collection/clean
// endpoints until fn-44 lands (ground materials backend port). Consuming UIs
// should catch this specific error and render an informational notice instead
// of toasting raw JSON.

export class GroundMaterialsUnavailableError extends Error {
  readonly serverMessage?: string
  constructor(message: string, serverMessage?: string) {
    super(message)
    this.name = 'GroundMaterialsUnavailableError'
    this.serverMessage = serverMessage
  }
}

/**
 * Structural duck-type guard for "HTTP 501" errors thrown by the app's API
 * client. We deliberately do NOT import `ApiError` from `apps/base/client`
 * (primitives must not depend on the app), and we do NOT text-match -- we
 * check that the error object exposes a `status` field equal to `501`.
 *
 * This matches the shape of `ApiError` introduced in task .2 without taking
 * a hard import dependency, and will also match any future client that
 * exposes the same structural field.
 */
function isStatus501(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status: unknown }).status === 501
  )
}

/**
 * Best-effort extraction of a human-readable message from the thrown error.
 * Used to hand a server-provided reason to the UI layer for display.
 */
function extractServerMessage(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return undefined
}

/**
 * Wrap a ground-materials mutation call. If the underlying client throws a
 * structural 501, rethrow as a typed `GroundMaterialsUnavailableError`; any
 * other error is rethrown unchanged. The message is deliberately generic
 * (`service is temporarily unavailable`) because the same guard wraps
 * collect, clean, and collect-and-process, and "collection" would read as
 * misleading for the clean/save path.
 */
async function runWithUnavailableGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (isStatus501(err)) {
      throw new GroundMaterialsUnavailableError(
        'Ground materials service is temporarily unavailable.',
        extractServerMessage(err),
      )
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// Query key factory (self-contained, no dependency on app-level query-keys)
// ---------------------------------------------------------------------------

export const groundMaterialsKeys = {
  all: ['ground-materials'] as const,
  elements: () => [...groundMaterialsKeys.all, 'elements'] as const,
  registry: () => [...groundMaterialsKeys.all, 'registry'] as const,
}

export const analysisKeys = {
  all: ['analysis'] as const,
}

// ---------------------------------------------------------------------------
// Module-level API client ref -- set by the plugin hook
// ---------------------------------------------------------------------------

let _apiClient: GroundMaterialsApiClient | null = null

/** Set the API client used by all ground-materials hooks. Called by the plugin hook. */
export function setGroundMaterialsApiClient(client: GroundMaterialsApiClient): void {
  _apiClient = client
}

function getApiClient(): GroundMaterialsApiClient {
  if (!_apiClient) {
    throw new Error(
      '@forge-kit/ground-materials: API client not set. ' +
        'Ensure useGroundMaterialsMapPlugin() is called before any API hooks.',
    )
  }
  return _apiClient
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch the ground materials registry (material types + properties).
 * Uses staleTime: Infinity since the registry is a static dataset.
 *
 * NOTE: the registry endpoint is NOT wrapped in the 501 guard -- it is
 * expected to work even while the collect/clean endpoints are unavailable.
 */
export function useGroundMaterialRegistry() {
  const client = getApiClient()
  return useQuery({
    queryKey: groundMaterialsKeys.registry(),
    queryFn: async () => {
      const response = await client.get<ApiResponse<GroundMaterialRegistry>>(
        '/ground-materials/registry',
      )
      return response.data
    },
    staleTime: Infinity,
  })
}

/**
 * Collect raw ground material layers from OpenStreetMap.
 * Uses LONG_RUNNING_TIMEOUT since large areas may take time.
 * On success, updates the elements query cache with the collect response.
 */
export function useCollectGroundMaterials() {
  const queryClient = useQueryClient()
  const client = getApiClient()

  return useMutation({
    mutationFn: async (params: CollectParams) => {
      return runWithUnavailableGuard(async () => {
        const response = await client.post<ApiResponse<CollectResponse>>(
          '/ground-materials/collect',
          params,
          180000,
        )
        return response.data
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(groundMaterialsKeys.elements(), data)
      // Ground materials changed -- mark all cached analysis results as stale
      queryClient.invalidateQueries({ queryKey: analysisKeys.all, refetchType: 'none' })
    },
  })
}

/**
 * Clean/clip collected layers to the analysis area and resolve overlaps.
 * On success, updates the elements query cache with the cleaned result.
 */
export function useCleanGroundMaterials() {
  const queryClient = useQueryClient()
  const client = getApiClient()

  return useMutation({
    mutationFn: async (body: CleanBody) => {
      return runWithUnavailableGuard(async () => {
        const response = await client.post<ApiResponse<Record<string, FeatureCollection>>>(
          '/ground-materials/clean',
          body,
          180000,
        )
        return response.data
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(groundMaterialsKeys.elements(), data)
      // Ground materials changed -- mark all cached analysis results as stale
      queryClient.invalidateQueries({ queryKey: analysisKeys.all, refetchType: 'none' })
    },
  })
}

/**
 * Collect and process ground materials in a single operation.
 * Chains collect -> clean -> UUID mapping on the server side.
 * Uses LONG_RUNNING_TIMEOUT since both collect and clean run sequentially.
 * On success, caches the result under groundMaterialsKeys.elements().
 */
export function useCollectAndProcessGroundMaterials() {
  const queryClient = useQueryClient()
  const client = getApiClient()

  return useMutation({
    mutationFn: async (params: CollectParamsInput) => {
      return runWithUnavailableGuard(async () => {
        const response = await client.post<ApiResponse<Record<string, FeatureCollection>>>(
          '/ground-materials/collect-and-process',
          params,
          180000,
        )
        return response.data
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(groundMaterialsKeys.elements(), data)
      // Ground materials changed -- mark all cached analysis results as stale
      queryClient.invalidateQueries({ queryKey: analysisKeys.all, refetchType: 'none' })
    },
  })
}
