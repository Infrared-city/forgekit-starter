import { useMutation, useQuery } from '@tanstack/react-query'
import booleanValid from '@turf/boolean-valid'
import { kinks } from '@turf/kinks'
import type { Feature, Polygon as GeoJsonPolygon } from 'geojson'
import { useEffect, useMemo } from 'react'
import { filterBuildingsByPolygon } from '../core/buildings.mesh-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import type { Viewport } from '../core/buildings.types'
import { useBuildingsStore } from './buildings.store'

export type { Viewport }

/**
 * SDK client interface for buildings data fetching.
 * The composition root provides the SDK's buildings service.
 */
export interface BuildingsSdkClient {
  buildings: {
    getBuildingsInArea: (
      polygon: Record<string, unknown>,
      config?: { maxTilesOverride?: number },
    ) => Promise<{
      buildings: Record<string, unknown>
      buildingIds: number[]
      totalBuildings: number
      executionTime: number
    }>
  }
}

/**
 * Per-consumer fetch options, forwarded to the SDK.
 *
 * `maxTilesOverride` lifts the SDK tiler's default 100 non-empty-tile cap —
 * without it, large drawn areas fail with "Polygon produces N non-empty
 * tiles, exceeding the limit of 100" while every other tiled call site
 * already passes the app's own tile ceiling. Requires an SDK version whose
 * `BuildingsConfig` accepts `maxTilesOverride` (older versions ignore it).
 */
export interface BuildingsFetchOptions {
  maxTilesOverride?: number
}

/**
 * @deprecated Use BuildingsSdkClient instead
 */
export interface BuildingsApiClient {
  post: <T>(path: string, data: unknown) => Promise<T>
}

/** Return type of `useBuildingsInArea` query data. */
export interface BuildingsInAreaData {
  /** Buildings filtered to the polygon — used for visualization (3D extrusion). */
  buildings: Record<string, DotBimMesh>
  buildingIds: number[]
  /** All buildings from the tile-based fetch (unfiltered) — used for analysis
   *  so edge tiles that extend beyond the polygon still have mesh data. */
  allBuildings: Record<string, DotBimMesh>
}

/**
 * Produces a stable, canonical query-key fragment from a GeoJSON polygon.
 *
 * Two deep-equal polygons with different object identities must produce the
 * same key so React Query deduplicates their observers. We serialise only the
 * `coordinates` array (the `type` is always `'Polygon'` and the bbox/crs
 * fields are ignored for cache identity).
 */
export function stablePolygonKey(polygon: GeoJsonPolygon | null): string {
  return JSON.stringify(polygon?.coordinates ?? null)
}

/**
 * Returns true iff `polygon` is a well-formed closed linear ring that is
 * safe to send to `/infrared/buildings/area`.
 *
 * Guards against:
 *  - null / non-polygon inputs
 *  - open rings (fewer than 4 coordinates in the outer ring)
 *  - self-intersections (bowtie shapes) via a belt-and-braces
 *    `@turf/boolean-valid` + `@turf/kinks` check. We use both because
 *    `booleanValid` (as of turf 7.x) does not detect self-intersection
 *    on the outer ring of a single `Polygon` — it only checks ring
 *    closure, spikes/punctures, and interior-ring intersections — while
 *    `kinks` finds any self-intersection point.
 */
export function isPolygonSafeToFetch(polygon: GeoJsonPolygon | null): polygon is GeoJsonPolygon {
  if (polygon == null) return false
  if (polygon.type !== 'Polygon') return false
  const outerRing = polygon.coordinates?.[0]
  if (!outerRing || outerRing.length < 4) return false
  try {
    const feature: Feature<GeoJsonPolygon> = {
      type: 'Feature',
      properties: {},
      geometry: polygon,
    }
    if (!booleanValid(feature)) return false
    if (kinks(feature).features.length > 0) return false
    return true
  } catch {
    return false
  }
}

/**
 * Query key factory for buildings queries.
 *
 * Only the `area` variant is used by the live code path — the legacy
 * `viewport` factory was removed in fn-52…area.7 along with the
 * deprecated `useInfraredBuildings` hook it supported. Query keys
 * are conventionally prefixed with the literal `'buildings'` string
 * so the analysis invalidation subscription (in
 * `packages/primitives/analysis/react/analysis.invalidation.ts`) can
 * match buildings queries by first-segment equality — that module
 * hard-codes its own prefix and does not import `buildingKeys`.
 */
