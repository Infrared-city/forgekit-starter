import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-card border-border text-card-foreground',
          error: 'bg-destructive text-destructive-foreground border-destructive',
          success: 'bg-primary text-primary-foreground border-primary',
        },
      }}
    />
  )
}
