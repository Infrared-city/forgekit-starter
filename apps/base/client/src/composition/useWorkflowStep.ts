/**
 * fn-52 workflow step selector.
 *
 * Derives the current step of the progressive-disclosure `/map` workflow
 * from existing store fields (no new state-machine slice). Pure function of
 * its arguments — the caller (`WorkflowPanel`) is the ONLY piece that
 * subscribes to the map / analysis stores, and it threads primitive values
 * in via `useShallow`. This matches the `rerender-derived-state-no-effect`
 * guidance from the Vercel React best-practices skill and makes the hook
 * trivial to unit test.
 *
 * Important invariant for the default branch: task 3's `useBuildingsInArea`
 * uses `enabled: polygon != null && isPolygonSafeToFetch(polygon)`. For a
 * malformed (e.g. self-intersecting) polygon, `enabled` stays false and all
 * three React Query flags remain `false` forever — which would get stuck on
 * the default-`loading` branch below. To prevent this, task 3's
 * `isPolygonSafeToFetch` treats malformed polygons as un-commit-able (the
 * draw plugin rejects the commit), so by the time `areaPolygon` is
 * non-null in the store, it has already passed the same validation. The
 * default→`loading` branch is therefore a transient first-render state
 * (React Query reports all flags `false` for one render before setting
 * `isLoading: true`), NOT a permanent sink. Future edits that weaken
 * task 3's validation MUST also revisit this branch.
 */

import type { Polygon as GeoJSONPolygon } from 'geojson'
import { useMemo } from 'react'

export type WorkflowStep = 'search' | 'station' | 'draw' | 'drawing' | 'loading' | 'ready' | 'error'

export interface WorkflowStepQueryState {
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

export interface WorkflowStepInputs {
  hasUserChosenLocation: boolean
  selectedStationId: string | null
  areaPolygon: GeoJSONPolygon | null
  areaDrawing: boolean
  buildingsQueryState: WorkflowStepQueryState
}

export interface WorkflowStepResult {
  step: WorkflowStep
}

/**
 * Derive the current workflow step from primitive inputs. Memoised on those
 * primitives only — never subscribes to any store, never calls any hook
 * other than `useMemo`. The caller destructures its subscription payload at
 * the call site and spreads the primitives into `inputs`; we do the same
 * here so the dep array stays primitive-only (not object identity based).
 *
 * Derivation order (first match wins):
 *
 *   1. `!hasUserChosenLocation`           → `search`
 *   2. `!selectedStationId`               → `station`
 *   3. `areaDrawing`                      → `drawing`
 *   4. `!areaPolygon`                     → `draw`
 *   5. `buildingsQueryState.isError`      → `error`
 *   6. `buildingsQueryState.isSuccess`    → `ready`
 *   7. `buildingsQueryState.isLoading`    → `loading`
 *   8. Default                            → `loading` (see invariant above)
 *
 * Ordering notes:
 *   - `isError` is checked before `isSuccess` so that a query which
 *     succeeded and then transitioned to error (background refetch failure)
 *     lands on `error` instead of sticking on `ready`.
 *   - `isSuccess` is checked before `isLoading` so that the first paint
 *     after a successful fetch lands on `ready` even if React Query briefly
 *     reports `isLoading: true` during a background refetch.
 */
export function useWorkflowStep(inputs: WorkflowStepInputs): WorkflowStepResult {
  const {
    hasUserChosenLocation,
    selectedStationId,
    areaPolygon,
    areaDrawing,
    buildingsQueryState: { isLoading, isError, isSuccess },
  } = inputs

  // areaPolygon is intentionally projected to a primitive here. The derivation
  // only cares about its null-ness, not the polygon identity, so two
  // different polygon objects with the same "is set" state collapse to the
  // same dep-array value and do not re-run the memo.
  const hasAreaPolygon = areaPolygon != null

  return useMemo<WorkflowStepResult>(() => {
    if (!hasUserChosenLocation) return { step: 'search' }
    if (!selectedStationId) return { step: 'station' }
    if (areaDrawing) return { step: 'drawing' }
    if (!hasAreaPolygon) return { step: 'draw' }
    if (isError) return { step: 'error' }
    if (isSuccess) return { step: 'ready' }
    if (isLoading) return { step: 'loading' }
    // Default: polygon set, query has not yet reached a terminal state.
    // See the default-branch invariant on the module docstring — this is a
    // one-render transient, never a permanent sink, given task 3's
    // pre-commit polygon validation.
    return { step: 'loading' }
  }, [
    hasUserChosenLocation,
    selectedStationId,
    areaDrawing,
    hasAreaPolygon,
    isError,
    isSuccess,
    isLoading,
  ])
}
