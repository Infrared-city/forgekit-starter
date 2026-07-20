/**
 * Shared utility functions for the interior domain.
 *
 * Consolidated from duplicated implementations across:
 * - ModelTreePanel.tsx (formatIfcTypeName, getStringAttribute)
 * - InteriorTooltip.tsx (formatIfcType)
 * - ElementProperties.tsx (formatIfcType, getStringProp)
 * - UploadPanel.tsx (formatBytes)
 * - interior.store.ts (formatBytes, extractAttributeValue, buildWallClassification)
 */

import type * as FRAGS from '@thatopen/fragments'
import { WALL_CLASSIFICATION_CHUNK_SIZE } from './interior.constants'
import type { WallClassification } from './interior.types'

// ─── formatIfcTypeName ─────────────────────────────────────────────────────────

/**
 * Segment map for IFC type name tokenization.
 * Longest-match tokens first so "BUILDINGSTOREY" matches before "BUILDING" + "STOREY".
 * This is the superset from ModelTreePanel (includes FOOTING, FEATURE, SERVICE, etc.).
 */
const SEGMENT_MAP: [string, string][] = [
  ['BUILDINGSTOREY', 'Building Storey'],
  ['STANDARDCASE', 'Standard Case'],
  ['DISTRIBUTION', 'Distribution'],
  ['FURNISHING', 'Furnishing'],
  ['FURNITURE', 'Furniture'],
  ['EQUIPMENT', 'Equipment'],
  ['TERMINAL', 'Terminal'],
  ['COVERING', 'Covering'],
  ['BUILDING', 'Building'],
  ['RAILING', 'Railing'],
  ['FOOTING', 'Footing'],
  ['PRODUCT', 'Product'],
  ['OPENING', 'Opening'],
  ['FEATURE', 'Feature'],
  ['FITTING', 'Fitting'],
  ['ELEMENT', 'Element'],
  ['SERVICE', 'Service'],
  ['COLUMN', 'Column'],
  ['WINDOW', 'Window'],
  ['FLIGHT', 'Flight'],
  ['SYSTEM', 'System'],
  ['MEMBER', 'Member'],
  ['STOREY', 'Storey'],
  ['STAIR', 'Stair'],
  ['SPACE', 'Space'],
  ['PROXY', 'Proxy'],
  ['PLATE', 'Plate'],
  ['RAMP', 'Ramp'],
  ['ROOF', 'Roof'],
  ['BEAM', 'Beam'],
  ['DUCT', 'Duct'],
  ['FLOW', 'Flow'],
  ['PILE', 'Pile'],
  ['PIPE', 'Pipe'],
  ['SITE', 'Site'],
  ['SLAB', 'Slab'],
  ['WALL', 'Wall'],
  ['DOOR', 'Door'],
  ['ZONE', 'Zone'],
]

/**
 * Format an IFC type name for display by splitting at known word boundaries.
 * "IFCBUILDINGSTOREY" -> "Building Storey"
 * "IFCSITE" -> "Site"
 * "IFCWALLSTANDARDCASE" -> "Wall Standard Case"
 *
 * Algorithm: greedy longest-match tokenizer against a known segment list.
 * Each segment maps to a display token (title-cased words).
 * Segments are tried in longest-first order so "BUILDINGSTOREY" matches
 * before "BUILDING" and "STOREY".
 */
export function formatIfcTypeName(type: string): string {
  if (!type || type === 'Unknown') return 'Unknown'
  const upper = type.toUpperCase()
  const stripped = upper.startsWith('IFC') ? upper.slice(3) : upper
  if (!stripped) return 'Unknown'

  const words: string[] = []
  let remaining = stripped

  while (remaining.length > 0) {
    let matched = false
    for (const [seg, display] of SEGMENT_MAP) {
      if (remaining.startsWith(seg)) {
        words.push(display)
        remaining = remaining.slice(seg.length)
        matched = true
        break
      }
    }
    if (!matched) {
      // Unknown character: append to last word or start a new one
      const ch = remaining.charAt(0)
      if (words.length > 0) {
        words[words.length - 1] += ch.toLowerCase()
      } else {
        words.push(ch.toUpperCase())
      }
      remaining = remaining.slice(1)
    }
  }

  return words.join(' ')
}

