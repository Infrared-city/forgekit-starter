import type {
  Feature,
  FeatureCollection as GeoJsonFeatureCollection,
  Geometry,
  Polygon,
} from 'geojson'
import { MAX_POLYGON_COUNT, runImportPipeline } from './ground-materials.import-pipeline'
import type { FeatureCollection as SdkFeatureCollection } from './ground-materials.sdk-types'
import { ensureFeatureUuids, FeatureCollectionSchema } from './ground-materials.sdk-types'
import type { GroundMaterialsViewport, MetersToLatLngFn } from './ground-materials.types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum file size in bytes (5 MB) */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParseSuccess {
  ok: true
  featureCollection: GeoJsonFeatureCollection
}

export interface ParseError {
  ok: false
  error: string
}

export type ParseResult = ParseSuccess | ParseError

export interface ProcessResult {
  /** The processed features ready for preview */
  features: GeoJsonFeatureCollection
  /** Warnings to display to the user */
  warnings: string[]
  /** Number of non-polygon features filtered out */
  filteredNonPolygonCount: number
  /** Number of features outside the boundary */
  outsideBoundaryCount: number
  /** Number of self-intersecting (invalid) polygons */
  invalidCount: number
}

// ---------------------------------------------------------------------------
// parseGeoJsonFile
// ---------------------------------------------------------------------------

/**
 * Parse a GeoJSON file into a validated FeatureCollection.
 * Handles bare Feature and bare Geometry roots by wrapping them.
 */
export async function parseGeoJsonFile(file: File): Promise<ParseResult> {
  // Check file size
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

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'File content is not a valid GeoJSON object.' }
  }

  const obj = parsed as Record<string, unknown>

  // Wrap bare Geometry into Feature then FeatureCollection
  if (obj.type && obj.type !== 'Feature' && obj.type !== 'FeatureCollection' && obj.coordinates) {
    const wrapped: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: obj as unknown as Geometry,
          properties: {},
        },
      ],
    }
    return { ok: true, featureCollection: wrapped }
  }

  // Wrap bare Feature into FeatureCollection
  if (obj.type === 'Feature') {
    const wrapped: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [obj as unknown as Feature],
    }
    return { ok: true, featureCollection: wrapped }
  }

  // Validate as FeatureCollection
  const result = FeatureCollectionSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      error: 'Not a valid GeoJSON FeatureCollection. Please check the file format.',
    }
  }

  return {
    ok: true,
    featureCollection: result.data as unknown as GeoJsonFeatureCollection,
  }
}

// ---------------------------------------------------------------------------
// detectNonWgs84
// ---------------------------------------------------------------------------

/**
 * Detect if a FeatureCollection likely uses a non-WGS84 CRS.
 * Checks for legacy `crs` member and coordinate range heuristics.
 */
export function detectNonWgs84(fc: GeoJsonFeatureCollection): boolean {
  // Check for legacy CRS member (deprecated in GeoJSON RFC 7946 but still present in some files)
  const raw = fc as unknown as Record<string, unknown>
  if (raw.crs !== undefined && raw.crs !== null) {
    return true
  }

  // Coordinate range heuristic: check if any coordinates are outside WGS84 bounds
  for (const feature of fc.features) {
    if (!feature.geometry || !('coordinates' in feature.geometry)) continue
    const outOfRange = checkCoordinatesOutOfRange(feature.geometry.coordinates)
    if (outOfRange) return true
  }

  return false
}

/**
 * Recursively check if any coordinate pair is outside WGS84 bounds.
 */