export const buildingKeys = {
  all: ['buildings'] as const,
  area: (polygon: GeoJsonPolygon | null) =>
    [...buildingKeys.all, 'area', stablePolygonKey(polygon)] as const,
}

/**
 * React Query hook that fetches buildings for a user-drawn polygon.
 *
 * POSTs `{ polygon }` to `/infrared/buildings/area` once the polygon is
 * non-null, has a closed outer ring, and passes the belt-and-braces
 * `@turf/boolean-valid` + `@turf/kinks` validity check. The query key is
 * derived from the canonical JSON of `polygon.coordinates` via
 * {@link stablePolygonKey} so identical polygons dedupe across renders.
 *
 * Both the polygon key and the validity gate are memoised on the stable
 * key so they only re-run when the polygon's geometry actually changes.
 * The plugin re-renders this hook on every hover / selection / layer
 * visibility update, so without memoisation the O(n²) turf checks would
 * run on every frame.
 *
 * This hook is intentionally store-agnostic: the "mid-draw" gate (don't
 * fetch while the user is dragging the polygon) lives at the composition
 * boundary (see `useBuildingsMapPlugin`), not inside the hook itself.
 *
 * @param polygon - GeoJSON Polygon in `[lng, lat]` order, or null
 * @param apiClient - API client for making HTTP requests (injected from app)
 */
/**
 * @deprecated Prefer `useBuildingsMutation` — the explicit-trigger
 *   pattern matches `useVegetationMeshesMutation` and
 *   `useGroundMaterialsAreaMutation`. This `useQuery` variant
 *   auto-fires when polygon is non-null, which bakes a fetch
 *   strategy into the primitive and prevents downstream apps from
 *   owning their own persistence (e.g. warehouse R2). Retained for
 *   `apps/base` until it migrates.
 *
 *   Side-effect note: this hook now mirrors its `data` into the
 *   `useBuildingsStore` data slice on success, so callers that read
 *   buildings from the store (the plugin, `apps/platform`) see the
 *   same data regardless of which fetch hook ran. This makes the
 *   migration boundary thinner.
 */
export function useBuildingsInArea(polygon: GeoJsonPolygon | null, sdkClient: BuildingsSdkClient) {
  // Memoise the stable (canonical-JSON) key on the polygon object
  // identity. The plugin re-renders this hook on every hover / selection
  // / layer-visibility change, so recomputing the JSON.stringify on every
  // render would add avoidable work for large polygons.
  const polygonKey = useMemo(() => stablePolygonKey(polygon), [polygon])

  // Both values below are pure projections of `polygonKey` — the polygon
  // object identity is intentionally not part of these dependencies so
  // that equal-but-new polygon references don't re-run the O(n²) turf
  // checks.
  const queryKey = useMemo(() => [...buildingKeys.all, 'area', polygonKey] as const, [polygonKey])
  const enabled = useMemo(() => isPolygonSafeToFetch(polygon), [polygonKey])

  const query = useQuery({
    queryKey,
    queryFn: () => fetchBuildingsInArea(polygon, sdkClient),
    // Buildings on a given polygon are a deterministic function of
    // the polygon. Once fetched, serve from cache forever (no auto-
    // refetch on mount). Consumers that want freshness invalidate
    // explicitly.
    staleTime: Number.POSITIVE_INFINITY,
    enabled,
  })

  // Mirror query.data into the store so plugin readers + downstream
  // store-based persistence (e.g. apps/platform's warehouse adapter)
  // can rely on a single source of truth. Idempotent — the store
  // setter is keyed by polygonKey.
  const data = query.data
  useEffect(() => {
    if (!data) return
    const ids = data.buildingIds
    useBuildingsStore.getState().setBuildings(data.buildings, data.allBuildings, ids, polygonKey)
  }, [data, polygonKey])

  return query
}

/**
 * Shared fetch + filter helper. Pulled out so both `useBuildingsInArea`
 * (the React Query variant, retained for apps/base back-compat) and
 * `useBuildingsMutation` (the explicit-trigger variant, the new
 * primary API) call the same code path.
 */
