import booleanValid from '@turf/boolean-valid'
import { kinks } from '@turf/kinks'
import type { Feature, FeatureCollection, Polygon as GeoJSONPolygon } from 'geojson'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import {
  createAreaDrawLayer,
  emptyFeatureCollection,
  polygonToFeatureCollection,
} from './analysis.area-draw-layer'
import { useAnalysisStore } from './analysis.store'

/**
 * Subset of the editable-layer API the hook cares about — returned to the
 * plugin layers callback as `Layer | null`.
 */
type AreaDrawLayer = ReturnType<typeof createAreaDrawLayer>

/**
 * Validate a GeoJSON polygon with a belt-and-braces check:
 *
 *   1. `@turf/boolean-valid` enforces OGC simple-feature rules (ring
 *      closure, valid coordinates, winding).
 *   2. `@turf/kinks` catches self-intersections that some versions of
 *      `booleanValid` let through on polygons.
 *
 * `DrawPolygonMode` already rejects overlapping polygons before they ever
 * reach the `addFeature` path (it emits `invalidPolygon` instead), but we
 * still run both checks here because the hook is the single trust boundary
 * for "what gets written to the store" — a future library change, a
 * programmatically-created polygon, or a test fixture must not bypass the
 * guard.
 */
function isValidPolygon(polygon: GeoJSONPolygon): boolean {
  try {
    const feature: Feature<GeoJSONPolygon> = {
      type: 'Feature',
      properties: {},
      geometry: polygon,
    }
    if (!booleanValid(feature)) return false
    if (kinks(feature).features.length > 0) return false
    return true
  } catch {
    // Any turf throw (malformed coordinates, etc.) → treat as invalid.
    return false
  }
}

/**
 * Extract a `Polygon` geometry from an editable-layer `FeatureCollection`.
 * Returns `null` if the collection has no polygon feature — e.g. during
 * drawing when the tentative feature is a `LineString`.
 */
function extractPolygon(fc: FeatureCollection): GeoJSONPolygon | null {
  const feature = fc.features.find((f) => f.geometry?.type === 'Polygon')
  if (!feature) return null
  return feature.geometry as GeoJSONPolygon
}

/**
 * React hook that owns the in-progress feature collection for area-mode
 * polygon drawing and exposes a memoised `EditableGeoJsonLayer` instance
 * (or `null`) that the analysis plugin includes in its layer stack.
 *
 * Contract:
 *
 * - When `areaMode` is false → returns `null` (no draw UI).
 * - When `areaMode` is true and `areaPolygon` is null → returns a layer in
 *   `'draw'` mode. The user clicks vertices and double-clicks to finish.
 * - When `areaMode` is true and `areaPolygon` is non-null → returns a
 *   layer in `'view'` mode (read-only display of the stored polygon).
 *
 * - While the user is actively clicking vertices, `areaDrawing` is set to
 *   `true` (so the map route disables `doubleClickZoom`).
 * - On `addFeature` with a VALID polygon: writes it to the store via
 *   `setAreaPolygon`, clears the local feature collection, resets
 *   `areaDrawing` to false. Setting the polygon invalidates any prior run
 *   (see `analysis.store.ts` `setAreaPolygon`).
 * - On `addFeature` with an INVALID polygon (or on an `invalidPolygon` /
 *   `invalidHole` event): toasts a Sonner error, clears the local feature
 *   collection, resets `areaDrawing` to false, does NOT call
 *   `setAreaPolygon`.
 */
