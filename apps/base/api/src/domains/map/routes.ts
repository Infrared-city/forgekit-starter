import { Hono } from 'hono'
import type { Env } from '../../config.js'

export const mapRoutes = new Hono<{ Bindings: Env }>()

const MOCK_POINTS = [
  { id: '1', lat: 40.7128, lng: -74.006, label: 'New York (POI)', type: 'poi' },
  { id: '2', lat: 51.5074, lng: -0.1278, label: 'London (Waypoint)', type: 'waypoint' },
]

mapRoutes.get('/points', (c) => c.json({ points: MOCK_POINTS }))

mapRoutes.post('/marker', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (typeof body !== 'object' || body === null) {
    return c.json({ error: 'Validation error', details: 'Expected JSON object' }, 400)
  }

  const b = body as Record<string, unknown>
  const errors: { field: string; message: string }[] = []

  if (!('id' in b)) {
    errors.push({ field: 'id', message: 'id is required' })
  } else if (typeof b.id !== 'string') {
    errors.push({ field: 'id', message: 'id must be a string' })
  }

  if (!('lat' in b)) {
    errors.push({ field: 'lat', message: 'lat is required' })
  } else if (typeof b.lat !== 'number') {
    errors.push({ field: 'lat', message: 'lat must be a number' })
  }

  if (!('lng' in b)) {
    errors.push({ field: 'lng', message: 'lng is required' })
  } else if (typeof b.lng !== 'number') {
    errors.push({ field: 'lng', message: 'lng must be a number' })
  }

  if (!('label' in b)) {
    errors.push({ field: 'label', message: 'label is required' })
  } else if (typeof b.label !== 'string') {
    errors.push({ field: 'label', message: 'label must be a string' })
  }

  if (!('type' in b)) {
    errors.push({ field: 'type', message: 'type is required' })
  } else if (typeof b.type !== 'string') {
    errors.push({ field: 'type', message: 'type must be a string' })
  } else if (!['waypoint', 'poi', 'user'].includes(b.type)) {
    errors.push({ field: 'type', message: 'type must be one of: waypoint, poi, user' })
  }

  if (errors.length) {
    return c.json({ error: 'Validation error', details: errors }, 400)
  }

  return c.json({ data: body })
})
