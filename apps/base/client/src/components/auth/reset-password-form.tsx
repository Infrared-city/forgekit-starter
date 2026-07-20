import { Link, useNavigate } from '@tanstack/react-router'
import { type FormEvent, useEffect, useState } from 'react'
import { Button, Input, Label, LoadingButton } from 'ui'
import {
  type AuthApiError,
  isAuthApiError,
  requestPasswordReset,
  resetPassword,
} from '@/lib/auth.api'
import { allRequirementsMet, PasswordRequirements } from './password-requirements'

const CODE_LENGTH = 6
const CODE_RE = /^\d{6}$/

// Default cooldown when 429 omits Retry-After (defensive; backend should set it).
const DEFAULT_RESEND_COOLDOWN_S = 30

interface ResetPasswordFormProps {
  email: string
}

type ResetError =
  | { kind: 'wrong-code' }
  | { kind: 'expired' }
  | { kind: 'federated' }
  | { kind: 'validation'; message: string }
  | { kind: 'rate-limited'; wait: number }
  | { kind: 'internal'; message: string }

type ResendNotice = { kind: 'sent' } | { kind: 'rate-limited' }

/** The gateway collapses many reset failures into a bare "Validation Failed"
 * detail with no field info — including Google/federated accounts, which have
 * no Cognito password to reset. Treat that generic string as "no useful
 * detail" so we can show actionable guidance instead. A specific detail (e.g.
 * a password-policy message) is passed through untouched. */
function isGenericValidationMessage(msg?: string): boolean {
  if (!msg) return true
  return msg.trim().toLowerCase() === 'validation failed'
}

function mapResetError(err: AuthApiError): ResetError {
  switch (err.code) {
    case 'AUTH_CODE_INVALID':
      return { kind: 'wrong-code' }
    case 'AUTH_CODE_EXPIRED':
      return { kind: 'expired' }
    case 'AUTH_FEDERATED_IDENTITY':
      return { kind: 'federated' }
    case 'AUTH_VALIDATION_FAILED':
      return {
        kind: 'validation',
        message: isGenericValidationMessage(err.message)
          ? "We couldn't reset your password. Check the code and that your new password meets every requirement. If you signed up with Google, use 'Sign in with Google' instead — password reset isn't available for Google accounts."
          : err.message,
      }
    case 'AUTH_TOO_MANY_REQUESTS':
      return {
        kind: 'rate-limited',
        wait: err.retryAfter ?? DEFAULT_RESEND_COOLDOWN_S,
      }
    case 'AUTH_INTERNAL_ERROR':
      return { kind: 'internal', message: 'Something went wrong. Please try again.' }
    default:
      return { kind: 'internal', message: err.message || 'Something went wrong.' }
  }
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resetError, setResetError] = useState<ResetError | null>(null)
  const [resendNotice, setResendNotice] = useState<ResendNotice | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const passwordsMatch = password === confirmPassword
  const showConfirmError = confirmTouched && !passwordsMatch
  const allPasswordReqsMet = allRequirementsMet(password)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setResetError(null)

    if (!CODE_RE.test(code)) {
      setResetError({ kind: 'validation', message: 'Code must be 6 digits' })
      return
    }
    if (!allPasswordReqsMet) {
      setResetError({ kind: 'validation', message: 'Password does not meet all requirements' })
      return
    }
    if (!passwordsMatch) {
      setResetError({ kind: 'validation', message: 'Passwords do not match' })
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(email, code, password)
      // No tokens issued -- send the user back to /login with their email
      // preserved so they can sign in with the new password immediately.
      navigate({ to: '/login' })
    } catch (err) {
      setSubmitting(false)
      if (!isAuthApiError(err)) {
        setResetError({ kind: 'internal', message: 'Something went wrong. Please try again.' })
        return
      }
      const mapped = mapResetError(err)
      if (mapped.kind === 'rate-limited') {
        setCooldown(mapped.wait)
      }
      setResetError(mapped)
    }
  }

  async function handleResend() {
    setResendNotice(null)
    setResending(true)
    try {
      await requestPasswordReset(email)
      setResendNotice({ kind: 'sent' })
      setCooldown(DEFAULT_RESEND_COOLDOWN_S)
    } catch (err) {
      if (isAuthApiError(err) && err.status === 429) {
        setCooldown(err.retryAfter ?? DEFAULT_RESEND_COOLDOWN_S)
      }
      setResendNotice({ kind: 'rate-limited' })
    } finally {
      setResending(false)
    }
  }

  const resendDisabled = resending || cooldown > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to <strong>{email}</strong>. Enter it along with a new password to
        finish the reset.
      </p>

      <p className="text-xs text-muted-foreground">
        Signed up with Google? Password reset isn&rsquo;t available for Google accounts &mdash;{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          sign in with Google
        </Link>{' '}
        instead.
      </p>

      <div className="space-y-2">
        <Label htmlFor="reset-code">Verification code</Label>
        <Input
          id="reset-code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={CODE_LENGTH}
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          disabled={submitting}
          className="tracking-[0.4em] text-center text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={submitting}
        />
        {password.length > 0 && <PasswordRequirements password={password} />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-confirm-password">Confirm new password</Label>
        <Input
          id="reset-confirm-password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (!confirmTouched) setConfirmTouched(true)
          }}
          autoComplete="new-password"
          disabled={submitting}
        />
        {showConfirmError && <p className="text-xs text-destructive">Passwords do not match</p>}
      </div>

      {resetError && resetError.kind !== 'federated' && (
        <p
          className={
            resetError.kind === 'expired'
              ? 'text-sm text-destructive font-medium'
              : 'text-sm text-destructive'
          }
          role="alert"
        >
          {resetError.kind === 'wrong-code' && 'Wrong code, try again.'}
          {resetError.kind === 'expired' && 'Code expired. Resend a new one below.'}
          {resetError.kind === 'validation' && resetError.message}
          {resetError.kind === 'rate-limited' &&
            `Too many attempts. Try again in ${resetError.wait}s.`}
          {resetError.kind === 'internal' && resetError.message}
        </p>
      )}

      {resetError?.kind === 'federated' && (
        <p className="text-sm text-destructive" role="alert">
          This account signs in with Google &mdash;{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            sign in with Google
          </Link>{' '}
          instead.
        </p>
      )}

      <LoadingButton
        type="submit"
        className="w-full"
        loading={submitting}
        loadingText="Resetting..."
      >
        Reset password
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
