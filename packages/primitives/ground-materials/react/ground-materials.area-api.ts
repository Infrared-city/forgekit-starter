/**
 * SDK area-display mutation for ground materials.
 *
 * Separate from the legacy 501-guarded collect/clean mutations in
 * `ground-materials.api.ts` — this path calls the new
 * `@infrared-city/infrared-sdk-ts` `groundMaterials.getRaw(lat, lon, distance,
 * 'fgb')` (one whole-AOI fetch over the Overture/R2-indexed source, not the
 * tiled Mapbox `getArea` fan-out) and writes the result to
 * `useGroundMaterialsStore.areaLayers` for the deck.gl display layer to
 * consume. Errors are surfaced raw (no 501 wrap).
 */
import { useMutation } from '@tanstack/react-query'
import booleanValid from '@turf/boolean-valid'
import { kinks } from '@turf/kinks'
import type { Feature, Polygon as GeoJsonPolygon } from 'geojson'
import { clipAreaLayersToPolygonChunked } from '../core/ground-materials.area-clip'
import { normalizeSdkAreaLayers } from '../core/ground-materials.area-normalize'
import { GROUND_MATERIAL_REGISTRY } from '../core/ground-materials.sdk-types'
import {
  type MaterialLayers,
  type SdkFeatureCollection,
  useGroundMaterialsStore,
} from './ground-materials.store'

/**
 * Stable canonical key for a GeoJSON polygon. Duplicated locally to avoid
 * cross-primitive coupling.
 */
export function stablePolygonKey(polygon: GeoJsonPolygon | null): string {
  return JSON.stringify(polygon?.coordinates ?? null)
}

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
 * Structural shape of the SDK's `GroundMaterialCleaner` (0.12.2+). Defined
 * locally so the primitive stays free of a hard `@infrared-city/infrared-sdk-ts`
 * dependency — the app injects a concrete cleaner (e.g. a Web Worker bridge).
 */
export interface GroundMaterialCleanerLike {
  // Method (not arrow-property) syntax so params are bivariant — mirrors how
  // the SDK declares `GroundMaterialCleaner.cleanV3`, so a concrete SDK cleaner
  // (whose param is the specific `CleanV3Params`) assigns to this opaque
  // pass-through type. An arrow property would make `unknown` contravariantly
  // reject the SDK's narrower param.
  cleanV3(
    layers: Record<string, SdkFeatureCollection>,
    params: unknown,
  ): Promise<Record<string, SdkFeatureCollection>>
}

/** Optional clean-v3 controls forwarded to `getArea`. */
export interface GroundMaterialsCleanOptions {
  /** Swappable clean-v3 backend. Omit → SDK default (`'remote'` gateway call). */
  cleaner?: GroundMaterialCleanerLike
  /** z-step for local/custom cleaners (ignored by the remote cleaner). */
  zStep?: number
}

/** SDK shape consumed by the area mutation — relevant subset of `InfraredClient`. */
export interface GroundMaterialsSdkClient {
  groundMaterials: {
    /** Single whole-AOI collect (NOT tiled). `source` selects the backend —
     *  we pass 'fgb' (Overture, R2-file-indexed) rather than the SDK default
     *  'mapbox' (live Mapbox tiles). Returns the raw name-keyed layers or null. */
    getRaw: (
      lat: number,
      lon: number,
      distance: number,
      source?: string,
    ) => Promise<Record<string, SdkFeatureCollection> | null>
  }
}

export interface GroundMaterialsAreaResult {
  /** Polygon-clipped layers (the display payload). */
  layers: MaterialLayers
  /** RAW (unclipped) SDK layers — the analysis-run payload + what the
   *  scenario-render slot stores. Returned so a caller that suppresses the
   *  store write (`shouldCommit: () => false`) can still build the full slot. */
  rawLayers: MaterialLayers
  totalFeatures: number
}

/**
 * Variables accepted by `useGroundMaterialsAreaMutation`'s `mutate`: either a
 * bare polygon (legacy) or an object carrying a stale-write guard.
 */
export type GroundMaterialsAreaInput =
  | GeoJsonPolygon
  | {
      polygon: GeoJsonPolygon
      /**
       * Stale-write guard, checked AFTER the SDK fetch resolves and BEFORE
       * the (global-singleton) store is written. Return `false` to discard —
       * drops a fetch whose project context changed during the round-trip.
       * Symmetric with the buildings + vegetation guards.
       */
      shouldCommit?: () => boolean
    }

/**
 * Explicit-trigger mutation. Invoke via `mutation.mutate(polygon)` or
 * `mutation.mutate({ polygon, shouldCommit })` from the app's "Load ground
 * materials" button.
 *
 * `cleanOptions` forwards a swappable clean-v3 backend to the SDK's `getArea`.
 * The platform app passes a Web Worker cleaner so the clean-v3 clip runs off the
 * main thread (no viewport freeze) instead of the slow gateway round-trip. Omit
 * → SDK default (remote gateway clean). Pass a STABLE cleaner reference (module
 * singleton / `useMemo`) to avoid re-creating the worker path per render.
 */
