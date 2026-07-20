/**
 * Mapbox Theme: Marker Configurations
 *
 * Standard marker styles and configurations.
 */

// ============================================
// Marker Colors
// ============================================

export const markerColors = {
  /** Default marker color (coral/orange-red) */
  default: '#FF5733',
  /** Primary marker color */
  primary: '#2B7C85',
  /** Selected marker color */
  selected: '#23E5E5',
  /** Error/warning marker color */
  warning: '#EF4444',
} as const

// ============================================
// Marker Configuration
// ============================================

export type MarkerConfig = {
  color: string
  draggable: boolean
  cursor: string
}

export const defaultMarkerConfig: MarkerConfig = {
  color: markerColors.default,
  draggable: true,
  cursor: 'grab',
}

export const primaryMarkerConfig: MarkerConfig = {
  color: markerColors.primary,
  draggable: true,
  cursor: 'grab',
}

export const staticMarkerConfig: MarkerConfig = {
  color: markerColors.default,
  draggable: false,
  cursor: 'pointer',
}

// ============================================
// Marker Factory
// ============================================

/**
 * Create marker options for mapboxgl.Marker
 */
export function createMarkerOptions(config: Partial<MarkerConfig> = {}) {
  const merged = { ...defaultMarkerConfig, ...config }
  return {
    color: merged.color,
    draggable: merged.draggable,
  }
}

/**
 * Apply cursor style to marker element
 */
export function applyMarkerCursor(markerElement: HTMLElement, cursor: string): void {
  markerElement.style.cursor = cursor
}

// ============================================
// Marker Presets
// ============================================

export const markerPresets = {
  default: defaultMarkerConfig,
  primary: primaryMarkerConfig,
  static: staticMarkerConfig,
  draggable: {
    color: markerColors.primary,
    draggable: true,
    cursor: 'grab',
  },
  fixed: {
    color: markerColors.default,
    draggable: false,
    cursor: 'default',
  },
} as const
