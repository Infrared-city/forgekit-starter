import type { Feature } from 'geojson'

// Re-export types from the inlined SDK module (previously from @infrared/sdk)
export type {
  CleanBody,
  CleanResponse,
  CollectParams,
  CollectResponse,
  FeatureCollection,
  GroundMaterialNameType,
  GroundMaterialRegistry,
  GroundMaterialRegistryElement,
  GroundMaterialType,
} from './ground-materials.sdk-types'

/**
 * MapboxDraw draw mode identifiers.
 */
export type DrawModes = 'simple_select' | 'direct_select' | 'draw_polygon'

/**
 * State tracked during draw events for session change management.
 */
export interface DrawEventState {
  /** Currently selected features in the draw editor */
  selectedFeatures: Feature[]
  /** Current draw mode */
  currentMode: DrawModes
  /** Currently active material type (UUID) */
  currentMaterial: string | null
  /** Features created during this editing session */
  lastCreatedFeatures: Feature[]
  /** Features updated during this editing session */
  lastUpdatedFeatures: Feature[]
  /** Features deleted during this editing session */
  lastDeletedFeatures: Feature[]
  /** Whether the session has actionable unsaved changes */
  actionableState: boolean
}

// ---------------------------------------------------------------------------
// Import preview types
// ---------------------------------------------------------------------------

/**
 * State fields for GeoJSON import preview functionality.
 */
export interface ImportPreviewState {
  /** IDs of features currently in import preview state on the draw instance */
  importPreviewIds: string[]
  /** Warnings generated during parsing/processing (filtered features, CRS, etc.) */
  importWarnings: string[]
  /** Error message from a failed parse or validation, or null if no error */
  importError: string | null
}

// ---------------------------------------------------------------------------
// Viewport type for import boundary (injected from map interface)
// ---------------------------------------------------------------------------

/**
 * A geographic viewport used for boundary calculations in GeoJSON import.
 * This is a framework-agnostic type matching the map interface's BuildingsViewport.
 */
export interface GroundMaterialsViewport {
  latitude: number
  longitude: number
  width: number
  height: number
}

/**
 * Function that converts local meters to lat/lng using a geographic origin.
 * Injected from the map interface to avoid coupling to map.geo-utils.
 */
export type MetersToLatLngFn = (
  meters: { x: number; y: number },
  origin: [number, number],
) => { lat: number; lng: number }