export async function fetchBuildingsInArea(
  polygon: GeoJsonPolygon | null,
  sdkClient: BuildingsSdkClient,
  opts?: BuildingsFetchOptions,
): Promise<BuildingsInAreaData> {
  if (!polygon) {
    return { buildings: {}, buildingIds: [], allBuildings: {} }
  }
  const result = await sdkClient.buildings.getBuildingsInArea(
    polygon as unknown as Record<string, unknown>,
    opts?.maxTilesOverride !== undefined ? { maxTilesOverride: opts.maxTilesOverride } : undefined,
  )
  const allBuildings = result.buildings as Record<string, DotBimMesh>

  // Filter to polygon-interior buildings, then derive Mapbox building
  // IDs from the filtered set so the 3D extrusion filter matches
  // exactly the buildings we render.
  const filtered = filterBuildingsByPolygon(allBuildings, polygon)
  const filteredIds: number[] = []
  for (const mesh of Object.values(filtered)) {
    if (typeof mesh.osmId === 'number') filteredIds.push(mesh.osmId)
  }
  return { buildings: filtered, buildingIds: filteredIds, allBuildings }
}

/**
 * Variables accepted by `useBuildingsMutation`'s `mutate`. Either a bare
 * polygon (legacy) or an object carrying a stale-write guard.
 */
export type BuildingsMutationInput =
  | GeoJsonPolygon
  | {
      polygon: GeoJsonPolygon
      /**
       * Stale-write guard, checked AFTER the SDK fetch resolves and BEFORE
       * the (global-singleton) store is written. Return `false` to discard
       * the result. The consuming app passes this to drop a fetch whose
       * project/scenario context changed during the multi-second round-trip:
       * the buildings store has no project id, so a slow fetch resolving
       * after a project switch would otherwise overwrite the now-active
       * project's buildings (or wipe them, once polygon-filtered). Mirrors
       * the post-await re-guard the app uses in its result-prefetch path.
       */
      shouldCommit?: () => boolean
    }

/**
 * Explicit-trigger buildings fetch. Mirrors the shape of
 * `useVegetationMeshesMutation` / `useGroundMaterialsAreaMutation` —
 * the primitive provides the data lane (store + fetch), the consuming
 * app decides WHEN to fire + WHERE to persist.
 *
 * Usage:
 * ```
 * const mutation = useBuildingsMutation(sdk)
 * mutation.mutate(polygon)                          // fires SDK once, writes to store
 * mutation.mutate({ polygon, shouldCommit })        // guarded against project switch
 * ```
 *
 * Persistence is the consumer's call: read store status to decide
 * whether to fire; copy `query.data` to warehouse on success;
 * hydrate the store from warehouse on project open. The mutation
 * does NOT bake a caching strategy in.
 */
export function useBuildingsMutation(sdkClient: BuildingsSdkClient, opts?: BuildingsFetchOptions) {
  return useMutation({
    mutationFn: async (input: BuildingsMutationInput): Promise<BuildingsInAreaData> => {
      const polygon = 'polygon' in input ? input.polygon : input
      const shouldCommit = 'polygon' in input ? input.shouldCommit : undefined
      if (!isPolygonSafeToFetch(polygon)) {
        throw new Error('Invalid polygon: cannot fetch buildings')
      }
      const polygonKey = stablePolygonKey(polygon)
      useBuildingsStore.getState().setLoading(polygonKey)
      try {
        const data = await fetchBuildingsInArea(polygon, sdkClient, opts)
        // Stale-write guard: if the initiating project context is gone (the
        // user switched away during the fetch), discard rather than clobber
        // the now-active project's buildings. The store was cleared on the
        // switch (resetSessionStores → clear()), so skipping the write leaves
        // it correctly empty for the new project.
        if (shouldCommit && !shouldCommit()) {
          return data
        }
        useBuildingsStore
          .getState()
          .setBuildings(data.buildings, data.allBuildings, data.buildingIds, polygonKey)
        return data
      } catch (err) {
        useBuildingsStore.getState().setError(err instanceof Error ? err.message : String(err))
        throw err
      }
    },
  })
}
