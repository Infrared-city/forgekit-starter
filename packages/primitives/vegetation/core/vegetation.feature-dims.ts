/**
 * Per-feature tree dimension + archetype resolution. Pulled out of
 * `vegetation.mesh-builder.ts` to keep that file under the 400-line cap —
 * this module owns "what size/shape is this tree", the builder owns
 * "emit the geometry".
 */

/** Crown-shape archetype. `round` (sphere, the default) matches all
 *  pre-archetype behavior byte-for-byte; `conical` (conifer) and `columnar`
 *  (cypress/poplar) are set by importers (e.g. OBJ tree fitting) via
 *  `properties.archetype` — unknown values fall back to `round`. */
export type TreeArchetype = 'round' | 'conical' | 'columnar'

const TREE_ARCHETYPES: readonly TreeArchetype[] = ['round', 'conical', 'columnar']

export function readArchetype(props: Record<string, unknown>): TreeArchetype {
  const raw = props.archetype
  return typeof raw === 'string' && (TREE_ARCHETYPES as readonly string[]).includes(raw)
    ? (raw as TreeArchetype)
    : 'round'
}

/** Trunk = 30% of total height (top end of typical street-tree ratio).
 *  Canopy diameter = remaining 70% so a default 8 m tree has 2.4 m trunk +
 *  5.6 m canopy diameter (3 m crown radius reads as a normal urban tree). */
export const TRUNK_FRACTION_OF_TOTAL = 0.3
export const CANOPY_FRACTION_OF_TOTAL = 1 - TRUNK_FRACTION_OF_TOTAL

/** Hard sanity clamps — applied to BOTH defaults and per-feature SDK values
 *  so garbage in OSM (`height = "200"`) can't produce 100 m rockets. Ceiling
 *  is 25 m to accommodate mature Platanen/Linden common in central Vienna. */
const TOTAL_HEIGHT_RANGE: readonly [number, number] = [3, 25]
const TRUNK_HEIGHT_RANGE: readonly [number, number] = [1, 5]
const CANOPY_RADIUS_RANGE: readonly [number, number] = [1.5, 7]

export const DEFAULT_TOTAL_HEIGHT = 8

/** Magnitude of the deterministic per-feature height jitter (multiplicative).
 *  OSM `height` is set on <10% of street trees so defaults dominate; without
 *  jitter the canopy reads as a regiment of identical balls. ±20% gives a
 *  natural-looking spread without breaking the clamp ceiling. */
const HEIGHT_JITTER = 0.2

/** Crude OSM-circumference → tree-height heuristic. Most street trees have
 *  trunk circumference ~0.4-1.2 m; the relationship `height ≈ 12 × circ + 3`
 *  is a rough fit across Vienna's typical Platanen / Linden / Chestnut
 *  (urban trees with crown access to light grow taller per cm of trunk than
 *  forest trees). Result still passes through TOTAL_HEIGHT_RANGE clamp. */
function heightFromCircumference(circM: number): number {
  return 12 * circM + 3
}

/** Stable [-1, +1] pseudo-random keyed on a string. djb2 hash → normalize.
 *  Used so a given OSM feature id always produces the same jitter — repeated
 *  renders of the same area don't flicker between heights. */
function stableJitter01(seed: string): number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0
  // Map to [-1, +1].
  return ((h >>> 0) / 0xffffffff) * 2 - 1
}

export interface ResolvedDims {
  trunkHeight: number
  canopyRadius: number
  /** Vertical crown extent for the non-round archetypes (trunk top → tree
   *  top). The round archetype ignores it — its sphere derives everything
   *  from `canopyRadius`, exactly as before archetypes existed. */
  canopyHeight: number
  archetype: TreeArchetype
}

function clamp(value: number, range: readonly [number, number]): number {
  if (value < range[0]) return range[0]
  if (value > range[1]) return range[1]
  return value
}

/** Coerce a possibly-stringy numeric property; null on NaN/non-finite. */
function coerceFinite(raw: unknown): number | null {
  if (raw == null) return null
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return null
  return n
}

