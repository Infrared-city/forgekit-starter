/**
 * Mapbox Theme: Custom Cursors
 *
 * Cursor configurations for different map interaction modes.
 */

// ============================================
// Cursor Mode Types
// ============================================

export type CursorMode = 'default' | 'draw' | 'edit' | 'zoom'

// ============================================
// Custom Cursor Definitions
// ============================================

/**
 * Custom cursor configurations with SVG icons
 * Format: url("path") hotspot-x hotspot-y, fallback
 */
export const cursors = {
  /** Default cursor */
  default: 'default',
  /** Draw mode cursor (pen icon) */
  draw: 'url("/pen.svg") 12 15, crosshair',
  /** Edit mode cursor (move icon) */
  edit: 'url("/move.svg") 12 15, all-scroll',
  /** Zoom mode cursor (plus icon) */
  zoom: 'url("/plus.svg") 12 15, crosshair',
} as const

/**
 * Hotspot positions for custom cursors
 * [x, y] coordinates where the cursor "clicks"
 */
export const cursorHotspots = {
  draw: [12, 15] as [number, number],
  edit: [12, 15] as [number, number],
  zoom: [12, 15] as [number, number],
} as const

// ============================================
// CSS Classes for Cursor Modes
// ============================================

export const cursorClasses = {
  default: 'mapboxgl-canvas-container',
  draw: 'draw-mode',
  edit: 'edit-mode',
  zoom: 'zoom-mode',
} as const

// ============================================
// CSS Generation
// ============================================

/**
 * Generate CSS for custom cursor modes
 */
export function generateCursorCSS(): string {
  return `
/* Mapbox canvas cursor defaults */
.mapboxgl-canvas-container.mapboxgl-interactive,
.mapboxgl-canvas-container.mapboxgl-interactive:active {
  cursor: default;
}

/* Draw mode cursor */
.mapboxgl-canvas-container.draw-mode {
  cursor: ${cursors.draw} !important;
}

/* Edit mode cursor */
.mapboxgl-canvas-container.edit-mode {
  cursor: ${cursors.edit} !important;
}

/* Zoom mode cursor */
.mapboxgl-canvas-container.zoom-mode {
  cursor: ${cursors.zoom} !important;
}
`.trim()
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get cursor CSS value for a mode
 */
export function getCursorForMode(mode: CursorMode): string {
  return cursors[mode]
}

/**
 * Get CSS class for a cursor mode
 */
export function getCursorClassForMode(mode: CursorMode): string {
  return cursorClasses[mode]
}

/**
 * Apply cursor mode to map canvas container
 */
export function applyCursorMode(canvasContainer: HTMLElement, mode: CursorMode): void {
  // Remove all cursor mode classes
  Object.values(cursorClasses).forEach((className) => {
    if (className !== 'mapboxgl-canvas-container') {
      canvasContainer.classList.remove(className)
    }
  })

  // Add the new cursor mode class
  if (mode !== 'default') {
    canvasContainer.classList.add(cursorClasses[mode])
  }
}

/**
 * Set cursor directly on element
 */
export function setCursor(element: HTMLElement, mode: CursorMode): void {
  element.style.cursor = cursors[mode]
}
