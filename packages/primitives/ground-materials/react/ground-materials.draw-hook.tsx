import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { kinks } from '@turf/kinks'
import type { Feature, FeatureCollection } from 'geojson'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ControlPosition } from 'react-map-gl'
import { useControl } from 'react-map-gl'
import {
  generateDrawStyles,
  loadMaterialPatterns,
  setDrawLayerVisibility,
} from '../core/ground-materials.draw-styles'
import type { GroundMaterialRegistry } from '../core/ground-materials.sdk-types'
import type { DrawModes } from '../core/ground-materials.types'
import { useGroundMaterialRegistry } from './ground-materials.api'
import { useGroundMaterialsStore } from './ground-materials.store'
import { buildFallbackWarning, resolvePerFeatureMaterials } from './ground-materials.utils'

// ---------------------------------------------------------------------------
// Module-level singleton refs -- shared across all useGroundMaterialsDraw() calls.
// There is exactly one MapboxDraw instance on the map; these refs give every
// consumer (MapCanvas, GroundMaterialsPanel, etc.) access to it.
//
// Vite HMR reloads the module (resetting these to null) but React preserves
// the mounted DrawControl component, so the MapboxDraw instance on the map
// is orphaned.  We carry the refs across reloads via import.meta.hot.data.
// ---------------------------------------------------------------------------
let _drawInstance: MapboxDraw | null = null
let _mapInstance: mapboxgl.Map | null = null

// Preserve draw/map refs across Vite HMR reloads
if (import.meta.hot) {
  if (import.meta.hot.data?._drawInstance) {
    _drawInstance = import.meta.hot.data._drawInstance
  }
  if (import.meta.hot.data?._mapInstance) {
    _mapInstance = import.meta.hot.data._mapInstance
  }
  import.meta.hot.dispose((data) => {
    data._drawInstance = _drawInstance
    data._mapInstance = _mapInstance
  })
}

/**
 * Returns the draw instance only if it's mounted and has valid internal state.
 * When MapboxDraw is removed from the map its onRemove destroys the internal
 * context -- the JS object is still truthy but every method throws.
 */
function safeDraw(): MapboxDraw | null {
  const draw = _drawInstance
  if (!draw) return null
  try {
    draw.getMode() // cheap probe -- throws if ctx was destroyed
    return draw
  } catch {
    return null
  }
}

/** Get the shared MapboxDraw instance (or null if not mounted yet). */
export function getDrawInstance(): MapboxDraw | null {
  return _drawInstance
}

/**
 * @internal Test-only seam.
 *
 * Injects a fake MapboxDraw instance so the public preview API
 * (`confirmPreviewFeaturesPerFeature`, `replaceAllWithPreview`) can be unit
 * tested without spinning up a full map. Pass `null` to clear. Not re-exported
 * from the package barrel and not part of the public surface -- production
 * code must never call this.
 */
export function _setDrawInstanceForTest(instance: MapboxDraw | null): void {
  _drawInstance = instance
}

/**
 * Check if a polygon feature has self-intersections using turf/kinks.
 */
function hasNoSelfIntersections(feature: Feature): boolean {
  try {
    const kinksResult = kinks(feature as Feature<GeoJSON.Polygon>)
    return kinksResult.features.length === 0
  } catch {
    return false
  }
}

/**
 * Props for the DrawControl component rendered by useControl.
 */
interface DrawControlProps {
  position?: ControlPosition
  registry: GroundMaterialRegistry | null
  visible: boolean
  onCreate?: (e: { features: Feature[] }) => void
  onUpdate?: (e: { features: Feature[]; action: string }) => void
  onDelete?: (e: { features: Feature[] }) => void
  onSelectionChange?: (e: { features: Feature[] }) => void
  onActionable?: (e: {
    actions: { trash: boolean; combineFeatures: boolean; uncombineFeatures: boolean }
  }) => void
  onModeChange?: (e: { mode: string }) => void
}

