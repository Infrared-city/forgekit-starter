import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HeatmapPointData } from '../core/indoor-analysis.types'
import type { IndoorAnalysisDeps } from '../plugin'
import { getIndoorAnalysisInitialState, useAnalysisStore } from '../react/indoor-analysis.store'

// --- Mock Three.js with InstancedMesh support ---

const mockGeometryDispose = vi.fn()
const mockGeometryRotateX = vi.fn()
const mockMaterialDispose = vi.fn()
const mockModelObjectAdd = vi.fn()
const mockRemoveFromParent = vi.fn()
const mockSetMatrixAt = vi.fn()
const mockSetColorAt = vi.fn()
const mockPositionSet = vi.fn()

let lastInstancedMeshArgs: { count: number } | null = null

vi.mock('three', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    PlaneGeometry: class MockPlaneGeometry {
      dispose = mockGeometryDispose
      rotateX = mockGeometryRotateX
    },
    MeshBasicMaterial: class MockMeshBasicMaterial {
      transparent = false
      opacity = 1
      depthWrite = true
      side = 0
      dispose = mockMaterialDispose
      constructor(params?: Record<string, unknown>) {
        if (params) {
          Object.assign(this, params)
        }
      }
    },
    InstancedMesh: class MockInstancedMesh {
      geometry: any
      material: any
      renderOrder = 0
      frustumCulled = true
      instanceMatrix = { needsUpdate: false }
      instanceColor: { needsUpdate: boolean } | null = null
      count: number
      position = { x: 0, y: 0, z: 0, set: mockPositionSet }
      removeFromParent = mockRemoveFromParent
      setMatrixAt = (...args: any[]) => {
        mockSetMatrixAt(...args)
      }
      setColorAt = (...args: any[]) => {
        mockSetColorAt(...args)
        if (!this.instanceColor) {
          this.instanceColor = { needsUpdate: false }
        }
      }
      constructor(geometry: any, material: any, count: number) {
        this.geometry = geometry
        this.material = material
        this.count = count
        lastInstancedMeshArgs = { count }
      }
    },
    Box3: class MockBox3 {
      min = { x: Infinity, y: Infinity, z: Infinity }
      max = { x: -Infinity, y: -Infinity, z: -Infinity }
      isEmpty() {
        return this.max.x < this.min.x
      }
      getCenter(target: any) {
        target.x = (this.min.x + this.max.x) / 2
        target.y = (this.min.y + this.max.y) / 2
        target.z = (this.min.z + this.max.z) / 2
        return target
      }
      setFromObject() {
        this.min = { x: -5, y: -1, z: -4 }
        this.max = { x: 15, y: 3, z: 12 }
        return this
      }
    },
    Vector3: class MockVector3 {
      x: number
      y: number
      z: number
      constructor(x = 0, y = 0, z = 0) {
        this.x = x
        this.y = y
        this.z = z
      }
    },
    Matrix4: class MockMatrix4 {
      makeTranslation = vi.fn().mockReturnThis()
    },
    Color: class MockColor {
      r = 0
      g = 0
      b = 0
      setHSL = vi.fn().mockReturnThis()
    },
    DoubleSide: 2,
  }
})

// --- Test data ---

const mockHeatmapData: HeatmapPointData = {
  minLegend: 0,
  maxLegend: 5.2,
  points: [
    { x: 1.0, y: 2.0, z: 0.5, df: 3.1 },
    { x: 1.5, y: 2.5, z: 0.5, df: 1.8 },
  ],
}

const mockHeatmapDataEmpty: HeatmapPointData = {
  minLegend: 0,
  maxLegend: 5.2,
  points: [],
}

const mockHeatmapDataEqualLegend: HeatmapPointData = {
  minLegend: 3.0,
  maxLegend: 3.0,
  points: [{ x: 1.0, y: 2.0, z: 0.5, df: 3.0 }],
}

// --- Helpers ---

function createMockDeps(overrides?: Partial<IndoorAnalysisDeps>): IndoorAnalysisDeps {
  return {
    getModelBuffer: () => new ArrayBuffer(8),
    getSelectedFloor: () => ({ uuid: 'test-uuid', localId: 100 }),
    getTreeRoots: () => [],
    getLocation: () => ({ lat: 41.39, lng: 2.17 }),
    getLoadingState: () => 'loaded',
    getModelInfo: () => ({ name: 'test.ifc', sizeBytes: 1000 }),
    getSelectedFloorIndex: () => 0,
    setSelectedFloor: vi.fn(),
    getFloorDescendants: () => new Set([10, 20, 30]),
    subscribeToFloorChanges: undefined,
    // React hook ports (not used by useHeatmapOverlay, but required by interface)
    useModelBuffer: () => new ArrayBuffer(8),
    useSelectedFloor: () => 100,
    useTreeRoots: () => [],
    useLocation: () => ({ lat: 41.39, lng: 2.17 }),
    useLoadingState: () => 'loaded' as const,
    useModelInfo: () => ({ name: 'test.ifc', sizeBytes: 1000 }),
    ...overrides,
  }
}

function createMockMergedBox() {
  return {
    isEmpty: () => false,
    min: { x: 0, y: 0, z: 0 },
    max: { x: 10, y: 1.5, z: 8 },
    getCenter(target: any) {
      target.x = 5
      target.y = 0.75
      target.z = 4
      return target
    },
  }
}

