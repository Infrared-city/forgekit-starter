/**
 * Tests for the fn-52.1 `useWorkflowStep` derived selector.
 *
 * One test per derivation branch from the module docstring:
 *   search, station, drawing, draw, error, ready, loading, default-loading
 *
 * The hook is pure — no store subscriptions, no hooks other than `useMemo`
 * — so these tests pass primitive inputs directly and assert the returned
 * `step`. No providers, no mocks, no stores.
 */
import { renderHook } from '@testing-library/react'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { describe, expect, it } from 'vitest'
import { useWorkflowStep, type WorkflowStepInputs } from '../useWorkflowStep'

// Minimal but structurally valid polygon — the hook only checks null-ness,
// so an empty shell is sufficient for "non-null polygon" branches. We never
// call `isPolygonSafeToFetch` from the hook (that lives in task 3).
const DUMMY_POLYGON: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ],
  ],
}

const BASE: WorkflowStepInputs = {
  hasUserChosenLocation: false,
  selectedStationId: null,
  areaPolygon: null,
  areaDrawing: false,
  buildingsQueryState: { isLoading: false, isError: false, isSuccess: false },
}

function run(overrides: Partial<WorkflowStepInputs>) {
  const inputs = { ...BASE, ...overrides }
  const { result } = renderHook(() => useWorkflowStep(inputs))
  return result.current.step
}

describe('useWorkflowStep', () => {
  it('returns "search" when the user has not chosen a location', () => {
    expect(run({ hasUserChosenLocation: false })).toBe('search')
  })

  it('returns "station" when a location is chosen but no station is selected', () => {
    expect(run({ hasUserChosenLocation: true, selectedStationId: null })).toBe('station')
  })

  it('returns "drawing" while the user is actively drawing a polygon', () => {
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaDrawing: true,
      }),
    ).toBe('drawing')
  })

  it('returns "drawing" even when a previous polygon is still in the store', () => {
    // Defensive: `areaDrawing: true` should win over the polygon existing.
    // This matches the derivation order in the module docstring (drawing
    // is checked before draw / ready), because a mid-draw edit of an
    // existing polygon should NOT reach the ready branch.
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaDrawing: true,
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: false, isError: false, isSuccess: true },
      }),
    ).toBe('drawing')
  })

  it('returns "draw" when a station is chosen but no polygon exists yet', () => {
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: null,
        areaDrawing: false,
      }),
    ).toBe('draw')
  })

  it('returns "error" when the buildings query has failed', () => {
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: false, isError: true, isSuccess: false },
      }),
    ).toBe('error')
  })

  it('prefers "error" over "ready" if the query transitioned to error after a success', () => {
    // Derivation ordering note from the docstring: isError is checked
    // before isSuccess so that a background refetch failure lands on
    // `error` rather than sticking on `ready`.
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: false, isError: true, isSuccess: true },
      }),
    ).toBe('error')
  })

  it('returns "ready" when the buildings query has succeeded', () => {
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: false, isError: false, isSuccess: true },
      }),
    ).toBe('ready')
  })

  it('prefers "ready" over "loading" during a background refetch', () => {
    // Derivation ordering note from the docstring: isSuccess is checked
    // before isLoading so a background refetch that briefly flips
    // `isLoading: true` does NOT blank the panel.
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: true, isError: false, isSuccess: true },
      }),
    ).toBe('ready')
  })

  it('returns "loading" when the buildings query is in its initial fetch', () => {
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: true, isError: false, isSuccess: false },
      }),
    ).toBe('loading')
  })

  it('defaults to "loading" when a polygon is set but all three query flags are false', () => {
    // Default-branch invariant: this is a transient first-render state that
    // React Query resolves to `isLoading: true` on the next frame. It is
    // only safe because task 3 rejects malformed polygons at commit time,
    // so `enabled` is always true by the time we reach this branch.
    expect(
      run({
        hasUserChosenLocation: true,
        selectedStationId: 'station-1',
        areaPolygon: DUMMY_POLYGON,
        buildingsQueryState: { isLoading: false, isError: false, isSuccess: false },
      }),
    ).toBe('loading')
  })
})
