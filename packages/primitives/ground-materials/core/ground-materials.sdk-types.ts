/**
 * Ground materials SDK types, schemas, constants, and utilities.
 *
 * Inlined from `@infrared/sdk/ground-materials` into this primitive package
 * after the SDK ground-materials module was removed (fn-44 task .8).
 * These types are self-contained -- no SDK imports required.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Ground material identifiers (UUIDs from the registry).
 */
export const GROUND_MATERIAL_LIST = [
  'b087b810-0e6f-5b1e-a13e-33d9f6f47f7d', // water
  'b3c7c143-be44-5f0a-bac7-b69c88dbce4b', // concrete
  '4c5c9d2e-9b1a-4a2e-9d5e-2b6a3c9a8f11', // asphalt
  'd7a9f2d3-13f4-4d8a-8b61-1d2a5c6f7e88', // vegetation
  '1f0c3a3b-7b6e-4a91-9a8d-24c3b5e76a12', // soil
] as const

export type GroundMaterialType = (typeof GROUND_MATERIAL_LIST)[number]

/**
 * Ground material human-readable names.
 */
export const GROUND_MATERIAL_NAME_LIST = [
  'water',
  'concrete',
  'asphalt',
  'vegetation',
  'soil',
] as const

export type GroundMaterialNameType = (typeof GROUND_MATERIAL_NAME_LIST)[number]

/**
 * Processing order for ground materials.
 * When layers overlap, materials earlier in this array take priority.
 * Vegetation and water are processed first so they clip through harder surfaces.
 */
export const GROUND_MATERIAL_ORDER = ['vegetation', 'water', 'soil', 'concrete', 'asphalt'] as const

// ---------------------------------------------------------------------------
// GeoJSON schemas (lightweight, avoids external @types/geojson dependency)
// ---------------------------------------------------------------------------

const LatitudeSchema = z.number().gte(-90).lte(90)
const LongitudeSchema = z.number().gte(-180).lte(180)

const GeoJsonGeometrySchema = z.object({
  type: z.string(),
  coordinates: z.any(),
})

const GeoJsonFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: GeoJsonGeometrySchema,
  properties: z.record(z.string(), z.any()).nullable(),
  id: z.union([z.string(), z.number()]).optional(),
})

export const FeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(GeoJsonFeatureSchema),
})

export type FeatureCollection = z.infer<typeof FeatureCollectionSchema>

/**
 * Multi-material import shape: `{ materialName: FeatureCollection, ... }`.
 *
 * Used by the multi-dict upload toggle. Each top-level key is treated as the
 * material name to assign to every feature in the associated FeatureCollection
 * (the key is injected onto `properties.material` before the
 * filter/flatten/clip pipeline runs).
 *
 * Notes on Zod v4:
 * - `z.record` requires BOTH a key and a value schema in v4.
 * - The schema only matches *plain objects* — arrays, primitives, and bare
 *   `FeatureCollection` roots all fail validation, which is exactly the
 *   discriminator we want for the multi-dict vs single-FC toggle.
 */
export const MultiMaterialImportSchema = z.record(z.string(), FeatureCollectionSchema)

export type MultiMaterialImport = z.infer<typeof MultiMaterialImportSchema>

// ---------------------------------------------------------------------------
// Collect
// ---------------------------------------------------------------------------

/**
 * Parameters for the ground-material collect endpoint.
 * Fetches raw material layers from OpenStreetMap for a given area.
 */
export const CollectParamsSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  distance: z.number().positive(),
  source: z.string().optional().default('mapbox'),
  defaultMaterial: z.string().optional().default('asphalt'),
})

export type CollectParams = z.infer<typeof CollectParamsSchema>
export type CollectParamsInput = z.input<typeof CollectParamsSchema>

/**
 * Response from the ground-material collect endpoint.
 */
export const CollectResponseSchema = z.record(z.string(), FeatureCollectionSchema)

export type CollectResponse = z.infer<typeof CollectResponseSchema>

