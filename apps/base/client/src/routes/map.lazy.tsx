import { useAnalysisStore } from '@forge-kit/analysis'
import { useBuildingsInArea } from '@forge-kit/buildings'
import { DrawControl } from '@forge-kit/ground-materials'
import {
  LayerControls,
  MapCanvasWithSuspense,
  useMapStore,
  useViewportSync,
} from '@forge-kit/map-interface'
import type { MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'
import { useQueryClient } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Skeleton } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { LayerLoaders } from '@/composition/LayerLoaders'
import { useMapPlugins } from '@/composition/map-plugins'
import { placesClient, mapSdk as sdk } from '@/composition/map-singletons'
import { WorkflowPanel } from '@/composition/WorkflowPanel'

export const Route = createLazyFileRoute('/map')({
  component: MapRoute,
})

/**
 * Stable plugin-side state lifted from `MapRouteChosenHooks` up to
 * `MapRoute`. ONLY the plugin array and the (memoised) `mapChildren` node
 * are lifted — both change very rarely (registry/composition output and
 * the ground-materials draw toggle). Crucially, anything that depends on
 * the high-frequency `viewState` (panel context, selected/hovered mesh)
 * stays inside `MapRouteChosenHooks` so a `flyTo` animation does not
 * cause `MapRoute` to re-render every frame.
 */
interface ChosenCanvasState {
  plugins: MapPlugin[]
  mapChildren: ReactNode
  hiddenBuildingIds?: number[]
}

/**
 * Map route -- single mount-point that always renders
 * `MapCanvasWithSuspense`. The plugin-producing hooks (`useMapPlugins` /
 * `useViewportSync`) live in a child component (`MapRouteChosenHooks`) that
 * is conditionally mounted based on `hasUserChosenLocation`. The child
 * publishes ONLY the stable canvas inputs (`plugins`, `mapChildren`) back
 * here via `setCanvasState` — anything `viewState`-derived (panel context,
 * selection) stays inside the child so high-frequency updates do not
 * re-render the route shell. The canvas subtree is never unmounted across
 * the world-view → chosen transition (which would otherwise abort an
 * in-flight `flyTo` from `LocationSearch`).
 *
 * Sidebar layout: the sidebar `<div>` slot is rendered by `MapRoute`, but
 * its CONTENT comes from `MapRouteChosenHooks` (which renders the
 * sidebar inline as its return value when chosen) or from a static
 * onboarding card (when not chosen). This keeps panels in the same
 * subtree as the hooks that build their context, eliminating both the
 * 1-tick lag and the parent re-render storm of the previous publish-up
 * approach.
 *
 * Because task 1 hydrates the store inside `beforeLoad` (before this
 * component renders), a deep link such as `/map?lat=...&lng=...` already
 * has the flag set on first paint — the chosen-hooks subtree mounts
 * immediately and the plugin sidebar shows up without flicker.
 */
