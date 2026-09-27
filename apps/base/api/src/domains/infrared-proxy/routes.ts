import { Hono } from 'hono'
import type { Env } from '../../config.js'

/**
 * Infrared API proxy. The browser SDK calls this Worker, never the Infrared
 * API directly, for two reasons:
 *
 * 1. INFRARED_API_KEY stays on the server. The Worker adds it to every
 *    request (the browser SDK sends a placeholder key).
 * 2. CORS. The API and the S3 buckets do not send CORS headers for every
 *    response, so a browser must use a same-origin (or allow-listed) proxy.
 *
 * Routes:
 *   /infrared/s3-proxy/<host>/<key>  presigned S3 uploads (PUT) and result
 *                                    downloads (GET). Only Infrared buckets.
 *   /infrared/*                      everything else: presign, submit,
 *                                    status, results link, pricing, billing.
 */

/** Only Infrared's upload and result buckets. Keeps this from being an open relay. */
export const S3_HOST_ALLOW =
  /^(staging-)?infrared-(async-inference-jobs-outputs|uploads-v2)\.s3\.[a-z0-9-]+\.amazonaws\.com$/

/** Old SDK form `/s3-proxy/<key>` (no host) went to the prod results bucket. */
const LEGACY_S3_HOST = 'infrared-async-inference-jobs-outputs.s3.eu-central-1.amazonaws.com'

/** Request headers never sent to S3 (a presigned URL carries its own auth). */
const S3_STRIP = [
  'cookie',
  'authorization',
  'x-api-key',
  'x-app-password',
  'referer',
  'origin',
  'host',
]

/** Response headers not copied back (the runtime sets them again). */
const RESPONSE_STRIP = ['content-encoding', 'content-length', 'transfer-encoding', 'set-cookie']

function copyResponse(upstream: Response): Response {
  const headers = new Headers(upstream.headers)
  for (const h of RESPONSE_STRIP) headers.delete(h)
  return new Response(upstream.body, { status: upstream.status, headers })
}

const app = new Hono<{ Bindings: Env }>()

app.all('/s3-proxy/*', async (c) => {
  const rest = c.req.path.replace(/^\/infrared\/s3-proxy\//, '')
  const slash = rest.indexOf('/')
  const first = slash === -1 ? rest : rest.slice(0, slash)
  const hasHost = first.endsWith('.amazonaws.com')
  const host = hasHost ? first : LEGACY_S3_HOST
  const key = hasHost ? (slash === -1 ? '/' : rest.slice(slash)) : `/${rest}`
  if (!S3_HOST_ALLOW.test(host)) return c.json({ error: 'S3 host not allowed' }, 403)

  const target = new URL(`https://${host}${key}`)
  target.search = new URL(c.req.url).search

  const headers = new Headers(c.req.raw.headers)
  for (const h of S3_STRIP) headers.delete(h)
  const method = c.req.method
  const upstream = await fetch(target.toString(), {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : await c.req.arrayBuffer(),
    redirect: 'manual',
    signal: AbortSignal.timeout(180_000),
  })
  return copyResponse(upstream)
})

app.all('/*', async (c) => {
  const path = c.req.path.replace(/^\/infrared/, '')
  const target = new URL(`${c.env.INFRARED_BASE_URL.replace(/\/+$/, '')}${path}`)
  target.search = new URL(c.req.url).search

  const headers = new Headers(c.req.raw.headers)
  for (const h of ['cookie', 'host', 'origin', 'referer', 'x-app-password']) headers.delete(h)
  // The server-side key replaces the browser's placeholder. A signed-in
  // user's `Authorization: Bearer <jwt>` is forwarded unchanged; the gateway
  // then bills that user instead of the key owner.
  headers.set('X-Api-Key', c.env.INFRARED_API_KEY)

  const method = c.req.method
  const upstream = await fetch(target.toString(), {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : await c.req.arrayBuffer(),
    // The results route answers with a `Link` header that holds the presigned
    // S3 URL. Pass it back as-is; never follow a redirect here.
    redirect: 'manual',
    signal: AbortSignal.timeout(180_000),
  })
  return copyResponse(upstream)
})

export const infraredProxyRoutes = app
