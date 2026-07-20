import { useEffect } from 'react'
import { useInteriorStore } from '../interior.store'

/**
 * Callback interface for imperative camera operations that live in Three.js refs.
 * Passed in from InteriorCanvas so this hook stays decoupled from refs.
 */
export interface InteriorKeyboardShortcutCallbacks {
  /** Frame the loaded model in the viewport (F key) */
  onFitToModel?: () => void
}

/**
 * useInteriorKeyboardShortcuts — global keydown listener for the interior viewer.
 *
 * Shortcuts:
 * - Escape — deselect current element (clear selectedId, selectedElement)
 * - f / F — fit camera to model bounding box
 * - h / H — ghost the currently selected element (add to ghostedIds, deselect)
 *            No-op if the element is already ghosted.
 * - s / S — reset all ghosts + category filters + floor isolation (selectedFloor → null)
 *
 * Guards:
 * - Does not fire when the user is typing in an input or textarea field.
 *
 * Pattern: follows the existing useKeyboardShortcuts hook in the map domain.
 */
export function useInteriorKeyboardShortcuts({
  onFitToModel,
}: InteriorKeyboardShortcutCallbacks = {}): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'Escape': {
          const { setSelectedId, setSelectedElement, setHoveredId } = useInteriorStore.getState()
          // Always clear selection and hover on Escape (deselect + close)
          setSelectedId(null)
          setSelectedElement(null)
          setHoveredId(null)
          break
        }

        case 'f':
        case 'F': {
          onFitToModel?.()
          break
        }

        case 'h':
        case 'H': {
          const { selectedId, ghostedIds, toggleGhosted, setSelectedId, setSelectedElement } =
            useInteriorStore.getState()

          // No selection — no-op
          if (selectedId === null) break

          // Already ghosted — no-op (idempotent, spec says no double-ghost)
          if (ghostedIds.has(selectedId)) break

          // Ghost the element: add to ghostedIds, then deselect
          toggleGhosted(selectedId)
          setSelectedId(null)
          setSelectedElement(null)
          break
        }

        case 's':
        case 'S': {
          // Reset all ghosts, category filters, and floor isolation
          useInteriorStore.getState().resetVisibility()
          break
        }

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFitToModel])
}
