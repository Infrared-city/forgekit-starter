import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { ChallengeForm } from '@/components/auth/challenge-form'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'
import { LoginForm } from '@/components/auth/login-form'
import { OtpForm } from '@/components/auth/otp-form'
import type { ChallengeResponse } from '@/lib/auth.api'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

type LoginState =
  | { step: 'login' }
  | { step: 'challenge'; challenge: ChallengeResponse }
  | { step: 'otp'; email: string; password: string }

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const [state, setState] = useState<LoginState>({ step: 'login' })

  if (state.step === 'challenge') {
    return (
      <AuthLayout title="Complete Sign In" description="Additional verification is required">
        <ChallengeForm challenge={state.challenge} redirectTo={redirectTo ?? '/map'} />
      </AuthLayout>
    )
  }

  if (state.step === 'otp') {
    return (
      <AuthLayout title="Verify your email" description="Finish confirming your account">
        <OtpForm email={state.email} password={state.password} redirectTo={redirectTo ?? '/map'} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Sign In" description="Sign in to your account to continue">
      <div className="space-y-4">
        <LoginForm
          onChallenge={(challenge) => setState({ step: 'challenge', challenge })}
          onUserNotConfirmed={(email, password) => setState({ step: 'otp', email, password })}
          redirectTo={redirectTo ?? '/map'}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <GoogleSignInButton redirectTo={redirectTo ?? '/map'} />

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/forgot-password" className="underline font-medium">
            Forgot password?
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Don&rsquo;t have an account?{' '}
          <Link to="/signup" className="underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
