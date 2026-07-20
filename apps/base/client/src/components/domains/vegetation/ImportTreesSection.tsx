/**
 * `ImportTreesSection` — app-layer UI for importing a Points-only GeoJSON
 * of trees into the existing `useVegetationStore`. Mounted from
 * `LayerLoaders.tsx` next to the Trees row so the user can either fetch
 * trees from the SDK or import their own — both end up in the same
 * store and the same analysis run (`getVegetation` already forwards
 * `useVegetationStore.features`, no analysis-side change needed).
 *
 * Flow:
 *   1. Drop / browse → `parseTreesGeoJson` (Points-only, 5 MB cap).
 *   2. If `needsFallbackPrompt(fc)` → inline numeric prompt for the
 *      default height + crownDiameter to apply to any missing /
 *      uncoercible / out-of-range feature.
 *   3. `processImportedTrees(fc, polygon, fallback)` returns features +
 *      warnings + counts.
 *   4. Inline preview summary + Confirm / Cancel.
 *   5. Confirm rebuilds meshes via `featuresToDotBimMeshes` and writes
 *      back through `setMeshes(meshes, features, totalTrees, polygonKey)`.
 *
 * Gating:
 *   - Disabled when polygon is null or fails `isPolygonSafeToFetch`.
 *     `LayerLoaders` already passes `effectiveAreaPolygon`, which is
 *     null while drawing or before commit.
 */
import {
  isPolygonSafeToFetch,
  needsFallbackPrompt,
  parseTreesGeoJson,
  processImportedTrees,
  type TreeFallback,
  type TreesFeatureCollection,
  useVegetationStore,
} from '@forge-kit/vegetation'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { InlineError } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import {
  buildCommit,
  getSuccessToast,
  type Phase,
  type ReplaceMode,
  validateFallbackInputs,
} from './ImportTreesSection.helpers'
import {
  FallbackPrompt,
  PreviewSummary,
  ReplaceToggle,
  TreesDropZone,
} from './ImportTreesSection.parts'

export interface ImportTreesSectionProps {
  /**
   * Effective area polygon from the analysis store. `null` while the
   * user is drawing or before any polygon is committed. The section is
   * disabled in that case with a "Draw an analysis area first" prompt.
   */
  polygon: GeoJsonPolygon | null
}

