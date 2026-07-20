export interface Env {
  ENVIRONMENT: string // 'dev' | 'preview' | 'production'
  // Versioned async/analysis surface the vendored SDK targets by default
  // (matches @infrared-city/infrared-sdk-ts's DEFAULT_BASE_URL) — used only
  // by the /infrared/* SDK proxy. Do NOT reuse this for auth/user/indoor
  // calls: on prod those live at the unversioned root domain, not under /v2
  // (verified: POST /v2/auth/signin -> 404, POST /auth/signin -> reaches
  // the real handler). Conflating the two 404s silently in production.
  INFRARED_BASE_URL: string
  // Unversioned root — auth, user profile, and indoor presign/confirm calls.
  INFRARED_AUTH_BASE_URL: string
  INFRARED_API_KEY: string
  // Server-side Google Maps Platform key — used by the /places proxy
  // (Places API v1 autocomplete/details + Geocoding API reverse). NEVER
  // exposed to the bundle. Set with `wrangler secret put GOOGLE_MAPS_API_KEY`;
  // local dev: drop into apps/base/api/.dev.vars.
  GOOGLE_MAPS_API_KEY: string
}
