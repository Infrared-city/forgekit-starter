// One place that creates the Infrared SDK client for the browser.
//
// RULE: the browser never holds your API key. Every SDK request goes to the
// Worker in apps/base/api (route /infrared/*). The Worker adds the real key.
import { InfraredClient, initializeCore } from '@infrared-city/infrared-sdk-ts'
import coreWasmUrl from '@infrared-city/infrared-sdk-ts/core.wasm?url'

/** Your Worker. Dev: "/api" (Vite forwards it). Production: set VITE_API_URL. */
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

function absolute(url: string): string {
  return new URL(url, window.location.href).href.replace(/\/+$/, '')
}

/** Only Infrared buckets go through the Worker's S3 relay. */
const S3_HOST = /^(staging-)?infrared-[a-z0-9-]+\.s3\.[a-z0-9-]+\.amazonaws\.com$/

/**
 * The SDK uploads big payloads to, and downloads results from, presigned S3
 * URLs. S3 sends no CORS headers for this page, so we send those requests to
 * the Worker, which relays them (`/infrared/s3-proxy/<host>/<key>`).
 */
const proxyFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  try {
    const u = new URL(url)
    if (S3_HOST.test(u.host)) {
      const relayed = `${absolute(API_BASE)}/infrared/s3-proxy/${u.host}${u.pathname}${u.search}`
      return fetch(relayed, init) // `init` keeps the SDK's abort signal
    }
  } catch {
    // Not an absolute URL: fall through.
  }
  return fetch(input, init)
}

let ready: Promise<InfraredClient> | undefined

/** Load the SDK's WebAssembly once, then return one shared client. */
export function getClient(): Promise<InfraredClient> {
  ready ??= (async () => {
    await initializeCore({ url: new URL(coreWasmUrl, window.location.href) })
    return new InfraredClient({
      baseUrl: `${absolute(API_BASE)}/infrared`,
      // Placeholder only. The Worker replaces it with INFRARED_API_KEY.
      apiKey: 'added-by-the-worker',
      fetch: proxyFetch,
    })
  })()
  return ready
}

/** Turn any thrown value into one short sentence for the screen. */
export function errorText(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`
  return String(err)
}