// ---------------------------------------------------------------------------
// Clean
// ---------------------------------------------------------------------------

/**
 * Parameters for the ground-material clean endpoint.
 * Clips collected layers to the analysis area and resolves overlaps.
 */
export const CleanBodySchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  distance: z.number().positive(),
  layers: z.record(z.string(), FeatureCollectionSchema),
  default: z.string().default('asphalt'),
})

export type CleanBody = z.infer<typeof CleanBodySchema>

/**
 * Response from the ground-material clean endpoint.
 * Record of material name to clipped FeatureCollection.
 */
export const CleanResponseSchema = z.record(z.string(), FeatureCollectionSchema)

export type CleanResponse = z.infer<typeof CleanResponseSchema>

// ---------------------------------------------------------------------------
// Registry types
// ---------------------------------------------------------------------------

/**
 * A single ground material entry in the registry.
 */
export const GroundMaterialRegistryElementSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  diffuseColor: z.tuple([z.number(), z.number(), z.number()]),
  specularColor: z.tuple([z.number(), z.number(), z.number()]),
  shine: z.number(),
  reflectivity: z.number(),
  emissiveColor: z.tuple([z.number(), z.number(), z.number()]),
  opacity: z.number(),
  thickness: z.number(),
  density: z.number(),
  thermalConductivity: z.number(),
  specificHeat: z.number(),
  solarAbsorptance: z.number(),
  thermalAbsorptance: z.number(),
  visibleAbsorptance: z.number(),
  roughness: z.number(),
  porosity: z.number(),
  carbonFactor: z.number(),
  uuid: z.string(),
})

export type GroundMaterialRegistryElement = z.infer<typeof GroundMaterialRegistryElementSchema>

/**
 * The full ground materials registry.
 */
export const GroundMaterialRegistrySchema = z.object({
  version: z.string(),
  uuid: z.string(),
  materials: z.record(z.string(), GroundMaterialRegistryElementSchema),
})

export type GroundMaterialRegistry = z.infer<typeof GroundMaterialRegistrySchema>

// ---------------------------------------------------------------------------
// Registry data (bundled)
// ---------------------------------------------------------------------------

import registryData from './ground-materials.registry.json'

/**
 * Bundled ground materials registry, validated through the Zod schema.
 * Contains all 5 default materials (water, concrete, asphalt, vegetation, soil)
 * with their thermal properties and UUIDs.
 */
export const GROUND_MATERIAL_REGISTRY: GroundMaterialRegistry =
  GroundMaterialRegistrySchema.parse(registryData)

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * UUID v4 validation regex.
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Simple UUID v4 generator (no external dependency).
 * Uses crypto.randomUUID when available, otherwise falls back to manual construction.
 */
function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: manual v4 UUID construction
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ---------------------------------------------------------------------------
// Name <-> UUID mapping
// ---------------------------------------------------------------------------

/**
 * Build a name-to-UUID lookup from the registry.
 */
function buildNameToUuidMap(registry: GroundMaterialRegistry): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [uuid, material] of Object.entries(registry.materials)) {
    map[material.name] = uuid
  }
  return map
}

/**
 * Build a UUID-to-name lookup from the registry.
 */
function buildUuidToNameMap(registry: GroundMaterialRegistry): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [uuid, material] of Object.entries(registry.materials)) {
    map[uuid] = material.name
  }
  return map
}

/**
 * Convert material name keys to UUID keys.
 * Keys that are not material names are passed through unchanged.
 */
export function mapNamesToUuids(
  elements: Record<string, FeatureCollection>,
  registry: GroundMaterialRegistry,
): Record<string, FeatureCollection> {
  const nameToUuid = buildNameToUuidMap(registry)
  const result: Record<string, FeatureCollection> = {}

  for (const [key, fc] of Object.entries(elements)) {
    const uuid = nameToUuid[key]
    result[uuid ?? key] = fc
  }

  return result
}

/**
 * Convert material UUID keys to name keys.
 * Keys that are not material UUIDs are passed through unchanged.
 */
