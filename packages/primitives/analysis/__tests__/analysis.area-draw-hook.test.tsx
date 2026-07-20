import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, renderHook } from '@testing-library/react'
import type { FeatureCollection, Polygon as GeoJSONPolygon } from 'geojson'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock `@deck.gl-community/editable-layers` so tests do not pull in the real
// deck.gl runtime. We record every constructor call so assertions can
// inspect what the factory passed in (mode, data, onEdit, colors, ...).
//
// `vi.mock` calls are hoisted to the top of the file, so any variables
// they reference MUST be defined via `vi.hoisted` (which gets hoisted too).
const mocks = vi.hoisted(() => {
  const editableLayerCalls: Array<Record<string, unknown>> = []

  class MockEditableGeoJsonLayer {
    public props: Record<string, unknown>
    constructor(props: Record<string, unknown>) {
      this.props = props
      editableLayerCalls.push(props)
    }
  }

  class MockDrawPolygonMode {}
  class MockViewMode {}

  const toastErrorSpy = vi.fn()

  return {
    editableLayerCalls,
    MockEditableGeoJsonLayer,
    MockDrawPolygonMode,
    MockViewMode,
    toastErrorSpy,
  }
})

vi.mock('@deck.gl-community/editable-layers', () => ({
  EditableGeoJsonLayer: mocks.MockEditableGeoJsonLayer,
  DrawPolygonMode: mocks.MockDrawPolygonMode,
  ViewMode: mocks.MockViewMode,
}))

// Mock Sonner — the hook should toast on invalid polygons.
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mocks.toastErrorSpy(...args),
    loading: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Aliases for convenience inside the test bodies.
const editableLayerCalls = mocks.editableLayerCalls
const MockEditableGeoJsonLayer = mocks.MockEditableGeoJsonLayer
const MockDrawPolygonMode = mocks.MockDrawPolygonMode
const MockViewMode = mocks.MockViewMode
const toastErrorSpy = mocks.toastErrorSpy

import { useAreaDrawLayer } from '../react/analysis.area-draw-hook'
// Import the module under test AFTER the mocks so the mocked symbols are
// wired in. We also import the store + the factory for the factory-level
// unit test.
import { createAreaDrawLayer } from '../react/analysis.area-draw-layer'
import { getAnalysisInitialState, useAnalysisStore } from '../react/analysis.store'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const validSquare: GeoJSONPolygon = {
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

// A bowtie polygon that self-intersects — @turf/kinks will find a
// self-intersection point, so isValidPolygon() returns false.
const selfIntersecting: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [2, 2],
      [2, 0],
      [0, 2],
      [0, 0],
    ],
  ],
}

function fcWith(polygon: GeoJSONPolygon): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: polygon,
      },
    ],
  }
}

// ─── useAreaDrawLayer hook tests ────────────────────────────────────────────

