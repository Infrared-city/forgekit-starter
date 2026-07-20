/**
 * Mapbox Theme
 *
 * Styling configurations for Mapbox GL JS maps.
 * Includes layer styles, marker configurations, and cursor modes.
 *
 * @example
 * ```typescript
 * import {
 *   analysisAreaLayerConfig,
 *   markerColors,
 *   cursors,
 *   createMarkerOptions,
 * } from '@infrared/mapbox-theme';
 *
 * // Create a marker
 * const marker = new mapboxgl.Marker(createMarkerOptions());
 *
 * // Add analysis area layer
 * map.addLayer(analysisAreaLayerConfig);
 * ```
 */

// Cursor exports
export {
  applyCursorMode,
  // Types
  type CursorMode,
  cursorClasses,
  cursorHotspots,
  // Cursor values
  cursors,
  // CSS generation
  generateCursorCSS,
  getCursorClassForMode,
  // Helper functions
  getCursorForMode,
  setCursor,
} from './cursors'
// Layer exports
export {
  analysisAreaInteractionLayerConfig,
  // Layer configurations
  analysisAreaLayerConfig,
  buildingExtrusionLayerId,
  // Factory functions
  createAnalysisAreaLayerConfig,
  createFillLayerConfig,
  createLineLayerConfig,
  createSiteBoundaryLayerConfig,
  // Color constants
  layerColors,
  siteBoundaryLayerConfig,
} from './layers'
// Marker exports
export {
  applyMarkerCursor,
  // Factory functions
  createMarkerOptions,
  // Marker configurations
  defaultMarkerConfig,
  // Types
  type MarkerConfig,
  // Color constants
  markerColors,
  // Presets
  markerPresets,
  primaryMarkerConfig,
  staticMarkerConfig,
} from './markers'
