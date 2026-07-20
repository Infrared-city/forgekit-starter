import type { Feature, Polygon as GeoJsonPolygon } from 'geojson'
import { filterFeaturesInsidePolygon } from './vegetation.feature-utils'
import type { TreesFeatureCollection } from './vegetation.sdk-types'
import { ensureTreeFeatureUuids, TreesFeatureCollectionSchema } from './vegetation.sdk-types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum file size in bytes (5 MB) — matches ground-materials parser. */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

/** Valid input ranges (metres). Must stay in lock-step with the same
 * constants in `vegetation.mesh-builder.ts` so per-feature mesh sizing and
 * import-time fallback agree on what counts as "out of range". */
const HEIGHT_RANGE: readonly [number, number] = [1, 30]
const CROWN_DIAMETER_RANGE: readonly [number, number] = [1, 20]

/** Max number of imported trees retained after the polygon clip. Excess
 * features are dropped with a warning. */
export const MAX_TREE_COUNT = 500

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TreeParseSuccess {
  ok: true
  featureCollection: TreesFeatureCollection
}

export interface TreeParseError {
  ok: false
  error: string
}

export type TreeParseResult = TreeParseSuccess | TreeParseError

export interface TreeFallback {
  height: number
  crownDiameter: number
}

export interface ProcessTreesResult {
  /** Imported tree features, ready to merge into `useVegetationStore.features`.
   *  Each feature has a freshly-assigned UUID id when one wasn't present. */
  features: Array<Record<string, unknown>>
  /** Human-readable warnings to surface to the user. */
  warnings: string[]
  /** Features dropped because their Point fell outside the polygon. */
  droppedOutsideCount: number
  /** Features whose `height` or `crownDiameter` was replaced by the
   *  user-supplied fallback (missing, uncoercible, or out-of-range). */
  fallbackAppliedCount: number
  /** Schema-invalid feature count. The parser already rejects mixed-
   *  geometry files wholesale, so this is reserved for future per-feature
   *  schema failures and is always `0` today. */
  invalidCount: number
}

// ---------------------------------------------------------------------------
// parseTreesGeoJson
// ---------------------------------------------------------------------------

/**
 * Parse a tree-import GeoJSON file into a validated, Point-only
 * `TreesFeatureCollection`. Mirrors `parseGeoJsonFile` in ground-materials:
 *
 * - Enforces a 5 MB file-size cap.
 * - Wraps bare `Feature` and bare `Geometry` roots before validation.
 * - Rejects non-`FeatureCollection` roots and any file containing a non-
 *   Point feature with a friendly, geometry-aware error (whole-file reject
 *   per spec).
 */
export async function parseTreesGeoJson(file: File): Promise<TreeParseResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
    }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { ok: false, error: 'Failed to read file.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Invalid JSON. Please upload a valid GeoJSON file.' }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'File content is not a valid GeoJSON object.' }
  }

  const obj = parsed as Record<string, unknown>

  // Wrap a bare Geometry into a single-feature collection. Anything other
  // than a Point geometry is rejected here so the user sees a precise
  // error before generic schema validation runs.
  if (obj.type && obj.type !== 'Feature' && obj.type !== 'FeatureCollection' && obj.coordinates) {
    if (obj.type !== 'Point') {
      return {
        ok: false,
        error: `Tree imports must be Point geometries. Got '${String(obj.type)}'.`,
      }
    }
    return validateTrees({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: obj, properties: {} }],
    })
  }

  if (obj.type === 'Feature') {
    return validateTrees({
      type: 'FeatureCollection',
      features: [obj],
    })
  }

  if (obj.type !== 'FeatureCollection') {
    return {
      ok: false,
      error: 'Not a valid GeoJSON FeatureCollection. Please check the file format.',
    }
  }

  return validateTrees(obj)
}

/**
 * Validate a raw object against `TreesFeatureCollectionSchema`. Before
 * surrendering to Zod we scan for a non-Point feature so the error message
 * can name the offending geometry type — much friendlier than the default
 * "Invalid input" Zod produces for discriminated literal failures.
 */
function validateTrees(raw: unknown): TreeParseResult {
  const fc = raw as { type?: unknown; features?: unknown }
  if (Array.isArray(fc.features)) {
    for (const feature of fc.features) {
      if (!feature || typeof feature !== 'object') continue
      const geom = (feature as { geometry?: { type?: unknown } }).geometry
      const geomType = geom?.type
      if (typeof geomType === 'string' && geomType !== 'Point') {
        return {
          ok: false,
          error: `Tree imports must contain only Point features. Found '${geomType}'.`,
        }
      }
    }
  }

  const result = TreesFeatureCollectionSchema.safeParse(raw)
  if (!result.success) {
    return {
      ok: false,
      error: 'Not a valid GeoJSON FeatureCollection of Point features.',
    }
  }

  if (result.data.features.length === 0) {
    return {
      ok: false,
      error: 'GeoJSON file contains no features.',
    }
  }

  return { ok: true, featureCollection: result.data }
}

// ---------------------------------------------------------------------------
// needsFallbackPrompt
// ---------------------------------------------------------------------------

/**
 * Return `true` when any feature has a missing / non-finite / out-of-range
 * `height` or `crownDiameter`. The UI uses this to decide whether to show
 * the fallback prompt BEFORE invoking `processImportedTrees`.
 *
 * Strings like `"5.2"` are accepted via `Number()` coercion — matches the
 * coercion the schema applies, so the prompt and the pipeline always agree
 * on what counts as "needs fallback".
 */
