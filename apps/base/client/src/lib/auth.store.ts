import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export interface UserProfile {
  sub: string
  email: string
  name?: string
  picture?: string
}

interface AuthState {
  idToken: string | null
  accessToken: string | null
  user: UserProfile | null
  isLoading: boolean

  setTokens: (idToken: string, accessToken: string) => void
  setUser: (user: UserProfile | null) => void
  clear: () => void
  setLoading: (loading: boolean) => void
}

/**
 * Auth store with localStorage persistence of the `user` profile only
 * (tokens stay memory-only — they live in httpOnly refresh cookies + in-RAM
 * idToken). The persisted user enables an optimistic render on warm reload:
 * the AuthInit gate can drop the spinner immediately while the silent
 * `refreshTokens()` + `fetchProfile()` round-trips finish in the background.
 *
 * Security: `fetchProfile()` is called post-refresh and the returned `sub`
 * is compared against the persisted `user.sub`. A mismatch clears the store
 * (treats it as a different account on the same browser).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    subscribeWithSelector((set) => ({
      idToken: null,
      accessToken: null,
      user: null,
      isLoading: true,

      setTokens: (idToken, accessToken) => set({ idToken, accessToken }),
      setUser: (user) => set({ user }),
      // Reset isLoading too: callers (cross-account mismatch in AuthInit,
      // refresh failure) invoke clear() to declare the session resolved-as-
      // unauthenticated. Leaving isLoading=true would leave the gate
      // (isLoading && !hasPersistedUser) showing the spinner shell again
      // after the persisted user has just been wiped.
      clear: () => set({ idToken: null, accessToken: null, user: null, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    })),
    {
      name: 'forge-kit.auth.v1',
      // Only persist the non-sensitive profile. Tokens stay memory-only.
      partialize: (s) => ({ user: s.user }),
    },
  ),
)

/** Derived selector: true when user has a token and initial load is complete */
export const selectIsAuthenticated = (state: AuthState) =>
  state.idToken !== null && !state.isLoading
