import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, RefreshCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button, Skeleton } from 'ui'
import { ApiError } from '@/lib/api'
import { webhooksKeys } from '@/lib/query-keys'
import {
  createWebhookSecret,
  getWebhookSecret,
  revokeWebhookSecret,
  rotateWebhookSecret,
  type WebhookSecretMetadata,
} from '@/lib/webhooks.api'
import { RevealSecretDialog } from './reveal-secret-dialog'
import {
  ConfirmWebhookSecretDialog,
  type WebhookSecretAction,
} from './revoke-webhook-secret-dialog'

interface RevealState {
  raw: string
  /** Title shown above the secret; depends on whether this was a create or a rotate. */
  title: string
}

const REVEAL_DESCRIPTION =
  'This is the only time the full webhook signing secret will be shown. Store it in your secret manager before closing this dialog. Use it to verify the HMAC-SHA256 signature on incoming webhooks from Infrared.'
const REVEAL_CONFIRM =
  "I've saved my webhook secret in a secure location. I understand it cannot be retrieved later."

function formatDate(iso?: string): string {
  if (!iso) return ''
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return iso
  return new Date(iso).toLocaleDateString()
}

export function WebhookSecretTab() {
  const queryClient = useQueryClient()
  const [reveal, setReveal] = useState<RevealState | null>(null)
  const [confirmAction, setConfirmAction] = useState<WebhookSecretAction | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: webhooksKeys.secret(),
    queryFn: getWebhookSecret,
  })
  const secret: WebhookSecretMetadata | null = data?.secret ?? null

  const createMutation = useMutation({
    mutationFn: createWebhookSecret,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: webhooksKeys.secret() })
      setReveal({ raw: res.raw, title: 'Save your webhook signing secret' })
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.code === 'AUTH_WEBHOOK_SECRET_EXISTS') {
        toast.error('A webhook secret already exists — use Rotate instead.')
        queryClient.invalidateQueries({ queryKey: webhooksKeys.secret() })
        return
      }
      toast.error(err instanceof Error ? err.message : 'Failed to create webhook secret')
    },
  })

  const rotateMutation = useMutation({
    mutationFn: rotateWebhookSecret,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: webhooksKeys.secret() })
      setConfirmAction(null)
      setReveal({ raw: res.raw, title: 'Save your new webhook signing secret' })
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.code === 'AUTH_WEBHOOK_SECRET_NOT_FOUND') {
        toast.error('No webhook secret to rotate — create one first.')
        queryClient.invalidateQueries({ queryKey: webhooksKeys.secret() })
        setConfirmAction(null)
        return
      }
      toast.error(err instanceof Error ? err.message : 'Failed to rotate webhook secret')
    },
  })

  const revokeMutation = useMutation({
    mutationFn: revokeWebhookSecret,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhooksKeys.secret() })
      setConfirmAction(null)
      toast.success('Webhook secret revoked')
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.code === 'AUTH_WEBHOOK_SECRET_NOT_FOUND') {
        toast.error('No webhook secret to revoke.')
        queryClient.invalidateQueries({ queryKey: webhooksKeys.secret() })
        setConfirmAction(null)
        return
      }
      toast.error(err instanceof Error ? err.message : 'Failed to revoke webhook secret')
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Use this secret to verify the HMAC-SHA256 signature on outbound webhooks sent by Infrared.
          One secret per account — rotate periodically.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : secret === null ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <KeyRound className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No webhook secret yet</p>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Create a signing secret to start verifying incoming webhooks from Infrared.
          </p>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            size="sm"
          >
            Create webhook secret
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">Webhook signing secret</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">
                {secret.prefix}
                {'•'.repeat(10)}
              </span>
              <span>Created {formatDate(secret.createdAt)}</span>
              {secret.lastRotatedAt && <span>Rotated {formatDate(secret.lastRotatedAt)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setConfirmAction('rotate')}
              aria-label="Rotate"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setConfirmAction('revoke')}
              aria-label="Revoke"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {reveal && (
        <RevealSecretDialog
          label="Webhook signing secret"
          secret={reveal.raw}
          title={reveal.title}
          description={REVEAL_DESCRIPTION}
          confirmCopy={REVEAL_CONFIRM}
          onClose={() => setReveal(null)}
        />
      )}

      {confirmAction && (
        <ConfirmWebhookSecretDialog
          action={confirmAction}
          submitting={
            confirmAction === 'rotate' ? rotateMutation.isPending : revokeMutation.isPending
          }
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction === 'rotate') rotateMutation.mutate()
            else revokeMutation.mutate()
          }}
        />
      )}
    </div>
  )
}
