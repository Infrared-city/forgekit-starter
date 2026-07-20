import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  AnalysisStep,
  HeatmapPointData,
  IndoorAnalysisType,
} from '../core/indoor-analysis.types'

interface IndoorAnalysisState {
  // --- State ---------------------------------------------------------------
  /** Whether the heatmap overlay is visible in the 3D scene */
  showOverlay: boolean
  /** Currently selected analysis type */
  analysisType: IndoorAnalysisType
  /** Heatmap point cloud data returned by the analysis API */
  heatmapData: HeatmapPointData | null
  /** Current step in the multi-step analysis flow (null = idle) */
  analysisStep: AnalysisStep | null
  /** Monotonic counter for concurrent run protection -- incremented on each mutate() */
  analysisGeneration: number

  // --- Actions -------------------------------------------------------------
  setShowOverlay: (show: boolean) => void
  setAnalysisType: (type: IndoorAnalysisType) => void
  setHeatmapData: (data: HeatmapPointData | null) => void
  setAnalysisStep: (step: AnalysisStep | null) => void
  /** Bump generation counter -- call in mutation onMutate */
  bumpGeneration: () => void
  /** Get current generation -- for staleness check in onSuccess */
  getGeneration: () => number
  /** Clear all analysis results (data + overlay visibility + step) */
  clearAnalysis: () => void
  /** Reset entire store to initial state */
  reset: () => void
}

const initialState = {
  showOverlay: false,
  analysisType: 'daylight-factor' as IndoorAnalysisType,
  heatmapData: null as HeatmapPointData | null,
  analysisStep: null as AnalysisStep | null,
  analysisGeneration: 0,
}

/**
 * Indoor analysis store with subscribeWithSelector middleware for
 * fine-grained subscriptions.
 *
 */
export const useAnalysisStore = create<IndoorAnalysisState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setShowOverlay: (show) => set({ showOverlay: show }),
    setAnalysisType: (type) => set({ analysisType: type }),
    setHeatmapData: (data) => set({ heatmapData: data }),
    setAnalysisStep: (step) => set({ analysisStep: step }),

    bumpGeneration: () => set((s) => ({ analysisGeneration: s.analysisGeneration + 1 })),
    getGeneration: () => get().analysisGeneration,

    clearAnalysis: () =>
      set({
        showOverlay: false,
        heatmapData: null,
        analysisStep: null,
      }),

    reset: () =>
      set((s) => ({
        ...initialState,
        heatmapData: null,
        analysisStep: null,
        // Keep generation strictly monotonic across resets to prevent
        // stale in-flight requests from matching after model replace /
        // route leave. Never reset to 0.
        analysisGeneration: s.analysisGeneration + 1,
      })),
  })),
)

// Export for testing - returns fresh state to prevent shared mutable references
export const getIndoorAnalysisInitialState = () => ({
  ...initialState,
  heatmapData: null as HeatmapPointData | null,
  analysisStep: null as AnalysisStep | null,
  analysisGeneration: 0,
})
