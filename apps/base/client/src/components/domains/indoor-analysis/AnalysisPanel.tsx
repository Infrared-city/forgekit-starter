import type { IndoorAnalysisDeps } from '@forge-kit/indoor-analysis'
import { useAnalysisStore, useRunDaylightFactor } from '@forge-kit/indoor-analysis'
import type { InteriorPanelProps } from '@forge-kit/plugin-contracts'
import { Loader2 } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Button, InlineError, LoadingButton } from 'ui'

// Constants inlined — SUPPORTED_INDOOR_ANALYSES is not exported from the
// package barrel, and it's a static UI list that belongs in the app layer.
const SUPPORTED_INDOOR_ANALYSES = [{ value: 'daylight-factor', label: 'Daylight Factor' }] as const

/** Format IFC type name for display (strip "Ifc" prefix, add spaces) */
function formatIfcTypeName(type: string): string {
  return type
    .replace(/^Ifc/i, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

interface SpatialTreeNode {
  localId: number
  type: string
  name: string | null
  children: SpatialTreeNode[]
}

/**
 * AnalysisPanel -- sidebar tab for running indoor analyses.
 */
export function AnalysisPanel({ deps }: InteriorPanelProps & { deps: IndoorAnalysisDeps }) {
  'use no memo'
  const modelBuffer = deps.useModelBuffer()
  const selectedFloor = deps.useSelectedFloor()
  const treeRoots = deps.useTreeRoots()
  const location = deps.useLocation()
  const loadingState = deps.useLoadingState()
  const modelInfo = deps.useModelInfo()

  const showOverlay = useAnalysisStore((s) => s.showOverlay)
  const analysisType = useAnalysisStore((s) => s.analysisType)
  const heatmapData = useAnalysisStore((s) => s.heatmapData)
  const analysisStep = useAnalysisStore((s) => s.analysisStep)
  const setShowOverlay = useAnalysisStore((s) => s.setShowOverlay)
  const setAnalysisType = useAnalysisStore((s) => s.setAnalysisType)

  const mutation = useRunDaylightFactor()

  const floorOptions = useMemo(() => {
    const storeys: SpatialTreeNode[] = []
    function findStoreys(nodes: SpatialTreeNode[]) {
      for (const node of nodes) {
        if (node.type.toUpperCase() === 'IFCBUILDINGSTOREY') {
          storeys.push(node)
        } else {
          findStoreys(node.children)
        }
      }
    }
    findStoreys(treeRoots)
    return storeys
  }, [treeRoots])

  const handleFloorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value
      deps.setSelectedFloor(val === '' ? null : Number(val))
    },
    [deps],
  )

  const handleAnalysisTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setAnalysisType(e.target.value as typeof analysisType)
    },
    [setAnalysisType],
  )

  const handleRunAnalysis = useCallback(() => {
    if (!modelBuffer || !modelInfo || selectedFloor === null) return

    const floorIndex = deps.getSelectedFloorIndex()
    if (floorIndex === null) return

    mutation.mutate({
      buffer: modelBuffer,
      filename: modelInfo.name,
      floorIndex,
      latitude: location.lat,
      longitude: location.lng,
    })
  }, [modelBuffer, modelInfo, selectedFloor, deps, location, mutation])

  const handleRetry = useCallback(() => {
    handleRunAnalysis()
  }, [handleRunAnalysis])

  const handleToggleOverlay = useCallback(() => {
    setShowOverlay(!showOverlay)
  }, [showOverlay, setShowOverlay])

  if (loadingState === 'idle' || loadingState === 'error') {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">Upload a model to get started.</p>
      </div>
    )
  }

  if (loadingState === 'loading' || loadingState === 'parsing') {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Model is loading...</p>
      </div>
    )
  }

  if (floorOptions.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">No floors found in model.</p>
      </div>
    )
  }

  const canRun = selectedFloor !== null && !mutation.isPending

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="analysis-floor-selector"
          className="block text-xs font-medium text-muted-foreground"
        >
          Floor
        </label>
        <select
          id="analysis-floor-selector"
          value={selectedFloor === null ? '' : String(selectedFloor)}
          onChange={handleFloorChange}
          className="w-full text-sm rounded border border-border bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Select floor for analysis"
          data-testid="analysis-floor-selector"
        >
          <option value="">Select a floor</option>
          {floorOptions.map((storey) => {
            const label = storey.name
              ? storey.name
              : `${formatIfcTypeName(storey.type)} #${storey.localId}`
            return (
              <option key={storey.localId} value={String(storey.localId)}>
                {label}
              </option>
            )
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="analysis-type-selector"
          className="block text-xs font-medium text-muted-foreground"
        >
          Analysis Type
        </label>
        <select
          id="analysis-type-selector"
          value={analysisType}
          onChange={handleAnalysisTypeChange}
          className="w-full text-sm rounded border border-border bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Select analysis type"
          data-testid="analysis-type-selector"
        >
          {SUPPORTED_INDOOR_ANALYSES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <LoadingButton
        loading={mutation.isPending}
        loadingText="Analyzing..."
        disabled={!canRun}
        onClick={handleRunAnalysis}
        variant="default"
        className="w-full"
        data-testid="run-analysis-button"
      >
        Run Analysis
      </LoadingButton>

      {mutation.isPending && analysisStep != null && (
        <p className="text-xs text-muted-foreground text-center" data-testid="analysis-step-text">
          {analysisStep === 'uploading' && 'Uploading file...'}
          {analysisStep === 'validating' && 'Validating IFC...'}
          {analysisStep === 'analyzing' && 'Running daylight analysis...'}
        </p>
      )}

      {mutation.isError && (
        <InlineError
          message={
            mutation.error instanceof Error ? mutation.error.message : 'Daylight analysis failed'
          }
          onRetry={handleRetry}
        />
      )}

      {heatmapData !== null && (
        <Button
          type="button"
          variant={showOverlay ? 'default' : 'outline'}
          onClick={handleToggleOverlay}
          className="w-full"
          data-testid="overlay-toggle-button"
        >
          {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </Button>
      )}
    </div>
  )
}
