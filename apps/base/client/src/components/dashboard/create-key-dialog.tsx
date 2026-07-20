import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  LoadingButton,
} from 'ui'
import type { ApiKeyType } from '@/lib/apikeys.api'

interface CreateKeyDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: { name: string; type: ApiKeyType }) => void
  submitting: boolean
}

export function CreateKeyDialog({ open, onClose, onSubmit, submitting }: CreateKeyDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ApiKeyType>('general')

  useEffect(() => {
    if (!open) {
      setName('')
      setType('general')
    }
  }, [open])

  const canSubmit = name.trim().length > 0 && !submitting

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogHeader>
        <DialogTitle>Create API key</DialogTitle>
        <DialogDescription>
          The secret will be shown once. Store it somewhere safe — you won't see it again.
        </DialogDescription>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-2">
          <Label htmlFor="key-name">Name</Label>
          <Input
            id="key-name"
            placeholder="e.g. Local dev"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            autoFocus
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <div className="grid gap-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3 hover:bg-accent/40">
              <input
                type="radio"
                name="key-type"
                value="general"
                checked={type === 'general'}
                onChange={() => setType('general')}
                disabled={submitting}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">General</p>
                <p className="text-xs text-muted-foreground">
                  Standard key tied to your subscription. Use for production and dev.
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3 hover:bg-accent/40">
              <input
                type="radio"
                name="key-type"
                value="payg"
                checked={type === 'payg'}
                onChange={() => setType('payg')}
                disabled={submitting}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">Pay as you go</p>
                <p className="text-xs text-muted-foreground">
                  Bills usage over the included plan to your card. Requires PAYG enabled in Billing
                  — the API will reject the request if it isn't.
                </p>
              </div>
            </label>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <LoadingButton
          onClick={() => canSubmit && onSubmit({ name: name.trim(), type })}
          disabled={!canSubmit}
          loading={submitting}
        >
          Create key
        </LoadingButton>
      </DialogFooter>
    </Dialog>
  )
}
