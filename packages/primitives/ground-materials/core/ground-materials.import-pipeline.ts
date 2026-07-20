import { flatten } from '@turf/flatten'
import { featureCollection } from '@turf/helpers'
import { intersect } from '@turf/intersect'
import { kinks } from '@turf/kinks'
import type {
  Feature,
  FeatureCollection as GeoJsonFeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson'
import type { FeatureCollection as SdkFeatureCollection } from './ground-materials.sdk-types'
import { filterPolygonFeatures } from './ground-materials.sdk-types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of polygons after splitting MultiPolygons. */
export const MAX_POLYGON_COUNT = 500

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PipelineCounts {
  filteredNonPolygonCount: number
  outsideBoundaryCount: number
  invalidCount: number
  /** Number of polygons truncated due to the maxCount limit. */
  truncatedCount: number
  /** Total polygon count after flatten, BEFORE truncation. */
  flattenedTotal: number
}

export interface PipelineResult {
  features: Feature<Polygon>[]
  counts: PipelineCounts
}

// ---------------------------------------------------------------------------
// runImportPipeline
// ---------------------------------------------------------------------------

/**
 * Run the shared filter → flatten → clip → kinks-mark pipeline on a single
 * FeatureCollection against a pre-built boundary polygon.
 *
 * Pure: does not mutate inputs, does not assign UUIDs (the caller does that
 * once at the end so multi-group callers can keep ordering deterministic).
 *
 * `@turf/flatten` copies the PARENT feature's `properties` to every child —
 * callers that need per-feature provenance (e.g. multi-material material
 * injection) must mutate parent properties BEFORE invoking this function.
 *
 * @param fc - Input FeatureCollection (mixed geometry types allowed; non-polygons filtered)
 * @param boundaryPolygon - Pre-built boundary polygon for clipping
 * @param maxCount - Maximum polygons to keep after flatten (excess dropped silently)
 */
export function runImportPipeline(
  fc: GeoJsonFeatureCollection,
  boundaryPolygon: Feature<Polygon>,
  maxCount: number,
): PipelineResult {
  // Step 1: Filter non-polygon features
  const { filteredFeatures, invalidFeaturesCount: filteredNonPolygonCount } = filterPolygonFeatures(
    fc as unknown as SdkFeatureCollection,
  )
  const polygonFc = filteredFeatures as unknown as GeoJsonFeatureCollection

  // Step 2: Split MultiPolygons via @turf/flatten
  const flattened = flatten(polygonFc as GeoJsonFeatureCollection<Polygon | MultiPolygon>)
  const flattenedTotal = flattened.features.length

  // Step 3: Enforce polygon count limit
  let truncatedCount = 0
  if (flattened.features.length > maxCount) {
    truncatedCount = flattened.features.length - maxCount
    flattened.features = flattened.features.slice(0, maxCount)
  }

  // Step 4: Clip to boundary
  const clippedFeatures: Feature<Polygon>[] = []
  let outsideBoundaryCount = 0

  for (const feature of flattened.features) {
    try {
      const clipped = intersect(featureCollection([feature as Feature<Polygon>, boundaryPolygon]))

      if (clipped === null) {
        outsideBoundaryCount++
        continue
      }

      // Preserve original properties (incl. injected material) on the clipped feature
      clippedFeatures.push({
        ...clipped,
        properties: { ...(feature.properties ?? {}) },
      } as Feature<Polygon>)
    } catch {
      // If intersection fails (e.g., degenerate geometry), skip the feature
      outsideBoundaryCount++
    }
  }

  // Step 5: Mark self-intersecting polygons as invalid (kept, not dropped)
  let invalidCount = 0
  for (const feature of clippedFeatures) {
    try {
      const result = kinks(feature as unknown as Feature<Polygon>)
      if (result.features.length > 0) {
        feature.properties = { ...(feature.properties ?? {}), invalid: true }
        invalidCount++
      }
    } catch {
      feature.properties = { ...(feature.properties ?? {}), invalid: true }
      invalidCount++
    }
  }

  return {
    features: clippedFeatures,
    counts: {
      filteredNonPolygonCount,
      outsideBoundaryCount,
      invalidCount,
      truncatedCount,
      flattenedTotal,
    },
  }
}
