import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge, Button, Input } from 'ui'
import { type ApiKeyRecord, renameApiKey } from '@/lib/apikeys.api'
import { apikeysKeys } from '@/lib/query-keys'

interface ApiKeyRowProps {
  apiKey: ApiKeyRecord
  onRevoke?: () => void
}

function formatRelative(iso?: string): string {
  if (!iso) return 'never'
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return iso
  const diff = Date.now() - ts
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(apiKey.name)

  const renameMutation = useMutation({
    mutationFn: (next: string) => renameApiKey(apiKey.id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apikeysKeys.list() })
      setEditing(false)
      toast.success('Key renamed')
    },
    onError: (err: unknown) => {
      setName(apiKey.name)
      toast.error(err instanceof Error ? err.message : 'Rename failed')
    },
  })

  const revoked = Boolean(apiKey.revokedAt)
  const typeLabel = apiKey.type === 'payg' ? 'PAYG' : 'General'

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border p-3 ${
        revoked ? 'opacity-60' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-7 w-48"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => {
                  const next = name.trim()
                  if (next && next !== apiKey.name) renameMutation.mutate(next)
                  else setEditing(false)
                }}
                disabled={renameMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => {
                  setName(apiKey.name)
                  setEditing(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="font-medium truncate">{apiKey.name}</p>
          )}
          <Badge variant={apiKey.type === 'payg' ? 'default' : 'secondary'}>{typeLabel}</Badge>
          {revoked && <Badge variant="outline">Revoked</Badge>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">
            {apiKey.prefix}
            {'•'.repeat(10)}
          </span>
          <span>Created {formatRelative(apiKey.createdAt)}</span>
          <span>Last used {formatRelative(apiKey.lastUsedAt)}</span>
        </div>
      </div>
      {!revoked && (
        <div className="flex items-center gap-1">
          {!editing && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(true)}
              aria-label="Rename"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onRevoke && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onRevoke}
              aria-label={`Revoke ${apiKey.name}`}
            >
              Revoke
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
