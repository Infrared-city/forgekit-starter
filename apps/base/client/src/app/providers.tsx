import { Loader2 } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { ErrorBoundary } from 'ui'
import { AppQueryProvider } from '@/components/providers/query-client-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { fetchProfile, refreshTokens } from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

function AuthInit({ children }: { children: ReactNode }) {
  const isLoading = useAuthStore((s) => s.isLoading)
  // Optimistic gate: if a persisted user is present from a prior session we
  // paint the shell immediately while the silent refresh + profile fetch runs
  // in the background. Route-level guards still gate sensitive content on
  // `selectIsAuthenticated` (idToken !== null && !isLoading).
  const hasPersistedUser = useAuthStore((s) => s.user !== null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const persistedUser = useAuthStore.getState().user

    const init = async () => {
      try {
        const { idToken, accessToken } = await refreshTokens()
        useAuthStore.getState().setTokens(idToken, accessToken)

        // Profile fetch runs in BACKGROUND — the spinner gate already
        // dropped (either via persisted user or below setLoading(false)),
        // so a slow `/user/profile` no longer blocks first paint.
        void fetchProfile(idToken)
          .then((user) => {
            // Cross-account guard: if the refreshed identity differs from
            // the persisted user, the cached UI was for a different
            // account on this browser — wipe the store.
            if (persistedUser && persistedUser.sub !== user.sub) {
              useAuthStore.getState().clear()
              return
            }
            useAuthStore.getState().setUser(user)
          })
          .catch(() => {
            // Tokens refreshed but profile fetch failed — continue authenticated
          })
      } catch {
        // No valid refresh token -- clear any persisted user so the gated
        // routes redirect cleanly to login.
        useAuthStore.getState().clear()
      }
    }

    // Promise.finally() guarantees the loading flag is cleared on every
    // exit path (success, rejection, or unexpected throw) without using a
    // try/finally statement, which the React Compiler cannot lower.
    init().finally(() => useAuthStore.getState().setLoading(false))
  }, [])

  // Render shell as soon as either the refresh resolved (isLoading=false)
  // OR a persisted user is available. The latter is the warm-reload win:
  // the shell is interactive on first paint while tokens refresh behind it.
  if (isLoading && !hasPersistedUser) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <AppQueryProvider>
        <AuthInit>{children}</AuthInit>
        <ToastProvider />
      </AppQueryProvider>
    </ErrorBoundary>
  )
}
