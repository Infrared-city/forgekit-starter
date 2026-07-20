import { Hono } from 'hono'
import type { Env } from '../../config.js'
import { autocomplete, GooglePlacesError, placeDetails, reverseGeocode } from './google.js'

export const placesRoutes = new Hono<{ Bindings: Env }>()

const MAX_INPUT_LENGTH = 200
const MIN_INPUT_LENGTH = 2

type AutocompleteBody = {
  input?: unknown
  sessionToken?: unknown
  languageCode?: unknown
  locationBias?: {
    lat?: unknown
    lng?: unknown
    radiusMeters?: unknown
  } | null
}

type ReverseBody = { lat?: unknown; lng?: unknown }

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

placesRoutes.post('/autocomplete', async (c) => {
  if (!c.env.GOOGLE_MAPS_API_KEY) {
    return c.json({ error: 'GOOGLE_MAPS_API_KEY not configured' }, 500)
  }

  let body: AutocompleteBody
  try {
    body = (await c.req.json()) as AutocompleteBody
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (typeof body.input !== 'string') {
    return c.json({ error: 'input is required (string)' }, 400)
  }
  const input = body.input.trim()
  if (input.length < MIN_INPUT_LENGTH) {
    return c.json({ suggestions: [] })
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return c.json({ error: `input too long (max ${MAX_INPUT_LENGTH})` }, 400)
  }

  const sessionToken = typeof body.sessionToken === 'string' ? body.sessionToken : undefined
  const languageCode = typeof body.languageCode === 'string' ? body.languageCode : undefined

  let locationBias: { lat: number; lng: number; radiusMeters: number } | undefined
  if (body.locationBias && typeof body.locationBias === 'object') {
    const { lat, lng, radiusMeters } = body.locationBias
    if (isFiniteNumber(lat) && isFiniteNumber(lng) && isFiniteNumber(radiusMeters)) {
      locationBias = { lat, lng, radiusMeters: Math.max(1, Math.min(50_000, radiusMeters)) }
    }
  }

  try {
    const suggestions = await autocomplete(c.env.GOOGLE_MAPS_API_KEY, {
      input,
      sessionToken,
      languageCode,
      locationBias,
    })
    return c.json({ suggestions })
  } catch (err) {
    if (err instanceof GooglePlacesError) {
      return c.json({ error: err.message }, err.status >= 500 ? 502 : 400)
    }
    console.error('places/autocomplete failed', err)
    return c.json({ error: 'Autocomplete failed' }, 502)
  }
})

placesRoutes.get('/:placeId', async (c) => {
  if (!c.env.GOOGLE_MAPS_API_KEY) {
    return c.json({ error: 'GOOGLE_MAPS_API_KEY not configured' }, 500)
  }
  const placeId = c.req.param('placeId')
  if (!placeId) {
    return c.json({ error: 'placeId is required' }, 400)
  }
  const sessionToken = c.req.query('sessionToken') || undefined

  try {
    const details = await placeDetails(c.env.GOOGLE_MAPS_API_KEY, placeId, sessionToken)
    return c.json({ data: details })
  } catch (err) {
    if (err instanceof GooglePlacesError) {
      return c.json(
        { error: err.message },
        err.status >= 500 ? 502 : err.status === 404 ? 404 : 400,
      )
    }
    console.error('places/details failed', err)
    return c.json({ error: 'Place details failed' }, 502)
  }
})

placesRoutes.post('/reverse-geocode', async (c) => {
  if (!c.env.GOOGLE_MAPS_API_KEY) {
    return c.json({ error: 'GOOGLE_MAPS_API_KEY not configured' }, 500)
  }

  let body: ReverseBody
  try {
    body = (await c.req.json()) as ReverseBody
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const lat = Number(body.lat)
  const lng = Number(body.lng)
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return c.json({ error: 'lat/lng must be valid coordinates' }, 400)
  }

  try {
    const details = await reverseGeocode(c.env.GOOGLE_MAPS_API_KEY, lat, lng)
    return c.json({ data: details })
  } catch (err) {
    if (err instanceof GooglePlacesError) {
      return c.json(
        { error: err.message },
        err.status === 404 ? 404 : err.status >= 500 ? 502 : 400,
      )
    }
    console.error('places/reverse-geocode failed', err)
    return c.json({ error: 'Reverse geocode failed' }, 502)
  }
})
