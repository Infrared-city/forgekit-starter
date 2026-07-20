import type { QueryClient } from '@tanstack/react-query'
import type * as FRAGS from '@thatopen/fragments'
import type { Layer } from 'deck.gl'
import type { Map as MapboxMap } from 'mapbox-gl'
import type React from 'react'
import type * as THREE from 'three'

// ---------------------------------------------------------------------------
// Map Plugin Contract
// ---------------------------------------------------------------------------

/** Viewport state passed to map plugins for layer composition. */
export interface MapViewport {
  latitude: number
  longitude: number
  zoom: number
  pitch: number
  bearing: number
}

/** Context available to map plugins when composing layers and panels. */
export interface MapPluginContext {
  viewport: MapViewport
  selectedMeshId: string | null
  hoveredMeshId: string | null
  queryClient: QueryClient
}

/** Props supplied to a map plugin's sidebar panel component. */
export interface MapPanelProps {
  context: MapPluginContext
}

/** Pointer / interaction events forwarded from the map canvas to plugins. */
export interface MapEvent {
  type: 'click' | 'hover' | 'drag-start' | 'drag' | 'drag-end'
  coordinate: [number, number]
  layer?: string
  object?: unknown
}

/** A keyboard shortcut that a map plugin can register. */
export interface KeyboardShortcut {
  key: string
  modifiers?: Array<'ctrl' | 'shift' | 'alt' | 'meta'>
  handler: () => void
  description?: string
}

/**
 * Contract that a primitive implements to plug into the Map rendering surface.
 *
 * All members are optional except `id`. The Map interface host iterates over
 * registered plugins to compose layers, panels, events, and lifecycle hooks.
 */
export interface MapPlugin {
  /** Unique identifier for this plugin (used for dependency resolution). */
  id: string
  /** DeckGL layers this plugin contributes. */
  layers?: (context: MapPluginContext) => Layer[]
  /** Sidebar panel content. */
  Panel?: React.ComponentType<MapPanelProps>
  /** Tab label for the sidebar (if Panel provided). */
  panelLabel?: string
  /** Icon component for the sidebar tab. */
  panelIcon?: React.ComponentType<{ className?: string }>
  /** Handle map pointer/click events. */
  onMapEvent?: (event: MapEvent) => void
  /** Called when the Mapbox map instance is ready -- for plugins that need direct map access. */
  onMapReady?: (map: MapboxMap) => void
  /** Called when the map is being torn down -- cleanup map-level resources. */
  onMapDestroy?: () => void
  /** DeckGL drag-start handler. Return true to consume (disables map pan). */
  onDragStart?: (info: unknown, event: unknown) => boolean | void
  /** DeckGL drag-move handler. */
  onDrag?: (info: unknown) => void
  /** DeckGL drag-end handler. */
  onDragEnd?: () => void
  /** Canvas overlay component rendered inside the map container (e.g., tooltip). */
  Overlay?: React.ComponentType<MapOverlayProps>
  /** Keyboard shortcut handlers. */
  shortcuts?: KeyboardShortcut[]
  /** Cleanup on route leave. */
  cleanup?: () => void
  /** Other plugin IDs this plugin requires (for ordering / validation). */
  requires?: string[]
}

/** Props supplied to a map plugin's overlay component. */
export interface MapOverlayProps {
  context: MapPluginContext
  /** DeckGL ref for screen-space projections (e.g., tooltip positioning). */
  deckRef: React.RefObject<unknown>
}

// ---------------------------------------------------------------------------
// Interior Plugin Contract
// ---------------------------------------------------------------------------

/**
 * Shared refs created by useSceneSetup and passed to downstream hooks.
 * All Three.js / ThatOpen imperative objects live in refs, NOT in Zustand.
 *
 * Re-exported from the interior domain types so that plugins can reference
 * scene objects without importing the interior domain directly.
 */
export interface SceneRefs {
  renderer: React.RefObject<THREE.WebGLRenderer | null>
  scene: React.RefObject<THREE.Scene | null>
  camera: React.RefObject<THREE.PerspectiveCamera | null>
  controls: React.RefObject<
    import('three/examples/jsm/controls/OrbitControls.js').OrbitControls | null
  >
  fragments: React.RefObject<FRAGS.FragmentsModels | null>
  currentModel: React.RefObject<FRAGS.FragmentsModel | null>
  composer: React.RefObject<
    import('three/examples/jsm/postprocessing/EffectComposer.js').EffectComposer | null
  >
  grid: React.RefObject<THREE.GridHelper | null>
  backgroundTexture: React.RefObject<THREE.CanvasTexture | null>
  canvasElement: React.RefObject<HTMLCanvasElement | null>
  disposed: React.RefObject<boolean>
  needsRender: React.RefObject<boolean>
  continuousRenderUntil: React.RefObject<number>
}

/** Props supplied to an interior plugin's sidebar panel component. */
export interface InteriorPanelProps {
  sceneRefs: SceneRefs
}

/**
 * Contract that a primitive implements to plug into the Interior rendering surface.
 *
 * All members are optional except `id`. The Interior interface host iterates
 * over registered plugins to compose panels, overlays, and lifecycle hooks.
 */
export interface InteriorPlugin {
  /** Unique identifier for this plugin (used for dependency resolution). */
  id: string
  /** React to model load/replace -- receives both model and scene refs. */
  onModelLoaded?: (model: FRAGS.FragmentsModel, sceneRefs: SceneRefs) => void
  /** Sidebar panel content. */
  Panel?: React.ComponentType<InteriorPanelProps>
  /** Tab label for sidebar. */
  panelLabel?: string
  /** Scene overlay (e.g., heatmap). */
  Overlay?: React.ComponentType<{ sceneRefs: SceneRefs }>
  /** Cleanup on model unload or route leave. */
  cleanup?: () => void
  /** Other plugin IDs this plugin requires. */
  requires?: string[]
}

// ---------------------------------------------------------------------------
// Shared base type for both plugin flavors (used by utilities)
// ---------------------------------------------------------------------------

/** Minimal shape required by validatePlugins / orderPlugins. */
export interface PluginBase {
  id: string
  requires?: string[]
}
