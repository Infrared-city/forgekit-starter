import type { Context } from 'hono'
import { Hono } from 'hono'
import type { Env } from '../../config.js'
import { authMiddleware } from '../../middleware/auth.js'
import { clearRefreshTokenCookie, getRefreshTokenCookie, setRefreshTokenCookie } from './cookies.js'

const GATEWAY_TIMEOUT = 10_000

export const authRoutes = new Hono<{ Bindings: Env }>()
export const userRoutes = new Hono<{ Bindings: Env }>()

type AuthContext = Context<{ Bindings: Env }>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireGatewayUrl(c: AuthContext): string | null {
  if (!c.env.INFRARED_AUTH_BASE_URL) {
    return 'INFRARED_AUTH_BASE_URL is not configured. Add it to apps/base/api/.dev.vars'
  }
  return null
}

function forwardResponse(upstream: Response): Response {
  const contentType = upstream.headers.get('content-type') ?? 'application/json'
  const headers: Record<string, string> = { 'Content-Type': contentType }
  const retryAfter = upstream.headers.get('retry-after')
  if (retryAfter) headers['Retry-After'] = retryAfter
  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}

function stripRefreshToken(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (k !== 'refreshToken') result[k] = v
  }
  return result
}

async function proxyWithCookie(
  c: AuthContext,
  gatewayPath: string,
  opts: { handleChallenge?: boolean } = {},
): Promise<Response> {
  const missingVar = requireGatewayUrl(c)
  if (missingVar) return c.json({ error: missingVar }, 500)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  let upstream: Response
  try {
    upstream = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}${gatewayPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT),
    })
  } catch (err) {
    console.error(`[auth] fetch ${gatewayPath} failed:`, err)
    if (err instanceof Error && err.name === 'TimeoutError') {
      return c.json({ error: 'Gateway timeout' }, 504)
    }
    return c.json({ error: 'Gateway unavailable' }, 502)
  }

  if (!upstream.ok) {
    return forwardResponse(upstream)
  }

  let data: unknown
  try {
    data = await upstream.json()
  } catch {
    return forwardResponse(upstream)
  }

  if (
    opts.handleChallenge &&
    typeof data === 'object' &&
    data !== null &&
    'challengeName' in data
  ) {
    return c.json(data)
  }

  if (typeof data === 'object' && data !== null && 'refreshToken' in data) {
    const d = data as Record<string, unknown>
    if (typeof d.refreshToken === 'string') {
      setRefreshTokenCookie(c, d.refreshToken)
      return c.json(stripRefreshToken(d))
    }
  }

  if (typeof data === 'object' && data !== null) {
    return c.json(stripRefreshToken(data as Record<string, unknown>))
  }

  return c.json(data)
}

// ---------------------------------------------------------------------------
// POST /auth/signup
// ---------------------------------------------------------------------------

authRoutes.post('/signup', (c) => proxyWithCookie(c, '/auth/signup'))

// ---------------------------------------------------------------------------
// POST /auth/confirm
// ---------------------------------------------------------------------------

authRoutes.post('/confirm', (c) => proxyWithCookie(c, '/auth/confirm'))

// ---------------------------------------------------------------------------
// POST /auth/resend-code
// ---------------------------------------------------------------------------

authRoutes.post('/resend-code', (c) => proxyWithCookie(c, '/auth/resend-code'))

// ---------------------------------------------------------------------------
// POST /auth/forgot-password
// ---------------------------------------------------------------------------

authRoutes.post('/forgot-password', (c) => proxyWithCookie(c, '/auth/forgot-password'))

// ---------------------------------------------------------------------------
// POST /auth/reset-password
// ---------------------------------------------------------------------------

authRoutes.post('/reset-password', (c) => proxyWithCookie(c, '/auth/reset-password'))

// ---------------------------------------------------------------------------
// POST /auth/signin
// ---------------------------------------------------------------------------

authRoutes.post('/signin', (c) => proxyWithCookie(c, '/auth/signin', { handleChallenge: true }))

// ---------------------------------------------------------------------------
// POST /auth/signin/challenge
// ---------------------------------------------------------------------------

authRoutes.post('/signin/challenge', (c) => proxyWithCookie(c, '/auth/signin/challenge'))

// ---------------------------------------------------------------------------
// POST /auth/social/google
// ---------------------------------------------------------------------------

authRoutes.post('/social/google', (c) => proxyWithCookie(c, '/auth/social/google'))

// ---------------------------------------------------------------------------
// POST /auth/refresh
// ---------------------------------------------------------------------------

authRoutes.post('/refresh', async (c) => {
  const missingVar = requireGatewayUrl(c)
  if (missingVar) return c.json({ error: missingVar }, 500)

  const refreshToken = getRefreshTokenCookie(c)
  if (!refreshToken) {
    return c.json({ error: 'No refresh token' }, 401)
  }

  let upstream: Response
  try {
    upstream = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT),
    })
  } catch (err) {
    console.error('[auth] fetch /auth/refresh failed:', err)
    if (err instanceof Error && err.name === 'TimeoutError') {
      return c.json({ error: 'Gateway timeout' }, 504)
    }
    return c.json({ error: 'Gateway unavailable' }, 502)
  }

  if (!upstream.ok) {
    return forwardResponse(upstream)
  }

  let data: unknown
  try {
    data = await upstream.json()
  } catch {
    return forwardResponse(upstream)
  }

  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>
    // Rotate the refresh cookie if gateway returned a new one
    if (typeof d.refreshToken === 'string') {
      setRefreshTokenCookie(c, d.refreshToken)
    }
    return c.json(stripRefreshToken(d))
  }

  return c.json(data)
})