function MapRoute() {
  const hasUserChosenLocation = useMapStore((s) => s.hasUserChosenLocation)
  // While the user is actively drawing an area polygon, disable
  // doubleClickZoom on both DeckGL's controller AND the underlying
  // Mapbox <Map>. The polygon terminator is a double-click, and without
  // this override the terminator would also zoom the base map in.
  // Subscribed here in the route (not inside `MapRouteChosenHooks`)
  // because the canvas is owned by the route shell.
  //
  // Defensively gated on `hasUserChosenLocation` as a belt-and-braces
  // safety net: the draw hook's unmount/mode-off cleanup forces
  // `areaDrawing=false` on teardown, but gating here guarantees that
  // even if that flag were ever stranded at `true` (e.g. a future
  // refactor moves cleanup elsewhere and drops it), world view cannot
  // inherit a stale draw-in-progress flag and leave `doubleClickZoom`
  // disabled globally with no plugin UI to recover from.
  const areaDrawing = useAnalysisStore((s) => s.areaDrawing)
  const controllerOverride = useMemo(
    () => (hasUserChosenLocation && areaDrawing ? { doubleClickZoom: false } : undefined),
    [hasUserChosenLocation, areaDrawing],
  )
  const [canvasState, setCanvasState] = useState<ChosenCanvasState | null>(null)

  // The sidebar slot is a real DOM node owned by `MapRoute`. When the
  // user has chosen a location, `MapRouteChosenHooks` portals its
  // sidebar JSX (panels + tabs, which depend on `viewState`) into this
  // node. Holding the slot in `useState` (rather than a `ref`) is what
  // forces a re-render of the child once the DOM is mounted, so its
  // first portal render lands on a real container.
  const [sidebarSlot, setSidebarSlot] = useState<HTMLDivElement | null>(null)

  // When the user resets to world view, clear the lifted canvas state so
  // the canvas drops back to `plugins={[]}`. The child component is also
  // unmounted by the conditional render below, which guarantees its
  // hooks (and any of their effects) tear down cleanly.
  useEffect(() => {
    if (!hasUserChosenLocation && canvasState !== null) {
      setCanvasState(null)
    }
  }, [hasUserChosenLocation, canvasState])

  return (
    <div className="flex w-full flex-1 min-h-0">
      {/* Left sidebar slot. Two states (after fn-52 workflow refactor):
            1. Flag false                     -> NOT RENDERED. Search-only
               landing shows the `LocationSearch` overlay from inside
               `MapCanvas` alone; no sidebar chrome at all.
            2. Flag true, canvasState null    -> loading placeholder (parent render)
               (covers the cold-deep-link frame before the ref callback
               populates `sidebarSlot` AND the brief window after the
               child mounts but before its publish-up effect fires
               onCanvasChange)
            3. Flag true, canvasState non-null -> portal content from
               `MapRouteChosenHooks` fills this slot (parent renders
               null, child portals in the plugin tabs + active panel) */}
      {hasUserChosenLocation && (
        <div
          ref={setSidebarSlot}
          className="w-96 flex flex-col bg-background border-r border-border overflow-y-auto"
        >
          {canvasState === null ? <SidebarLoadingPlaceholder /> : null}
        </div>
      )}

      {/* Canvas is always mounted; the `hasUserChosenLocation &&` guards on
          `plugins` / `mapChildren` drop plugin layers in the SAME render as
          the reset flip (the effect clearing `canvasState` only fires post-
          commit). */}
      <div className="flex-1 relative">
        <MapCanvasWithSuspense
          plugins={hasUserChosenLocation ? (canvasState?.plugins ?? []) : []}
          mapChildren={hasUserChosenLocation ? canvasState?.mapChildren : undefined}
          controllerOverride={controllerOverride}
          hiddenBuildingIds={hasUserChosenLocation ? canvasState?.hiddenBuildingIds : undefined}
          placesClient={placesClient}
        />
        {hasUserChosenLocation && canvasState && <LayerControls />}
      </div>

      {/* Plugin-producing hooks live behind a conditional mount. They
          run ONLY after the user has chosen a location, so no buildings
          / analysis fetches fire at world view. The child portals the
          sidebar tabs/panels into `sidebarSlot` and publishes the
          stable canvas inputs (`plugins`, `mapChildren`) via
          `onCanvasChange`. Anything `viewState`-derived stays inside
          the child (no publish-up of `panelContext`). */}
      {hasUserChosenLocation && (
        <MapRouteChosenHooks onCanvasChange={setCanvasState} sidebarContainer={sidebarSlot} />
      )}
    </div>
  )
}

/**
 * Loading placeholder rendered BY THE PARENT (`MapRoute`) into the
 * sidebar slot while `hasUserChosenLocation` is true but the child's
 * `onCanvasChange` effect has not fired yet. Covers both the cold
 * deep-link first frame (before the sidebar slot ref callback
 * populates) and the single commit between the child's mount and its
 * publish-up effect. In practice this is briefly visible on a cold
 * deep-link only; during a warm pick via `LocationSearch`, the child
 * is already mounted and `canvasState` is already populated.
 */
