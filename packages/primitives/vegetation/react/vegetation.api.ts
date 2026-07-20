import { useMutation } from '@tanstack/react-query'
import booleanValid from '@turf/boolean-valid'
import { kinks } from '@turf/kinks'
import type { Feature, Polygon as GeoJsonPolygon } from 'geojson'
import { filterFeaturesInsidePolygon, stablePolygonKey } from '../core/vegetation.feature-utils'
import { computeOriginFromPolygon } from '../core/vegetation.geo-utils'
import { featuresToDotBimMeshes } from '../core/vegetation.mesh-builder'
import type { DotBimMesh } from '../core/vegetation.sdk-types'
import { useVegetationStore } from './vegetation.store'

/**
 * SDK client shape consumed by the vegetation hooks.
 *
 * Only `getGeoJson` (single whole-AOI fetch) is needed — display meshes are
 * built client-side via `featuresToDotBimMeshes`, and the raw features are
 * forwarded to the analysis run as-is.
 */
export interface VegetationSdkClient {
  vegetation: {
    /** Single whole-AOI fetch (NOT tiled) — one call over the AOI bbox
     *  center+radius instead of the ~100 per-tile fan-out `getArea` does.
     *  Returns a GeoJSON FeatureCollection (features as an array). */
    getGeoJson: (
      lat: number,
      lon: number,
      distance: number,
      source?: string,
    ) => Promise<{ features?: Array<Record<string, unknown>> } | null>
  }
}

export const vegetationKeys = {
  all: ['vegetation'] as const,
  area: (polygon: GeoJsonPolygon | null) =>
    [...vegetationKeys.all, 'area', stablePolygonKey(polygon)] as const,
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

export interface VegetationMeshesResult {
  meshes: DotBimMesh[]
  /** The polygon-cropped SDK feature dict (the analysis-run payload). Returned
   *  alongside `meshes` so a caller that suppresses the store write
   *  (`shouldCommit: () => false`) can still build the full result itself — the
   *  store path needs all three to `setMeshes`. */
  features: Record<string, Record<string, unknown>>
  totalTrees: number
}

/**
 * Variables accepted by `useVegetationMeshesMutation`'s `mutate`: either a
 * bare polygon (legacy) or an object carrying a stale-write guard.
 */
export type VegetationMutationInput =
  | GeoJsonPolygon
  | {
      polygon: GeoJsonPolygon
      /**
       * Stale-write guard, checked AFTER the SDK fetch resolves and BEFORE
       * the (global-singleton) store is written. Return `false` to discard —
       * the consuming app uses this to drop a fetch whose project context
       * changed during the round-trip, so a slow fetch can't overwrite the
       * now-active project's trees. Symmetric with the buildings guard.
       */
      shouldCommit?: () => boolean
    }

/**
 * Explicit-trigger mutation that fetches tree GeoJSON and builds display
 * meshes locally. Writes progress / result / error to
 * `useVegetationStore`.
 *
 * Invoke via `mutation.mutate(polygon)` or `mutation.mutate({ polygon,
 * shouldCommit })` from the app's "Load trees" button.
 */
export function useVegetationMeshesMutation(sdkClient: VegetationSdkClient) {
  return useMutation({
    mutationFn: async (input: VegetationMutationInput): Promise<VegetationMeshesResult> => {
      const polygon = 'polygon' in input ? input.polygon : input
      const shouldCommit = 'polygon' in input ? input.shouldCommit : undefined
      if (!isPolygonSafeToFetch(polygon)) {
        throw new Error('Invalid polygon: cannot fetch vegetation')
      }
      const polygonKey = stablePolygonKey(polygon)
      useVegetationStore.getState().setLoading(polygonKey)

      // Whole-AOI single fetch (fgb source) — NOT the tiled `getArea`, which fans
      // out ~100 per-tile calls (the platform's tree-fetch slowness). One
      // getGeoJson over the AOI bbox center+radius, then key the returned array
      // into the id-keyed dict the downstream filter + mesh build expect.
      const ring = (polygon.coordinates?.[0] ?? []) as number[][]
      const lats = ring.map((p) => p[1])
      const lons = ring.map((p) => p[0])
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
      const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2
      const M_PER_DEG = 111_320
      const latSpanM = (Math.max(...lats) - Math.min(...lats)) * M_PER_DEG
      const lonSpanM =
        (Math.max(...lons) - Math.min(...lons)) * M_PER_DEG * Math.cos((centerLat * Math.PI) / 180)
      const distanceM = Math.max(Math.sqrt(latSpanM ** 2 + lonSpanM ** 2) / 2, 363)

      const fc = await sdkClient.vegetation.getGeoJson(centerLat, centerLon, distanceM, 'fgb')
      const rawArr = (fc?.features ?? []) as Array<Record<string, unknown>>
      const areaFeatures: Record<string, Record<string, unknown>> = {}
      rawArr.forEach((f, i) => {
        const props = (f.properties ?? {}) as Record<string, unknown>
        const id = String(f.id ?? props['@id'] ?? props.id ?? i)
        areaFeatures[id] = f
      })

      // Crop to the user polygon (getGeoJson returns a bbox circle, so some
      // trees sit outside it). Process BEFORE the stale-write guard so the FULL
      // result is returned even when the store write is suppressed (the caller
      // may need the data to write its own scenario-keyed slot).
      const insideFeatures = filterFeaturesInsidePolygon(areaFeatures, polygon)
      const featureCount = Object.keys(insideFeatures).length
      // Stale-write guard — see buildings mutation. Skip the (global-singleton)
      // store write if the initiating project context is gone, but still RETURN
      // the processed result so a suppress-and-keep caller can use it.
      const commit = !shouldCommit || shouldCommit()

      if (featureCount === 0) {
        if (commit) useVegetationStore.getState().setMeshes([], {}, 0, polygonKey)
        return { meshes: [], features: {}, totalTrees: 0 }
      }

      const origin = computeOriginFromPolygon(polygon)
      const meshes = featuresToDotBimMeshes(insideFeatures, origin)

      // Sanity-log the first 5 raw feature props so we can spot unit drift
      // (m vs dm vs cm) from the SDK in DevTools without re-running. Cheap
      // — runs once per polygon fetch. `console.debug` is filtered out of
      // prod log surfaces by default (browsers, Workers); upgrade to
      // `console.log` temporarily during a debugging session if needed.
      if (typeof console !== 'undefined') {
        const sample = Object.values(insideFeatures)
          .slice(0, 5)
          .map((f) => (f as { properties?: Record<string, unknown> }).properties ?? {})
        console.debug('[vegetation] fetched', featureCount, 'trees; first 5 props:', sample)
      }

      if (commit) {
        useVegetationStore.getState().setMeshes(meshes, insideFeatures, featureCount, polygonKey)
      }

      return { meshes, features: insideFeatures, totalTrees: featureCount }
    },
    onError: (err) => {
      const message = err instanceof Error && err.message ? err.message : 'Vegetation fetch failed'
      useVegetationStore.getState().setError(message)
    },
  })
}
