import type { AreaPreviewQueryResult, RunAreaInput } from '@forge-kit/analysis'
import {
  ANALYSIS_ICONS,
  ANALYSIS_TYPE_LABELS,
  AnalysesName,
  TILING_SUPPORTED_TYPES,
  useAnalysisStore,
} from '@forge-kit/analysis'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, cn } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { AnalysisConfigInputs } from './AnalysisConfigInputs'
import { AreaActualCostCard, AreaCostCard, formatEstimatedTime } from './AreaCostCard'

/** Ticking elapsed-time display that updates every second while mounted. */
function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - startedAt) / 1000))

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const min = Math.floor(elapsed / 60)
  const sec = elapsed % 60
  return <span className="tabular-nums">{min > 0 ? `${min}m ${sec}s` : `${sec}s`}</span>
}

/**
 * Dependencies injected into `AreaAnalysisTab` from `useAnalysisMapPlugin`.
 *
 * Mirrors the old `AreaTabDeps` shape (same three fields) so the
 * composition root does not need to change to satisfy the new name — the
 * values are `{ useAreaPreview, onRunArea, onCancelArea }`:
 *
 *   - `useAreaPreview` is the React Query hook produced by
 *     `createUseAreaPreview(apiClient)`. It reads `areaPolygon` +
 *     `areaAnalysisType` from the store and returns a narrow query result
 *     shape consumed by `AreaCostCard`.
 *   - `onRunArea` / `onCancelArea` are the run-hook callbacks wired at
 *     the plugin level (`uiConfig.useRunArea()` inside
 *     `useAnalysisMapPlugin`) — we receive them as plain functions
 *     rather than re-invoking the hook here so the run lifecycle
 *     reference stays mounted across panel tab switches.
 */
export interface AreaAnalysisTabDeps {
  /**
   * Hook returned by `createUseAreaPreview(apiClient)`. Called inside the
   * component (not at plugin-level) because it depends on store state that
   * changes with the polygon; the preview-query factory already gates
   * `enabled` on `areaPolygon != null && areaAnalysisType != null`, so a
   * fresh observer is not a wasted fetch.
   */
  useAreaPreview: () => AreaPreviewQueryResult
  /**
   * Start an area run. Resolved from `uiConfig.useRunArea().start` at the
   * plugin level so the run hook keeps its abort-controller ref across
   * panel unmounts (the user can switch tabs mid-run without cancelling).
   */
  onRunArea: (input: RunAreaInput) => Promise<void>
  /** Abort the in-flight run. See `onRunArea` above. */
  onCancelArea: () => void
  /**
   * Returns the picked address location. The primitive does not access the
   * map store directly — the composition root bridges this from
   * `buildingsViewport.latitude/longitude`.
   */
  getLocation: () => { latitude: number; longitude: number }
  /**
   * Returns the pre-fetched buildings dict from the React Query cache.
   * When provided, the run endpoint skips the redundant SDK buildings
   * fetch — saving 5-30 s per analysis run.
   */
  getBuildings: () => Record<string, unknown> | undefined
  /** SDK ground-material layers from the ground-materials store. */
  getGroundMaterials: () =>
    | Record<string, { features?: Array<Record<string, unknown>> }>
    | undefined
  /** SDK vegetation features from the vegetation store. */
  getVegetation: () => Record<string, Record<string, unknown>> | undefined
}

export interface AreaAnalysisTabProps {
  deps: AreaAnalysisTabDeps
}

/**
 * Supported analysis types for tiled area runs. Derived once at module
 * level from `TILING_SUPPORTED_TYPES`, filtered through
 * `ANALYSIS_TYPE_LABELS` so any SDK-side addition that is NOT yet labelled
 * in the constants file is silently dropped. Sorted by label for stable
 * rendering order across renders.
 */
const SUPPORTED_AREA_TYPES: ReadonlyArray<AnalysesName> = (() => {
  const labelled = Object.keys(ANALYSIS_TYPE_LABELS) as AnalysesName[]
  return labelled
    .filter((type) => TILING_SUPPORTED_TYPES.has(type))
    .sort((a, b) => ANALYSIS_TYPE_LABELS[a].localeCompare(ANALYSIS_TYPE_LABELS[b]))
})()

/**
 * Body-only tab component for the fn-52 `WorkflowPanel` Analysis tab.
 *
 * Layout:
 *   1. Analysis type picker (grid of tiles)
 *   2. `AreaCostCard` (only when type + polygon set) OR run lifecycle UI
 *   3. Inline status / hint rows
 *
 * There is no tab switcher inside this component — the whole thing IS the
 * Analysis tab. No mount effect seeds `areaAnalysisType` either; unseeded
 * means Run is disabled and the user is shown a hint to pick a type.
 *
 * The run lifecycle branches (`running`, `success`, `error`) mirror the
 * patterns from the old `AreaTabContent` verbatim — they are the canonical
 * polygon-run UI states in the area primitive.
 */
