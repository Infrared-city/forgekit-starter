import { ChevronDown } from 'lucide-react'
import { forwardRef, useId, useState } from 'react'
import { cn } from '../../lib/utils'

interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: React.ReactNode
}

export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, className, children, ...props }, ref) => {
    const id = useId()
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            'peer w-full px-3 pt-5 pb-2 pr-8 border border-input rounded-md bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'appearance-none cursor-pointer transition-all duration-200',
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className={cn(
            'absolute left-3 top-1.5 text-xs font-medium transition-colors duration-200 pointer-events-none',
            isFocused ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {label}
        </label>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    )
  },
)
FloatingSelect.displayName = 'FloatingSelect'