describe('useAreaDrawLayer', () => {
  beforeEach(() => {
    useAnalysisStore.setState(getAnalysisInitialState())
    editableLayerCalls.length = 0
    toastErrorSpy.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when areaMode is off', () => {
    const { result } = renderHook(() => useAreaDrawLayer())
    expect(result.current).toBeNull()
    expect(editableLayerCalls).toHaveLength(0)
  })

  it('returns a layer in draw mode when areaMode is on and no polygon yet', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
    })
    const { result } = renderHook(() => useAreaDrawLayer())
    expect(result.current).not.toBeNull()
    // The most recent constructor call is the current layer.
    const lastCall = editableLayerCalls.at(-1)
    expect(lastCall).toBeDefined()
    expect(lastCall?.mode).toBe(MockDrawPolygonMode)
    expect(lastCall?.selectedFeatureIndexes).toEqual([])
    expect(lastCall?.id).toBe('analysis-area-draw')
    // Data should be an empty feature collection.
    const data = lastCall?.data as FeatureCollection
    expect(data.type).toBe('FeatureCollection')
    expect(data.features).toHaveLength(0)
  })

  it('returns a layer in view mode when areaMode is on and a polygon is set', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
      useAnalysisStore.getState().setAreaPolygon(validSquare)
    })
    const { result } = renderHook(() => useAreaDrawLayer())
    expect(result.current).not.toBeNull()
    const lastCall = editableLayerCalls.at(-1)
    expect(lastCall?.mode).toBe(MockViewMode)
    // selectedFeatureIndexes is undefined in view mode (per factory contract).
    expect(lastCall?.selectedFeatureIndexes).toBeUndefined()
    // Data wraps the stored polygon.
    const data = lastCall?.data as FeatureCollection
    expect(data.features).toHaveLength(1)
    expect(data.features[0].geometry).toEqual(validSquare)
  })

  it('on addFeature with a VALID polygon: writes to store, clears drawing, does NOT toast', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
      useAnalysisStore.getState().setAreaDrawing(true)
    })
    renderHook(() => useAreaDrawLayer())

    // Grab the onEdit callback from the most recent constructor call and
    // invoke it as if the library had just fired `addFeature` on a valid
    // polygon.
    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void
    expect(typeof onEdit).toBe('function')

    act(() => {
      onEdit({ updatedData: fcWith(validSquare), editType: 'addFeature' })
    })

    const state = useAnalysisStore.getState()
    expect(state.areaPolygon).toEqual(validSquare)
    expect(state.areaDrawing).toBe(false)
    // setAreaPolygon invalidates any prior run — task 1's contract.
    expect(state.areaStatus).toBe('idle')
    expect(state.areaResult).toBeNull()
    expect(state.areaError).toBeNull()
    expect(toastErrorSpy).not.toHaveBeenCalled()
  })

  it('on addFeature with an INVALID (self-intersecting) polygon: toasts, does NOT write to store', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
      useAnalysisStore.getState().setAreaDrawing(true)
    })
    renderHook(() => useAreaDrawLayer())

    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void

    act(() => {
      onEdit({ updatedData: fcWith(selfIntersecting), editType: 'addFeature' })
    })

    const state = useAnalysisStore.getState()
    // No polygon written.
    expect(state.areaPolygon).toBeNull()
    // Drawing flag reset so the controller override clears.
    expect(state.areaDrawing).toBe(false)
    // Toast surfaced.
    expect(toastErrorSpy).toHaveBeenCalledWith('Polygon is invalid — try again')
  })

  it('on invalidPolygon editType (library-emitted): toasts, does NOT write to store', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
      useAnalysisStore.getState().setAreaDrawing(true)
    })
    renderHook(() => useAreaDrawLayer())

    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void

    // Even if `updatedData` has a valid polygon, the library-emitted
    // `invalidPolygon` editType MUST NOT reach `setAreaPolygon` — it's
    // the library telling us the polygon it attempted to add was
    // self-intersecting.
    act(() => {
      onEdit({ updatedData: fcWith(validSquare), editType: 'invalidPolygon' })
    })

    const state = useAnalysisStore.getState()
    expect(state.areaPolygon).toBeNull()
    expect(state.areaDrawing).toBe(false)
    expect(toastErrorSpy).toHaveBeenCalledWith('Polygon is invalid — try again')
  })

  it('on addTentativePosition: flips areaDrawing to true', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
    })
    renderHook(() => useAreaDrawLayer())

    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void

    expect(useAnalysisStore.getState().areaDrawing).toBe(false)

    act(() => {
      // During drawing, the updatedData is often a FeatureCollection with
      // no polygon yet (the library is tracking click positions). Pass an
      // empty FC to mirror that reality.
      onEdit({
        updatedData: { type: 'FeatureCollection', features: [] },
        editType: 'addTentativePosition',
      })
    })

    expect(useAnalysisStore.getState().areaDrawing).toBe(true)
    expect(toastErrorSpy).not.toHaveBeenCalled()
  })

  it('on cancelFeature (escape): clears drawing flag without toasting', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
      useAnalysisStore.getState().setAreaDrawing(true)
    })
    renderHook(() => useAreaDrawLayer())

    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void

    act(() => {
      onEdit({
        updatedData: { type: 'FeatureCollection', features: [] },
        editType: 'cancelFeature',
      })
    })

    expect(useAnalysisStore.getState().areaDrawing).toBe(false)
    expect(toastErrorSpy).not.toHaveBeenCalled()
  })

  it('forces areaDrawing=false when the hook unmounts mid-draw', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
    })
    const { unmount } = renderHook(() => useAreaDrawLayer())

    // Simulate the user clicking a vertex — this flips `areaDrawing` to
    // true via the addTentativePosition branch.
    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void
    act(() => {
      onEdit({
        updatedData: { type: 'FeatureCollection', features: [] },
        editType: 'addTentativePosition',
      })
    })
    expect(useAnalysisStore.getState().areaDrawing).toBe(true)

    // Now the draw layer is torn down (plugin unmount / route leave)
    // without a terminal event. The hook MUST force the flag back to
    // false so the map route's controllerOverride does not get stuck
    // with `doubleClickZoom: false`.
    act(() => {
      unmount()
    })
    expect(useAnalysisStore.getState().areaDrawing).toBe(false)
  })

  it('forces areaDrawing=false when areaMode flips off mid-draw', () => {
    act(() => {
      useAnalysisStore.getState().setAreaMode(true)
    })
    const { rerender } = renderHook(() => useAreaDrawLayer())

    const onEdit = editableLayerCalls.at(-1)?.onEdit as (ctx: {
      updatedData: FeatureCollection
      editType: string
    }) => void
    act(() => {
      onEdit({
        updatedData: { type: 'FeatureCollection', features: [] },
        editType: 'addTentativePosition',
      })
    })
    expect(useAnalysisStore.getState().areaDrawing).toBe(true)

    // Turn area mode OFF mid-draw (user clicked the area toggle). The
    // cleanup effect must force `areaDrawing=false` so the controller
    // override in the map route does not strand `doubleClickZoom`
    // disabled with no draw UI visible.
    act(() => {
      useAnalysisStore.getState().setAreaMode(false)
    })
    rerender()

    expect(useAnalysisStore.getState().areaDrawing).toBe(false)
  })
})