function SidebarLoadingPlaceholder() {
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header skeleton */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <Skeleton className="h-4 w-36" />
      </div>

      {/* General info card skeleton */}
      <div className="px-4 pt-3 pb-2">
        <div className="rounded-md border border-border bg-card p-3 space-y-2.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Weather station skeleton */}
      <div className="px-4 pb-3 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Draw area button skeleton */}
      <div className="px-4 pb-3">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}

interface MapRouteChosenHooksProps {
  /**
   * Stable canvas inputs are pushed up to `MapRoute` here. Only fires
   * when the (memoised) `plugins` array or `mapChildren` node identity
   * actually change — NOT on every `viewState` frame, since neither
   * value depends on `viewState`.
   */
  onCanvasChange: (state: ChosenCanvasState) => void
  /** DOM node owned by `MapRoute` to portal the sidebar tabs/panels into. */
  sidebarContainer: HTMLDivElement | null
}

/**
 * Plugin host. Mounts the plugin composition hook + viewport sync,
 * builds `panelContext` LOCALLY (so high-frequency `viewState` updates
 * stay in this subtree), portals the sidebar tabs/panels into
 * `sidebarContainer`, and publishes only the stable canvas inputs
 * (`plugins`, `mapChildren`) up to `MapRoute` via `onCanvasChange`.
 *
 * Why portals: the canvas must always be mounted (to keep an in-flight
 * `flyTo` from being cancelled), which means the canvas lives in the
 * parent. The sidebar panels need viewState/selection access without
 * making the parent re-render every frame. Portals let us render the
 * sidebar inside this subtree (where viewState reads are scoped) while
 * physically placing the DOM under the sidebar slot in the parent.
 */
