/**
 * Flat-grid colorize primitives — the typed-array twin of
 * `react/analysis.grid-layer.ts`'s `matrixToImageData`.
 *
 * The platform decodes result grids in a Web Worker (npy → flat Float32Array,
 * NaN = null/outside-polygon). Colorizing THERE, straight off the flat array,
 * avoids ever walking the 15M-cell nested `(number | null)[][]` on the main
 * thread just to build the heatmap bitmap. These helpers are pure and
 * DOM-free so they run in workers, jsdom, and Node alike; a test pins
 * `flatGridToRgba` byte-for-byte against `matrixToImageData`.
 */

/** NaN-aware min/max over a flat grid. All-NaN / empty grids return the
 *  0..1 sentinel (mirrors `useAreaBitmapLayer`) so color-scale factories
 *  never receive Infinity. */
export function scanFlatGridDomain(data: Float32Array): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < data.length; i++) {
    const v = data[i]
    if (Number.isNaN(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 }
  return { min, max }
}

/**
 * Colorize a flat south-up grid into north-up RGBA pixels.
 *
 * Identical semantics to `matrixToImageData`: row 0 of the source is the
 * SOUTHERNMOST row, pixel row 0 is the top, so rows flip (`srcY = rows-1-y`);
 * NaN cells pass `null` to the scale (which renders them transparent).
 */
export function flatGridToRgba(
  data: Float32Array,
  rows: number,
  cols: number,
  colorScale: (value: number | null) => [number, number, number, number],
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(rows * cols * 4)
  for (let y = 0; y < rows; y++) {
    const srcY = rows - 1 - y
    for (let x = 0; x < cols; x++) {
      const v = data[srcY * cols + x]
      const [r, g, b, a] = colorScale(Number.isNaN(v) ? null : v)
      const idx = (y * cols + x) * 4
      out[idx] = r
      out[idx + 1] = g
      out[idx + 2] = b
      out[idx + 3] = a
    }
  }
  return out
}
