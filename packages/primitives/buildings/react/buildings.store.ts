import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import type { BuildingTransform } from '../core/buildings.transforms'

export type BuildingsStatus = 'idle' | 'loading' | 'ready' | 'error'

interface BuildingsState {
  // -- Data slice (mirrors vegetation + ground-materials stores so all
  //    three primitives follow the same shape: explicit-trigger
  //    mutation writes into the store, plugin reads from the store,
  //    consumers decide their own persistence layer). --
  /** Buildings filtered to the user polygon — used for visualization. */
  buildings: Record<string, DotBimMesh> | null
  /** All buildings from the tile-based fetch (unfiltered) — used for
   *  analysis runs so edge tiles that extend beyond the polygon still
   *  have mesh data. */
  allBuildings: Record<string, DotBimMesh> | null
  /** Mapbox building IDs derived from `buildings` — drives the 3D-
   *  extrusion filter. */
  buildingIds: number[]
  /** Stable polygon key the data was fetched for. Used by downstream
   *  persistence adapters (e.g. the platform's warehouse chokepoint)
   *  to refuse stale-cache hydration. */
  lastPolygonKey: string | null
  status: BuildingsStatus
  errorMessage: string | null

  // -- Per-mesh transform overrides (unchanged from the original
  //    pre-data-slice store). --
  buildingTransforms: Record<string, BuildingTransform>

  setLoading: (polygonKey: string) => void
  setBuildings: (
    buildings: Record<string, DotBimMesh>,
    allBuildings: Record<string, DotBimMesh>,
    buildingIds: number[],
    polygonKey: string,
  ) => void
  setError: (message: string) => void
  clear: () => void

  updateBuildingTransform: (meshId: string, transform: Partial<BuildingTransform>) => void
  clearBuildingTransform: (meshId: string) => void
}

const initialState = {
  buildings: null as Record<string, DotBimMesh> | null,
  allBuildings: null as Record<string, DotBimMesh> | null,
  buildingIds: [] as number[],
  lastPolygonKey: null as string | null,
  status: 'idle' as BuildingsStatus,
  errorMessage: null as string | null,
  buildingTransforms: {} as Record<string, BuildingTransform>,
}

/**
 * Buildings primitive store.
 *
 * Holds both the buildings DATA (status / buildings / allBuildings /
 * buildingIds / lastPolygonKey) AND per-mesh TRANSFORMS. The data
 * slice mirrors `useVegetationStore` and `useGroundMaterialsStore` so
 * all three site-context primitives follow the same contract:
 *
 *   1. The primitive exposes a mutation hook that fires the SDK once,
 *      explicitly, when the caller invokes `mutate(polygon)`.
 *   2. On success, the mutation writes data into this store.
 *   3. The plugin reads buildings from this store and renders.
 *
 * Persistence is the CONSUMING APP'S concern — each app decides how
 * to cache + hydrate. The platform writes/reads through the warehouse
 * chokepoint (R2). The reference app uses React Query's IDB persister.
 * The primitive itself is persistence-agnostic.
 */
export const useBuildingsStore = create<BuildingsState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setLoading: (polygonKey) =>
      set({ status: 'loading', errorMessage: null, lastPolygonKey: polygonKey }),
    setBuildings: (buildings, allBuildings, buildingIds, polygonKey) =>
      set({
        buildings,
        allBuildings,
        buildingIds,
        status: 'ready',
        errorMessage: null,
        lastPolygonKey: polygonKey,
      }),
    setError: (message) => set({ status: 'error', errorMessage: message }),
    clear: () => set({ ...initialState }),

    updateBuildingTransform: (meshId, transform) =>
      set((state) => ({
        buildingTransforms: {
          ...state.buildingTransforms,
          [meshId]: {
            ...{ deltaX: 0, deltaY: 0, rotation: 0 },
            ...state.buildingTransforms[meshId],
            ...transform,
          },
        },
      })),

    clearBuildingTransform: (meshId) =>
      set((state) => {
        const { [meshId]: _, ...rest } = state.buildingTransforms
        return { buildingTransforms: rest }
      }),
  })),
)

// Export for testing - allows resetting store to initial state
export const getBuildingsInitialState = () => ({ ...initialState })
