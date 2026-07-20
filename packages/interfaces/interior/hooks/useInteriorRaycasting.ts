import type * as FRAGS from '@thatopen/fragments'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useInteriorStore } from '../interior.store'
import type { SceneRefs } from '../interior.types'

// ─── Interaction Color Constants ───────────────────────────────────────────────

/** Hover highlight color: design system primary teal (#2B7C85) */
const HOVER_COLOR = new THREE.Color('#2B7C85')

/** Selection highlight color: design system tertiary fuchsia (#23E5E5) */
const SELECTION_COLOR = new THREE.Color('#23E5E5')

// ─── Sync Source Flag ─────────────────────────────────────────────────────────

/**
 * Identifies the source of a selection change to prevent infinite loops
 * in bidirectional sync between the 3D canvas and the tree.
 */
export type SyncSource = '3d' | 'tree' | null

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useInteriorRaycasting — attaches mousemove + click listeners to the
 * canvas and implements hover highlight, click selection, deselect, and
 * bidirectional Tree ↔ 3D sync.
 *
 * Design decisions:
 * - Uses ThatOpen's built-in model.raycast() which returns localId directly.
 * - Hover is throttled to one raycast per animation frame (~16ms) via rAF guard.
 * - Click is always immediate (no throttle/debounce).
 * - Previous hover/selection colors are reset before applying new ones.
 * - Hover never overrides selection color on the currently selected element.
 * - Ghosted elements (in ghostedIds) are non-interactive — O(1) Set lookup.
 * - Bidirectional sync: syncSourceRef prevents infinite loop between
 *   3D canvas selection and tree navigation.
 * - All model.setColor() and model.resetColor() calls are properly awaited.
 */
