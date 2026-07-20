/**
 * Design Tokens: Typography
 *
 * Font family, sizes, weights, and line heights.
 */

// ============================================
// Font Family
// ============================================

export const fontFamily = {
  /** Sans-serif font stack */
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
  /** Monospace font stack */
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
} as const

// ============================================
// Font Sizes (Tailwind scale)
// ============================================

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px (default)
  base: ['1rem', { lineHeight: '1.5rem' }], // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px (card title)
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }], // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
  '8xl': ['6rem', { lineHeight: '1' }], // 96px
  '9xl': ['8rem', { lineHeight: '1' }], // 128px
} as const

// ============================================
// Font Weights
// ============================================

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// ============================================
// Line Heights
// ============================================

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

// ============================================
// Letter Spacing (Tracking)
// ============================================

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// ============================================
// Typography Presets (Component-specific)
// ============================================

export const typographyPresets = {
  /** Card title: 24px, semibold, tight tracking */
  cardTitle: {
    fontSize: '1.5rem', // 2xl
    fontWeight: '600', // semibold
    lineHeight: '1', // none (leading-none)
    letterSpacing: '-0.025em', // tight (tracking-tight)
  },
  /** Card description: 14px, normal, muted color */
  cardDescription: {
    fontSize: '0.875rem', // sm
    fontWeight: '400', // normal
    lineHeight: '1.25rem',
  },
  /** Button text: 14px, medium */
  button: {
    fontSize: '0.875rem', // sm
    fontWeight: '500', // medium
    lineHeight: '1.25rem',
  },
  /** Alert title: medium, tight tracking */
  alertTitle: {
    fontWeight: '500', // medium
    lineHeight: '1', // none
    letterSpacing: '-0.025em', // tight
  },
  /** Label: 14px, medium */
  label: {
    fontSize: '0.875rem', // sm
    fontWeight: '500', // medium
    lineHeight: '1', // none
  },
  /** Input placeholder: 14px, normal, muted */
  placeholder: {
    fontSize: '0.875rem', // sm
    fontWeight: '400', // normal
  },
  /** Form description: 12px, muted */
  formDescription: {
    fontSize: '0.75rem', // xs
    fontWeight: '400', // normal
  },
} as const

// ============================================
// CSS Variable Generation
// ============================================

export function getFontFamilyCSS(family: keyof typeof fontFamily): string {
  return fontFamily[family].join(', ')
}
