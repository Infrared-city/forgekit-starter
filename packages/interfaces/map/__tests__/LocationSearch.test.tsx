import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocationSearch } from '../components/LocationSearch'
import type { PlaceDetails, PlaceSuggestion, PlacesClient } from '../lib/places.types'
import { clearRecents } from '../lib/recent-places'
import { getMapInitialState, useMapStore } from '../map.store'

/**
 * Tests for the `LocationSearch` overlay component. We render with a stub
 * `PlacesClient` so neither network nor real Google calls fire. The router
 * is mocked to capture URL writes.
 *
 * What these tests enforce:
 *   1. Picking a suggestion sets `pendingFlyTo` with the resolved coords.
 *   2. `hasUserChosenLocation` flips to true and `buildingsViewport.lat/lng`
 *      is pre-seeded so downstream queries fire immediately.
 *   3. `viewState` is NOT touched synchronously — deck.gl animates from the
 *      current view to `pendingFlyTo` via FlyToInterpolator.
 *   4. URL is written with the correct payload.
 *   5. `pickedAddress` captures the formatted address + placeId + types.
 *   6. Reset button only renders when the flag is true and clears state +
 *      URL on click.
 */

const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

function buildPlaceDetails(overrides: Partial<PlaceDetails> = {}): PlaceDetails {
  return {
    placeId: 'P1',
    formatted: '1 Plaça de Catalunya, Barcelona, Spain',
    name: '1 Plaça de Catalunya',
    coordinates: { lat: 41.39, lng: 2.17 },
    locality: 'Barcelona',
    region: 'Catalonia',
    country: 'Spain',
    types: ['street_address'],
    ...overrides,
  }
}

function stubClient(overrides: Partial<PlacesClient> = {}): PlacesClient {
  const suggestion: PlaceSuggestion = {
    placeId: 'P1',
    primaryText: '1 Plaça de Catalunya',
    secondaryText: 'Barcelona, Spain',
    types: ['street_address'],
  }
  return {
    autocomplete: vi.fn(async () => [suggestion]),
    details: vi.fn(async () => buildPlaceDetails()),
    reverseGeocode: vi.fn(async () => buildPlaceDetails()),
    ...overrides,
  }
}

describe('LocationSearch overlay', () => {
  beforeEach(() => {
    useMapStore.setState(getMapInitialState())
    navigateMock.mockReset()
    clearRecents()
  })

  it('picking a suggestion sets pendingFlyTo, flips the flag, writes URL', async () => {
    const client = stubClient()
    render(<LocationSearch placesClient={client} />)
    const viewStateBefore = { ...useMapStore.getState().viewState }

    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Barcelona' } })

    const row = await screen.findByText('1 Plaça de Catalunya')
    fireEvent.click(row)

    await waitFor(() => {
      expect(useMapStore.getState().pendingFlyTo).toEqual({
        latitude: 41.39,
        longitude: 2.17,
        zoom: 16,
      })
    })

    const state = useMapStore.getState()
    expect(state.hasUserChosenLocation).toBe(true)
    expect(state.buildingsViewport.latitude).toBe(41.39)
    expect(state.buildingsViewport.longitude).toBe(2.17)
    expect(state.viewState).toEqual(viewStateBefore)

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/map',
      search: { lat: 41.39, lng: 2.17, zoom: 16 },
      replace: false,
    })
  })

  it('captures pickedAddress with placeId and types', async () => {
    const client = stubClient()
    render(<LocationSearch placesClient={client} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Barcelona' } })

    fireEvent.click(await screen.findByText('1 Plaça de Catalunya'))

    await waitFor(() => {
      expect(useMapStore.getState().pickedAddress).toEqual({
        formatted: '1 Plaça de Catalunya, Barcelona, Spain',
        name: '1 Plaça de Catalunya',
        placeName: 'Barcelona',
        placeId: 'P1',
        types: ['street_address'],
      })
    })
  })

  describe('reset button', () => {
    it('is NOT rendered on fresh mount with the flag false', () => {
      render(<LocationSearch placesClient={stubClient()} />)
      expect(screen.queryByLabelText('Reset to world view')).toBeNull()
    })

    it('clears store + URL on click when chosen', () => {
      useMapStore.getState().hydrateLocation({ latitude: 41.39, longitude: 2.17, zoom: 16 })
      useMapStore.getState().setPickedAddress({
        formatted: '1 Plaça de Catalunya',
        name: '1 Plaça de Catalunya',
        placeName: 'Barcelona',
      })
      const viewStateBefore = { ...useMapStore.getState().viewState }

      render(<LocationSearch placesClient={stubClient()} />)
      fireEvent.click(screen.getByLabelText('Reset to world view'))

      const state = useMapStore.getState()
      expect(state.pendingFlyTo).toEqual({ latitude: 20, longitude: 0, zoom: 1.5 })
      expect(state.hasUserChosenLocation).toBe(false)
      expect(state.buildingsViewport.latitude).toBe(20)
      expect(state.buildingsViewport.longitude).toBe(0)
      expect(state.viewState).toEqual(viewStateBefore)
      expect(state.pickedAddress).toBeNull()
      expect(navigateMock).toHaveBeenCalledWith({ to: '/map', search: {} })
    })
  })
})
