import type { MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { TreePine } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { computeOriginFromPolygon } from './core/vegetation.geo-utils'
import type { mergeVegetationMeshes } from './core/vegetation.merge-geometry'
import type { VegetationSdkClient } from './react/vegetation.api'
import { useVegetationMeshesMutation } from './react/vegetation.api'
import { useAsyncVegetationGeometry } from './react/vegetation.async-geometry'
import { createVegetationLayer } from './react/vegetation.layer'
import { useVegetationStore } from './react/vegetation.store'

// ---------------------------------------------------------------------------
// Dependency + data interfaces
// ---------------------------------------------------------------------------

export interface VegetationDeps {
  polygon: GeoJsonPolygon | null
  isDrawing: boolean
  apiClient: VegetationSdkClient
  /** Toggle deck.gl layer visibility without destroying GPU resources. */
  visible: boolean
  /** Optional vertical lift (m) applied to the trees layer's
   *  `coordinateOrigin`. Composition root reads
   *  `useGoogle3DTilesStore.groundElevationM + manualElevationOffsetM`; 0
   *  when 3D Tiles are off. See `VegetationLayerOptions.zOffsetM`. */
  zOffsetM?: number
}

export interface VegetationPluginData {
  /** Pre-merged tree geometry. The expensive merge is done ONCE in the hook
   *  (keyed on the meshes array identity), NOT inside `layers()` — see
   *  `useVegetationMapPlugin`. Mirrors the buildings primitive, whose merge
   *  is likewise memoised in its hook. */
  merged: ReturnType<typeof mergeVegetationMeshes> | null
  origin: [number, number]
  visible: boolean
  zOffsetM?: number
}

// ---------------------------------------------------------------------------
// Pure factory
// ---------------------------------------------------------------------------

export function createVegetationPlugin(data: VegetationPluginData): MapPlugin {
  const { merged, origin, visible, zOffsetM } = data

  return {
    id: 'vegetation',
    panelLabel: 'Trees',
    panelIcon: TreePine,

    cleanup: () => {
      useVegetationStore.getState().clear()
    },

    layers: (_ctx: MapPluginContext) => {
      // No merge here: `merged` is precomputed once per fetch in the hook.
      // deck.gl invokes this callback on every layer recompute (hover,
      // selection, camera/elevation tick), so any work here re-runs at
      // frame rate.
      if (!merged) return []
      const layer = createVegetationLayer(merged, origin, { visible, zOffsetM })
      return layer ? [layer] : []
    },
  }
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export interface UseVegetationMapPluginResult {
  plugin: MapPlugin
  mutation: ReturnType<typeof useVegetationMeshesMutation>
}

/**
 * React hook that owns the vegetation plugin lifecycle. Returns the plugin
 * for the map and the `useMutation` handle so the app can drive the
 * explicit "Load trees" button.
 */
export function useVegetationMapPlugin(deps: VegetationDeps): UseVegetationMapPluginResult {
  const { polygon, isDrawing, apiClient, visible, zOffsetM } = deps

  const mutation = useVegetationMeshesMutation(apiClient)

  const { meshes } = useVegetationStore(useShallow((s) => ({ meshes: s.meshes })))

  // Merge the tree meshes ONCE per fetch, keyed on the `meshes` array
  // identity (the store writes a fresh array exactly once per "Load trees").
  // Previously the merge lived inside the plugin's `layers()` callback, so
  // it re-ran on every deck.gl recompute — and with Google 3D Tiles on, the
  // per-frame `zOffsetM` elevation churn rebuilt the plugin and re-merged
  // tens of thousands of vertices (+ per-tree normals) every tick, freezing
  // the UI on dense AOIs. Hoisting it here made it run once per load; it
  // now ALSO runs time-sliced off the render tick (stale-while-revalidate)
  // so even that one merge can't freeze the viewport on project open.
  const { merged } = useAsyncVegetationGeometry(meshes)

  const origin = useMemo<[number, number]>(
    () => (polygon && !isDrawing ? computeOriginFromPolygon(polygon) : [0, 0]),
    [polygon, isDrawing],
  )

  const plugin: MapPlugin = useMemo(
    () =>
      createVegetationPlugin({
        merged,
        origin,
        visible,
        zOffsetM,
      }),
    [merged, origin, visible, zOffsetM],
  )

  return { plugin, mutation }
}
