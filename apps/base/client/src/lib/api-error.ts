/**
 * Shared error envelope parser used by both `api.ts` and `auth.api.ts`.
 *
 * The Python FastAPI backend returns one of two error envelope shapes:
 *   1. Domain envelope:    `{ error: string, details?: unknown }`
 *      (FastAPI request-validation handler + most domain routers)
 *   2. RFC 9457 problem:   `{ type, title, detail?, code?, status? }`
 *      (gateway-proxied auth/Cognito errors)
 *
 * Anything else (HTML 502 from CloudFront, plain text, unknown JSON) falls back
 * to the truncated raw body so the caller still gets *some* signal instead of a
 * generic status string.
 *
 * This is a leaf module — it must NOT import from `api.ts`, `auth.api.ts`, or
 * any error class to avoid circular dependencies. Callers wrap the parsed
 * fields in their own error class (`ApiError` or `AuthApiError`).
 */

const MAX_RAW_BODY = 500

export interface ParsedErrorEnvelope {
  /** Human-readable message extracted from the body, or a fallback. */
  message: string
  /** Optional error code (Python `type`/`code` or RFC 9457 `code`). */
  code?: string
  /** Optional structured details (Python `details` payload). */
  details?: unknown
  /** Seconds the client should wait before retrying, parsed from the
   * `Retry-After` response header. Accepts the integer-seconds form and the
   * HTTP-date form (RFC 7231); malformed values are ignored. */
  retryAfter?: number
}

/** Parse a Retry-After header value into seconds. Accepts an integer-seconds
 * form (e.g. "120") or an HTTP-date (e.g. "Wed, 21 Oct 2026 07:28:00 GMT").
 * Returns undefined for missing/malformed values or non-positive deltas. */
function parseRetryAfter(raw: string | null): number | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  const asInt = Number(trimmed)
  if (Number.isFinite(asInt) && asInt >= 0) {
    return Math.round(asInt)
  }

  const ts = Date.parse(trimmed)
  if (Number.isNaN(ts)) return undefined
  const deltaMs = ts - Date.now()
  if (deltaMs <= 0) return undefined
  return Math.round(deltaMs / 1000)
}

/**
 * Read the response body once and parse it into a structured envelope.
 *
 * @param res - Non-OK response to parse.
 * @param fallbackMessage - Message to use when the body is empty/unreadable.
 *   Callers usually pass `res.statusText` or a domain-specific prefix.
 */
export async function parseErrorEnvelope(
  res: Response,
  fallbackMessage: string,
): Promise<ParsedErrorEnvelope> {
  const retryAfter = parseRetryAfter(res.headers.get('Retry-After'))
  const text = await res.text().catch(() => '')

  if (!text) {
    return { message: fallbackMessage, retryAfter }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { message: text.slice(0, MAX_RAW_BODY), retryAfter }
  }

  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>

    // Python domain envelope: { error: string, details?: unknown }
    if (typeof obj.error === 'string') {
      return { message: obj.error, details: obj.details, retryAfter }
    }

    // RFC 9457 problem detail: { type, title, detail?, code?, status? }
    if (typeof obj.type === 'string' || typeof obj.title === 'string') {
      const message =
        (typeof obj.detail === 'string' && obj.detail) ||
        (typeof obj.title === 'string' && obj.title) ||
        fallbackMessage
      const code =
        (typeof obj.code === 'string' && obj.code) ||
        (typeof obj.type === 'string' ? obj.type : undefined)
      return { message, code, retryAfter }
    }
  }

  // Unknown JSON shape -- fall back to the raw (truncated) body so the caller
  // still gets *some* signal instead of a generic status. Prefer the raw text
  // over re-stringifying `parsed` (cheaper, preserves original formatting).
  return { message: text.slice(0, MAX_RAW_BODY), retryAfter }
}
