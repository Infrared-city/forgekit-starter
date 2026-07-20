import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import * as React from 'react'
import { cn } from '../../lib/utils'

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('inline-flex h-7 items-center rounded-lg bg-surface-inset p-0.5', className)}
    {...props}
  />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      'inline-flex h-6 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors',
      'text-on-surface-muted hover:text-on-surface hover:bg-surface/60',
      'data-[state=on]:bg-surface data-[state=on]:text-brand-teal data-[state=on]:font-semibold data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-brand-teal/30',
      'disabled:pointer-events-none disabled:opacity-40',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40',
      className,
    )}
    {...props}
  />
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
