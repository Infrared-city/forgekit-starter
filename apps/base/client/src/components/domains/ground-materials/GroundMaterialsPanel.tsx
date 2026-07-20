import type { FeatureCollection, GroundMaterialsViewport } from '@forge-kit/ground-materials'
import {
  GroundMaterialsUnavailableError,
  groundMaterialsKeys,
  regroupCleanResults,
  rgbToHex,
  sortGroundMaterialsFeatures,
  useCleanGroundMaterials,
  useCollectAndProcessGroundMaterials,
  useGroundMaterialRegistry,
  useGroundMaterialsDraw,
  useGroundMaterialsStore,
} from '@forge-kit/ground-materials'
import { useQueryClient } from '@tanstack/react-query'
import { kinks } from '@turf/kinks'
import type { Feature, FeatureCollection as FeatureCollectionGeoJson } from 'geojson'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button, cn } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { ImportGeoJsonSection } from './ImportGeoJsonSection'

// ---------------------------------------------------------------------------
// Dependency interface for GroundMaterialsPanel
// ---------------------------------------------------------------------------

/**
 * Dependencies injected from the composition root so the panel does not
 * depend directly on the map interface store.
 */
export interface GroundMaterialsPanelDeps {
  /** Get the current buildings viewport from the map interface */
  getBuildingsViewport: () => GroundMaterialsViewport
  /** Set a named layer's visibility in the map interface */
  setLayer: (name: string, visible: boolean) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count features that have self-intersections (invalid polygons).
 */
function countInvalidFeatures(allFeatures: Feature[]): number {
  let count = 0
  for (const feature of allFeatures) {
    if (feature.geometry?.type !== 'Polygon') continue
    try {
      const result = kinks(feature as Feature<GeoJSON.Polygon>)
      if (result.features.length > 0) count++
    } catch {
      count++
    }
  }
  return count
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GroundMaterialsPanel({ deps }: { deps: GroundMaterialsPanelDeps }) {
  const queryClient = useQueryClient()
  const buildingsViewport = deps.getBuildingsViewport()
  const setLayer = deps.setLayer

  // Registry
  const { data: registry, isLoading: registryLoading } = useGroundMaterialRegistry()

  // Mutations
  const collectMutation = useCollectAndProcessGroundMaterials()
  const cleanMutation = useCleanGroundMaterials()

  // Inline "temporarily unavailable" notice. Set when the backend returns 501
  // for a collect/clean request. Cleared on the next user attempt.
  const [unavailableNotice, setUnavailableNotice] = useState<string | null>(null)

  // Store state
  const {
    currentMaterial,
    currentMode,
    selectedFeatures,
    actionableState,
    lastCreatedFeatures,
    lastUpdatedFeatures,
  } = useGroundMaterialsStore(
    useShallow((s) => ({
      currentMaterial: s.currentMaterial,
      currentMode: s.currentMode,
      selectedFeatures: s.selectedFeatures,
      actionableState: s.actionableState,
      lastCreatedFeatures: s.lastCreatedFeatures,
      lastUpdatedFeatures: s.lastUpdatedFeatures,
    })),
  )

  // Draw hook
  const { changeMode, setMaterial, deleteFeatures, deleteAllSelected, getAllFeatures, restoreAll } =
    useGroundMaterialsDraw()

  // Cached elements from React Query
  const cachedElements = queryClient.getQueryData<Record<string, FeatureCollection>>(
    groundMaterialsKeys.elements(),
  )

  // Materials list from registry
  const materials = useMemo(() => {
    if (!registry?.materials) return []
    return Object.entries(registry.materials).map(([uuid, mat]) => ({
      uuid,
      name: mat.name,
      displayName: mat.displayName,
      color: rgbToHex(mat.diffuseColor),
    }))
  }, [registry])

  // Count invalid features across all draw features
  const invalidCount = useMemo(() => {
    const allFeatures = getAllFeatures()
    if (!allFeatures) return 0
    return countInvalidFeatures(allFeatures.features)
  }, [getAllFeatures])

  // Disable states
  const isFetching = collectMutation.isPending
  const isSaving = cleanMutation.isPending
  const isBusy = isFetching || isSaving
  const canFetch = !registryLoading && !isBusy && !!registry
  const canSave = actionableState && !isBusy && invalidCount === 0
  const canDiscard = actionableState && !isBusy

  // --- Handlers ---

  const handleFetch = () => {
    if (!canFetch) return

    const distance = Math.max(buildingsViewport.width, buildingsViewport.height) / 2

    setUnavailableNotice(null)

    toast.loading('Fetching ground materials from OSM...', {
      id: 'gm-fetch',
    })

    collectMutation.mutate(
      {
        latitude: buildingsViewport.latitude,
        longitude: buildingsViewport.longitude,
        distance,
        source: 'mapbox',
        defaultMaterial: 'asphalt',
      },
      {
        onSuccess: () => {
          toast.success('Ground materials fetched successfully', {
            id: 'gm-fetch',
          })
          setLayer('groundMaterials', true)

          const newElements = queryClient.getQueryData<Record<string, FeatureCollection>>(
            groundMaterialsKeys.elements(),
          )
          if (newElements) {
            restoreAll(newElements as unknown as Record<string, FeatureCollectionGeoJson>)
          }
        },
        onError: (error) => {
          if (error instanceof GroundMaterialsUnavailableError) {
            toast.dismiss('gm-fetch')
            setUnavailableNotice(error.message)
            return
          }
          toast.error(error instanceof Error ? error.message : 'Failed to fetch ground materials', {
            id: 'gm-fetch',
          })
        },
      },
    )
  }

  const handleSave = () => {
    if (!canSave || !registry) return

    const allFeatures = getAllFeatures()
    if (!allFeatures) return

    setUnavailableNotice(null)

    toast.loading('Saving ground materials...', { id: 'gm-save' })

    const sorted = sortGroundMaterialsFeatures(
      allFeatures as unknown as FeatureCollection,
      lastCreatedFeatures as unknown as FeatureCollection['features'],
      lastUpdatedFeatures as unknown as FeatureCollection['features'],
      registry,
    )

    const distance = Math.max(buildingsViewport.width, buildingsViewport.height) / 2

    cleanMutation.mutate(
      {
        latitude: buildingsViewport.latitude,
        longitude: buildingsViewport.longitude,
        distance,
        layers: sorted,
        default: 'asphalt',
      },
      {
        onSuccess: (data) => {
          const regrouped = regroupCleanResults(data, registry)

          queryClient.setQueryData(groundMaterialsKeys.elements(), regrouped)

          restoreAll(regrouped as unknown as Record<string, FeatureCollectionGeoJson>)

          toast.success('Ground materials saved successfully', {
            id: 'gm-save',
          })
        },
        onError: (error) => {
          if (error instanceof GroundMaterialsUnavailableError) {
            toast.dismiss('gm-save')
            setUnavailableNotice(error.message)
            return
          }
          toast.error(error instanceof Error ? error.message : 'Failed to save ground materials', {
            id: 'gm-save',
          })
        },
      },
    )
  }

  const handleDiscard = () => {
    if (!canDiscard) return
    const cached = queryClient.getQueryData<Record<string, FeatureCollection>>(
      groundMaterialsKeys.elements(),
    )
    if (cached) {
      restoreAll(cached as unknown as Record<string, FeatureCollectionGeoJson>)
    } else {
      useGroundMaterialsStore.getState().resetSession()
    }
  }

  const handleDeleteAll = () => {
    const allFeatures = getAllFeatures()
    if (!allFeatures || allFeatures.features.length === 0) return

    const ids = allFeatures.features
      .map((f) => f.id)
      .filter((id): id is string | number => id !== undefined)
      .map(String)

    if (ids.length > 0) {
      deleteFeatures(ids)
    }
  }

  const handleMaterialSelect = (name: string) => {
    setMaterial(name)
  }

  const handleDrawPolygon = () => {
    if (!currentMaterial && materials.length > 0) {
      setMaterial(materials[0].name)
    }
    changeMode('draw_polygon')
  }

  const handleSelectMode = () => {
    changeMode('simple_select')
  }

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="font-semibold text-lg text-card-foreground">Ground Materials</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Draw and edit material polygons for environmental analysis
        </p>
      </div>

      {/* Material Grid */}
      <div className="px-4 pb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Material Type
        </label>
        <div className="grid grid-cols-5 gap-2">
          {materials.map((mat) => (
            <button
              key={mat.uuid}
              onClick={() => handleMaterialSelect(mat.name)}
              disabled={isBusy}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                'hover:shadow-sm',
                currentMaterial === mat.name
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                  : 'border-border bg-background hover:border-primary/30',
              )}
              title={mat.displayName}
            >
              <div
                className="w-8 h-8 rounded-md border border-border/50"
                style={{ backgroundColor: mat.color }}
              />
              <span className="text-[10px] text-muted-foreground leading-tight text-center truncate w-full">
                {mat.displayName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Import GeoJSON */}
      <div className="h-px bg-border mx-4 mb-4" />
      <ImportGeoJsonSection deps={deps} />

      {/* Mode Controls */}
      <div className="px-4 pb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Drawing Tools
        </label>
        <div className="flex gap-2">
          <Button
            variant={currentMode === 'draw_polygon' ? 'default' : 'outline'}
            size="sm"
            onClick={handleDrawPolygon}
            disabled={isBusy || !registry}
            className="flex-1"
          >
            Draw Polygon
          </Button>
          <Button
            variant={currentMode === 'simple_select' ? 'default' : 'outline'}
            size="sm"
            onClick={handleSelectMode}
            disabled={isBusy}
            className="flex-1"
          >
            Select Mode
          </Button>
        </div>
      </div>

      {/* Selection Actions */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={deleteAllSelected}
            disabled={isBusy || selectedFeatures.length === 0}
            className="flex-1"
          >
            Delete Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAll}
            disabled={isBusy}
            className="flex-1"
          >
            Delete All
          </Button>
        </div>
      </div>

      <div className="h-px bg-border mx-4" />

      {/* Action Buttons */}
      <div className="px-4 py-4 space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFetch}
          disabled={!canFetch}
          className="w-full"
        >
          {isFetching ? 'Fetching...' : 'Fetch from OSM'}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiscard}
            disabled={!canDiscard}
            className="flex-1"
          >
            Discard
          </Button>
        </div>
      </div>

      {/* Status Footer */}
      <div className="mt-auto border-t border-border p-4 space-y-2">
        {unavailableNotice && (
          <div className="p-2 bg-muted border border-border rounded-md text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">{unavailableNotice}</div>
            <div>Backend collection support is pending (see fn-44). Try again later.</div>
          </div>
        )}

        {invalidCount > 0 && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
            <span className="font-medium">
              {invalidCount} invalid polygon{invalidCount > 1 ? 's' : ''}
            </span>
            <span className="text-xs">(self-intersecting - fix before saving)</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Registry</span>
            <span
              className={cn(
                'font-medium',
                registryLoading ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {registryLoading
                ? '...'
                : registry
                  ? `${Object.keys(registry.materials).length} materials`
                  : 'Not loaded'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cached Layers</span>
            <span className="font-medium text-foreground">
              {cachedElements
                ? Object.values(cachedElements).reduce(
                    (sum, fc) => sum + (fc.features?.length ?? 0),
                    0,
                  )
                : 0}{' '}
              features
            </span>
          </div>
          {actionableState && (
            <div className="flex items-center justify-between">
              <span>Unsaved Changes</span>
              <span className="font-medium text-amber-500">Yes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
