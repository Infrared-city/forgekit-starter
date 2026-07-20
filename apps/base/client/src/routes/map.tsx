import { createFileRoute } from '@tanstack/react-router'

/** Route-level search params for `/map`. All fields optional and range-checked. */
interface MapSearch {
  lat?: number
  lng?: number
  zoom?: number
}

const DEFAULT_PICKED_ZOOM = 16

/** Coerce an unknown value into a finite number within [min, max], else undefined. */
function coerceNumberInRange(value: unknown, min: number, max: number): number | undefined {
  let num: number
  if (typeof value === 'number') {
    num = value
  } else if (typeof value === 'string') {
    // Reject empty / whitespace strings — `Number('')` and `Number(' ')` both
    // return 0, which would otherwise be accepted as a valid coordinate and
    // silently hydrate the map to (0, 0).
    if (value.trim() === '') return undefined
    num = Number(value)
  } else {
    return undefined
  }
  if (!Number.isFinite(num)) return undefined
  if (num < min || num > max) return undefined
  return num
}

export const Route = createFileRoute('/map')({
  validateSearch: (search: Record<string, unknown>): MapSearch => ({
    lat: coerceNumberInRange(search.lat, -90, 90),
    lng: coerceNumberInRange(search.lng, -180, 180),
    zoom: coerceNumberInRange(search.zoom, 0, 22),
  }),
  beforeLoad: async ({ search, preload, cause }) => {
    // Preload-guard: with `defaultPreload: 'intent'` in the router config,
    // TanStack Router fires `beforeLoad` on link hover/focus *before* the
    // user actually navigates. Our side effects (`hydrateLocation`) must
    // not run during a preload — otherwise a hover on a `<Link to="/map">`
    // from another route would mutate the global map store, flip the flag
    // to true, and cause the real navigation to short-circuit via the
    // flag-guard below, leaving the URL hydration dead.
    if (preload || cause === 'preload') return

    const { useMapStore } = await import('@forge-kit/map-interface')

    // Flag-guard: TanStack Router re-runs `beforeLoad` on every search-param
    // change for the same route. Task 2's `onRetrieve` handler fires
    // `navigate({ search: { lat, lng, zoom } })` during an in-flight flyTo;
    // without this short-circuit, that second run would call
    // `hydrateLocation` and snap `viewState` to the target, cancelling the
    // animation.
    if (useMapStore.getState().hasUserChosenLocation) return

    // 1) URL params take precedence.
    if (typeof search.lat === 'number' && typeof search.lng === 'number') {
      useMapStore.getState().hydrateLocation({
        latitude: search.lat,
        longitude: search.lng,
        zoom: search.zoom ?? DEFAULT_PICKED_ZOOM,
      })
      return
    }
  },
  onLeave: async () => {
    // Dynamic imports — these modules are already in memory when leaving
    // the route, so the import() resolves instantly from the module cache.
    const [
      { useMapStore },
      { useAnalysisStore },
      { clearMeshCache, getBuildingsInitialState, useBuildingsStore },
      { useGroundMaterialsStore },
    ] = await Promise.all([
      import('@forge-kit/map-interface'),
      import('@forge-kit/analysis'),
      import('@forge-kit/buildings'),
      import('@forge-kit/ground-materials'),
    ])
    useMapStore.getState().resetSession()
    useAnalysisStore.getState().resetSession()
    useGroundMaterialsStore.getState().resetSession()
    // Buildings cleanup -- clear mesh cache and reset buildings-specific state
    clearMeshCache()
    useBuildingsStore.setState(getBuildingsInitialState())
  },
})