export function needsFallbackPrompt(fc: TreesFeatureCollection): boolean {
  for (const feature of fc.features) {
    const props = feature.properties ?? {}
    if (!isInRange(props.height, HEIGHT_RANGE)) return true
    if (!isInRange(props.crownDiameter, CROWN_DIAMETER_RANGE)) return true
  }
  return false
}

function coerceFinite(raw: unknown): number | null {
  if (raw == null) return null
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return null
  return n
}

function isInRange(raw: unknown, range: readonly [number, number]): boolean {
  const n = coerceFinite(raw)
  if (n == null) return false
  return n >= range[0] && n <= range[1]
}

// ---------------------------------------------------------------------------
// processImportedTrees
// ---------------------------------------------------------------------------

/**
 * Run the import pipeline on a parsed tree FeatureCollection:
 *
 * 1. Per feature, coerce `height` / `crownDiameter`. If either is missing,
 *    uncoercible, or out-of-range, replace BOTH with the user-supplied
 *    fallback values and count the feature as `fallbackApplied`. Replacing
 *    both keeps tree proportions intact (the mesh builder ties canopy
 *    height to trunk height through a single ratio).
 * 2. Clip to the user polygon via `filterFeaturesInsidePolygon`. Features
 *    whose Point sits outside are dropped and counted.
 * 3. Cap at `MAX_TREE_COUNT` post-clip with a warning. The cap runs after
 *    the clip so the user gets credit for clipping work done.
 * 4. Assign UUIDs to features missing a valid v4 id (callers can then
 *    `Object.fromEntries(features.map(f => [f.id, f]))` to merge into
 *    `useVegetationStore.features`).
 */
export function processImportedTrees(
  fc: TreesFeatureCollection,
  polygon: GeoJsonPolygon | Feature<GeoJsonPolygon>,
  fallback: TreeFallback,
): ProcessTreesResult {
  const warnings: string[] = []
  let fallbackAppliedCount = 0

  // Step 1: coerce + fallback per feature
  const coerced: Array<Record<string, unknown>> = fc.features.map((feature) => {
    const props = (feature.properties ?? {}) as Record<string, unknown>
    const height = coerceFinite(props.height)
    const crownDiameter = coerceFinite(props.crownDiameter)

    const heightInRange = height != null && height >= HEIGHT_RANGE[0] && height <= HEIGHT_RANGE[1]
    const diameterInRange =
      crownDiameter != null &&
      crownDiameter >= CROWN_DIAMETER_RANGE[0] &&
      crownDiameter <= CROWN_DIAMETER_RANGE[1]

    if (heightInRange && diameterInRange) {
      // Use coerced numeric values (in case original was a string).
      return {
        ...feature,
        properties: { ...props, height, crownDiameter },
      }
    }

    fallbackAppliedCount++
    return {
      ...feature,
      properties: {
        ...props,
        height: fallback.height,
        crownDiameter: fallback.crownDiameter,
      },
    }
  })

  if (fallbackAppliedCount > 0) {
    warnings.push(
      `${fallbackAppliedCount} tree${fallbackAppliedCount > 1 ? 's' : ''} used fallback height/crownDiameter values.`,
    )
  }

  // Step 2: clip to polygon. `filterFeaturesInsidePolygon` operates on the
  // dict shape, so we route through `Object.fromEntries` keyed by array
  // index. The dict ordering is preserved by `Object.values` in modern V8.
  const beforeClip = coerced.length
  const polygonGeometry: GeoJsonPolygon = 'geometry' in polygon ? polygon.geometry : polygon

  const indexedDict: Record<string, Record<string, unknown>> = {}
  for (let i = 0; i < coerced.length; i++) {
    indexedDict[String(i)] = coerced[i]
  }
  const insideDict = filterFeaturesInsidePolygon(indexedDict, polygonGeometry)
  const insideFeatures = Object.values(insideDict)
  const droppedOutsideCount = beforeClip - insideFeatures.length

  if (droppedOutsideCount > 0) {
    warnings.push(
      `${droppedOutsideCount} tree${droppedOutsideCount > 1 ? 's' : ''} outside the analysis polygon ${droppedOutsideCount > 1 ? 'were' : 'was'} dropped.`,
    )
  }

  if (insideFeatures.length === 0) {
    return {
      features: [],
      warnings: droppedOutsideCount > 0 ? warnings : ['No trees intersect the analysis polygon.'],
      droppedOutsideCount,
      fallbackAppliedCount,
      invalidCount: 0,
    }
  }

  // Step 3: cap at MAX_TREE_COUNT post-clip
  let capped = insideFeatures
  if (capped.length > MAX_TREE_COUNT) {
    const truncated = capped.length - MAX_TREE_COUNT
    capped = capped.slice(0, MAX_TREE_COUNT)
    warnings.push(
      `File contains ${insideFeatures.length} trees inside the polygon. Only the first ${MAX_TREE_COUNT} were imported (${truncated} dropped).`,
    )
  }

  // Step 4: assign UUIDs (mutates `capped` entries in place to swap in id).
  ensureTreeFeatureUuids(capped)

  return {
    features: capped,
    warnings,
    droppedOutsideCount,
    fallbackAppliedCount,
    invalidCount: 0,
  }
}
