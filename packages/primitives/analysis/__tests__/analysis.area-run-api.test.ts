import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { InfraredClient } from '@infrared-city/infrared-sdk-ts'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysesName } from '../core/analysis.sdk-types'
import {
  AREA_RUN_TIMEOUT_MS,
  createUseRunArea,
  type RunAreaInput,
} from '../react/analysis.area-run-api'
import { getAnalysisInitialState, useAnalysisStore } from '../react/analysis.store'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

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

const baseInput: RunAreaInput = {
  polygon: samplePolygon,
  analysisType: AnalysesName.WindSpeed,
  // Non-empty buildings dict so the geometry guard in area-run-api
  // ("No building data loaded…") passes and these tests exercise the run path.
  buildings: { b1: { id: 'b1' } },
}

const mockAreaResult = {
  mergedGrid: Float64Array.from([0.1, NaN, 0.3, NaN, 0.5, NaN]),
  gridShape: [2, 3] as [number, number],
  failedJobs: [] as Array<{ tileId: string; error?: string }>,
  skippedJobs: [] as string[],
  executionTime: 1.0,
}

type MockClient = {
  runAreaAndWait: ReturnType<typeof vi.fn>
  weather: { filterWeatherData: ReturnType<typeof vi.fn> }
}

function makeMockClient(): MockClient {
  return {
    runAreaAndWait: vi.fn().mockImplementation((_input, _polygon, opts) => {
      // Surface a single progress tick so totals propagate to the store.
      opts?.onProgress?.({
        totalCount: 1,
        completedCount: 1,
        failedCount: 0,
        skippedCount: 0,
        pendingCount: 0,
        runningCount: 0,
        isComplete: true,
      })
      return Promise.resolve(mockAreaResult)
    }),
    weather: {
      filterWeatherData: vi.fn().mockResolvedValue([]),
    },
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function resetStore() {
  useAnalysisStore.setState(getAnalysisInitialState())
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createUseRunArea', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    resetStore()
  })

  it('exposes the 15-minute timeout constant', () => {
    expect(AREA_RUN_TIMEOUT_MS).toBe(15 * 60 * 1000)
  })

  it('calls client.runAreaAndWait once per start()', async () => {
    const mockClient = makeMockClient()
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    expect(mockClient.runAreaAndWait).toHaveBeenCalledTimes(1)
  })

  it('short-circuits with an actionable error when no buildings or vegetation are loaded', async () => {
    const mockClient = makeMockClient()
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      // No `buildings` / `vegetation` → the geometry guard must fire before
      // any SDK call (empty tiles otherwise 400 at the backend).
      await result.current.start({ polygon: samplePolygon, analysisType: AnalysesName.WindSpeed })
    })

    expect(mockClient.runAreaAndWait).not.toHaveBeenCalled()
    const state = useAnalysisStore.getState()
    expect(state.areaStatus).toBe('error')
    expect(state.areaError).toContain('No building data loaded')
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('No building data loaded'), {
      id: 'area-run',
    })
  })

  it('transitions idle → running → success', async () => {
    const mockClient = makeMockClient()
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)

    const statuses: string[] = []
    const unsubscribe = useAnalysisStore.subscribe((s, prev) => {
      if (s.areaStatus !== prev.areaStatus) statuses.push(s.areaStatus)
    })

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    unsubscribe()

    const state = useAnalysisStore.getState()
    expect(statuses).toEqual(['running', 'success'])
    expect(state.areaStatus).toBe('success')
    expect(state.areaError).toBeNull()
    expect(state.areaResult).toBeDefined()
    expect(state.areaResult?.gridShape).toEqual([2, 3])
    // NaN values should be null
    expect(state.areaResult?.mergedGrid[0][1]).toBeNull()
  })

  it('emits a success toast when the run completes', async () => {
    const mockClient = makeMockClient()
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    expect(toast.success).toHaveBeenCalledWith('Area analysis complete', { id: 'area-run' })
  })

  it('transitions idle → running → error on SDK failure', async () => {
    const mockClient = makeMockClient()
    mockClient.runAreaAndWait.mockRejectedValue(new Error('Analysis type not supported'))
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    const state = useAnalysisStore.getState()
    expect(state.areaStatus).toBe('error')
    expect(state.areaError).toBe('Analysis type not supported')
    expect(state.areaResult).toBeNull()
  })

  it('emits an error toast on SDK failure', async () => {
    const mockClient = makeMockClient()
    mockClient.runAreaAndWait.mockRejectedValue(new Error('Boom'))
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    expect(toast.error).toHaveBeenCalledWith('Boom', { id: 'area-run' })
  })

  it('uses a generic error message when the rejection is not an Error instance', async () => {
    const mockClient = makeMockClient()
    mockClient.runAreaAndWait.mockRejectedValue('plain-string-error')
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    const state = useAnalysisStore.getState()
    expect(state.areaError).toBe('Area analysis failed')
  })

  it('cancel() sets status to idle and emits a cancelled toast', async () => {
    const mockClient = makeMockClient()
    mockClient.runAreaAndWait.mockImplementation(
      () => new Promise(() => {}), // never resolves
    )
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunArea())

    act(() => {
      void result.current.start(baseInput)
    })

    await waitFor(() => {
      expect(useAnalysisStore.getState().areaStatus).toBe('running')
    })

    act(() => {
      result.current.cancel()
    })

    expect(useAnalysisStore.getState().areaStatus).toBe('idle')
    expect(toast).toHaveBeenCalledWith('Cancelled', { id: 'area-run' })
  })

  it('records failed tiles in the result', async () => {
    const mockClient = makeMockClient()
    mockClient.runAreaAndWait.mockImplementation((_input, _polygon, opts) => {
      opts?.onProgress?.({
        totalCount: 2,
        completedCount: 0,
        failedCount: 2,
        skippedCount: 0,
        pendingCount: 0,
        runningCount: 0,
        isComplete: true,
      })
      return Promise.resolve({
        ...mockAreaResult,
        failedJobs: [
          { tileId: 'failed-1', error: 'boom' },
          { tileId: 'failed-2', error: 'boom' },
        ],
      })
    })
    const useRunArea = createUseRunArea(mockClient as unknown as InfraredClient)

    const { result } = renderHook(() => useRunArea())

    await act(async () => {
      await result.current.start(baseInput)
    })

    const state = useAnalysisStore.getState()
    expect(state.areaResult?.failedJobs).toEqual(['failed-1', 'failed-2'])
  })
})

// ─── No tiling subpath imports assertion ────────────────────────────────────

describe('no tiling imports', () => {
  it('downstream files do not deep-import @infrared-city/infrared-sdk-ts/tiling', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const paths = [
      resolve(here, '../react/analysis.area-run-api.ts'),
      resolve(here, '../react/analysis.area-bitmap-layer.ts'),
      resolve(here, '../react/analysis.area-bitmap-hook.ts'),
    ]
    for (const p of paths) {
      const source = readFileSync(p, 'utf8')
      expect(source, `${p} must not import @infrared-city/infrared-sdk-ts/tiling`).not.toContain(
        '@infrared-city/infrared-sdk-ts/tiling',
      )
    }
  })
})
