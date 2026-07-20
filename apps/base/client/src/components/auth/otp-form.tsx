import { useNavigate } from '@tanstack/react-router'
import { type FormEvent, useEffect, useState } from 'react'
import { Button, Input, Label, LoadingButton } from 'ui'
import {
  type AuthApiError,
  confirmSignup,
  fetchProfile,
  isAuthApiError,
  resendCode,
} from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

const CODE_LENGTH = 6
const CODE_RE = /^\d{6}$/

// Default cooldown when 429 omits Retry-After (defensive; backend should set it).
const DEFAULT_RESEND_COOLDOWN_S = 30

interface OtpFormProps {
  email: string
  password: string
  redirectTo: string
}

type ConfirmError =
  | { kind: 'wrong-code' }
  | { kind: 'expired' }
  | { kind: 'validation'; message: string }
  | { kind: 'internal'; message: string }

type ResendNotice = { kind: 'sent' } | { kind: 'rate-limited' }

/**
 * Map a /auth/confirm error into a UI-level state. Navigation cases
 * (`AUTH_INVALID_CREDENTIALS`, `AUTH_NOT_FOUND`) are handled inline by the
 * submit handler -- they short-circuit and never reach this mapper.
 */
function mapConfirmError(err: AuthApiError): ConfirmError {
  switch (err.code) {
    case 'AUTH_CODE_INVALID':
      return { kind: 'wrong-code' }
    case 'AUTH_CODE_EXPIRED':
      return { kind: 'expired' }
    case 'AUTH_VALIDATION_FAILED':
      return { kind: 'validation', message: err.message || 'Code must be 6 digits' }
    case 'AUTH_INTERNAL_ERROR':
      return { kind: 'internal', message: 'Something went wrong. Please try again.' }
    default:
      return { kind: 'internal', message: err.message || 'Something went wrong.' }
  }
}

export function OtpForm({ email, password, redirectTo }: OtpFormProps) {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [confirmError, setConfirmError] = useState<ConfirmError | null>(null)
  const [resendNotice, setResendNotice] = useState<ResendNotice | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Countdown tick for the Resend button. Only runs while cooldown > 0;
  // setInterval cleared on every state change so the tick can never outlive
  // the cooldown.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setConfirmError(null)

    if (!CODE_RE.test(code)) {
      setConfirmError({ kind: 'validation', message: 'Code must be 6 digits' })
      return
    }

    setSubmitting(true)
    try {
      const tokens = await confirmSignup(email, code, password)
      setTokens(tokens.idToken, tokens.accessToken)

      try {
        const profile = await fetchProfile(tokens.idToken)
        setUser(profile)
      } catch {
        // Profile fetch failure is non-fatal -- user is still authenticated
      }

      navigate({ to: redirectTo || '/map' })
    } catch (err) {
      setSubmitting(false)
      if (!isAuthApiError(err)) {
        setConfirmError({ kind: 'internal', message: 'Something went wrong. Please try again.' })
        return
      }

      // Navigation pivots: pending signup gone or password drifted post-signup.
      if (err.code === 'AUTH_NOT_FOUND') {
        navigate({ to: '/signup' })
        return
      }
      if (err.code === 'AUTH_INVALID_CREDENTIALS') {
        navigate({ to: '/login' })
        return
      }
      if (err.code === 'AUTH_TOO_MANY_REQUESTS') {
        const wait = err.retryAfter ?? DEFAULT_RESEND_COOLDOWN_S
        setCooldown(wait)
        setConfirmError({
          kind: 'validation',
          message: `Too many attempts. Try again in ${wait}s.`,
        })
        return
      }

      setConfirmError(mapConfirmError(err))
    }
  }

  async function handleResend() {
    setResendNotice(null)
    setResending(true)
    try {
      await resendCode(email)
      setResendNotice({ kind: 'sent' })
      setCooldown(DEFAULT_RESEND_COOLDOWN_S)
    } catch (err) {
      if (isAuthApiError(err) && err.status === 429) {
        const wait = err.retryAfter ?? DEFAULT_RESEND_COOLDOWN_S
        setCooldown(wait)
        setResendNotice({ kind: 'rate-limited' })
      } else {
        setResendNotice({ kind: 'rate-limited' })
      }
    } finally {
      setResending(false)
    }
  }

  const resendDisabled = resending || cooldown > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below to finish signing up.
      </p>

      <div className="space-y-2">
        <Label htmlFor="otp-code">Verification code</Label>
        <Input
          id="otp-code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={CODE_LENGTH}
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          disabled={submitting}
          // letter-spacing makes the 6-digit code visually grouped without
          // splitting it into 6 separate inputs (which complicate paste).
          className="tracking-[0.4em] text-center text-lg"
        />
      </div>

      {confirmError && (
        <p
          className={
            confirmError.kind === 'expired'
              ? 'text-sm text-destructive font-medium'
              : 'text-sm text-destructive'
          }
          role="alert"
        >
          {confirmError.kind === 'wrong-code' && 'Wrong code, try again.'}
          {confirmError.kind === 'expired' && 'Code expired. Resend a new one below.'}
          {confirmError.kind === 'validation' && confirmError.message}
          {confirmError.kind === 'internal' && confirmError.message}
        </p>
      )}

      <LoadingButton
        type="submit"
        className="w-full"
        loading={submitting}
        loadingText="Verifying..."
      >
        Verify
      </LoadingButton>

      <div className="flex flex-col items-center gap-1 pt-1">
        <p className="text-xs text-muted-foreground">Didn&rsquo;t get the code?</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resendDisabled}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
        </Button>
        {resendNotice?.kind === 'sent' && (
          <p className="text-xs text-muted-foreground">Code sent. Check your inbox.</p>
        )}
        {resendNotice?.kind === 'rate-limited' && (
          <p className="text-xs text-destructive">Too many requests. Try again shortly.</p>
        )}
      </div>
    </form>
  )
}