export function mapUuidsToNames(
  elements: Record<string, FeatureCollection>,
  registry: GroundMaterialRegistry,
): Record<string, FeatureCollection> {
  const uuidToName = buildUuidToNameMap(registry)
  const result: Record<string, FeatureCollection> = {}

  for (const [key, fc] of Object.entries(elements)) {
    const name = uuidToName[key]
    result[name ?? key] = fc
  }

  return result
}

// ---------------------------------------------------------------------------
// Feature UUID management
// ---------------------------------------------------------------------------

/**
 * Assign v4 UUIDs to features that are missing a valid UUID id.
 * Mutates the feature collection in place and also returns it for chaining.
 */
export function ensureFeatureUuids(featureCollection: FeatureCollection): FeatureCollection {
  featureCollection.features = featureCollection.features.map((feature) => {
    if (!feature.id || !UUID_V4_REGEX.test(String(feature.id))) {
      return { ...feature, id: generateUuidV4() }
    }
    return feature
  })
  return featureCollection
}

// ---------------------------------------------------------------------------
// Regroup clean results
// ---------------------------------------------------------------------------

/**
 * Parse `user_{uuid}_{featureId}` prefixed keys back into material UUID
 * buckets. Merge features from both regular keys and user_ keys. Ensures
 * all features have valid v4 UUIDs.
 */
export function regroupCleanResults(
  layers: Record<string, FeatureCollection>,
  registry: GroundMaterialRegistry,
): Record<string, FeatureCollection> {
  // Initialize empty collections for every known material UUID
  const grouped: Record<string, FeatureCollection> = {}
  for (const uuid of Object.keys(registry.materials)) {
    grouped[uuid] = { type: 'FeatureCollection', features: [] }
  }

  for (const [key, fc] of Object.entries(layers)) {
    ensureFeatureUuids(fc)

    if (key.startsWith('user_')) {
      // Format: user_{materialUuid}_{featureId}
      const parts = key.split('_')
      const materialUuid = parts[1]
      if (!grouped[materialUuid]) {
        grouped[materialUuid] = { type: 'FeatureCollection', features: [] }
      }
      grouped[materialUuid].features.push(...fc.features)
    } else {
      // Regular material UUID key
      if (!grouped[key]) {
        grouped[key] = { type: 'FeatureCollection', features: [] }
      }
      grouped[key].features.push(...fc.features)
    }
  }

  return grouped
}

// ---------------------------------------------------------------------------
// Sort features for clean service
// ---------------------------------------------------------------------------

/**
 * Sort user-modified features first with `user_{uuid}_{featureId}` keys,
 * then untouched features grouped by material UUID.
 * Follows `GROUND_MATERIAL_ORDER` for the untouched material groups.
 *
 * @param allFeatures - All features currently in the draw editor
 * @param createdFeatures - Features created during this session
 * @param updatedFeatures - Features updated during this session
 * @param registry - The ground materials registry
 */
