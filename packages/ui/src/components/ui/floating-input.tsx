import { forwardRef, useId, useState } from 'react'
import { cn } from '../../lib/utils'

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, value, defaultValue, onChange, ...props }, ref) => {
    const id = useId()
    const [isFocused, setIsFocused] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')

    const currentValue = value !== undefined ? value : internalValue
    const hasValue = currentValue !== '' && currentValue !== undefined
    const isFloating = isFocused || hasValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value)
      }
      onChange?.(e)
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={cn(
            'peer w-full px-3 pt-5 pb-2 border border-input rounded-md bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-all duration-200',
            'placeholder:text-transparent',
            className,
          )}
          placeholder={label}
          value={currentValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'absolute left-3 transition-all duration-200 pointer-events-none',
            'text-muted-foreground truncate max-w-[calc(100%-24px)]',
            isFloating
              ? 'top-1.5 text-xs font-medium text-primary'
              : 'top-1/2 -translate-y-1/2 text-sm',
          )}
        >
          {label}
        </label>
      </div>
    )
  },
)
FloatingInput.displayName = 'FloatingInput'
