/**
 * useHeatmapOverlay -- Three.js hook that renders a colored grid of
 * InstancedMesh squares from the analysis JSON point cloud data.
 *
 * Each point in the HeatmapPointData becomes a flat colored square positioned
 * at its IFC coordinates, with color mapped from the `df` value using the
 * analysis-colors palette.
 *
 * Subscribes to useAnalysisStore (showOverlay, heatmapData) and to
 * injected floor-state callbacks via IndoorAnalysisDeps.
 *
 * Disposal: always fully disposes geometry + material + mesh from scene.
 * Staleness guard: generation counter prevents stale data from rendering.
 */

import type { SceneRefs } from '@forge-kit/plugin-contracts'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { HeatmapPointData, SpatialTreeNode } from '../../core/indoor-analysis.types'
import type { IndoorAnalysisDeps } from '../../plugin'
import { useAnalysisStore } from '../indoor-analysis.store'

/** Overlay opacity */
const OVERLAY_OPACITY = 0.7

/** Small Y offset to prevent z-fighting with the floor surface */
const Y_OFFSET = 0.02

/**
 * Detect grid cell size from point cloud data by finding the smallest
 * non-zero gap between consecutive X coordinates. Falls back to 0.5m.
 */
function detectGridSize(points: { x: number }[]): number {
  if (points.length < 2) return 0.5
  let minGap = Infinity
  for (let i = 1; i < points.length; i++) {
    const gap = Math.abs(points[i].x - points[i - 1].x)
    if (gap > 1e-6 && gap < minGap) minGap = gap
  }
  return minGap < Infinity ? minGap : 0.5
}

/**
 * Map a daylight-factor value to an RGB color using a cool-to-warm HSL ramp.
 *
 * The ramp goes from blue (hue 240) at the low end to red (hue 0) at the high
 * end, providing a visually intuitive heatmap.
 */
function dfToColor(df: number, minVal: number, maxVal: number, target: THREE.Color): void {
  // Avoid division by zero when min === max
  const range = maxVal - minVal
  const t = range > 0 ? Math.max(0, Math.min(1, (df - minVal) / range)) : 0.5

  // Cool-to-warm: hue goes from 240 (blue) at t=0 to 0 (red) at t=1
  const hue = (1 - t) * (240 / 360)
  target.setHSL(hue, 0.9, 0.5)
}

/**
 * Find IfcSlab element IDs among the descendants of a given floor node.
 *
 * The slab bbox is a much better proxy for the interior floor plate than
 * the full floor descendants bbox (which includes walls, columns, beams,
 * and structural extensions that can shift the bbox center asymmetrically).
 */
function findSlabIds(treeRoots: SpatialTreeNode[], floorLocalId: number): number[] {
  function findNode(nodes: SpatialTreeNode[]): SpatialTreeNode | null {
    for (const node of nodes) {
      if (node.localId === floorLocalId) return node
      const found = findNode(node.children)
      if (found) return found
    }
    return null
  }

  const ids: number[] = []
  function collectSlabs(nodes: SpatialTreeNode[]) {
    for (const node of nodes) {
      const upper = node.type.toUpperCase()
      if (upper === 'IFCSLAB' || upper === 'IFCSLABSTANDARDCASE') {
        ids.push(node.localId)
      }
      collectSlabs(node.children)
    }
  }

  const floorNode = findNode(treeRoots)
  if (floorNode) collectSlabs(floorNode.children)
  return ids
}

/** Result from createHeatmapMesh */
interface HeatmapMeshResult {
  mesh: THREE.InstancedMesh
  /** Center of the heatmap data in Three.js Y-up coords (for alignment) */
  dataCenter: THREE.Vector3
}

/**
 * Build an InstancedMesh from the heatmap point cloud data.
 *
 * Each point becomes a flat colored square at its IFC local coordinates.
 * IFC is Z-up; Three.js is Y-up, so the mapping is:
 *   Three.js X = IFC X
 *   Three.js Y = IFC Z
 *   Three.js Z = -IFC Y
 *
 * Points are placed at their original IFC coordinates. The caller offsets
 * the mesh to align with the model and snap to floor level.
 */
