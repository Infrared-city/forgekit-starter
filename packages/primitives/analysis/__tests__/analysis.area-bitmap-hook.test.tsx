import { act, renderHook } from '@testing-library/react'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysesName } from '../core/analysis.sdk-types'

// Mock the bitmap-layer factory so we can inspect the options the hook
// passes without instantiating deck.gl. Each call returns a fresh sentinel
// object keyed on the provided matrix so identity checks in the
// memoization tests are meaningful.
//
// vi.mock is hoisted above top-level declarations, so we stash the spies
// inside vi.hoisted() to sidestep TDZ ReferenceErrors.
const { createAreaBitmapLayerMock, createColorScaleForAnalysisMock } = vi.hoisted(() => ({
  createAreaBitmapLayerMock: vi.fn((opts: { result: { mergedGrid: unknown } }) => ({
    __kind: 'bitmap-layer',
    matrixRef: opts.result.mergedGrid,
  })),
  createColorScaleForAnalysisMock: vi.fn(
    (_type: string, _opts: { minLegend: number; maxLegend: number }) => (_v: number | null) =>
      [0, 0, 0, 0] as [number, number, number, number],
  ),
}))

vi.mock('../react/analysis.area-bitmap-layer', () => ({
  createAreaBitmapLayer: (opts: { result: { mergedGrid: unknown } }) =>
    createAreaBitmapLayerMock(opts),
}))

vi.mock('../core/analysis.color-scales', async (importOriginal) => ({
  // Keep the real colorScaleVariantFor — the prebuilt fast path keys its
  // staleness check on it; only the scale factory is spied.
  ...(await importOriginal<typeof import('../core/analysis.color-scales')>()),
  createColorScaleForAnalysis: (type: string, opts: { minLegend: number; maxLegend: number }) =>
    createColorScaleForAnalysisMock(type, opts),
}))

import { useAreaBitmapLayer } from '../react/analysis.area-bitmap-hook'
import {
  type AreaRunResult,
  getAnalysisInitialState,
  useAnalysisStore,
} from '../react/analysis.store'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const samplePolygon: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [2.15, 41.38],
      [2.16, 41.38],
      [2.16, 41.39],
      [2.15, 41.39],
      [2.15, 41.38],
    ],
  ],
}

function makeResult(overrides: Partial<AreaRunResult> = {}): AreaRunResult {
  return {
    mergedGrid: [
      [1, 2, 3],
      [4, 5, 6],
    ],
    gridShape: [2, 3],
    gridBounds: { west: 2.15, south: 41.38, east: 2.16, north: 41.39 },
    polygon: samplePolygon,
    analysisType: AnalysesName.WindSpeed,
    failedJobs: [],
    skippedJobs: [],
    totalJobs: 1,
    succeededJobs: 1,
    ...overrides,
  }
}

