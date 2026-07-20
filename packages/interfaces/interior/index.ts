// ---- Store ----

// ---- Re-exported plugin types from shared for consumer convenience ----
export type {
  InteriorPanelProps as InteriorPluginPanelProps,
  InteriorPlugin,
} from '@forge-kit/plugin-contracts'

// ---- Components ----
export { CategoryFilter } from './components/CategoryFilter'
export type { InteriorCanvasProps } from './components/InteriorCanvas'
export { InteriorCanvas } from './components/InteriorCanvas'
export { InteriorCanvasWithSuspense } from './components/InteriorCanvas.lazy'
export { InteriorLoadingSkeleton } from './components/InteriorLoadingSkeleton'
export type { InteriorPanelProps } from './components/InteriorPanel'
export { InteriorPanel } from './components/InteriorPanel'
export { InteriorTooltip } from './components/InteriorTooltip'
export { ModelTreePanel } from './components/ModelTreePanel'
export { UploadPanel } from './components/UploadPanel'
export { ViewerToolbar } from './components/ViewerToolbar'

// ---- Hooks ----
export type { CameraControlHandlers } from './hooks/useCameraControls'
export { useCameraControls } from './hooks/useCameraControls'
export { useIfcImport } from './hooks/useIfcImport'
export { useInteriorKeyboardShortcuts } from './hooks/useInteriorKeyboardShortcuts'
export type { SyncSource } from './hooks/useInteriorRaycasting'
export { useInteriorRaycasting } from './hooks/useInteriorRaycasting'
export { createSceneBackground, useSceneSetup } from './hooks/useSceneSetup'
export { useVisibilityPass } from './hooks/useVisibilityPass'

// ---- Constants ----
export {
  EXTERIOR_WALLS_KEY,
  GHOST_OPACITY,
  IFC_CATEGORIES,
  INTERIOR_WALLS_KEY,
  KEYBOARD_SHORTCUTS,
  SIDEBAR_TAB_OPTIONS,
  WALL_CATEGORY_KEYS,
  WALL_CLASSIFICATION_CHUNK_SIZE,
} from './interior.constants'
// ---- Model ref (module-level ref) ----
export { modelRef } from './interior.model-ref'
// ---- Scene context (module-level ref) ----
export { sceneRefsRef } from './interior.scene-context'
export { getInteriorInitialState, useInteriorStore } from './interior.store'
// ---- Types ----
export type {
  ElementInfo,
  LoadingState,
  ModelInfo,
  SceneRefs,
  SelectionState,
  SidebarTab,
  SpatialTreeNode,
  VisibilityState,
  WallClassification,
} from './interior.types'
// ---- Utils ----
export {
  buildWallClassification,
  extractAttributeValue,
  extractIsExternal,
  findIsExternalInProperties,
  formatBytes,
  formatIfcTypeName,
  getStringAttribute,
  getStringProp,
  normalizeIsExternalValue,
} from './interior.utils'
