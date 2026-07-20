import type { Polygon as GeoJSONPolygon } from 'geojson'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysesName } from '../core/analysis.sdk-types'

// Mock the grid-layer helpers BEFORE importing the module under test so we
// can assert that the factory delegates the pixel math rather than
// reimplementing it. Returning plausible stand-in objects keeps BitmapLayer
// construction happy without touching a real canvas.
//
// vi.mock is hoisted above top-level declarations, so top-level `const`
// references would trip on a TDZ ReferenceError. We stash the spies inside
// a stable holder via vi.hoisted() and import them after the mock is set.
const {
  fakeImageData,
  fakePrebuiltImageData,
  fakeCanvas,
  matrixToImageDataMock,
  imageDataToCanvasMock,
  rgbaToImageDataMock,
} = vi.hoisted(() => {
  const _fakeImageData = { __kind: 'image-data' } as unknown as ImageData
  const _fakePrebuiltImageData = { __kind: 'prebuilt-image-data' } as unknown as ImageData
  const _fakeCanvas = { __kind: 'canvas' } as unknown as HTMLCanvasElement
  return {
    fakeImageData: _fakeImageData,
    fakePrebuiltImageData: _fakePrebuiltImageData,
    fakeCanvas: _fakeCanvas,
    matrixToImageDataMock: vi.fn(() => _fakeImageData),
    imageDataToCanvasMock: vi.fn(() => _fakeCanvas),
    rgbaToImageDataMock: vi.fn(() => _fakePrebuiltImageData),
  }
})

vi.mock('../react/analysis.grid-layer', () => ({
  matrixToImageData: matrixToImageDataMock,
  imageDataToCanvas: imageDataToCanvasMock,
  rgbaToImageData: rgbaToImageDataMock,
}))

// Mock deck.gl layers so we can inspect the props passed to BitmapLayer
// without instantiating the real WebGL pipeline. The class is declared
// inline inside the factory — vi.mock is hoisted above any top-level
// declarations, so referencing an outer class here would trip on a TDZ
// ReferenceError.
vi.mock('@deck.gl/layers', () => {
  class FakeBitmapLayer {
    props: Record<string, unknown>
    constructor(props: Record<string, unknown>) {
      this.props = props
    }
  }
  return { BitmapLayer: FakeBitmapLayer }
})

vi.mock('deck.gl', () => ({
  COORDINATE_SYSTEM: { LNGLAT: 'LNGLAT' },
}))

// Type alias used by the assertions below. The runtime class lives inside
// the vi.mock factory above; this is a structural type so we can read the
// `props` bag after construction.
type FakeBitmapLayer = { props: Record<string, unknown> }

import { createAreaBitmapLayer, sampleAreaResultAt } from '../react/analysis.area-bitmap-layer'
import type { AreaRunResult } from '../react/analysis.store'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const samplePolygon: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [2.15, 41.38],
      [2.16, 41.38],
      [2.16, 41.39],
      [2.15, 41.39],
      [2.15, 41.38],
    ],
  ],
}

function makeResult(overrides: Partial<AreaRunResult> = {}): AreaRunResult {
  return {
    mergedGrid: [
      [0.1, null, 0.3],
      [null, 0.5, null],
    ],
    gridShape: [2, 3],
    gridBounds: { west: 2.15, south: 41.38, east: 2.16, north: 41.39 },
    polygon: samplePolygon,
    analysisType: AnalysesName.WindSpeed,
    failedJobs: [],
    skippedJobs: [],
    totalJobs: 1,
    succeededJobs: 1,
    ...overrides,
  }
}

