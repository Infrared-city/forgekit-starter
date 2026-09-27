// Colour ramps for the explorer, and a grid -> image helper.
// Each analysis uses a FIXED range (analyses.ts), so baseline and variant
// compare by eye. The difference map uses a diverging ramp centred on zero.
import type { DemoAnalysis } from '../demo/analyses'

type RGB = [number, number, number]

const RAMPS: Record<DemoAnalysis['ramp'] | 'diverging', RGB[]> = {
  // Cool blue -> yellow -> hot red (thermal comfort).
  heat: [
    [49, 54, 149],
    [69, 117, 180],
    [116, 173, 209],
    [171, 217, 233],
    [254, 224, 144],
    [253, 174, 97],
    [244, 109, 67],
    [215, 48, 39],
    [165, 0, 38],
  ],
  // Dark purple -> orange -> pale yellow (sun, radiation).
  sun: [
    [30, 20, 60],
    [90, 30, 110],
    [170, 50, 100],
    [230, 100, 60],
    [250, 170, 50],
    [252, 240, 150],
  ],
  // Dark navy -> light sky (sky view, daylight).
  sky: [
    [20, 30, 70],
    [40, 80, 140],
    [80, 140, 190],
    [150, 200, 225],
    [225, 243, 250],
  ],
  // Calm green -> yellow -> windy purple (wind speed, comfort classes).
  wind: [
    [26, 150, 65],
    [166, 217, 106],
    [255, 255, 191],
    [253, 174, 97],
    [215, 25, 28],
    [120, 20, 120],
  ],
  // Blue (lower) -> white (no change) -> red (higher).
  diverging: [
    [33, 102, 172],
    [103, 169, 207],
    [209, 229, 240],
    [247, 247, 247],
    [253, 219, 199],
    [239, 138, 98],
    [178, 24, 43],
  ],
}

export type RampName = keyof typeof RAMPS

/** Colour at t in [0, 1] on the named ramp. */
export function rampColor(name: RampName, t: number): RGB {
  const stops = RAMPS[name]
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

export function cssGradient(name: RampName): string {
  const n = 12
  const parts = Array.from({ length: n + 1 }, (_, i) => {
    const [r, g, b] = rampColor(name, i / n).map(Math.round)
    return `rgb(${r},${g},${b}) ${((i / n) * 100).toFixed(1)}%`
  })
  return `linear-gradient(to right, ${parts.join(',')})`
}

/** How to colour one displayed grid: a ramp over [min, max]. */
export interface ColorScale {
  ramp: RampName
  min: number
  max: number
}

export function colorOf(scale: ColorScale, v: number): RGB {
  return rampColor(scale.ramp, (v - scale.min) / (scale.max - scale.min))
}

/**
 * Draw a grid to a canvas. Row 0 of the SDK grid is the SOUTH edge, so it is
 * drawn at the bottom (north up). NaN cells stay transparent.
 */
export function gridToCanvas(
  grid: Float32Array,
  rows: number,
  cols: number,
  scale: ColorScale,
  alpha = 230,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  const img = ctx.createImageData(cols, rows)
  for (let r = 0; r < rows; r++) {
    const y = rows - 1 - r
    for (let c = 0; c < cols; c++) {
      const v = grid[r * cols + c]
      if (Number.isNaN(v)) continue
      const [red, green, blue] = colorOf(scale, v)
      const o = (y * cols + c) * 4
      img.data[o] = red
      img.data[o + 1] = green
      img.data[o + 2] = blue
      // Difference maps: "no change" is almost clear, so the plan shows through.
      const strength =
        scale.ramp === 'diverging' ? Math.min(1, 0.12 + (2 * Math.abs(v)) / scale.max) : 1
      img.data[o + 3] = alpha * strength
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}
