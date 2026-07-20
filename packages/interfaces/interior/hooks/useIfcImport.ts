import type { InteriorPlugin } from '@forge-kit/plugin-contracts'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import * as THREE from 'three'
import { modelRef } from '../interior.model-ref'
import { useInteriorStore } from '../interior.store'
import type { SceneRefs } from '../interior.types'
import { buildWallClassification } from '../interior.utils'
import type { IfcWorkerResponse } from '../workers/ifc-import.worker'
import { createSceneBackground } from './useSceneSetup'

/**
 * Apply z-fighting prevention to ALL meshes in a model object.
 *
 * Strategy (per-mesh indexed polygon offset + front-face only):
 * 1. Each mesh gets a unique polygonOffset based on its traversal index.
 *    This ensures coplanar surfaces from different meshes get different depth
 *    values in the depth buffer.
 * 2. All opaque materials are forced to FrontSide rendering to eliminate
 *    double-sided self-fighting on thin walls/slabs.
 * 3. Applied to ALL material types including ThatOpen's LodMaterial.
 *
 * MUST be called AFTER fragments.update(true) — ThatOpen may regenerate
 * materials during update, wiping earlier fixes.
 */
export function applyZFightingFixes(root: THREE.Object3D): void {
  let meshIndex = 0
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const mat of materials) {
      if (!mat) continue
      // Per-mesh polygon offset: increasing factor separates coplanar meshes.
      // Factor range 1-6 (wraps every 40 meshes), units 2-12 for larger bias.
      const offset = (meshIndex % 40) + 1
      mat.polygonOffset = true
      mat.polygonOffsetFactor = offset * 0.15
      mat.polygonOffsetUnits = offset * 0.3

      // Force front-face only on opaque materials — eliminates self-z-fighting
      // on thin walls where front and back faces compete at the same depth.
      if (!mat.transparent) {
        mat.side = THREE.FrontSide
      }
    }
    meshIndex++
  })
}

/**
 * useIfcImport — watches `modelBuffer` from the Zustand store and runs the
 * IFC import pipeline: Web Worker IFC processing, FragmentsModels loading,
 * z-fighting fixes, and wall classification triggering.
 *
 * Manages:
 * - Model disposal of previous model before importing a new one
 * - Web Worker lifecycle (creation, termination, error handling)
 * - Z-fighting patch on all non-LOD materials after load
 * - Wall classification call after successful import
 * - Grid/background toggle on model load and error recovery
 * - Camera setup via `model.useCamera()`
 * - Import cancellation via monotonic generation token
 *
 * @param sceneRefs - Shared refs from useSceneSetup
 * @param options.plugins - InteriorPlugin instances whose onModelLoaded hooks are called after import
 * @param options.onNewImport - Called when a new import starts (before disposing old model)
 */
