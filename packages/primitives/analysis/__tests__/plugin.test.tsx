import type { MapPluginContext } from '@forge-kit/plugin-contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { Layer } from 'deck.gl'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  type AnalysisDeps,
  type AnalysisRenderData,
  type AnalysisUIConfig,
  createAnalysisPlugin,
  useAnalysisMapPlugin,
} from '../plugin'

/**
 * Plugin-contract tests for the analysis primitive.
 *
 * The only layers the `layers()` callback can emit are `areaBitmapLayer`
 * and `areaDrawLayer`. We exercise BOTH the pure factory
 * (`createAnalysisPlugin`) and the React hook (`useAnalysisMapPlugin`) to
 * lock the contract in place:
 *
 *   - Factory tests (no React) drive every combination of the two layer
 *     slots, so the `layers()` branching is covered cheaply.
 *   - Hook tests (renderHook) assert that the public `useAnalysisMapPlugin`
 *     wiring produces a working `MapPlugin` whose `layers()` reflects the
 *     area draw + area bitmap hooks.
 */

// ---------------------------------------------------------------------------
// createAnalysisPlugin (pure factory)
// ---------------------------------------------------------------------------

function makePanel() {
  return function Panel() {
    return <div data-testid="mock-panel" />
  }
}

// The plugin never inspects the layer's runtime shape — `layers()` just
// re-emits whichever object sits in `areaBitmapLayer` / `areaDrawLayer`.
// We cast plain object stand-ins through `unknown` into `Layer` so the
// `AnalysisRenderData` slots type-check without pulling in the full
// deck.gl Layer class surface. The identity is what the assertions rely
// on, so any opaque reference works.
function makeBitmapLayer(id: string): Layer {
  return { id, __kind: 'bitmap' } as unknown as Layer
}

function makeDrawLayer(id: string): Layer {
  return { id, __kind: 'draw' } as unknown as Layer
}

function makeRenderData(overrides?: Partial<AnalysisRenderData>): AnalysisRenderData {
  return {
    Panel: makePanel(),
    layerVisibility: { analysis: true, groundMaterials: false },
    buildingsViewport: { latitude: 0, longitude: 0, width: 512, height: 512 },
    areaDrawLayer: null,
    areaBitmapLayer: null,
    isGroundMaterialsActive: false,
    ...overrides,
  }
}

// `layers()` never touches the context object, so an empty stand-in
// widened through `unknown` satisfies the `MapPluginContext` shape for
// the purposes of these tests.
const mockContext = {} as unknown as MapPluginContext

