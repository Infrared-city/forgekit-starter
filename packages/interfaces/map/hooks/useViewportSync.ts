import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { computeOriginFromViewport } from '../map.geo-utils'
import type { BuildingsViewport } from '../map.store'
import { useMapStore } from '../map.store'

const GRID_SIZE_METERS = 512

/**
 * Threshold-based viewport synchronization.
 *
 * Throttles viewport updates to only fire when the map center moves more than
 * 0.01 degrees (~1.1 km). Also syncs the throttled viewport into the map store
 * for cross-domain consumption (e.g., analysis anchoring).
 *
 * Returns the throttled viewport and the derived geographic origin (SW corner).
 */
export function useViewportSync(): {
  viewport: BuildingsViewport
  origin: [number, number]
} {
  const { latitude, longitude, setBuildingsViewport, pendingFlyTo } = useMapStore(
    useShallow((s) => ({
      latitude: s.viewState.latitude,
      longitude: s.viewState.longitude,
      setBuildingsViewport: s.setBuildingsViewport,
      pendingFlyTo: s.pendingFlyTo,
    })),
  )

  // Initialize from the store's `buildingsViewport`, NOT from `viewState`.
  //
  // Why this matters: when the user picks a place via `LocationSearch`, the
  // overlay calls `flyToLocation({ latitude, longitude, zoom })`, which
  // pre-seeds `buildingsViewport.latitude/longitude` with the picked
  // coordinates but intentionally does NOT touch `viewState` (so deck.gl's
  // `FlyToInterpolator` can animate from the current `viewState` to the
  // target `pendingFlyTo`). On the next render the route mounts
  // `MapRouteChosen`, which mounts this hook for the first time. If we
  // initialised local state from `viewState.latitude/longitude` (still
  // world view at this point), the post-init effect would call
  // `setBuildingsViewport(...)` and *overwrite* the pre-seed back to world
  // coords — reintroducing the exact world-viewport fetch race the gate
  // was supposed to prevent.
  //
  // Initialising from `buildingsViewport` preserves the pre-seeded chosen
  // location through the first paint of `MapRouteChosen`. The threshold
  // effect below then takes over once `viewState` starts streaming through
  // `onViewStateChange` during the deck.gl camera transition.
  const initialBuildingsViewport = useMapStore.getState().buildingsViewport
  const [viewport, setViewport] = useState<BuildingsViewport>(() => ({
    latitude: initialBuildingsViewport.latitude,
    longitude: initialBuildingsViewport.longitude,
    width: GRID_SIZE_METERS,
    height: GRID_SIZE_METERS,
  }))

  // Only update viewport when position changes significantly (>0.01 degrees).
  // Skip updates while a fly-to animation is in flight (`pendingFlyTo !== null`)
  // — `flyToLocation` already pre-seeded `buildingsViewport` with the target,
  // and intermediate animation frames would thrash the viewport (and any
  // queries keyed off it, e.g. weather stations).
  useEffect(() => {
    if (pendingFlyTo) return

    const latDiff = Math.abs(latitude - viewport.latitude)
    const lngDiff = Math.abs(longitude - viewport.longitude)

    if (latDiff > 0.01 || lngDiff > 0.01) {
      setViewport({
        latitude,
        longitude,
        width: GRID_SIZE_METERS,
        height: GRID_SIZE_METERS,
      })
    }
  }, [latitude, longitude, viewport.latitude, viewport.longitude, pendingFlyTo])

  // Share the throttled buildings viewport across the app (analysis uses the same anchor).
  useEffect(() => {
    setBuildingsViewport(viewport)
  }, [setBuildingsViewport, viewport])

  // Compute geographic origin (SW corner) from the center-based viewport
  const origin = useMemo(() => computeOriginFromViewport(viewport), [viewport])

  return { viewport, origin }
}