export function useIfcImport(
  sceneRefs: SceneRefs,
  options: {
    plugins?: InteriorPlugin[]
    onNewImport?: () => void
  } = {},
): void {
  'use no memo' // Opts out of React Compiler -- hook called inside function expression (async callback)
  const { plugins = [], onNewImport } = options

  // Keep a stable ref to plugins so the effect closure always sees latest
  const pluginsRef = useRef(plugins)
  pluginsRef.current = plugins

  const onNewImportRef = useRef(onNewImport)
  onNewImportRef.current = onNewImport
  const {
    scene: sceneRef,
    camera: cameraRef,
    fragments: fragmentsRef,
    currentModel: currentModelRef,
    grid: gridRef,
    backgroundTexture: backgroundTextureRef,
    disposed: disposedRef,
    needsRender: needsRenderRef,
  } = sceneRefs

  // IFC import worker ref — created per import to isolate WASM state
  const ifcWorkerRef = useRef<Worker | null>(null)

  // Import cancellation: monotonic counter. Each import run captures its value
  // at start and checks it after each await — if it changed, a newer import
  // superseded this one and we discard the result.
  const importGenerationRef = useRef(0)

  // Track which buffer we've already successfully imported to avoid re-importing on re-renders.
  // Note: only set AFTER a successful import so that failed imports can be retried.
  const lastProcessedBufferRef = useRef<ArrayBuffer | null>(null)

  const modelBuffer = useInteriorStore((s) => s.modelBuffer)

  // Cleanup: terminate any in-flight IFC worker and bump generation on unmount.
  // This runs when the component unmounts (e.g. route change) so that the worker
  // is always terminated even if the import pipeline effect hasn't cleaned up yet.
  useEffect(() => {
    return () => {
      // Bump generation so any in-flight import ignores its result
      importGenerationRef.current += 1

      if (ifcWorkerRef.current) {
        ifcWorkerRef.current.terminate()
        ifcWorkerRef.current = null
      }
    }
  }, [])

  // ─── IFC import pipeline ────────────────────────────────────────────────────
  // Watch for new modelBuffer from the upload pipeline and import it.
  // IFC parsing runs in a Web Worker so it does not freeze the UI.

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs from useSceneSetup — they never change identity
  useEffect(() => {
    if (!modelBuffer) return
    // Skip if we already successfully imported this exact buffer instance.
    // Note: only set after success, so failed imports can be retried.
    if (modelBuffer === lastProcessedBufferRef.current) return
    if (!fragmentsRef.current) return
    if (!sceneRef.current || !cameraRef.current) return

    const fragments = fragmentsRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current

    // Notify plugins that a new import is starting (clears previous analysis, etc.)
    onNewImportRef.current?.()

    // Capture the generation token at the start of this import run.
    // Any later import that bumps the counter will supersede this run.
    importGenerationRef.current += 1
    const myGeneration = importGenerationRef.current

    /** Returns true if this import run has been superseded or the component disposed. */
    function isStale() {
      return disposedRef.current || importGenerationRef.current !== myGeneration
    }

    /** Restore empty-state visuals (called on error or cancellation). */
    function restoreEmptyState() {
      if (gridRef.current) gridRef.current.visible = true
      // Dispose loaded-state background and switch to empty-state gradient
      if (backgroundTextureRef.current) {
        backgroundTextureRef.current.dispose()
      }
      const emptyBg = createSceneBackground('empty')
      backgroundTextureRef.current = emptyBg
      if (sceneRef.current) sceneRef.current.background = emptyBg
      needsRenderRef.current = true
    }

    /**
     * Run IfcImporter.process() in a Web Worker and return the fragments buffer.
     * Uses Transferable objects for zero-copy transfer of both input and output.
     */
    function processInWorker(buffer: ArrayBuffer, importId: string): Promise<Uint8Array> {
      return new Promise((resolve, reject) => {
        // Terminate any previous worker
        if (ifcWorkerRef.current) {
          ifcWorkerRef.current.terminate()
        }

        const worker = new Worker(new URL('../workers/ifc-import.worker.ts', import.meta.url), {
          type: 'module',
        })
        ifcWorkerRef.current = worker

        worker.onmessage = (event: MessageEvent<IfcWorkerResponse>) => {
          const { type, payload } = event.data

          switch (type) {
            case 'IFC_PROCESSED': {
              if (payload.id === importId) {
                resolve(payload.fragmentsBuffer)
                // Do not terminate here — cleanup happens after the pipeline finishes
              }
              break
            }
            case 'IFC_PROGRESS': {
              if (payload.id === importId) {
                // Map worker progress (10-100) to overall progress (55-85)
                const mappedProgress = 55 + Math.round((payload.progress / 100) * 30)
                useInteriorStore.getState().setLoadingProgress(mappedProgress)
              }
              break
            }
            case 'ERROR': {
              if (payload.id === importId) {
                reject(new Error(payload.error))
              }
              break
            }
          }
        }

        worker.onerror = (error) => {
          reject(new Error(error.message || 'IFC import worker error'))
        }

        // Transfer the ArrayBuffer to the worker (zero-copy)
        worker.postMessage({ type: 'PROCESS_IFC', payload: { id: importId, bytes: buffer } }, [
          buffer,
        ])
      })
    }

    async function importModel() {
      try {
        // Yield to the browser so React can paint the loading bar before work begins.
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
        if (isStale()) return

        // Dispose previous model if any (still valid pre-await operation)
        if (currentModelRef.current) {
          await fragments.disposeModel(currentModelRef.current.modelId)
          currentModelRef.current = null
          modelRef.current = null
          useInteriorStore.getState().bumpModelVersion()
        }

        // Bail if superseded while disposing previous model
        if (isStale()) return

        // Phase 2a: IFC processing in Web Worker (50% -> 90%)
        useInteriorStore.getState().setLoadingState('parsing')
        useInteriorStore.getState().setLoadingProgress(55)

        const importId = `import-${Date.now()}`

        // Clone the buffer before transferring — the transfer neuters the original,
        // but we need modelBuffer to remain usable for S3 upload in indoor analysis.
        const bufferCopy = (modelBuffer as ArrayBuffer).slice(0)
        const fragmentsBuffer = await processInWorker(bufferCopy, importId)

        // Terminate the worker after processing completes
        if (ifcWorkerRef.current) {
          ifcWorkerRef.current.terminate()
          ifcWorkerRef.current = null
        }

        // Bail if superseded during IFC processing (most expensive step)
        if (isStale()) return

        // Phase 2b: Loading fragments into scene (90% -> 100%)
        useInteriorStore.getState().setLoadingProgress(90)

        // Load the fragments binary into the scene
        const model = await fragments.load(fragmentsBuffer, {
          modelId: `model-${Date.now()}`,
          camera,
        })

        // Bail if superseded while loading fragments
        if (isStale()) {
          // Dispose the model we just loaded since we won't use it
          await fragments.disposeModel(model.modelId).catch(() => {})
          return
        }

        currentModelRef.current = model
        // Expose model to ModelTreePanel via module-level ref and bump reactive signal
        modelRef.current = model
        useInteriorStore.getState().bumpModelVersion()

        // Add model's Three.js object to the scene
        scene.add(model.object)

        // Required for LOD and frustum culling to work.
        // biome-ignore lint/correctness/useHookAtTopLevel: model.useCamera is a ThatOpen API method, not a React hook
        model.useCamera(camera)

        // Force full geometry rebuild after initial load
        await fragments.update(true)

        // Z-fighting prevention: MUST run AFTER fragments.update(true) because
        // ThatOpen may regenerate materials during update, wiping earlier fixes.
        applyZFightingFixes(model.object)

        if (isStale()) return

        // Hide empty-state grid
        if (gridRef.current) {
          gridRef.current.visible = false
        }

        // Loaded state: switch to loaded gradient background
        if (backgroundTextureRef.current) {
          backgroundTextureRef.current.dispose()
        }
        const loadedBg = createSceneBackground('loaded')
        scene.background = loadedBg
        backgroundTextureRef.current = loadedBg

        // Mark dirty so render-on-demand paints the newly loaded model
        needsRenderRef.current = true

        // Get element count from the model
        const localIds = await model.getLocalIds()

        if (isStale()) return

        // Update store with element count and set schema
        // Note: getMetadata may return schema info; use a reasonable default
        let schema = 'unknown'
        try {
          const metadata = await model.getMetadata<{ schema?: string }>()
          if (metadata?.schema) schema = metadata.schema
        } catch {
          // Metadata may not always include schema — fall back to 'unknown'
        }

        if (isStale()) return

        // Only mark as processed after successful completion so that failed
        // imports can be retried by re-setting the same buffer.
        lastProcessedBufferRef.current = modelBuffer

        // NOTE: modelBuffer is intentionally retained (not nulled) so that the
        // indoor analysis API can reconstruct a File from it for FormData.
        // Memory impact is acceptable — typical IFC files are 5-50 MB.

        const currentInfo = useInteriorStore.getState().modelInfo
        if (currentInfo) {
          useInteriorStore.getState().setModelInfo({
            ...currentInfo,
            schema,
            elementCount: localIds.length,
          })
        }

        // Wall classification scan — runs inside the model load pipeline
        // (NOT as a separate useEffect — Vercel `rerender-derived-state-no-effect`).
        // This scans IFCWALL + IFCWALLSTANDARDCASE for Pset_WallCommon.IsExternal
        // and caches the results as Set<number> for O(1) lookups.
        if (!isStale()) {
          useInteriorStore.getState().setWallClassificationLoading(true)
          const wallResult = await buildWallClassification(model, isStale)
          if (isStale()) return
          if (wallResult) {
            useInteriorStore.getState().setWallClassification(wallResult)
          }
          useInteriorStore.getState().setWallClassificationLoading(false)
        }

        // Bail if superseded during wall classification scan
        if (isStale()) return

        // Phase 2 complete: finalise loading state and switch to model tab
        useInteriorStore.getState().setLoadingProgress(100)
        useInteriorStore.getState().setLoadingState('loaded')
        useInteriorStore.getState().setActiveTab('model')
        toast.success(`Loaded ${currentInfo?.name ?? 'IFC model'}`, { id: 'ifc-load' })

        // Notify plugins that the model is loaded and ready
        if (!isStale() && model) {
          for (const p of pluginsRef.current) {
            p.onModelLoaded?.(model, sceneRefs)
          }
        }
      } catch (err) {
        // Always terminate the worker on error, regardless of staleness
        if (ifcWorkerRef.current) {
          ifcWorkerRef.current.terminate()
          ifcWorkerRef.current = null
        }

        // Only surface the error if this import is still the active one
        if (isStale()) return

        console.error('[useIfcImport] IFC import failed:', err)
        restoreEmptyState()

        // Transition store to error state so UI reflects the failure
        const message = err instanceof Error ? err.message : 'Failed to import IFC model'
        useInteriorStore.getState().setLoadingState('error')
        useInteriorStore.getState().setLoadingError(message)
      }
    }

    importModel()
  }, [modelBuffer])
}
