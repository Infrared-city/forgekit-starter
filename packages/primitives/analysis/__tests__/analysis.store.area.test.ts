import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { beforeEach, describe, expect, it } from 'vitest'
import { AnalysesName } from '../core/analysis.sdk-types'
import type { AreaRunResult } from '../react/analysis.store'
import { getAnalysisInitialState, useAnalysisStore } from '../react/analysis.store'

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

const sampleResult: AreaRunResult = {
  mergedGrid: [
    [0.1, 0.2, null],
    [0.3, null, 0.5],
  ],
  gridShape: [2, 3],
  gridBounds: { west: 2.15, south: 41.38, east: 2.16, north: 41.39 },
  polygon: samplePolygon,
  analysisType: AnalysesName.WindSpeed,
  failedJobs: [],
  skippedJobs: [],
  totalJobs: 4,
  succeededJobs: 4,
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useAnalysisStore — area slice', () => {
  beforeEach(() => {
    useAnalysisStore.setState(getAnalysisInitialState())
  })

  describe('initial state', () => {
    it('has default area fields', () => {
      const state = useAnalysisStore.getState()
      expect(state.areaMode).toBe(false)
      expect(state.areaDrawing).toBe(false)
      expect(state.areaPolygon).toBeNull()
      expect(state.areaAnalysisType).toBeNull()
      expect(state.areaStatus).toBe('idle')
      expect(state.areaResult).toBeNull()
      expect(state.areaError).toBeNull()
    })
  })

  describe('setAreaMode', () => {
    it('turns area mode on without touching the analysis type', () => {
      useAnalysisStore.getState().setAreaMode(true)
      const state = useAnalysisStore.getState()
      expect(state.areaMode).toBe(true)
      // Policy lives in the panel code — the store does NOT auto-populate type.
      expect(state.areaAnalysisType).toBeNull()
    })

    it('calls resetArea internally when turned off (clears polygon/type/result/error/drawing/status)', () => {
      const {
        setAreaMode,
        setAreaPolygon,
        setAreaAnalysisType,
        setAreaResult,
        setAreaError,
        setAreaDrawing,
      } = useAnalysisStore.getState()

      // Enable area mode and populate every field the area slice owns.
      setAreaMode(true)
      setAreaPolygon(samplePolygon)
      setAreaAnalysisType(AnalysesName.WindSpeed)
      setAreaResult(sampleResult)
      setAreaError('old error')
      setAreaDrawing(true)

      // Now turn mode off — should trigger the internal resetArea.
      useAnalysisStore.getState().setAreaMode(false)

      const state = useAnalysisStore.getState()
      expect(state.areaMode).toBe(false)
      expect(state.areaPolygon).toBeNull()
      expect(state.areaAnalysisType).toBeNull()
      expect(state.areaResult).toBeNull()
      expect(state.areaError).toBeNull()
      expect(state.areaDrawing).toBe(false)
      expect(state.areaStatus).toBe('idle')
    })
  })

  describe('setAreaDrawing', () => {
    it('sets the drawing flag', () => {
      useAnalysisStore.getState().setAreaDrawing(true)
      expect(useAnalysisStore.getState().areaDrawing).toBe(true)

      useAnalysisStore.getState().setAreaDrawing(false)
      expect(useAnalysisStore.getState().areaDrawing).toBe(false)
    })
  })

  describe('setAreaPolygon', () => {
    it('sets the polygon', () => {
      useAnalysisStore.getState().setAreaPolygon(samplePolygon)
      expect(useAnalysisStore.getState().areaPolygon).toEqual(samplePolygon)
    })

    it('invalidates a prior successful run (clears result + error, resets status)', () => {
      // Prepopulate state with a successful run + an error we want wiped.
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaResult: sampleResult,
        areaError: 'stale error',
        areaStatus: 'success',
      })

      useAnalysisStore.getState().setAreaPolygon(samplePolygon)

      const state = useAnalysisStore.getState()
      expect(state.areaPolygon).toEqual(samplePolygon)
      expect(state.areaResult).toBeNull()
      expect(state.areaError).toBeNull()
      expect(state.areaStatus).toBe('idle')
    })

    it('also invalidates a prior run when setting polygon to null (same contract)', () => {
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaPolygon: samplePolygon,
        areaResult: sampleResult,
        areaError: 'stale',
        areaStatus: 'success',
      })

      useAnalysisStore.getState().setAreaPolygon(null)

      const state = useAnalysisStore.getState()
      expect(state.areaPolygon).toBeNull()
      expect(state.areaResult).toBeNull()
      expect(state.areaError).toBeNull()
      expect(state.areaStatus).toBe('idle')
    })
  })

  describe('setAreaAnalysisType', () => {
    it('sets the analysis type', () => {
      useAnalysisStore.getState().setAreaAnalysisType(AnalysesName.WindSpeed)
      expect(useAnalysisStore.getState().areaAnalysisType).toBe(AnalysesName.WindSpeed)
    })

    it('invalidates a prior run (a different type means the cached merged grid is stale)', () => {
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaAnalysisType: AnalysesName.WindSpeed,
        areaResult: sampleResult,
        areaError: 'stale error',
        areaStatus: 'success',
      })

      useAnalysisStore.getState().setAreaAnalysisType(AnalysesName.DirectSunHours)

      const state = useAnalysisStore.getState()
      expect(state.areaAnalysisType).toBe(AnalysesName.DirectSunHours)
      expect(state.areaResult).toBeNull()
      expect(state.areaError).toBeNull()
      expect(state.areaStatus).toBe('idle')
    })

    it('invalidates the run when cleared to null', () => {
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaAnalysisType: AnalysesName.WindSpeed,
        areaResult: sampleResult,
        areaStatus: 'success',
      })

      useAnalysisStore.getState().setAreaAnalysisType(null)

      const state = useAnalysisStore.getState()
      expect(state.areaAnalysisType).toBeNull()
      expect(state.areaResult).toBeNull()
      expect(state.areaStatus).toBe('idle')
    })
  })

  describe('setAreaStatus', () => {
    it('sets the status enum', () => {
      useAnalysisStore.getState().setAreaStatus('running')
      expect(useAnalysisStore.getState().areaStatus).toBe('running')

      useAnalysisStore.getState().setAreaStatus('error')
      expect(useAnalysisStore.getState().areaStatus).toBe('error')

      useAnalysisStore.getState().setAreaStatus('success')
      expect(useAnalysisStore.getState().areaStatus).toBe('success')

      useAnalysisStore.getState().setAreaStatus('idle')
      expect(useAnalysisStore.getState().areaStatus).toBe('idle')
    })
  })

  describe('setAreaResult', () => {
    it('sets result, transitions status to success, and clears error', () => {
      // Seed an error so we can verify it gets cleared.
      useAnalysisStore.getState().setAreaError('previous failure')
      expect(useAnalysisStore.getState().areaError).toBe('previous failure')
      expect(useAnalysisStore.getState().areaStatus).toBe('error')

      useAnalysisStore.getState().setAreaResult(sampleResult)

      const state = useAnalysisStore.getState()
      expect(state.areaResult).toEqual(sampleResult)
      expect(state.areaStatus).toBe('success')
      expect(state.areaError).toBeNull()
    })

    it('leaves status alone when result is set to null', () => {
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaResult: sampleResult,
        areaStatus: 'success',
      })

      useAnalysisStore.getState().setAreaResult(null)

      const state = useAnalysisStore.getState()
      expect(state.areaResult).toBeNull()
      // Status is NOT forced back to idle — callers decide that transition.
      expect(state.areaStatus).toBe('success')
    })
  })

  describe('setAreaError', () => {
    it('sets error and transitions status to error', () => {
      useAnalysisStore.getState().setAreaError('boom')
      const state = useAnalysisStore.getState()
      expect(state.areaError).toBe('boom')
      expect(state.areaStatus).toBe('error')
    })

    it('leaves status alone when error is cleared to null', () => {
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaError: 'boom',
        areaStatus: 'error',
      })

      useAnalysisStore.getState().setAreaError(null)

      const state = useAnalysisStore.getState()
      expect(state.areaError).toBeNull()
      // Status stays 'error' — the caller (e.g. a retry flow) is expected
      // to explicitly move to 'running' or 'idle' itself.
      expect(state.areaStatus).toBe('error')
    })
  })

  describe('resetArea', () => {
    it('clears polygon, analysis type, status, result, error, and areaDrawing but leaves areaMode', () => {
      // Populate every area field (including areaMode + areaDrawing).
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaMode: true,
        areaDrawing: true,
        areaPolygon: samplePolygon,
        areaAnalysisType: AnalysesName.WindSpeed,
        areaStatus: 'running',
        areaResult: sampleResult,
        areaError: 'something',
      })

      useAnalysisStore.getState().resetArea()

      const state = useAnalysisStore.getState()
      expect(state.areaMode).toBe(true) // untouched
      expect(state.areaDrawing).toBe(false)
      expect(state.areaPolygon).toBeNull()
      expect(state.areaAnalysisType).toBeNull()
      expect(state.areaStatus).toBe('idle')
      expect(state.areaResult).toBeNull()
      expect(state.areaError).toBeNull()
    })

    it('clears areaDrawing when called mid-draw', () => {
      // Simulate: user toggles area mode off mid-draw. We must not leave
      // areaDrawing stuck true — that would keep `doubleClickZoom: false`
      // pinned on the map route controller while the draw layer unmounts.
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        areaMode: true,
        areaDrawing: true,
      })

      useAnalysisStore.getState().resetArea()

      expect(useAnalysisStore.getState().areaDrawing).toBe(false)
    })

    it('leaves non-area state untouched', () => {
      // Seed non-area state (selectedStationId, activeConfig) and assert
      // resetArea does not touch either of them.
      useAnalysisStore.setState({
        ...getAnalysisInitialState(),
        selectedStationId: 'station-42',
        activeConfig: { analysisType: AnalysesName.WindSpeed },
        areaPolygon: samplePolygon,
        areaResult: sampleResult,
      })

      useAnalysisStore.getState().resetArea()

      const state = useAnalysisStore.getState()
      expect(state.selectedStationId).toBe('station-42')
      expect(state.activeConfig).toEqual({ analysisType: AnalysesName.WindSpeed })
    })
  })

  describe('no tiling imports', () => {
    it('analysis.store.ts does not import from @infrared-city/infrared-sdk-ts/tiling', () => {
      // The client never imports from the SDK's tiling subpath — the server
      // owns all SDK tile types.
      const here = dirname(fileURLToPath(import.meta.url))
      const storePath = resolve(here, '../react/analysis.store.ts')
      const source = readFileSync(storePath, 'utf8')
      expect(source).not.toContain('@infrared-city/infrared-sdk-ts/tiling')
    })
  })
})