export function AreaAnalysisTab({ deps }: AreaAnalysisTabProps) {
  'use no memo' // Opts out of React Compiler — calls an injected hook function (useAreaPreview)
  const {
    useAreaPreview,
    onRunArea,
    onCancelArea,
    getLocation,
    getBuildings,
    getGroundMaterials,
    getVegetation,
  } = deps

  const {
    areaPolygon,
    areaAnalysisType,
    areaStatus,
    areaResult,
    areaError,
    areaRunMeta,
    areaProgress,
    lastRunWindow,
    setAreaError,
    setAreaStatus,
    setAreaRunMeta,
    resetArea,
  } = useAnalysisStore(
    useShallow((s) => ({
      areaPolygon: s.areaPolygon,
      areaAnalysisType: s.areaAnalysisType,
      areaStatus: s.areaStatus,
      areaResult: s.areaResult,
      areaError: s.areaError,
      areaRunMeta: s.areaRunMeta,
      areaProgress: s.areaProgress,
      lastRunWindow: s.lastRunWindow,
      setAreaError: s.setAreaError,
      setAreaStatus: s.setAreaStatus,
      setAreaRunMeta: s.setAreaRunMeta,
      resetArea: s.resetArea,
    })),
  )

  // Preview query is called unconditionally (hooks rule). Its `enabled`
  // gate inside the factory already handles the "no polygon / no type"
  // case, so re-rendering with a different `areaAnalysisType` auto-refetches.
  const previewQuery = useAreaPreview()

  // Disable the picker tiles while an area run is in flight. Changing the
  // analysis type mid-run races the in-flight POST: `setAreaAnalysisType`
  // flips `areaStatus` back to `'idle'` and clears `areaResult` / `areaError`
  // per the fn-51 contract, but the request continues and `createUseRunArea`
  // will still call `setAreaResult(...)` when it resolves, resurrecting a
  // stale bitmap for a run the user implicitly abandoned. Same class of
  // guard as the `WorkflowPanel` Redraw link, which is blocked on
  // `areaStatus === 'running'` for the same reason.
  const pickerDisabled = areaStatus === 'running'

  // Picker click handler — reads the store action lazily inside
  // `useAnalysisStore.getState()` so there is no subscription churn
  // from re-grabbing the selector on every render. `setAreaAnalysisType`
  // per the fn-51 store contract invalidates the cached run (clears
  // `areaResult` / `areaError` and flips status back to `'idle'`), so
  // we do not need to `resetArea` explicitly here. The `pickerDisabled`
  // gate above prevents this handler from firing mid-run.
  const handlePickType = (type: AnalysesName) => {
    useAnalysisStore.getState().setAreaAnalysisType(type)
  }

  const handleRun = () => {
    if (!areaPolygon || !areaAnalysisType) {
      return
    }

    const store = useAnalysisStore.getState()
    const { latitude, longitude } = getLocation()

    // Build the payload with all per-type fields the server needs.
    // Fields are forwarded verbatim — the Python API's `_build_sdk_payload`
    // dispatches on `analysisType` and validates per-type requirements.
    const input: RunAreaInput = {
      polygon: areaPolygon,
      analysisType: areaAnalysisType,
      buildings: getBuildings(),
      groundMaterials: getGroundMaterials(),
      vegetation: getVegetation(),
      latitude,
      longitude,
    }

    if (areaAnalysisType === AnalysesName.WindSpeed) {
      input.windSpeed = store.windSpeed
      input.windDirection = store.windDirection
    } else if (areaAnalysisType !== AnalysesName.SkyViewFactors) {
      // All remaining types need dateFilters (solar, SR, UTCI, TCS, PWC).
      // The server auto-fetches weather from lat/lon + dateFilters when
      // weatherData is not provided.
      input.dateFilters = store.dateFilters
    }

    if (areaAnalysisType === AnalysesName.ThermalComfortStatistics) {
      input.subtype = store.tcsSubtype
    }
    if (areaAnalysisType === AnalysesName.PedestrianWindComfort) {
      input.criteria = store.pwcCriteria
    }

    // Snapshot preview metadata so the running-state UI can show tile
    // count + estimated time without re-querying the preview endpoint.
    if (previewQuery.data) {
      setAreaRunMeta({
        tileCount: previewQuery.data.tileCount,
        estimatedTimeS: previewQuery.data.estimatedTimeS,
      })
    }

    void onRunArea(input)
  }

  const handleCancel = () => {
    onCancelArea()
  }

  const handleClearResult = () => {
    // The fn-51 `resetArea` action clears
    // polygon/type/result/error/status/drawing but intentionally LEAVES
    // `areaMode` on — see `analysis.store.ts` (`resetArea` inline
    // comment: "areaMode is intentionally NOT reset — the caller decides
    // whether mode goes off"). The fn-52.5 epic spec asserts the
    // opposite in its constraints block, but the store is the source of
    // truth. In the new workflow, `WorkflowPanel`'s Redraw link
    // re-enters draw mode from here if the user wants to start over.
    resetArea()
  }

  const handleRetry = () => {
    setAreaError(null)
    setAreaStatus('idle')
    handleRun()
  }

  const handleDismissError = () => {
    setAreaError(null)
    setAreaStatus('idle')
  }

  return (
    <div className="space-y-4 p-4">
      {/* Analysis type picker */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Analysis type</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Analysis type picker">
          {SUPPORTED_AREA_TYPES.map((type) => {
            const Icon = ANALYSIS_ICONS[type]
            const selected = areaAnalysisType === type
            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                disabled={pickerDisabled}
                title={pickerDisabled ? 'Cancel the running analysis to change type' : undefined}
                onClick={() => handlePickType(type)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-md border p-2.5 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  selected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-card hover:bg-muted/50',
                )}
              >
                <Icon
                  className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')}
                />
                <span
                  className={cn(
                    'text-xs font-medium leading-tight',
                    selected ? 'text-foreground' : 'text-foreground/90',
                  )}
                >
                  {ANALYSIS_TYPE_LABELS[type]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Per-type config inputs (wind sliders, time period, subtype, criteria) */}
      {areaAnalysisType != null && areaStatus !== 'running' && (
        <AnalysisConfigInputs analysisType={areaAnalysisType} />
      )}

      {/* Run-lifecycle body */}
      {areaStatus === 'error' ? (
        <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{areaError ?? 'Area run failed'}</p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleRetry}>
              Retry
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleDismissError}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : areaStatus === 'running' ? (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>
              {areaProgress?.phase === 'buildings'
                ? 'Fetching buildings…'
                : 'Running area analysis…'}
            </span>
          </div>

          {/* Tile progress bar */}
          {areaProgress && areaProgress.phase === 'analysis' && areaProgress.total > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tiles</span>
                <span className="font-medium tabular-nums text-foreground">
                  {areaProgress.succeeded + areaProgress.failed}/{areaProgress.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.round(((areaProgress.succeeded + areaProgress.failed) / areaProgress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {areaRunMeta && (
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Estimated</span>
                <span className="font-medium text-foreground">
                  {formatEstimatedTime(areaRunMeta.estimatedTimeS)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Elapsed</span>
                <span className="font-medium text-foreground">
                  <ElapsedTimer startedAt={areaRunMeta.startedAt} />
                </span>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Stay on the map page to keep the run alive.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      ) : areaStatus === 'success' ? (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="space-y-1 text-sm text-foreground">
            <p className="font-medium">Area run complete</p>
            {areaResult ? (
              <p className="text-xs text-muted-foreground">
                {areaResult.succeededJobs} / {areaResult.totalJobs} jobs succeeded
                {areaResult.failedJobs.length > 0
                  ? ` · ${areaResult.failedJobs.length} failed`
                  : ''}
              </p>
            ) : null}
          </div>
          {lastRunWindow ? (
            <AreaActualCostCard
              startedAt={lastRunWindow.startedAt}
              completedAt={lastRunWindow.completedAt}
              analysisType={lastRunWindow.analysisType}
            />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearResult}
            className="w-full"
          >
            Clear result
          </Button>
        </div>
      ) : areaAnalysisType == null ? (
        // Idle + no type picked → disabled run button + hint.
        <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Pick an analysis type to see an estimate.</p>
          <Button type="button" disabled className="w-full">
            Run analysis
          </Button>
        </div>
      ) : areaPolygon == null ? (
        // Defensive: unreachable in the WorkflowPanel (tabs are gated on
        // `step === 'ready'` which requires a committed polygon), but
        // kept so direct `AreaAnalysisTab` renders in tests and in
        // non-workflow hosts degrade gracefully.
        <p className="text-sm text-muted-foreground">Draw an area first.</p>
      ) : (
        // Idle + type picked + polygon → AreaCostCard with live preview.
        // `AreaCostCard` disables its own Run button while the preview
        // query is pending / errored / zero-tile, and the running/error
        // branches above take over once `areaStatus` leaves `'idle'`.
        <AreaCostCard query={previewQuery} onRun={handleRun} />
      )}
    </div>
  )
}
