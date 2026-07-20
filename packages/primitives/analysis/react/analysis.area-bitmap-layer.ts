import { BitmapLayer } from '@deck.gl/layers'
import { COORDINATE_SYSTEM } from 'deck.gl'
import type { ColorScaleFn, PrebuiltAreaBitmap } from '../core/analysis.types'
import { imageDataToCanvas, matrixToImageData, rgbaToImageData } from './analysis.grid-layer'
import type { AreaRunResult } from './analysis.store'

export interface AreaBitmapLayerOptions {
  /** The merged area-run result read from the store. */
  result: AreaRunResult
  /**
   * Color scale built by the caller via `createColorScaleForAnalysis(type,
   * { minLegend, maxLegend })`. Min/max MUST be baked into the scale at
   * construction time — `ColorScaleFn` is `(value: number | null) => [r,g,b,a]`,
   * i.e. it takes ONE argument, not three.
   *
   * Optional when `prebuilt` is provided; required otherwise.
   */
  colorScale?: ColorScaleFn
  /** Pixels already colorized off the main thread (`flatGridToRgba` in the
   *  platform's decode worker). Skips the per-cell matrix walk entirely —
   *  the caller (`useAreaBitmapLayer`) is responsible for only passing a
   *  bitmap whose variant/dimensions match the result being rendered. */
  prebuilt?: PrebuiltAreaBitmap
  /** Overall layer opacity (0..1). Defaults to `1` (fully opaque). */
  opacity?: number
  /** Vertical lift (m) applied to the four bound corners. Lifts the raster
   *  to the photogrammetry terrain elevation when Google 3D Tiles are on.
   *  Composition root computes from `groundElevationM +
   *  manualElevationOffsetM`; defaults to 0 (flat at WGS84 z=0). */
  zOffsetM?: number
}

/**
 * Build a `BitmapLayer` that renders the merged area-analysis grid over the
 * map, bounded by `result.gridBounds`.
 *
 * This is a thin wrapper around the grid-layer helpers:
 *
 * - `matrixToImageData` handles the south→north row flip (`srcY = height - 1 - y`)
 *   AND null→transparent pixels (the provided color scale returns alpha 0
 *   for `null` cells).
 * - `imageDataToCanvas` wraps the ImageData in an HTMLCanvasElement so the
 *   BitmapLayer can consume it.
 *
 * The factory deliberately does NOT reimplement any pixel math — that would
 * drift from the single-tile grid layer and silently misrender the area
 * result. It only knows how to bolt the image to the right geographic
 * bounds.
 */
export function createAreaBitmapLayer(opts: AreaBitmapLayerOptions): BitmapLayer {
  const { result, colorScale, prebuilt, opacity = 1, zOffsetM = 0 } = opts

  if (!prebuilt && !colorScale) {
    throw new Error('createAreaBitmapLayer: pass either `prebuilt` pixels or a `colorScale`')
  }
  const imageData = prebuilt
    ? rgbaToImageData(prebuilt.pixels, prebuilt.width, prebuilt.height)
    : // biome-ignore lint/style/noNonNullAssertion: guarded above
      matrixToImageData(result.mergedGrid, colorScale!)
  const canvas = imageDataToCanvas(imageData)

  const { west, south, east, north } = result.gridBounds
  // Keep the SAME flat bounds form `[w, s, e, n]` that worked at z=0 — the
  // 4-corner [lng, lat, z] form rotates/mirrors the texture relative to
  // the canvas Y orientation. To lift the layer in 3D Tiles mode, apply a
  // `modelMatrix` Z translation instead. This preserves the exact texture
  // mapping deck.gl uses for the flat form and just translates the whole
  // rendered quad upward in METER_OFFSETS space — effectively a "normal
  // uplift" without touching the bounds.
  const bounds: [number, number, number, number] = [west, south, east, north]
  // Column-major 4×4 identity with `m[14] = zOffsetM` (translation Z).
  // deck.gl applies this AFTER coordinate-system transform, in meters.
  const modelMatrix: number[] | undefined =
    zOffsetM !== 0 ? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, zOffsetM, 1] : undefined

  return new BitmapLayer({
    id: 'analysis-area-bitmap',
    image: canvas,
    bounds,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    // deck.gl types `modelMatrix` as `(number[] & Matrix4Like) | null`; a plain
    // column-major 16-number array (or undefined) is valid at runtime. `modelMatrix`
    // is a real prop, so this only suppresses the intersection-type friction —
    // not a misspelled prop that deck.gl would silently ignore.
    // @ts-expect-error — number[] is a valid modelMatrix despite the Matrix4Like intersection
    modelMatrix,
    // Picking enabled so consumers can wire a hover tooltip (review item #24).
    // The composition root supplies a `getTooltip` on the deck overlay that
    // samples `result.mergedGrid` at the cursor's lng/lat — see
    // `sampleAreaResultAt` in this module.
    pickable: true,
    opacity,
    // Flat raster. Under interleaved MapboxOverlay mode it shares the depth
    // buffer with Mapbox basemap tiles AND with other flat deck layers at
    // the same z (ground-materials polygons, boundary fill). Painter's
    // order avoids the pixel-level z-fight that otherwise manifests as
    // horizontal striping on pitched cameras.
    parameters: { depthTest: false, depthMask: false },
  })
}

/**
 * Sample the merged grid value at a geographic point. Returns `null` when
 * the point falls outside the raster bounds or lands on a NaN cell (the
 * server's "outside polygon / tile gap" marker).
 *
 * Used by composition roots to wire a hover tooltip on the analysis bitmap
 * layer — deck.gl's pick info gives the cursor's lng/lat but no per-pixel
 * data callback for BitmapLayer, so we sample the source grid directly.
 *
 * Coordinate mapping:
 *   - `gridBounds` is `[west, south, east, north]` in lng/lat.
 *   - `mergedGrid[0]` is the SOUTHERNMOST row (matches the SDK's
 *     south→north convention; `matrixToImageData` flips this for the
 *     texture, but the source matrix is south-up).
 *   - We compute fractional row/col with bilinear-ish *nearest* lookup;
 *     a fancier bilinear would smooth the readout but isn't worth the
 *     branch for a tooltip.
 */
export function sampleAreaResultAt(result: AreaRunResult, lng: number, lat: number): number | null {
  const { west, south, east, north } = result.gridBounds
  if (lng < west || lng > east || lat < south || lat > north) return null

  const height = result.mergedGrid.length
  const width = result.mergedGrid[0]?.length ?? 0
  if (height === 0 || width === 0) return null

  // Fractional coordinates in grid space. `(lat - south) / (north - south)`
  // gives 0 at the south edge → row 0 (matrix is south-up). Clamp so the
  // east/north edge inclusive pick lands inside the last cell.
  const fx = ((lng - west) / (east - west)) * width
  const fy = ((lat - south) / (north - south)) * height
  const col = Math.min(width - 1, Math.max(0, Math.floor(fx)))
  const row = Math.min(height - 1, Math.max(0, Math.floor(fy)))

  const value = result.mergedGrid[row]?.[col]
  return value == null ? null : value
}
