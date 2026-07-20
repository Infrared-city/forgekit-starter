import type { MiddlewareHandler } from 'hono'
import type { Env } from '../config.js'

export interface AuthClaims {
  valid: boolean
  sub: string
  email: string
  exp: number
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthClaims
  }
}

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json({ error: 'Missing Authorization header' }, 401)
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return c.json({ error: 'Invalid Authorization header format. Expected: Bearer <token>' }, 401)
  }

  const token = parts[1]

  let verifyResponse: Response
  try {
    verifyResponse = await fetch(`${c.env.INFRARED_AUTH_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError'
    if (isTimeout) {
      return c.json({ error: 'Authentication service unavailable' }, 503)
    }
    return c.json({ error: 'Authentication service unavailable' }, 503)
  }

  const status = verifyResponse.status
  if (status >= 500 || status === 429) {
    return c.json({ error: 'Authentication service unavailable' }, 503)
  }

  if (status !== 200) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  let claims: AuthClaims
  try {
    const data = (await verifyResponse.json()) as Record<string, unknown>
    if (!data.valid) {
      return c.json({ error: 'Token validation failed' }, 401)
    }
    claims = {
      valid: data.valid as boolean,
      sub: (data.sub as string) ?? '',
      email: (data.email as string) ?? '',
      exp: (data.exp as number) ?? 0,
    }
  } catch {
    return c.json({ error: 'Authentication service unavailable' }, 503)
  }

  c.set('user', claims)
  await next()
}
