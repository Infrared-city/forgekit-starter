import { toast } from 'sonner'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { HIDDEN_BY_DEFAULT_CATEGORIES, IFC_CATEGORIES } from './interior.constants'
import type {
  ElementInfo,
  LoadingState,
  ModelInfo,
  SidebarTab,
  SpatialTreeNode,
  TreeBreadcrumb,
  WallClassification,
} from './interior.types'
import { formatBytes } from './interior.utils'

/** Warn for large files that may be slow to load */
const LARGE_FILE_WARN_BYTES = 100 * 1024 * 1024 // 100 MB

interface InteriorState {
  // ─── UI State ──────────────────────────────────────────────────────────────
  /** Currently active sidebar tab */
  activeTab: SidebarTab

  // ─── Scene State ─────────────────────────────────────────────────────────
  /**
   * Monotonically incremented counter set by InteriorCanvas when the
   * Three.js scene is initialized. Reset to 0 on unmount. Used as a
   * reactive signal by InteriorPanel to know when sceneRefs are available.
   */
  sceneVersion: number

  // ─── Model State ───────────────────────────────────────────────────────────
  /** Model loading lifecycle */
  loadingState: LoadingState
  /** File read progress 0-100 */
  loadingProgress: number
  /** Error message when loadingState === 'error' */
  loadingError: string | null
  /** Metadata about the loaded model */
  modelInfo: ModelInfo | null
  /**
   * Raw ArrayBuffer of the loaded IFC file.
   * Stored here for Task 3 to consume when the Three.js scene is ready.
   * The actual IfcImporter.import() call happens in Task 3.
   */
  modelBuffer: ArrayBuffer | null
  /**
   * Monotonically incremented counter set by InteriorCanvas each time a
   * FragmentsModel is successfully assigned to (or cleared from) modelRef.
   * ModelTreePanel uses this as a reactive dependency to re-trigger the
   * spatial-tree fetch whenever the model changes.
   */
  modelVersion: number

  // ─── Tree State ────────────────────────────────────────────────────────────
  /** Children of the currently viewed tree node */
  treeChildren: SpatialTreeNode[]
  /** Breadcrumb path from root to current node */
  treeBreadcrumb: SpatialTreeNode[]
  /**
   * Flat map from localId → SpatialTreeNode.
   * Built once after model loads; enables O(1) lookup for navigateToElement.
   */
  treeFlatMap: Map<number, SpatialTreeNode>
  /**
   * Flat map from localId → parent localId (or null for root children).
   * Enables path reconstruction from leaf to root.
   */
  treeParentMap: Map<number, number | null>
  /** Structured breadcrumb trail for the current navigation level */
  treeCrumbs: TreeBreadcrumb[]
  /**
   * Loading state for the async spatial tree fetch.
   * 'idle' → no model; 'loading' → getSpatialStructure() in flight; 'loaded' → done.
   */
  treeLoadingState: 'idle' | 'loading' | 'loaded'
  /** Root-level nodes of the full spatial tree (persisted to enable navigateToElement root look-up) */
  treeRoots: SpatialTreeNode[]

  // ─── Selection State ───────────────────────────────────────────────────────
  selectedId: number | null
  hoveredId: number | null
  selectedElement: ElementInfo | null

  // ─── Visibility State ──────────────────────────────────────────────────────
  /** Currently isolated floor storey localId (null = all floors visible) */
  selectedFloor: number | null
  categoryFilters: Record<string, boolean>
  ghostedIds: Set<number>

  // ─── Floor Descendants Map ────────────────────────────────────────────────
  /**
   * Pre-computed map from IFCBUILDINGSTOREY localId → Set of all descendant localIds.
   * Built during buildTreeMaps(). Used for dropdown element counts and tree filtering.
   */
  floorDescendantsMap: Map<number, Set<number>>

  // ─── Wall Classification State ────────────────────────────────────────────
  /** Cached wall classification from Pset_WallCommon.IsExternal scanning */
  wallClassification: WallClassification | null
  /** Whether the wall classification scan is in progress */
  wallClassificationLoading: boolean

  // ─── Actions ───────────────────────────────────────────────────────────────
  setActiveTab: (tab: SidebarTab) => void
  /** Increment sceneVersion to signal that sceneRefs are available */
  bumpSceneVersion: () => void

  setLoadingState: (state: LoadingState) => void
  setLoadingProgress: (progress: number) => void
  setLoadingError: (error: string | null) => void
  setModelInfo: (info: ModelInfo | null) => void
  setModelBuffer: (buffer: ArrayBuffer | null) => void
  /** Increment modelVersion to notify tree panel that modelRef has changed */
  bumpModelVersion: () => void

