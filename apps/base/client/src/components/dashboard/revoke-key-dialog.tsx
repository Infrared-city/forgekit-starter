import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  LoadingButton,
} from 'ui'
import type { ApiKeyRecord } from '@/lib/apikeys.api'

interface RevokeKeyDialogProps {
  apiKey: ApiKeyRecord
  onCancel: () => void
  onConfirm: () => void
  submitting: boolean
}

export function RevokeKeyDialog({ apiKey, onCancel, onConfirm, submitting }: RevokeKeyDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && !submitting && onCancel()}>
      <DialogHeader>
        <DialogTitle>Revoke API key</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-sm">
          This will immediately disable <span className="font-medium">{apiKey.name}</span>. Any
          application using it will start receiving 401 responses. This cannot be undone.
        </p>
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <LoadingButton variant="destructive" onClick={onConfirm} loading={submitting}>
          Revoke key
        </LoadingButton>
      </DialogFooter>
    </Dialog>
  )
}
