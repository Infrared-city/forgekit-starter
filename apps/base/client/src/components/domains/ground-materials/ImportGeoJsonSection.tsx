import {
  rgbToHex,
  useGroundMaterialRegistry,
  useGroundMaterialsDraw,
  useGroundMaterialsStore,
} from '@forge-kit/ground-materials'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button, InlineError } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import type { GroundMaterialsPanelDeps } from './GroundMaterialsPanel'
import {
  classifyRoutingMode,
  getConfirmLabel,
  getPickerLabel,
  getSuccessToast,
  type ImportMode,
  inspectPreviewFeatures,
  type PreviewMeta,
  type ReplaceMode,
  runMultiDictPipeline,
  runSingleFcPipeline,
  stampUnlabeledWithSelection,
} from './ImportGeoJsonSection.helpers'
import {
  DropZone,
  ImportModeTabs,
  MaterialPicker,
  ReplaceModeToggle,
  WarningsPanel,
} from './ImportGeoJsonSection.parts'

/**
 * ImportGeoJsonSection renders a drop zone / file picker (with Single FC vs
 * Multi-material dict tabs), a Replace/Add toggle, optional material picker
 * for unlabeled features, and Confirm/Cancel buttons for importing GeoJSON
 * polygons into the ground-materials draw layer.
 */