export function useAreaDrawLayer(): AreaDrawLayer | null {
  'use no memo' // editable-layer re-creates itself when `data` identity changes; we memoise manually
  const { areaMode, areaPolygon, setAreaPolygon, setAreaDrawing } = useAnalysisStore(
    useShallow((s) => ({
      areaMode: s.areaMode,
      areaPolygon: s.areaPolygon,
      setAreaPolygon: s.setAreaPolygon,
      setAreaDrawing: s.setAreaDrawing,
    })),
  )

  // Local in-progress feature collection. Starts empty every time the user
  // enters draw mode fresh. Once the user completes a polygon we clear this
  // back to empty and transition to view-mode (driven by `areaPolygon` being
  // non-null in the store).
  const [localFC, setLocalFC] = useState<FeatureCollection>(emptyFeatureCollection)

  // The mode the layer should render in. `areaPolygon` present → view mode
  // (show the stored polygon read-only); else → draw mode (interactive).
  const layerMode: 'draw' | 'view' = areaPolygon ? 'view' : 'draw'

  // Data flowing into the layer. In view mode we wrap the stored polygon in
  // a fresh FeatureCollection; in draw mode we use the local in-progress
  // collection.
  const layerData = useMemo<FeatureCollection>(
    () => (areaPolygon ? polygonToFeatureCollection(areaPolygon) : localFC),
    [areaPolygon, localFC],
  )

  const handleEdit = useCallback(
    ({ updatedData, editType }: { updatedData: FeatureCollection; editType: string }) => {
      // Terminal: polygon successfully finished (double-click or click
      // start vertex). We validate it ourselves one more time — the
      // library already rejects self-intersecting polygons with
      // `invalidPolygon` before reaching this path, but we do not trust
      // the library alone with what lands in the store.
      if (editType === 'addFeature') {
        const polygon = extractPolygon(updatedData)
        if (!polygon || !isValidPolygon(polygon)) {
          toast.error('Polygon is invalid — try again')
          setLocalFC(emptyFeatureCollection())
          setAreaDrawing(false)
          return
        }
        setAreaPolygon(polygon)
        setLocalFC(emptyFeatureCollection())
        setAreaDrawing(false)
        return
      }

      // Library-emitted invalid-polygon events (`invalidPolygon`,
      // `invalidHole`) — surface a toast and reset the local state so the
      // user can try again.
      if (editType === 'invalidPolygon' || editType === 'invalidHole') {
        toast.error('Polygon is invalid — try again')
        setLocalFC(emptyFeatureCollection())
        setAreaDrawing(false)
        return
      }

      // Escape key pressed mid-draw → library emits `cancelFeature`. We
      // simply clear the local state + drawing flag; no toast.
      if (editType === 'cancelFeature') {
        setLocalFC(emptyFeatureCollection())
        setAreaDrawing(false)
        return
      }

      // User clicked a vertex (or is actively drawing). Mirror the
      // updated collection locally and flip the drawing flag so the map
      // route can disable double-click zoom while the terminator fires.
      if (editType === 'addTentativePosition' || editType === 'addPosition') {
        setLocalFC(updatedData)
        setAreaDrawing(true)
        return
      }

      // Any other edit type — just mirror the local state. Do NOT touch
      // the drawing flag here: some events (pointer moves, cursor
      // updates) are harmless and must not flip the flag on/off.
      setLocalFC(updatedData)
    },
    [setAreaPolygon, setAreaDrawing],
  )

  // Memoise the layer instance. Keyed on everything the factory cares
  // about — if we rebuilt the layer on every render, deck.gl would lose
  // the editable layer's internal state (click sequence, tentative
  // feature) and the UX would flash.
  const layer = useMemo<AreaDrawLayer | null>(() => {
    if (!areaMode) return null
    return createAreaDrawLayer({ mode: layerMode, data: layerData, onEdit: handleEdit })
  }, [areaMode, layerMode, layerData, handleEdit])

  // Cleanup guard: force `areaDrawing` back to false and drop any
  // in-progress local feature collection whenever the hook stops
  // providing an interactive draw layer. Without this, a mid-draw
  // transition (user hits "Reset to world view", plugins unmount,
  // `areaMode` flips off, or ground-materials takes exclusive pointer
  // control and the draw layer disappears before a terminal
  // `addFeature`/`cancelFeature` event fires) would leave
  // `areaDrawing=true` stuck in the store, and the map route would
  // remain in "doubleClickZoom disabled" mode with no visible draw UI
  // to recover from. The effect also runs on full unmount via its
  // return value, covering the plugin-teardown path.
  useEffect(() => {
    if (areaMode && !areaPolygon) return // actively drawing — nothing to clean
    // Not in draw mode right now → make sure no stale drawing flag
    // leaks out. `setAreaDrawing(false)` is a no-op if already false,
    // so this is safe to run unconditionally here.
    if (useAnalysisStore.getState().areaDrawing) {
      setAreaDrawing(false)
    }
    setLocalFC(emptyFeatureCollection())
  }, [areaMode, areaPolygon, setAreaDrawing])

  useEffect(() => {
    return () => {
      // Full unmount (plugin torn down, route left). Always force the
      // drawing flag off so downstream consumers (map route's
      // `controllerOverride`) cannot be stranded in a disabled state.
      if (useAnalysisStore.getState().areaDrawing) {
        setAreaDrawing(false)
      }
    }
  }, [setAreaDrawing])

  return layer
}