function resetStore() {
  useAnalysisStore.setState(getAnalysisInitialState())
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useAreaBitmapLayer', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('returns null when areaStatus is idle', () => {
    const { result } = renderHook(() => useAreaBitmapLayer())
    expect(result.current).toBeNull()
    expect(createAreaBitmapLayerMock).not.toHaveBeenCalled()
  })

  it('returns null when areaStatus is running even if a result is set', () => {
    useAnalysisStore.setState({
      areaStatus: 'running',
      areaResult: makeResult(),
    })
    const { result } = renderHook(() => useAreaBitmapLayer())
    expect(result.current).toBeNull()
    expect(createAreaBitmapLayerMock).not.toHaveBeenCalled()
  })

  it('returns null when status is success but areaResult is null', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: null,
    })
    const { result } = renderHook(() => useAreaBitmapLayer())
    expect(result.current).toBeNull()
  })

  it('builds a bitmap layer on success with min/max computed over non-null cells', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        mergedGrid: [
          [1, null, 3],
          [null, 5, null],
        ],
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).not.toBeNull()
    // Null cells must be skipped: domain is [1, 5], not [0, 5] or [NaN, 5].
    expect(createColorScaleForAnalysisMock).toHaveBeenCalledWith(AnalysesName.WindSpeed, {
      minLegend: 1,
      maxLegend: 5,
    })
    expect(createAreaBitmapLayerMock).toHaveBeenCalledTimes(1)
  })

  it('uses sentinel 0..1 domain for an all-null matrix', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        mergedGrid: [
          [null, null, null],
          [null, null, null],
        ],
      }),
    })

    renderHook(() => useAreaBitmapLayer())

    // With every cell null, min/max would be ±Infinity — the hook MUST
    // substitute finite sentinels to keep the color-scale factory sane.
    expect(createColorScaleForAnalysisMock).toHaveBeenCalledWith(AnalysesName.WindSpeed, {
      minLegend: 0,
      maxLegend: 1,
    })
  })

  it('returns null and does not build a layer when gridShape mismatches mergedGrid', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        // Actual matrix is 2×3, but we claim 3×3. The hook must warn and
        // skip, not render a misaligned heatmap.
        mergedGrid: [
          [1, 2, 3],
          [4, 5, 6],
        ],
        gridShape: [3, 3],
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).toBeNull()
    expect(createAreaBitmapLayerMock).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('returns null and warns when mergedGrid rows are jagged', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        // First row defines width = 3, second row has width = 2 — a jagged
        // response would make matrixToImageData read `undefined` past the
        // row end and throw inside the color scale. The hook must warn +
        // skip instead of crashing the map.
        mergedGrid: [[1, 2, 3], [4, 5] as unknown as (number | null)[]],
        gridShape: [2, 3],
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).toBeNull()
    expect(createAreaBitmapLayerMock).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('returns null for an empty matrix (height 0)', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        mergedGrid: [],
        gridShape: [0, 0],
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).toBeNull()
    expect(createAreaBitmapLayerMock).not.toHaveBeenCalled()
  })

  it('returns null for an empty matrix (width 0)', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        mergedGrid: [[], []],
        gridShape: [2, 0],
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).toBeNull()
    expect(createAreaBitmapLayerMock).not.toHaveBeenCalled()
  })

  it('memoises the layer across re-renders when areaResult is unchanged', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult(),
    })

    const { result, rerender } = renderHook(() => useAreaBitmapLayer())
    const first = result.current

    // Force a re-render without changing store state.
    rerender()
    const second = result.current

    expect(second).toBe(first)
    // Factory must only have fired once — the memo is the whole point of
    // this hook (matrix→ImageData is the expensive step).
    expect(createAreaBitmapLayerMock).toHaveBeenCalledTimes(1)
  })

  it('takes the prebuilt fast path when dimensions and variant match', () => {
    const prebuilt = {
      pixels: new Uint8ClampedArray(2 * 3 * 4),
      width: 3,
      height: 2,
      min: 1,
      max: 6,
    }
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({ prebuiltBitmap: prebuilt }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).not.toBeNull()
    expect(createAreaBitmapLayerMock).toHaveBeenCalledTimes(1)
    const opts = createAreaBitmapLayerMock.mock.calls[0][0] as Record<string, unknown>
    expect(opts.prebuilt).toBe(prebuilt)
    expect(opts.colorScale).toBeUndefined()
    // The whole point: no main-thread scale build (and no grid scan).
    expect(createColorScaleForAnalysisMock).not.toHaveBeenCalled()
  })

  it('falls back to the main-thread build when the prebuilt variant is stale', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        prebuiltBitmap: {
          pixels: new Uint8ClampedArray(2 * 3 * 4),
          width: 3,
          height: 2,
          min: 1,
          max: 6,
          // WindSpeed resolves to variant undefined — a baked variant means
          // the pixels no longer match the live scale settings.
          variant: 'stale-criteria',
        },
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).not.toBeNull()
    expect(createColorScaleForAnalysisMock).toHaveBeenCalledTimes(1)
    const opts = createAreaBitmapLayerMock.mock.calls[0][0] as Record<string, unknown>
    expect(opts.prebuilt).toBeUndefined()
    expect(opts.colorScale).toBeDefined()
  })

  it('falls back to the main-thread build when prebuilt dimensions mismatch the grid', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult({
        prebuiltBitmap: {
          pixels: new Uint8ClampedArray(5 * 5 * 4),
          width: 5,
          height: 5,
          min: 1,
          max: 6,
        },
      }),
    })

    const { result } = renderHook(() => useAreaBitmapLayer())

    expect(result.current).not.toBeNull()
    expect(createColorScaleForAnalysisMock).toHaveBeenCalledTimes(1)
    const opts = createAreaBitmapLayerMock.mock.calls[0][0] as Record<string, unknown>
    expect(opts.prebuilt).toBeUndefined()
  })

  it('rebuilds the layer when a new areaResult is written to the store', () => {
    useAnalysisStore.setState({
      areaStatus: 'success',
      areaResult: makeResult(),
    })

    const { result, rerender } = renderHook(() => useAreaBitmapLayer())
    const first = result.current
    expect(first).not.toBeNull()

    // Write a fresh result — different matrix identity forces recompute.
    // Wrap the external state mutation in act() because the store
    // subscription will trigger a React render synchronously.
    act(() => {
      useAnalysisStore.setState({
        areaResult: makeResult({
          mergedGrid: [
            [10, 20],
            [30, 40],
          ],
          gridShape: [2, 2],
        }),
      })
    })
    rerender()

    expect(result.current).not.toBe(first)
    expect(createAreaBitmapLayerMock).toHaveBeenCalledTimes(2)
  })
})
