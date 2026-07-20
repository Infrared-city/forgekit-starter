/**
 * Mapbox Theme: Layer Configurations
 *
 * Standard layer paint and layout configurations for map visualizations.
 */

// ============================================
// Layer Colors
// ============================================

export const layerColors = {
  /** Analysis area fill color */
  analysisAreaFill: '#088',
  /** Site boundary line color */
  siteBoundaryLine: '#888',
  /** Interaction layer (invisible) */
  interactionFill: '#000000',
} as const

// ============================================
// Analysis Area Layer
// ============================================

export const analysisAreaLayerConfig = {
  /** Layer ID */
  id: 'area_analysis_layer_mapbox',
  /** Layer type */
  type: 'fill' as const,
  /** Paint properties */
  paint: {
    'fill-color': layerColors.analysisAreaFill,
    'fill-opacity': 0.3,
    'fill-z-offset': 1,
  },
  /** Layout properties */
  layout: {},
}

/**
 * Interaction layer for analysis area (invisible, for click handling)
 */
export const analysisAreaInteractionLayerConfig = {
  id: 'area_analysis_layer_mapbox_interaction',
  type: 'fill' as const,
  paint: {
    'fill-color': layerColors.interactionFill,
    'fill-opacity': 0,
    'fill-z-offset': 1,
  },
  layout: {},
}

// ============================================
// Site Boundary Layer
// ============================================

export const siteBoundaryLayerConfig = {
  /** Layer ID */
  id: 'area_site_layer_mapbox',
  /** Layer type */
  type: 'line' as const,
  /** Paint properties */
  paint: {
    'line-color': layerColors.siteBoundaryLine,
    'line-width': 5,
    'line-dasharray': [2, 2],
  },
  /** Layout properties */
  layout: {
    'line-join': 'round' as const,
    'line-cap': 'round' as const,
  },
}

// ============================================
// Building Extrusion Layer
// ============================================

export const buildingExtrusionLayerId = 'building-extrusion'

// ============================================
// Layer Factory Functions
// ============================================

/**
 * Create analysis area layer configuration
 */
export function createAnalysisAreaLayerConfig(
  sourceId: string,
  overrides?: Partial<typeof analysisAreaLayerConfig>,
) {
  return {
    ...analysisAreaLayerConfig,
    id: sourceId,
    source: sourceId,
    ...overrides,
  }
}

/**
 * Create site boundary layer configuration
 */
export function createSiteBoundaryLayerConfig(
  sourceId: string,
  overrides?: Partial<typeof siteBoundaryLayerConfig>,
) {
  return {
    ...siteBoundaryLayerConfig,
    id: sourceId,
    source: sourceId,
    ...overrides,
  }
}

/**
 * Create a fill layer configuration
 */
export function createFillLayerConfig(
  id: string,
  sourceId: string,
  color: string,
  opacity: number = 0.3,
) {
  return {
    id,
    type: 'fill' as const,
    source: sourceId,
    layout: {},
    paint: {
      'fill-color': color,
      'fill-opacity': opacity,
      'fill-z-offset': 1,
    },
  }
}

/**
 * Create a line layer configuration
 */
export function createLineLayerConfig(
  id: string,
  sourceId: string,
  options?: {
    color?: string
    width?: number
    dashArray?: number[]
  },
) {
  const { color = '#888', width = 2, dashArray } = options || {}

  return {
    id,
    type: 'line' as const,
    source: sourceId,
    layout: {
      'line-join': 'round' as const,
      'line-cap': 'round' as const,
    },
    paint: {
      'line-color': color,
      'line-width': width,
      ...(dashArray && { 'line-dasharray': dashArray }),
    },
  }
}
