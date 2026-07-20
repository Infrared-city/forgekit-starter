import {
  detectNonWgs84,
  type GroundMaterialsViewport,
  getDrawInstance,
  getMetersToLatLng,
  type MultiMaterialProcessResult,
  parseGeoJsonFile,
  processImportedFeatures,
  processMultiMaterialImport,
} from '@forge-kit/ground-materials'
import type { Feature, FeatureCollection as GeoJsonFeatureCollection } from 'geojson'

// ---------------------------------------------------------------------------
// File-size cap (mirrored from `parseGeoJsonFile` in @forge-kit/ground-materials).
// Kept in sync by hand because the constant is not exported from the package.
// If the upstream value moves, update here too.
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const FILE_TOO_LARGE = (size: number) =>
  `File is too large (${(size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`

// ---------------------------------------------------------------------------
// Types shared with the component
// ---------------------------------------------------------------------------

/** Tab the user picked above the drop zone. */
export type ImportMode = 'single' | 'multi'
/** Replace-or-add toggle, per-upload. */
export type ReplaceMode = 'add' | 'replace'

/**
 * Per-preview routing decision derived right after parsing the file.
 *
 * - `global-picker`  : every feature is unlabeled (single FC, no `material`
 *                      props) -- show the picker and stamp the chosen material
 *                      on every preview before per-feature commit.
 * - `partial-picker` : a subset of features is unlabeled -- show the picker
 *                      and stamp the choice on only those unlabeled ids
 *                      before per-feature commit (labeled features keep their
 *                      own).
 * - `per-feature`    : every feature is labeled (multi-dict tab, or single FC
 *                      where every feature already carries a valid `material`
 *                      property) -- skip the picker entirely.
 */
export type RoutingMode = 'global-picker' | 'partial-picker' | 'per-feature'

export interface PreviewMeta {
  routingMode: RoutingMode
  /** Preview ids whose features have NO `material` property -- subset of importPreviewIds. */
  unlabeledIds: string[]
  /** Distinct material names already stamped on labeled features (informational). */
  distinctLabeledMaterials: string[]
  /** Number of groups in multi-dict mode (zero for single FC). */
  groupCount: number
}

export interface SinglePipelineResult {
  features: Feature[]
  warnings: string[]
}

export interface MultiPipelineResult {
  features: Feature[]
  warnings: string[]
  result: MultiMaterialProcessResult
}

export type PipelineOutcome<T> = { ok: true; value: T } | { ok: false; error: string }

// ---------------------------------------------------------------------------
// Pure pipelines
// ---------------------------------------------------------------------------

/** Single-FC tab pipeline: parseGeoJsonFile -> processImportedFeatures. */
export async function runSingleFcPipeline(
  file: File,
  viewport: GroundMaterialsViewport,
): Promise<PipelineOutcome<SinglePipelineResult>> {
  const parseResult = await parseGeoJsonFile(file)
  if (!parseResult.ok) return { ok: false, error: parseResult.error }

  const crsWarnings: string[] = []
  if (detectNonWgs84(parseResult.featureCollection)) {
    crsWarnings.push('Non-WGS84 CRS detected. Coordinates may be incorrectly positioned.')
  }

  const metersToLatLng = getMetersToLatLng()
  const processResult = processImportedFeatures(
    parseResult.featureCollection,
    viewport,
    metersToLatLng,
  )

  const allWarnings = [...processResult.warnings, ...crsWarnings]
  if (processResult.features.features.length === 0) {
    return {
      ok: false,
      error:
        allWarnings.length > 0 ? allWarnings[0] : 'No polygons could be imported from this file.',
    }
  }

  return { ok: true, value: { features: processResult.features.features, warnings: allWarnings } }
}

/**
 * Multi-dict tab pipeline: read raw JSON ourselves (parseGeoJsonFile only
 * understands FeatureCollection roots), then route through
 * `processMultiMaterialImport` which injects `properties.material` per group
 * before flatten/clip.
 */
export async function runMultiDictPipeline(
  file: File,
  viewport: GroundMaterialsViewport,
): Promise<PipelineOutcome<MultiPipelineResult>> {
  // Enforce the same 5 MB cap as `parseGeoJsonFile` -- the multi-dict tab
  // reads `file.text()` directly so we need the guard here too. Otherwise a
  // user could DoS their own browser tab via the multi-dict path.
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: FILE_TOO_LARGE(file.size) }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { ok: false, error: 'Failed to read file.' }
  }
  let rawObject: unknown
  try {
    rawObject = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Invalid JSON. Please upload a valid GeoJSON file.' }
  }

  // CRS detection: each group value is a FeatureCollection, so run
  // `detectNonWgs84` over every FC-shaped value and emit the warning once if
  // any group trips it. Matches the single-FC pipeline behaviour.
  const crsWarnings: string[] = []
  if (detectMultiDictNonWgs84(rawObject)) {
    crsWarnings.push('Non-WGS84 CRS detected. Coordinates may be incorrectly positioned.')
  }

  const metersToLatLng = getMetersToLatLng()
  const result = processMultiMaterialImport(rawObject, viewport, metersToLatLng)

  if (result.features.features.length === 0) {
    // The helper already produces a friendly error when a user uploads a
    // bare FeatureCollection on this tab -- surface its first warning as
    // the error so the inline UI shows it (and switches the toggle hint).
    return {
      ok: false,
      error: result.warnings[0] ?? 'No polygons could be imported from this file.',
    }
  }

  return {
    ok: true,
    value: {
      features: result.features.features,
      warnings: [...result.warnings, ...crsWarnings],
      result,
    },
  }
}

