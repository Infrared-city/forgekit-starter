// Turns the SDK's merged facade result (`SurfaceColumns`: one typed array per
// field, all surfaces back to back) into one plain object per surface id.
// The demo explorer stores and draws this per-surface shape.
// Row `r`: vectors at [3r, 3r + 3), cells at [cellOffsets[r], cellOffsets[r + 1]).
// A cell without a value is NaN in the columns and null here.
import { type SurfaceColumns, surfaceId } from '@infrared-city/infrared-sdk-ts'

export interface PlainSurface {
  origin: number[]
  uAxis: number[]
  vAxis: number[]
  gridSize: number
  nu: number
  nv: number
  values: Array<number | null>
}

export function surfacesFromColumns(r: SurfaceColumns): Record<string, PlainSurface> {
  const out: Record<string, PlainSurface> = {}
  for (let row = 0; row < r.surfaceCount; row++) {
    const cells = r.values.subarray(r.cellOffsets[row], r.cellOffsets[row + 1])
    out[surfaceId(r, row)] = {
      origin: Array.from(r.origin.subarray(3 * row, 3 * row + 3)),
      uAxis: Array.from(r.uAxis.subarray(3 * row, 3 * row + 3)),
      vAxis: Array.from(r.vAxis.subarray(3 * row, 3 * row + 3)),
      gridSize: r.gridSize[row],
      nu: r.nu[row],
      nv: r.nv[row],
      values: Array.from(cells, (v) => (Number.isNaN(v) ? null : v)),
    }
  }
  return out
}

/** True for the facade result of `runAreaAndWait` (a ground run returns a grid). */
export const isSurfaceColumns = (r: object): r is SurfaceColumns =>
  'kind' in r && r.kind === 'surface-columns'
