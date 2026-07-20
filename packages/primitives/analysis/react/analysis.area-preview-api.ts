import type { InfraredClient } from '@infrared-city/infrared-sdk-ts'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { type AnalysesName, TILING_SUPPORTED_TYPES } from '../core/analysis.sdk-types'
import { useAnalysisStore } from './analysis.store'

/**
 * Preview data returned by the SDK's previewAreaWithPricing method.
 *
 * `estimatedCostTokens` reflects live gateway pricing when available
 * (`pricingSource: 'remote'`), or the SDK's offline constant when the
 * pricing fetch fails (`pricingSource: 'fallback'`). The pricing fields
 * are optional so consumers keep working if the SDK omits them.
 */
export interface AreaPreviewData {
  tileCount: number
  estimatedTimeS: number
  estimatedCostTokens: number
  /** Per-job token price used to compute `estimatedCostTokens`. */
  tokensPerJob?: number
  /** Whether the price came from the gateway or the offline fallback. */
  pricingSource?: 'remote' | 'fallback'
  /** Version of the gateway pricing document, when resolved remotely. */
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
 * analysis store, calls `client.previewAreaWithPricing(polygon, { analysisType })`
 * whenever both are present AND the analysis type is in
 * `TILING_SUPPORTED_TYPES`, and returns the preview data directly.
 * Tile math is local; only the per-job token price is fetched from the
 * gateway (the SDK never throws for pricing — it falls back to a constant).
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
        return client.previewAreaWithPricing(polygon as unknown as Record<string, unknown>, {
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