/** Read crown diameter from `crownDiameter` (canonical camelCase) OR
 *  `diameter_crown` (OSM key the SDK forwards verbatim). */
function readCrownDiameter(props: Record<string, unknown>): number | null {
  return coerceFinite(props.crownDiameter) ?? coerceFinite(props.diameter_crown)
}

/**
 * Resolve per-feature trunk + canopy dimensions.
 *
 * SDK semantics (OSM forwarding): `properties.height` is the **TOTAL tree
 * height** (trunk base → canopy top), NOT a trunk-only height. The previous
 * implementation stacked an additional `canopyHeight = height * ratio` on
 * top, producing trees ~3.3× taller than the source data → 10 m OSM trees
 * rendered as ~33 m rockets.
 *
 * Algorithm:
 *  1. Total height ← `properties.height` when present (clamped to [3, 25] m),
 *     else `12 × properties.circumference + 3` when trunk circumference is
 *     present, else `defaults.totalHeight * (1 ± 0.2)` jittered deterministically
 *     by feature id so the canopy reads as a forest, not a regiment.
 *  2. Trunk height ← `total * 0.3` (clamped to [1, 5] m).
 *  3. Canopy radius ← `diameter_crown / 2` when valid, else
 *     `total * 0.35` (clamped to [1.5, 7] m).
 *
 * Missing or non-finite values fall through to the jittered default; the
 * jitter is seeded on the feature id so repeat renders are stable.
 */
export function resolveFeatureDims(
  feature: Record<string, unknown>,
  defaults: { totalHeight: number },
): ResolvedDims {
  const props = (feature.properties ?? {}) as Record<string, unknown>

  // Priority chain for total height:
  //  1. explicit `properties.height` from OSM (rare, ~<10% of street trees)
  //  2. derive from `properties.circumference` via DBH-to-height heuristic
  //  3. default 8m + deterministic ±20% jitter keyed on feature id so the
  //     canopy reads as a forest, not a regiment of identical balls.
  const rawTotal = coerceFinite(props.height)
  const rawCirc = coerceFinite(props.circumference)
  let totalHeight: number
  if (rawTotal != null) {
    totalHeight = clamp(rawTotal, TOTAL_HEIGHT_RANGE)
  } else if (rawCirc != null && rawCirc > 0) {
    totalHeight = clamp(heightFromCircumference(rawCirc), TOTAL_HEIGHT_RANGE)
  } else {
    // Deterministic per-feature jitter keyed on the feature id (or any
    // stable string proxy from props). Falls back to a coordinate-derived
    // seed when no id is available.
    const seedId =
      (typeof feature.id === 'string' || typeof feature.id === 'number'
        ? String(feature.id)
        : null) ??
      (typeof props.osm_id === 'string' ? props.osm_id : null) ??
      JSON.stringify((feature.geometry as { coordinates?: unknown })?.coordinates ?? '')
    const j = stableJitter01(seedId) // [-1, +1]
    totalHeight = clamp(defaults.totalHeight * (1 + j * HEIGHT_JITTER), TOTAL_HEIGHT_RANGE)
  }

  const trunkHeight = clamp(totalHeight * TRUNK_FRACTION_OF_TOTAL, TRUNK_HEIGHT_RANGE)

  const rawDiameter = readCrownDiameter(props)
  const canopyRadius =
    rawDiameter != null
      ? clamp(rawDiameter / 2, CANOPY_RADIUS_RANGE)
      : clamp((totalHeight * CANOPY_FRACTION_OF_TOTAL) / 2, CANOPY_RADIUS_RANGE)

  const archetype = readArchetype(props)
  // Crown vertical extent for the non-round archetypes: the remainder of the
  // total height above the trunk (min 1 m so a degenerate ratio still emits
  // visible geometry). Normalized to 0 for `round` — it doesn't affect round
  // geometry, and a real value would needlessly fragment the template cache.
  const canopyHeight = archetype === 'round' ? 0 : Math.max(totalHeight - trunkHeight, 1)

  return { trunkHeight, canopyRadius, canopyHeight, archetype }
}