function checkCoordinatesOutOfRange(coords: unknown): boolean {
  if (!Array.isArray(coords)) return false

  // If this looks like a coordinate pair [lng, lat, ...]
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const lng = coords[0]
    const lat = coords[1]
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return true
    }
    return false
  }

  // Otherwise recurse into nested arrays
  for (const item of coords) {
    if (checkCoordinatesOutOfRange(item)) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// buildBoundaryPolygon
// ---------------------------------------------------------------------------

/**
 * Convert a viewport (center + meters) to a GeoJSON Polygon.
 * The viewport defines a rectangle centered at (latitude, longitude) with
 * width and height in meters.
 *
 * @param viewport - Geographic viewport with center and dimensions in meters
 * @param metersToLatLng - Conversion function injected from the map interface
 */
export function buildBoundaryPolygon(
  viewport: GroundMaterialsViewport,
  metersToLatLng: MetersToLatLngFn,
): Feature<Polygon> {
  const { latitude, longitude, width, height } = viewport
  const halfW = width / 2
  const halfH = height / 2
  const origin: [number, number] = [longitude, latitude]

  // Compute the four corners in meters from center, then convert to lat/lng
  const sw = metersToLatLng({ x: -halfW, y: -halfH }, origin)
  const se = metersToLatLng({ x: halfW, y: -halfH }, origin)
  const ne = metersToLatLng({ x: halfW, y: halfH }, origin)
  const nw = metersToLatLng({ x: -halfW, y: halfH }, origin)

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [sw.lng, sw.lat],
          [se.lng, se.lat],
          [ne.lng, ne.lat],
          [nw.lng, nw.lat],
          [sw.lng, sw.lat], // close the ring
        ],
      ],
    },
  }
}

// ---------------------------------------------------------------------------
// processImportedFeatures
// ---------------------------------------------------------------------------

/**
 * Process imported GeoJSON features through the full pipeline:
 * 1. Filter non-polygon features
 * 2. Split MultiPolygons into individual Polygons
 * 3. Enforce polygon count limit
 * 4. Clip to boundary
 * 5. Check for self-intersections (mark invalid but keep)
 * 6. Assign UUIDs
 *
 * @param fc - The parsed GeoJSON FeatureCollection
 * @param boundary - Geographic viewport for clipping
 * @param metersToLatLng - Conversion function injected from the map interface
 */
export function processImportedFeatures(
  fc: GeoJsonFeatureCollection,
  boundary: GroundMaterialsViewport,
  metersToLatLng: MetersToLatLngFn,
): ProcessResult {
  const warnings: string[] = []
  const boundaryPolygon = buildBoundaryPolygon(boundary, metersToLatLng)

  const { features: clippedFeatures, counts } = runImportPipeline(
    fc,
    boundaryPolygon,
    MAX_POLYGON_COUNT,
  )
  const {
    filteredNonPolygonCount,
    outsideBoundaryCount,
    invalidCount,
    truncatedCount,
    flattenedTotal,
  } = counts

  if (filteredNonPolygonCount > 0) {
    warnings.push(
      `${filteredNonPolygonCount} non-polygon feature${filteredNonPolygonCount > 1 ? 's' : ''} filtered out.`,
    )
  }

  if (truncatedCount > 0) {
    warnings.push(
      `File contains ${flattenedTotal} polygons after splitting. Only the first ${MAX_POLYGON_COUNT} will be imported.`,
    )
  }

  if (outsideBoundaryCount > 0) {
    warnings.push(
      `${outsideBoundaryCount} polygon${outsideBoundaryCount > 1 ? 's' : ''} outside the project boundary were removed.`,
    )
  }

  if (clippedFeatures.length === 0) {
    return {
      features: { type: 'FeatureCollection', features: [] },
      warnings: ['No polygons intersect the project boundary.'],
      filteredNonPolygonCount,
      outsideBoundaryCount,
      invalidCount: 0,
    }
  }

  if (invalidCount > 0) {
    warnings.push(
      `${invalidCount} self-intersecting polygon${invalidCount > 1 ? 's' : ''} detected (marked as invalid).`,
    )
  }

  // Step 6: Assign UUIDs via SDK utility
  const resultFc: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features: clippedFeatures,
  }

  const withUuids = ensureFeatureUuids(resultFc as unknown as SdkFeatureCollection)

  return {
    features: withUuids as unknown as GeoJsonFeatureCollection,
    warnings,
    filteredNonPolygonCount,
    outsideBoundaryCount,
    invalidCount,
  }
}
