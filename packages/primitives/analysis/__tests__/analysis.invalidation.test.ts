import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { setupAnalysisInvalidation } from '../react/analysis.invalidation'
import { useAnalysisStore } from '../react/analysis.store'

describe('setupAnalysisInvalidation', () => {
  let queryClient: QueryClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let invalidateSpy: MockInstance<any>
  let cleanup: () => void

  // Callback holders — simulate the composition root injecting
  // the dep subscriptions.
  let viewportChangeCallback: (() => void) | null = null
  let buildingsChangeCallback: (() => void) | null = null

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: Infinity },
      },
    })

    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    // Reset stores to initial state
    useAnalysisStore.setState({
      selectedStationId: null,
    })

    viewportChangeCallback = null
    buildingsChangeCallback = null

    cleanup = setupAnalysisInvalidation(queryClient, {
      onViewportChange: (callback) => {
        viewportChangeCallback = callback
        return () => {
          viewportChangeCallback = null
        }
      },
      onBuildingsChange: (callback) => {
        buildingsChangeCallback = callback
        return () => {
          buildingsChangeCallback = null
        }
      },
    })
  })

  afterEach(() => {
    cleanup()
    invalidateSpy.mockRestore()
    queryClient.clear()
  })

  describe('buildings change', () => {
    it('invalidates analysis results when onBuildingsChange callback fires', () => {
      expect(buildingsChangeCallback).not.toBeNull()
      buildingsChangeCallback!()

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analysis']),
          refetchType: 'none',
        }),
      )
    })

    it('fires invalidation on each callback invocation', () => {
      buildingsChangeCallback!()
      buildingsChangeCallback!()

      const analysisInvalidations = invalidateSpy.mock.calls.filter((call) => {
        const opts = call[0] as any
        return (
          Array.isArray(opts?.queryKey) &&
          opts.queryKey[0] === 'analysis' &&
          opts?.refetchType === 'none'
        )
      })
      expect(analysisInvalidations.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('weather station change', () => {
    it('invalidates when selectedStationId changes', () => {
      // Change station
      useAnalysisStore.getState().setSelectedStationId('station-abc')

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analysis']),
          refetchType: 'none',
        }),
      )
    })

    it('invalidates when switching between stations', () => {
      useAnalysisStore.getState().setSelectedStationId('station-1')
      invalidateSpy.mockClear()

      useAnalysisStore.getState().setSelectedStationId('station-2')

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analysis']),
          refetchType: 'none',
        }),
      )
    })

    it('does not invalidate when station is set to the same value', () => {
      useAnalysisStore.getState().setSelectedStationId('station-1')
      invalidateSpy.mockClear()

      // Set to the same value
      useAnalysisStore.getState().setSelectedStationId('station-1')

      // subscribeWithSelector only fires on actual changes
      expect(invalidateSpy).not.toHaveBeenCalled()
    })
  })

  describe('viewport origin change', () => {
    it('invalidates when viewport change callback is invoked', () => {
      // The composition root fires the onViewportChange callback when
      // buildingsViewport changes. Simulate that here.
      expect(viewportChangeCallback).not.toBeNull()
      viewportChangeCallback!()

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analysis']),
          refetchType: 'none',
        }),
      )
    })
  })

  describe('refetchType: none', () => {
    it('all invalidation calls use refetchType none to avoid re-fetching', () => {
      // Trigger all invalidation paths
      useAnalysisStore.getState().setSelectedStationId('new-station')
      viewportChangeCallback!()

      // Every call to invalidateQueries should use refetchType: 'none'
      for (const call of invalidateSpy.mock.calls) {
        const opts = call[0] as any
        if (Array.isArray(opts?.queryKey) && opts.queryKey[0] === 'analysis') {
          expect(opts.refetchType).toBe('none')
        }
      }
    })
  })

  describe('cleanup', () => {
    it('stops all subscriptions when cleanup is called', () => {
      cleanup()
      invalidateSpy.mockClear()

      // None of these should trigger invalidation after cleanup
      useAnalysisStore.getState().setSelectedStationId('after-cleanup')
      // viewportChangeCallback should have been set to null by the unsubscribe
      expect(viewportChangeCallback).toBeNull()

      // No analysis invalidation calls should have been made
      const analysisInvalidations = invalidateSpy.mock.calls.filter((call) => {
        const opts = call[0] as any
        return Array.isArray(opts?.queryKey) && opts.queryKey[0] === 'analysis'
      })
      expect(analysisInvalidations).toHaveLength(0)
    })
  })
})