function createMockSceneRefs(overrides?: Record<string, unknown>) {
  return {
    renderer: { current: null },
    scene: { current: {} },
    camera: { current: null },
    controls: { current: null },
    fragments: { current: { update: vi.fn() } },
    currentModel: {
      current: {
        object: { add: mockModelObjectAdd, traverse: vi.fn(), position: { x: 0, y: 0, z: 0 } },
        setOpacity: vi.fn(),
        resetOpacity: vi.fn(),
        getMergedBox: vi.fn().mockResolvedValue(createMockMergedBox()),
      },
    },
    composer: { current: null },
    grid: { current: null },
    backgroundTexture: { current: null },
    canvasElement: { current: null },
    disposed: { current: false },
    needsRender: { current: false },
    continuousRenderUntil: { current: 0 },
    ...overrides,
  } as any
}

// --- Tests ---

describe('useHeatmapOverlay', () => {
  let useHeatmapOverlay: typeof import('../react/hooks/useHeatmapOverlay').useHeatmapOverlay

  beforeEach(async () => {
    vi.clearAllMocks()
    lastInstancedMeshArgs = null
    useAnalysisStore.setState(getIndoorAnalysisInitialState())

    const mod = await import('../react/hooks/useHeatmapOverlay')
    useHeatmapOverlay = mod.useHeatmapOverlay
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // --- Subscription lifecycle ---

  describe('subscription lifecycle', () => {
    it('subscribes to analysis store on mount', async () => {
      const analysisSpy = vi.spyOn(useAnalysisStore, 'subscribe')
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      expect(analysisSpy).toHaveBeenCalled()

      analysisSpy.mockRestore()
    })

    it('calls subscribeToFloorChanges if provided', async () => {
      const floorSub = vi.fn(() => vi.fn())
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps({ subscribeToFloorChanges: floorSub })

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      expect(floorSub).toHaveBeenCalled()
    })
  })

  // --- InstancedMesh creation ---

  describe('InstancedMesh creation', () => {
    it('creates InstancedMesh with correct instance count when overlay is shown', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      // Should have created InstancedMesh with 2 instances
      expect(lastInstancedMeshArgs).toEqual({ count: 2 })
      expect(mockModelObjectAdd).toHaveBeenCalled()
    })

    it('calls setMatrixAt and setColorAt for each point', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(mockSetMatrixAt).toHaveBeenCalledTimes(2)
      expect(mockSetColorAt).toHaveBeenCalledTimes(2)
      // Check indices
      expect(mockSetMatrixAt).toHaveBeenCalledWith(0, expect.anything())
      expect(mockSetMatrixAt).toHaveBeenCalledWith(1, expect.anything())
      expect(mockSetColorAt).toHaveBeenCalledWith(0, expect.anything())
      expect(mockSetColorAt).toHaveBeenCalledWith(1, expect.anything())
    })

    it('rotates plane geometry to horizontal orientation', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      // PlaneGeometry should be rotated -90 degrees around X to lie flat
      expect(mockGeometryRotateX).toHaveBeenCalledWith(-Math.PI / 2)
    })
  })

  // --- Store interaction ---

  describe('store interaction', () => {
    it('does not create overlay when showOverlay=false', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        // showOverlay remains false
        await new Promise((r) => setTimeout(r, 10))
      })

      // Scene.add should not have been called
      expect(mockModelObjectAdd).not.toHaveBeenCalled()
    })

    it('does not create overlay when heatmapData is null', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setShowOverlay(true)
        // heatmapData remains null
        await new Promise((r) => setTimeout(r, 10))
      })

      // Scene.add should not have been called
      expect(mockModelObjectAdd).not.toHaveBeenCalled()
    })
  })

  // --- Edge cases ---

  describe('edge cases', () => {
    it('does not create mesh for empty points array', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapDataEmpty)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      // Should not add anything to scene (createHeatmapMesh returns null)
      expect(mockModelObjectAdd).not.toHaveBeenCalled()
    })

    it('handles min === max legend without crashing', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapDataEqualLegend)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      // Should create mesh without division by zero
      expect(lastInstancedMeshArgs).toEqual({ count: 1 })
      expect(mockModelObjectAdd).toHaveBeenCalled()
    })
  })

  // --- Cleanup ---

  describe('cleanup', () => {
    it('unsubscribes from store and floor changes on unmount', async () => {
      const unsubFloor = vi.fn()
      const floorSub = vi.fn(() => unsubFloor)
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps({ subscribeToFloorChanges: floorSub })

      const { unmount } = renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      unmount()

      expect(unsubFloor).toHaveBeenCalled()
    })

    it('does not crash on unmount with no overlay active', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      const { unmount } = renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      // Should not throw
      unmount()
    })

    it('disposes geometry and material when overlay is removed', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      // Show overlay
      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      // Hide overlay -- should dispose
      await act(async () => {
        useAnalysisStore.getState().setShowOverlay(false)
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(mockGeometryDispose).toHaveBeenCalled()
      expect(mockMaterialDispose).toHaveBeenCalled()
      expect(mockRemoveFromParent).toHaveBeenCalled()
    })

    it('disposes on unmount when overlay is active', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      const { unmount } = renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      // Show overlay
      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      unmount()

      expect(mockGeometryDispose).toHaveBeenCalled()
      expect(mockMaterialDispose).toHaveBeenCalled()
      expect(mockRemoveFromParent).toHaveBeenCalled()
    })
  })

  // --- Staleness guard ---

  describe('staleness guard', () => {
    it('does not add overlay when scene is disposed', async () => {
      const sceneRefs = createMockSceneRefs()
      const deps = createMockDeps()

      renderHook(() => useHeatmapOverlay(sceneRefs, deps))

      // Mark scene as disposed before setting data
      sceneRefs.disposed.current = true

      await act(async () => {
        useAnalysisStore.getState().setHeatmapData(mockHeatmapData)
        useAnalysisStore.getState().setShowOverlay(true)
        await new Promise((r) => setTimeout(r, 10))
      })

      // Scene.add should NOT have been called because disposed=true
      expect(mockModelObjectAdd).not.toHaveBeenCalled()
    })
  })
})
