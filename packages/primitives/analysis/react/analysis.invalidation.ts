/**
 * Analysis Auto-Invalidation
 *
 * Marks all cached analysis results as stale (amber "Stale" badge) when
 * upstream inputs change. Stale results remain viewable -- the user can still
 * click and see old results. No automatic re-fetching occurs.
 *
 * Invalidation triggers:
 * 1. Buildings change   - queryCache.subscribe watching buildings query data
 * 2. Ground materials   - onSuccess added to ground materials mutations
 * 3. Weather station    - subscribeWithSelector on analysis store (selectedStationId)
 * 4. Viewport origin    - via onInvalidate callback from composition root
 *
 * This module does NOT directly import any map store or query-keys module.
 * All cross-domain dependencies are injected via the deps parameter.
 */

import type { QueryClient } from '@tanstack/react-query'
import { useAnalysisStore } from './analysis.store'

/**
 * Local analysis query key prefix, matching the app-level analysisKeys.all.
 * Defined here so this module has no dependency on the app-level query-keys.
 */
const ANALYSIS_KEY_PREFIX = ['analysis'] as const

/**
 * Dependencies injected into setupAnalysisInvalidation from the composition root.
 *
 * Analysis is persistence-agnostic — it does not import other
 * primitives directly. Consumers wire cross-domain change signals
 * here (viewport / buildings / weather / ground-materials).
 */
export interface AnalysisInvalidationDeps {
  /** Subscribe to viewport changes. Returns unsubscribe function. */
  onViewportChange?: (callback: () => void) => () => void
  /**
   * Subscribe to buildings-data changes. Composing app supplies the
   * subscription source — for apps using the mutation pattern, this
   * watches `useBuildingsStore.lastPolygonKey`; for apps using the
   * legacy `useBuildingsInArea` (apps/base), the existing
   * `queryCache.subscribe` block in your composition root still works.
   * Either way, the callback fires when buildings data changes;
   * analysis invalidation runs on each call.
   */
  onBuildingsChange?: (callback: () => void) => () => void
}

/**
 * Invalidate all cached analysis results without triggering automatic re-fetch.
 * Uses refetchType: 'none' so stale results remain viewable with amber badge.
 */
function invalidateAllAnalysisResults(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    queryKey: ANALYSIS_KEY_PREFIX,
    refetchType: 'none',
  })
}

/**
 * Set up cross-domain auto-invalidation for analysis results.
 *
 * Returns an unsubscribe function that tears down all subscriptions.
 * Call once at app init (outside React tree) with the singleton queryClient.
 */
export function setupAnalysisInvalidation(
  queryClient: QueryClient,
  deps?: AnalysisInvalidationDeps,
): () => void {
  const unsubscribes: (() => void)[] = []

  // --- 1. Buildings change ---
  // Composing app supplies the subscription source (it knows whether
  // buildings is on the mutation pattern or the legacy useQuery
  // pattern). When the callback fires, all analysis results become
  // stale because they were computed against old geometry.
  if (deps?.onBuildingsChange) {
    const unsubBuildings = deps.onBuildingsChange(() => {
      invalidateAllAnalysisResults(queryClient)
    })
    unsubscribes.push(unsubBuildings)
  }

  // --- 2. Weather station change ---
  // When the user selects a different weather station, all cached results become
  // stale because analysis inputs have changed.
  const unsubWeather = useAnalysisStore.subscribe(
    (state) => state.selectedStationId,
    (selectedStationId, previousStationId) => {
      // Only invalidate when the station actually changes (not on initial subscription)
      if (previousStationId !== undefined && selectedStationId !== previousStationId) {
        invalidateAllAnalysisResults(queryClient)
      }
    },
  )
  unsubscribes.push(unsubWeather)

  // --- 3. Viewport origin change ---
  // Injected from the composition root. The app provides a callback that fires
  // when the buildings viewport changes. This replaces the direct useMapStore import.
  if (deps?.onViewportChange) {
    const unsubViewport = deps.onViewportChange(() => {
      invalidateAllAnalysisResults(queryClient)
    })
    unsubscribes.push(unsubViewport)
  }

  // --- 4. Ground materials change ---
  // Handled via onSuccess callbacks on the mutation hooks themselves.
  // See the modified ground-materials.api.ts mutations.
  // This is not a subscription -- it's done declaratively in the mutation definition.

  return () => {
    for (const unsub of unsubscribes) {
      unsub()
    }
  }
}