// ---------------------------------------------------------------------------
// POST /auth/signout
// ---------------------------------------------------------------------------

authRoutes.post('/signout', async (c) => {
  const refreshToken = getRefreshTokenCookie(c)

  if (!refreshToken) {
    clearRefreshTokenCookie(c)
    return c.json({ success: true })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT),
    })
  } catch (err) {
    clearRefreshTokenCookie(c)
    if (err instanceof Error && err.name === 'TimeoutError') {
      return c.json({ error: 'Gateway timeout' }, 504)
    }
    return c.json({ error: 'Gateway unavailable' }, 502)
  }

  clearRefreshTokenCookie(c)

  if (!upstream.ok) {
    return forwardResponse(upstream)
  }

  let data: unknown
  try {
    data = await upstream.json()
  } catch {
    return forwardResponse(upstream)
  }

  return c.json(data)
})

// ---------------------------------------------------------------------------
// GET /auth/verify
// ---------------------------------------------------------------------------

authRoutes.get('/verify', async (c) => {
  const authorization = c.req.header('Authorization')

  let upstream: Response
  try {
    upstream = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}/auth/verify`, {
      headers: authorization ? { Authorization: authorization } : {},
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return c.json({ error: 'Gateway timeout' }, 504)
    }
    return c.json({ error: 'Gateway unavailable' }, 502)
  }

  return forwardResponse(upstream)
})

// ---------------------------------------------------------------------------
// GET /user/profile (protected)
// ---------------------------------------------------------------------------

userRoutes.get('/profile', async (c) => {
  const authorization = c.req.header('Authorization')

  let upstream: Response
  try {
    upstream = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}/user/profile`, {
      headers: authorization ? { Authorization: authorization } : {},
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return c.json({ error: 'Gateway timeout' }, 504)
    }
    return c.json({ error: 'Gateway unavailable' }, 502)
  }

  return forwardResponse(upstream)
})

// ---------------------------------------------------------------------------
// /user/apikeys/* (protected) — pure passthrough to auth-service
// ---------------------------------------------------------------------------
//
// `userRoutes` is mounted under the `guarded` sub-app in src/index.ts behind
// `guarded.use('*', authMiddleware)`, so unauthenticated callers are already
// rejected before reaching these handlers. The explicit middleware below is
// defense-in-depth — a refactor that moves `userRoutes` out from under
// `guarded` (or removes the `*` guard) must not silently expose the apikey
// endpoints as an unauthenticated pass-through.
userRoutes.use('/apikeys', authMiddleware)
userRoutes.use('/apikeys/*', authMiddleware)

async function proxyApiKeys(c: AuthContext, path: string, method: string): Promise<Response> {
  const missingVar = requireGatewayUrl(c)
  if (missingVar) return c.json({ error: missingVar }, 500)

  const authorization = c.req.header('Authorization')
  const init: RequestInit = {
    method,
    headers: authorization
      ? { Authorization: authorization, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(GATEWAY_TIMEOUT),
  }
  if (method === 'POST' || method === 'PATCH') {
    try {
      init.body = JSON.stringify(await c.req.json())
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }
  }

  let upstream: Response
  try {
    upstream = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}${path}`, init)
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return c.json({ error: 'Gateway timeout' }, 504)
    }
    return c.json({ error: 'Gateway unavailable' }, 502)
  }
  return forwardResponse(upstream)
}

userRoutes.get('/apikeys', (c) => proxyApiKeys(c, '/user/apikeys', 'GET'))
userRoutes.post('/apikeys', (c) => proxyApiKeys(c, '/user/apikeys', 'POST'))
userRoutes.patch('/apikeys/:id', (c) =>
  proxyApiKeys(c, `/user/apikeys/${c.req.param('id')}`, 'PATCH'),
)
userRoutes.delete('/apikeys/:id', (c) =>
  proxyApiKeys(c, `/user/apikeys/${c.req.param('id')}`, 'DELETE'),
)

// ---------------------------------------------------------------------------
// /user/webhook-secret (protected) — pure passthrough to auth-service.
//
// Webhook signing secret is a single per-account scalar — no list endpoint,
// no rename. `proxyApiKeys` is JSON-proxy-with-Authorization-passthrough at
// this point (the apikeys-specific name is historical) so reuse it as-is.
// Defense-in-depth authMiddleware mirrors the apikeys block above.
userRoutes.use('/webhook-secret', authMiddleware)
userRoutes.use('/webhook-secret/*', authMiddleware)

userRoutes.get('/webhook-secret', (c) => proxyApiKeys(c, '/user/webhook-secret', 'GET'))
userRoutes.post('/webhook-secret', (c) => proxyApiKeys(c, '/user/webhook-secret', 'POST'))
userRoutes.post('/webhook-secret/rotate', (c) =>
  proxyApiKeys(c, '/user/webhook-secret/rotate', 'POST'),
)
userRoutes.delete('/webhook-secret', (c) => proxyApiKeys(c, '/user/webhook-secret', 'DELETE'))
