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
      return fetch(relayed, withPassword(input, init)) // `init` keeps the SDK's abort signal
    }
    if (u.href.startsWith(absolute(API_BASE))) return fetch(input, withPassword(input, init))
  } catch {
    // Not an absolute URL: fall through.
  }
  return fetch(input, init)
}

// ---- Optional app password -------------------------------------------------
// If the Worker has an APP_PASSWORD secret, every request to it must carry the
// same value in `X-App-Password`. The user types it once in the page; it is
// kept in this browser only (localStorage), never in the code or the bundle.
const PASSWORD_KEY = 'infrared-app-password'

export function getAppPassword(): string {
  try {
    return localStorage.getItem(PASSWORD_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setAppPassword(value: string): void {
  try {
    if (value) localStorage.setItem(PASSWORD_KEY, value)
    else localStorage.removeItem(PASSWORD_KEY)
  } catch {
    // Storage blocked (private window): the password is not remembered.
  }
}

function withPassword(input: RequestInfo | URL, init?: RequestInit): RequestInit | undefined {
  const password = getAppPassword()
  if (!password) return init
  // Keep the SDK's own headers (from `init`, or from a Request object).
  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  )
  headers.set('X-App-Password', password)
  return { ...init, headers }
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
  const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  // 401 = wrong app password; 503 = the Worker has no APP_PASSWORD (it fails closed).
  if (/\b401\b/.test(text)) return `${text} (Check the App password field.)`
  if (/\b503\b/.test(text)) return `${text} (The Worker needs an APP_PASSWORD secret, see README.)`
  return text
}
