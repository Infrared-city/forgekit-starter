import { Hono } from 'hono'
import type { Env } from '../../config.js'
import { confirm, presign, runAnalysis } from './client.js'

export const indoorRoutes = new Hono<{ Bindings: Env }>()

const SUPPORTED_ANALYSIS_TYPES = new Set(['daylight-factor'])

function validateConfirmBody(body: unknown): { field: string; message: string }[] | null {
  if (typeof body !== 'object' || body === null) {
    return [{ field: '', message: 'Expected JSON object' }]
  }
  const b = body as Record<string, unknown>
  const errors: { field: string; message: string }[] = []
  if (typeof b.fileId !== 'string' || !b.fileId) {
    errors.push({ field: 'fileId', message: 'fileId is required' })
  }
  return errors.length ? errors : null
}

function validateRunBody(body: unknown): { field: string; message: string }[] | null {
  if (typeof body !== 'object' || body === null) {
    return [{ field: '', message: 'Expected JSON object' }]
  }
  const b = body as Record<string, unknown>
  const errors: { field: string; message: string }[] = []

  if (typeof b.fileId !== 'string' || !b.fileId) {
    errors.push({ field: 'fileId', message: 'fileId is required' })
  }

  if (!SUPPORTED_ANALYSIS_TYPES.has(b['analysis-type'] as string)) {
    const expected = [...SUPPORTED_ANALYSIS_TYPES].sort().join(', ')
    errors.push({ field: 'analysis-type', message: `Invalid enum value. Expected ${expected}` })
  }

  for (const field of ['latitude', 'longitude'] as const) {
    if (typeof b[field] !== 'number') {
      errors.push({ field, message: 'Expected number' })
    }
  }

  for (const field of ['month-stamp', 'day-stamp', 'hour-stamp'] as const) {
    const val = b[field]
    if (!Array.isArray(val) || val.length < 1) {
      errors.push({ field, message: 'Array should have at least 1 element(s)' })
    } else if (!val.every((v) => typeof v === 'number')) {
      errors.push({ field, message: 'Expected array of numbers' })
    }
  }

  const floorIndex = b['floor-index']
  if (typeof floorIndex !== 'number' || !Number.isInteger(floorIndex) || floorIndex < 0) {
    errors.push({ field: 'floor-index', message: 'Expected non-negative integer' })
  }

  const gridSize = b['grid-size']
  if (typeof gridSize !== 'number' || gridSize <= 0) {
    errors.push({ field: 'grid-size', message: 'Number must be greater than 0' })
  }

  const analysisHeight = b['analysis-height']
  if (typeof analysisHeight !== 'number' || analysisHeight <= 0) {
    errors.push({ field: 'analysis-height', message: 'Number must be greater than 0' })
  }

  return errors.length ? errors : null
}

// ---------------------------------------------------------------------------
// POST /indoor/presign
// ---------------------------------------------------------------------------

indoorRoutes.post('/presign', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const data = await presign(c.env.INFRARED_AUTH_BASE_URL, authorization)
    return c.json({ data })
  } catch (err) {
    return c.json({ error: 'Failed to get presigned upload URL', details: String(err) }, 502)
  }
})

// ---------------------------------------------------------------------------
// POST /indoor/confirm
// ---------------------------------------------------------------------------

indoorRoutes.post('/confirm', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const fieldErrors = validateConfirmBody(body)
  if (fieldErrors) {
    return c.json({ error: 'Invalid request body', details: fieldErrors }, 400)
  }

  try {
    const b = body as Record<string, unknown>
    const authorization = c.req.header('Authorization')
    const data = await confirm(c.env.INFRARED_AUTH_BASE_URL, b.fileId as string, authorization)
    return c.json({ data })
  } catch (err) {
    return c.json({ error: 'Failed to confirm upload', details: String(err) }, 502)
  }
})

// ---------------------------------------------------------------------------
// POST /indoor/run
// ---------------------------------------------------------------------------

indoorRoutes.post('/run', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const fieldErrors = validateRunBody(body)
  if (fieldErrors) {
    return c.json({ error: 'Invalid request body', details: fieldErrors }, 400)
  }

  try {
    const authorization = c.req.header('Authorization')
    const data = await runAnalysis(
      c.env.INFRARED_AUTH_BASE_URL,
      body as Record<string, unknown>,
      authorization,
    )
    return c.json({ data })
  } catch (err) {
    return c.json({ error: 'Failed to run indoor analysis', details: String(err) }, 502)
  }
})
