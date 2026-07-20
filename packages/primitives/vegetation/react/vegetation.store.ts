import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { DotBimMesh } from '../core/vegetation.sdk-types'

export type VegetationStatus = 'idle' | 'loading' | 'ready' | 'error'

interface VegetationState {
  meshes: DotBimMesh[] | null
  /**
   * Raw GeoJSON features dict from `AreaVegetation.features`. Kept
   * alongside the meshes so the analysis run can forward it to
   * `runAreaAndWait` opts.vegetation without re-fetching.
   */
  features: Record<string, Record<string, unknown>> | null
  totalTrees: number
  status: VegetationStatus
  errorMessage: string | null
  lastPolygonKey: string | null

  setLoading: (polygonKey: string) => void
  setMeshes: (
    meshes: DotBimMesh[],
    features: Record<string, Record<string, unknown>>,
    totalTrees: number,
    polygonKey: string,
  ) => void
  setError: (message: string) => void
  clear: () => void
}

const initialState = {
  meshes: null as DotBimMesh[] | null,
  features: null as Record<string, Record<string, unknown>> | null,
  totalTrees: 0,
  status: 'idle' as VegetationStatus,
  errorMessage: null as string | null,
  lastPolygonKey: null as string | null,
}

export const useVegetationStore = create<VegetationState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setLoading: (polygonKey) =>
      set({ status: 'loading', errorMessage: null, lastPolygonKey: polygonKey }),
    setMeshes: (meshes, features, totalTrees, polygonKey) =>
      set({
        meshes,
        features,
        totalTrees,
        status: 'ready',
        errorMessage: null,
        lastPolygonKey: polygonKey,
      }),
    setError: (message) => set({ status: 'error', errorMessage: message }),
    clear: () => set({ ...initialState }),
  })),
)

export const getVegetationInitialState = () => ({ ...initialState })
