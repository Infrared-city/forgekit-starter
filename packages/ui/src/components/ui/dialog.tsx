import { X } from 'lucide-react'
import { type HTMLAttributes, type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /**
   * When true, the dialog cannot be dismissed by Escape or clicking the
   * backdrop. The consumer must drive `onOpenChange(false)` via its own UI
   * (e.g. a checkbox-gated "Done" button on a reveal-once secret modal).
   */
  dismissible?: boolean
}

function Dialog({ open, onOpenChange, children, dismissible = true }: DialogProps) {
  useEffect(() => {
    if (!open || !dismissible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismissible, onOpenChange])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (!dismissible) return
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6 pb-3', className)} {...props} />
}

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
}

function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function DialogContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-3 space-y-4', className)} {...props} />
}

function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 p-6 pt-3 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

interface DialogCloseProps {
  onClick: () => void
  className?: string
  label?: string
}

function DialogClose({ onClick, className, label = 'Close' }: DialogCloseProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
}
