import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { type ButtonProps, buttonVariants } from './button'

interface LoadingButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Pick<ButtonProps, 'variant' | 'size'> {
  loading?: boolean
  loadingText?: string
}

export function LoadingButton({
  loading,
  loadingText,
  children,
  disabled,
  className,
  variant,
  size,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), loading && 'gap-2', className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
