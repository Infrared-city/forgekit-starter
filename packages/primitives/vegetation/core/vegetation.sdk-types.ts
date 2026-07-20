/**
 * Vegetation SDK types inlined from `@infrared-city/infrared-sdk-ts`.
 *
 * Re-declared locally so the primitive stays headless-publish-friendly and
 * the `./core` subpath has no SDK runtime dependency.
 */
import { z } from 'zod'

export interface DotBimMesh {
  mesh_id: number
  coordinates: number[]
  indices?: number[]
  /** Per-vertex RGB colors (length = vertexCount * 3, 0-255 range). Optional
   *  — when present the merged geometry exposes a `colors` attribute so the
   *  layer can render trunk vs canopy materials from a single mesh. */
  colors?: number[]
}

export type GeoJsonFeatureCollection = {
  type?: string
  features?: Array<Record<string, unknown>>
  referencePoint?: [number, number]
  [key: string]: unknown
}

export interface AreaVegetation {
  features: Record<string, Record<string, unknown>>
  polygon: unknown
  totalTrees: number
  executionTime: number
}

// ---------------------------------------------------------------------------
// GeoJSON schemas for tree imports (Point-only)
// ---------------------------------------------------------------------------

/**
 * Point geometry with lat/lng coordinate pair. Mirrors the lightweight
 * geometry schemas used in `@forge-kit/ground-materials` to avoid an
 * `@types/geojson` runtime dependency.
 */
const PointGeometrySchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]).rest(z.number()),
})

/**
 * `height` and `crownDiameter` are intentionally typed loosely (`z.unknown()`)
 * at the schema layer. All coercion + range-check + fallback happens later
 * in `processImportedTrees` so that an uncoercible value (e.g.
 * `{ "height": "tall" }`) does NOT cause the file to fail parsing — it
 * silently gets the user-supplied fallback instead. The schema's only job
 * is to gate geometry shape, not numeric correctness.
 */
const TreePropertiesSchema = z
  .object({
    height: z.unknown().optional(),
    crownDiameter: z.unknown().optional(),
  })
  .passthrough()
  .nullable()

const TreeFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: PointGeometrySchema,
  properties: TreePropertiesSchema,
  id: z.union([z.string(), z.number()]).optional(),
})

/**
 * Point-only FeatureCollection schema for tree imports.
 *
 * The schema rejects the whole file when any feature is non-Point (per spec
 * — uniform whole-file reject across materials/trees). Callers use the
 * `geometry-only-points` discriminator below for a clearer error message
 * before falling back to this schema.
 */
export const TreesFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(TreeFeatureSchema),
})

export type TreesFeatureCollection = z.infer<typeof TreesFeatureCollectionSchema>

// ---------------------------------------------------------------------------
// Feature UUID management
// ---------------------------------------------------------------------------

/** UUID v4 validation regex. */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Simple UUID v4 generator with `crypto.randomUUID` fast path. */
function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Assign v4 UUIDs to features that are missing a valid UUID id. Mutates
 * the feature list in place and returns it for chaining.
 *
 * Duplicated from `ground-materials.sdk-types` rather than extracted to a
 * shared package — keeps primitives decoupled per CLAUDE.md.
 */
export function ensureTreeFeatureUuids(
  features: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  for (let i = 0; i < features.length; i++) {
    const feature = features[i]
    if (!feature.id || !UUID_V4_REGEX.test(String(feature.id))) {
      features[i] = { ...feature, id: generateUuidV4() }
    }
  }
  return features
}
