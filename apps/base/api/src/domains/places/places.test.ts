import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { placesRoutes } from './routes.js'

const KEY = 'test-key'
const env = { GOOGLE_MAPS_API_KEY: KEY }

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('places routes', () => {
  let fetchSpy: MockInstance<(input: unknown, init?: unknown) => Promise<Response>>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch') as unknown as MockInstance<
      (input: unknown, init?: unknown) => Promise<Response>
    >
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  function firstCall(): [unknown, RequestInit] {
    const call = fetchSpy.mock.calls[0]
    if (!call) throw new Error('expected fetch to be called')
    return [call[0], (call[1] ?? {}) as RequestInit]
  }

  describe('POST /autocomplete', () => {
    it('400s on invalid JSON', async () => {
      const res = await placesRoutes.request(
        '/autocomplete',
        { method: 'POST', body: 'not json', headers: { 'Content-Type': 'application/json' } },
        env,
      )
      expect(res.status).toBe(400)
    })

    it('returns empty suggestions when input is shorter than the minimum', async () => {
      const res = await placesRoutes.request(
        '/autocomplete',
        {
          method: 'POST',
          body: JSON.stringify({ input: 'a' }),
          headers: { 'Content-Type': 'application/json' },
        },
        env,
      )
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ suggestions: [] })
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('normalizes Google v1 suggestions into a lean shape', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonResponse({
          suggestions: [
            {
              placePrediction: {
                placeId: 'P1',
                structuredFormat: {
                  mainText: { text: 'Berlin Tegel' },
                  secondaryText: { text: 'Berlin, Germany' },
                },
                types: ['airport'],
              },
            },
            {
              placePrediction: {
                placeId: 'P2',
                structuredFormat: { mainText: { text: 'Tegel See' } },
                types: ['natural_feature'],
              },
            },
            { placePrediction: {} },
          ],
        }),
      )

      const res = await placesRoutes.request(
        '/autocomplete',
        {
          method: 'POST',
          body: JSON.stringify({
            input: 'Tegel',
            sessionToken: 'session-1',
            locationBias: { lat: 52.5, lng: 13.4, radiusMeters: 5000 },
          }),
          headers: { 'Content-Type': 'application/json' },
        },
        env,
      )

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        suggestions: [
          {
            placeId: 'P1',
            primaryText: 'Berlin Tegel',
            secondaryText: 'Berlin, Germany',
            types: ['airport'],
          },
          {
            placeId: 'P2',
            primaryText: 'Tegel See',
            secondaryText: null,
            types: ['natural_feature'],
          },
        ],
      })

      const [url, init] = firstCall()
      expect(url).toBe('https://places.googleapis.com/v1/places:autocomplete')
      expect((init.headers as Record<string, string>)['X-Goog-Api-Key']).toBe(KEY)
      const sent = JSON.parse(init.body as string)
      expect(sent.input).toBe('Tegel')
      expect(sent.sessionToken).toBe('session-1')
      expect(sent.locationBias).toEqual({
        circle: { center: { latitude: 52.5, longitude: 13.4 }, radius: 5000 },
      })
    })

    it('502s when Google returns an error', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ error: { message: 'quota exceeded' } }, 500))
      const res = await placesRoutes.request(
        '/autocomplete',
        {
          method: 'POST',
          body: JSON.stringify({ input: 'Tegel' }),
          headers: { 'Content-Type': 'application/json' },
        },
        env,
      )
      expect(res.status).toBe(502)
    })
  })

  describe('GET /:placeId', () => {
    it('returns normalized details with locality/region/country', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonResponse({
          id: 'P1',
          displayName: { text: 'Brandenburg Gate' },
          formattedAddress: 'Pariser Platz, 10117 Berlin, Germany',
          location: { latitude: 52.5163, longitude: 13.3777 },
          addressComponents: [
            { longText: 'Berlin', types: ['locality'] },
            { longText: 'Berlin', types: ['administrative_area_level_1'] },
            { longText: 'Germany', types: ['country'] },
          ],
          types: ['tourist_attraction'],
        }),
      )

      const res = await placesRoutes.request('/P1?sessionToken=session-1', undefined, env)
      expect(res.status).toBe(200)
      const body = (await res.json()) as { data: Record<string, unknown> }
      expect(body.data).toMatchObject({
        placeId: 'P1',
        formatted: 'Pariser Platz, 10117 Berlin, Germany',
        coordinates: { lat: 52.5163, lng: 13.3777 },
        locality: 'Berlin',
        region: 'Berlin',
        country: 'Germany',
      })

      const [url, init] = firstCall()
      expect(url).toBe('https://places.googleapis.com/v1/places/P1?sessionToken=session-1')
      expect((init.headers as Record<string, string>)['X-Goog-FieldMask']).toContain('location')
    })

    it('502s when coordinates are missing', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonResponse({ id: 'P1', displayName: { text: 'X' }, formattedAddress: 'X' }),
      )
      const res = await placesRoutes.request('/P1', undefined, env)
      expect(res.status).toBe(502)
    })
  })

  describe('POST /reverse-geocode', () => {
    it('400s on out-of-range lat/lng', async () => {
      const res = await placesRoutes.request(
        '/reverse-geocode',
        {
          method: 'POST',
          body: JSON.stringify({ lat: 999, lng: 0 }),
          headers: { 'Content-Type': 'application/json' },
        },
        env,
      )
      expect(res.status).toBe(400)
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('normalizes the legacy geocode response', async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonResponse({
          status: 'OK',
          results: [
            {
              place_id: 'P9',
              formatted_address: 'Foo St 1, Berlin',
              geometry: { location: { lat: 52.5, lng: 13.4 } },
              address_components: [
                { long_name: 'Berlin', types: ['locality'] },
                { long_name: 'Germany', types: ['country'] },
              ],
              types: ['street_address'],
            },
          ],
        }),
      )
      const res = await placesRoutes.request(
        '/reverse-geocode',
        {
          method: 'POST',
          body: JSON.stringify({ lat: 52.5, lng: 13.4 }),
          headers: { 'Content-Type': 'application/json' },
        },
        env,
      )
      expect(res.status).toBe(200)
      const body = (await res.json()) as { data: Record<string, unknown> }
      expect(body.data).toMatchObject({
        placeId: 'P9',
        formatted: 'Foo St 1, Berlin',
        locality: 'Berlin',
        country: 'Germany',
      })
    })
  })

  it('500s when the API key is missing', async () => {
    const res = await placesRoutes.request(
      '/autocomplete',
      {
        method: 'POST',
        body: JSON.stringify({ input: 'Tegel' }),
        headers: { 'Content-Type': 'application/json' },
      },
      { GOOGLE_MAPS_API_KEY: '' },
    )
    expect(res.status).toBe(500)
  })
})
