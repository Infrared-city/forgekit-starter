import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

type ResetState = { step: 'request' } | { step: 'reset'; email: string }

function ForgotPasswordPage() {
  const [state, setState] = useState<ResetState>({ step: 'request' })

  if (state.step === 'reset') {
    return (
      <AuthLayout title="Reset your password" description="Enter the code we just sent">
        <ResetPasswordForm email={state.email} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => setState({ step: 'request' })}
            className="underline font-medium"
          >
            Start over
          </button>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot password" description="We&rsquo;ll email you a reset code">
      <ForgotPasswordForm onCodeRequested={(email) => setState({ step: 'reset', email })} />

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link to="/login" className="underline font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
