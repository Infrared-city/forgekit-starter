import type { Feature, FeatureCollection as GeoJsonFeatureCollection, Polygon } from 'geojson'
import { MAX_POLYGON_COUNT, runImportPipeline } from './ground-materials.import-pipeline'
import { buildBoundaryPolygon } from './ground-materials.import-utils'
import type { FeatureCollection as SdkFeatureCollection } from './ground-materials.sdk-types'
import { ensureFeatureUuids, MultiMaterialImportSchema } from './ground-materials.sdk-types'
import type { GroundMaterialsViewport, MetersToLatLngFn } from './ground-materials.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GroupStats {
  /** Features in the group BEFORE any filtering (post-schema validation). */
  in: number
  /** Features in the group AFTER filter/flatten/clip (i.e. kept in output). */
  out: number
}

export interface MultiMaterialProcessResult {
  /** Combined output features across all groups. */
  features: GeoJsonFeatureCollection
  /** Aggregated warnings across all groups (group-prefixed). */
  warnings: string[]
  /** Total number of self-intersecting (invalid) polygons across groups. */
  invalidCount: number
  /** Per-group input/output counts, keyed by material name. */
  groupStats: Record<string, GroupStats>
}

// ---------------------------------------------------------------------------
// processMultiMaterialImport
// ---------------------------------------------------------------------------

/**
 * Process a multi-material dict shape `{ materialName: FeatureCollection, ... }`.
 *
 * Each group's features get `properties.material = <groupKey>` injected on
 * the PARENT feature before any pipeline step. `@turf/flatten` then copies
 * those parent properties to every MultiPolygon child, preserving group
 * provenance through the rest of the pipeline (the clip step also preserves
 * the source feature's properties, see `runImportPipeline`).
 *
 * Behaviour:
 * - Root must validate as `MultiMaterialImportSchema`. A bare
 *   `FeatureCollection`, plain object with non-FC values, array, or primitive
 *   root is rejected with a friendly error (returned via the warnings array
 *   and an empty output — the caller is expected to gate the toggle).
 * - JSON last-wins is acceptable for duplicate keys at the JSON layer (the
 *   parser collapses duplicates before this function ever sees them). No
 *   pre-parse detection is attempted — documented in tests.
 * - Empty groups (FC with zero features) → group-prefixed warning, dropped
 *   from output silently.
 * - The MAX_POLYGON_COUNT limit applies to the AGGREGATE output across all
 *   groups, not per-group. Groups are processed in object iteration order
 *   and later groups are truncated first when the limit is hit.
 *
 * @param rawObject - The parsed JSON root (unknown shape).
 * @param boundary - Geographic viewport for clipping.
 * @param metersToLatLng - Conversion function injected from the map interface.
 */
export function processMultiMaterialImport(
  rawObject: unknown,
  boundary: GroundMaterialsViewport,
  metersToLatLng: MetersToLatLngFn,
): MultiMaterialProcessResult {
  // Friendlier error when the user toggled "multi-material" but uploaded a
  // single FeatureCollection — common UX mistake worth calling out.
  if (
    typeof rawObject === 'object' &&
    rawObject !== null &&
    (rawObject as { type?: unknown }).type === 'FeatureCollection'
  ) {
    return {
      features: { type: 'FeatureCollection', features: [] },
      warnings: [
        'Expected a multi-material object (e.g. { "asphalt": FeatureCollection, ... }) but got a single FeatureCollection. Switch the upload toggle to single-material mode.',
      ],
      invalidCount: 0,
      groupStats: {},
    }
  }

  const parsed = MultiMaterialImportSchema.safeParse(rawObject)
  if (!parsed.success) {
    return {
      features: { type: 'FeatureCollection', features: [] },
      warnings: [
        'Not a valid multi-material object. Expected `{ materialName: FeatureCollection, ... }`.',
      ],
      invalidCount: 0,
      groupStats: {},
    }
  }

  const boundaryPolygon = buildBoundaryPolygon(boundary, metersToLatLng)
  const warnings: string[] = []
  const groupStats: Record<string, GroupStats> = {}
  const allClipped: Feature<Polygon>[] = []
  let totalInvalid = 0
  let remainingBudget = MAX_POLYGON_COUNT
  let truncated = false

  for (const [groupKey, rawFc] of Object.entries(parsed.data)) {
    const inCount = rawFc.features.length
    groupStats[groupKey] = { in: inCount, out: 0 }

    if (inCount === 0) {
      warnings.push(`Group "${groupKey}": empty FeatureCollection — skipped.`)
      continue
    }

    // Inject `material` onto every PARENT feature before the pipeline.
    // `@turf/flatten` copies properties to MultiPolygon children, so each
    // resulting child keeps the correct group provenance.
    const labeledFc: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: rawFc.features.map((f) => ({
        ...(f as Feature),
        properties: { ...((f as Feature).properties ?? {}), material: groupKey },
      })) as Feature[],
    }

    const { features: clipped, counts } = runImportPipeline(
      labeledFc,
      boundaryPolygon,
      remainingBudget,
    )

    if (counts.filteredNonPolygonCount > 0) {
      warnings.push(
        `Group "${groupKey}": ${counts.filteredNonPolygonCount} non-polygon feature${counts.filteredNonPolygonCount > 1 ? 's' : ''} filtered out.`,
      )
    }
    if (counts.outsideBoundaryCount > 0) {
      warnings.push(
        `Group "${groupKey}": ${counts.outsideBoundaryCount} polygon${counts.outsideBoundaryCount > 1 ? 's' : ''} outside the project boundary were removed.`,
      )
    }
    if (counts.invalidCount > 0) {
      warnings.push(
        `Group "${groupKey}": ${counts.invalidCount} self-intersecting polygon${counts.invalidCount > 1 ? 's' : ''} detected (marked as invalid).`,
      )
    }
    if (counts.truncatedCount > 0) {
      truncated = true
    }

    groupStats[groupKey].out = clipped.length
    totalInvalid += counts.invalidCount
    allClipped.push(...clipped)
    // Decrement the aggregate budget by polygons ADMITTED past flatten/truncation
    // — i.e. the polygons the pipeline actually had to clip/kink-check — not by
    // `clipped.length`. Otherwise a group whose polygons all clip outside the
    // boundary would consume 0 budget and let later groups bypass the cap.
    const admittedAfterFlatten = counts.flattenedTotal - counts.truncatedCount
    remainingBudget = Math.max(0, remainingBudget - admittedAfterFlatten)
  }

  if (truncated) {
    warnings.push(
      `Total polygons exceeded the ${MAX_POLYGON_COUNT}-feature limit; later groups were truncated.`,
    )
  }

  if (allClipped.length === 0) {
    return {
      features: { type: 'FeatureCollection', features: [] },
      warnings: warnings.length > 0 ? warnings : ['No polygons intersect the project boundary.'],
      invalidCount: 0,
      groupStats,
    }
  }

  const resultFc: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features: allClipped,
  }
  const withUuids = ensureFeatureUuids(resultFc as unknown as SdkFeatureCollection)

  return {
    features: withUuids as unknown as GeoJsonFeatureCollection,
    warnings,
    invalidCount: totalInvalid,
    groupStats,
  }
}
