import { InfraredClient, type InfraredClientConfig } from '@infrared-city/infrared-sdk-ts'

const baseUrl = import.meta.env.VITE_INFRARED_BASE_URL

// Dev-only: route presigned S3 result downloads through the vite `/s3-proxy`
// rewrite (configured in `vite.config.ts`) so the browser does not hit S3
// directly and trip CORS. The old in-repo SDK did this rewrite internally;
// the external `@infrared-city/infrared-sdk-ts` doesn't, so we wrap `fetch`
// here. Production builds skip this — bucket CORS handles real origins.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Matches both the prod bucket and its staging- prefixed sibling.
  const S3_HOST = 'infrared-async-inference-jobs-outputs.s3.eu-central-1.amazonaws.com'
  const origFetch = window.fetch
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    let urlStr: string | undefined
    if (typeof input === 'string') urlStr = input
    else if (input instanceof URL) urlStr = input.toString()
    else if (input instanceof Request) urlStr = input.url

    if (urlStr && urlStr.includes(S3_HOST)) {
      const u = new URL(urlStr)
      const rewritten = `${window.location.origin}/s3-proxy${u.pathname}${u.search}`
      return origFetch(rewritten, init)
    }
    return origFetch(input, init)
  }
}

export function createSdk(opts?: Partial<InfraredClientConfig>): InfraredClient {
  return new InfraredClient({
    baseUrl,
    ...opts,
  })
}
