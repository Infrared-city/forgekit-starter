import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HeatmapPointData } from '../core/indoor-analysis.types'
import { getIndoorAnalysisInitialState, useAnalysisStore } from '../react/indoor-analysis.store'

// --- Test data ---

const mockHeatmapData: HeatmapPointData = {
  minLegend: 0,
  maxLegend: 5.2,
  points: [
    { x: 1.0, y: 2.0, z: 0.5, df: 3.1 },
    { x: 1.5, y: 2.5, z: 0.5, df: 1.8 },
  ],
}

// --- Tests ---

describe('useAnalysisStore', () => {
  beforeEach(() => {
    useAnalysisStore.setState(getIndoorAnalysisInitialState())
  })

  // --- Initial state ---

  describe('initial state', () => {
    it('should have expected shape', () => {
      const state = useAnalysisStore.getState()
      expect(state.showOverlay).toBe(false)
      expect(state.analysisType).toBe('daylight-factor')
      expect(state.heatmapData).toBeNull()
      expect(state.analysisStep).toBeNull()
      expect(state.analysisGeneration).toBe(0)
    })

    it('getIndoorAnalysisInitialState should return initial values', () => {
      const initial = getIndoorAnalysisInitialState()
      expect(initial.showOverlay).toBe(false)
      expect(initial.analysisType).toBe('daylight-factor')
      expect(initial.heatmapData).toBeNull()
      expect(initial.analysisStep).toBeNull()
      expect(initial.analysisGeneration).toBe(0)
    })
  })

  // --- setShowOverlay ---

  describe('setShowOverlay', () => {
    it('should toggle overlay to true', () => {
      useAnalysisStore.getState().setShowOverlay(true)
      expect(useAnalysisStore.getState().showOverlay).toBe(true)
    })

    it('should toggle overlay to false', () => {
      useAnalysisStore.getState().setShowOverlay(true)
      useAnalysisStore.getState().setShowOverlay(false)
      expect(useAnalysisStore.getState().showOverlay).toBe(false)
    })
  })

  // --- setAnalysisType ---

  describe('setAnalysisType', () => {
    it('should set analysis type', () => {
      useAnalysisStore.getState().setAnalysisType('daylight-factor')
      expect(useAnalysisStore.getState().analysisType).toBe('daylight-factor')
    })
  })

  // --- setHeatmapData ---

  describe('setHeatmapData', () => {
    it('should store heatmap data', () => {
      useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
      expect(useAnalysisStore.getState().heatmapData).toBe(mockHeatmapData)
    })

    it('should clear data with null', () => {
      useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
      useAnalysisStore.getState().setHeatmapData(null)
      expect(useAnalysisStore.getState().heatmapData).toBeNull()
    })
  })

  // --- setAnalysisStep ---

  describe('setAnalysisStep', () => {
    it('should set analysis step', () => {
      useAnalysisStore.getState().setAnalysisStep('uploading')
      expect(useAnalysisStore.getState().analysisStep).toBe('uploading')
    })

    it('should transition through all steps', () => {
      useAnalysisStore.getState().setAnalysisStep('uploading')
      expect(useAnalysisStore.getState().analysisStep).toBe('uploading')

      useAnalysisStore.getState().setAnalysisStep('validating')
      expect(useAnalysisStore.getState().analysisStep).toBe('validating')

      useAnalysisStore.getState().setAnalysisStep('analyzing')
      expect(useAnalysisStore.getState().analysisStep).toBe('analyzing')
    })

    it('should clear step with null', () => {
      useAnalysisStore.getState().setAnalysisStep('analyzing')
      useAnalysisStore.getState().setAnalysisStep(null)
      expect(useAnalysisStore.getState().analysisStep).toBeNull()
    })
  })

  // --- bumpGeneration ---

  describe('bumpGeneration', () => {
    it('should increment generation counter', () => {
      expect(useAnalysisStore.getState().analysisGeneration).toBe(0)
      useAnalysisStore.getState().bumpGeneration()
      expect(useAnalysisStore.getState().analysisGeneration).toBe(1)
    })

    it('should increment monotonically on repeated bumps', () => {
      useAnalysisStore.getState().bumpGeneration()
      useAnalysisStore.getState().bumpGeneration()
      useAnalysisStore.getState().bumpGeneration()
      expect(useAnalysisStore.getState().analysisGeneration).toBe(3)
    })
  })

  // --- getGeneration ---

  describe('getGeneration', () => {
    it('should return current generation value', () => {
      expect(useAnalysisStore.getState().getGeneration()).toBe(0)
      useAnalysisStore.getState().bumpGeneration()
      expect(useAnalysisStore.getState().getGeneration()).toBe(1)
    })
  })

  // --- clearAnalysis ---

  describe('clearAnalysis', () => {
    it('should reset data, overlay flag, and step', () => {
      useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
      useAnalysisStore.getState().setShowOverlay(true)
      useAnalysisStore.getState().setAnalysisStep('analyzing')

      useAnalysisStore.getState().clearAnalysis()

      expect(useAnalysisStore.getState().heatmapData).toBeNull()
      expect(useAnalysisStore.getState().showOverlay).toBe(false)
      expect(useAnalysisStore.getState().analysisStep).toBeNull()
    })

    it('should not reset analysisType', () => {
      useAnalysisStore.getState().setAnalysisType('daylight-factor')
      useAnalysisStore.getState().clearAnalysis()
      expect(useAnalysisStore.getState().analysisType).toBe('daylight-factor')
    })

    it('should not reset analysisGeneration', () => {
      useAnalysisStore.getState().bumpGeneration()
      useAnalysisStore.getState().bumpGeneration()
      useAnalysisStore.getState().clearAnalysis()
      expect(useAnalysisStore.getState().analysisGeneration).toBe(2)
    })
  })

  // --- reset ---

  describe('reset', () => {
    it('should clear state but keep generation strictly monotonic', () => {
      // Set non-initial values
      useAnalysisStore.getState().setShowOverlay(true)
      useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
      useAnalysisStore.getState().setAnalysisStep('analyzing')
      useAnalysisStore.getState().bumpGeneration()

      const genBeforeReset = useAnalysisStore.getState().analysisGeneration

      useAnalysisStore.getState().reset()

      const state = useAnalysisStore.getState()
      expect(state.showOverlay).toBe(false)
      expect(state.analysisType).toBe('daylight-factor')
      expect(state.heatmapData).toBeNull()
      expect(state.analysisStep).toBeNull()
      // Generation must be strictly greater after reset to invalidate
      // any in-flight requests from the previous session.
      expect(state.analysisGeneration).toBeGreaterThan(genBeforeReset)
    })

    it('should invalidate stale in-flight requests across reset boundary', () => {
      // Simulate: run A starts on model 1
      useAnalysisStore.getState().bumpGeneration()
      const runAGeneration = useAnalysisStore.getState().getGeneration()

      // Model replace / route leave triggers reset
      useAnalysisStore.getState().reset()

      // Run B starts on model 2
      useAnalysisStore.getState().bumpGeneration()
      const runBGeneration = useAnalysisStore.getState().getGeneration()

      // Run A resolves -- its generation should NOT match current
      expect(runAGeneration).not.toBe(runBGeneration)

      // Simulate the onSuccess guard from useRunDaylightFactor
      const currentGen = useAnalysisStore.getState().getGeneration()
      expect(runAGeneration).not.toBe(currentGen) // stale -- discard
      expect(runBGeneration).toBe(currentGen) // current -- accept
    })
  })

  // --- Subscriptions ---

  describe('subscriptions (subscribeWithSelector)', () => {
    it('should support fine-grained subscriptions to showOverlay', () => {
      const callback = vi.fn()

      const unsubscribe = useAnalysisStore.subscribe((state) => state.showOverlay, callback)

      useAnalysisStore.getState().setShowOverlay(true)
      expect(callback).toHaveBeenCalledWith(true, false)

      // Changing unrelated state should NOT trigger callback
      useAnalysisStore.getState().setAnalysisType('daylight-factor')
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()
    })

    it('should support fine-grained subscriptions to heatmapData', () => {
      const callback = vi.fn()

      const unsubscribe = useAnalysisStore.subscribe((state) => state.heatmapData, callback)

      useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
      expect(callback).toHaveBeenCalledWith(mockHeatmapData, null)

      unsubscribe()
    })

    it('should support fine-grained subscriptions to analysisStep', () => {
      const callback = vi.fn()

      const unsubscribe = useAnalysisStore.subscribe((state) => state.analysisStep, callback)

      useAnalysisStore.getState().setAnalysisStep('uploading')
      expect(callback).toHaveBeenCalledWith('uploading', null)

      useAnalysisStore.getState().setAnalysisStep('validating')
      expect(callback).toHaveBeenCalledWith('validating', 'uploading')

      unsubscribe()
    })

    it('should not fire subscription after unsubscribe', () => {
      const callback = vi.fn()
      const unsubscribe = useAnalysisStore.subscribe((state) => state.showOverlay, callback)

      unsubscribe()
      useAnalysisStore.getState().setShowOverlay(true)
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