/**
 * DrawControl component that integrates MapboxDraw via react-map-gl's useControl hook.
 *
 * This approach handles the full lifecycle: creating the draw instance on mount,
 * wiring up events, and cleaning up on unmount. It avoids direct ref manipulation
 * and stale closure issues by reading state from the Zustand store directly.
 */
export function DrawControl(props: DrawControlProps) {
  'use no memo' // Opts out of React Compiler -- module-var writes during render (_drawInstance = ctrl)
  // Track THIS component's draw instance so we can safely handle cleanup
  // during remount cycles (old cleanup must not nullify new instance).
  const localDrawRef = useRef<MapboxDraw | null>(null)

  const ctrl = useControl<any>(
    () => {
      const styles = generateDrawStyles(props.registry)
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        styles,
        defaultMode: 'simple_select',
        userProperties: true,
      })
      // Do NOT assign localDrawRef or _drawInstance here.
      // React 18 StrictMode double-invokes useMemo -- only the first result
      // is kept.  The second call would overwrite refs with a ghost instance
      // that never gets added to the map.
      return draw
    },
    ({ map }) => {
      const mapboxMap = map.getMap() as mapboxgl.Map

      // Reassign module-level refs -- the old component's cleanup may have
      // nullified them between factory and onAdd during a remount cycle.
      _drawInstance = localDrawRef.current
      _mapInstance = mapboxMap

      // Load SVG patterns for material fills
      loadMaterialPatterns(mapboxMap)

      // Register event handlers
      map.on('draw.create', props.onCreate as any)
      map.on('draw.update', props.onUpdate as any)
      map.on('draw.delete', props.onDelete as any)
      map.on('draw.selectionchange', props.onSelectionChange as any)
      map.on('draw.actionable', props.onActionable as any)
      map.on('draw.modechange', props.onModeChange as any)

      // Hide draw layers initially if the ground materials toggle is off.
      // This runs AFTER MapboxDraw has added its layers to the map, fixing
      // the race condition where handleMapLoad fires before layers exist.
      if (!props.visible) {
        // Small delay to ensure MapboxDraw has finished adding all layers
        setTimeout(() => {
          setDrawLayerVisibility(mapboxMap, false)
        }, 100)
      }
    },
    ({ map }) => {
      // Cleanup event handlers
      map.off('draw.create', props.onCreate as any)
      map.off('draw.update', props.onUpdate as any)
      map.off('draw.delete', props.onDelete as any)
      map.off('draw.selectionchange', props.onSelectionChange as any)
      map.off('draw.actionable', props.onActionable as any)
      map.off('draw.modechange', props.onModeChange as any)

      // Only clear module-level refs if this is still the active instance.
      // During remounts, the new factory runs before old cleanup, so
      // _drawInstance already points to the new instance -- don't clear it.
      if (_drawInstance === localDrawRef.current) {
        _drawInstance = null
      }
      if (_mapInstance === map.getMap()) {
        _mapInstance = null
      }
    },
    {
      position: props.position ?? 'top-left',
    },
  )

  // Set refs AFTER useControl returns.  ctrl is the useMemo result (the
  // first factory invocation) -- the actual instance used by the map.
  // This is immune to StrictMode's double-invoke of useMemo.
  localDrawRef.current = ctrl as MapboxDraw
  _drawInstance = ctrl as MapboxDraw

  return null
}

/**
 * Hook that provides the full MapboxDraw integration for ground materials editing.
 *
 * Returns event handlers (pass to DrawControl in MapCanvas) and a public API
 * for managing draw features. Multiple components can call this hook -- they all
 * share the same MapboxDraw instance via module-level refs.
 *
 * The DrawControl component is imported and rendered directly in MapCanvas to
 * ensure stable component identity (no remount cycles).
 *
 * Event handlers read from Zustand store.getState() to avoid stale closure issues.
 */
