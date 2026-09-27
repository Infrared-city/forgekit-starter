// Turn a result grid into a picture. We use a FIXED value range per analysis
// (not the grid's own min/max), so two runs are comparable by eye.

export interface Scale {
  min: number
  max: number
  unit: string
}

/** Simple blue -> green -> yellow -> red ramp, t in [0, 1]. */
export function ramp(t: number): [number, number, number] {
  const stops: Array<[number, number, number]> = [
    [49, 54, 149],
    [69, 117, 180],
    [116, 173, 209],
    [171, 217, 233],
    [254, 224, 144],
    [253, 174, 97],
    [244, 109, 67],
    [215, 48, 39],
  ]
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

/**
 * Draw `grid` (row-major, `rows` x `cols`) to a PNG data URL.
 * NaN cells (buildings, outside the area) stay transparent.
 * The SDK's merged grid starts at the SOUTH edge, so row 0 is drawn at the
 * bottom of the image (north up).
 */
export function gridToDataUrl(
  grid: ArrayLike<number>,
  rows: number,
  cols: number,
  scale: Scale,
): string {
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
      const o = (y * cols + c) * 4
      if (v === null || Number.isNaN(v)) continue
      const [red, green, blue] = ramp((v - scale.min) / (scale.max - scale.min))
      img.data[o] = red
      img.data[o + 1] = green
      img.data[o + 2] = blue
      img.data[o + 3] = 200
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

/** Mean of the cells that have a value. */
export function meanOf(grid: ArrayLike<number>): number {
  let sum = 0
  let n = 0
  for (let i = 0; i < grid.length; i++) {
    const v = grid[i]
    if (!Number.isNaN(v)) {
      sum += v
      n++
    }
  }
  return n === 0 ? Number.NaN : sum / n
}
