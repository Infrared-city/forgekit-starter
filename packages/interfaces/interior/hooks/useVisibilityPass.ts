import { useEffect, useRef } from 'react'
import { shallow } from 'zustand/shallow'
import {
  EXTERIOR_WALLS_KEY,
  GHOST_OPACITY,
  IFC_CATEGORIES,
  INTERIOR_WALLS_KEY,
  WALL_CATEGORY_KEYS,
} from '../interior.constants'
import { useInteriorStore } from '../interior.store'
import type { SceneRefs } from '../interior.types'
import { applyZFightingFixes } from './useIfcImport'

/**
 * useVisibilityPass -- unified visibility subscription that applies floor isolation,
 * wall classification, category filters, and ghost opacity to the loaded IFC model.
 *
 * Subscribes to Zustand store (not React rendering) using [] deps -- runs once,
 * subscribes to store changes manually (Vercel `advanced-init-once`).
 * Uses getState() inside callbacks, not component-level selectors
 * (Vercel `rerender-functional-setstate`).
 * Does NOT use startTransition for imperative Three.js operations.
 *
 * Visibility precedence: floor > wall classification > category > ghost (opacity).
 * Ghost elements remain visible at 15% opacity -- ghosting is NOT a visibility filter.
 */
export function useVisibilityPass(sceneRefs: SceneRefs): void {
  'use no memo' // Opts out of React Compiler -- value blocks in try/catch not supported by compiler
  const {
    currentModel: currentModelRef,
    fragments: fragmentsRef,
    disposed: disposedRef,
    needsRender: needsRenderRef,
    continuousRenderUntil: continuousRenderUntilRef,
  } = sceneRefs

  // Ref for previous computed visibility state -- enables diffing to minimize
  // setVisible()/setOpacity() calls (Vercel `rerender-use-ref-transient-values`).
  const prevVisibilityRef = useRef<Map<number, { visible: boolean; opacity: number }>>(new Map())

  // Generation counter ref to prevent stale async operations from applying
  const visibilityGenRef = useRef(0)

  // Cache for category -> localId[] mappings (built once per model, invalidated on model change)
  const categoryIdsCacheRef = useRef<Map<string, number[]>>(new Map())
  const categoryIdsCacheVersionRef = useRef(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs from useSceneSetup -- they never change identity
  useEffect(() => {
    /**
     * Unified visibility pass: computes visibility and opacity for all elements
     * based on floor isolation, wall classification, category filters, and ghost state.
     *
     * Layer 1 -- Visibility (binary show/hide):
     *   visible = floorAllows(id) AND categoryAllows(id) AND wallFilterAllows(id)
     *
     * Layer 2 -- Opacity (ghost):
     *   For visible + ghosted elements: 15% opacity
     *   For visible + non-ghosted elements: 1.0 opacity
     */
    async function applyVisibility() {
      const model = currentModelRef.current
      if (!model || disposedRef.current) return

      // Bump generation -- any in-flight pass with a stale generation will bail
      visibilityGenRef.current += 1
      const myGen = visibilityGenRef.current

      function isStale(): boolean {
        return disposedRef.current || visibilityGenRef.current !== myGen
      }

      const {
        selectedFloor,
        categoryFilters,
        ghostedIds,
        wallClassification,
        floorDescendantsMap,
      } = useInteriorStore.getState()

      // Build floor descendants set for the selected floor (or null = all visible)
      const floorDescendants: Set<number> | null =
        selectedFloor !== null ? (floorDescendantsMap.get(selectedFloor) ?? null) : null

      // Helper: does the floor filter allow this element?
      function floorAllows(id: number): boolean {
        if (selectedFloor === null) return true
        if (id === selectedFloor) return true
        return floorDescendants?.has(id) ?? false
      }

      // Build wall classification lookup sets
      const extWallIds = wallClassification?.exteriorWallIds ?? new Set<number>()
      const intWallIds = wallClassification?.interiorWallIds ?? new Set<number>()
      const extWallChildIds = wallClassification?.exteriorWallChildIds ?? new Set<number>()

      // Helper: does the wall classification filter allow this element?
      function wallFilterAllows(id: number): boolean {
        // Check if this element is in a wall classification category that is hidden
        if (extWallIds.has(id) || extWallChildIds.has(id)) {
          return categoryFilters[EXTERIOR_WALLS_KEY] !== false
        }
        if (intWallIds.has(id)) {
          return categoryFilters[INTERIOR_WALLS_KEY] !== false
        }
        return true
      }

      // Build the category -> IDs cache if needed (expensive query, cache per model version)
      const currentModelVersion = useInteriorStore.getState().modelVersion
      if (categoryIdsCacheVersionRef.current !== currentModelVersion) {
        categoryIdsCacheRef.current.clear()
        categoryIdsCacheVersionRef.current = currentModelVersion
      }

      // Query real IFC categories and cache results
      const realCategoryKeys = Object.keys(IFC_CATEGORIES).filter(
        (key) => !(WALL_CATEGORY_KEYS as readonly string[]).includes(key),
      )

      for (const categoryKey of realCategoryKeys) {
        if (isStale()) return
        if (!categoryIdsCacheRef.current.has(categoryKey)) {
          try {
            const ids = await model.getItemsByQuery({
              categories: [new RegExp(`^${categoryKey}$`, 'i')],
            })
            if (isStale()) return
            categoryIdsCacheRef.current.set(categoryKey, ids ?? [])
          } catch {
            categoryIdsCacheRef.current.set(categoryKey, [])
          }
        }
      }

      if (isStale()) return

      // Build a reverse map: elementId -> category key (for categoryAllows)
      const elementCategoryMap = new Map<number, string>()
      for (const [categoryKey, ids] of categoryIdsCacheRef.current) {
        for (const id of ids) {
          elementCategoryMap.set(id, categoryKey)
        }
      }

      // Helper: does the category filter allow this element?
      function categoryAllows(id: number): boolean {
        const category = elementCategoryMap.get(id)
        if (category === undefined) return true // Unknown category -> visible
        return categoryFilters[category] !== false
      }

      // Get all element IDs in the model
      const allLocalIds = await model.getLocalIds()
      if (isStale()) return

      // Compute new visibility state for all elements
      const newVisibility = new Map<number, { visible: boolean; opacity: number }>()
      const toShow: number[] = []
      const toHide: number[] = []
      const toGhostOpacity: number[] = []
      const toFullOpacity: number[] = []

      for (const id of allLocalIds) {
        const visible = floorAllows(id) && categoryAllows(id) && wallFilterAllows(id)
        const opacity = visible && ghostedIds.has(id) ? GHOST_OPACITY : 1.0

        newVisibility.set(id, { visible, opacity })

        // Diff against previous state -- only update changed elements
        const prev = prevVisibilityRef.current.get(id)
        if (!prev || prev.visible !== visible) {
          if (visible) {
            toShow.push(id)
          } else {
            toHide.push(id)
          }
        }
        if (visible && (!prev || prev.opacity !== opacity || prev.visible !== visible)) {
          if (opacity < 1.0) {
            toGhostOpacity.push(id)
          } else {
            toFullOpacity.push(id)
          }
        }
      }

      if (isStale()) return

      // Apply visibility changes in batches
      try {
        if (toShow.length > 0) {
          await model.setVisible(toShow, true)
        }
        if (isStale()) return

        if (toHide.length > 0) {
          await model.setVisible(toHide, false)
        }
        if (isStale()) return

        // Apply opacity changes (ghost layer)
        if (toGhostOpacity.length > 0) {
          await model.setOpacity(toGhostOpacity, GHOST_OPACITY)
        }
        if (isStale()) return

        if (toFullOpacity.length > 0) {
          await model.setOpacity(toFullOpacity, 1.0)
        }
        if (isStale()) return
      } catch (err) {
        console.warn('[useVisibilityPass] Visibility pass error:', err)
      }

      // Update previous visibility state ref
      prevVisibilityRef.current = newVisibility

      // Single fragments.update(true) at the end -- not per-category
      if (fragmentsRef.current && !disposedRef.current) {
        fragmentsRef.current.update(true)
      }
      // Re-apply z-fighting fixes — fragments.update() may regenerate materials
      if (model.object) {
        applyZFightingFixes(model.object)
      }
      // Extend the continuous-render window so the animation loop keeps painting
      // while worker GPU buffer updates propagate. 1.5s is generous enough for
      // large models; the window is a ceiling -- rendering stops when it expires.
      continuousRenderUntilRef.current = performance.now() + 1500
    }

    // Single Zustand subscription watching all visibility-relevant slices.
    // Uses shallow equality so unrelated state changes (hoveredId, selectedId, etc.)
    // do NOT trigger the visibility pass (Vercel `rerender-defer-reads`).
    // When S key fires, it resets multiple slices simultaneously -- the single
    // selector ensures only one pass fires instead of redundant per-slice passes.
    const unsubscribeVisibility = useInteriorStore.subscribe(
      (state) => [
        state.selectedFloor,
        state.categoryFilters,
        state.ghostedIds,
        state.wallClassification,
        state.floorDescendantsMap,
      ],
      () => {
        // Start continuous rendering immediately so every frame paints while
        // the async visibility pass runs. The window is extended again when
        // the pass completes (after fragments.update commits GPU buffers).
        continuousRenderUntilRef.current = performance.now() + 1500
        needsRenderRef.current = true
        void applyVisibility().catch((err) => {
          // Swallow errors from stale/disposed model -- only log unexpected ones
          if (!disposedRef.current) {
            console.warn('[useVisibilityPass] Visibility pass error:', err)
          }
        })
      },
      { equalityFn: shallow },
    )

    return () => {
      unsubscribeVisibility()
    }
  }, [])
}
