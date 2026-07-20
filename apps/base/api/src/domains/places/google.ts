// Server-side Google Maps Platform helpers. The Worker holds the API key
// (GOOGLE_MAPS_API_KEY) so the browser bundle never sees it. Three upstreams
// are used:
//   - Places API v1 — autocomplete + details (POST + GET, field-mask gated)
//   - Geocoding API (legacy)  — reverse-geocode by lat/lng
//
// Returns a small, normalized shape per call so the React combobox can render
// directly. Heavy upstream payloads are intentionally dropped.

const PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places'
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

const DETAILS_FIELD_MASK = 'id,displayName,formattedAddress,location,addressComponents,types'

export type PlaceSuggestion = {
  placeId: string
  primaryText: string
  secondaryText: string | null
  types: string[]
}

export type PlaceDetails = {
  placeId: string
  formatted: string
  name: string | null
  coordinates: { lat: number; lng: number }
  locality: string | null
  region: string | null
  country: string | null
  types: string[]
}

export type AutocompleteOptions = {
  input: string
  sessionToken?: string
  languageCode?: string
  /** Circular viewport bias — radius in meters. */
  locationBias?: { lat: number; lng: number; radiusMeters: number }
}

export type GoogleFetchError = {
  status: number
  message: string
}

export class GooglePlacesError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'GooglePlacesError'
  }
}

type AutocompleteV1Response = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string
      structuredFormat?: {
        mainText?: { text?: string }
        secondaryText?: { text?: string }
      }
      types?: string[]
    }
  }>
  error?: { code?: number; message?: string }
}

type DetailsV1Response = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  addressComponents?: Array<{ longText?: string; shortText?: string; types?: string[] }>
  types?: string[]
  error?: { code?: number; message?: string }
}

type GeocodeResponse = {
  status?: string
  error_message?: string
  results?: Array<{
    place_id?: string
    formatted_address?: string
    geometry?: { location?: { lat?: number; lng?: number } }
    address_components?: Array<{ long_name?: string; short_name?: string; types?: string[] }>
    types?: string[]
  }>
}

const DEFAULT_TIMEOUT_MS = 8000

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function autocomplete(
  apiKey: string,
  opts: AutocompleteOptions,
): Promise<PlaceSuggestion[]> {
  const body: Record<string, unknown> = { input: opts.input }
  if (opts.sessionToken) body.sessionToken = opts.sessionToken
  if (opts.languageCode) body.languageCode = opts.languageCode
  if (opts.locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: opts.locationBias.lat, longitude: opts.locationBias.lng },
        radius: opts.locationBias.radiusMeters,
      },
    }
  }

  const res = await fetchWithTimeout(PLACES_AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify(body),
  })

  const json = (await res.json().catch(() => ({}))) as AutocompleteV1Response
  if (!res.ok) {
    throw new GooglePlacesError(res.status, json.error?.message ?? `Google ${res.status}`)
  }

  const out: PlaceSuggestion[] = []
  for (const s of json.suggestions ?? []) {
    const p = s.placePrediction
    if (!p?.placeId) continue
    const primary = p.structuredFormat?.mainText?.text ?? ''
    const secondary = p.structuredFormat?.secondaryText?.text ?? null
    out.push({
      placeId: p.placeId,
      primaryText: primary,
      secondaryText: secondary || null,
      types: p.types ?? [],
    })
  }
  return out
}

function findComponent(
  components: DetailsV1Response['addressComponents'] | undefined,
  ...types: string[]
): string | null {
  for (const c of components ?? []) {
    if (c.types?.some((t) => types.includes(t))) {
      return c.longText ?? c.shortText ?? null
    }
  }
  return null
}

export async function placeDetails(
  apiKey: string,
  placeId: string,
  sessionToken?: string,
): Promise<PlaceDetails> {
  const url = new URL(`${PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}`)
  if (sessionToken) url.searchParams.set('sessionToken', sessionToken)

  const res = await fetchWithTimeout(url.toString(), {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': DETAILS_FIELD_MASK,
    },
  })

  const json = (await res.json().catch(() => ({}))) as DetailsV1Response
  if (!res.ok) {
    throw new GooglePlacesError(res.status, json.error?.message ?? `Google ${res.status}`)
  }
  const lat = json.location?.latitude
  const lng = json.location?.longitude
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new GooglePlacesError(502, 'Place details missing coordinates')
  }
  return {
    placeId: json.id ?? placeId,
    formatted: json.formattedAddress ?? json.displayName?.text ?? '',
    name: json.displayName?.text ?? null,
    coordinates: { lat, lng },
    locality: findComponent(json.addressComponents, 'locality', 'postal_town'),
    region: findComponent(json.addressComponents, 'administrative_area_level_1'),
    country: findComponent(json.addressComponents, 'country'),
    types: json.types ?? [],
  }
}

function findGeocodeComponent(
  components: GeocodeResponse['results'] extends Array<infer R>
    ? R extends { address_components?: infer A }
      ? A
      : never
    : never,
  ...types: string[]
): string | null {
  for (const c of (components as Array<{ long_name?: string; types?: string[] }>) ?? []) {
    if (c.types?.some((t) => types.includes(t))) {
      return c.long_name ?? null
    }
  }
  return null
}

export async function reverseGeocode(
  apiKey: string,
  lat: number,
  lng: number,
): Promise<PlaceDetails> {
  const url = new URL(GEOCODE_URL)
  url.searchParams.set('latlng', `${lat},${lng}`)
  url.searchParams.set('key', apiKey)

  const res = await fetchWithTimeout(url.toString(), { method: 'GET' })
  const json = (await res.json().catch(() => ({}))) as GeocodeResponse
  if (!res.ok || (json.status && json.status !== 'OK' && json.status !== 'ZERO_RESULTS')) {
    throw new GooglePlacesError(
      res.ok ? 502 : res.status,
      json.error_message ?? json.status ?? `Google ${res.status}`,
    )
  }
  const top = json.results?.[0]
  if (!top) {
    throw new GooglePlacesError(404, 'No results for coordinates')
  }
  const components = top.address_components
  return {
    placeId: top.place_id ?? '',
    formatted: top.formatted_address ?? '',
    name: null,
    coordinates: {
      lat: top.geometry?.location?.lat ?? lat,
      lng: top.geometry?.location?.lng ?? lng,
    },
    locality: findGeocodeComponent(components as never, 'locality', 'postal_town'),
    region: findGeocodeComponent(components as never, 'administrative_area_level_1'),
    country: findGeocodeComponent(components as never, 'country'),
    types: top.types ?? [],
  }
}