// ─── createAreaDrawLayer factory unit test ──────────────────────────────────

describe('createAreaDrawLayer', () => {
  beforeEach(() => {
    editableLayerCalls.length = 0
  })

  it('wires DrawPolygonMode when mode is "draw"', () => {
    const layer = createAreaDrawLayer({
      mode: 'draw',
      data: { type: 'FeatureCollection', features: [] },
      onEdit: () => {},
    })
    expect(layer).toBeInstanceOf(MockEditableGeoJsonLayer)
    const last = editableLayerCalls.at(-1)
    expect(last?.mode).toBe(MockDrawPolygonMode)
    expect(last?.selectedFeatureIndexes).toEqual([])
    expect(last?.id).toBe('analysis-area-draw')
    // Color palette (sky-500 with alpha) is stable — tests lock it so a
    // future "just change the color" PR has to update the test along with
    // the factory, which is a deliberate signal that the area-mode visual
    // identity is intentional.
    expect(last?.getFillColor).toEqual([14, 165, 233, 60])
    expect(last?.getLineColor).toEqual([14, 165, 233, 240])
  })

  it('wires ViewMode when mode is "view"', () => {
    const layer = createAreaDrawLayer({
      mode: 'view',
      data: { type: 'FeatureCollection', features: [] },
      onEdit: () => {},
    })
    expect(layer).toBeInstanceOf(MockEditableGeoJsonLayer)
    const last = editableLayerCalls.at(-1)
    expect(last?.mode).toBe(MockViewMode)
    expect(last?.selectedFeatureIndexes).toBeUndefined()
  })
})

// ─── No tiling imports assertion (task-3 new files) ────────────────────────

describe('no tiling imports (task-3 files)', () => {
  it('none of the new task-3 files import from @infrared-city/infrared-sdk-ts/tiling', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const paths = [
      resolve(here, '../react/analysis.area-draw-layer.ts'),
      resolve(here, '../react/analysis.area-draw-hook.ts'),
    ]
    for (const p of paths) {
      const source = readFileSync(p, 'utf8')
      expect(source, `${p} must not import @infrared-city/infrared-sdk-ts/tiling`).not.toContain(
        '@infrared-city/infrared-sdk-ts/tiling',
      )
    }
  })
})
