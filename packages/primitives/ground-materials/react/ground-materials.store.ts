import type { Feature } from 'geojson'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { DrawModes, ImportPreviewState } from '../core/ground-materials.types'

/**
 * Loose `FeatureCollection` shape consumed by the SDK display path.
 *
 * Matches `@infrared-city/infrared-sdk-ts`'s public type — looser than the
 * Zod-validated `FeatureCollection` from `core/ground-materials.sdk-types`,
 * which is reserved for the manual draw / collect pipeline.
 */
export interface SdkFeatureCollection {
  type?: string
  features?: Array<Record<string, unknown>>
  [key: string]: unknown
}

/** `Record<string, SdkFeatureCollection>` keyed by material layer name. */
export type MaterialLayers = Record<string, SdkFeatureCollection>

export type GroundMaterialsAreaStatus = 'idle' | 'loading' | 'ready' | 'error'

interface GroundMaterialsState extends ImportPreviewState {
  /** Currently selected material name (matches draw style filters) */
  currentMaterial: string | null
  /** Current MapboxDraw mode */
  currentMode: DrawModes
  /** Features currently selected in the draw editor */
  selectedFeatures: Feature[]
  /** Features created during this editing session */
  lastCreatedFeatures: Feature[]
  /** Features updated during this editing session */
  lastUpdatedFeatures: Feature[]
  /** Features deleted during this editing session */
  lastDeletedFeatures: Feature[]
  /** Whether the session has actionable unsaved changes */
  actionableState: boolean
  /** Whether the draw editor is currently active */
  isEditing: boolean

  /** SDK-fetched ground-material polygons keyed by layer name. Set via `useGroundMaterialsAreaMutation`. */
  areaLayers: MaterialLayers | null
  /**
   * Raw, unfiltered SDK-fetched layers as returned by `/ground-material/clean-v3`,
   * before registry-name filtering. Used by the analysis run path so layers
   * outside the local display registry (e.g. `grass`, `sand`) still reach the
   * backend, matching Python SDK behaviour. Display path keeps using
   * `areaLayers` (normalized + filtered).
   */
  rawAreaLayers: MaterialLayers | null
  /** Total feature count across all `areaLayers`. */
  areaTotalFeatures: number
  /** Status of the explicit "Load ground materials" trigger. */
  areaStatus: GroundMaterialsAreaStatus
  /** Last error message emitted by the area mutation. */
  areaErrorMessage: string | null
  /** Canonical key of the polygon that produced `areaLayers`. */
  lastAreaPolygonKey: string | null

  setMaterial: (material: string | null) => void
  setMode: (mode: DrawModes) => void
  setSelectedFeatures: (features: Feature[]) => void
  addCreated: (features: Feature[]) => void
  addUpdated: (features: Feature[]) => void
  addDeleted: (features: Feature[]) => void
  resetSession: () => void

  setAreaLoading: (polygonKey: string) => void
  setAreaLayers: (
    layers: MaterialLayers,
    rawLayers: MaterialLayers,
    totalFeatures: number,
    polygonKey: string,
  ) => void
  setAreaError: (message: string) => void
  clearArea: () => void

  // Import preview actions
  /** Store preview IDs and any warnings from the import parse/process pipeline */
  setImportPreview: (ids: string[], warnings: string[]) => void
  /** Store an import error message (bad file, validation failure, etc.) */
  setImportError: (error: string) => void
  /** Clear all import-related state (preview IDs, warnings, error) */
  clearImport: () => void
}

// Initial state for store reset and testing
const initialState = {
  currentMaterial: null as string | null,
  currentMode: 'simple_select' as DrawModes,
  selectedFeatures: [] as Feature[],
  lastCreatedFeatures: [] as Feature[],
  lastUpdatedFeatures: [] as Feature[],
  lastDeletedFeatures: [] as Feature[],
  actionableState: false,
  isEditing: false,
  // SDK area-display state
  areaLayers: null as MaterialLayers | null,
  rawAreaLayers: null as MaterialLayers | null,
  areaTotalFeatures: 0,
  areaStatus: 'idle' as GroundMaterialsAreaStatus,
  areaErrorMessage: null as string | null,
  lastAreaPolygonKey: null as string | null,
  // Import preview state
  importPreviewIds: [] as string[],
  importWarnings: [] as string[],
  importError: null as string | null,
}

/**
 * Ground materials store with subscribeWithSelector middleware for fine-grained subscriptions.
 *
 * Cross-domain subscription example:
 * ```typescript
 * useEffect(() => {
 *   const unsubscribe = useGroundMaterialsStore.subscribe(
 *     (state) => state.currentMaterial,
 *     (material) => console.log('Material changed:', material)
 *   )
 *   return unsubscribe
 * }, [])
 * ```
 */
export const useGroundMaterialsStore = create<GroundMaterialsState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setMaterial: (material) => set({ currentMaterial: material }),
    setMode: (mode) => set({ currentMode: mode }),
    setSelectedFeatures: (features) => set({ selectedFeatures: features }),
    addCreated: (features) =>
      set((state) => ({
        lastCreatedFeatures: [...state.lastCreatedFeatures, ...features],
        actionableState: true,
        isEditing: true,
      })),
    addUpdated: (features) =>
      set((state) => ({
        lastUpdatedFeatures: [...state.lastUpdatedFeatures, ...features],
        actionableState: true,
        isEditing: true,
      })),
    addDeleted: (features) =>
      set((state) => ({
        lastDeletedFeatures: [...state.lastDeletedFeatures, ...features],
        actionableState: true,
        isEditing: true,
      })),
    resetSession: () =>
      set({
        ...initialState,
      }),

    // SDK area-display actions
    setAreaLoading: (polygonKey) =>
      set({
        areaStatus: 'loading',
        areaErrorMessage: null,
        lastAreaPolygonKey: polygonKey,
      }),
    setAreaLayers: (layers, rawLayers, totalFeatures, polygonKey) =>
      set({
        areaLayers: layers,
        rawAreaLayers: rawLayers,
        areaTotalFeatures: totalFeatures,
        areaStatus: 'ready',
        areaErrorMessage: null,
        lastAreaPolygonKey: polygonKey,
      }),
    setAreaError: (message) =>
      set({
        areaStatus: 'error',
        areaErrorMessage: message,
      }),
    clearArea: () =>
      set({
        areaLayers: null,
        rawAreaLayers: null,
        areaTotalFeatures: 0,
        areaStatus: 'idle',
        areaErrorMessage: null,
        lastAreaPolygonKey: null,
      }),

    // Import preview actions
    setImportPreview: (ids, warnings) =>
      set({
        importPreviewIds: ids,
        importWarnings: warnings,
        importError: null,
      }),
    setImportError: (error) =>
      set({
        importError: error,
        importPreviewIds: [],
        importWarnings: [],
      }),
    clearImport: () =>
      set({
        importPreviewIds: [],
        importWarnings: [],
        importError: null,
      }),
  })),
)

// Export for testing - allows resetting store to initial state
export const getGroundMaterialsInitialState = () => ({ ...initialState })