function createHeatmapMesh(data: HeatmapPointData): HeatmapMeshResult | null {
  const { points } = data
  if (!points || points.length === 0) return null

  // Compute actual data range for color mapping + bounding box for alignment
  let dataMinDf = Number.POSITIVE_INFINITY
  let dataMaxDf = Number.NEGATIVE_INFINITY
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (const pt of points) {
    if (pt.df < dataMinDf) dataMinDf = pt.df
    if (pt.df > dataMaxDf) dataMaxDf = pt.df
    if (pt.x < minX) minX = pt.x
    if (pt.x > maxX) maxX = pt.x
    if (pt.y < minY) minY = pt.y
    if (pt.y > maxY) maxY = pt.y
    if (pt.z < minZ) minZ = pt.z
    if (pt.z > maxZ) maxZ = pt.z
  }

  // Data center in Three.js Y-up space (IFC Z-up → Y-up)
  const dataCenter = new THREE.Vector3((minX + maxX) / 2, (minZ + maxZ) / 2, -(minY + maxY) / 2)

  const gridSize = detectGridSize(points)
  const geometry = new THREE.PlaneGeometry(gridSize, gridSize)
  // Rotate plane to be horizontal (plane default is vertical in XY)
  geometry.rotateX(-Math.PI / 2)

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: OVERLAY_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, points.length)
  mesh.frustumCulled = false

  const matrix = new THREE.Matrix4()
  const color = new THREE.Color()

  for (let i = 0; i < points.length; i++) {
    const pt = points[i]
    // IFC Z-up → Three.js Y-up (no Y_OFFSET here; caller handles final height)
    matrix.makeTranslation(pt.x, pt.z, -pt.y)
    mesh.setMatrixAt(i, matrix)

    dfToColor(pt.df, dataMinDf, dataMaxDf, color)
    mesh.setColorAt(i, color)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true
  }

  return { mesh, dataCenter }
}

