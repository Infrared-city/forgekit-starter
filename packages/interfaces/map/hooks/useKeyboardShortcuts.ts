import type { KeyboardShortcut, MapPlugin } from '@forge-kit/plugin-contracts'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMapStore } from '../map.store'

/**
 * Global keyboard shortcuts for the map canvas.
 *
 * Handles interface-level shortcuts (Escape, layer toggles) and delegates
 * plugin-registered shortcuts via `MapPlugin.shortcuts`.
 *
 * The map interface does NOT import any primitive package -- building-specific
 * shortcuts (e.g., 'R' to reset transform) are registered by the buildings
 * plugin via its `shortcuts` array.
 */
export function useKeyboardShortcuts(plugins: MapPlugin[]): void {
  const { selectedMeshId, selectMesh, toggleLayer } = useMapStore(
    useShallow((s) => ({
      selectedMeshId: s.selectedMeshId,
      selectMesh: s.selectMesh,
      toggleLayer: s.toggleLayer,
    })),
  )

  // Collect all plugin shortcuts
  const allPluginShortcuts: KeyboardShortcut[] = plugins.flatMap((p) => p.shortcuts ?? [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Interface-level shortcuts
      switch (e.key) {
        case 'Escape':
          if (selectedMeshId) {
            selectMesh(null)
          }
          break // always fall through to plugin shortcuts (e.g. AI drawing cancel)
        case '1':
          toggleLayer('buildings')
          return
        case '2':
          toggleLayer('analysis')
          return
        case '3':
          toggleLayer('markers')
          return
        case '4':
          toggleLayer('groundMaterials')
          return
      }

      // Plugin-registered shortcuts
      for (const shortcut of allPluginShortcuts) {
        if (e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          const modifiersMatch =
            !shortcut.modifiers ||
            shortcut.modifiers.every((mod) => {
              switch (mod) {
                case 'ctrl':
                  return e.ctrlKey
                case 'shift':
                  return e.shiftKey
                case 'alt':
                  return e.altKey
                case 'meta':
                  return e.metaKey
                default:
                  return false
              }
            })
          if (modifiersMatch) {
            shortcut.handler()
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMeshId, selectMesh, toggleLayer, allPluginShortcuts])
}
