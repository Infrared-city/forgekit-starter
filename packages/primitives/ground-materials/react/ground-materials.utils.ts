import type { Feature, FeatureCollection as GeoFeatureCollection } from 'geojson'
import {
  buildGroundMaterialBody,
  type FeatureCollection,
  type GroundMaterialRegistry,
  mapNamesToUuids,
} from '../core/ground-materials.sdk-types'
import { getDrawInstance } from './ground-materials.draw-hook'

/** Final fallback material name when neither feature nor panel supplies one. */
export const DEFAULT_FALLBACK_MATERIAL = 'asphalt'

/**
 * Pure helper that decides which registry material each preview feature
 * should commit under.
 *
 * Lookup order:
 *   1. `feature.properties.material` (string) -- if it matches a name in
 *      the registry, keep it as-is.
 *   2. Currently-selected panel material (`currentMaterial`) when present.
 *   3. `DEFAULT_FALLBACK_MATERIAL` ("asphalt") as last resort.
 *
 * Unknown / missing material names are accumulated in `unknownNames` so the
 * caller can emit a single aggregated warning. The `usedFallback` flag is set
 * when at least one feature fell back away from its labeled material.
 *
 * @param features   preview features keyed by `id` (the MapboxDraw-assigned id)
 * @param registry   active registry; `null` is tolerated -> everything falls back
 * @param currentMaterial selected panel material (may be `null`)
 */
export interface PerFeatureMaterialResolution {
  /** Per-feature `{ id, materialName }` -- one entry per input feature with a defined id. */
  assignments: Array<{ id: string; materialName: string }>
  /** Distinct unknown / missing material labels encountered (order preserved). */
  unknownNames: string[]
  /** Number of features whose label was missing entirely (vs. unknown name). */
  missingCount: number
  /** True iff any feature ended up on a fallback (panel or `asphalt`). */
  usedFallback: boolean
  /** Resolved fallback name actually used when feature-level lookup failed. */
  fallbackMaterial: string
}

/**
 * Build the single aggregated warning string emitted when one or more features
 * fall back from their declared `material` label. Returns `null` when no
 * fallback occurred so callers can guard with a truthy check.
 */
export function buildFallbackWarning(resolution: PerFeatureMaterialResolution): string | null {
  if (!resolution.usedFallback) return null
  const parts: string[] = []
  if (resolution.unknownNames.length > 0) {
    parts.push(
      `unknown material${resolution.unknownNames.length > 1 ? 's' : ''}: ${resolution.unknownNames.join(', ')}`,
    )
  }
  if (resolution.missingCount > 0) {
    parts.push(
      `${resolution.missingCount} feature${resolution.missingCount > 1 ? 's' : ''} without a material label`,
    )
  }
  const reason = parts.length > 0 ? parts.join('; ') : 'unlabeled features'
  return `Routed ${reason} to "${resolution.fallbackMaterial}".`
}