// ─── formatBytes ───────────────────────────────────────────────────────────────

/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Attribute Extraction ──────────────────────────────────────────────────────

/**
 * Extract a named attribute value from a ThatOpen ItemData / nested object.
 * Handles both raw values (string/boolean/number) and { value: T } wrapper shapes.
 *
 * Consolidates:
 * - `extractAttributeValue` from interior.store.ts
 * - `getStringAttribute` from ModelTreePanel.tsx
 * - `getStringProp` from ElementProperties.tsx
 */
export function extractAttributeValue(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  const val = (obj as Record<string, unknown>)[key]
  if (val === undefined || val === null) return undefined
  if (typeof val === 'object' && 'value' in (val as Record<string, unknown>)) {
    return (val as { value: unknown }).value
  }
  return val
}

/**
 * Extract a string attribute from an object.
 * Returns the value as a string or null if not found / not a string.
 * Handles both raw string values and { value: string } wrapper shapes.
 */
export function getStringAttribute(obj: unknown, key: string): string | null {
  const val = extractAttributeValue(obj, key)
  if (typeof val === 'string') return val
  return null
}

/**
 * Try to find a string value from a raw properties object using a prioritised list of keys.
 * Returns the first matching non-empty string, or null.
 * Handles both raw string values and { value: string } wrapper shapes.
 */
export function getStringProp(properties: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const val = extractAttributeValue(properties, key)
    if (typeof val === 'string' && val.length > 0) return val
  }
  return null
}

// ─── Wall Classification Helpers ───────────────────────────────────────────────

/**
 * Normalize an IsExternal value from Pset_WallCommon.
 * Handles: boolean true/false, string "TRUE"/"true"/"FALSE"/"false", IFC ".T."/".F."
 * Returns true (exterior), false (interior), or null (not found).
 */
export function normalizeIsExternalValue(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const upper = value.toUpperCase().trim()
    if (upper === 'TRUE' || upper === '.T.') return true
    if (upper === 'FALSE' || upper === '.F.') return false
  }
  return null
}

/**
 * Search an array of property objects for one named "IsExternal" and
 * extract its NominalValue.
 */
export function findIsExternalInProperties(properties: unknown[]): boolean | null {
  for (const prop of properties) {
    if (!prop || typeof prop !== 'object') continue
    const propName = extractAttributeValue(prop, 'Name')
    if (typeof propName !== 'string' || propName !== 'IsExternal') continue

    const nominalValue = extractAttributeValue(prop, 'NominalValue')
    const normalized = normalizeIsExternalValue(nominalValue)
    if (normalized !== null) return normalized
  }
  return null
}

/**
 * Extract the IsExternal property value from an ItemData fetched with
 * IsDefinedBy relations. Walks the property set structure to find
 * Pset_WallCommon -> IsExternal.
 *
 * Returns true (exterior), false (interior), or null (property not found).
 */
export function extractIsExternal(item: Record<string, unknown>): boolean | null {
  // IsDefinedBy is the standard IFC relation containing property sets.
  const isDefinedBy = item.IsDefinedBy
  if (!Array.isArray(isDefinedBy)) return null

  for (const psetDef of isDefinedBy) {
    if (!psetDef || typeof psetDef !== 'object') continue

    // Find Pset_WallCommon by Name
    const psetName = extractAttributeValue(psetDef, 'Name')
    if (typeof psetName !== 'string' || psetName !== 'Pset_WallCommon') continue

    // Look for HasProperties (the standard sub-relation containing individual properties)
    const hasProperties =
      (psetDef as Record<string, unknown>).HasProperties ??
      (psetDef as Record<string, unknown>).DefinesOccurrence
    if (!Array.isArray(hasProperties)) {
      // Try walking all array-valued fields as potential property containers
      for (const val of Object.values(psetDef as Record<string, unknown>)) {
        if (!Array.isArray(val)) continue
        const result = findIsExternalInProperties(val)
        if (result !== null) return result
      }
      continue
    }

    const result = findIsExternalInProperties(hasProperties)
    if (result !== null) return result
  }

  return null
}

