import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  LoadingButton,
} from 'ui'

export type WebhookSecretAction = 'rotate' | 'revoke'

interface ConfirmWebhookSecretDialogProps {
  action: WebhookSecretAction
  onCancel: () => void
  onConfirm: () => void
  submitting: boolean
}

const COPY: Record<WebhookSecretAction, { title: string; body: string; cta: string }> = {
  rotate: {
    title: 'Rotate webhook secret',
    body: 'A new signing secret will be generated. The current secret stops working immediately — outbound webhooks signed with it will fail verification until you switch to the new value.',
    cta: 'Rotate secret',
  },
  revoke: {
    title: 'Revoke webhook secret',
    body: 'This will immediately invalidate the current webhook signing secret. Any outbound webhook signed with it will fail verification until you create a new one. This cannot be undone.',
    cta: 'Revoke secret',
  },
}

export function ConfirmWebhookSecretDialog({
  action,
  onCancel,
  onConfirm,
  submitting,
}: ConfirmWebhookSecretDialogProps) {
  const copy = COPY[action]
  return (
    <Dialog open={true} onOpenChange={(o) => !o && !submitting && onCancel()}>
      <DialogHeader>
        <DialogTitle>{copy.title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-sm">{copy.body}</p>
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <LoadingButton variant="destructive" onClick={onConfirm} loading={submitting}>
          {copy.cta}
        </LoadingButton>
      </DialogFooter>
    </Dialog>
  )
}
