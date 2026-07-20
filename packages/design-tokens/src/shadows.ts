/**
 * Design Tokens: Shadows
 *
 * Box shadow definitions based on Tailwind CSS defaults.
 */

// ============================================
// Shadow Scale
// ============================================

export const shadow = {
  /** No shadow */
  none: 'none',
  /** Extra small shadow */
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  /** Small shadow (cards) */
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  /** Default shadow */
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  /** Medium shadow (dropdowns) */
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  /** Large shadow (dialogs) */
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  /** Extra large shadow */
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  /** 2XL shadow */
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  /** Inner shadow */
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// ============================================
// Component-Specific Shadows
// ============================================

export const componentShadow = {
  /** Card shadow */
  card: shadow.sm,
  /** Dropdown menu shadow */
  dropdown: shadow.lg,
  /** Sub-menu shadow */
  submenu: shadow.md,
  /** Dialog/modal shadow */
  dialog: shadow.lg,
  /** Toast shadow */
  toast: shadow.lg,
  /** Popover shadow */
  popover: shadow.md,
  /** Tooltip shadow */
  tooltip: shadow.md,
} as const

// ============================================
// Focus Ring Shadows
// ============================================

export const focusRing = {
  /** Default focus ring (2px, offset 2) */
  default: {
    outline: 'none',
    boxShadow: '0 0 0 2px var(--ring)',
    ringOffset: '2px',
  },
  /** Destructive focus ring */
  destructive: {
    outline: 'none',
    boxShadow: '0 0 0 2px hsl(0 84.2% 60.2%)',
    ringOffset: '2px',
  },
} as const

// ============================================
// Tailwind Classes
// ============================================

export const shadowClasses = {
  none: 'shadow-none',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  DEFAULT: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
} as const

// ============================================
// CSS Generation
// ============================================

/**
 * Get the CSS box-shadow value for a shadow level
 */
export function getShadowCSS(level: keyof typeof shadow): string {
  return shadow[level]
}
