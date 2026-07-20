/**
 * Auth API functions -- call the FastAPI auth gateway endpoints.
 *
 * These use raw fetch with credentials: 'include' (NOT api.ts) to avoid
 * circular dependency with the 401 interceptor in api.ts.
 */

import { parseErrorEnvelope } from './api-error'
import type { UserProfile } from './auth.store'

const baseURL = import.meta.env.VITE_API_URL || '/api'

// ─── Response types ──────────────────────────────────────────────────────────

export interface TokenResponse {
  idToken: string
  accessToken: string
  expiresIn: number
}

export interface ChallengeResponse {
  challengeName: string
  session: string
  challengeParameters?: Record<string, string>
}

export type SignInResult = TokenResponse | ChallengeResponse

export function isChallengeResponse(result: SignInResult): result is ChallengeResponse {
  return 'challengeName' in result
}

// ─── Error handling ──────────────────────────────────────────────────────────

export class AuthApiError extends Error {
  code?: string
  status: number
  /** Seconds the client should wait before retrying, parsed from the
   * upstream `Retry-After` header (forwarded by the worker proxy). Only set
   * for 429 responses in practice. */
  retryAfter?: number

  constructor(message: string, status: number, code?: string, retryAfter?: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

export function isAuthApiError(err: unknown): err is AuthApiError {
  return err instanceof AuthApiError
}

/**
 * Parse a Response error body and throw an AuthApiError. Uses the shared
 * `parseErrorEnvelope` helper so this code path cannot drift from `api.ts`
 * on supported error shapes.
 */
async function throwApiError(response: Response): Promise<never> {
  const fallback = `Auth error: ${response.status} ${response.statusText}`
  const { message, code, retryAfter } = await parseErrorEnvelope(response, fallback)
  throw new AuthApiError(message, response.status, code, retryAfter)
}

// ─── API functions ───────────────────────────────────────────────────────────

export interface PendingConfirmationResponse {
  status: 'pending_confirmation'
  email: string
}

/**
 * Start signup. The backend returns no tokens -- the user must confirm the
 * 6-digit code sent to their email via {@link confirmSignup} before tokens
 * are issued.
 */
export async function signUp(
  email: string,
  password: string,
): Promise<PendingConfirmationResponse> {
  const response = await fetch(`${baseURL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<PendingConfirmationResponse>
}

/**
 * Exchange the 6-digit confirmation code (plus the original signup password)
 * for tokens. The worker proxy strips `refreshToken` into the httpOnly cookie
 * before returning, so this resolves to a TokenResponse with id+access only.
 */
export async function confirmSignup(
  email: string,
  code: string,
  password: string,
): Promise<TokenResponse> {
  const response = await fetch(`${baseURL}/auth/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code, password }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<TokenResponse>
}

/**
 * Resend the OTP code to the user's email. Always 200 regardless of whether
 * the email maps to a pending account (anti-enumeration). 429 carries a
 * `Retry-After` -- callers should surface a countdown via
 * {@link AuthApiError.retryAfter}.
 */
export async function resendCode(email: string): Promise<{ status: 'code_sent' }> {
  const response = await fetch(`${baseURL}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<{ status: 'code_sent' }>
}

/**
 * Kick off the Cognito password-reset flow. Backend emails a 6-digit code
 * to the address on file. Always 200 regardless of whether the email is
 * registered (anti-enumeration). 429 carries `Retry-After`.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ status: 'recovery_email_sent' }> {
  const response = await fetch(`${baseURL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<{ status: 'recovery_email_sent' }>
}

/**
 * Complete the password reset: submit the OTP from
 * {@link requestPasswordReset} plus a new password. No tokens are issued —
 * the caller must re-sign-in with the new password. Unknown email collapses
 * into `AUTH_CODE_INVALID` server-side (same shape as a wrong code).
 */
export async function resetPassword(
  email: string,
  code: string,
  password: string,
): Promise<{ status: 'password_reset' }> {
  const response = await fetch(`${baseURL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code, password }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<{ status: 'password_reset' }>
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const response = await fetch(`${baseURL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<SignInResult>
}

export async function respondToChallenge(
  session: string,
  challengeName: string,
  responses: Record<string, string>,
): Promise<TokenResponse> {
  const response = await fetch(`${baseURL}/auth/signin/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ session, challengeName, responses }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<TokenResponse>
}

export async function googleSignIn(googleIdToken: string): Promise<TokenResponse> {
  const response = await fetch(`${baseURL}/auth/social/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken: googleIdToken }),
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<TokenResponse>
}

/**
 * Refresh tokens using the httpOnly refresh cookie.
 * No Authorization header or body token needed -- the cookie is sent
 * automatically via credentials: 'include'.
 */
export async function refreshTokens(): Promise<{ idToken: string; accessToken: string }> {
  const response = await fetch(`${baseURL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) await throwApiError(response)
  return response.json() as Promise<{ idToken: string; accessToken: string }>
}

export async function signOut(): Promise<void> {
  const response = await fetch(`${baseURL}/auth/signout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) await throwApiError(response)
}

export async function fetchProfile(idToken: string): Promise<UserProfile> {
  const response = await fetch(`${baseURL}/user/profile`, {
    method: 'GET',
    credentials: 'include',
    headers: { Authorization: `Bearer ${idToken}` },
  })

  if (!response.ok) await throwApiError(response)

  // Gateway returns { user: { sub, email, username, ... }, account: ... }
  const data = (await response.json()) as {
    user: { sub: string; email: string; username?: string }
  }
  return {
    sub: data.user.sub,
    email: data.user.email,
    name: data.user.username,
  }
}
