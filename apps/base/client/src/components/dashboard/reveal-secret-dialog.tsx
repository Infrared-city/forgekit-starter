import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'ui'

interface RevealSecretDialogProps {
  /** Short identifier shown above the secret block (e.g. API key name or "Webhook signing secret"). */
  label: string
  secret: string
  onClose: () => void
  title?: string
  description?: string
  confirmCopy?: string
}

const DEFAULT_TITLE = 'Save your API key'
const DEFAULT_DESCRIPTION =
  'This is the only time the full secret will be shown. Store it in your secret manager before closing this dialog.'
const DEFAULT_CONFIRM =
  "I've saved my API key in a secure location. I understand it cannot be retrieved later."

export function RevealSecretDialog({
  label,
  secret,
  onClose,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  confirmCopy = DEFAULT_CONFIRM,
}: RevealSecretDialogProps) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed — select the key manually')
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}} dismissible={false}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
          <div className="flex items-stretch gap-2">
            <code className="flex-1 select-all break-all rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
              {secret}
            </code>
            <Button size="icon" variant="outline" onClick={copy} aria-label="Copy to clipboard">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">{confirmCopy}</span>
        </label>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose} disabled={!saved} variant="destructive">
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
