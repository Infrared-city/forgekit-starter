import { beforeEach, describe, expect, it } from 'vitest'
import { getMapInitialState, useMapStore } from '../map.store'

/**
 * Tests for the world-view default + location-choice state plumbing.
 *
 * See `.flow/tasks/fn-50-location-search-world-view-default-for.1.md` for
 * the contract these tests enforce:
 *  - fresh session boots at the whole-world view, flag `false`
 *  - `hydrateLocation` synchronously snaps `viewState` + `buildingsViewport`
 *  - `flyToLocation` stores `pendingFlyTo` + flag + buildingsViewport but
 *    intentionally does NOT touch `viewState` — `MapCanvas` merges the
 *    target into DeckGL's controlled viewState with `FlyToInterpolator` so
 *    deck.gl can animate the controlled camera to the target.
 *  - `resetToWorldView` reverts everything regardless of prior state
 *  - `flyToWorldView` is the animated reset variant (mirrors `flyToLocation`)
 *  - `clearPendingFlyTo` wipes `pendingFlyTo`
 *  - `resetSession` clears the flag
 */
describe('useMapStore (location + world-view defaults)', () => {
  beforeEach(() => {
    // Full reset between tests — setState merges by default so spread the
    // initial state object to overwrite every field under test.
    useMapStore.setState(getMapInitialState())
  })

  describe('world-view defaults', () => {
    it('boots a fresh session at the world view with the flag cleared', () => {
      const state = useMapStore.getState()
      expect(state.hasUserChosenLocation).toBe(false)
      expect(state.viewState).toMatchObject({
        latitude: 20,
        longitude: 0,
        zoom: 1.5,
        pitch: 0,
        bearing: 0,
      })
    })

    it('seeds buildingsViewport at world defaults with the existing 512x512 window', () => {
      const { buildingsViewport } = useMapStore.getState()
      expect(buildingsViewport).toEqual({
        latitude: 20,
        longitude: 0,
        width: 512,
        height: 512,
      })
    })

    it('getMapInitialState returns the world-view defaults', () => {
      const snapshot = getMapInitialState()
      expect(snapshot.hasUserChosenLocation).toBe(false)
      expect(snapshot.viewState.latitude).toBe(20)
      expect(snapshot.viewState.longitude).toBe(0)
      expect(snapshot.viewState.zoom).toBe(1.5)
      expect(snapshot.viewState.pitch).toBe(0)
      expect(snapshot.viewState.bearing).toBe(0)
    })
  })

  describe('hydrateLocation', () => {
    it('updates viewState lat/lng/zoom, buildingsViewport lat/lng, and sets the flag', () => {
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })

      const state = useMapStore.getState()
      expect(state.hasUserChosenLocation).toBe(true)
      expect(state.viewState.latitude).toBe(40.7)
      expect(state.viewState.longitude).toBe(-74)
      expect(state.viewState.zoom).toBe(16)
      expect(state.buildingsViewport.latitude).toBe(40.7)
      expect(state.buildingsViewport.longitude).toBe(-74)
    })

    it('preserves pitch and bearing from the previous viewState', () => {
      // Start with non-default pitch/bearing to prove they are preserved.
      useMapStore.setState((prev) => ({
        viewState: { ...prev.viewState, pitch: 45, bearing: 30 },
      }))

      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })

      const { viewState } = useMapStore.getState()
      expect(viewState.pitch).toBe(45)
      expect(viewState.bearing).toBe(30)
    })

    it('preserves buildingsViewport width/height while updating lat/lng', () => {
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })

      const { buildingsViewport } = useMapStore.getState()
      expect(buildingsViewport.width).toBe(512)
      expect(buildingsViewport.height).toBe(512)
    })
  })

  describe('flyToLocation', () => {
    it('stores pendingFlyTo, sets the flag, updates buildingsViewport, leaves viewState untouched', () => {
      // Snapshot viewState BEFORE the call — it must not change afterwards.
      const viewStateBefore = { ...useMapStore.getState().viewState }

      useMapStore.getState().flyToLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })

      const state = useMapStore.getState()
      expect(state.pendingFlyTo).toEqual({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      expect(state.hasUserChosenLocation).toBe(true)
      expect(state.buildingsViewport.latitude).toBe(40.7)
      expect(state.buildingsViewport.longitude).toBe(-74)
      // viewState unchanged — `MapCanvas` will feed `pendingFlyTo` into
      // DeckGL's controlled viewState with `FlyToInterpolator` and
      // deck.gl will animate from the current viewState to the target.
      expect(state.viewState).toEqual(viewStateBefore)
    })

    it('does not change viewState even when called with a zoom value', () => {
      // Seed with a distinct viewState so we can assert no field is touched.
      useMapStore.setState((prev) => ({
        viewState: { ...prev.viewState, latitude: 10, longitude: 20, zoom: 5 },
      }))

      useMapStore.getState().flyToLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })

      const { viewState } = useMapStore.getState()
      expect(viewState.latitude).toBe(10)
      expect(viewState.longitude).toBe(20)
      expect(viewState.zoom).toBe(5)
    })

    it('preserves buildingsViewport width/height', () => {
      useMapStore.getState().flyToLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })

      const { buildingsViewport } = useMapStore.getState()
      expect(buildingsViewport.width).toBe(512)
      expect(buildingsViewport.height).toBe(512)
    })
  })

  describe('resetToWorldView', () => {
    it('reverts viewState, buildingsViewport lat/lng, and the flag back to world defaults', () => {
      // Move to a non-default state first.
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      // Also scribble pitch/bearing to prove they get reset too.
      useMapStore.setState((prev) => ({
        viewState: { ...prev.viewState, pitch: 60, bearing: 45 },
      }))

      useMapStore.getState().resetToWorldView()

      const state = useMapStore.getState()
      expect(state.hasUserChosenLocation).toBe(false)
      expect(state.viewState).toMatchObject({
        latitude: 20,
        longitude: 0,
        zoom: 1.5,
        pitch: 0,
        bearing: 0,
      })
      expect(state.buildingsViewport.latitude).toBe(20)
      expect(state.buildingsViewport.longitude).toBe(0)
    })

    it('preserves buildingsViewport width/height', () => {
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      useMapStore.getState().resetToWorldView()

      const { buildingsViewport } = useMapStore.getState()
      expect(buildingsViewport.width).toBe(512)
      expect(buildingsViewport.height).toBe(512)
    })

    it('is a no-op for the flag when already at world view', () => {
      useMapStore.getState().resetToWorldView()
      expect(useMapStore.getState().hasUserChosenLocation).toBe(false)
    })
  })

  describe('flyToWorldView', () => {
    it('stores world-view pendingFlyTo, clears the flag, snaps buildingsViewport, leaves viewState untouched', () => {
      // Move to a non-default state first.
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      // Scribble pitch/bearing too — they MUST survive (no viewState write).
      useMapStore.setState((prev) => ({
        viewState: { ...prev.viewState, pitch: 60, bearing: 45 },
      }))
      const viewStateBefore = { ...useMapStore.getState().viewState }

      useMapStore.getState().flyToWorldView()

      const state = useMapStore.getState()
      // pendingFlyTo set to world defaults so `MapCanvas` can animate
      // deck.gl's controlled camera back out to the whole world.
      expect(state.pendingFlyTo).toEqual({
        latitude: 20,
        longitude: 0,
        zoom: 1.5,
      })
      // viewState UNCHANGED — a same-tick snap would cancel the in-flight
      // deck.gl transition.
      expect(state.viewState).toEqual(viewStateBefore)
      // Flag cleared and buildingsViewport pre-snapped to world defaults
      // so any downstream consumers see the world coordinates immediately.
      expect(state.hasUserChosenLocation).toBe(false)
      expect(state.buildingsViewport.latitude).toBe(20)
      expect(state.buildingsViewport.longitude).toBe(0)
    })

    it('preserves buildingsViewport width/height', () => {
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      useMapStore.getState().flyToWorldView()

      const { buildingsViewport } = useMapStore.getState()
      expect(buildingsViewport.width).toBe(512)
      expect(buildingsViewport.height).toBe(512)
    })
  })

  describe('clearPendingFlyTo', () => {
    it('wipes pendingFlyTo without touching other state', () => {
      useMapStore.getState().flyToLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      expect(useMapStore.getState().pendingFlyTo).not.toBeNull()

      const before = useMapStore.getState()
      useMapStore.getState().clearPendingFlyTo()
      const after = useMapStore.getState()

      expect(after.pendingFlyTo).toBeNull()
      expect(after.hasUserChosenLocation).toBe(before.hasUserChosenLocation)
      expect(after.buildingsViewport).toEqual(before.buildingsViewport)
      expect(after.viewState).toEqual(before.viewState)
    })
  })

  describe('resetSession', () => {
    it('clears hasUserChosenLocation', () => {
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      expect(useMapStore.getState().hasUserChosenLocation).toBe(true)

      useMapStore.getState().resetSession()

      expect(useMapStore.getState().hasUserChosenLocation).toBe(false)
    })

    it('leaves viewState alone (preserves existing reset behavior)', () => {
      useMapStore.getState().hydrateLocation({
        latitude: 40.7,
        longitude: -74,
        zoom: 16,
      })
      const viewStateBefore = { ...useMapStore.getState().viewState }

      useMapStore.getState().resetSession()

      expect(useMapStore.getState().viewState).toEqual(viewStateBefore)
    })

    it('still resets transient session state', () => {
      useMapStore.getState().selectMesh('mesh-1')
      useMapStore.getState().setHoveredMesh('mesh-2')

      useMapStore.getState().resetSession()

      const state = useMapStore.getState()
      expect(state.selectedMeshId).toBeNull()
      expect(state.hoveredMeshId).toBeNull()
    })
  })

  /**
   * fn-52.1 — the workflow panel reads `pickedAddress` to show the resolved
   * place name alongside the weather station selector. The store owns the
   * slot + setter; the `LocationSearch` component mirrors the value into
   * These tests cover the store side: setter identity, null-clearing,
   * and reset behaviour across the three reset paths.
   */
  describe('pickedAddress', () => {
    const SAMPLE_ADDRESS = {
      formatted: '1 Plaça de Catalunya, Barcelona, Spain',
      name: '1 Plaça de Catalunya',
      placeName: 'Barcelona, Spain',
    }

    it('defaults to null on a fresh session', () => {
      expect(useMapStore.getState().pickedAddress).toBeNull()
    })

    it('setPickedAddress writes the full shape', () => {
      useMapStore.getState().setPickedAddress(SAMPLE_ADDRESS)
      expect(useMapStore.getState().pickedAddress).toEqual(SAMPLE_ADDRESS)
    })

    it('setPickedAddress(null) clears the slot', () => {
      useMapStore.getState().setPickedAddress(SAMPLE_ADDRESS)
      useMapStore.getState().setPickedAddress(null)
      expect(useMapStore.getState().pickedAddress).toBeNull()
    })

    it('resetToWorldView clears pickedAddress', () => {
      useMapStore.getState().hydrateLocation({ latitude: 41.39, longitude: 2.17, zoom: 16 })
      useMapStore.getState().setPickedAddress(SAMPLE_ADDRESS)

      useMapStore.getState().resetToWorldView()

      expect(useMapStore.getState().pickedAddress).toBeNull()
    })

    it('flyToWorldView clears pickedAddress', () => {
      useMapStore.getState().hydrateLocation({ latitude: 41.39, longitude: 2.17, zoom: 16 })
      useMapStore.getState().setPickedAddress(SAMPLE_ADDRESS)

      useMapStore.getState().flyToWorldView()

      expect(useMapStore.getState().pickedAddress).toBeNull()
    })

    it('resetSession clears pickedAddress alongside hasUserChosenLocation', () => {
      useMapStore.getState().hydrateLocation({ latitude: 41.39, longitude: 2.17, zoom: 16 })
      useMapStore.getState().setPickedAddress(SAMPLE_ADDRESS)

      useMapStore.getState().resetSession()

      const state = useMapStore.getState()
      expect(state.pickedAddress).toBeNull()
      expect(state.hasUserChosenLocation).toBe(false)
    })
  })
})