export function ImportTreesSection({ polygon }: ImportTreesSectionProps) {
  'use no memo' // Opts out of React Compiler -- store reference used as value

  const polygonSafe = polygon != null && isPolygonSafeToFetch(polygon)

  // Subscribe to the features dict so the Replace toggle only appears
  // when there's something to replace.
  const hasExistingFeatures = useVegetationStore(
    useShallow((s) => s.features != null && Object.keys(s.features).length > 0),
  )

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [replaceMode, setReplaceMode] = useState<ReplaceMode>('add')
  const [isDragOver, setIsDragOver] = useState(false)
  const [fallbackHeight, setFallbackHeight] = useState<string>('')
  const [fallbackDiameter, setFallbackDiameter] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetAll = useCallback(() => {
    setPhase({ kind: 'idle' })
    setFallbackHeight('')
    setFallbackDiameter('')
  }, [])

  const runProcessing = useCallback(
    (fc: TreesFeatureCollection, fallback: TreeFallback) => {
      if (!polygon) {
        setPhase({ kind: 'error', message: 'Draw an analysis area first.' })
        return
      }
      const result = processImportedTrees(fc, polygon, fallback)
      if (result.features.length === 0) {
        // `processImportedTrees` already supplies a friendly warning
        // (e.g. "No trees intersect the analysis polygon."); surface
        // it as the error instead of an empty preview.
        setPhase({
          kind: 'error',
          message:
            result.warnings[0] ??
            'No trees could be imported. Check that the file contains Points inside the analysis polygon.',
        })
        return
      }
      setPhase({ kind: 'preview', features: result.features, warnings: result.warnings })
    },
    [polygon],
  )

  const handleFile = useCallback(
    async (file: File) => {
      if (!polygon) {
        setPhase({ kind: 'error', message: 'Draw an analysis area first.' })
        return
      }
      setPhase({ kind: 'processing' })
      const parse = await parseTreesGeoJson(file)
      if (!parse.ok) {
        setPhase({ kind: 'error', message: parse.error })
        return
      }
      const fc = parse.featureCollection

      if (needsFallbackPrompt(fc)) {
        // Defer processing until the user supplies fallback values.
        setPhase({ kind: 'fallback', fc })
        return
      }

      // Every feature has valid props — pass zero-sentinel fallback
      // values (unused because no feature triggers fallback).
      runProcessing(fc, { height: 0, crownDiameter: 0 })
    },
    [polygon, runProcessing],
  )

  // ---------------------------------------------------------------------------
  // Drop zone wiring
  // ---------------------------------------------------------------------------

  const dropDisabled = !polygonSafe || phase.kind === 'processing' || phase.kind === 'fallback'

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (dropDisabled) return
      const file = e.dataTransfer.files[0]
      if (!file) return
      const lower = file.name.toLowerCase()
      if (!lower.endsWith('.json') && !lower.endsWith('.geojson')) {
        setPhase({ kind: 'error', message: 'Please upload a .json or .geojson file.' })
        return
      }
      handleFile(file)
    },
    [dropDisabled, handleFile],
  )
  const handleBrowseClick = useCallback(() => {
    if (dropDisabled) return
    fileInputRef.current?.click()
  }, [dropDisabled])
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      handleFile(file)
      e.target.value = '' // allow re-selecting the same file
    },
    [handleFile],
  )

  // ---------------------------------------------------------------------------
  // Fallback prompt submit
  // ---------------------------------------------------------------------------

  const submitFallback = useCallback(() => {
    if (phase.kind !== 'fallback') return
    const v = validateFallbackInputs(fallbackHeight, fallbackDiameter)
    if (!v.ok) {
      toast.error(v.error)
      return
    }
    runProcessing(phase.fc, { height: v.height, crownDiameter: v.crownDiameter })
  }, [phase, fallbackHeight, fallbackDiameter, runProcessing])

  // ---------------------------------------------------------------------------
  // Confirm preview → commit to store
  // ---------------------------------------------------------------------------

  const handleConfirm = useCallback(() => {
    if (phase.kind !== 'preview') return
    if (!polygon) return

    const existing = useVegetationStore.getState().features
    const { merged, meshes, totalTrees, polygonKey } = buildCommit(
      existing,
      phase.features,
      polygon,
      replaceMode,
    )

    useVegetationStore.getState().setMeshes(meshes, merged, totalTrees, polygonKey)

    if (phase.warnings.length > 0) {
      for (const w of phase.warnings) toast.warning(w)
    }
    toast.success(getSuccessToast(phase.features.length, replaceMode))

    resetAll()
  }, [phase, polygon, replaceMode, resetAll])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const showFallback = phase.kind === 'fallback'
  const showPreview = phase.kind === 'preview'
  const showError = phase.kind === 'error'

  return (
    <div className="space-y-2 px-3 py-2 rounded-md border border-border bg-card/40">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">Import trees GeoJSON</span>
        {hasExistingFeatures && !showPreview && !showFallback && (
          <ReplaceToggle replaceMode={replaceMode} onChange={setReplaceMode} />
        )}
      </div>

      {!showFallback && !showPreview && (
        <TreesDropZone
          polygonSafe={polygonSafe}
          isProcessing={phase.kind === 'processing'}
          isDragOver={isDragOver}
          disabled={dropDisabled}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          inputRef={fileInputRef}
          onFileInputChange={handleFileInputChange}
        />
      )}

      {showError && (
        <InlineError
          message={phase.kind === 'error' ? phase.message : ''}
          onRetry={resetAll}
          className="text-[11px]"
        />
      )}

      {showFallback && (
        <FallbackPrompt
          height={fallbackHeight}
          diameter={fallbackDiameter}
          onHeightChange={setFallbackHeight}
          onDiameterChange={setFallbackDiameter}
          onSubmit={submitFallback}
          onCancel={resetAll}
        />
      )}

      {showPreview && (
        <PreviewSummary
          count={phase.kind === 'preview' ? phase.features.length : 0}
          warnings={phase.kind === 'preview' ? phase.warnings : []}
          replaceMode={replaceMode}
          onConfirm={handleConfirm}
          onCancel={resetAll}
        />
      )}
    </div>
  )
}
