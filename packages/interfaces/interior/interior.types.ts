import type * as FRAGS from '@thatopen/fragments'
import type React from 'react'
import type * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'

/** Sidebar tabs in the interior panel (built-in only; plugins add their own) */
export type SidebarTab = 'upload' | 'model'

/** Loading state for the IFC model */
export type LoadingState = 'idle' | 'loading' | 'parsing' | 'loaded' | 'error'

/** Information about the currently loaded model */
export interface ModelInfo {
  /** Original file name */
  name: string
  /** File size in bytes */
  sizeBytes: number
  /** IFC schema version e.g. "IFC2X3", "IFC4" */
  schema: string
  /** Number of elements in the model */
  elementCount: number
}

/** A node in the IFC spatial structure tree */
export interface SpatialTreeNode {
  /** IFC local ID */
  localId: number
  /** Display name from the IFC file */
  name: string
  /** IFC entity type e.g. "IFCSITE", "IFCBUILDING", "IFCBUILDINGSTOREY", "IFCSPACE" */
  type: string
  /** IFC GlobalId (22-char base-64 encoded) -- populated for storey nodes */
  globalId?: string
  /** Child nodes (may be empty until expanded) */
  children: SpatialTreeNode[]
  /** Whether this node has children not yet loaded */
  hasChildren: boolean
}

/** A single crumb in the spatial tree breadcrumb trail */
export interface TreeBreadcrumb {
  /** IFC local ID of this level's node (null for root) */
  localId: number | null
  /** Display label shown in the breadcrumb */
  label: string
  /** Depth level (0 = root) */
  depth: number
}

/** Properties of a selected IFC element */
export interface ElementInfo {
  /** IFC local ID */
  localId: number
  /** Display name */
  name: string
  /** IFC entity type */
  type: string
  /** Raw properties from getItemsData */
  properties: Record<string, unknown>
}

/** Current selection state */
export interface SelectionState {
  /** Currently selected element local ID */
  selectedId: number | null
  /** Currently hovered element local ID */
  hoveredId: number | null
  /** Properties of the selected element */
  selectedElement: ElementInfo | null
}

/** Wall classification result from Pset_WallCommon.IsExternal scanning */
export interface WallClassification {
  /** IDs of walls classified as exterior (IsExternal === true) */
  exteriorWallIds: Set<number>
  /** IDs of walls classified as interior (IsExternal === false or missing) */
  interiorWallIds: Set<number>
  /** Spatial children (doors, windows, etc.) of exterior walls */
  exteriorWallChildIds: Set<number>
  /** True if ANY wall in the model had the Pset_WallCommon.IsExternal property */
  hasExternalProperty: boolean
}

/** Visibility configuration for floors and categories */
export interface VisibilityState {
  /** Currently isolated floor storey localId (null = all floors visible) */
  selectedFloor: number | null
  /** Map from IFC category key to visible flag */
  categoryFilters: Record<string, boolean>
  /** Set of ghosted element local IDs -- O(1) lookup for raycasting and visibility pass */
  ghostedIds: Set<number>
}

/**
 * Shared refs created by useSceneSetup and passed to downstream hooks.
 * All Three.js / ThatOpen imperative objects live in refs, NOT in Zustand.
 */
export interface SceneRefs {
  /** WebGL renderer instance */
  renderer: React.RefObject<THREE.WebGLRenderer | null>
  /** Three.js scene graph root */
  scene: React.RefObject<THREE.Scene | null>
  /** Perspective camera */
  camera: React.RefObject<THREE.PerspectiveCamera | null>
  /** OrbitControls instance */
  controls: React.RefObject<OrbitControls | null>
  /** ThatOpen fragments model manager */
  fragments: React.RefObject<FRAGS.FragmentsModels | null>
  /** Currently loaded fragment model */
  currentModel: React.RefObject<FRAGS.FragmentsModel | null>
  /** Post-processing effect composer */
  composer: React.RefObject<EffectComposer | null>
  /** Empty-state grid helper */
  grid: React.RefObject<THREE.GridHelper | null>
  /** Background gradient canvas texture */
  backgroundTexture: React.RefObject<THREE.CanvasTexture | null>
  /** Canvas DOM element (renderer.domElement) for event listeners */
  canvasElement: React.RefObject<HTMLCanvasElement | null>
  /** True after cleanup has run -- guards against post-unmount operations */
  disposed: React.RefObject<boolean>
  /** Dirty flag for render-on-demand loop */
  needsRender: React.RefObject<boolean>
  /** Timestamp deadline for continuous rendering (used during visibility transitions) */
  continuousRenderUntil: React.RefObject<number>
}