export function useGroundMaterialsDraw() {
  'use no memo' // Opts out of React Compiler -- store reference used as value, not called as hook
  const { data: registry } = useGroundMaterialRegistry()

  const store = useGroundMaterialsStore

  // --- Event Handlers (use store.getState() to avoid stale closures) ---

  const handleCreate = useCallback((e: { features: Feature[] }) => {
    const state = store.getState()
    const currentMaterial = state.currentMaterial

    const featuresWithProperties = e.features.map((feature) => {
      const isValid = hasNoSelfIntersections(feature)
      return {
        ...feature,
        properties: {
          ...(feature.properties ?? {}),
          material: currentMaterial,
          invalid: !isValid,
        },
      }
    })

    // Update created features in store
    store.getState().addCreated(featuresWithProperties)

    // Re-add features with properties to MapboxDraw
    // (MapboxDraw does not auto-apply custom properties on create)
    const draw = safeDraw()
    if (!draw) return

    featuresWithProperties.forEach((feature) => {
      if (!feature.id) return
      const id = String(feature.id)
      const currentFeature = draw.get(id)
      if (!currentFeature) return

      // Use setFeatureProperty to update in-place (preserves feature ID)
      if (feature.properties) {
        Object.entries(feature.properties).forEach(([key, value]) => {
          draw.setFeatureProperty(id, key, value)
        })
      }
      // Force MapboxDraw to re-render the feature (workaround for mapbox-gl-draw#878)
      const updated = draw.get(id)
      if (updated) draw.add(updated)
    })
  }, [])

  const handleUpdate = useCallback((e: { features: Feature[]; action: string }) => {
    const state = store.getState()
    const createdIds = new Set(state.lastCreatedFeatures.map((f) => String(f.id)))

    const updatedCreated = e.features.filter((f) => createdIds.has(String(f.id)))
    const updatedExisting = e.features.filter((f) => !createdIds.has(String(f.id)))

    if (updatedExisting.length > 0) {
      store.getState().addUpdated(updatedExisting)
    }

    // Also update created features in-place if they were modified
    if (updatedCreated.length > 0) {
      const currentState = store.getState()
      const updatedCreatedList = currentState.lastCreatedFeatures.map((created) => {
        const updated = updatedCreated.find((u) => String(u.id) === String(created.id))
        return updated || created
      })
      useGroundMaterialsStore.setState({ lastCreatedFeatures: updatedCreatedList })
    }
  }, [])

  const handleDelete = useCallback((e: { features: Feature[] }) => {
    const state = store.getState()
    const createdIds = new Set(state.lastCreatedFeatures.map((f) => String(f.id)))
    const deletedIds = new Set(
      e.features.map((f) => String(f.id)).filter((id) => id !== 'undefined'),
    )

    // Only track as "deleted" if the feature existed before this session
    const actuallyDeletedFeatures = e.features.filter((f) => !createdIds.has(String(f.id)))

    if (actuallyDeletedFeatures.length > 0) {
      store.getState().addDeleted(actuallyDeletedFeatures)
    }

    // Clean up created/updated lists
    const currentState = store.getState()
    useGroundMaterialsStore.setState({
      lastCreatedFeatures: currentState.lastCreatedFeatures.filter(
        (f) => !deletedIds.has(String(f.id)),
      ),
      lastUpdatedFeatures: currentState.lastUpdatedFeatures.filter(
        (f) => !deletedIds.has(String(f.id)),
      ),
      selectedFeatures: [],
    })
  }, [])

  const handleSelectionChange = useCallback((e: { features: Feature[] }) => {
    store.getState().setSelectedFeatures(e.features)
  }, [])

  const handleActionable = useCallback(
    (e: { actions: { trash: boolean; combineFeatures: boolean; uncombineFeatures: boolean } }) => {
      useGroundMaterialsStore.setState({ actionableState: e.actions.trash })
    },
    [],
  )

  const handleModeChange = useCallback((e: { mode: string }) => {
    store.getState().setMode(e.mode as DrawModes)
  }, [])

  // --- Public API ---

  const addFeatures = useCallback(
    (featureCollections: Record<string, FeatureCollection>) => {
      const draw = safeDraw()
      if (!draw) {
        return
      }
      draw.deleteAll()

      // Build UUID -> material name lookup from registry
      const uuidToName = new Map<string, string>()
      if (registry?.materials) {
        Object.values(registry.materials).forEach((mat) => {
          uuidToName.set(mat.uuid, mat.name)
        })
      }

      Object.entries(featureCollections).forEach(([key, fc]) => {
        // key may be a UUID or a material name; resolve to name for draw styling
        const materialName = uuidToName.get(key) ?? key
        const featureCount = fc.features?.length ?? 0

        if (featureCount === 0) return

        const annotated: FeatureCollection = {
          ...fc,
          features: fc.features.map((f) => ({
            ...f,
            properties: { ...(f.properties ?? {}), material: materialName },
          })),
        }
        draw.add(annotated)
      })
    },
    [registry],
  )

  const restoreAll = useCallback(
    (featureCollections: Record<string, FeatureCollection>) => {
      store.getState().resetSession()
      addFeatures(featureCollections)
    },
    [addFeatures],
  )

  const changeMode = useCallback((mode: DrawModes, options?: Record<string, unknown>) => {
    const draw = safeDraw()
    if (!draw) return
    store.getState().setMode(mode)
    draw.changeMode(mode as never, options)
  }, [])

  const setMaterial = useCallback((material: string) => {
    store.getState().setMaterial(material)

    // Also update selected features with the new material
    const state = store.getState()
    const draw = safeDraw()
    if (!draw || state.selectedFeatures.length === 0) return
    if (state.currentMode !== 'simple_select' && state.currentMode !== 'direct_select') return

    const updatedFeatures: Feature[] = []
    state.selectedFeatures.forEach((feature) => {
      if (!feature.id) return
      const id = String(feature.id)
      const current = draw.get(id)
      if (!current) return

      // Use setFeatureProperty to update in-place (preserves feature ID and selection)
      draw.setFeatureProperty(id, 'material', material)
      // Force MapboxDraw to re-render the feature (workaround for mapbox-gl-draw#878)
      const updated = draw.get(id)
      if (updated) {
        draw.add(updated)
        updatedFeatures.push(updated)
      }
    })

    // Manually update the store's selectedFeatures since suppressAPIEvents
    // prevents MapboxDraw from firing selectionchange after programmatic changes
    if (updatedFeatures.length > 0) {
      useGroundMaterialsStore.setState({ selectedFeatures: updatedFeatures })
    }
  }, [])

  const deleteFeatures = useCallback((featureIds: string[]) => {
    const draw = safeDraw()
    if (!draw || featureIds.length === 0) return

    const toDelete = featureIds
      .map((id) => draw.get(id))
      .filter((f): f is Feature => f !== undefined)

    draw.delete(featureIds)

    const state = store.getState()
    const createdIds = new Set(state.lastCreatedFeatures.map((f) => String(f.id)))
    const deletedIdsSet = new Set(featureIds)

    const actuallyDeleted = toDelete.filter((f) => !createdIds.has(String(f.id)))

    if (actuallyDeleted.length > 0) {
      store.getState().addDeleted(actuallyDeleted)
    }

    useGroundMaterialsStore.setState({
      selectedFeatures: state.selectedFeatures.filter((f) => !deletedIdsSet.has(String(f.id))),
      lastCreatedFeatures: state.lastCreatedFeatures.filter(
        (f) => !deletedIdsSet.has(String(f.id)),
      ),
      lastUpdatedFeatures: state.lastUpdatedFeatures.filter(
        (f) => !deletedIdsSet.has(String(f.id)),
      ),
    })
  }, [])

  const deleteAllSelected = useCallback(() => {
    const state = store.getState()
    const ids = state.selectedFeatures
      .map((f) => f.id)
      .filter((id): id is string | number => id !== undefined)
      .map(String)
    deleteFeatures(ids)
  }, [deleteFeatures])

  const getAllFeatures = useCallback((): FeatureCollection | null => {
    const draw = safeDraw()
    if (!draw) return null
    return draw.getAll() ?? null
  }, [])

  /**
   * Add features to MapboxDraw as import previews WITHOUT calling deleteAll().
   * Each feature gets a `preview: true` property for distinct styling.
   * Returns the IDs assigned by MapboxDraw.
   */
  const addPreviewFeatures = useCallback((features: Feature[]): string[] => {
    const draw = safeDraw()
    if (!draw) return []

    const ids: string[] = []
    for (const feature of features) {
      // Add each feature individually -- draw.add() returns an array of IDs
      const addedIds = draw.add({
        ...feature,
        properties: {
          ...(feature.properties ?? {}),
          preview: true,
        },
      } as Feature)

      if (addedIds.length > 0) {
        const id = addedIds[0]
        ids.push(id)

        // Force style by setting property and re-adding
        draw.setFeatureProperty(id, 'preview', true)
        const updated = draw.get(id)
        if (updated) draw.add(updated)
      }
    }

    return ids
  }, [])

  /**
   * Confirm preview features by stamping a material name, removing the
   * preview flag, and registering them as created in the store.
   */
  const confirmPreviewFeatures = useCallback((materialName: string, ids: string[]) => {
    const draw = safeDraw()
    if (!draw) return

    const confirmedFeatures: Feature[] = []
    for (const id of ids) {
      const current = draw.get(id)
      if (!current) continue

      // Stamp material, remove preview flag
      draw.setFeatureProperty(id, 'material', materialName)
      draw.setFeatureProperty(id, 'preview', undefined)

      // Force MapboxDraw to re-render (workaround for mapbox-gl-draw#878)
      const updated = draw.get(id)
      if (updated) {
        draw.add(updated)
        confirmedFeatures.push(updated)
      }
    }

    // Register confirmed features as created in the store
    if (confirmedFeatures.length > 0) {
      store.getState().addCreated(confirmedFeatures)
    }
  }, [])

  /**
   * Per-feature variant of {@link confirmPreviewFeatures}.
   *
   * Reads each preview feature's `properties.material` and routes it to the
   * matching registry material. Unknown / missing labels fall back to the
   * panel's currently-selected material; if that is also unset, the package
   * default (`'asphalt'`) is used. When any fallback occurred the returned
   * `warning` is a single aggregated message the caller can surface (toast,
   * store, etc.) -- this hook does not depend on a toast library directly.
   *
   * Returns the list of feature IDs that were successfully confirmed plus the
   * optional aggregated warning string.
   */
  const confirmPreviewFeaturesPerFeature = useCallback(
    (ids: string[]): { ids: string[]; warning: string | null } => {
      const draw = safeDraw()
      if (!draw) return { ids: [], warning: null }

      // Pull the live preview features from MapboxDraw to read their
      // verbatim properties (set by addPreviewFeatures).
      const previewFeatures: Feature[] = []
      for (const id of ids) {
        const f = draw.get(id)
        if (f) previewFeatures.push(f)
      }

      const resolution = resolvePerFeatureMaterials(
        previewFeatures,
        registry ?? null,
        store.getState().currentMaterial,
      )

      const confirmedFeatures: Feature[] = []
      const confirmedIds: string[] = []
      for (const { id, materialName } of resolution.assignments) {
        if (!draw.get(id)) continue
        draw.setFeatureProperty(id, 'material', materialName)
        draw.setFeatureProperty(id, 'preview', undefined)
        const updated = draw.get(id)
        if (updated) {
          draw.add(updated)
          confirmedFeatures.push(updated)
          confirmedIds.push(id)
        }
      }

      if (confirmedFeatures.length > 0) {
        store.getState().addCreated(confirmedFeatures)
      }

      return { ids: confirmedIds, warning: buildFallbackWarning(resolution) }
    },
    [registry],
  )

  /**
   * Replace-mode helper: wipe every existing draw feature (excluding the
   * preview features in `ids`) and then commit those previews under a global
   * material (`materialFor: 'global'`) or per-feature labels
   * (`materialFor: 'per-feature'`).
   *
   * All store writes (wiped deletes + new creates) are issued in a single
   * `setState` call so React renders the result in one batch -- no
   * intermediate state in which the draw layer is empty, and no double
   * render between the delete and the commit.
   *
   * Returns the confirmed feature IDs plus an optional aggregated warning
   * (per-feature mode only) the caller can toast.
   */
  const replaceAllWithPreview = useCallback(
    (
      ids: string[],
      materialFor: 'global' | 'per-feature',
      materialName?: string,
    ): { ids: string[]; warning: string | null } => {
      const draw = safeDraw()
      if (!draw) return { ids: [], warning: null }

      // 1. Enumerate every existing feature that is NOT one of the previews
      //    we are about to commit.
      const previewIdSet = new Set(ids)
      const allBefore = draw.getAll()
      const existing: Feature[] = []
      for (const f of allBefore.features) {
        if (f.id === undefined || f.id === null) continue
        if (previewIdSet.has(String(f.id))) continue
        existing.push(f as Feature)
      }
      const existingIds = existing.map((f) => String(f.id))

      // 2. Delete pre-existing features from MapboxDraw FIRST so the commit
      //    step below sees a clean board.
      if (existingIds.length > 0) {
        draw.delete(existingIds)
      }

      // 3. Stamp the preview features. We deliberately do NOT call into the
      //    other confirm helpers -- they each issue their own store writes,
      //    which would split this into two React renders.
      const confirmedFeatures: Feature[] = []
      const confirmedIds: string[] = []
      let fallbackWarning: string | null = null

      const stampFeature = (id: string, name: string) => {
        if (!draw.get(id)) return
        draw.setFeatureProperty(id, 'material', name)
        draw.setFeatureProperty(id, 'preview', undefined)
        const updated = draw.get(id)
        if (updated) {
          draw.add(updated)
          confirmedFeatures.push(updated)
          confirmedIds.push(id)
        }
      }

      if (materialFor === 'global') {
        const name = materialName ?? store.getState().currentMaterial ?? 'asphalt'
        for (const id of ids) stampFeature(id, name)
      } else {
        const previewFeatures: Feature[] = []
        for (const id of ids) {
          const f = draw.get(id)
          if (f) previewFeatures.push(f)
        }
        const resolution = resolvePerFeatureMaterials(
          previewFeatures,
          registry ?? null,
          store.getState().currentMaterial,
        )
        for (const { id, materialName: name } of resolution.assignments) {
          stampFeature(id, name)
        }
        fallbackWarning = buildFallbackWarning(resolution)
      }

      // 4. Single store transaction: mirror `deleteFeatures` semantics for the
      //    wipe (only mark as "deleted" features that pre-existed the session)
      //    AND register the newly confirmed features -- in one setState call.
      const wipedIdSet = new Set(existingIds)
      const createdIdSet = new Set(store.getState().lastCreatedFeatures.map((f) => String(f.id)))
      const actuallyDeleted = existing.filter((f) => !createdIdSet.has(String(f.id)))

      useGroundMaterialsStore.setState((prev) => ({
        lastCreatedFeatures: [
          ...prev.lastCreatedFeatures.filter((f) => !wipedIdSet.has(String(f.id))),
          ...confirmedFeatures,
        ],
        lastUpdatedFeatures: prev.lastUpdatedFeatures.filter((f) => !wipedIdSet.has(String(f.id))),
        lastDeletedFeatures: [...prev.lastDeletedFeatures, ...actuallyDeleted],
        selectedFeatures: prev.selectedFeatures.filter((f) => !wipedIdSet.has(String(f.id))),
        actionableState: true,
        isEditing: true,
      }))

      return { ids: confirmedIds, warning: fallbackWarning }
    },
    [registry],
  )

  /**
   * Remove preview features from MapboxDraw without affecting other features.
   */
  const clearPreviewFeatures = useCallback((ids: string[]) => {
    const draw = safeDraw()
    if (!draw || ids.length === 0) return
    draw.delete(ids)
  }, [])

  const setAsphaltLanes = useCallback((lanes: string) => {
    const state = store.getState()
    const draw = safeDraw()
    if (!draw || state.selectedFeatures.length === 0) return

    const updatedFeatures: Feature[] = []
    state.selectedFeatures.forEach((feature) => {
      if (!feature.id) return
      const id = String(feature.id)
      const current = draw.get(id)
      if (!current) return

      // Use setFeatureProperty to update in-place (preserves feature ID and selection)
      draw.setFeatureProperty(id, 'lanes', lanes)
      // Force MapboxDraw to re-render the feature (workaround for mapbox-gl-draw#878)
      const updated = draw.get(id)
      if (updated) {
        draw.add(updated)
        updatedFeatures.push(updated)
      }
    })

    // Manually update the store's selectedFeatures since suppressAPIEvents
    // prevents MapboxDraw from firing selectionchange after programmatic changes
    if (updatedFeatures.length > 0) {
      useGroundMaterialsStore.setState({ selectedFeatures: updatedFeatures })
    }
  }, [])

  // --- Keyboard handling (Escape cancels drawing, Delete removes selected) ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const state = store.getState()
      const draw = safeDraw()
      if (!draw) return

      if (e.key === 'Escape' && state.currentMode === 'draw_polygon') {
        e.preventDefault()
        draw.trash()
        // Restart draw mode after a tick
        setTimeout(() => changeMode('draw_polygon'), 0)
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedFeatures.length > 0 && state.currentMode === 'simple_select') {
          e.preventDefault()
          deleteAllSelected()
        }
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      const state = store.getState()
      if (state.currentMode === 'draw_polygon') {
        e.preventDefault()
        const draw = safeDraw()
        if (!draw) return
        draw.trash()
        setTimeout(() => changeMode('draw_polygon'), 0)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [changeMode, deleteAllSelected])

  // --- Visibility management ---

  const setVisible = useCallback((visible: boolean) => {
    const map = _mapInstance
    if (!map) return
    setDrawLayerVisibility(map, visible)
    if (visible) {
      const draw = safeDraw()
      if (draw) draw.changeMode('simple_select')
    }
  }, [])

  // Memoize the return object so consumers (plugin.tsx → composition root →
  // context) get a stable reference. Every entry is a `useCallback` (stable
  // identity), so the only churn was the literal wrapper itself.
  return useMemo(
    () => ({
      // Event handlers -- pass to DrawControl in MapCanvas
      handleCreate,
      handleUpdate,
      handleDelete,
      handleSelectionChange,
      handleActionable,
      handleModeChange,
      // Public API
      addFeatures,
      restoreAll,
      changeMode,
      setMaterial,
      deleteFeatures,
      deleteAllSelected,
      getAllFeatures,
      setAsphaltLanes,
      setVisible,
      // Import preview API
      addPreviewFeatures,
      confirmPreviewFeatures,
      confirmPreviewFeaturesPerFeature,
      replaceAllWithPreview,
      clearPreviewFeatures,
    }),
    [
      handleCreate,
      handleUpdate,
      handleDelete,
      handleSelectionChange,
      handleActionable,
      handleModeChange,
      addFeatures,
      restoreAll,
      changeMode,
      setMaterial,
      deleteFeatures,
      deleteAllSelected,
      getAllFeatures,
      setAsphaltLanes,
      setVisible,
      addPreviewFeatures,
      confirmPreviewFeatures,
      confirmPreviewFeaturesPerFeature,
      replaceAllWithPreview,
      clearPreviewFeatures,
    ],
  )
}
