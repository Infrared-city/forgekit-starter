import type { BitmapLayer } from '@deck.gl/layers'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { colorScaleVariantFor, createColorScaleForAnalysis } from '../core/analysis.color-scales'
import type { AnalysesName } from '../core/analysis.sdk-types'
import { createAreaBitmapLayer } from './analysis.area-bitmap-layer'
import { useAnalysisStore } from './analysis.store'

/**
 * React hook that subscribes to `areaResult` / `areaStatus` from the
 * analysis store and returns a memoised `BitmapLayer` — or `null` when the
 * area run has not produced a result yet (idle / running / error).
 *
 * Key behaviors:
 *
 * - Returns `null` unless `areaStatus === 'success'` AND `areaResult` is
 *   non-null. This matches the store contract: `setAreaResult` transitions
 *   status to `'success'` as a single atomic update.
 * - Derives height/width from `mergedGrid.length` / `mergedGrid[0]?.length`,
 *   not from `gridShape`. A defensive shape mismatch warns and returns
 *   `null` instead of throwing — we would rather render nothing than
 *   silently misalign a heatmap.
 * - Computes min/max over non-null cells in a single pass, then builds a
 *   color scale via `createColorScaleForAnalysis(type, { minLegend, maxLegend })`.
 *   All-null matrices substitute sentinel `0..1` values so the scale
 *   factory never receives `Infinity`.
 * - Keyed on `areaResult + areaStatus` so deck.gl does not rebuild the
 *   layer on unrelated renders. The matrix → ImageData conversion is the
 *   most expensive step; cached via `useMemo` it runs once per result.
 *
 * The hook is invoked at the plugin level inside `useAnalysisMapPlugin`,
 * NOT inside the sidebar panel — the layer must appear in the plugin's
 * `layers` callback, which fires on every map render regardless of which
 * tab the panel is on.
 */
export function useAreaBitmapLayer(zOffsetM: number = 0, opacity: number = 1): BitmapLayer | null {
  const { areaResult, areaStatus, pwcCriteria, tcsSubtype } = useAnalysisStore(
    useShallow((s) => ({
      areaResult: s.areaResult,
      areaStatus: s.areaStatus,
      pwcCriteria: s.pwcCriteria,
      tcsSubtype: s.tcsSubtype,
    })),
  )

  return useMemo(() => {
    if (areaStatus !== 'success' || areaResult == null) return null

    // Derive dimensions from the actual matrix, not from gridShape. The
    // server might in theory send a mismatched `grid_shape` field; we'd
    // rather warn and skip than silently misrender.
    const height = areaResult.mergedGrid.length
    const width = areaResult.mergedGrid[0]?.length ?? 0
    if (height === 0 || width === 0) return null

    if (areaResult.gridShape[0] !== height || areaResult.gridShape[1] !== width) {
      console.warn(
        '[useAreaBitmapLayer] gridShape mismatch vs mergedGrid dimensions — skipping layer',
      )
      return null
    }

    // Variant for analysis types that need it (PWC criteria, TCS subtype) —
    // needed by BOTH paths below, and the staleness key for the fast path.
    const variant = colorScaleVariantFor(areaResult.analysisType, { pwcCriteria, tcsSubtype })

    // Fast path: pixels were already colorized off the main thread (platform
    // decode worker). Only trusted when the baked variant matches the LIVE
    // variant and the dimensions match this grid — a stale bitmap (user
    // switched PWC criteria after decode) silently rendering the wrong ramp
    // would be worse than paying the main-thread rebuild below.
    const prebuilt = areaResult.prebuiltBitmap
    if (
      prebuilt &&
      prebuilt.width === width &&
      prebuilt.height === height &&
      (prebuilt.variant ?? undefined) === (variant ?? undefined)
    ) {
      return createAreaBitmapLayer({ result: areaResult, prebuilt, zOffsetM, opacity })
    }

    // Determine color-scale domain. Prefer the API-returned absolute legend
    // range (covers the full model inference range across all tiles, including
    // crop margins that were discarded during merge). Fall back to a single-pass
    // grid scan when the API didn't return legend values.
    let min: number
    let max: number

    if (areaResult.minLegend != null && areaResult.maxLegend != null) {
      // Use API-returned absolute legend range across all tiles
      min = areaResult.minLegend
      max = areaResult.maxLegend

      // Still need to verify rows aren't jagged — matrixToImageData would
      // read past row end and crash deck.gl.
      for (let r = 0; r < height; r++) {
        if (areaResult.mergedGrid[r].length !== width) {
          console.warn('[useAreaBitmapLayer] jagged mergedGrid row — skipping layer')
          return null
        }
      }
    } else {
      // Fallback: scan merged grid (pre-existing behavior)
      min = Number.POSITIVE_INFINITY
      max = Number.NEGATIVE_INFINITY
      for (let r = 0; r < height; r++) {
        const row = areaResult.mergedGrid[r]
        if (row.length !== width) {
          console.warn('[useAreaBitmapLayer] jagged mergedGrid row — skipping layer')
          return null
        }
        for (let c = 0; c < width; c++) {
          const v = row[c]
          if (v == null) continue
          if (v < min) min = v
          if (v > max) max = v
        }
      }
    }

    // All-null matrix edge case: substitute a finite sentinel domain so
    // `createColorScaleForAnalysis` never receives Infinity. The resulting
    // layer is fully transparent because every pixel is null anyway.
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0
      max = 1
    }

    const colorScale = createColorScaleForAnalysis(areaResult.analysisType as AnalysesName, {
      minLegend: min,
      maxLegend: max,
      variant,
    })

    return createAreaBitmapLayer({ result: areaResult, colorScale, zOffsetM, opacity })
  }, [areaResult, areaStatus, pwcCriteria, tcsSubtype, zOffsetM, opacity])
}
