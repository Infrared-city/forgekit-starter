// API client using fetch with timeout support, auth header injection, and 401 refresh
import { parseErrorEnvelope } from './api-error'
import { refreshTokens } from './auth.api'
import { useAuthStore } from './auth.store'

const baseURL = import.meta.env.VITE_API_URL || '/api'
const DEFAULT_TIMEOUT = 30000
const LONG_RUNNING_TIMEOUT = 180000 // 3 minutes for long-running analyses

// ─── 401 refresh lock ────────────────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null

async function handleUnauthorized(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const result = await refreshTokens()
      useAuthStore.getState().setTokens(result.idToken, result.accessToken)
      return true
    } catch {
      useAuthStore.getState().clear()
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// ─── Core fetch helpers ──────────────────────────────────────────────────────

function buildAuthHeaders(headers?: HeadersInit): HeadersInit {
  const idToken = useAuthStore.getState().idToken
  if (!idToken) return headers ?? {}

  // Merge Authorization into existing headers
  if (headers instanceof Headers) {
    headers.set('Authorization', `Bearer ${idToken}`)
    return headers
  }
  if (Array.isArray(headers)) {
    return [...headers, ['Authorization', `Bearer ${idToken}`]]
  }
  return { ...headers, Authorization: `Bearer ${idToken}` }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
  callerSignal?: AbortSignal,
): Promise<Response> {
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout)

  // Merge the caller-supplied AbortSignal with the internal timeout signal.
  // If the caller already aborted before we even started, short-circuit.
  if (callerSignal?.aborted) {
    clearTimeout(timeoutId)
    throw new DOMException('The operation was aborted.', 'AbortError')
  }

  // Forward caller aborts into the timeout controller so the fetch() below
  // rejects promptly. Removing the listener on completion prevents a
  // long-lived controller from leaking listeners across many requests.
  const onCallerAbort = () => timeoutController.abort()
  callerSignal?.addEventListener('abort', onCallerAbort)

  try {
    const response = await fetch(url, {
      ...options,
      headers: buildAuthHeaders(options.headers),
      credentials: 'include',
      signal: timeoutController.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    // If the caller aborted, surface an AbortError the caller can recognise
    // (controller.signal.aborted will be true). This matches real fetch
    // behavior and lets `useRunArea` distinguish a user-cancel from a
    // timeout (which we rethrow as "Request timed out" below).
    if (callerSignal?.aborted) {
      const abortErr = new DOMException('The operation was aborted.', 'AbortError')
      throw abortErr
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw error
  } finally {
    callerSignal?.removeEventListener('abort', onCallerAbort)
  }
}

// ─── Structured error type ───────────────────────────────────────────────────

/**
 * Structured API error with HTTP status, optional code, optional details, and
 * a parsed message. Thrown by every non-OK branch of `handleResponse` so callers
 * can branch on `err.status` (e.g. detect 501) instead of regex-matching text.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Read a Response body once and throw a structured `ApiError` parsed via the
 * shared `parseErrorEnvelope` helper. The same parser is used by `auth.api.ts`
 * so the two paths cannot drift on envelope shapes.
 */
async function throwParsedApiError(res: Response): Promise<never> {
  const fallback = res.statusText || `API Error: ${res.status}`
  const { message, code, details } = await parseErrorEnvelope(res, fallback)
  throw new ApiError(res.status, message, code, details)
}

/**
 * Parse a successful Response body, handling 204 / empty bodies cleanly.
 * Read as text and check `text.trim().length === 0` rather than trusting
 * `Content-Length: 0`, which is unreliable across proxies, or `text.length`,
 * which would JSON.parse a whitespace-only body and crash. If the body is
 * non-empty but not valid JSON (e.g. an upstream proxy returns an HTML 200),
 * throw a structured `ApiError` instead of a bare `SyntaxError`.
 */
async function parseOkBody<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (text.trim().length === 0) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError(res.status, text.slice(0, 500))
  }
}

async function handleResponse<T>(res: Response, retryFn: () => Promise<Response>): Promise<T> {
  // 401 -> attempt a single token refresh and retry
  if (res.status === 401) {
    const refreshed = await handleUnauthorized()
    if (refreshed) {
      const retryRes = await retryFn()
      if (!retryRes.ok) {
        await throwParsedApiError(retryRes)
      }
      return parseOkBody<T>(retryRes)
    }
    // Refresh failed -- surface the original 401
    await throwParsedApiError(res)
  }

  if (!res.ok) {
    await throwParsedApiError(res)
  }
  return parseOkBody<T>(res)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const api = {
  baseUrl: baseURL,
  getHeaders: (): Record<string, string> => {
    const idToken = useAuthStore.getState().idToken
    return idToken ? { Authorization: `Bearer ${idToken}` } : {}
  },

  get: async <T>(path: string, timeout = DEFAULT_TIMEOUT): Promise<T> => {
    const doFetch = () => fetchWithTimeout(`${baseURL}${path}`, {}, timeout)
    const res = await doFetch()
    return handleResponse<T>(res, doFetch)
  },

  post: async <T>(
    path: string,
    data: unknown,
    timeout = DEFAULT_TIMEOUT,
    signal?: AbortSignal,
  ): Promise<T> => {
    const doFetch = () =>
      fetchWithTimeout(
        `${baseURL}${path}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        timeout,
        signal,
      )
    const res = await doFetch()
    return handleResponse<T>(res, doFetch)
  },

  patch: async <T>(path: string, data: unknown, timeout = DEFAULT_TIMEOUT): Promise<T> => {
    const doFetch = () =>
      fetchWithTimeout(
        `${baseURL}${path}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        timeout,
      )
    const res = await doFetch()
    return handleResponse<T>(res, doFetch)
  },

  delete: async <T>(path: string, timeout = DEFAULT_TIMEOUT): Promise<T> => {
    const doFetch = () => fetchWithTimeout(`${baseURL}${path}`, { method: 'DELETE' }, timeout)
    const res = await doFetch()
    return handleResponse<T>(res, doFetch)
  },
}

export { LONG_RUNNING_TIMEOUT }
