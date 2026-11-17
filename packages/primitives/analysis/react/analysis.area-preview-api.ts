import type { InfraredClient } from '@infrared-city/infrared-sdk'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { type AnalysesName, TILING_SUPPORTED_TYPES } from '../core/analysis.sdk-types'
import { useAnalysisStore } from './analysis.store'

/** The polygon type of `previewArea` (the SDK does not export it by name). */
type AreaPolygon = Parameters<InfraredClient['previewArea']>[0]

/**
 * Preview data returned by the SDK's previewArea method.
 *
 * `estimatedCostTokens` uses the API's live price list. The SDK has no
 * built-in price: if the list cannot be fetched and none is cached, the
 * preview throws `PricingUnavailableError`. The pricing fields are optional
 * so consumers keep working if the SDK omits them.
 */
export interface AreaPreviewData {
  tileCount: number
  estimatedTimeS: number
  estimatedCostTokens: number
  /** Per-job token price used to compute `estimatedCostTokens`. */
  tokensPerJob?: number
  /**
   * Where the price came from: `live` (just fetched), `cached` (under 20
   * minutes old) or `stale` (the list could not be fetched again).
   */
  pricingSource?: 'live' | 'cached' | 'stale'
  /** Version of the price list, when the list has one. */
  pricingVersion?: string
}

/**
 * Return type of the hook produced by {@link createUseAreaPreview}.
 */
export interface AreaPreviewQueryResult {
  data: AreaPreviewData | undefined
  isPending: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Create a `useAreaPreview` React Query hook bound to an InfraredClient.
 *
 * The returned hook reads `areaPolygon` and `areaAnalysisType` from the
 * analysis store, calls `client.previewArea(polygon, { analysisType })`
 * whenever both are present AND the analysis type is in
 * `TILING_SUPPORTED_TYPES`, and returns the preview data directly.
 * Tile math is local; the per-job token price comes from the live price list
 * at the API root (`GET /billing/pricing`, through the Worker proxy). With no
 * price list the query fails with `PricingUnavailableError`: the UI must show
 * the error, never a made-up price.
 *
 * `opts.maxTilesOverride` lifts the SDK's default 100 non-empty-tile cap so a
 * large drawn analysis area still PRICES instead of throwing the tile-limit
 * `PolygonValidationError`. Pass the same ceiling the run + context fetch use
 * (the app's `SITE_TILE_LIMIT`); omit → SDK default.
 */
export function createUseAreaPreview(client: InfraredClient, opts?: { maxTilesOverride?: number }) {
  return function useAreaPreview(): AreaPreviewQueryResult {
    const { polygon, analysisType } = useAnalysisStore(
      useShallow((s) => ({
        polygon: s.areaPolygon,
        analysisType: s.areaAnalysisType,
      })),
    )

    const polygonHash = polygon != null ? JSON.stringify(polygon.coordinates) : ''

    const enabled =
      polygon != null && analysisType != null && TILING_SUPPORTED_TYPES.has(analysisType)

    const query = useQuery({
      queryKey: ['area-preview', polygonHash, analysisType] as const,
      enabled,
      queryFn: async () => {
        if (!polygon || !analysisType) {
          throw new Error('Area preview requires polygon and analysis type')
        }
        return client.previewArea(polygon as unknown as AreaPolygon, {
          analysisType: analysisType as AnalysesName,
          ...(opts?.maxTilesOverride !== undefined
            ? { maxTilesOverride: opts.maxTilesOverride }
            : {}),
        })
      },
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })

    return {
      data: query.data,
      isPending: query.isPending,
      isError: query.isError,
      error: query.error as Error | null,
      refetch: () => {
        void query.refetch()
      },
    }
  }
}