export function useHeatmapOverlay(sceneRefs: SceneRefs, deps: IndoorAnalysisDeps): void {
  'use no memo' // Opts out of React Compiler -- eslint exhaustive-deps suppression + stable ref deps
  const {
    scene: sceneRef,
    currentModel: currentModelRef,
    disposed: disposedRef,
    needsRender: needsRenderRef,
  } = sceneRefs

  // Current overlay mesh -- held in ref for imperative disposal
  const meshRef = useRef<THREE.InstancedMesh | null>(null)

  // Generation counter to guard against stale data.
  // Bumped on every syncOverlay call (including hide/dispose) so stale
  // updates from a previous generation are discarded.
  const genRef = useRef(0)

  useEffect(() => {
    /**
     * Remove and fully dispose the current overlay mesh (if any).
     * Also bumps the generation counter so any stale updates are discarded.
     */
    function disposeOverlay(): void {
      // Bump generation to invalidate stale updates
      genRef.current += 1

      const mesh = meshRef.current
      if (!mesh) return

      // Remove from whatever parent (scene or model.object)
      mesh.removeFromParent()

      mesh.geometry.dispose()
      const material = mesh.material as THREE.MeshBasicMaterial
      material.dispose()

      meshRef.current = null
      needsRenderRef.current = true
    }

    /**
     * Core overlay logic: create or remove overlay based on store state.
     * Uses deps for floor state instead of useInteriorStore.
     * Async because getMergedBox (for floor-level bbox alignment) returns a Promise.
     */
    async function syncOverlay(): Promise<void> {
      if (disposedRef.current) return

      const { showOverlay, heatmapData } = useAnalysisStore.getState()
      const scene = sceneRef.current
      const model = currentModelRef.current

      // Should we show the overlay?
      const shouldShow = showOverlay && heatmapData !== null && scene !== null && model !== null

      if (!shouldShow) {
        // Remove overlay. disposeOverlay bumps genRef to
        // invalidate any stale updates.
        disposeOverlay()
        return
      }

      // Dispose previous overlay before creating new one (bumps genRef)
      disposeOverlay()

      // Capture generation AFTER dispose bump for this new creation
      const myGen = genRef.current

      // Build the InstancedMesh from point cloud data
      const result = createHeatmapMesh(heatmapData!)
      if (!result) return // empty points array

      const { mesh, dataCenter } = result

      // Staleness guard: if generation changed during mesh creation, discard
      if (genRef.current !== myGen) {
        mesh.geometry.dispose()
        ;(mesh.material as THREE.MeshBasicMaterial).dispose()
        return
      }

      // Align the heatmap grid with the floor geometry.
      // The API returns coordinates in IFC building-local space while ThatOpen
      // renders geometry with the full IFC placement chain applied (building
      // placement offset). We compute the offset by matching the heatmap data
      // center to a reference bounding box center in XZ.
      //
      // Priority: IfcSlab bbox > all-descendants bbox > whole-model bbox.
      // Using slabs gives a much tighter alignment because the slab footprint
      // closely matches the interior floor plate, without walls/columns/beams
      // that can extend asymmetrically beyond the visible walls.
      const descendants = deps.getFloorDescendants?.()
      const descendantIds = descendants && descendants.size > 0 ? Array.from(descendants) : null

      // Try slab-only bbox first for alignment
      const selectedFloor = deps.getSelectedFloor?.()
      const treeRoots = deps.getTreeRoots?.() ?? []
      const slabIds = selectedFloor ? findSlabIds(treeRoots, selectedFloor.localId) : []

      let alignBox: THREE.Box3

      try {
        // 1. Try slab-only bbox (best alignment)
        if (slabIds.length > 0) {
          alignBox = await model!.getMergedBox(slabIds)
          if (genRef.current !== myGen) {
            mesh.geometry.dispose()
            ;(mesh.material as THREE.MeshBasicMaterial).dispose()
            return
          }
          if (alignBox.isEmpty()) {
            alignBox = new THREE.Box3() // will fall through to next
          }
        } else {
          alignBox = new THREE.Box3() // empty, fall through
        }

        // 2. Fall back to all floor descendants
        if (alignBox.isEmpty() && descendantIds) {
          alignBox = await model!.getMergedBox(descendantIds)
          if (genRef.current !== myGen) {
            mesh.geometry.dispose()
            ;(mesh.material as THREE.MeshBasicMaterial).dispose()
            return
          }
          // alignBox is now valid from descendants
        }

        // 3. Fall back to whole model
        if (alignBox.isEmpty()) {
          alignBox = new THREE.Box3().setFromObject(model!.object)
        }
      } catch {
        if (genRef.current !== myGen) {
          mesh.geometry.dispose()
          ;(mesh.material as THREE.MeshBasicMaterial).dispose()
          return
        }
        alignBox = new THREE.Box3().setFromObject(model!.object)
      }

      const alignCenter = new THREE.Vector3()
      alignBox.getCenter(alignCenter)

      let offsetX = alignCenter.x - dataCenter.x
      let offsetZ = alignCenter.z - dataCenter.z

      // Wall-thickness-aware clamping against the alignment box.
      const WALL_THICKNESS = 0.2

      const heatPts = heatmapData!.points
      let dMinX = Infinity,
        dMaxX = -Infinity
      let dMinZ = Infinity,
        dMaxZ = -Infinity
      for (const p of heatPts) {
        const wx = p.x + offsetX
        const wz = -p.y + offsetZ
        if (wx < dMinX) dMinX = wx
        if (wx > dMaxX) dMaxX = wx
        if (wz < dMinZ) dMinZ = wz
        if (wz > dMaxZ) dMaxZ = wz
      }

      const dataSpanX = dMaxX - dMinX
      const dataSpanZ = dMaxZ - dMinZ
      const alignSpanX = alignBox.max.x - alignBox.min.x
      const alignSpanZ = alignBox.max.z - alignBox.min.z
      const marginX = alignSpanX - dataSpanX > 2 * WALL_THICKNESS ? WALL_THICKNESS : 0
      const marginZ = alignSpanZ - dataSpanZ > 2 * WALL_THICKNESS ? WALL_THICKNESS : 0

      if (dMaxX > alignBox.max.x - marginX) offsetX -= dMaxX - (alignBox.max.x - marginX)
      else if (dMinX < alignBox.min.x + marginX) offsetX += alignBox.min.x + marginX - dMinX
      if (dMaxZ > alignBox.max.z - marginZ) offsetZ -= dMaxZ - (alignBox.max.z - marginZ)
      else if (dMinZ < alignBox.min.z + marginZ) offsetZ += alignBox.min.z + marginZ - dMinZ

      // Apply offset to mesh position (critical: without this the heatmap
      // sits at raw IFC building-local coords, ignoring the placement offset)
      mesh.position.set(offsetX, Y_OFFSET, offsetZ)
      mesh.renderOrder = 999
      model!.object.add(mesh)
      meshRef.current = mesh
      needsRenderRef.current = true
    }

    // Subscribe to analysis store changes (showOverlay, heatmapData)
    const unsubAnalysis = useAnalysisStore.subscribe(
      (state) => ({ showOverlay: state.showOverlay, heatmapData: state.heatmapData }),
      () => {
        void syncOverlay()
      },
      {
        equalityFn: (a, b) => a.showOverlay === b.showOverlay && a.heatmapData === b.heatmapData,
      },
    )

    // Subscribe to floor changes via deps callback (if provided)
    const unsubFloor = deps.subscribeToFloorChanges?.(() => {
      void syncOverlay()
    })

    // Run initial sync in case state is already populated
    void syncOverlay()

    return () => {
      unsubAnalysis()
      unsubFloor?.()
      disposeOverlay()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sceneRefs are stable refs, deps is stable from useMemo
  }, [])
}