export function resolvePerFeatureMaterials(
  features: Feature[],
  registry: GroundMaterialRegistry | null | undefined,
  currentMaterial: string | null | undefined,
): PerFeatureMaterialResolution {
  // Build the set of known registry names. When the registry has not loaded
  // yet (`hasRegistry === false`) we cannot validate ANY label -- every
  // feature has to route through the caller's `currentMaterial` so the
  // downstream pipeline (`buildAnalysisGroundMaterials` ->
  // `buildGroundMaterialBody`) keeps the feature: that pipeline silently
  // drops entries keyed by unknown material names.
  const knownNames = new Set<string>()
  const hasRegistry = !!registry?.materials
  if (hasRegistry) {
    for (const mat of Object.values(registry!.materials)) {
      knownNames.add(mat.name)
    }
  }

  // Resolve the panel-level fallback up front. Lookup order:
  //   1. `currentMaterial` validated against the registry (when present).
  //   2. `currentMaterial` as-is when the registry has not loaded yet -- we
  //      cannot validate it either, but trusting the user's panel selection
  //      is strictly better than forcing every feature onto "asphalt"
  //      while the query is still in flight.
  //   3. `DEFAULT_FALLBACK_MATERIAL` ("asphalt").
  const panelFallbackValid = !!currentMaterial && (!hasRegistry || knownNames.has(currentMaterial))
  const fallbackMaterial = panelFallbackValid
    ? (currentMaterial as string)
    : DEFAULT_FALLBACK_MATERIAL

  const assignments: Array<{ id: string; materialName: string }> = []
  const unknownNames: string[] = []
  const seenUnknown = new Set<string>()
  let missingCount = 0
  let usedFallback = false

  for (const feature of features) {
    if (feature.id === undefined || feature.id === null) continue
    const id = String(feature.id)
    const rawLabel = feature.properties?.material
    const label = typeof rawLabel === 'string' && rawLabel.length > 0 ? rawLabel : undefined

    // A label is only accepted when the registry is loaded AND it is in the
    // known set. With no registry we treat every label as unverifiable and
    // route through the fallback -- the analysis-payload builder drops
    // unknown material keys, so passing arbitrary labels through would mean
    // silent data loss later.
    const labelAccepted = label !== undefined && hasRegistry && knownNames.has(label)
    if (labelAccepted) {
      assignments.push({ id, materialName: label as string })
      continue
    }

    if (label) {
      // Label present but unknown (or unverifiable) -- record once for the
      // aggregated warning.
      if (!seenUnknown.has(label)) {
        seenUnknown.add(label)
        unknownNames.push(label)
      }
    } else {
      missingCount += 1
    }
    usedFallback = true
    assignments.push({ id, materialName: fallbackMaterial })
  }

  return { assignments, unknownNames, missingCount, usedFallback, fallbackMaterial }
}

/**
 * Build ground materials payload for analysis by reading the current state
 * from MapboxDraw (the source of truth for all fetched, drawn, and edited
 * features). Falls back to React Query cache data when the draw instance
 * is unavailable or empty.
 *
 * The output is `Record<materialUuid, FeatureCollection>` with
 * `properties.material` set to the material name on every feature -- ready
 * for the Infrared API.
 *
 * Returns `undefined` when no features are available.
 *
 * @param fetchedElements - UUID-keyed FeatureCollections from React Query cache (fallback)
 * @param registry - Ground material registry
 */
export function buildAnalysisGroundMaterials(
  fetchedElements: Record<string, FeatureCollection> | undefined,
  registry: GroundMaterialRegistry,
): Record<string, FeatureCollection> | undefined {
  // Strategy 1: Read current features from the MapboxDraw instance.
  // This captures ALL state: fetched + drawn + edited + deletions.
  const draw = getDrawInstance()
  let drawFeatures: GeoFeatureCollection | null = null
  try {
    drawFeatures = draw?.getAll() ?? null
  } catch {
    // draw instance may be destroyed -- fall through to cache
  }

  let uuidKeyed: Record<string, FeatureCollection>

  if (drawFeatures && drawFeatures.features.length > 0) {
    // Group draw features by material name, then convert to UUID-keyed
    // (buildGroundMaterialBody expects UUID-keyed input from registry)
    const byName: Record<string, FeatureCollection> = {}

    for (const feature of drawFeatures.features) {
      const materialName = (feature.properties?.material ?? feature.properties?.user_material) as
        | string
        | undefined
      if (!materialName) continue

      if (!byName[materialName]) {
        byName[materialName] = { type: 'FeatureCollection', features: [] }
      }
      byName[materialName].features.push(feature as FeatureCollection['features'][number])
    }

    // Convert name-keyed to UUID-keyed so buildGroundMaterialBody can process
    uuidKeyed = mapNamesToUuids(byName, registry)
  } else if (fetchedElements) {
    // Strategy 2: Fall back to cached data (draw instance empty or unavailable)
    uuidKeyed = {}
    for (const [key, fc] of Object.entries(fetchedElements)) {
      uuidKeyed[key] = { ...fc, features: [...fc.features] }
    }
  } else {
    // No data from either source
    return undefined
  }

  // buildGroundMaterialBody keeps UUID-keyed output, stamps each feature's
  // `properties.material` with the material name, and filters empty collections.
  const result = buildGroundMaterialBody(uuidKeyed, registry)

  const hasFeatures = Object.values(result).some((fc) => fc.features && fc.features.length > 0)

  return hasFeatures ? result : undefined
}
