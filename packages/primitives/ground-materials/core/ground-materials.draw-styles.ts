import type { GroundMaterialRegistry } from './ground-materials.sdk-types'

/**
 * Convert RGB [0-1] array to hex string.
 */
export function rgbToHex(rgb: number[]): string {
  const r = Math.round(rgb[0] * 255)
  const g = Math.round(rgb[1] * 255)
  const b = Math.round(rgb[2] * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Darken a hex color by a percentage (0-1).
 */
export function darkenColor(hex: string, percent: number = 0.3): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `#${Math.round(r * (1 - percent))
    .toString(16)
    .padStart(2, '0')}${Math.round(g * (1 - percent))
    .toString(16)
    .padStart(2, '0')}${Math.round(b * (1 - percent))
    .toString(16)
    .padStart(2, '0')}`
}

/**
 * Generate MapboxDraw style array from material registry.
 *
 * For each material: solid color fill (semi-transparent diffuseColor)
 * and dashed stroke (darkened color).
 * Plus special styles for invalid polygons, no-material default,
 * active drawing, vertices, and midpoints.
 *
 * Note: `userProperties: true` must be set on the MapboxDraw constructor
 * so that custom properties are prefixed with `user_` in style filters.
 */
export function generateDrawStyles(registry: GroundMaterialRegistry | null) {
  const materialStyles: Record<string, unknown>[] = []

  if (registry?.materials) {
    Object.values(registry.materials).forEach((material) => {
      const baseColor = rgbToHex(material.diffuseColor)
      const strokeColor = darkenColor(baseColor, 0.3)
      const materialName = material.name

      // Solid color fill
      materialStyles.push({
        id: `gl-draw-polygon-fill-${materialName}`,
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_material', materialName]],
        paint: { 'fill-color': baseColor, 'fill-opacity': 0.5 },
      })

      // Stroke - dashed outline in darkened color
      materialStyles.push({
        id: `gl-draw-polygon-stroke-${materialName}`,
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_material', materialName]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': strokeColor, 'line-dasharray': [2, 2], 'line-width': 2 },
      })

      // LineString style
      materialStyles.push({
        id: `gl-draw-line-${materialName}`,
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'user_material', materialName]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': strokeColor,
          'line-width':
            materialName === 'asphalt'
              ? [
                  'case',
                  ['all', ['has', 'user_lanes'], ['>', ['to-number', ['get', 'user_lanes'], 0], 0]],
                  ['*', ['to-number', ['get', 'user_lanes'], 1], 2.5],
                  12,
                ]
              : 6,
        },
      })
    })
  }

  // Import preview style — dashed border, semi-transparent gray fill
  // Placed before invalid/default so that `user_preview` takes precedence
  materialStyles.push(
    {
      id: 'gl-draw-polygon-fill-preview',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_preview', true]],
      paint: { 'fill-color': '#6B7280', 'fill-opacity': 0.3 },
    },
    {
      id: 'gl-draw-polygon-stroke-preview',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_preview', true]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#6B7280', 'line-dasharray': [4, 4], 'line-width': 2 },
    },
  )

  // Invalid polygon style (self-intersecting) - RED
  materialStyles.push(
    {
      id: 'gl-draw-polygon-fill-invalid',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_invalid', true]],
      paint: { 'fill-color': '#FF0000', 'fill-opacity': 0.5 },
    },
    {
      id: 'gl-draw-polygon-stroke-invalid',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'user_invalid', true]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF0000', 'line-width': 3 },
    },

    // Default polygon (no material assigned) - DARK RED
    {
      id: 'gl-draw-polygon-fill-default',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['!has', 'user_material']],
      paint: { 'fill-color': '#D20C0C', 'fill-opacity': 0.4 },
    },
    {
      id: 'gl-draw-polygon-stroke-default',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['!has', 'user_material']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#D20C0C', 'line-dasharray': [2, 2], 'line-width': 2 },
    },

    // Default LineString
    {
      id: 'gl-draw-line-default',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['!has', 'user_material']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#D20C0C', 'line-width': 3 },
    },

    // Active polygon being drawn - YELLOW
    {
      id: 'gl-draw-polygon-fill-active',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
      paint: { 'fill-color': '#fbb03b', 'fill-opacity': 0.4 },
    },
    {
      id: 'gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#fbb03b', 'line-dasharray': [0.2, 2], 'line-width': 2 },
    },

    // Active LineString
    {
      id: 'gl-draw-line-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#fbb03b', 'line-width': 3 },
    },

    // Midpoints (orange dots for adding vertices)
    {
      id: 'gl-draw-polygon-midpoint',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
      paint: { 'circle-radius': 3, 'circle-color': '#fbb03b' },
    },

    // Vertex halos (white background circle)
    {
      id: 'gl-draw-polygon-and-line-vertex-halo-active',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      paint: { 'circle-radius': 5, 'circle-color': '#FFF' },
    },

    // Vertex points (orange dots)
    {
      id: 'gl-draw-polygon-and-line-vertex-active',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      paint: { 'circle-radius': 3, 'circle-color': '#fbb03b' },
    },
  )

  return materialStyles
}

