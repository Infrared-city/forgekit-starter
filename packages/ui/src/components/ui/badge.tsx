import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

// Status pill primitives. Each variant uses Tailwind built-in palettes so the
// component stays self-contained — no dependency on host-app design tokens.
const badgeVariants = cva(
  'inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap',
  {
    variants: {
      variant: {
        // Generic shadcn variants (kept for back-compat with existing call sites)
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',

        // Status semantics
        live: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        beta: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        'coming-soon':
          'border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300',
        planned:
          'border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        docs: 'border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',

        // Difficulty (recipes)
        beginner:
          'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        intermediate:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        advanced: 'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',

        // Run state (for result cards)
        running:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        done: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',

        // Neutral chip — counts, durations, tech tags
        neutral:
          'border-transparent bg-slate-100/70 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',

        // Curated case study — a real, public, read-only project (not a demo)
        curated:
          'border-transparent bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
      },
      size: {
        default: 'rounded-md px-2.5 py-0.5 text-xs',
        sm: 'rounded-full px-2 py-0.5 text-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
