import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { Button, type ButtonProps } from './button'

interface ShimmerButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ loading, loadingText, children, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(loading && 'gap-2', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        <span className={cn(loading && 'animate-shimmer')}>
          {loading ? loadingText || children : children}
        </span>
      </Button>
    )
  },
)
ShimmerButton.displayName = 'ShimmerButton'
