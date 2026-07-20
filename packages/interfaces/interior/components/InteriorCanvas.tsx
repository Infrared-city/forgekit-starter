import type { InteriorPlugin } from '@forge-kit/plugin-contracts'
import { useCallback, useEffect, useRef } from 'react'
import { useCameraControls } from '../hooks/useCameraControls'
import { useIfcImport } from '../hooks/useIfcImport'
import { useInteriorKeyboardShortcuts } from '../hooks/useInteriorKeyboardShortcuts'
import { useInteriorRaycasting } from '../hooks/useInteriorRaycasting'
import { createSceneBackground, useSceneSetup } from '../hooks/useSceneSetup'
import { useVisibilityPass } from '../hooks/useVisibilityPass'
import { sceneRefsRef } from '../interior.scene-context'
import { useInteriorStore } from '../interior.store'
import { InteriorTooltip } from './InteriorTooltip'
import { ViewerToolbar } from './ViewerToolbar'

export interface InteriorCanvasProps {
  /** Plugins that contribute overlays, panels, and lifecycle hooks. */
  plugins?: InteriorPlugin[]
}

/**
 * InteriorCanvas -- custom Three.js scene that renders ThatOpen fragment models.
 *
 * Responsibilities:
 * - Scene / renderer / camera setup via useSceneSetup hook
 * - IFC import pipeline via useIfcImport hook
 * - Visibility pass (floor, category, wall, ghost) via useVisibilityPass hook
 * - Camera controls (fit, zoom, reset) via useCameraControls hook
 * - Raycasting (hover, click, tree sync) via useInteriorRaycasting hook
 * - Keyboard shortcuts via useInteriorKeyboardShortcuts hook
 * - Empty state: GridHelper ground plane when no model loaded
 * - Loaded state: gradient background + rendered model
 * - Plugin overlays rendered from `plugins.filter(p => p.Overlay)`
 * - Full cleanup on unmount (handled by useSceneSetup + plugin cleanup)
 */
export function InteriorCanvas({ plugins = [] }: InteriorCanvasProps) {
  'use no memo' // Opts out of React Compiler -- ref/module-var writes during render (sceneRefsRef, pluginsRef)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep a stable ref to plugins for lifecycle callbacks
  const pluginsRef = useRef(plugins)
  pluginsRef.current = plugins

  // Build aggregated plugin callbacks for hooks that need them
  const onNewImport = useCallback(() => {
    for (const p of pluginsRef.current) {
      p.cleanup?.()
    }
  }, [])

  const onCleanup = useCallback(() => {
    for (const p of pluginsRef.current) {
      p.cleanup?.()
    }
  }, [])

  // ─── Scene setup ─────────────────────────────────────────────────────────────
  const sceneRefs = useSceneSetup(containerRef, { onCleanup })

  // Expose sceneRefs to sibling components (InteriorPanel) via module-level ref.
  // Follows the same pattern as modelRef in interior.model-ref.ts.
  sceneRefsRef.current = sceneRefs

  // Bump sceneVersion so InteriorPanel re-renders and sees the ref.
  // Clear ref on unmount to prevent stale/disposed refs on route re-entry.
  useEffect(() => {
    useInteriorStore.getState().bumpSceneVersion()
    return () => {
      sceneRefsRef.current = null
    }
  }, [])

  // ─── IFC import pipeline ─────────────────────────────────────────────────────
  useIfcImport(sceneRefs, { plugins, onNewImport })

  // ─── Visibility pass (floor, category, wall, ghost) ──────────────────────────
  useVisibilityPass(sceneRefs)

  // ─── Camera controls ─────────────────────────────────────────────────────────
  const { handleFitToModel, handleZoomIn, handleZoomOut, handleResetRotation } =
    useCameraControls(sceneRefs)

  // ─── Raycasting (hover + click selection + bidirectional tree sync) ───────────
  useInteriorRaycasting(sceneRefs)

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useInteriorKeyboardShortcuts({ onFitToModel: handleFitToModel })

  // ─── Loading state: toggle grid/background based on loadingState ─────────────

  const loadingState = useInteriorStore((s) => s.loadingState)

  const {
    scene: sceneRef,
    currentModel: currentModelRef,
    grid: gridRef,
    backgroundTexture: backgroundTextureRef,
    needsRender: needsRenderRef,
  } = sceneRefs

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs from useSceneSetup -- they never change identity
  useEffect(() => {
    if (!sceneRef.current || !gridRef.current) return

    if (loadingState === 'loaded' && currentModelRef.current) {
      gridRef.current.visible = false
      // Switch to loaded gradient
      if (backgroundTextureRef.current) {
        backgroundTextureRef.current.dispose()
      }
      const loadedBg = createSceneBackground('loaded')
      sceneRef.current.background = loadedBg
      backgroundTextureRef.current = loadedBg
    } else if (loadingState === 'idle') {
      gridRef.current.visible = true
      // Switch to empty gradient
      if (backgroundTextureRef.current) {
        backgroundTextureRef.current.dispose()
      }
      const emptyBg = createSceneBackground('empty')
      sceneRef.current.background = emptyBg
      backgroundTextureRef.current = emptyBg
    }
    // Mark dirty so render-on-demand repaints after visibility change
    needsRenderRef.current = true
  }, [loadingState])

  // ─── Plugin overlays ───────────────────────────────────────────────────────
  const overlayPlugins = plugins.filter((p) => p.Overlay)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      role="application"
      aria-label="Interior 3D model viewer"
      data-testid="interior-canvas-container"
    >
      <InteriorTooltip />
      <ViewerToolbar
        onFitToModel={handleFitToModel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetRotation={handleResetRotation}
      />
      {overlayPlugins.map((p) => {
        const Overlay = p.Overlay!
        return <Overlay key={p.id} sceneRefs={sceneRefs} />
      })}
    </div>
  )
}