export function useInteriorRaycasting(sceneRefs: SceneRefs) {
  'use no memo' // Opts out of React Compiler -- try-without-catch not supported by compiler
  const {
    camera: cameraRef,
    canvasElement: canvasRef,
    currentModel: currentModelRef,
    disposed: disposedRef,
    needsRender: needsRenderRef,
  } = sceneRefs
  // Track which element is currently hover-highlighted so we can reset it.
  // Separate from store — avoids triggering store subscriptions on every mousemove.
  const prevHoveredIdRef = useRef<number | null>(null)

  // Track which element is currently selection-highlighted so we can reset it.
  const prevSelectedIdRef = useRef<number | null>(null)

  // rAF guard: true when we're waiting for the next frame (hover throttle)
  const rafPendingRef = useRef(false)

  // syncSourceRef: prevents bidirectional sync infinite loop.
  // Set to '3d' when the 3D viewer initiates a selection change,
  // set to 'tree' when the tree initiates a selection change.
  const syncSourceRef = useRef<SyncSource>(null)

  // ─── Hover + Click effects ─────────────────────────────────────────────────

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    // Capture as non-nullable const for use in nested async closures
    const canvas: HTMLCanvasElement = canvasEl

    // ─── Raycast helpers ────────────────────────────────────────────────────

    /**
     * Get mouse position for ThatOpen's model.raycast().
     * IMPORTANT: Pass raw clientX/clientY — ThatOpen's internal screenToCast()
     * already subtracts canvas getBoundingClientRect().left/top to compute NDC.
     */
    function getMousePosition(event: MouseEvent): THREE.Vector2 {
      return new THREE.Vector2(event.clientX, event.clientY)
    }

    /**
     * Perform a raycast using ThatOpen's built-in model.raycast().
     * Returns the RaycastResult (with localId) or null if nothing was hit.
     * This is async because model.raycast() returns a Promise.
     */
    async function performRaycast(mouse: THREE.Vector2): Promise<FRAGS.RaycastResult | null> {
      const camera = cameraRef.current
      const model = currentModelRef.current

      if (!camera || !model) return null

      try {
        const result = await model.raycast({ camera, mouse, dom: canvas })
        return result
      } catch {
        // Raycast may fail if model is disposing — ignore
        return null
      }
    }

    // ─── Color management ───────────────────────────────────────────────────

    /**
     * Apply hover highlight color to a localId.
     * Does NOT override the selection color on the currently selected element.
     */
    async function applyHoverColor(localId: number): Promise<void> {
      const model = currentModelRef.current
      if (!model) return

      const selectedId = useInteriorStore.getState().selectedId
      // Never apply hover color over the selected element
      if (localId === selectedId) return

      try {
        await model.setColor([localId], HOVER_COLOR)
      } catch {
        // Fragment may not support setColor — ignore
      }
    }

    /**
     * Reset hover highlight color on a previously hovered element.
     * Does NOT reset if the element is now selected (that color takes precedence).
     */
    async function resetHoverColor(localId: number): Promise<void> {
      const model = currentModelRef.current
      if (!model) return

      const selectedId = useInteriorStore.getState().selectedId
      // Don't reset if element is currently selected — selection color takes precedence
      if (localId === selectedId) return

      try {
        await model.resetColor([localId])
      } catch {
        // Ignore
      }
    }

    /**
     * Apply selection highlight color to a localId.
     */
    async function applySelectionColor(localId: number): Promise<void> {
      const model = currentModelRef.current
      if (!model) return

      try {
        await model.setColor([localId], SELECTION_COLOR)
      } catch {
        // Ignore
      }
    }

    /**
     * Reset selection highlight color on a previously selected element.
     */
    async function resetSelectionColor(localId: number): Promise<void> {
      const model = currentModelRef.current
      if (!model) return

      try {
        await model.resetColor([localId])
      } catch {
        // Ignore
      }
    }

    // ─── Event handlers ─────────────────────────────────────────────────────

    function handleMouseMove(event: MouseEvent): void {
      if (disposedRef.current) return

      // Throttle via rAF: only one raycast per animation frame
      if (rafPendingRef.current) return
      rafPendingRef.current = true

      requestAnimationFrame(() => {
        if (disposedRef.current) {
          rafPendingRef.current = false
          return
        }

        const mouse = getMousePosition(event)

        // Wrap async operations so the rAF guard is only released after completion
        const doHover = async () => {
          try {
            const result = await performRaycast(mouse)

            // Bail if disposed during async raycast
            if (disposedRef.current) return

            const ghostedIds = useInteriorStore.getState().ghostedIds
            const newHoveredId = result ? result.localId : null

            // Skip if this element is ghosted — O(1) Set lookup
            const effectiveHoveredId =
              newHoveredId !== null && ghostedIds.has(newHoveredId) ? null : newHoveredId

            // Update store only if hover changed
            if (effectiveHoveredId !== prevHoveredIdRef.current) {
              // Reset previous hover color
              if (prevHoveredIdRef.current !== null) {
                await resetHoverColor(prevHoveredIdRef.current)
              }

              // Apply new hover color
              if (effectiveHoveredId !== null) {
                await applyHoverColor(effectiveHoveredId)
              }

              prevHoveredIdRef.current = effectiveHoveredId
              useInteriorStore.getState().setHoveredId(effectiveHoveredId)

              // Mark scene dirty so render-on-demand loop paints the color change
              needsRenderRef.current = true
            }
          } finally {
            // Release the rAF guard only after async operations complete
            rafPendingRef.current = false
          }
        }

        doHover()
      })
    }

    function handleClick(event: MouseEvent): void {
      if (disposedRef.current) return

      const mouse = getMousePosition(event)

      const doClick = async () => {
        const result = await performRaycast(mouse)

        // Bail if disposed during async raycast
        if (disposedRef.current) return

        const ghostedIds = useInteriorStore.getState().ghostedIds
        const prevSelectedId = prevSelectedIdRef.current

        if (result) {
          const newSelectedId = result.localId

          // Skip if element is ghosted — O(1) Set lookup
          if (ghostedIds.has(newSelectedId)) return

          if (newSelectedId === prevSelectedId) {
            // Clicking the same element — no change
            return
          }

          // Reset previous selection color
          if (prevSelectedId !== null) {
            await resetSelectionColor(prevSelectedId)
          }

          // Also clear any hover on the newly selected element
          if (newSelectedId === prevHoveredIdRef.current) {
            prevHoveredIdRef.current = null
            useInteriorStore.getState().setHoveredId(null)
          }

          // Apply selection color
          await applySelectionColor(newSelectedId)
          prevSelectedIdRef.current = newSelectedId

          // Update store — mark as initiated from 3D to prevent tree → 3D loop
          syncSourceRef.current = '3d'
          useInteriorStore.getState().setSelectedId(newSelectedId)
          // Navigate tree to the selected element
          useInteriorStore.getState().navigateToElement(newSelectedId)
          syncSourceRef.current = null

          // Mark scene dirty for render-on-demand
          needsRenderRef.current = true
        } else {
          // Click on empty space — deselect
          if (prevSelectedId !== null) {
            await resetSelectionColor(prevSelectedId)
            prevSelectedIdRef.current = null
          }

          // Reset hover on deselect
          if (prevHoveredIdRef.current !== null) {
            await resetHoverColor(prevHoveredIdRef.current)
            prevHoveredIdRef.current = null
            useInteriorStore.getState().setHoveredId(null)
          }

          useInteriorStore.getState().setSelectedId(null)
          useInteriorStore.getState().setSelectedElement(null)

          // Mark scene dirty for render-on-demand
          needsRenderRef.current = true
        }
      }

      doClick()
    }

    // Escape key handling consolidated into useInteriorKeyboardShortcuts
    // (Vercel `client-event-listeners` — single handler, not duplicate).
    // Color resets on deselect/hover-clear are handled by the Tree → 3D sync
    // subscription below.

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [canvasRef, cameraRef, currentModelRef, disposedRef, needsRenderRef])

  // ─── Tree → 3D sync (bidirectional) ────────────────────────────────────────
  // When the tree changes selectedId (e.g. user clicks a tree item), highlight
  // that element in the 3D viewer.

  useEffect(() => {
    const unsubscribe = useInteriorStore.subscribe(
      (state) => state.selectedId,
      (newSelectedId, prevSelectedId) => {
        if (disposedRef.current) return

        // If the change was initiated by 3D viewer, skip (already handled above)
        if (syncSourceRef.current === '3d') return

        const model = currentModelRef.current
        if (!model) return

        const doSync = async () => {
          // Reset old selection color
          if (prevSelectedId !== null && prevSelectedId !== newSelectedId) {
            try {
              await model.resetColor([prevSelectedId])
            } catch {
              // Ignore
            }
            // If old selection was hover-highlighted, it's now cleared
            if (prevHoveredIdRef.current === prevSelectedId) {
              prevHoveredIdRef.current = null
            }
          }

          // Apply new selection color
          if (newSelectedId !== null) {
            try {
              await model.setColor([newSelectedId], SELECTION_COLOR)
            } catch {
              // Ignore
            }
            prevSelectedIdRef.current = newSelectedId

            // Clear hover if hovering over newly selected element
            if (prevHoveredIdRef.current === newSelectedId) {
              prevHoveredIdRef.current = null
              useInteriorStore.getState().setHoveredId(null)
            }
          } else {
            // Selection cleared
            prevSelectedIdRef.current = null
          }

          // Mark scene dirty so render-on-demand paints the selection color change
          needsRenderRef.current = true
        }

        doSync()
      },
    )

    return unsubscribe
  }, [currentModelRef, disposedRef, needsRenderRef])

  // ─── Hover color sync ──────────────────────────────────────────────────────
  // When hoveredId is cleared externally (e.g., Escape in keyboard shortcuts),
  // reset the hover highlight color on the previously hovered element.

  useEffect(() => {
    const unsubscribe = useInteriorStore.subscribe(
      (state) => state.hoveredId,
      (newHoveredId) => {
        if (disposedRef.current) return

        const model = currentModelRef.current
        if (!model) return

        // When hover is cleared externally, reset the previous hover color
        if (newHoveredId === null && prevHoveredIdRef.current !== null) {
          const selectedId = useInteriorStore.getState().selectedId
          // Don't reset if element is currently selected (selection color takes precedence)
          if (prevHoveredIdRef.current !== selectedId) {
            model.resetColor([prevHoveredIdRef.current]).catch(() => {
              // Ignore
            })
          }
          prevHoveredIdRef.current = null

          // Mark scene dirty for render-on-demand
          needsRenderRef.current = true
        }
      },
    )

    return unsubscribe
  }, [currentModelRef, disposedRef, needsRenderRef])

  // Return refs that consumers may need (e.g. for cleanup)
  return {
    prevHoveredIdRef,
    prevSelectedIdRef,
    syncSourceRef,
  }
}