/**
 * Scan a multi-dict root for any group whose value looks like a GeoJSON
 * FeatureCollection with a non-WGS84 CRS. Returns `true` on the first hit.
 *
 * Tolerant by design: anything that does not match the expected shape is
 * silently skipped -- schema validation happens inside
 * `processMultiMaterialImport`, and we only want to surface the CRS hint when
 * we are confident the data is FC-shaped.
 */
function detectMultiDictNonWgs84(rawObject: unknown): boolean {
  if (typeof rawObject !== 'object' || rawObject === null) return false
  for (const value of Object.values(rawObject as Record<string, unknown>)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      (value as { type?: unknown }).type === 'FeatureCollection' &&
      Array.isArray((value as { features?: unknown }).features)
    ) {
      if (detectNonWgs84(value as GeoJsonFeatureCollection)) return true
    }
  }
  return false
}

// ---------------------------------------------------------------------------
// Preview inspection
// ---------------------------------------------------------------------------

/**
 * Inspect freshly-added preview features and decide which routing UI to show.
 * Returns the unlabeled-id subset and the distinct labeled materials so the
 * Confirm-button label can summarize what is about to be committed.
 *
 * `knownMaterialNames` is the set of registry material names -- features
 * whose `material` label is missing from this set are treated as UNLABELED
 * (consistent with `resolvePerFeatureMaterials`: unknown labels fall back to
 * the picker / asphalt). Without this filter the UI would happily skip the
 * picker for a file labeled with garbage strings, then surface a confusing
 * warning toast after commit.
 */
export function inspectPreviewFeatures(
  previewIds: string[],
  knownMaterialNames: Set<string>,
): { unlabeledIds: string[]; distinctLabeled: string[] } {
  const draw = getDrawInstance()
  if (!draw) return { unlabeledIds: previewIds, distinctLabeled: [] }
  const unlabeledIds: string[] = []
  const distinct = new Set<string>()
  for (const id of previewIds) {
    const f = draw.get(id)
    const raw = f?.properties?.material
    const label = typeof raw === 'string' && raw.length > 0 ? raw : undefined
    if (label && knownMaterialNames.has(label)) {
      distinct.add(label)
    } else {
      unlabeledIds.push(id)
    }
  }
  return { unlabeledIds, distinctLabeled: Array.from(distinct) }
}

/**
 * Stamp a material name onto live MapboxDraw preview features. Used right
 * before per-feature confirm so `resolvePerFeatureMaterials` reads the user's
 * picker choice for unlabeled features while keeping labeled features intact.
 */
export function stampUnlabeledWithSelection(unlabeledIds: string[], materialName: string): void {
  const draw = getDrawInstance()
  if (!draw) return
  for (const id of unlabeledIds) {
    const current = draw.get(id)
    if (!current) continue
    draw.setFeatureProperty(id, 'material', materialName)
    // Force MapboxDraw to surface the property change (mirror the
    // re-add pattern used by `confirmPreviewFeaturesPerFeature`).
    const updated = draw.get(id)
    if (updated) draw.add(updated)
  }
}

// ---------------------------------------------------------------------------
// Pure presentational helpers (label strings)
// ---------------------------------------------------------------------------

/** Header above the picker -- partial-picker calls out the subset count. */
export function getPickerLabel(meta: PreviewMeta | null, totalPreviewIds: number): string {
  if (meta?.routingMode === 'partial-picker') {
    return `Material for unlabeled (${meta.unlabeledIds.length} of ${totalPreviewIds})`
  }
  return 'Select Material for Import'
}

/** Confirm button label varies by routing mode + tab. */
export function getConfirmLabel(meta: PreviewMeta | null, importMode: ImportMode): string {
  if (!meta) return 'Confirm Import'
  if (importMode === 'multi') {
    const groups = meta.groupCount
    return `Confirm Import (${groups} material group${groups === 1 ? '' : 's'})`
  }
  if (meta.routingMode === 'per-feature') {
    const m = meta.distinctLabeledMaterials.length
    return `Confirm Import (${m} material${m === 1 ? '' : 's'} labeled)`
  }
  return 'Confirm Import'
}

/** Success-toast text after a commit. Counts vary per mode. */
export function getSuccessToast(
  meta: PreviewMeta,
  importMode: ImportMode,
  committedCount: number,
): string {
  if (importMode === 'multi') {
    const groups = meta.groupCount
    return `GeoJSON imported (${groups} material group${groups === 1 ? '' : 's'}, ${committedCount} feature${committedCount === 1 ? '' : 's'}).`
  }
  if (meta.routingMode === 'per-feature') {
    const m = meta.distinctLabeledMaterials.length
    return `GeoJSON imported (${m} material${m === 1 ? '' : 's'} labeled, ${committedCount} feature${committedCount === 1 ? '' : 's'}).`
  }
  return `GeoJSON imported (${committedCount} feature${committedCount === 1 ? '' : 's'}).`
}

// ---------------------------------------------------------------------------
// Routing-mode classification
// ---------------------------------------------------------------------------

/**
 * Decide which routing mode applies given the unlabeled-id subset.
 *
 * Single FC:
 *   - 0 unlabeled  -> per-feature
 *   - all unlabeled -> global-picker
 *   - else          -> partial-picker
 *
 * Multi-dict: groups are pre-labeled by `processMultiMaterialImport`. The
 * common path is `per-feature`; if some group key fails registry validation
 * (e.g. user uploaded `{"weirdName": FC}`) we defensively fall back to
 * `partial-picker` so the user can pick an explicit material.
 */
export function classifyRoutingMode(
  importMode: ImportMode,
  totalIds: number,
  unlabeledCount: number,
): RoutingMode {
  if (unlabeledCount === 0) return 'per-feature'
  if (importMode === 'multi') return 'partial-picker'
  if (unlabeledCount === totalIds) return 'global-picker'
  return 'partial-picker'
}
