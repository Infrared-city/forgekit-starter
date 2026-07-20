import { Link } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { Input, Label, LoadingButton } from 'ui'
import { isAuthApiError, requestPasswordReset } from '@/lib/auth.api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ForgotPasswordFormProps {
  /** Invoked once the gateway acks the reset request. Caller transitions
   * to the OTP-reset screen with the email preserved so the user does not
   * have to type it again. */
  onCodeRequested: (email: string) => void
}

export function ForgotPasswordForm({ onCodeRequested }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await requestPasswordReset(email)
      onCodeRequested(email)
    } catch (err) {
      setLoading(false)
      // Google-linked accounts have no resettable password — the gateway
      // rejects them with AUTH_FEDERATED_IDENTITY. Everything else is
      // 429 / network / 5xx (unknown emails return 200 — anti-enumeration).
      if (isAuthApiError(err) && err.code === 'AUTH_FEDERATED_IDENTITY') {
        setError(
          'This account signs in with Google. Use “Sign in with Google” on the sign-in page — password reset isn’t available for Google accounts.',
        )
        return
      }
      if (isAuthApiError(err) && err.status === 429) {
        setError('Too many requests. Please try again shortly.')
        return
      }
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter the email tied to your account. We&rsquo;ll send a 6-digit code you can use to set a
        new password.
      </p>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
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
        loadingText="Sending code..."
      >
        Send reset code
      </LoadingButton>

      <p className="text-xs text-muted-foreground">
        Signed up with Google? Password reset isn&rsquo;t available for Google accounts &mdash;{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          sign in with Google
        </Link>{' '}
        instead.
      </p>
    </form>
  )
}
