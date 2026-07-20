import { Hono } from 'hono'
import type { Env } from '../../config.js'

const S3_RESULTS_HOST =
  'infrared-async-inference-jobs-outputs.s3.eu-central-1.amazonaws.com'

const app = new Hono<{ Bindings: Env }>()

// S3 proxy for presigned result downloads
app.all('/s3-proxy/*', async (c) => {
  const s3Path = c.req.path.replace(/^\/infrared\/s3-proxy/, '')
  const incoming = new URL(c.req.url)
  const s3Url = new URL(`https://${S3_RESULTS_HOST}${s3Path}`)
  for (const [k, v] of incoming.searchParams) {
    s3Url.searchParams.set(k, v)
  }

  const upstream = await fetch(s3Url.toString(), {
    signal: AbortSignal.timeout(120_000),
  })

  const responseHeaders = new Headers()
  const ct = upstream.headers.get('Content-Type')
  if (ct) responseHeaders.set('Content-Type', ct)
  const cl = upstream.headers.get('Content-Length')
  if (cl) responseHeaders.set('Content-Length', cl)
  responseHeaders.set('Cache-Control', 'public, max-age=3600')

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
})

/**
 * Intercept job results endpoint: fetch the S3 content server-side
 * instead of forwarding the Link header (which CF Workers strips).
 */
app.get('/async/jobs/:jobId/results', async (c) => {
  const jobId = c.req.param('jobId')
  const target = `${c.env.INFRARED_BASE_URL}/async/jobs/${jobId}/results`

  const headers: Record<string, string> = { 'X-Api-Key': c.env.INFRARED_API_KEY }
  const authorization = c.req.header('Authorization')
  if (authorization) headers['Authorization'] = authorization

  const upstream = await fetch(target, {
    headers,
    signal: AbortSignal.timeout(30_000),
  })

  if (!upstream.ok) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    })
  }

  // Extract presigned URL from Link header
  const linkHeader = upstream.headers.get('link') ?? upstream.headers.get('Link') ?? ''
  const presignedUrl = linkHeader.replace(/^<|>.*$/g, '')

  if (!presignedUrl) {
    // Log all headers for debugging
    const allHeaders: Record<string, string> = {}
    upstream.headers.forEach((v, k) => {
      allHeaders[k] = v.substring(0, 100)
    })
    console.error(
      '[infrared-proxy] No Link header in upstream response. Headers:',
      JSON.stringify(allHeaders),
    )
    return c.json({ error: 'No presigned URL in upstream response' }, 502)
  }

  // Fetch S3 content server-side
  const s3Res = await fetch(presignedUrl, {
    signal: AbortSignal.timeout(120_000),
  })

  if (!s3Res.ok) {
    console.error(`[infrared-proxy] S3 fetch failed: ${s3Res.status}`)
    return c.json({ error: `S3 download failed (${s3Res.status})` }, 502)
  }

  const responseHeaders = new Headers()
  const ct = s3Res.headers.get('Content-Type')
  if (ct) responseHeaders.set('Content-Type', ct)
  const cl = s3Res.headers.get('Content-Length')
  if (cl) responseHeaders.set('Content-Length', cl)

  return new Response(s3Res.body, {
    status: 200,
    headers: responseHeaders,
  })
})

// All other Infrared API requests
app.all('/*', async (c) => {
  const path = c.req.path.replace(/^\/infrared/, '')
  const target = `${c.env.INFRARED_BASE_URL}${path}`
  const url = new URL(target)
  const incoming = new URL(c.req.url)
  for (const [k, v] of incoming.searchParams) {
    url.searchParams.set(k, v)
  }

  const headers = new Headers()
  headers.set('X-Api-Key', c.env.INFRARED_API_KEY)
  const authorization = c.req.header('Authorization')
  if (authorization) headers.set('Authorization', authorization)
  const contentType = c.req.header('Content-Type')
  if (contentType) headers.set('Content-Type', contentType)

  const method = c.req.method
  const body = method !== 'GET' && method !== 'HEAD' ? c.req.raw.body : undefined

  const upstream = await fetch(url.toString(), {
    method,
    headers,
    body,
    signal: AbortSignal.timeout(180_000),
  })

  const responseHeaders = new Headers()
  const ct = upstream.headers.get('Content-Type')
  if (ct) responseHeaders.set('Content-Type', ct)
  const cl = upstream.headers.get('Content-Length')
  if (cl) responseHeaders.set('Content-Length', cl)
  const cc = upstream.headers.get('Cache-Control')
  if (cc) responseHeaders.set('Cache-Control', cc)

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
})

export const infraredProxyRoutes = app
