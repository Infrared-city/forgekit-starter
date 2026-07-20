/**
 * Design Tokens: Spacing & Sizing
 *
 * Based on Tailwind CSS default spacing scale with custom extensions.
 */

// ============================================
// Border Radius
// ============================================

export const radius = {
  /** 8px - Large rounded corners */
  lg: '0.5rem',
  /** 6px - Medium rounded corners */
  md: 'calc(0.5rem - 2px)',
  /** 4px - Small rounded corners */
  sm: 'calc(0.5rem - 4px)',
  /** Full circle */
  full: '9999px',
  /** No rounding */
  none: '0',
} as const

export const radiusPixels = {
  lg: 8,
  md: 6,
  sm: 4,
} as const

// ============================================
// Icon Sizes
// ============================================

export const iconSize = {
  /** 8px - Extra small indicators */
  xs: '0.5rem',
  /** 16px - Default icon size */
  sm: '1rem',
  /** 20px - Medium icons */
  md: '1.25rem',
  /** 24px - Large icons */
  lg: '1.5rem',
  /** 40px - Extra large/button icons */
  xl: '2.5rem',
} as const

export const iconSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-10 h-10',
} as const

// ============================================
// Component Heights
// ============================================

export const componentHeight = {
  /** 36px - Small buttons/inputs */
  sm: '2.25rem',
  /** 40px - Default buttons/inputs */
  default: '2.5rem',
  /** 44px - Large buttons/inputs */
  lg: '2.75rem',
} as const

export const componentHeightClasses = {
  sm: 'h-9',
  default: 'h-10',
  lg: 'h-11',
} as const

// ============================================
// Container
// ============================================

export const container = {
  /** Maximum container width */
  maxWidth: '1400px',
  /** Default padding */
  padding: '2rem',
  /** Centered */
  center: true,
} as const

// ============================================
// Spacing Scale (Tailwind-based)
// ============================================

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

// ============================================
// Common Padding Patterns
// ============================================

export const padding = {
  /** Card padding: 24px */
  card: '1.5rem',
  /** Card content (no top padding) */
  cardContent: '1.5rem 1.5rem 1.5rem 1.5rem',
  /** Input padding: 12px horizontal, 8px vertical */
  input: '0.5rem 0.75rem',
  /** Button default: 16px horizontal, 8px vertical */
  button: '0.5rem 1rem',
  /** Button small: 12px horizontal */
  buttonSm: '0.5rem 0.75rem',
  /** Button large: 32px horizontal */
  buttonLg: '0.5rem 2rem',
  /** Menu item: 8px horizontal, 6px vertical */
  menuItem: '0.375rem 0.5rem',
  /** Alert: 16px all */
  alert: '1rem',
  /** Dialog: 24px all */
  dialog: '1.5rem',
} as const

// ============================================
// Gap/Space Patterns
// ============================================

export const gap = {
  /** Form item spacing: 8px */
  formItem: '0.5rem',
  /** Card header spacing: 6px */
  cardHeader: '0.375rem',
  /** Dialog section spacing: 16px */
  dialogSection: '1rem',
  /** Stack spacing: 16px */
  stack: '1rem',
} as const

// ============================================
// Z-Index Scale
// ============================================

export const zIndex = {
  /** Default layer */
  base: 0,
  /** Floating elements */
  dropdown: 50,
  /** Sticky elements */
  sticky: 40,
  /** Fixed elements */
  fixed: 30,
  /** Modal backdrop */
  modalBackdrop: 40,
  /** Modal content */
  modal: 50,
  /** Popover */
  popover: 50,
  /** Toast notifications */
  toast: 100,
  /** Tooltip */
  tooltip: 50,
} as const

// ============================================
// Breakpoints
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================
// Panel/Sidebar Dimensions
// ============================================

export const panel = {
  /** Dropdown minimum width: 128px */
  dropdownMinWidth: '8rem',
  /** Dialog max width: 512px */
  dialogMaxWidth: '32rem',
  /** Sheet width */
  sheetWidth: '24rem',
  /** Sidebar width */
  sidebarWidth: '16rem',
} as const
