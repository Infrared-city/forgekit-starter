import type { MiddlewareHandler } from 'hono'
import type { Env } from '../config.js'

/**
 * Shared password for the /infrared/* proxy. FAILS CLOSED.
 *
 * The proxy adds YOUR API key to every request, so an open proxy lets anyone
 * who knows the Worker URL spend YOUR AItokens. Therefore:
 *
 * - APP_PASSWORD set: the request needs `X-App-Password: <APP_PASSWORD>`,
 *   else 401. Set it with `npx wrangler secret put APP_PASSWORD --env production`.
 * - APP_PASSWORD not set: the proxy answers 503, EXCEPT for local development:
 *   `ALLOW_OPEN_PROXY_FOR_LOCAL_DEV=true` (only in apps/base/api/.dev.vars,
 *   never in wrangler.toml) AND the request reaches localhost / 127.0.0.1.
 *
 * The page sends the password in the header (the examples app asks the user
 * for it; it is never built into the JavaScript bundle).
 */
export const appPassword: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (c.req.method === 'OPTIONS') return next()
  const expected = c.env.APP_PASSWORD
  if (!expected) {
    if (isLocalDev(c.env, c.req.url)) return next()
    return c.json(
      {
        error:
          'This Worker has no APP_PASSWORD, so it refuses to spend your tokens. ' +
          'Run `npx wrangler secret put APP_PASSWORD --env production` (see README, "Deploy to Cloudflare").',
      },
      503,
    )
  }
  const given = c.req.header('X-App-Password') ?? ''
  if (!(await sameText(given, expected))) {
    return c.json({ error: 'Wrong or missing app password (X-App-Password header)' }, 401)
  }
  return next()
}

/** Open proxy only when BOTH: the explicit local-dev flag, and a local host. */
function isLocalDev(env: Env, url: string): boolean {
  if (env.ALLOW_OPEN_PROXY_FOR_LOCAL_DEV !== 'true') return false
  const host = new URL(url).hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
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
