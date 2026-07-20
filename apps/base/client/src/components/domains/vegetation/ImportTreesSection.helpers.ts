/**
 * Pure helpers + types for `ImportTreesSection`. No React, no hooks.
 * Kept separate so the component file stays focused on rendering +
 * lifecycle, and so these can be tested headlessly later.
 */
import {
  computeOriginFromPolygon,
  featuresToDotBimMeshes,
  stablePolygonKey,
  type TreesFeatureCollection,
} from '@forge-kit/vegetation'
import type { Polygon as GeoJsonPolygon } from 'geojson'

// ---------------------------------------------------------------------------
// Phase machine (drives the rendered UI)
// ---------------------------------------------------------------------------

export type Phase =
  | { kind: 'idle' }
  | { kind: 'processing' }
  | { kind: 'fallback'; fc: TreesFeatureCollection }
  | { kind: 'preview'; features: Array<Record<string, unknown>>; warnings: string[] }
  | { kind: 'error'; message: string }

/** Per-upload Replace/Add toggle. */
export type ReplaceMode = 'add' | 'replace'

// ---------------------------------------------------------------------------
// Fallback validation
// ---------------------------------------------------------------------------

/** Valid fallback input ranges (must match vegetation.mesh-builder.ts). */
const HEIGHT_RANGE: readonly [number, number] = [1, 30]
const CROWN_DIAMETER_RANGE: readonly [number, number] = [1, 20]

export type FallbackValidation =
  | { ok: true; height: number; crownDiameter: number }
  | { ok: false; error: string }

/** Coerce + range-check fallback strings from the inline prompt. */
export function validateFallbackInputs(heightRaw: string, diameterRaw: string): FallbackValidation {
  const h = Number(heightRaw)
  const d = Number(diameterRaw)
  if (!Number.isFinite(h) || h < HEIGHT_RANGE[0] || h > HEIGHT_RANGE[1]) {
    return {
      ok: false,
      error: `Fallback height must be a number between ${HEIGHT_RANGE[0]} and ${HEIGHT_RANGE[1]} m.`,
    }
  }
  if (!Number.isFinite(d) || d < CROWN_DIAMETER_RANGE[0] || d > CROWN_DIAMETER_RANGE[1]) {
    return {
      ok: false,
      error: `Fallback crown diameter must be a number between ${CROWN_DIAMETER_RANGE[0]} and ${CROWN_DIAMETER_RANGE[1]} m.`,
    }
  }
  return { ok: true, height: h, crownDiameter: d }
}

// ---------------------------------------------------------------------------
// Commit helpers
// ---------------------------------------------------------------------------

/**
 * Build the merged features dict + meshes that should be written to
 * `useVegetationStore.setMeshes`. Pure: caller decides whether to
 * Replace (drop existing) or Add (merge with existing).
 */
export function buildCommit(
  existing: Record<string, Record<string, unknown>> | null,
  incoming: Array<Record<string, unknown>>,
  polygon: GeoJsonPolygon,
  replaceMode: ReplaceMode,
): {
  merged: Record<string, Record<string, unknown>>
  meshes: ReturnType<typeof featuresToDotBimMeshes>
  totalTrees: number
  polygonKey: string
} {
  const incomingDict = Object.fromEntries(
    incoming.map((f) => [String((f as { id?: unknown }).id ?? ''), f]),
  ) as Record<string, Record<string, unknown>>

  const merged: Record<string, Record<string, unknown>> = replaceMode === 'replace'
    ? incomingDict
    : { ...(existing ?? {}), ...incomingDict }

  const origin = computeOriginFromPolygon(polygon)
  const meshes = featuresToDotBimMeshes(merged, origin)
  const polygonKey = stablePolygonKey(polygon)
  return { merged, meshes, totalTrees: Object.keys(merged).length, polygonKey }
}

/** Success-toast text after a confirmed import. */
export function getSuccessToast(importedCount: number, replaceMode: ReplaceMode): string {
  const plural = importedCount === 1 ? '' : 's'
  return replaceMode === 'replace'
    ? `Imported ${importedCount} tree${plural} (replaced existing).`
    : `Imported ${importedCount} tree${plural}.`
}
