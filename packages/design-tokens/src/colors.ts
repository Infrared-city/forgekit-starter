/**
 * Design Tokens: Color Palette
 *
 * All colors are defined as HSL values for easy theme customization.
 * Each color includes HSL components and pre-computed hex values.
 */

export type ColorToken = {
  hsl: string
  h: number
  s: number
  l: number
  hex: string
  cssVar: string
}

// Helper to create color tokens
const createColor = (name: string, h: number, s: number, l: number, hex: string): ColorToken => ({
  hsl: `${h} ${s}% ${l}%`,
  h,
  s,
  l,
  hex,
  cssVar: `--${name}`,
})

// ============================================
// Primary Colors
// ============================================

export const primary = createColor('primary', 186, 51, 35, '#2B7C85')
export const primaryForeground = createColor('primary-foreground', 2.1, 40, 98, '#FBF9F9')
export const primaryGreenDark = createColor('primary-green-dark', 180, 73, 13, '#093E3E')
export const primaryPurple = createColor('primary-purple', 231, 66, 23, '#1F2761')

// ============================================
// Secondary Colors
// ============================================

export const secondary = createColor('secondary', 210, 40, 96.1, '#F1F5F9')
export const secondaryForeground = createColor('secondary-foreground', 222.2, 47.4, 11.2, '#0F172A')
export const secondaryBlue = createColor('secondary-blue', 198, 87, 91, '#D7F1F7')
export const secondaryBlueLight = createColor('secondary-blue-light', 180, 26, 84, '#C8DEDE')
export const secondaryBlueDark = createColor('secondary-blue-dark', 198, 67, 27, '#176587')
export const secondaryBlueBg = { hex: '#EFF6F6', cssVar: '--secondary-blue-bg' }
export const secondaryGreen = createColor('secondary-green', 154, 35, 50, '#53A87D')

// ============================================
// Tertiary Colors
// ============================================

export const tertiaryFuchsia = createColor('tertiary-fuchsia', 180, 79, 52, '#23E5E5')

// ============================================
// Semantic Colors
// ============================================

export const alert = createColor('alert', 14, 67, 76, '#E5A88A')
export const destructive = createColor('destructive', 0, 84.2, 60.2, '#EF4444')
export const destructiveForeground = createColor('destructive-foreground', 210, 40, 98, '#F8FAFC')
export const disabled = createColor('disabled', 240, 3, 69, '#ADADB0')

// ============================================
// Neutral Colors
// ============================================

export const background = createColor('background', 2.5, 2.5, 92.5, '#ECECEC')
export const foreground = createColor('foreground', 222.2, 84, 4.9, '#0A0F1A')
export const card = createColor('card', 0, 0, 100, '#FFFFFF')
export const cardForeground = createColor('card-foreground', 222.2, 84, 4.9, '#0A0F1A')
export const popover = createColor('popover', 0, 0, 100, '#FFFFFF')
export const popoverForeground = createColor('popover-foreground', 222.2, 84, 4.9, '#0A0F1A')
export const muted = createColor('muted', 210, 40, 96.1, '#F1F5F9')
export const mutedForeground = createColor('muted-foreground', 215.4, 16.3, 46.9, '#64748B')
export const accent = createColor('accent', 210, 40, 96.1, '#F1F5F9')
export const accentForeground = createColor('accent-foreground', 222.2, 47.4, 11.2, '#0F172A')
export const border = createColor('border', 214.3, 31.8, 91.4, '#E2E8F0')
export const input = createColor('input', 214.3, 31.8, 91.4, '#E2E8F0')
export const ring = createColor('ring', 222.2, 84, 4.9, '#0A0F1A')

// ============================================
// Chart Colors
// ============================================

export const chart1 = createColor('chart-1', 12, 76, 61, '#E07B5D')
export const chart2 = createColor('chart-2', 173, 58, 39, '#2A9D8F')
export const chart3 = createColor('chart-3', 197, 37, 24, '#264653')
export const chart4 = createColor('chart-4', 43, 74, 66, '#E9C46A')
export const chart5 = createColor('chart-5', 27, 87, 67, '#F4A261')

// ============================================
// Dark Mode Colors
// ============================================

export const darkMode = {
  background: createColor('background', 222.2, 84, 4.9, '#0A0F1A'),
  foreground: createColor('foreground', 210, 40, 98, '#F8FAFC'),
  card: createColor('card', 222.2, 84, 4.9, '#0A0F1A'),
  cardForeground: createColor('card-foreground', 210, 40, 98, '#F8FAFC'),
  popover: createColor('popover', 222.2, 84, 4.9, '#0A0F1A'),
  popoverForeground: createColor('popover-foreground', 210, 40, 98, '#F8FAFC'),
  primary: createColor('primary', 210, 40, 98, '#F8FAFC'),
  primaryForeground: createColor('primary-foreground', 222.2, 47.4, 11.2, '#0F172A'),
  secondary: createColor('secondary', 217.2, 32.6, 17.5, '#1E293B'),
  secondaryForeground: createColor('secondary-foreground', 210, 40, 98, '#F8FAFC'),
  muted: createColor('muted', 217.2, 32.6, 17.5, '#1E293B'),
  mutedForeground: createColor('muted-foreground', 215, 20.2, 65.1, '#94A3B8'),
  accent: createColor('accent', 217.2, 32.6, 17.5, '#1E293B'),
  accentForeground: createColor('accent-foreground', 210, 40, 98, '#F8FAFC'),
  destructive: createColor('destructive', 0, 62.8, 30.6, '#7F1D1D'),
  destructiveForeground: createColor('destructive-foreground', 210, 40, 98, '#F8FAFC'),
  border: createColor('border', 217.2, 32.6, 17.5, '#1E293B'),
  input: createColor('input', 217.2, 32.6, 17.5, '#1E293B'),
  ring: createColor('ring', 212.7, 26.8, 83.9, '#CBD5E1'),
  chart1: createColor('chart-1', 220, 70, 50, '#2563EB'),
  chart2: createColor('chart-2', 160, 60, 45, '#10B981'),
  chart3: createColor('chart-3', 30, 80, 55, '#F59E0B'),
  chart4: createColor('chart-4', 280, 65, 60, '#A855F7'),
  chart5: createColor('chart-5', 340, 75, 55, '#EC4899'),
}

// ============================================
// Color Palette Export
// ============================================

export const colorPalette = {
  // Primary
  primary,
  primaryForeground,
  primaryGreenDark,
  primaryPurple,

  // Secondary
  secondary,
  secondaryForeground,
  secondaryBlue,
  secondaryBlueLight,
  secondaryBlueDark,
  secondaryBlueBg,
  secondaryGreen,

  // Tertiary
  tertiaryFuchsia,

  // Semantic
  alert,
  destructive,
  destructiveForeground,
  disabled,

  // Neutral
  background,
  foreground,
  card,
  cardForeground,
  popover,
  popoverForeground,
  muted,
  mutedForeground,
  accent,
  accentForeground,
  border,
  input,
  ring,

  // Chart
  chart1,
  chart2,
  chart3,
  chart4,
  chart5,

  // Dark mode
  darkMode,
}

// ============================================
// CSS Variables Generator
// ============================================

export function generateCSSVariables(isDark = false): string {
  const colors = isDark ? darkMode : colorPalette
  const vars: string[] = []

  for (const [key, value] of Object.entries(colors)) {
    if (key === 'darkMode') continue
    if (typeof value === 'object' && 'hsl' in value) {
      vars.push(`  ${value.cssVar}: ${value.hsl};`)
    }
  }

  return `:root {\n${vars.join('\n')}\n}`
}
