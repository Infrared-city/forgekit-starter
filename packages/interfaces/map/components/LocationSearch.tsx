import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { Button } from 'ui'
import type { PlacesClient } from '../lib/places.types'
import { useMapStore } from '../map.store'
import { SearchCombobox, type SearchPickedPlace } from './SearchCombobox'

const PICKED_ZOOM = 16

export interface LocationSearchProps {
  placesClient: PlacesClient
}

/**
 * Floating top-center overlay that hosts a Google Places combobox and drives
 * the deck.gl camera fly-to via store actions.
 *
 * Same control loop as before: `flyToLocation` stores `pendingFlyTo` +
 * `hasUserChosenLocation`, then `navigate({ search: { lat, lng, zoom } })`
 * rewrites the URL. `/map` `beforeLoad` short-circuits when the flag is
 * already true. DeckGL interpolates from the current viewState to the target
 * over ~1500 ms via `FlyToInterpolator` in `MapCanvas`.
 *
 * The reset button mirrors this via `flyToWorldView` and clears the query.
 */
export function LocationSearch({ placesClient }: LocationSearchProps) {
  const navigate = useNavigate({ from: '/map' })
  const hasUserChosenLocation = useMapStore((s) => s.hasUserChosenLocation)
  const viewState = useMapStore((s) => s.viewState)

  function handlePick({ details }: SearchPickedPlace) {
    const { lat, lng } = details.coordinates
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return
    }

    useMapStore.getState().flyToLocation({
      latitude: lat,
      longitude: lng,
      zoom: PICKED_ZOOM,
    })

    useMapStore.getState().setPickedAddress({
      formatted: details.formatted || details.name || '',
      name: details.name,
      placeName: details.locality ?? details.region ?? details.country ?? null,
      placeId: details.placeId,
      types: details.types,
    })

    navigate({ to: '/map', search: { lat, lng, zoom: PICKED_ZOOM }, replace: false })
  }

  function handleReset() {
    useMapStore.getState().flyToWorldView()
    navigate({ to: '/map', search: {} })
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2">
        <SearchCombobox
          placesClient={placesClient}
          viewport={{ lat: viewState.latitude, lng: viewState.longitude, zoom: viewState.zoom }}
          onPick={handlePick}
          className="w-[380px] max-w-[80vw]"
        />
        {hasUserChosenLocation && (
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={handleReset}
            aria-label="Reset to world view"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
