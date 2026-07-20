/**
 * `LayerLoaders` — explicit-load rows for ground materials + trees.
 *
 * Rendered above the WorkflowPanel tab bar once the polygon is committed.
 * Each row drives one of:
 *   - `useGroundMaterialsAreaMutation` (SDK ground-material polygons)
 *   - `useVegetationMeshesMutation` (3D tree meshes via convertToMesh)
 *
 * State machine per row (read from each primitive's zustand store):
 *   - idle    → "Load" button
 *   - loading → spinner + disabled button
 *   - ready   → count badge + visibility toggle + reload icon
 *   - error   → inline error + retry
 *
 * Polygon-change invalidation: when `areaPolygon` flips to a new identity,
 * both stores are cleared so stale layers do not linger on the map.
 */
import {
  type GroundMaterialsAreaStatus,
  type useGroundMaterialsAreaMutation,
  useGroundMaterialsStore,
} from '@forge-kit/ground-materials'
import { useMapStore } from '@forge-kit/map-interface'
import {
  stablePolygonKey,
  type useVegetationMeshesMutation,
  useVegetationStore,
  type VegetationStatus,
} from '@forge-kit/vegetation'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { Loader2, RefreshCw, Shapes, TreePine } from 'lucide-react'
import { type ComponentType, useCallback, useEffect } from 'react'
import { Button } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { ImportTreesSection } from '@/components/domains/vegetation'

export interface LayerLoadersProps {
  /** Polygon that drives both mutations. `null` disables the load buttons. */
  polygon: GeoJSONPolygon | null
  /** Ground-materials area mutation from `useMapPlugins()`. */
  groundMaterialsAreaMutation: ReturnType<typeof useGroundMaterialsAreaMutation>
  /** Vegetation mutation from `useMapPlugins()`. */
  vegetationMutation: ReturnType<typeof useVegetationMeshesMutation>
}

export function LayerLoaders({
  polygon,
  groundMaterialsAreaMutation,
  vegetationMutation,
}: LayerLoadersProps) {
  // --- Visibility toggles (map.store.layers.*) ---
  const { groundMaterialsDisplay, vegetation, setLayer } = useMapStore(
    useShallow((s) => ({
      groundMaterialsDisplay: s.layers.groundMaterialsDisplay,
      vegetation: s.layers.vegetation,
      setLayer: s.setLayer,
    })),
  )

  // --- Ground-materials store ---
  const { areaStatus, areaTotalFeatures, areaErrorMessage, lastAreaPolygonKey, clearArea } =
    useGroundMaterialsStore(
      useShallow((s) => ({
        areaStatus: s.areaStatus,
        areaTotalFeatures: s.areaTotalFeatures,
        areaErrorMessage: s.areaErrorMessage,
        lastAreaPolygonKey: s.lastAreaPolygonKey,
        clearArea: s.clearArea,
      })),
    )

  // --- Vegetation store ---
  const { vegStatus, vegTotalTrees, vegErrorMessage, vegLastPolygonKey, vegClear } =
    useVegetationStore(
      useShallow((s) => ({
        vegStatus: s.status,
        vegTotalTrees: s.totalTrees,
        vegErrorMessage: s.errorMessage,
        vegLastPolygonKey: s.lastPolygonKey,
        vegClear: s.clear,
      })),
    )

  // --- Polygon-change invalidation ---
  // When the user redraws the area, drop both stores so the rows reset
  // to `idle` and stale layers vanish from the map.
  const currentPolygonKey = stablePolygonKey(polygon)
  useEffect(() => {
    if (lastAreaPolygonKey && lastAreaPolygonKey !== currentPolygonKey) {
      clearArea()
    }
    if (vegLastPolygonKey && vegLastPolygonKey !== currentPolygonKey) {
      vegClear()
    }
  }, [currentPolygonKey, lastAreaPolygonKey, vegLastPolygonKey, clearArea, vegClear])

  // --- Handlers ---
  const loadGroundMaterials = useCallback(() => {
    if (!polygon) return
    groundMaterialsAreaMutation.mutate(polygon)
  }, [polygon, groundMaterialsAreaMutation])

  const loadVegetation = useCallback(() => {
    if (!polygon) return
    vegetationMutation.mutate(polygon)
  }, [polygon, vegetationMutation])

  const reloadGroundMaterials = useCallback(() => {
    clearArea()
    if (polygon) groundMaterialsAreaMutation.mutate(polygon)
  }, [clearArea, polygon, groundMaterialsAreaMutation])

  const reloadVegetation = useCallback(() => {
    vegClear()
    if (polygon) vegetationMutation.mutate(polygon)
  }, [vegClear, polygon, vegetationMutation])

  const setGroundMaterialsVisible = useCallback(
    (v: boolean) => setLayer('groundMaterialsDisplay', v),
    [setLayer],
  )
  const setVegetationVisible = useCallback((v: boolean) => setLayer('vegetation', v), [setLayer])

  return (
    <div className="px-4 pb-3 flex flex-col gap-2">
      <LoaderRow
        Icon={Shapes}
        label="Ground materials"
        status={areaStatus}
        count={areaTotalFeatures}
        countSuffix="polygons"
        errorMessage={areaErrorMessage}
        visible={groundMaterialsDisplay}
        polygonReady={polygon != null}
        onLoad={loadGroundMaterials}
        onReload={reloadGroundMaterials}
        onVisibilityChange={setGroundMaterialsVisible}
      />
      <LoaderRow
        Icon={TreePine}
        label="Trees"
        status={vegStatus}
        count={vegTotalTrees}
        countSuffix="trees"
        errorMessage={vegErrorMessage}
        visible={vegetation}
        polygonReady={polygon != null}
        onLoad={loadVegetation}
        onReload={reloadVegetation}
        onVisibilityChange={setVegetationVisible}
      />
      <ImportTreesSection polygon={polygon} />
    </div>
  )
}

interface LoaderRowProps {
  Icon: ComponentType<{ className?: string }>
  label: string
  status: GroundMaterialsAreaStatus | VegetationStatus
  count: number
  countSuffix: string
  errorMessage: string | null
  visible: boolean
  polygonReady: boolean
  onLoad: () => void
  onReload: () => void
  onVisibilityChange: (visible: boolean) => void
}

function LoaderRow({
  Icon,
  label,
  status,
  count,
  countSuffix,
  errorMessage,
  visible,
  polygonReady,
  onLoad,
  onReload,
  onVisibilityChange,
}: LoaderRowProps) {
  if (status === 'ready') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <label className="flex-1 flex items-center gap-2 text-xs select-none cursor-pointer">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => onVisibilityChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary"
          />
          <span className="font-medium text-card-foreground">{label}</span>
          <span className="text-muted-foreground tabular-nums">
            {count} {countSuffix}
          </span>
        </label>
        <button
          type="button"
          onClick={onReload}
          title={`Reload ${label.toLowerCase()}`}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <Button type="button" variant="outline" size="sm" disabled className="w-full">
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        Loading {label.toLowerCase()}…
      </Button>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-destructive truncate" title={errorMessage ?? undefined}>
          {errorMessage ?? `Failed to load ${label.toLowerCase()}`}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onReload} className="w-full">
          <Icon className="h-3.5 w-3.5 mr-1.5" />
          Retry {label.toLowerCase()}
        </Button>
      </div>
    )
  }

  // idle
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!polygonReady}
      onClick={onLoad}
      className="w-full"
    >
      <Icon className="h-3.5 w-3.5 mr-1.5" />
      Load {label.toLowerCase()}
    </Button>
  )
}