export function useGroundMaterialsAreaMutation(
  sdkClient: GroundMaterialsSdkClient,
  cleanOptions?: GroundMaterialsCleanOptions,
) {
  return useMutation({
    mutationFn: async (input: GroundMaterialsAreaInput): Promise<GroundMaterialsAreaResult> => {
      const polygon = 'polygon' in input ? input.polygon : input
      const shouldCommit = 'polygon' in input ? input.shouldCommit : undefined
      if (!isPolygonSafeToFetch(polygon)) {
        throw new Error('Invalid polygon: cannot fetch ground materials')
      }
      const polygonKey = stablePolygonKey(polygon)
      useGroundMaterialsStore.getState().setAreaLoading(polygonKey)

      // Whole-AOI fetch via the 'fgb' (Overture) source — NOT the tiled getArea,
      // which fans out ~100 per-tile calls to the SDK-default 'mapbox' backend
      // (the platform's ground-materials slowness + 504s). One getRaw over the
      // AOI bbox center+radius replaces the fan-out and hits the R2 file-index.
      // Then run the SAME clean-v3 the tiled getArea runs internally (reuse the
      // injected Web Worker cleaner) so the material output is unchanged.
      const ring = (polygon.coordinates?.[0] ?? []) as number[][]
      const lats = ring.map((p) => p[1])
      const lons = ring.map((p) => p[0])
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
      const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2
      const M_PER_DEG = 111_320
      const latSpanM = (Math.max(...lats) - Math.min(...lats)) * M_PER_DEG
      const lonSpanM =
        (Math.max(...lons) - Math.min(...lons)) * M_PER_DEG * Math.cos((centerLat * Math.PI) / 180)
      // Half the bbox diagonal, floored at one SDK tile radius (mirrors getArea).
      const distanceM = Math.max(Math.sqrt(latSpanM ** 2 + lonSpanM ** 2) / 2, 363)

      const raw = await sdkClient.groundMaterials.getRaw(centerLat, centerLon, distanceM, 'fgb')
      // Process BEFORE the stale-write guard so the FULL result is returned even
      // when the store write is suppressed (a suppress-and-keep caller needs
      // `rawLayers` to build its own scenario-keyed slot).
      let rawLayers = (raw ?? {}) as MaterialLayers
      // Clean-v3 off the main thread via the injected worker cleaner (same params
      // getArea uses). Best-effort — on failure keep the uncleaned layers.
      if (cleanOptions?.cleaner && Object.keys(rawLayers).length > 0) {
        try {
          const cleaned = await cleanOptions.cleaner.cleanV3(
            rawLayers as unknown as Record<string, SdkFeatureCollection>,
            {
              latitude: centerLat,
              longitude: centerLon,
              distance: distanceM,
              zStep: cleanOptions.zStep,
            },
          )
          if (cleaned && Object.keys(cleaned).length > 0) rawLayers = cleaned as MaterialLayers
        } catch {
          // keep uncleaned rawLayers
        }
      }
      // Stale-write guard — see buildings mutation. Skip the global-singleton
      // store write if the initiating project context is gone.
      const commit = !shouldCommit || shouldCommit()

      // The whole-AOI `@turf/intersect` clip (`clipAreaLayersToPolygonChunked`)
      // is ONLY needed to build the DISPLAY layers written by `setAreaLayers`.
      // The suppress-and-keep site-context caller (`shouldCommit: () => false`)
      // discards the returned `layers` and persists `rawLayers` only — the
      // render bridge (`apply-materials-to-store`) re-derives AND re-clips the
      // display from `rawAreaLayers` itself. Running the clip here in that case
      // was a full DUPLICATE whole-AOI intersect pass, thrown away — the
      // dominant client cost on large Overture-geometry AOIs (one `@turf/intersect`
      // per feature over district-scale polygons). Only clip when we actually
      // commit the display store; otherwise skip it and let the bridge own the
      // single clip.
      let clipped: MaterialLayers = {}
      let totalFeatures: number
      if (commit) {
        const normalized = normalizeSdkAreaLayers(
          rawLayers,
          GROUND_MATERIAL_REGISTRY,
        ) as MaterialLayers
        // Trim every feature back to the user polygon — the whole-AOI fetch
        // returns a bbox circle that bleeds past the outline, and MaskExtension
        // is unreliable under interleaved MapboxOverlay. Display path only;
        // `rawLayers` stays the full payload for the analysis run.
        clipped = ((await clipAreaLayersToPolygonChunked(normalized, polygon)) ??
          {}) as MaterialLayers
        // totalFeatures reflects the display (clipped) count the user sees.
        totalFeatures = Object.values(clipped).reduce(
          (sum, fc) => sum + (fc.features?.length ?? 0),
          0,
        )
        useGroundMaterialsStore
          .getState()
          .setAreaLayers(clipped, rawLayers, totalFeatures, polygonKey)
      } else {
        // Suppressed: the caller writes `rawAreaLayers` into its scenario slot
        // and the render bridge owns the single clip. Report the raw count.
        totalFeatures = Object.values(rawLayers).reduce(
          (sum, fc) => sum + (fc.features?.length ?? 0),
          0,
        )
      }

      return { layers: clipped, rawLayers, totalFeatures }
    },
    onError: (err) => {
      const message =
        err instanceof Error && err.message ? err.message : 'Ground materials fetch failed'
      useGroundMaterialsStore.getState().setAreaError(message)
    },
  })
}