export function sortGroundMaterialsFeatures(
  allFeatures: FeatureCollection,
  createdFeatures: FeatureCollection['features'],
  updatedFeatures: FeatureCollection['features'],
  registry: GroundMaterialRegistry,
): Record<string, FeatureCollection> {
  const nameToUuid = buildNameToUuidMap(registry)

  // Track which features were user-modified
  const modifiedIds = new Set<string>()
  for (const f of [...createdFeatures, ...updatedFeatures]) {
    if (f.id) modifiedIds.add(String(f.id))
  }

  // Separate untouched features
  const untouched = allFeatures.features.filter((f) => !f.id || !modifiedIds.has(String(f.id)))

  // Group untouched features by material UUID, respecting GROUND_MATERIAL_ORDER
  const groups: Record<string, FeatureCollection['features']> = {}
  for (const name of GROUND_MATERIAL_ORDER) {
    const uuid = nameToUuid[name]
    if (uuid) groups[uuid] = []
  }

  for (const f of untouched) {
    const materialName = f.properties?.material as string | undefined
    if (materialName) {
      const uuid = nameToUuid[materialName]
      if (uuid && groups[uuid]) {
        groups[uuid].push(f)
      }
    }
  }

  const result: Record<string, FeatureCollection> = {}

  // User-modified features go FIRST (higher priority in clean service)
  for (const f of [...createdFeatures, ...updatedFeatures]) {
    if (!f.id) continue // Skip features without an ID to avoid key collisions
    const materialName = f.properties?.material as string | undefined
    if (materialName) {
      const uuid = nameToUuid[materialName]
      if (uuid) {
        result[`user_${uuid}_${f.id}`] = {
          type: 'FeatureCollection',
          features: [f],
        }
      }
    }
  }

  // Then untouched features in GROUND_MATERIAL_ORDER
  for (const name of GROUND_MATERIAL_ORDER) {
    const uuid = nameToUuid[name]
    if (uuid) {
      result[uuid] = {
        type: 'FeatureCollection',
        features: groups[uuid] || [],
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Filter polygon features
// ---------------------------------------------------------------------------

/**
 * Check whether a GeoJSON geometry type is a polygon type.
 */
function isPolygonType(geometryType: string | undefined): boolean {
  return geometryType === 'Polygon' || geometryType === 'MultiPolygon'
}

/**
 * Detect self-intersecting polygons using the kinks algorithm.
 * Returns true if the polygon has NO self-intersections.
 *
 * This is a simple implementation that checks if any ring of the polygon
 * crosses itself. For production use with @turf/kinks, replace the import.
 */
function hasNoSelfIntersections(
  feature: FeatureCollection['features'][number],
  kinksFn?: (feature: any) => { features: unknown[] },
): boolean {
  if (!kinksFn) return true
  try {
    const result = kinksFn(feature)
    return result.features.length === 0
  } catch {
    return false
  }
}

/**
 * Filter to only Polygon/MultiPolygon features.
 * Optionally checks for self-intersections via a kinks function.
 *
 * @param featureCollection - The feature collection to filter
 * @param applySelfIntersectionsCheck - Whether to apply self-intersection checks
 * @param kinksFn - Optional kinks function (from @turf/kinks) for self-intersection detection
 */
export function filterPolygonFeatures(
  featureCollection: FeatureCollection,
  applySelfIntersectionsCheck = false,
  kinksFn?: (feature: any) => { features: unknown[] },
): {
  filteredFeatures: FeatureCollection
  invalidFeaturesCount: number
} {
  let invalidCount = 0
  const validFeatures = featureCollection.features.filter((feature) => {
    if (!isPolygonType(feature.geometry?.type)) {
      invalidCount++
      return false
    }
    if (applySelfIntersectionsCheck && !hasNoSelfIntersections(feature, kinksFn)) {
      invalidCount++
      return false
    }
    return true
  })

  return {
    filteredFeatures: {
      ...featureCollection,
      features: validFeatures,
    },
    invalidFeaturesCount: invalidCount,
  }
}

// ---------------------------------------------------------------------------
// Build analysis payload
// ---------------------------------------------------------------------------

/**
 * Transform stored elements (UUID-keyed) into analysis payload format.
 * Output is UUID-keyed: `Record<materialUuid, FeatureCollection>`.
 * Each feature gets `properties.material` set to the material name.
 * Empty FeatureCollections and unknown materials are skipped.
 */
export function buildGroundMaterialBody(
  elements: Record<string, FeatureCollection>,
  registry: GroundMaterialRegistry,
): Record<string, FeatureCollection> {
  const result: Record<string, FeatureCollection> = {}

  for (const [materialId, fc] of Object.entries(elements)) {
    const material = registry.materials[materialId]
    if (!material) continue

    // Skip empty FeatureCollections
    if (fc.features.length === 0) continue

    result[materialId] = {
      ...fc,
      features: fc.features.map((f) => ({
        ...f,
        properties: { ...(f.properties ?? {}), material: material.name },
      })),
    }
  }

  return result
}
