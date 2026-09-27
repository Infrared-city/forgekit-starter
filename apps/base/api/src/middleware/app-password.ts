import type { MiddlewareHandler } from 'hono'
import type { Env } from '../config.js'

/**
 * Optional shared password for the /infrared/* proxy.
 *
 * Without it, ANYONE who knows your Worker URL can run analyses and spend
 * YOUR AItokens. Set it once per environment:
 *
 *   npx wrangler secret put APP_PASSWORD --env production
 *
 * The page then sends it in the `X-App-Password` header (the examples app
 * asks the user for it; it is never built into the JavaScript bundle).
 * Unset = no check (fine for local development only).
 */
export const appPassword: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const expected = c.env.APP_PASSWORD
  if (!expected || c.req.method === 'OPTIONS') return next()
  const given = c.req.header('X-App-Password') ?? ''
  if (!(await sameText(given, expected))) {
    return c.json({ error: 'Wrong or missing app password (X-App-Password header)' }, 401)
  }
  return next()
}

/** Compare two strings without leaking where they differ (hash both first). */
async function sameText(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ])
  const x = new Uint8Array(ha)
  const y = new Uint8Array(hb)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}
