import {
  AnalysesName,
  type AreaPreviewQueryResult,
  getAnalysisInitialState,
  useAnalysisStore,
} from '@forge-kit/analysis'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AreaAnalysisTab, type AreaAnalysisTabDeps } from '../AreaAnalysisTab'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Stub `AnalysisConfigInputs` — the real component reads from the analysis
// store and renders radix-ui Slider, which hits a dual-React-instance issue
// in the test env. The config inputs have their own store-level coverage.
vi.mock('../AnalysisConfigInputs', () => ({
  AnalysisConfigInputs: () => <div data-testid="analysis-config-inputs" />,
}))

// Stub `AreaCostCard` so the tab's branching is the only thing under test.
// The real card has its own unit coverage in `AreaCostCard.test.tsx`.
vi.mock('../AreaCostCard', () => ({
  AreaCostCard: ({ query, onRun }: { query: AreaPreviewQueryResult; onRun: () => void }) => (
    <div data-testid="area-cost-card">
      {query.isPending && <span>pending</span>}
      {query.isError && <span>error:{query.error?.message}</span>}
      {query.data && (
        <>
          <span>tiles:{query.data.tileCount}</span>
          <span>time:{query.data.estimatedTimeS}</span>
          <span>cost:{query.data.estimatedCostTokens}</span>
        </>
      )}
      <button type="button" onClick={onRun}>
        run
      </button>
    </div>
  ),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function resetStore() {
  useAnalysisStore.setState(getAnalysisInitialState())
}

function makeQuery(overrides: Partial<AreaPreviewQueryResult> = {}): AreaPreviewQueryResult {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  }
}

interface RenderOverrides {
  onRunArea?: ReturnType<typeof vi.fn>
  onCancelArea?: ReturnType<typeof vi.fn>
}

/**
 * Deps-injection render helper — mirrors the `createMockDeps` pattern
 * from the old `AnalysisPanel` tests. Every caller opts out of the
 * store state explicitly so no test accidentally inherits a polygon or
 * a type from a previous case.
 */
function renderTab(query: AreaPreviewQueryResult = makeQuery(), overrides: RenderOverrides = {}) {
  const useAreaPreview = () => query
  const onRunArea = overrides.onRunArea ?? vi.fn().mockResolvedValue(undefined)
  const onCancelArea = overrides.onCancelArea ?? vi.fn()
  const getLocation = () => ({ latitude: 48.1983, longitude: 11.575 })
  const getBuildings = () => undefined
  const getGroundMaterials = () => undefined
  const getVegetation = () => undefined
  const deps: AreaAnalysisTabDeps = {
    useAreaPreview,
    onRunArea,
    onCancelArea,
    getLocation,
    getBuildings,
    getGroundMaterials,
    getVegetation,
  }
  return {
    ...render((<AreaAnalysisTab deps={deps} />) as ReactNode),
    onRunArea,
    onCancelArea,
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AreaAnalysisTab', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  // ─── Picker ─────────────────────────────────────────────────────────────

  describe('analysis type picker', () => {
    it('renders a tile for each TILING_SUPPORTED_TYPES entry (≥ 1 tile)', () => {
      renderTab()
      const tiles = screen.getAllByRole('button', { pressed: false })
      // At least one analysis type — the exact count is an SDK concern.
      expect(tiles.length).toBeGreaterThan(0)
    })

    it('no tile has aria-pressed=true when areaAnalysisType is null', () => {
      renderTab()
      const pressedTiles = screen.queryAllByRole('button', { pressed: true })
      expect(pressedTiles).toHaveLength(0)
    })

    it('clicking a tile calls setAreaAnalysisType on the store with that type', () => {
      renderTab()
      // Pick any tile — look up by its label text so the test is
      // stable against SDK additions.
      const tile = screen.getByRole('button', { name: /Solar Radiation/i })
      fireEvent.click(tile)
      const state = useAnalysisStore.getState()
      expect(state.areaAnalysisType).toBe(AnalysesName.SolarRadiation)
    })

    it('the selected tile has aria-pressed=true', () => {
      useAnalysisStore.setState({ areaAnalysisType: AnalysesName.WindSpeed })
      renderTab()
      const selected = screen.getByRole('button', { name: /Wind Speed/i })
      expect(selected).toHaveAttribute('aria-pressed', 'true')
    })
  })

  // ─── No type picked ─────────────────────────────────────────────────────

  describe('no type picked', () => {
    it('shows the "pick a type" hint and a disabled Run button (before clicking)', () => {
      renderTab()
      expect(screen.getByText(/Pick an analysis type/i)).toBeInTheDocument()
      const runButton = screen.getByRole('button', { name: /Run analysis/i })
      expect(runButton).toBeDisabled()
      expect(screen.queryByTestId('area-cost-card')).toBeNull()
    })

    it('after clicking a tile, setAreaAnalysisType fires so the store updates', () => {
      renderTab()
      fireEvent.click(screen.getByRole('button', { name: /Direct Sun Hours/i }))
      expect(useAnalysisStore.getState().areaAnalysisType).toBe(AnalysesName.DirectSunHours)
    })
  })

  // ─── Ready-to-run ───────────────────────────────────────────────────────

  describe('ready to run', () => {
    it('renders the AreaCostCard when type + polygon + idle', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'idle',
      })
      renderTab(
        makeQuery({
          data: { tileCount: 12, estimatedTimeS: 120, estimatedCostTokens: 1200 },
        }),
      )
      const card = screen.getByTestId('area-cost-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('tiles:12')
    })

    it('clicking the cost card run button calls onRunArea with polygon + type', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'idle',
      })
      const onRunArea = vi.fn().mockResolvedValue(undefined)
      renderTab(
        makeQuery({
          data: { tileCount: 4, estimatedTimeS: 40, estimatedCostTokens: 400 },
        }),
        { onRunArea },
      )
      fireEvent.click(screen.getByText('run'))
      expect(onRunArea).toHaveBeenCalledTimes(1)
      expect(onRunArea).toHaveBeenCalledWith(
        expect.objectContaining({
          polygon: samplePolygon,
          analysisType: AnalysesName.WindSpeed,
        }),
      )
    })

    it('bails silently when the polygon is missing', () => {
      useAnalysisStore.setState({
        areaPolygon: null,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'idle',
      })
      const onRunArea = vi.fn().mockResolvedValue(undefined)
      renderTab(makeQuery(), { onRunArea })
      // No cost card, but the store has a type set — the tab should
      // render the "draw an area first" defensive hint instead of
      // posting an empty run.
      expect(screen.getByText(/Draw an area first/i)).toBeInTheDocument()
      expect(onRunArea).not.toHaveBeenCalled()
    })
  })

  // ─── Running ────────────────────────────────────────────────────────────

  describe('running', () => {
    it('shows the running banner and a working Cancel button', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'running',
      })
      const onCancelArea = vi.fn()
      renderTab(makeQuery(), { onCancelArea })
      expect(screen.getByText(/Running area analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/Stay on the map page/i)).toBeInTheDocument()
      expect(screen.queryByTestId('area-cost-card')).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
      expect(onCancelArea).toHaveBeenCalledTimes(1)
    })

    it('disables the picker tiles while an area run is in flight', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'running',
      })
      renderTab()

      // Every picker tile (identified by aria-pressed being set) must be
      // `disabled`. The Cancel button above them is NOT pressed/pressable
      // so it does not match this selector.
      const pickerTiles = screen
        .getAllByRole('button')
        .filter((el) => el.hasAttribute('aria-pressed'))
      expect(pickerTiles.length).toBeGreaterThan(0)
      for (const tile of pickerTiles) {
        expect(tile).toBeDisabled()
      }
    })

    it('picker click is a no-op while running (store areaAnalysisType stays put)', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'running',
      })
      renderTab()

      // Click a DIFFERENT type's tile; the disabled attribute should make
      // React skip the synthetic click handler and the store value must
      // not change. This is the race guard: mutating `areaAnalysisType`
      // mid-run would clear `areaStatus` and let a late `setAreaResult`
      // resurrect a stale bitmap.
      const otherTile = screen.getByRole('button', { name: /Solar Radiation/i })
      fireEvent.click(otherTile)
      expect(useAnalysisStore.getState().areaAnalysisType).toBe(AnalysesName.WindSpeed)
    })
  })

  // ─── Success ────────────────────────────────────────────────────────────

  describe('success', () => {
    it('shows the job summary and wires Clear result to resetArea', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'success',
        areaResult: {
          mergedGrid: [[0.1, 0.2]],
          gridShape: [1, 2],
          gridBounds: { west: 0, south: 0, east: 1, north: 1 },
          polygon: samplePolygon,
          analysisType: AnalysesName.WindSpeed,
          failedJobs: [],
          skippedJobs: [],
          totalJobs: 3,
          succeededJobs: 3,
        },
      })
      renderTab()
      expect(screen.getByText(/Area run complete/i)).toBeInTheDocument()
      expect(screen.getByText(/3 \/ 3 jobs succeeded/i)).toBeInTheDocument()
      expect(screen.queryByTestId('area-cost-card')).toBeNull()

      fireEvent.click(screen.getByRole('button', { name: /Clear result/i }))
      const state = useAnalysisStore.getState()
      expect(state.areaResult).toBeNull()
      expect(state.areaStatus).toBe('idle')
      expect(state.areaPolygon).toBeNull()
    })

    it('shows failed-jobs count in the summary when present', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'success',
        areaResult: {
          mergedGrid: [[0.1, 0.2]],
          gridShape: [1, 2],
          gridBounds: { west: 0, south: 0, east: 1, north: 1 },
          polygon: samplePolygon,
          analysisType: AnalysesName.WindSpeed,
          failedJobs: ['job-a', 'job-b'],
          skippedJobs: [],
          totalJobs: 5,
          succeededJobs: 3,
        },
      })
      renderTab()
      expect(screen.getByText(/3 \/ 5 jobs succeeded/i)).toBeInTheDocument()
      expect(screen.getByText(/2 failed/i)).toBeInTheDocument()
    })
  })

  // ─── Error ──────────────────────────────────────────────────────────────

  describe('error', () => {
    it('Retry clears the error and calls onRunArea with polygon + type', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'error',
        areaError: 'boom',
      })
      const onRunArea = vi.fn().mockResolvedValue(undefined)
      renderTab(makeQuery(), { onRunArea })
      expect(screen.getByText('boom')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /Retry/i }))
      expect(onRunArea).toHaveBeenCalledTimes(1)
      expect(onRunArea).toHaveBeenCalledWith(
        expect.objectContaining({
          polygon: samplePolygon,
          analysisType: AnalysesName.WindSpeed,
        }),
      )
    })

    it('Dismiss clears the error and resets status to idle', () => {
      useAnalysisStore.setState({
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'error',
        areaError: 'boom',
      })
      renderTab()

      fireEvent.click(screen.getByRole('button', { name: /Dismiss/i }))

      const state = useAnalysisStore.getState()
      expect(state.areaError).toBeNull()
      expect(state.areaStatus).toBe('idle')
    })
  })
})
