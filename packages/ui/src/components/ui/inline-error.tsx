import { cn } from '../../lib/utils'

interface InlineErrorProps {
  message?: string
  onRetry?: () => void
  className?: string
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function InlineError({ message = 'Failed to load', onRetry, className }: InlineErrorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
      <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded"
        >
          Retry
        </button>
      )}
    </div>
  )
}