function MapRouteChosenHooks({ onCanvasChange, sidebarContainer }: MapRouteChosenHooksProps) {
  const { viewport } = useViewportSync()
  const dragState = useMapStore((s) => s.dragState)
  const viewState = useMapStore((s) => s.viewState)
  const selectedMeshId = useMapStore((s) => s.selectedMeshId)
  const hoveredMeshId = useMapStore((s) => s.hoveredMeshId)
  const isGroundMaterialsActive = useMapStore((s) => s.layers.groundMaterials)
  const queryClient = useQueryClient()

  // --- Plugin composition (delegated to composition module) ---
  const {
    plugins,
    drawProps,
    registry,
    groundMaterialsAreaMutation,
    vegetationMutation,
    analysisTabBody,
  } = useMapPlugins(viewport, dragState)

  // --- Buildings-in-area query state for the WorkflowPanel step gating.
  //
  // The hook lives at the composition layer (NOT inside `WorkflowPanel`)
  // to match the plugin-contract convention that React Query hooks sit
  // at the composition root. The analysis store is the source of truth
  // for `areaPolygon`; we subscribe here and pass the resulting query
  // state into `WorkflowPanel` via `deps.buildingsQueryState`.
  //
  // Mid-draw invariant: `useBuildingsInArea` fetches whenever the polygon
  // passes `isPolygonSafeToFetch`, which only covers *geometric* validity
  // (closed ring, no self-intersections). The "don't fetch while the
  // user is actively dragging the polygon" gate is supplied by the
  // analysis area-draw hook (`packages/primitives/analysis/react/
  // analysis.area-draw-hook.ts`), which only commits `areaPolygon` to
  // the store on `addFeature` / final edit — the in-flight drag state
  // keeps `areaPolygon === null`. Do not remove that invariant without
  // threading `areaDrawing` here and passing `effectivePolygon =
  // areaDrawing ? null : areaPolygon`, mirroring the buildings plugin.
  const { areaPolygon, areaDrawing } = useAnalysisStore(
    useShallow((s) => ({
      areaPolygon: s.areaPolygon,
      areaDrawing: s.areaDrawing,
    })),
  )
  // Defence-in-depth: even though the analysis draw hook only commits
  // `areaPolygon` once the edit is final, we apply the same gate the
  // buildings plugin uses (`polygon: areaDrawing ? null : areaPolygon`)
  // so a future drift in the draw hook cannot accidentally fire a
  // buildings-in-area fetch on every edit keystroke.
  const effectiveAreaPolygon = areaDrawing ? null : areaPolygon
  const buildingsQuery = useBuildingsInArea(effectiveAreaPolygon, sdk)
  const buildingsQueryState = useMemo(
    () => ({
      isLoading: buildingsQuery.isLoading,
      isError: buildingsQuery.isError,
      isSuccess: buildingsQuery.isSuccess,
      refetch: () => {
        buildingsQuery.refetch()
      },
    }),
    [buildingsQuery],
  )

  // Narrow panelContext deps to PRIMITIVE viewState fields, not the full
  // `viewState` object reference. The map store replaces `viewState` on
  // every camera frame during pan/zoom/flyTo, so depending on the object
  // identity would rebuild `panelContext` — and therefore `workflowDeps` —
  // every animation frame.
  const { latitude, longitude, zoom, pitch, bearing } = viewState
  const panelContext: MapPluginContext = useMemo(
    () => ({
      viewport: { latitude, longitude, zoom, pitch, bearing },
      selectedMeshId,
      hoveredMeshId,
      queryClient,
    }),
    [latitude, longitude, zoom, pitch, bearing, selectedMeshId, hoveredMeshId, queryClient],
  )

  const layerLoadersNode = useMemo<ReactNode>(
    () => (
      <LayerLoaders
        polygon={effectiveAreaPolygon}
        groundMaterialsAreaMutation={groundMaterialsAreaMutation}
        vegetationMutation={vegetationMutation}
      />
    ),
    [effectiveAreaPolygon, groundMaterialsAreaMutation, vegetationMutation],
  )

  const workflowDeps = useMemo(
    () => ({
      analysisPanel: analysisTabBody,
      buildingsQueryState,
      layerLoaders: layerLoadersNode,
    }),
    [analysisTabBody, buildingsQueryState, layerLoadersNode],
  )

  // Ground materials DrawControl -- rendered inside the Mapbox <Map>
  // via `mapChildren`. Memoised so the parent receives a stable
  // ReactNode reference; otherwise the publish-up effect below would
  // fire on every render (new JSX object identity) and re-set parent
  // state in a loop.
  const mapChildren = useMemo<ReactNode>(
    () =>
      registry ? (
        <DrawControl
          registry={registry}
          visible={isGroundMaterialsActive}
          onCreate={drawProps.handleCreate}
          onUpdate={drawProps.handleUpdate}
          onDelete={drawProps.handleDelete}
          onSelectionChange={drawProps.handleSelectionChange}
          onActionable={drawProps.handleActionable}
          onModeChange={drawProps.handleModeChange}
        />
      ) : null,
    [registry, isGroundMaterialsActive, drawProps],
  )

  // Extract building IDs from the query to filter Mapbox's fill-extrusion
  // layer and prevent z-fighting with our custom MergedBuildingsLayer.
  const hiddenBuildingIds = buildingsQuery.data?.buildingIds

  // Publish stable canvas inputs up to `MapRoute`. Deps are
  // intentionally narrow (plugins + mapChildren + hiddenBuildingIds) —
  // none depends on `viewState`, so this effect does not fire on flyTo frames.
  useEffect(() => {
    onCanvasChange({ plugins, mapChildren, hiddenBuildingIds })
  }, [onCanvasChange, plugins, mapChildren, hiddenBuildingIds])

  // On a cold deep-link, the parent's first render mounts this
  // component synchronously, so the ref callback that populates
  // `sidebarContainer` has not yet fired by the time we render here.
  // Bail out for one frame — during that frame the PARENT is already
  // rendering `<SidebarLoadingPlaceholder />` into the slot
  // (conditional on `canvasState === null`), so the sidebar is not
  // blank. On the next render (after the ref fires + our publish-up
  // effect runs) `sidebarContainer` is non-null, `canvasState` is
  // non-null, the parent stops rendering the placeholder, and we
  // portal the real workflow panel into the now-empty slot.
  if (!sidebarContainer) return null

  const sidebarContent = <WorkflowPanel deps={workflowDeps} />

  return createPortal(sidebarContent, sidebarContainer)
}
