/**
 * Indoor analysis InteriorPlugin adapter with dependency injection.
 *
 * Wraps the indoor-analysis package's functionality (heatmap overlay, analysis
 * panel) into the InteriorPlugin contract. All cross-domain data (model buffer,
 * floor selection, location) is accessed via the injected deps rather than
 * direct store imports.
 */

import type { InteriorPanelProps, InteriorPlugin, SceneRefs } from '@forge-kit/plugin-contracts'
import type * as FRAGS from '@thatopen/fragments'
import type { ComponentType } from 'react'
import type { SpatialTreeNode } from './core/indoor-analysis.types'
import { HeatmapOverlay } from './react/components/HeatmapOverlay'
import { useAnalysisStore } from './react/indoor-analysis.store'

// ---------------------------------------------------------------------------
// Dependency interface
// ---------------------------------------------------------------------------

/**
 * Dependencies required by the indoor-analysis plugin.
 *
 * Provided by the composition root so the package does not depend on
 * useInteriorStore or useMapStore directly.
 *
 * There are two categories of ports:
 *
 * 1. **Imperative getters** -- used by non-React code (store subscriptions,
 *    overlay hooks). These read state synchronously from the stores.
 *
 * 2. **React hooks** -- used by React components (AnalysisPanel). These
 *    subscribe to store slices and cause re-renders when state changes.
 *    Prefixed with `use`.
 */
export interface IndoorAnalysisDeps {
  // --- Imperative getters (for store subscriptions / overlay) ---------------

  /** Get the current IFC model buffer (imperative) */
  getModelBuffer: () => ArrayBuffer | null
  /** Get the selected floor info -- uuid for Triton, localId for IFC (imperative) */
  getSelectedFloor: () => { uuid: string; localId: number } | null
  /** Get tree roots for floor list (imperative) */
  getTreeRoots: () => SpatialTreeNode[]
  /** Get location for sun position calculation (imperative) */
  getLocation: () => { lat: number; lng: number }
  /** Get the model loading state (imperative) */
  getLoadingState: () => 'idle' | 'loading' | 'parsing' | 'loaded' | 'error'
  /** Get the model info (imperative) */
  getModelInfo: () => { name: string; sizeBytes: number } | null
  /**
   * Get the 0-based floor index for the currently selected storey.
   *
   * Derived from IFCBUILDINGSTOREY order in the spatial tree (DFS),
   * matching the order displayed in the floor selector dropdown.
   * Returns null if no floor is selected.
   */
  getSelectedFloorIndex: () => number | null
  /** Set the selected floor in the interior store */
  setSelectedFloor: (localId: number | null) => void
  /** Get floor descendant IDs for alignment bbox fallback (imperative) */
  getFloorDescendants: () => Set<number> | null
  /**
   * Get the selected floor's Y elevation for overlay placement (imperative).
   * Returns the floor surface Y coordinate in model space, or null if unknown.
   * When null, the overlay falls back to whole-model bounds.
   */
  getSelectedFloorElevation?: () => number | null
  /** Subscribe to floor selection changes (returns unsubscribe function) */
  subscribeToFloorChanges?: (callback: () => void) => () => void

  // --- React hooks (for components that need re-renders) --------------------

  /** Hook: subscribe to model buffer changes */
  useModelBuffer: () => ArrayBuffer | null
  /** Hook: subscribe to selected floor changes */
  useSelectedFloor: () => number | null
  /** Hook: subscribe to tree roots changes */
  useTreeRoots: () => SpatialTreeNode[]
  /** Hook: subscribe to location changes */
  useLocation: () => { lat: number; lng: number }
  /** Hook: subscribe to loading state changes */
  useLoadingState: () => 'idle' | 'loading' | 'parsing' | 'loaded' | 'error'
  /** Hook: subscribe to model info changes */
  useModelInfo: () => { name: string; sizeBytes: number } | null
  /** Panel component injected from the app layer. */
  PanelComponent: ComponentType<InteriorPanelProps & { deps: IndoorAnalysisDeps }>
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

/**
 * Creates an InteriorPlugin instance for the indoor-analysis package.
 *
 * Provides:
 * - Panel: AnalysisPanel component (floor selector, run button, overlay toggle)
 * - Overlay: HeatmapOverlay component (Three.js textured plane)
 * - onModelLoaded: clears stale analysis state on model replace
 * - cleanup: clears analysis state on model unload / route leave
 *
 * @param deps - Injected dependencies from the composition root
 * @returns InteriorPlugin instance
 */
export function createIndoorAnalysisPlugin(deps: IndoorAnalysisDeps): InteriorPlugin {
  const PanelImpl = deps.PanelComponent
  return {
    id: 'indoor-analysis',
    panelLabel: 'Analysis',

    Panel: (props) => <PanelImpl deps={deps} {...props} />,
    Overlay: ({ sceneRefs }: { sceneRefs: SceneRefs }) => (
      <HeatmapOverlay sceneRefs={sceneRefs} deps={deps} />
    ),

    onModelLoaded: (_model: FRAGS.FragmentsModel, _sceneRefs: SceneRefs) => {
      // Bump generation FIRST to invalidate any in-flight analysis runs
      // from the previous model. Without this, a stale onSuccess callback
      // from useRunDaylightFactor could accept results for the wrong model.
      useAnalysisStore.getState().bumpGeneration()
      // Then clear analysis results (data + overlay visibility + step).
      useAnalysisStore.getState().clearAnalysis()
    },

    cleanup: () => {
      useAnalysisStore.getState().reset()
    },
  }
}
