import { DrawPolygonMode, EditableGeoJsonLayer, ViewMode } from '@deck.gl-community/editable-layers'
import type { Feature, FeatureCollection, Polygon } from 'geojson'

/**
 * Pure factory that builds an `EditableGeoJsonLayer` for the area-mode
 * polygon draw UX. Stateless — does NOT read the analysis store or call any
 * hooks. The companion React hook (`useAreaDrawLayer`) owns all store reads
 * and calls this factory with the resolved options.
 *
 * Color palette note: the fill/line colors below are the sky-500 stroke used
 * by the rest of the area UI (see `analysis.area-draw-hook`'s legend). There
 * is no shared "draw overlay" token in the analysis color scales module
 * (`analysis.color-scales.ts` deals with analysis-result heatmaps, not
 * interaction UI), so the colors are defined inline here and kept in a
 * single place for future reuse.
 */
export interface AreaDrawLayerOptions {
  /** `'draw'` = interactive polygon drawing, `'view'` = read-only display. */
  mode: 'draw' | 'view'
  /** The current feature collection (tentative or completed polygon). */
  data: FeatureCollection
  /** Called by the editable layer on every edit event. */
  onEdit: (ctx: { updatedData: FeatureCollection; editType: string }) => void
}

// sky-500 with ~24% alpha fill / opaque stroke — matches the rest of the
// area-mode UI without introducing a new color token.
const AREA_DRAW_FILL: [number, number, number, number] = [14, 165, 233, 60]
const AREA_DRAW_STROKE: [number, number, number, number] = [14, 165, 233, 240]

/**
 * Build an `EditableGeoJsonLayer` for polygon drawing / display.
 *
 * - In `'draw'` mode the layer uses `DrawPolygonMode`, which emits
 *   `addTentativePosition` for each vertex click and `addFeature` on a
 *   successful polygon completion. Self-intersection detection is handled
 *   by the library (default `allowSelfIntersection = false`) AND by the
 *   hook's own `@turf/boolean-valid` + `@turf/kinks` belt-and-braces check
 *   on the returned polygon.
 * - In `'view'` mode the layer uses `ViewMode` — the vertices are no longer
 *   interactive, and the polygon is rendered read-only. `selectedFeatureIndexes`
 *   is undefined in view mode and `[]` in draw mode (the library requires an
 *   array when an edit mode is active).
 */
export function createAreaDrawLayer(opts: AreaDrawLayerOptions): EditableGeoJsonLayer {
  const isDraw = opts.mode === 'draw'
  return new EditableGeoJsonLayer({
    id: 'analysis-area-draw',
    data: opts.data,
    mode: isDraw ? DrawPolygonMode : ViewMode,
    selectedFeatureIndexes: isDraw ? [] : undefined,
    onEdit: ({ updatedData, editType }) => {
      opts.onEdit({ updatedData: updatedData as FeatureCollection, editType })
    },
    pickable: true,
    filled: true,
    stroked: true,
    getFillColor: AREA_DRAW_FILL,
    getLineColor: AREA_DRAW_STROKE,
    getTentativeFillColor: AREA_DRAW_FILL,
    getTentativeLineColor: AREA_DRAW_STROKE,
    getLineWidth: 2,
    getTentativeLineWidth: 2,
    lineWidthMinPixels: 2,
    lineWidthUnits: 'pixels',
    // Edit handle points — visible dots at each placed vertex + cursor guide
    editHandlePointRadiusMinPixels: 5,
    editHandlePointRadiusScale: 1,
    getEditHandlePointColor: [14, 165, 233, 255] as [number, number, number, number],
    editHandlePointOutline: true,
    editHandlePointStrokeWidth: 2,
    getEditHandlePointOutlineColor: [255, 255, 255, 255] as [number, number, number, number],
  })
}

/**
 * Build a `FeatureCollection` wrapping a single `Polygon` feature. Used by
 * the hook to wrap a store-owned polygon for display in view
 * mode, and as a small helper for tests.
 */
export function polygonToFeatureCollection(polygon: Polygon): FeatureCollection {
  const feature: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: polygon,
  }
  return {
    type: 'FeatureCollection',
    features: [feature],
  }
}

/** Empty feature collection — starting state for a fresh draw session. */
export function emptyFeatureCollection(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] }
}
