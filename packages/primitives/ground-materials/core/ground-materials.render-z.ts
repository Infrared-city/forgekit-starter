/**
 * Per-material RENDER z-offsets (metres) for the deck.gl surface display.
 *
 * Pure, framework-agnostic. This is the single source of truth for how the
 * ground-material surface polygons stack visually and where the analysis
 * result raster sits relative to them.
 *
 * Why this exists — the symptom:
 *   The display layer used to render every material polygon coplanar at z=0.
 *   Overlapping asphalt / vegetation / water / concrete / soil features then
 *   z-fight under the interleaved MapboxOverlay (deck shares its depth buffer
 *   with the Mapbox basemap), so the user "can't see anything".
 *
 * The fix — a per-material vertical offset that mirrors the SIM hierarchy.
 *   The SDK sim path (`apps/platform/client/src/lib/ground-materials-to-sdk.ts`
 *   → `MATERIAL_Z`) stacks materials in DESCENDING priority at 0.01 m steps:
 *     vegetation 0.04 > soil 0.03 > water 0.02 > concrete 0.01 > asphalt 0.0.
 *   For RENDER we keep the EXACT SAME descending order but scale to a 0.2 m
 *   step so the layers separate visibly top-down AND oblique — without being
 *   tall 3D walls. The offset is for STACKING ORDER + a thin lip, not for
 *   literal extrusion height.
 *
 * `SIM_RENDER_HIERARCHY` below is the single source of truth for the stacking
 * order; the render-z table is derived from it so the two cannot drift. The
 * `render-z` unit test asserts the table is strictly descending in that
 * sequence and that each adjacent pair is exactly `RENDER_Z_STEP_M` apart.
 *
 * NOTE: this hierarchy intentionally differs from `GROUND_MATERIAL_ORDER`
 * (vegetation > water > soil > ...), which is a clip / overlap-resolution
 * priority — a different concern from z-stacking.
 */

/** Vertical separation (metres) between two adjacent hierarchy layers. */
export const RENDER_Z_STEP_M = 0.2

/**
 * Render-stacking priority, TOP → BOTTOM. Mirrors the SDK sim `MATERIAL_Z`
 * order verbatim (vegetation 0.04 > soil 0.03 > water 0.02 > concrete 0.01 >
 * asphalt 0.0). This is the authoritative z-stacking source of truth.
 *
 * NOTE: this is NOT `GROUND_MATERIAL_ORDER` (vegetation > water > soil > ...),
 * which is a clip / overlap-resolution priority — a different concern. Keeping
 * the render order tied to the sim `MATERIAL_Z` table means what the user sees
 * stacks the same way the simulation reasons about overlaps.
 */
export const SIM_RENDER_HIERARCHY = ['vegetation', 'soil', 'water', 'concrete', 'asphalt'] as const

/**
 * Per-material RENDER z-offset (metres), descending priority.
 *
 * Derived from `SIM_RENDER_HIERARCHY` at `RENDER_Z_STEP_M` steps so the table
 * cannot drift from the hierarchy:
 *   vegetation 0.8 > soil 0.6 > water 0.4 > concrete 0.2 > asphalt 0.0.
 */
export const MATERIAL_RENDER_Z: Record<string, number> = Object.fromEntries(
  SIM_RENDER_HIERARCHY.map((name, i) => [
    name,
    // top of the list = highest z. index 0 → 4 steps, last → 0 steps.
    // Round to kill float drift (e.g. 3 * 0.2 = 0.6000000000000001).
    Number(((SIM_RENDER_HIERARCHY.length - 1 - i) * RENDER_Z_STEP_M).toFixed(6)),
  ]),
)

/**
 * Fallback render-z for a material name not in `MATERIAL_RENDER_Z` (e.g. a
 * custom registry entry the platform forwards verbatim). Sits mid-stack —
 * between concrete (0.2) and soil (0.6) — so unknown surfaces are plausibly
 * visible without clobbering a known class.
 */
export const DEFAULT_RENDER_Z = 0.3

/** Render-z of the highest surface in the stack (vegetation, 0.8 m). */
export const TOP_SURFACE_RENDER_Z = Math.max(...Object.values(MATERIAL_RENDER_Z))

/**
 * Clearance (metres) the analysis result raster sits ABOVE the top surface.
 * Keeps the heatmap/bitmap visibly over the material polygons instead of
 * z-fighting with (or hiding behind) them.
 */
export const ANALYSIS_ABOVE_SURFACES_M = 0.5

/**
 * Render z-offset (metres) for a ground-material surface, keyed on the
 * canonical material name (case-insensitive). Unknown / missing names get
 * `DEFAULT_RENDER_Z`.
 */
export function groundMaterialRenderZ(material: string | null | undefined): number {
  if (!material) return DEFAULT_RENDER_Z
  const z = MATERIAL_RENDER_Z[material.toLowerCase()]
  return z ?? DEFAULT_RENDER_Z
}

/**
 * Elevation (metres) at which the analysis result raster should render so it
 * sits `ANALYSIS_ABOVE_SURFACES_M` above the top surface.
 *
 * @param baseElevationM - Any underlying scene lift (e.g. Google 3D Tiles
 *   `groundElevationM + manualElevationOffsetM`). Defaults to 0.
 */
export function analysisAboveSurfacesZ(baseElevationM = 0): number {
  return baseElevationM + TOP_SURFACE_RENDER_Z + ANALYSIS_ABOVE_SURFACES_M
}
