import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button, Skeleton } from 'ui'
import { ApiError } from '@/lib/api'
import { type ApiKeyRecord, createApiKey, listApiKeys, revokeApiKey } from '@/lib/apikeys.api'
import { apikeysKeys } from '@/lib/query-keys'
import { ApiKeyRow } from './api-key-row'
import { CreateKeyDialog } from './create-key-dialog'
import { RevealSecretDialog } from './reveal-secret-dialog'
import { RevokeKeyDialog } from './revoke-key-dialog'

interface RevealState {
  key: ApiKeyRecord
  secret: string
}

export function ApiKeysTab() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [reveal, setReveal] = useState<RevealState | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRecord | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: apikeysKeys.list(),
    queryFn: listApiKeys,
  })

  const createMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: apikeysKeys.list() })
      setCreateOpen(false)
      setReveal({ key: res.key, secret: res.secret })
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.code === 'AUTH_APIKEY_PAYG_NOT_ENABLED') {
        toast.error(
          'Pay-as-you-go is not enabled on this account. Enable it in Billing first, then create a PAYG key.',
        )
        return
      }
      if (err instanceof ApiError && err.code === 'AUTH_APIKEY_LIMIT_EXCEEDED') {
        toast.error(err.message)
        return
      }
      toast.error(err instanceof Error ? err.message : 'Failed to create API key')
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apikeysKeys.list() })
      setRevokeTarget(null)
      toast.success('API key revoked')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke API key')
    },
  })

  const keys = data?.keys ?? []
  const active = keys.filter((k) => !k.revokedAt)
  const revoked = keys.filter((k) => k.revokedAt)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Use API keys to authenticate the Infrared SDK against your account.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New API key
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <KeyRound className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No API keys yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first key to start using the Infrared SDK from your own apps.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((k) => (
            <ApiKeyRow key={k.id} apiKey={k} onRevoke={() => setRevokeTarget(k)} />
          ))}
          {revoked.length > 0 && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Revoked</p>
              {revoked.map((k) => (
                <ApiKeyRow key={k.id} apiKey={k} />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateKeyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(input) => createMutation.mutate(input)}
        submitting={createMutation.isPending}
      />

      {reveal && (
        <RevealSecretDialog
          label={reveal.key.name}
          secret={reveal.secret}
          onClose={() => setReveal(null)}
        />
      )}

      {revokeTarget && (
        <RevokeKeyDialog
          apiKey={revokeTarget}
          onCancel={() => setRevokeTarget(null)}
          onConfirm={() => revokeMutation.mutate(revokeTarget.id)}
          submitting={revokeMutation.isPending}
        />
      )}
    </div>
  )
}
