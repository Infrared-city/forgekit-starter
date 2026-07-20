import { Button, cn } from 'ui'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Optional size passed to the underlying Button */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

/**
 * A generic segmented-control / tab switcher.
 *
 * Extracts the duplicated `bg-muted rounded-lg` + active-state pattern
 * found in `map.tsx` and `AnalysisPanel.tsx`.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex gap-1 p-1 bg-muted rounded-lg', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size={size}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 rounded-md transition-all',
            value === option.value
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
