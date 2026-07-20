import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fetchProfile, googleSignIn } from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

// ─── Minimal Google Identity Services type declarations ─────────────────────

interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

interface GoogleIdConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void
        }
      }
    }
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

const GOOGLE_GSI_URL = 'https://accounts.google.com/gsi/client'

interface GoogleSignInButtonProps {
  redirectTo: string
}

export function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!clientId || !containerRef.current || initializedRef.current) return

    const container = containerRef.current

    function loadAndInitialize() {
      const existing = document.querySelector(`script[src="${GOOGLE_GSI_URL}"]`)
      if (existing && window.google) {
        initializeGoogle()
        return
      }

      if (existing) {
        // Script tag exists but not loaded yet — wait for it
        existing.addEventListener('load', initializeGoogle)
        return
      }

      const script = document.createElement('script')
      script.src = GOOGLE_GSI_URL
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      script.onerror = () => setError('Failed to load Google sign-in')
      document.head.appendChild(script)
    }

    function initializeGoogle() {
      if (!window.google || !container || initializedRef.current) return
      initializedRef.current = true

      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: handleCredentialResponse,
      })

      window.google.accounts.id.renderButton(container, {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: container.offsetWidth || 300,
      })
    }

    async function handleCredentialResponse(response: GoogleCredentialResponse) {
      setError(null)
      setLoading(true)
      const destination = redirectTo || '/map'
      try {
        const tokens = await googleSignIn(response.credential)
        setTokens(tokens.idToken, tokens.accessToken)

        try {
          const profile = await fetchProfile(tokens.idToken)
          setUser(profile)
        } catch {
          // Profile fetch failure is non-fatal
        }

        navigate({ to: destination })
      } catch {
        setLoading(false)
        setError('Google sign-in failed. Please try again.')
      }
    }

    loadAndInitialize()
  }, [navigate, redirectTo, setTokens, setUser])

  if (!clientId) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Signing in with Google...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="w-full flex justify-center min-h-[44px]" />
      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
