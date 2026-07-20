import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { OtpForm } from '@/components/auth/otp-form'
import { RegisterForm } from '@/components/auth/register-form'

interface SignupSearch {
  redirect?: string
}

export const Route = createFileRoute('/signup')({
  validateSearch: (search: Record<string, unknown>): SignupSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: SignupPage,
})

type SignupState = { step: 'signup' } | { step: 'otp'; email: string; password: string }

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const [state, setState] = useState<SignupState>({ step: 'signup' })

  if (state.step === 'otp') {
    return (
      <AuthLayout title="Verify your email" description="Enter the code we just sent">
        <OtpForm email={state.email} password={state.password} redirectTo={redirectTo ?? '/map'} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create account" description="Sign up to get started">
      <RegisterForm
        onPendingConfirmation={(email, password) => setState({ step: 'otp', email, password })}
      />

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="underline font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
