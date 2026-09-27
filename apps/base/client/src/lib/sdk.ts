import {
  InfraredClient,
  type InfraredClientConfig,
  initializeCore,
} from '@infrared-city/infrared-sdk-ts'
import coreWasmUrl from '@infrared-city/infrared-sdk-ts/core.wasm?url'

// Every SDK call goes through the Worker in apps/base/api (`/infrared/*`),
// which adds INFRARED_API_KEY server-side. Dev: `/api` is forwarded by Vite.
// Production: VITE_API_URL is the deployed Worker.
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

function absolute(url: string): string {
  return new URL(url, window.location.href).href.replace(/\/+$/, '')
}

/**
 * The SDK is WASM-first: the kernel must load before geometry, tiling or
 * merge calls. `main.tsx` awaits this before the first render.
 */
export const sdkCoreReady: Promise<void> = initializeCore({
  url: new URL(coreWasmUrl, window.location.href),
})

const S3_HOST = /^(staging-)?infrared-[a-z0-9-]+\.s3\.[a-z0-9-]+\.amazonaws\.com$/

/**
 * Presigned S3 uploads and result downloads send no CORS headers for this
 * page. Relay them through the Worker (`/infrared/s3-proxy/<host>/<key>`),
 * in dev AND production.
 */
const proxyFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url.startsWith('https://')) {
    const u = new URL(url)
    if (S3_HOST.test(u.host)) {
      return fetch(
        `${absolute(API_BASE)}/infrared/s3-proxy/${u.host}${u.pathname}${u.search}`,
        init,
      )
    }
  }
  return fetch(input, init)
}

/**
 * `getToken` returns the signed-in user's JWT (or ''). When it is present the
 * gateway bills that user; without it the Worker's API key is used.
 */
export function createSdk(opts?: { getToken?: () => string }): InfraredClient {
  const config: InfraredClientConfig = {
    baseUrl: `${absolute(API_BASE)}/infrared`,
    fetch: proxyFetch,
    auth: async () => {
      const token = opts?.getToken?.()
      return {
        'x-infrared-application': 'webapp',
        // Placeholder: the Worker sets the real X-Api-Key.
        'X-Api-Key': 'added-by-the-worker',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    },
  }
  return new InfraredClient(config)
}
