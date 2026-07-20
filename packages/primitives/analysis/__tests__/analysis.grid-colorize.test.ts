import { beforeAll, describe, expect, it, vi } from 'vitest'
import { colorScaleVariantFor } from '../core/analysis.color-scales'
import { flatGridToRgba, scanFlatGridDomain } from '../core/analysis.grid-colorize'
import { matrixToImageData } from '../react/analysis.grid-layer'

// This suite runs in a plain Node environment (no DOM). Provide the minimal
// ImageData surface matrixToImageData touches so the byte-for-byte pin below
// exercises the REAL nested-matrix implementation, not a re-derivation.
beforeAll(() => {
  class MinimalImageData {
    data: Uint8ClampedArray
    constructor(
      public width: number,
      public height: number,
    ) {
      this.data = new Uint8ClampedArray(width * height * 4)
    }
  }
  vi.stubGlobal('ImageData', MinimalImageData)
})

/** Deterministic scale: value → ramp on red, null → transparent. */
const scale = (v: number | null): [number, number, number, number] =>
  v == null ? [0, 0, 0, 0] : [Math.round(v * 255) & 255, 7, 42, 255]

/** Nested (south-up, null-marked) view of a flat NaN-marked Float32 grid —
 *  the exact conversion `npyToGrid` performs. */
function toNested(data: Float32Array, rows: number, cols: number): (number | null)[][] {
  const grid: (number | null)[][] = []
  for (let r = 0; r < rows; r++) {
    const row: (number | null)[] = []
    for (let c = 0; c < cols; c++) {
      const v = data[r * cols + c]
      row.push(Number.isNaN(v) ? null : v)
    }
    grid.push(row)
  }
  return grid
}

describe('flatGridToRgba', () => {
  it('matches matrixToImageData byte-for-byte (same flip, same null transparency)', () => {
    const rows = 3
    const cols = 4
    const data = new Float32Array([
      0.1,
      Number.NaN,
      0.3,
      0.4,
      Number.NaN,
      0.5,
      Number.NaN,
      0.6,
      0.7,
      0.8,
      0.9,
      Number.NaN,
    ])
    const viaFlat = flatGridToRgba(data, rows, cols, scale)
    const viaMatrix = matrixToImageData(toNested(data, rows, cols), scale)
    expect(viaFlat.length).toBe(rows * cols * 4)
    expect(Array.from(viaFlat)).toEqual(Array.from(viaMatrix.data))
  })

  it('renders a single-cell grid without flipping artifacts', () => {
    const out = flatGridToRgba(new Float32Array([1]), 1, 1, scale)
    expect(Array.from(out)).toEqual([255, 7, 42, 255])
  })
})

describe('scanFlatGridDomain', () => {
  it('returns NaN-aware min/max', () => {
    const d = scanFlatGridDomain(new Float32Array([Number.NaN, 3, -2, 7, Number.NaN]))
    expect(d).toEqual({ min: -2, max: 7 })
  })

  it('substitutes the 0..1 sentinel for an all-NaN grid (never Infinity)', () => {
    const d = scanFlatGridDomain(new Float32Array([Number.NaN, Number.NaN]))
    expect(d).toEqual({ min: 0, max: 1 })
  })

  it('substitutes the sentinel for an empty grid', () => {
    expect(scanFlatGridDomain(new Float32Array(0))).toEqual({ min: 0, max: 1 })
  })
})

describe('colorScaleVariantFor', () => {
  const opts = { pwcCriteria: 'lawson', tcsSubtype: 'utci-summer' }

  it('maps PWC to pwcCriteria and TCS to tcsSubtype', () => {
    expect(colorScaleVariantFor('pedestrian-wind-comfort', opts)).toBe('lawson')
    expect(colorScaleVariantFor('thermal-comfort-statistics', opts)).toBe('utci-summer')
  })

  it('returns undefined for every other analysis type', () => {
    expect(colorScaleVariantFor('wind-speed', opts)).toBeUndefined()
    expect(colorScaleVariantFor('solar-radiation', opts)).toBeUndefined()
  })
})
