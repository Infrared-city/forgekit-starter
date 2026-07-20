/**
 * Design Tokens
 *
 * A comprehensive design token library extracted from the webapp.
 * Use these tokens to maintain consistency across applications.
 *
 * @example
 * ```typescript
 * import { colorPalette, radius, animation } from '@infrared/design-tokens';
 *
 * // Use color tokens
 * const primaryColor = colorPalette.primary.hex; // "#2B7C85"
 * const primaryHSL = colorPalette.primary.hsl;   // "186 51% 35%"
 *
 * // Use spacing tokens
 * const borderRadius = radius.lg; // "0.5rem"
 *
 * // Use animation tokens
 * const accordionAnim = animation.accordionDown; // "accordion-down 0.2s ease-out"
 * ```
 */

// Animation tokens
export {
  animation,
  duration,
  easing,
  generateKeyframesCSS,
  keyframes,
  loadingDotDelays,
  tailwindAnimationConfig,
} from './animations'
// Color tokens
export {
  accent,
  accentForeground,
  alert,
  background,
  border,
  // Types
  type ColorToken,
  card,
  cardForeground,
  chart1,
  chart2,
  chart3,
  chart4,
  chart5,
  // Full palette
  colorPalette,
  darkMode,
  destructive,
  destructiveForeground,
  disabled,
  foreground,
  // Utilities
  generateCSSVariables,
  input,
  muted,
  mutedForeground,
  popover,
  popoverForeground,
  // Individual colors
  primary,
  primaryForeground,
  primaryGreenDark,
  primaryPurple,
  ring,
  secondary,
  secondaryBlue,
  secondaryBlueBg,
  secondaryBlueDark,
  secondaryBlueLight,
  secondaryForeground,
  secondaryGreen,
  tertiaryFuchsia,
} from './colors'
// Shadow tokens
export {
  componentShadow,
  focusRing,
  getShadowCSS,
  shadow,
  shadowClasses,
} from './shadows'
// Spacing tokens
export {
  breakpoints,
  componentHeight,
  componentHeightClasses,
  container,
  gap,
  iconSize,
  iconSizeClasses,
  padding,
  panel,
  radius,
  radiusPixels,
  spacing,
  zIndex,
} from './spacing'
// Typography tokens
export {
  fontFamily,
  fontSize,
  fontWeight,
  getFontFamilyCSS,
  letterSpacing,
  lineHeight,
  typographyPresets,
} from './typography'
