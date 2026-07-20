/**
 * Render-only colour treatment for the ground-material area surface.
 *
 * The registry `diffuseColor` is tuned for the physical sim — on the basemap it
 * reads harsh (near-black asphalt, vivid grass). This softens ONLY the rendered
 * fill; the registry (which the sim consumes) is never touched.
 *
 * Both modes desaturate toward the colour's own luminance (calmer, less
 * saturated), then shift brightness:
 *  - `light`: lift toward white → bright, happy, pastel.
 *  - `dark`:  lift toward a calm mid-tone (NOT white — white glares on a dark
 *    basemap) → muted but still legible.
 */

export type GroundMaterialColorMode = 'light' | 'dark'

interface PastelPreset {
  /** Fraction pulled toward the colour's luminance (0 = none, 1 = fully grey). */
  desaturate: number
  /** Brightness target each channel is mixed toward (0-255). */
  toneTarget: number
  /** Fraction mixed toward `toneTarget`. */
  toneAmount: number
}

const PRESETS: Record<GroundMaterialColorMode, PastelPreset> = {
  // Bright, unsaturated, calm — lifted well toward white.
  light: { desaturate: 0.45, toneTarget: 255, toneAmount: 0.42 },
  // Same softening, but lifted only toward a mid light-grey so colours stay
  // visible on the dark basemap without glaring.
  dark: { desaturate: 0.45, toneTarget: 165, toneAmount: 0.4 },
}

/** Rec. 709 relative luminance of a 0-255 RGB colour. */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function clamp255(v: number): number {
  if (v < 0) return 0
  if (v > 255) return 255
  return v
}

/**
 * Soften a 0-255 RGB colour for on-map display. Pure; rounds once at the end.
 */
export function pastelizeGroundColor(
  rgb: readonly [number, number, number],
  mode: GroundMaterialColorMode,
): [number, number, number] {
  const { desaturate, toneTarget, toneAmount } = PRESETS[mode]
  const [r, g, b] = rgb
  const l = luminance(r, g, b)
  const soften = (c: number): number => {
    const desaturated = c + (l - c) * desaturate
    const toned = desaturated + (toneTarget - desaturated) * toneAmount
    return Math.round(clamp255(toned))
  }
  return [soften(r), soften(g), soften(b)]
}
