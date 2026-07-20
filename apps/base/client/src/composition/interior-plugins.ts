/**
 * Interior plugin composition -- wires primitive plugins with their dependencies.
 *
 * This module is the single place that knows which primitives participate in
 * the interior interface and how their cross-dependencies are satisfied.
 */
import {
  configureIndoorAnalysisApi,
  createIndoorAnalysisPlugin,
  type IndoorAnalysisDeps,
  ifcGlobalIdToUuid,
  type SpatialTreeNode,
} from '@forge-kit/indoor-analysis'
import { useInteriorStore } from '@forge-kit/interior-interface'
import { useMapStore } from '@forge-kit/map-interface'
import type { InteriorPlugin } from '@forge-kit/plugin-contracts'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AnalysisPanel } from '@/components/domains/indoor-analysis'
import { api } from '../lib/api'

// Inject the auth-aware API client into indoor-analysis so its fetch calls
// include auth headers and benefit from the 401 refresh interceptor.
configureIndoorAnalysisApi(api)

// ---------------------------------------------------------------------------
// Hook-based ports (module-level stable references)
// ---------------------------------------------------------------------------
// These are called as hooks by the AnalysisPanel component. They must be
// stable function references (not recreated on each render) so React's
// hook ordering rules are satisfied.

function useModelBufferPort(): ArrayBuffer | null {
  return useInteriorStore((s) => s.modelBuffer)
}

function useSelectedFloorPort(): number | null {
  return useInteriorStore((s) => s.selectedFloor)
}

function useTreeRootsPort() {
  return useInteriorStore((s) => s.treeRoots)
}

function useLocationPort() {
  return useMapStore(
    useShallow((s) => ({
      lat: s.viewState.latitude,
      lng: s.viewState.longitude,
    })),
  )
}

function useLoadingStatePort() {
  return useInteriorStore((s) => s.loadingState)
}

function useModelInfoPort() {
  return useInteriorStore((s) => s.modelInfo)
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

/**
 * Compose interior plugins with their dependencies.
 *
 * Must be called inside a React component (it uses hooks for memoization).
 * Returns an array of InteriorPlugins ready for InteriorPanel and InteriorCanvas.
 */
export function useInteriorPlugins(): InteriorPlugin[] {
  'use no memo' // Opts out of React Compiler -- hooks passed as DI values (composition root pattern)
  const deps: IndoorAnalysisDeps = useMemo(
    () => ({
      // -- Imperative getters (for store subscriptions / overlay) --
      getModelBuffer: () => useInteriorStore.getState().modelBuffer,
      getSelectedFloor: () => {
        const state = useInteriorStore.getState()
        const floor = state.selectedFloor
        if (floor === null) return null
        // Derive UUID from the storey's IFC GlobalId via treeRoots lookup
        function findGlobalId(nodes: typeof state.treeRoots): string | undefined {
          for (const node of nodes) {
            if (node.localId === floor && node.globalId) return node.globalId
            const found = findGlobalId(node.children)
            if (found) return found
          }
          return undefined
        }
        const globalId = findGlobalId(state.treeRoots)
        if (!globalId) return null
        try {
          const uuid = ifcGlobalIdToUuid(globalId)
          return { uuid, localId: floor }
        } catch {
          return null
        }
      },
      getTreeRoots: () => useInteriorStore.getState().treeRoots,
      getLocation: () => {
        const vs = useMapStore.getState().viewState
        return { lat: vs.latitude, lng: vs.longitude }
      },
      getLoadingState: () => useInteriorStore.getState().loadingState,
      getModelInfo: () => useInteriorStore.getState().modelInfo,
      getSelectedFloorIndex: () => {
        const state = useInteriorStore.getState()
        const floor = state.selectedFloor
        if (floor === null) return null
        // Collect IFCBUILDINGSTOREY nodes in DFS order (same order as
        // floorOptions in AnalysisPanel) and find the selected storey's index
        const storeys: SpatialTreeNode[] = []
        function findStoreys(nodes: SpatialTreeNode[]) {
          for (const node of nodes) {
            if (node.type.toUpperCase() === 'IFCBUILDINGSTOREY') {
              storeys.push(node)
            } else {
              findStoreys(node.children)
            }
          }
        }
        findStoreys(state.treeRoots)
        const idx = storeys.findIndex((s) => s.localId === floor)
        return idx === -1 ? null : idx
      },
      setSelectedFloor: (localId: number | null) => {
        useInteriorStore.getState().setSelectedFloor(localId)
      },
      getFloorDescendants: () => {
        const state = useInteriorStore.getState()
        if (state.selectedFloor === null) return null
        return state.floorDescendantsMap.get(state.selectedFloor) ?? null
      },
      subscribeToFloorChanges: (callback: () => void) => {
        return useInteriorStore.subscribe(
          (state) => state.selectedFloor,
          () => callback(),
        )
      },

      // -- React hooks (stable module-level references) --
      useModelBuffer: useModelBufferPort,
      useSelectedFloor: useSelectedFloorPort,
      useTreeRoots: useTreeRootsPort,
      useLocation: useLocationPort,
      useLoadingState: useLoadingStatePort,
      useModelInfo: useModelInfoPort,
      PanelComponent: AnalysisPanel,
    }),
    [],
  )

  const indoorAnalysisPlugin = useMemo(() => createIndoorAnalysisPlugin(deps), [deps])

  return useMemo(() => [indoorAnalysisPlugin], [indoorAnalysisPlugin])
}
