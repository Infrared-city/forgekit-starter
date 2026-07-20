import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'
import { cn } from '../../lib/utils'

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showLabels?: boolean
  formatLabel?: (value: number) => string
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, showLabels, formatLabel, value, ...props }, ref) => {
    const defaultFormat = (v: number) => `${v}`
    const format = formatLabel || defaultFormat

    return (
      <div className="relative">
        {showLabels && value && (
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{format(value[0])}</span>
            <span>{format(value[1])}</span>
          </div>
        )}
        <SliderPrimitive.Root
          ref={ref}
          className={cn('relative flex w-full touch-none select-none items-center', className)}
          {...props}
          value={value}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
      </div>
    )
  },
)
Slider.displayName = 'Slider'

export { Slider }
