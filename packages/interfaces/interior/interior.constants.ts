import type { SidebarTab } from './interior.types'

/** Ghost opacity for hidden-but-visible elements (H shortcut) */
export const GHOST_OPACITY = 0.15

/**
 * Pseudo-category keys for wall classification.
 * These are NOT IFC entity types -- they are derived classifications
 * based on Pset_WallCommon.IsExternal property scanning.
 */
export const EXTERIOR_WALLS_KEY = 'EXTERIOR_WALLS'
export const INTERIOR_WALLS_KEY = 'INTERIOR_WALLS'

/** IFC category keys with human-readable display names */
export const IFC_CATEGORIES: Record<string, string> = {
  EXTERIOR_WALLS: 'Exterior Walls',
  INTERIOR_WALLS: 'Interior Walls',
  IFCSLAB: 'Slabs',
  IFCBEAM: 'Beams',
  IFCCOLUMN: 'Columns',
  IFCDOOR: 'Doors',
  IFCWINDOW: 'Windows',
  IFCSTAIR: 'Stairs',
  IFCROOF: 'Roofs',
  IFCFURNISHINGELEMENT: 'Furniture',
  IFCFLOWSEGMENT: 'Pipes / Ducts',
  IFCFLOWFITTING: 'Fittings',
  IFCFLOWTERMINAL: 'Terminals',
  IFCSPACE: 'Spaces',
  IFCZONE: 'Zones',
  IFCRAILING: 'Railings',
  IFCPLATE: 'Plates',
  IFCMEMBER: 'Members',
  IFCCOVERING: 'Coverings',
  IFCBUILDINGSTOREY: 'Storeys',
}

/**
 * Wall pseudo-category keys that appear at the top of the CategoryFilter.
 * Ordered: Exterior Walls first, then Interior Walls.
 */
export const WALL_CATEGORY_KEYS = [EXTERIOR_WALLS_KEY, INTERIOR_WALLS_KEY] as const

/**
 * Categories hidden by default on model load.
 * IFCSPACE: room bounding volumes that sit coplanar with slabs/walls, causing z-fighting.
 * Professional IFC viewers (Solibri, BIMcollab) hide these by default.
 */
export const HIDDEN_BY_DEFAULT_CATEGORIES = new Set(['IFCSPACE', 'IFCZONE'])

/** Batch size for chunked getItemsData calls (prevents large memory spikes) */
export const WALL_CLASSIFICATION_CHUNK_SIZE = 500

/** Keyboard shortcut map: key -> action description */
export const KEYBOARD_SHORTCUTS: Record<string, string> = {
  Escape: 'Deselect / close',
  f: 'Fit model to view',
  h: 'Ghost selected element',
  s: 'Full reset: categories + wall filters + ghosts + floor -> "All Floors"',
}

/**
 * Sidebar tab option type for the SegmentedControl.
 * Inlined here to avoid dependency on app-level SegmentedControl types.
 */
export interface SidebarTabOption {
  value: SidebarTab
  label: string
}

/** Sidebar tab options for the SegmentedControl (built-in tabs only; plugins add more) */
export const SIDEBAR_TAB_OPTIONS: SidebarTabOption[] = [
  { value: 'upload', label: 'Upload' },
  { value: 'model', label: 'Model' },
]
