/**
 * Grid-image utilities shared between renderers.
 *
 * Area-tiled analysis owns the only BitmapLayer (see
 * `analysis.area-bitmap-layer.ts`), which reuses the `matrixToImageData` +
 * `imageDataToCanvas` helpers below.
 *
 * The helpers are kept here (rather than inlined into the area bitmap layer)
 * because the area bitmap layer file already mixes layer construction with
 * LRU cache bookkeeping; keeping the pure matrix-to-canvas conversion in a
 * separate module keeps that file narrowly scoped.
 */

/**
 * Converts a 2D matrix of analysis values to RGBA ImageData.
 * Each cell in the matrix is colored using the provided colorScale function.
 * Null values are rendered as transparent pixels.
 */
export function matrixToImageData(
  matrix: (number | null)[][],
  colorScale: (value: number | null) => [number, number, number, number],
): ImageData {
  const height = matrix.length
  const width = matrix[0]?.length || 0

  if (width === 0 || height === 0) {
    throw new Error('Invalid matrix dimensions')
  }

  const imageData = new ImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Merged grid is indexed from the SW corner (row 0 = south).
      // Canvas/ImageData pixels are indexed from the NW corner (row 0 = top),
      // so we flip rows to align the grid with map bounds.
      const srcY = height - 1 - y
      const value = matrix[srcY][x]
      const [r, g, b, a] = colorScale(value)
      const idx = (y * width + x) * 4

      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = a
    }
  }

  return imageData
}

/**
 * Wraps prebuilt north-up RGBA pixels (e.g. from `flatGridToRgba`, run off
 * the main thread) in an ImageData without copying the buffer.
 */
export function rgbaToImageData(
  pixels: Uint8ClampedArray<ArrayBuffer>,
  width: number,
  height: number,
): ImageData {
  return new ImageData(pixels, width, height)
}

/**
 * Creates a canvas from ImageData for use in BitmapLayer.
 */
export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context')
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}
