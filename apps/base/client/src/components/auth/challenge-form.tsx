import { useNavigate } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { Input, Label, LoadingButton } from 'ui'
import { type ChallengeResponse, fetchProfile, respondToChallenge } from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

interface ChallengeFormProps {
  challenge: ChallengeResponse
  redirectTo: string
}

export function ChallengeForm({ challenge, redirectTo }: ChallengeFormProps) {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  const [responses, setResponses] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isNewPassword = challenge.challengeName === 'NEW_PASSWORD_REQUIRED'
  const parameterKeys = challenge.challengeParameters
    ? Object.keys(challenge.challengeParameters)
    : []

  function updateResponse(key: string, value: string) {
    setResponses((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (isNewPassword && !responses.NEW_PASSWORD) {
      setError('New password is required')
      return
    }

    setLoading(true)
    const destination = redirectTo || '/map'
    try {
      const tokens = await respondToChallenge(challenge.session, challenge.challengeName, responses)

      setTokens(tokens.idToken, tokens.accessToken)

      try {
        const profile = await fetchProfile(tokens.idToken)
        setUser(profile)
      } catch {
        // Profile fetch failure is non-fatal
      }

      setLoading(false)
      navigate({ to: destination })
    } catch {
      setLoading(false)
      setError('Challenge response failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Additional verification required: <strong>{challenge.challengeName}</strong>
      </p>

      {isNewPassword ? (
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter your new password"
            value={responses.NEW_PASSWORD ?? ''}
            onChange={(e) => updateResponse('NEW_PASSWORD', e.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
      ) : (
        parameterKeys.map((key) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`challenge-${key}`}>{key}</Label>
            <Input
              id={`challenge-${key}`}
              type="text"
              placeholder={`Enter ${key}`}
              value={responses[key] ?? ''}
              onChange={(e) => updateResponse(key, e.target.value)}
              disabled={loading}
            />
          </div>
        ))
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <LoadingButton type="submit" className="w-full" loading={loading} loadingText="Submitting...">
        Submit
      </LoadingButton>
    </form>
  )
}