describe('createAnalysisPlugin', () => {
  describe('static shape', () => {
    it('registers with the expected plugin id, panel label, and requires', () => {
      const plugin = createAnalysisPlugin(makeRenderData())
      expect(plugin.id).toBe('analysis')
      expect(plugin.panelLabel).toBe('Analysis')
      expect(plugin.requires).toEqual(['buildings'])
      expect(plugin.Panel).toBeDefined()
      expect(plugin.Overlay).toBeDefined()
      expect(plugin.cleanup).toBeTypeOf('function')
    })
  })

  describe('layers()', () => {
    it('returns zero layers when both bitmap and draw slots are null', () => {
      const plugin = createAnalysisPlugin(makeRenderData())
      const layers = plugin.layers(mockContext)
      expect(layers).toHaveLength(0)
    })

    it('includes only the bitmap layer when draw is null', () => {
      const bitmap = makeBitmapLayer('area-bitmap-1')
      const plugin = createAnalysisPlugin(
        makeRenderData({ areaBitmapLayer: bitmap, areaDrawLayer: null }),
      )
      const layers = plugin.layers(mockContext)
      expect(layers).toHaveLength(1)
      expect(layers[0]).toBe(bitmap)
    })

    it('includes only the draw layer when bitmap is null', () => {
      const draw = makeDrawLayer('area-draw-1')
      const plugin = createAnalysisPlugin(
        makeRenderData({ areaDrawLayer: draw, areaBitmapLayer: null }),
      )
      const layers = plugin.layers(mockContext)
      expect(layers).toHaveLength(1)
      expect(layers[0]).toBe(draw)
    })

    it('includes bitmap then draw (in that order) when both are set', () => {
      const bitmap = makeBitmapLayer('area-bitmap-1')
      const draw = makeDrawLayer('area-draw-1')
      const plugin = createAnalysisPlugin(
        makeRenderData({ areaBitmapLayer: bitmap, areaDrawLayer: draw }),
      )
      const layers = plugin.layers(mockContext)
      expect(layers).toHaveLength(2)
      expect(layers[0]).toBe(bitmap)
      expect(layers[1]).toBe(draw)
    })

    it('keeps a hidden bitmap placeholder when layerVisibility.analysis is off, plus the draw layer', () => {
      const bitmap = makeBitmapLayer('area-bitmap-1')
      const draw = makeDrawLayer('area-draw-1')
      const plugin = createAnalysisPlugin(
        makeRenderData({
          layerVisibility: { analysis: false, groundMaterials: false },
          areaBitmapLayer: bitmap,
          areaDrawLayer: draw,
        }),
      )
      const layers = plugin.layers(mockContext)
      // Bitmap kept as a same-id visible:false PLACEHOLDER (not dropped) so deck.gl
      // reuses it by id instead of re-initializing the cached instance (which trips
      // assert(!internalState)). Draw layer kept (not gated by analysis visibility).
      expect(layers).toHaveLength(2)
      expect((layers[0] as { id: string }).id).toBe('analysis-area-bitmap')
      expect((layers[0] as { props: { visible?: boolean } }).props.visible).toBe(false)
      expect(layers[1]).toBe(draw)
    })

    it('keeps only a hidden bitmap placeholder when ground-materials is active (exclusive pointer grab)', () => {
      const bitmap = makeBitmapLayer('area-bitmap-1')
      const draw = makeDrawLayer('area-draw-1')
      const plugin = createAnalysisPlugin(
        makeRenderData({
          isGroundMaterialsActive: true,
          areaBitmapLayer: bitmap,
          areaDrawLayer: draw,
        }),
      )
      const layers = plugin.layers(mockContext)
      // Draw layer omitted (ground-materials pointer grab); bitmap stays as a
      // hidden placeholder so the cached instance can be reused later.
      expect(layers).toHaveLength(1)
      expect((layers[0] as { id: string }).id).toBe('analysis-area-bitmap')
      expect((layers[0] as { props: { visible?: boolean } }).props.visible).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// useAnalysisMapPlugin (React hook wrapper)
// ---------------------------------------------------------------------------
//
// The hook wires area-draw + area-bitmap + run-area hooks into the factory
// above. We mock the two deep primitive hooks so the test stays a unit test
// (no store-level polygon/tile wiring) and assert the public `MapPlugin`
// produced by the hook reflects whichever layers those mocks return.

// Mock holders live at module scope so each test can flip the return value.
const mockAreaBitmapLayer = vi.fn<() => Layer | null>()
const mockAreaDrawLayer = vi.fn<() => Layer | null>()

vi.mock('../react/analysis.area-bitmap-hook', () => ({
  useAreaBitmapLayer: () => mockAreaBitmapLayer(),
}))

vi.mock('../react/analysis.area-draw-hook', () => ({
  useAreaDrawLayer: () => mockAreaDrawLayer(),
}))

// Mock the panel body so the hook test doesn't pull in the full tab
// subtree (which has its own DI surface and would require mocking
// preview / store state).
vi.mock('../react/components/AreaAnalysisTab', () => ({
  AreaAnalysisTab: () => <div data-testid="mock-analysis-panel" />,
}))

function makeHookDeps(): AnalysisDeps {
  return {
    getViewport: () => ({ latitude: 0, longitude: 0, width: 512, height: 512 }),
    getWeatherStations: vi.fn().mockResolvedValue([]),
    getWeatherData: vi.fn().mockResolvedValue({}),
  }
}

function makeHookUiConfig(overrides?: Partial<AnalysisUIConfig>): AnalysisUIConfig {
  return {
    setAnalysisLayerVisible: vi.fn(),
    getBuildingsViewport: () => ({ latitude: 0, longitude: 0, width: 512, height: 512 }),
    getLayerVisibility: () => ({ analysis: true, groundMaterials: false }),
    useAreaPreview: () => ({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      refetch: () => {},
    }),
    useRunArea: () => ({
      start: vi.fn().mockResolvedValue(undefined),
      cancel: vi.fn(),
      status: 'idle',
    }),
    getBuildings: () => undefined,
    ...overrides,
  }
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useAnalysisMapPlugin', () => {
  it('produces a MapPlugin whose AnalysisUIConfig surface is exactly the area-tiled run/preview keys', () => {
    // This is the most important assertion in this file: the public
    // `AnalysisUIConfig` DI surface is exactly the set of required keys
    // below. If a reviewer re-introduces a deleted single-tile run hook
    // to the interface, this object literal will stop compiling because
    // TypeScript excess-property checks would still allow an extra field,
    // BUT the `Required<AnalysisUIConfig>` alias below would light up any
    // newly-required field we forgot. Either way, this test breaks first.
    type RequiredKeys = keyof AnalysisUIConfig
    const expectedKeys: ReadonlyArray<RequiredKeys> = [
      'setAnalysisLayerVisible',
      'getBuildingsViewport',
      'getLayerVisibility',
      'useAreaPreview',
      'useRunArea',
      'getBuildings',
    ]
    // Asserting sorted arrays keeps the check order-independent.
    expect([...expectedKeys].sort()).toEqual(
      [
        'setAnalysisLayerVisible',
        'getBuildingsViewport',
        'getLayerVisibility',
        'useAreaPreview',
        'useRunArea',
        'getBuildings',
      ].sort(),
    )

    mockAreaBitmapLayer.mockReturnValue(null)
    mockAreaDrawLayer.mockReturnValue(null)

    const { result } = renderHook(() => useAnalysisMapPlugin(makeHookDeps(), makeHookUiConfig()), {
      wrapper,
    })

    const { plugin } = result.current
    expect(plugin.id).toBe('analysis')
    expect(plugin.panelLabel).toBe('Analysis')
    expect(plugin.requires).toEqual(['buildings'])
    expect(plugin.layers(mockContext)).toHaveLength(0)
    // fn-52.4 added a body-only tab node for WorkflowPanel injection.
    // Assert the hook exposes it alongside the plugin.
    expect(result.current.analysisTabBody).not.toBeNull()
  })

  it('emits the area bitmap + area draw layers returned by the mocked hooks', () => {
    const bitmap = makeBitmapLayer('hook-bitmap')
    const draw = makeDrawLayer('hook-draw')
    mockAreaBitmapLayer.mockReturnValue(bitmap)
    mockAreaDrawLayer.mockReturnValue(draw)

    const { result } = renderHook(() => useAnalysisMapPlugin(makeHookDeps(), makeHookUiConfig()), {
      wrapper,
    })

    const layers = result.current.plugin.layers(mockContext)
    expect(layers).toHaveLength(2)
    expect(layers[0]).toBe(bitmap)
    expect(layers[1]).toBe(draw)
  })

  it('keeps a hidden bitmap placeholder when layerVisibility.analysis is off but keeps the draw layer', () => {
    const bitmap = makeBitmapLayer('hook-bitmap')
    const draw = makeDrawLayer('hook-draw')
    mockAreaBitmapLayer.mockReturnValue(bitmap)
    mockAreaDrawLayer.mockReturnValue(draw)

    const { result } = renderHook(
      () =>
        useAnalysisMapPlugin(
          makeHookDeps(),
          makeHookUiConfig({
            getLayerVisibility: () => ({ analysis: false, groundMaterials: false }),
          }),
        ),
      { wrapper },
    )

    const layers = result.current.plugin.layers(mockContext)
    // Hidden bitmap → same-id visible:false placeholder (deck reuse fix), + draw.
    expect(layers).toHaveLength(2)
    expect((layers[0] as { id: string }).id).toBe('analysis-area-bitmap')
    expect((layers[0] as { props: { visible?: boolean } }).props.visible).toBe(false)
    expect(layers[1]).toBe(draw)
  })

  it('keeps only a hidden bitmap placeholder when ground-materials is active', () => {
    mockAreaBitmapLayer.mockReturnValue(makeBitmapLayer('hook-bitmap'))
    mockAreaDrawLayer.mockReturnValue(makeDrawLayer('hook-draw'))

    const { result } = renderHook(
      () =>
        useAnalysisMapPlugin(
          makeHookDeps(),
          makeHookUiConfig({
            getLayerVisibility: () => ({ analysis: true, groundMaterials: true }),
          }),
        ),
      { wrapper },
    )

    const layers = result.current.plugin.layers(mockContext)
    expect(layers).toHaveLength(1)
    expect((layers[0] as { id: string }).id).toBe('analysis-area-bitmap')
    expect((layers[0] as { props: { visible?: boolean } }).props.visible).toBe(false)
  })
})