/**
 * Material names for pattern loading and layer visibility toggling.
 */
const MATERIAL_NAMES = ['vegetation', 'concrete', 'water', 'soil', 'asphalt']

/**
 * Load SVG pattern images into the Mapbox map for material fill patterns.
 * Uses HTMLImageElement to decode SVGs (map.loadImage doesn't support SVGs).
 */
export async function loadMaterialPatterns(map: mapboxgl.Map): Promise<void> {
  const patterns = MATERIAL_NAMES.map((name) => ({
    name: `${name}-pattern`,
    url: `/patterns/${name}-pattern.svg`,
  }))

  for (const pattern of patterns) {
    if (map.hasImage(pattern.name)) continue
    try {
      const image = new Image(8, 8)
      image.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = reject
        image.src = pattern.url
      })

      if (!map.hasImage(pattern.name)) {
        map.addImage(pattern.name, image)
      }
    } catch (error) {
      console.warn(`Failed to load pattern ${pattern.name}:`, error)
    }
  }
}

/**
 * Set the visibility of all MapboxDraw layers.
 * MapboxDraw creates `.cold` (static) and `.hot` (interactive) variants of each layer.
 */
export function setDrawLayerVisibility(map: mapboxgl.Map, visible: boolean): void {
  const drawLayerIds = [
    // Per-material custom layers
    ...MATERIAL_NAMES.flatMap((name) => [
      `gl-draw-polygon-fill-${name}.cold`,
      `gl-draw-polygon-fill-${name}.hot`,
      `gl-draw-polygon-stroke-${name}.cold`,
      `gl-draw-polygon-stroke-${name}.hot`,
      `gl-draw-line-${name}.cold`,
      `gl-draw-line-${name}.hot`,
    ]),
    // Import preview layers
    'gl-draw-polygon-fill-preview.cold',
    'gl-draw-polygon-fill-preview.hot',
    'gl-draw-polygon-stroke-preview.cold',
    'gl-draw-polygon-stroke-preview.hot',
    // Invalid polygon layers
    'gl-draw-polygon-fill-invalid.cold',
    'gl-draw-polygon-fill-invalid.hot',
    'gl-draw-polygon-stroke-invalid.cold',
    'gl-draw-polygon-stroke-invalid.hot',
    // Default style layers (no material assigned)
    'gl-draw-polygon-fill-default.cold',
    'gl-draw-polygon-fill-default.hot',
    'gl-draw-polygon-stroke-default.cold',
    'gl-draw-polygon-stroke-default.hot',
    'gl-draw-line-default.cold',
    'gl-draw-line-default.hot',
    // Active drawing layers
    'gl-draw-polygon-fill-active.cold',
    'gl-draw-polygon-fill-active.hot',
    'gl-draw-polygon-stroke-active.cold',
    'gl-draw-polygon-stroke-active.hot',
    'gl-draw-line-active.cold',
    'gl-draw-line-active.hot',
    // Midpoint and vertex layers
    'gl-draw-polygon-midpoint.cold',
    'gl-draw-polygon-midpoint.hot',
    'gl-draw-polygon-and-line-vertex-halo-active.cold',
    'gl-draw-polygon-and-line-vertex-halo-active.hot',
    'gl-draw-polygon-and-line-vertex-active.cold',
    'gl-draw-polygon-and-line-vertex-active.hot',
  ]

  const visibility = visible ? 'visible' : 'none'
  drawLayerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility)
    }
  })
}
