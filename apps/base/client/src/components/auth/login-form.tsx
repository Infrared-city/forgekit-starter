import { useNavigate } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { Input, Label, LoadingButton } from 'ui'
import {
  type ChallengeResponse,
  fetchProfile,
  isAuthApiError,
  isChallengeResponse,
  resendCode,
  signIn,
} from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_VALIDATION_FAILED: 'Please check your email and password',
  AUTH_TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginFormProps {
  onChallenge: (challenge: ChallengeResponse) => void
  /** Invoked when the gateway returns 403 AUTH_USER_NOT_CONFIRMED. Caller
   * should transition to the OTP step with the email + password preserved
   * in component state. */
  onUserNotConfirmed: (email: string, password: string) => void
  redirectTo: string
}

export function LoginForm({ onChallenge, onUserNotConfirmed, redirectTo }: LoginFormProps) {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address'
    if (!password) return 'Password is required'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const destination = redirectTo || '/map'
    try {
      const result = await signIn(email, password)

      if (isChallengeResponse(result)) {
        setLoading(false)
        onChallenge(result)
        return
      }

      setTokens(result.idToken, result.accessToken)

      try {
        const profile = await fetchProfile(result.idToken)
        setUser(profile)
      } catch {
        // Profile fetch failure is non-fatal -- user is still authenticated
      }

      setLoading(false)
      navigate({ to: destination })
    } catch (err) {
      // Unconfirmed signup pivot: bounce to OTP screen, auto-fire a resend so
      // the user has a fresh code to type. Ignore resend failures (e.g. 429)
      // so the pivot is never blocked -- the OTP screen surfaces those.
      if (isAuthApiError(err) && err.code === 'AUTH_USER_NOT_CONFIRMED') {
        resendCode(email).catch(() => {})
        setLoading(false)
        onUserNotConfirmed(email, password)
        return
      }
      setLoading(false)
      setError(getErrorMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <LoadingButton type="submit" className="w-full" loading={loading} loadingText="Signing in...">
        Sign in
      </LoadingButton>
    </form>
  )
}