const stubColorScale = vi.fn(
  (_value: number | null) => [0, 0, 0, 0] as [number, number, number, number],
)

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createAreaBitmapLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates pixel conversion to matrixToImageData + imageDataToCanvas', () => {
    const result = makeResult()
    createAreaBitmapLayer({ result, colorScale: stubColorScale })

    // matrixToImageData must receive the merged grid and the caller-provided
    // color scale *unchanged*. If anyone rewrites this factory to apply
    // row-flipping or null-filtering themselves, both asserts should fail.
    expect(matrixToImageDataMock).toHaveBeenCalledTimes(1)
    expect(matrixToImageDataMock).toHaveBeenCalledWith(result.mergedGrid, stubColorScale)

    // imageDataToCanvas should wrap the ImageData returned by
    // matrixToImageData (not the matrix, not a fresh object).
    expect(imageDataToCanvasMock).toHaveBeenCalledTimes(1)
    expect(imageDataToCanvasMock).toHaveBeenCalledWith(fakeImageData)
  })

  it('passes gridBounds as [west, south, east, north] to BitmapLayer', () => {
    const result = makeResult({
      gridBounds: { west: -1, south: -2, east: 3, north: 4 },
    })
    const layer = createAreaBitmapLayer({
      result,
      colorScale: stubColorScale,
    }) as unknown as FakeBitmapLayer

    expect(layer.props.bounds).toEqual([-1, -2, 3, 4])
  })

  it('sets id, coordinateSystem, pickable, and image props correctly', () => {
    const result = makeResult()
    const layer = createAreaBitmapLayer({
      result,
      colorScale: stubColorScale,
    }) as unknown as FakeBitmapLayer

    expect(layer.props.id).toBe('analysis-area-bitmap')
    expect(layer.props.coordinateSystem).toBe('LNGLAT')
    // pickable=true so consumers can wire a hover tooltip (review item #24).
    expect(layer.props.pickable).toBe(true)
    expect(layer.props.image).toBe(fakeCanvas)
  })

  it('defaults opacity to 1 (fully opaque)', () => {
    const result = makeResult()
    const layer = createAreaBitmapLayer({
      result,
      colorScale: stubColorScale,
    }) as unknown as FakeBitmapLayer

    expect(layer.props.opacity).toBe(1)
  })

  it('respects an explicit opacity override', () => {
    const result = makeResult()
    const layer = createAreaBitmapLayer({
      result,
      colorScale: stubColorScale,
      opacity: 0.35,
    }) as unknown as FakeBitmapLayer

    expect(layer.props.opacity).toBe(0.35)
  })

  it('uses prebuilt pixels via rgbaToImageData and skips the matrix walk entirely', () => {
    const result = makeResult()
    const prebuilt = {
      pixels: new Uint8ClampedArray(2 * 3 * 4),
      width: 3,
      height: 2,
      min: 0.1,
      max: 0.9,
    }
    const layer = createAreaBitmapLayer({ result, prebuilt }) as unknown as FakeBitmapLayer

    expect(rgbaToImageDataMock).toHaveBeenCalledTimes(1)
    expect(rgbaToImageDataMock).toHaveBeenCalledWith(prebuilt.pixels, 3, 2)
    expect(matrixToImageDataMock).not.toHaveBeenCalled()
    expect(imageDataToCanvasMock).toHaveBeenCalledWith(fakePrebuiltImageData)
    expect(layer.props.image).toBe(fakeCanvas)
  })

  it('throws when called with neither prebuilt pixels nor a colorScale', () => {
    expect(() => createAreaBitmapLayer({ result: makeResult() })).toThrow(/prebuilt|colorScale/)
  })
})

describe('sampleAreaResultAt', () => {
  it('returns the cell value at a lng/lat inside the grid', () => {
    const result = makeResult()
    // mergedGrid is south-up (row 0 = south edge). Bounds are
    // [2.15, 41.38] → [2.16, 41.39]. A point in the SW cell (row 0, col 0)
    // should return mergedGrid[0][0] = 0.1.
    expect(sampleAreaResultAt(result, 2.151, 41.381)).toBe(0.1)
    // Middle-row, middle-col cell → mergedGrid[1][1] = 0.5.
    expect(sampleAreaResultAt(result, 2.156, 41.386)).toBe(0.5)
  })

  it('returns null for points outside the grid bounds', () => {
    const result = makeResult()
    expect(sampleAreaResultAt(result, 0, 0)).toBeNull()
    expect(sampleAreaResultAt(result, 2.17, 41.385)).toBeNull()
    expect(sampleAreaResultAt(result, 2.155, 41.4)).toBeNull()
  })

  it('returns null for NaN-cell lookups', () => {
    const result = makeResult()
    // Row 0 col 1 = null (gap). Lng range per cell is 0.00333; col 1
    // covers [2.15333, 2.15666].
    expect(sampleAreaResultAt(result, 2.155, 41.381)).toBeNull()
  })

  it('returns null when the grid is empty', () => {
    const result = makeResult({ mergedGrid: [], gridShape: [0, 0] })
    expect(sampleAreaResultAt(result, 2.155, 41.385)).toBeNull()
  })
})