export function ImportGeoJsonSection({ deps }: { deps: GroundMaterialsPanelDeps }) {
  'use no memo' // Opts out of React Compiler -- store reference (useGroundMaterialsStore) used as value
  const buildingsViewport = deps.getBuildingsViewport()
  const setLayer = deps.setLayer
  const { data: registry } = useGroundMaterialRegistry()
  const {
    addPreviewFeatures,
    confirmPreviewFeaturesPerFeature,
    replaceAllWithPreview,
    clearPreviewFeatures,
    getAllFeatures,
  } = useGroundMaterialsDraw()

  const store = useGroundMaterialsStore

  // Store selectors
  const importPreviewIds = useGroundMaterialsStore((s) => s.importPreviewIds)
  const importWarnings = useGroundMaterialsStore((s) => s.importWarnings)
  const importError = useGroundMaterialsStore((s) => s.importError)

  // Local state
  const [importMode, setImportMode] = useState<ImportMode>('single')
  const [replaceMode, setReplaceMode] = useState<ReplaceMode>('add')
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [warningsExpanded, setWarningsExpanded] = useState(false)
  const [previewMeta, setPreviewMeta] = useState<PreviewMeta | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasPreview = importPreviewIds.length > 0
  // Registry must be loaded before parsing a file. `inspectPreviewFeatures`
  // classifies every label against `knownMaterialNames`; an empty set would
  // wrongly downgrade a fully-labeled file to `partial-picker`, and since
  // `previewMeta` is computed once per upload it would not self-heal when
  // the registry query later resolves. Gating uploads (drop / browse) on
  // registry readiness is simpler than re-classifying on every render and
  // matches the rest of the panel which also blocks the drawing tools
  // until the registry is available.
  const registryReady = !!registry?.materials

  // Materials list from registry (same pattern as GroundMaterialsPanel)
  const materials = useMemo(() => {
    if (!registry?.materials) return []
    return Object.entries(registry.materials).map(([uuid, mat]) => ({
      uuid,
      name: mat.name,
      displayName: mat.displayName,
      color: rgbToHex(mat.diffuseColor),
    }))
  }, [registry])

  // Subscribe to store fields that change whenever the draw layer's
  // non-preview contents mutate (fetch / restore / delete / edit). We do
  // NOT consume the selector output -- this subscription exists solely to
  // re-render this component when those mutations happen, so the
  // `getAllFeatures()` snapshot below stays fresh. The previous
  // implementation memoized against `getAllFeatures`, which is a stable
  // callback and therefore never invalidated the result.
  useGroundMaterialsStore(
    useShallow((s) => [
      s.lastCreatedFeatures.length,
      s.lastUpdatedFeatures.length,
      s.lastDeletedFeatures.length,
      s.actionableState,
    ]),
  )

  // True iff there is at least one non-preview feature already drawn -- gates
  // the visibility of the Replace toggle (Replace is meaningless when the
  // draw layer is empty). Computed each render off the live MapboxDraw
  // snapshot. O(features) is well within the panel's budget.
  let hasExistingFeatures = false
  {
    const all = getAllFeatures()
    if (all) {
      for (const f of all.features) {
        if (f.properties?.preview !== true) {
          hasExistingFeatures = true
          break
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // File handling
  // ---------------------------------------------------------------------------

  const handleFile = useCallback(
    async (file: File) => {
      // Guard: never parse a file while the registry is in flight. The drop
      // zone / browse button are already gated, but the file-input change
      // handler can still race the disabled flag (e.g. native dialog held
      // open across the resolve).
      if (!registry?.materials) {
        store
          .getState()
          .setImportError('Materials are still loading. Please wait a moment and try again.')
        return
      }
      setIsProcessing(true)
      try {
        const knownMaterialNames = new Set(Object.values(registry.materials).map((m) => m.name))

        if (importMode === 'multi') {
          const outcome = await runMultiDictPipeline(file, buildingsViewport)
          if (!outcome.ok) {
            store.getState().setImportError(outcome.error)
            return
          }
          setLayer('groundMaterials', true)
          const ids = addPreviewFeatures(outcome.value.features)
          store.getState().setImportPreview(ids, outcome.value.warnings)

          const { unlabeledIds, distinctLabeled } = inspectPreviewFeatures(ids, knownMaterialNames)
          const groupCount = Object.values(outcome.value.result.groupStats).filter(
            (s) => s.out > 0,
          ).length
          setPreviewMeta({
            routingMode: classifyRoutingMode('multi', ids.length, unlabeledIds.length),
            unlabeledIds,
            distinctLabeledMaterials: distinctLabeled,
            groupCount,
          })
        } else {
          const outcome = await runSingleFcPipeline(file, buildingsViewport)
          if (!outcome.ok) {
            store.getState().setImportError(outcome.error)
            return
          }
          setLayer('groundMaterials', true)
          const ids = addPreviewFeatures(outcome.value.features)
          store.getState().setImportPreview(ids, outcome.value.warnings)

          const { unlabeledIds, distinctLabeled } = inspectPreviewFeatures(ids, knownMaterialNames)
          setPreviewMeta({
            routingMode: classifyRoutingMode('single', ids.length, unlabeledIds.length),
            unlabeledIds,
            distinctLabeledMaterials: distinctLabeled,
            groupCount: 0,
          })
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [importMode, registry, buildingsViewport, setLayer, addPreviewFeatures],
  )

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
      if (hasPreview || isProcessing || !registryReady) return
      const file = e.dataTransfer.files[0]
      if (!file) return
      const ext = file.name.toLowerCase()
      if (!ext.endsWith('.json') && !ext.endsWith('.geojson')) {
        store.getState().setImportError('Please upload a .json or .geojson file.')
        return
      }
      handleFile(file)
    },
    [hasPreview, isProcessing, registryReady, handleFile],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      handleFile(file)
      // Reset input so the same file can be re-selected
      e.target.value = ''
    },
    [handleFile],
  )

  const handleBrowseClick = useCallback(() => {
    if (hasPreview || isProcessing || !registryReady) return
    fileInputRef.current?.click()
  }, [hasPreview, isProcessing, registryReady])

  // ---------------------------------------------------------------------------
  // Tab + confirm/cancel
  // ---------------------------------------------------------------------------

  /**
   * Switching tabs clears any active preview so the user does not get a
   * mismatch between the toggle and the parsed shape.
   */
  const switchImportMode = useCallback(
    (next: ImportMode) => {
      if (next === importMode) return
      if (importPreviewIds.length > 0) clearPreviewFeatures(importPreviewIds)
      store.getState().clearImport()
      setSelectedMaterial(null)
      setWarningsExpanded(false)
      setPreviewMeta(null)
      setImportMode(next)
    },
    [importMode, importPreviewIds, clearPreviewFeatures],
  )

  const handleConfirm = useCallback(() => {
    if (importPreviewIds.length === 0 || !previewMeta) return

    const needsPicker =
      previewMeta.routingMode === 'global-picker' || previewMeta.routingMode === 'partial-picker'
    if (needsPicker && !selectedMaterial) return

    if (needsPicker && selectedMaterial) {
      stampUnlabeledWithSelection(previewMeta.unlabeledIds, selectedMaterial)
    }

    const commit =
      replaceMode === 'replace'
        ? replaceAllWithPreview(importPreviewIds, 'per-feature')
        : confirmPreviewFeaturesPerFeature(importPreviewIds)

    if (commit.warning) toast.warning(commit.warning)
    toast.success(getSuccessToast(previewMeta, importMode, commit.ids.length))

    store.getState().clearImport()
    setSelectedMaterial(null)
    setWarningsExpanded(false)
    setPreviewMeta(null)
  }, [
    importPreviewIds,
    previewMeta,
    selectedMaterial,
    replaceMode,
    importMode,
    replaceAllWithPreview,
    confirmPreviewFeaturesPerFeature,
  ])

  const handleCancel = useCallback(() => {
    clearPreviewFeatures(importPreviewIds)
    store.getState().clearImport()
    setSelectedMaterial(null)
    setWarningsExpanded(false)
    setPreviewMeta(null)
  }, [importPreviewIds, clearPreviewFeatures])

  // ---------------------------------------------------------------------------
  // Derived UI bits
  // ---------------------------------------------------------------------------

  const showPicker =
    hasPreview &&
    previewMeta !== null &&
    (previewMeta.routingMode === 'global-picker' || previewMeta.routingMode === 'partial-picker')

  const confirmDisabled =
    importPreviewIds.length === 0 ||
    !previewMeta ||
    ((previewMeta.routingMode === 'global-picker' ||
      previewMeta.routingMode === 'partial-picker') &&
      !selectedMaterial)

  return (
    <div className="px-4 pb-4 space-y-3">
      <label className="block text-xs font-medium text-muted-foreground">Import GeoJSON</label>

      <ImportModeTabs
        importMode={importMode}
        disabled={hasPreview || isProcessing}
        onSwitch={switchImportMode}
      />

      {hasExistingFeatures && (
        <ReplaceModeToggle
          replaceMode={replaceMode}
          disabled={isProcessing}
          onChange={setReplaceMode}
        />
      )}

      <DropZone
        hasPreview={hasPreview}
        isProcessing={isProcessing}
        isDragOver={isDragOver}
        importMode={importMode}
        registryReady={registryReady}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        inputRef={fileInputRef}
        onFileInputChange={handleFileInputChange}
      />

      {importError && (
        <InlineError
          message={importError}
          onRetry={() => store.getState().clearImport()}
          className="text-xs"
        />
      )}

      <WarningsPanel
        warnings={importWarnings}
        expanded={warningsExpanded}
        onToggle={() => setWarningsExpanded((p) => !p)}
      />

      {showPicker && (
        <MaterialPicker
          label={getPickerLabel(previewMeta, importPreviewIds.length)}
          materials={materials}
          selected={selectedMaterial}
          onSelect={setSelectedMaterial}
        />
      )}

      {hasPreview && (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="flex-1"
          >
            {getConfirmLabel(previewMeta, importMode)}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
