/**
 * Normalise SDK-fetched ground-material layers against the registry.
 *
 * Used by `useGroundMaterialsAreaMutation` after `sdk.groundMaterials.getArea`
 * to stamp `properties.material` on every feature and drop layers that don't
 * resolve to a registry entry. The draw flow has its own analogue in
 * `buildGroundMaterialBody` (UUID-keyed); the SDK path stays name-keyed.
 */
import type {
  GroundMaterialRegistry,
  GroundMaterialRegistryElement,
} from './ground-materials.types'

/**
 * Loose FeatureCollection shape returned by `sdk.groundMaterials.getArea`.
 * Looser than the Zod-validated `FeatureCollection` in `sdk-types.ts` so
 * unexpected upstream shapes don't trip schema validation on the display
 * path.
 */
export interface LooseFeatureCollection {
  type?: string
  features?: Array<Record<string, unknown>>
  [key: string]: unknown
}

/** `Record<materialName, LooseFeatureCollection>` keyed by lowercase material name. */
export type LooseMaterialLayers = Record<string, LooseFeatureCollection>

/**
 * Normalise SDK-fetched ground-material layers against the registry.
 *
 * - Layer names matched case-insensitively to `registry.materials[*].name`.
 * - Unknown layers are dropped with a `console.warn`.
 * - Output layers are keyed by the canonical registry name.
 * - Every feature gets `properties.material = <canonical name>` (overwriting
 *   any pre-existing `material` field).
 */
export function normalizeSdkAreaLayers(
  layers: LooseMaterialLayers,
  registry: GroundMaterialRegistry,
): LooseMaterialLayers {
  const nameToMaterial: Record<string, GroundMaterialRegistryElement> = {}
  for (const material of Object.values(registry.materials)) {
    nameToMaterial[material.name.toLowerCase()] = material
  }

  const out: LooseMaterialLayers = {}
  for (const [layerName, fc] of Object.entries(layers)) {
    const material = nameToMaterial[layerName.toLowerCase()]
    if (!material) {
      console.warn(`[ground-materials] dropping unknown SDK layer "${layerName}" (not in registry)`)
      continue
    }
    const features = (fc?.features ?? []).map((f) => {
      const existing =
        typeof f === 'object' && f != null && 'properties' in f && f.properties != null
          ? (f.properties as Record<string, unknown>)
          : {}
      return {
        ...f,
        properties: { ...existing, material: material.name },
      }
    })
    out[material.name] = { type: 'FeatureCollection', features }
  }
  return out
}
