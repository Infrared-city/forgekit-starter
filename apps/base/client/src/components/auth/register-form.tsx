import { Link } from '@tanstack/react-router'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Input, Label, LoadingButton } from 'ui'
import { signUp } from '@/lib/auth.api'
import { allRequirementsMet, PasswordRequirements } from './password-requirements'

// ─── Error mapping ──────────────────────────────────────────────────────────

function mapErrorToNode(error: unknown): ReactNode {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code

    if (code === 'AUTH_USER_EXISTS') {
      return (
        <>
          An account with this email already exists.{' '}
          <Link to="/login" className="underline font-medium">
            Sign in instead
          </Link>
        </>
      )
    }

    const messages: Record<string, string> = {
      AUTH_VALIDATION_FAILED: 'Please check your email and password meet the requirements',
      AUTH_TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
    }

    if (messages[code]) return messages[code]
  }

  return 'Something went wrong. Please try again.'
}

// ─── Validation ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Component ──────────────────────────────────────────────────────────────

interface RegisterFormProps {
  /** Invoked on successful signup. Caller must transition to the OTP screen
   * and pass these values to {@link OtpForm}. Password is held in memory only
   * (never persisted) -- see plan note on XSS. */
  onPendingConfirmation: (email: string, password: string) => void
}

export function RegisterForm({ onPendingConfirmation }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [error, setError] = useState<ReactNode | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword
  const showConfirmError = confirmTouched && !passwordsMatch
  const allPasswordReqsMet = allRequirementsMet(password)

  function validate(): string | null {
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address'
    if (!allPasswordReqsMet) return 'Password does not meet all requirements'
    if (!passwordsMatch) return 'Passwords do not match'
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
    try {
      await signUp(email, password)
      onPendingConfirmation(email, password)
    } catch (err) {
      setError(mapErrorToNode(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
        {password.length > 0 && <PasswordRequirements password={password} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Confirm password</Label>
        <Input
          id="register-confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (!confirmTouched) setConfirmTouched(true)
          }}
          autoComplete="new-password"
          disabled={loading}
        />
        {showConfirmError && <p className="text-xs text-destructive">Passwords do not match</p>}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <LoadingButton
        type="submit"
        className="w-full"
        loading={loading}
        loadingText="Creating account..."
      >
        Create account
      </LoadingButton>
    </form>
  )
}