// ─── Wall Classification ──────────────────────────────────────────────────────

/**
 * Scan IFCWALL + IFCWALLSTANDARDCASE elements for Pset_WallCommon.IsExternal.
 * Returns a WallClassification with sets for O(1) lookups in the visibility pass.
 *
 * Accepts an optional `isStale` callback so the caller can abort the scan
 * when a newer model supersedes the current one (e.g. rapid model switching).
 * If `isStale` returns true at any async checkpoint, the function returns null
 * to signal the caller that the result should be discarded.
 *
 * @param model - ThatOpen FragmentsModel to scan
 * @param isStale - Optional callback that returns true if the scan should be aborted
 * @returns WallClassification result, or null if aborted due to staleness
 */
export async function buildWallClassification(
  model: FRAGS.FragmentsModel,
  isStale?: () => boolean,
): Promise<WallClassification | null> {
  try {
    // Step 1: Get all wall IDs (IFCWALL + IFCWALLSTANDARDCASE)
    const wallIds = await model.getItemsByQuery({
      categories: [/^IFCWALL$/i, /^IFCWALLSTANDARDCASE$/i],
    })

    if (isStale?.()) return null

    if (!wallIds || wallIds.length === 0) {
      return {
        exteriorWallIds: new Set<number>(),
        interiorWallIds: new Set<number>(),
        exteriorWallChildIds: new Set<number>(),
        hasExternalProperty: false,
      }
    }

    // Step 2: Fetch property sets with relations in chunks
    const exteriorWallIds = new Set<number>()
    const interiorWallIds = new Set<number>()
    let hasExternalProperty = false

    for (let start = 0; start < wallIds.length; start += WALL_CLASSIFICATION_CHUNK_SIZE) {
      if (isStale?.()) return null

      const chunk = wallIds.slice(start, start + WALL_CLASSIFICATION_CHUNK_SIZE)

      const items = await model.getItemsData(chunk, {
        attributesDefault: false,
        attributes: ['Name', 'NominalValue'],
        relations: {
          IsDefinedBy: { attributes: true, relations: true },
        },
      })

      if (isStale?.()) return null

      // Step 3: Parse each wall's property sets
      for (let i = 0; i < chunk.length; i++) {
        const wallId = chunk[i]
        const item = items[i]

        if (!item) {
          // No data — default to interior
          interiorWallIds.add(wallId)
          continue
        }

        const isExternal = extractIsExternal(item)

        if (isExternal === null) {
          // No IsExternal property found — default to interior
          interiorWallIds.add(wallId)
        } else {
          hasExternalProperty = true
          if (isExternal) {
            exteriorWallIds.add(wallId)
          } else {
            interiorWallIds.add(wallId)
          }
        }
      }
    }

    if (isStale?.()) return null

    // Step 4: Collect spatial children of exterior walls using the model API
    // (NOT treeFlatMap — that's built asynchronously in ModelTreePanel and may
    // not be ready yet). Uses getItemsChildren() with frontier expansion,
    // same pattern as handleFloorToggle in ModelTreePanel.
    const exteriorWallChildIds = new Set<number>()
    if (exteriorWallIds.size > 0) {
      let frontier = [...exteriorWallIds]
      while (frontier.length > 0) {
        if (isStale?.()) return null
        const childIds = await model.getItemsChildren(frontier)
        if (isStale?.()) return null
        const newIds = childIds.filter(
          (id) => !exteriorWallChildIds.has(id) && !exteriorWallIds.has(id),
        )
        for (const id of newIds) exteriorWallChildIds.add(id)
        frontier = newIds
      }
    }

    if (isStale?.()) return null

    return {
      exteriorWallIds,
      interiorWallIds,
      exteriorWallChildIds,
      hasExternalProperty,
    }
  } catch (err) {
    console.warn('[interior.utils] Wall classification scan failed:', err)
    return {
      exteriorWallIds: new Set<number>(),
      interiorWallIds: new Set<number>(),
      exteriorWallChildIds: new Set<number>(),
      hasExternalProperty: false,
    }
  }
}
