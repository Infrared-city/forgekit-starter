// Thin typed client for the `/places` Hono proxy in apps/base/api. The
// composition root supplies a `baseUrl` (matches the rest of base/client's
// API wiring) and an optional `getToken` resolver — handing the JWT off so
// this package stays decoupled from the app's auth store. No retry-on-401
// here: the host app's main `api.ts` wrapper handles that for the rest of
// the surface, and the Mapbox/search overlay is fine surfacing a sign-in
// error to the user.

import type {
  AutocompleteOptions,
  DetailsOptions,
  PlaceDetails,
  PlaceSuggestion,
  PlacesClient,
} from './places.types'

export interface PlacesClientConfig {
  /** Base URL of the platform Hono API (e.g. '/api' in dev, the worker URL in prod). */
  baseUrl: string
  /** Optional bearer-token resolver — called per request so token rotation is picked up. */
  getToken?: () => string | null | undefined
  /** Override fetch (tests). */
  fetch?: typeof fetch
}

class PlacesApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'PlacesApiError'
  }
}

export function createPlacesClient(config: PlacesClientConfig): PlacesClient {
  const fetchImpl = config.fetch ?? fetch
  const base = config.baseUrl.replace(/\/+$/, '')

  function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...(extra ?? {}) }
    const token = config.getToken?.()
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  async function send<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetchImpl(`${base}${path}`, init)
    if (!res.ok) {
      let detail = ''
      try {
        const body = (await res.json()) as { error?: string }
        detail = body.error ?? ''
      } catch {
        // ignore parse errors
      }
      throw new PlacesApiError(res.status, detail || res.statusText || `places ${res.status}`)
    }
    return (await res.json()) as T
  }

  return {
    async autocomplete(input, opts: AutocompleteOptions = {}) {
      const body: Record<string, unknown> = { input }
      if (opts.sessionToken) body.sessionToken = opts.sessionToken
      if (opts.languageCode) body.languageCode = opts.languageCode
      if (opts.locationBias) body.locationBias = opts.locationBias
      const result = await send<{ suggestions: PlaceSuggestion[] }>('/places/autocomplete', {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
        signal: opts.signal,
      })
      return result.suggestions
    },

    async details(placeId, opts: DetailsOptions = {}) {
      const qs = opts.sessionToken ? `?sessionToken=${encodeURIComponent(opts.sessionToken)}` : ''
      const result = await send<{ data: PlaceDetails }>(
        `/places/${encodeURIComponent(placeId)}${qs}`,
        { method: 'GET', headers: buildHeaders(), signal: opts.signal },
      )
      return result.data
    },

    async reverseGeocode(lat, lng, signal) {
      const result = await send<{ data: PlaceDetails }>('/places/reverse-geocode', {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ lat, lng }),
        signal,
      })
      return result.data
    },
  }
}

export { PlacesApiError }
