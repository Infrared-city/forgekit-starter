import { beforeEach, describe, expect, it } from 'vitest'
import { AnalysesName } from '../core/analysis.sdk-types'
import { getAnalysisInitialState, useAnalysisStore } from '../react/analysis.store'

// ─── Tests ──────────────────────────────────────────────────────────────────
//
// This file is a small smoke test for the non-area store surface. The
// area slice has its own dedicated suite (`analysis.store.area.test.ts`),
// and the migrate path is exercised by `analysis.store.migrate.test.ts`.

describe('useAnalysisStore — core surface', () => {
  beforeEach(() => {
    useAnalysisStore.setState(getAnalysisInitialState())
  })

  describe('initial state', () => {
    it('starts with null activeConfig', () => {
      expect(useAnalysisStore.getState().activeConfig).toBeNull()
    })

    it('starts with null selectedStationId', () => {
      expect(useAnalysisStore.getState().selectedStationId).toBeNull()
    })
  })

  describe('setActiveConfig', () => {
    it('sets and clears the active config', () => {
      useAnalysisStore.getState().setActiveConfig({ analysisType: AnalysesName.SolarRadiation })
      expect(useAnalysisStore.getState().activeConfig).toEqual({
        analysisType: AnalysesName.SolarRadiation,
      })

      useAnalysisStore.getState().setActiveConfig(null)
      expect(useAnalysisStore.getState().activeConfig).toBeNull()
    })
  })

  describe('setSelectedStationId', () => {
    it('sets and clears the selected weather station', () => {
      useAnalysisStore.getState().setSelectedStationId('station-1')
      expect(useAnalysisStore.getState().selectedStationId).toBe('station-1')

      useAnalysisStore.getState().setSelectedStationId(null)
      expect(useAnalysisStore.getState().selectedStationId).toBeNull()
    })
  })

  describe('resetSession', () => {
    it('clears activeConfig but preserves selectedStationId', () => {
      useAnalysisStore.getState().setActiveConfig({ analysisType: AnalysesName.WindSpeed })
      useAnalysisStore.getState().setSelectedStationId('station-1')

      useAnalysisStore.getState().resetSession()

      expect(useAnalysisStore.getState().activeConfig).toBeNull()
      // selectedStationId is intentionally NOT touched by resetSession —
      // the station selection is a cross-session concern owned by the
      // weather-station picker, not the run lifecycle.
      expect(useAnalysisStore.getState().selectedStationId).toBe('station-1')
    })
  })
})