  /**
   * Read a File to ArrayBuffer, updating loadingProgress and loadingState.
   * On success: sets modelBuffer, modelInfo, loadingState='loaded', switches to 'model' tab.
   * On error: sets loadingState='error', loadingError.
   * If a model is already loaded, resets relevant state before loading.
   */
  loadFile: (file: File) => Promise<void>

  setTreeChildren: (children: SpatialTreeNode[]) => void
  setTreeBreadcrumb: (breadcrumb: SpatialTreeNode[]) => void

  /**
   * Build the tree flat map and parent map from the full spatial tree root.
   * Call this once after the model loads and spatial structure is fetched.
   */
  buildTreeMaps: (root: SpatialTreeNode[]) => void

  /**
   * Navigate the tree to show the parent level of the given localId.
   * Sets treeChildren to the siblings of that node and updates treeCrumbs.
   * Used by Task 5 when the user clicks an element in 3D.
   */
  navigateToElement: (localId: number) => void

  /**
   * Navigate into the children of a given node in the drill-down tree.
   */
  drillInto: (node: SpatialTreeNode) => void

  /**
   * Navigate up one level in the tree (back button).
   */
  navigateUp: () => void

  /** Set the structured breadcrumb trail */
  setTreeCrumbs: (crumbs: TreeBreadcrumb[]) => void
  setTreeLoadingState: (state: 'idle' | 'loading' | 'loaded') => void

  setSelectedId: (id: number | null) => void
  setHoveredId: (id: number | null) => void
  setSelectedElement: (element: ElementInfo | null) => void

  setSelectedFloor: (storeyId: number | null) => void
  setCategoryFilter: (category: string, visible: boolean) => void
  toggleGhosted: (localId: number) => void
  resetVisibility: () => void
  /** Set all category filters (including wall pseudo-categories) to visible */
  resetAllCategoryFilters: () => void
  /** Set all category filters (including wall pseudo-categories) to hidden */
  hideAllCategoryFilters: () => void

  /** Set wall classification result (from standalone buildWallClassification in utils) */
  setWallClassification: (wc: WallClassification | null) => void
  /** Set wall classification loading state */
  setWallClassificationLoading: (loading: boolean) => void

  /** Reset all state to initial values (call on route unmount) */
  reset: () => void
}

// Initial state for store reset and testing
const initialState = {
  activeTab: 'upload' as SidebarTab,
  sceneVersion: 0,

  loadingState: 'idle' as LoadingState,
  loadingProgress: 0,
  loadingError: null as string | null,
  modelInfo: null as ModelInfo | null,
  modelBuffer: null as ArrayBuffer | null,
  modelVersion: 0,

  treeChildren: [] as SpatialTreeNode[],
  treeBreadcrumb: [] as SpatialTreeNode[],
  treeFlatMap: new Map<number, SpatialTreeNode>(),
  treeParentMap: new Map<number, number | null>(),
  treeCrumbs: [] as TreeBreadcrumb[],
  treeLoadingState: 'idle' as 'idle' | 'loading' | 'loaded',
  treeRoots: [] as SpatialTreeNode[],

  selectedId: null as number | null,
  hoveredId: null as number | null,
  selectedElement: null as ElementInfo | null,

  selectedFloor: null as number | null,
  categoryFilters: {} as Record<string, boolean>,
  ghostedIds: new Set<number>(),
  floorDescendantsMap: new Map<number, Set<number>>(),

  wallClassification: null as WallClassification | null,
  wallClassificationLoading: false,
}

/**
 * Interior store with subscribeWithSelector middleware for fine-grained subscriptions.
 *
 * Three.js objects (scene, renderer, camera, controls, FragmentsModels) live in
 * component refs, NOT in this store. Store holds serialisable UI state only.
 *
 * Cross-domain subscription example:
 * ```typescript
 * useEffect(() => {
 *   const unsubscribe = useInteriorStore.subscribe(
 *     (state) => state.selectedId,
 *     (id) => console.log('Selection changed:', id)
 *   )
 *   return unsubscribe
 * }, [])
 * ```
 */
export const useInteriorStore = create<InteriorState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setActiveTab: (tab) => set({ activeTab: tab }),
    bumpSceneVersion: () => set((state) => ({ sceneVersion: state.sceneVersion + 1 })),

    setLoadingState: (state) => set({ loadingState: state }),
    setLoadingProgress: (progress) => set({ loadingProgress: progress }),
    setLoadingError: (error) => set({ loadingError: error }),
    setModelInfo: (info) => set({ modelInfo: info }),
    setModelBuffer: (buffer) => set({ modelBuffer: buffer }),
    bumpModelVersion: () => set((state) => ({ modelVersion: state.modelVersion + 1 })),

    loadFile: async (file: File) => {
      // Reset model, tree, selection, and visibility state before loading a new model
      set({
        loadingState: 'loading',
        loadingProgress: 0,
        loadingError: null,
        modelInfo: null,
        modelBuffer: null,
        // Clear tree state for the new model
        treeChildren: [],
        treeBreadcrumb: [],
        treeCrumbs: [],
        treeRoots: [],
        treeLoadingState: 'idle',
        treeFlatMap: new Map<number, SpatialTreeNode>(),
        treeParentMap: new Map<number, number | null>(),
        // Clear selection state
        selectedId: null,
        hoveredId: null,
        selectedElement: null,
        // Clear visibility state
        selectedFloor: null,
        categoryFilters: {},
        ghostedIds: new Set<number>(),
        floorDescendantsMap: new Map<number, Set<number>>(),
        // Clear wall classification from previous model
        wallClassification: null,
        wallClassificationLoading: false,
      })

      // Warn if file is very large
      if (file.size > LARGE_FILE_WARN_BYTES) {
        toast.warning(`Large file (${formatBytes(file.size)}) — loading may be slow`, {
          id: 'ifc-large-warn',
        })
      }

      toast.loading('Loading IFC...', { id: 'ifc-load' })

      try {
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader()

          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              // Phase 1 (file read) maps to 0-50% of total progress
              const progress = Math.round((event.loaded / event.total) * 50)
              set({ loadingProgress: progress })
            }
          }

          reader.onload = (event) => {
            const result = event.target?.result
            if (result instanceof ArrayBuffer) {
              set({ loadingProgress: 50 })
              resolve(result)
            } else {
              reject(new Error('Failed to read file as ArrayBuffer'))
            }
          }

          reader.onerror = () => {
            reject(new Error(reader.error?.message ?? 'File read error'))
          }

          reader.readAsArrayBuffer(file)
        })

        const info: ModelInfo = {
          name: file.name,
          sizeBytes: file.size,
          // Schema and elementCount are determined in Task 3 after IfcImporter.import()
          // Use placeholder values that will be overwritten
          schema: 'unknown',
          elementCount: 0,
        }

        set({
          modelBuffer: buffer,
          modelInfo: info,
          // Keep loading state — IFC import (Phase 2) has not started yet.
          // InteriorCanvas will set 'loaded' + switch tab after import completes.
          loadingState: 'loading',
          loadingProgress: 50,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load IFC file'
        set({
          loadingState: 'error',
          loadingError: message,
          loadingProgress: 0,
        })
        toast.error(message, { id: 'ifc-load' })
      }
    },

    setTreeChildren: (children) => set({ treeChildren: children }),
    setTreeBreadcrumb: (breadcrumb) => set({ treeBreadcrumb: breadcrumb }),
    setTreeCrumbs: (crumbs) => set({ treeCrumbs: crumbs }),
    setTreeLoadingState: (state) => set({ treeLoadingState: state }),

    buildTreeMaps: (roots: SpatialTreeNode[]) => {
      const flatMap = new Map<number, SpatialTreeNode>()
      const parentMap = new Map<number, number | null>()
      const floorDescendantsMap = new Map<number, Set<number>>()

      function traverse(node: SpatialTreeNode, parentId: number | null) {
        flatMap.set(node.localId, node)
        parentMap.set(node.localId, parentId)
        for (const child of node.children) {
          traverse(child, node.localId)
        }
      }

      /**
       * Collect all descendant localIds of a node (not including the node itself).
       */
      function collectDescendants(node: SpatialTreeNode): Set<number> {
        const descendants = new Set<number>()
        function walk(n: SpatialTreeNode) {
          for (const child of n.children) {
            descendants.add(child.localId)
            walk(child)
          }
        }
        walk(node)
        return descendants
      }

      for (const root of roots) {
        traverse(root, null)
      }

      // Build floorDescendantsMap for all IFCBUILDINGSTOREY nodes
      for (const [, node] of flatMap) {
        if (node.type.toUpperCase() === 'IFCBUILDINGSTOREY') {
          floorDescendantsMap.set(node.localId, collectDescendants(node))
        }
      }

      set({
        treeFlatMap: flatMap,
        treeParentMap: parentMap,
        treeRoots: roots,
        floorDescendantsMap,
      })
    },

    navigateToElement: (localId: number) => {
      const state = get()
      const { treeFlatMap, treeParentMap } = state

      if (!treeFlatMap.has(localId)) return

      // Build path from root → element by walking up from element
      const pathIds: number[] = []
      let current: number | null = localId

      while (current !== null) {
        pathIds.unshift(current)
        current = treeParentMap.get(current) ?? null
      }

      // The parent of the target element contains its siblings
      const parentId = treeParentMap.get(localId) ?? null
      let siblings: SpatialTreeNode[]

      if (parentId === null) {
        // Element is at root level — use treeRoots (always correct, regardless of current nav state)
        siblings = state.treeRoots
      } else {
        const parentNode = treeFlatMap.get(parentId)
        siblings = parentNode ? parentNode.children : []
      }

      // Build breadcrumb nodes for the path (excluding the last element itself)
      const breadcrumbNodes: SpatialTreeNode[] = []
      for (const pid of pathIds.slice(0, -1)) {
        const node = treeFlatMap.get(pid)
        if (node) breadcrumbNodes.push(node)
      }

      set({
        treeChildren: siblings,
        treeBreadcrumb: breadcrumbNodes,
        treeCrumbs: breadcrumbNodes.map((n, i) => ({
          localId: n.localId,
          label: n.name || n.type,
          depth: i,
        })),
      })
    },

    drillInto: (node: SpatialTreeNode) => {
      const state = get()
      const newBreadcrumb = [...state.treeBreadcrumb, node]
      const newCrumbs: TreeBreadcrumb[] = newBreadcrumb.map((n, i) => ({
        localId: n.localId,
        label: n.name || n.type,
        depth: i,
      }))

      set({
        treeChildren: node.children,
        treeBreadcrumb: newBreadcrumb,
        treeCrumbs: newCrumbs,
      })
    },

    navigateUp: () => {
      const state = get()
      const { treeBreadcrumb } = state

      if (treeBreadcrumb.length === 0) return

      const newBreadcrumb = treeBreadcrumb.slice(0, -1)
      const parentNode = newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1] : null

      let siblings: SpatialTreeNode[]
      if (parentNode === null) {
        // Back to top-level — use treeRoots (consistent with navigateToElement)
        siblings = state.treeRoots
      } else {
        siblings = parentNode.children
      }

      const newCrumbs: TreeBreadcrumb[] = newBreadcrumb.map((n, i) => ({
        localId: n.localId,
        label: n.name || n.type,
        depth: i,
      }))

      set({
        treeChildren: siblings,
        treeBreadcrumb: newBreadcrumb,
        treeCrumbs: newCrumbs,
      })
    },

    setSelectedId: (id) => set({ selectedId: id }),
    setHoveredId: (id) => set({ hoveredId: id }),
    setSelectedElement: (element) => set({ selectedElement: element }),

    setSelectedFloor: (storeyId) => set({ selectedFloor: storeyId }),

    setCategoryFilter: (category, visible) =>
      set((state) => ({
        categoryFilters: { ...state.categoryFilters, [category]: visible },
      })),

    toggleGhosted: (localId) =>
      set((state) => {
        const next = new Set(state.ghostedIds)
        if (next.has(localId)) {
          next.delete(localId)
        } else {
          next.add(localId)
        }
        return { ghostedIds: next }
      }),

    resetVisibility: () => {
      const { treeRoots } = get()
      set({
        selectedFloor: null,
        categoryFilters: {},
        ghostedIds: new Set<number>(),
        // Reset tree navigation to root when clearing floor isolation
        // so the tree UI stays consistent with selectedFloor: null.
        treeChildren: treeRoots,
        treeBreadcrumb: [],
        treeCrumbs: [],
      })
    },

    resetAllCategoryFilters: () => {
      const filters: Record<string, boolean> = {}
      for (const key of Object.keys(IFC_CATEGORIES)) {
        filters[key] = !HIDDEN_BY_DEFAULT_CATEGORIES.has(key)
      }
      set({ categoryFilters: filters })
    },

    hideAllCategoryFilters: () => {
      const filters: Record<string, boolean> = {}
      for (const key of Object.keys(IFC_CATEGORIES)) {
        filters[key] = false
      }
      set({ categoryFilters: filters })
    },

    setWallClassification: (wc) => set({ wallClassification: wc }),
    setWallClassificationLoading: (loading) => set({ wallClassificationLoading: loading }),

    reset: () =>
      set({
        ...initialState,
        treeFlatMap: new Map<number, SpatialTreeNode>(),
        treeParentMap: new Map<number, number | null>(),
        treeRoots: [],
        treeLoadingState: 'idle',
        floorDescendantsMap: new Map<number, Set<number>>(),
        wallClassification: null,
        wallClassificationLoading: false,
      }),
  })),
)

// Export for testing - returns fresh state with new Map/Set instances to prevent
// shared mutable references across test resets.
export const getInteriorInitialState = () => ({
  ...initialState,
  ghostedIds: new Set<number>(),
  treeFlatMap: new Map<number, SpatialTreeNode>(),
  treeParentMap: new Map<number, number | null>(),
  floorDescendantsMap: new Map<number, Set<number>>(),
  wallClassification: null,
  wallClassificationLoading: false,
})
