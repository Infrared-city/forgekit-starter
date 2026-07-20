import {
  computeOriginFromPolygon,
  computeOriginFromViewport as geoComputeOriginFromViewport,
  METERS_PER_DEG_LAT,
  metersPerDegLng,
} from '@forge-kit/geo-core'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { Polygon as GeoJsonPolygon } from 'geojson'
import * as THREE from 'three'
import {
  clearMeshCache as clearCache,
  getCachedMesh,
  getMeshCacheStats,
  invalidateMesh,
  setCachedMesh,
} from './buildings.mesh-cache'
import type { DotBimMesh } from './buildings.sdk-types'
import { createTimeSlicer, type TimeSliceOpts } from './buildings.timeslice'
import type { Viewport } from './buildings.types'

/**
 * SimpleMeshLayer mesh format (plain object with attributes and indices)
 */
export interface SimpleMeshFormat {
  attributes: {
    positions: { value: Float32Array; size: 3 }
    normals: { value: Float32Array; size: 3 }
  }
  indices: { value: Uint32Array; size: 1 }
}

/**
 * Converts a DotBimMesh to THREE.js BufferGeometry.
 * User-provided helper function.
 */
export function getBufferGeometryFromDotBimMesh(dotBimMesh: DotBimMesh): THREE.BufferGeometry {
  const vertices = dotBimMesh.coordinates
  const indices = dotBimMesh.indices

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  if (indices) {
    geometry.setIndex(indices)
  }

  return geometry
}

/**
 * Converts a THREE.js BufferGeometry back to a DotBimMesh.
 * User-provided helper function (not used in this migration, but kept for symmetry).
 */
export function getDotBimMeshFromBufferGeometry(bufferGeometry: THREE.BufferGeometry): DotBimMesh {
  const mesh: DotBimMesh = {
    mesh_id: bufferGeometry.id,
    coordinates: Array.from(bufferGeometry.getAttribute('position').array) as number[],
    indices: bufferGeometry.getIndex()
      ? (Array.from(bufferGeometry.getIndex()!.array) as number[])
      : undefined,
  }

  return mesh
}

/**
 * Computes the geographic origin (south-west / bottom-left corner) from a
 * viewport. The viewport stores CENTER coordinates; this derives the SW corner.
 * DotBimMesh coordinates are in local meters from this origin. Thin wrapper over
 * the shared geo-core projection (preserves the {@link Viewport} signature).
 */
export function computeOriginFromViewport(viewport: Viewport): [number, number] {
  return geoComputeOriginFromViewport(viewport)
}

// Shared SW-corner origin — re-exported from the single source of truth so
// buildings, trees, and surfaces project from the IDENTICAL origin (required
// for them to share one METER_OFFSETS depth space).
export { computeOriginFromPolygon } from '@forge-kit/geo-core'

/**
 * Filters a buildings dict to only include buildings whose centroid falls
 * inside the given polygon.
 *
 * Building coordinates are in local meters from the polygon bbox SW corner.
 * We compute each building's XY centroid, convert back to lng/lat, and test
 * against the polygon with `@turf/boolean-point-in-polygon`.
 */
export function filterBuildingsByPolygon(
  meshes: Record<string, DotBimMesh>,
  polygon: GeoJsonPolygon,
): Record<string, DotBimMesh> {
  const test = makeCentroidInPolygonTest(polygon)
  const filtered: Record<string, DotBimMesh> = {}

  for (const [id, mesh] of Object.entries(meshes)) {
    if (test(mesh)) filtered[id] = mesh
  }

  return filtered
}

/**
 * Time-sliced twin of {@link filterBuildingsByPolygon} — IDENTICAL output
 * (both share `makeCentroidInPolygonTest`; a test pins key equality), but
 * yields to the event loop between buildings. Returns `null` when aborted.
 * Part of the project-load unfreeze; see `buildings.timeslice.ts` for why
 * this is sliced rather than worker-ized.
 */
export async function filterBuildingsByPolygonChunked(
  meshes: Record<string, DotBimMesh>,
  polygon: GeoJsonPolygon,
  opts: TimeSliceOpts = {},
): Promise<Record<string, DotBimMesh> | null> {
  const test = makeCentroidInPolygonTest(polygon)
  const slicer = createTimeSlicer(opts)
  const filtered: Record<string, DotBimMesh> = {}

  for (const [id, mesh] of Object.entries(meshes)) {
    if (!(await slicer.checkpoint())) return null
    if (test(mesh)) filtered[id] = mesh
  }

  return filtered
}

/** Per-building centroid-in-polygon predicate shared by the sync and chunked
 *  filters (MUST NOT drift). Hoists the origin + per-degree longitude factor
 *  (one cos) out of the loop — geo-core's metersToLatLng would recompute it
 *  per building. */
function makeCentroidInPolygonTest(polygon: GeoJsonPolygon): (mesh: DotBimMesh) => boolean {
  const [originLng, originLat] = computeOriginFromPolygon(polygon)
  const metersPerDegreeLng = metersPerDegLng(originLat)

  return (mesh: DotBimMesh): boolean => {
    const coords = mesh.coordinates
    if (!coords || coords.length < 3) return false

    // Compute centroid in local meters (average of all vertex x,y)
    const vertexCount = coords.length / 3
    let sumX = 0
    let sumY = 0
    for (let i = 0; i < vertexCount; i++) {
      sumX += coords[i * 3]
      sumY += coords[i * 3 + 1]
    }
    const cx = sumX / vertexCount
    const cy = sumY / vertexCount

    // Convert meters back to lng/lat via the shared projection constants
    const lng = originLng + cx / metersPerDegreeLng
    const lat = originLat + cy / METERS_PER_DEG_LAT

    return booleanPointInPolygon([lng, lat], polygon)
  }
}

/**
 * Converts a THREE.BufferGeometry to SimpleMeshLayer mesh format.
 * Extracts positions, normals, and indices as typed arrays.
 */
export function bufferGeometryToSimpleMesh(geometry: THREE.BufferGeometry): SimpleMeshFormat {
  const positionAttr = geometry.getAttribute('position')
  const normalAttr = geometry.getAttribute('normal')
  const indexAttr = geometry.getIndex()

  if (!positionAttr) {
    throw new Error('BufferGeometry missing position attribute')
  }

  const positions = new Float32Array(positionAttr.array)
  const normals = normalAttr
    ? new Float32Array(normalAttr.array)
    : new Float32Array(positions.length)
  const indices = indexAttr
    ? new Uint32Array(indexAttr.array)
    : generateSequentialIndices(positions.length / 3)

  return {
    attributes: {
      positions: { value: positions, size: 3 },
      normals: { value: normals, size: 3 },
    },
    indices: { value: indices, size: 1 },
  }
}

/**
 * Generates sequential triangle indices [0,1,2, 3,4,5, ...] for meshes without indices.
 */
function generateSequentialIndices(vertexCount: number): Uint32Array {
  const indices = new Uint32Array(vertexCount)
  for (let i = 0; i < vertexCount; i++) {
    indices[i] = i
  }
  return indices
}

/**
 * Converts a DotBimMesh to SimpleMeshLayer format with LRU caching.
 *
 * The cache is bounded to 100MB and uses LRU eviction. Set useCache to false
 * for transformed meshes to bypass cache (e.g., when applying transforms).
 *
 * @param id - Unique identifier for the mesh (used as cache key)
 * @param dotBimMesh - The DotBimMesh to convert
 * @param useCache - Whether to use caching (default: true)
 * @returns SimpleMeshFormat suitable for DeckGL SimpleMeshLayer
 */
export function dotBimToSimpleMesh(
  id: string,
  dotBimMesh: DotBimMesh,
  useCache: boolean = true,
): SimpleMeshFormat {
  // Check cache first
  if (useCache) {
    const cached = getCachedMesh(id)
    if (cached) return cached
  } else {
    // Invalidate cached version since mesh was transformed
    invalidateMesh(id)
  }

  // DotBimMesh -> THREE.BufferGeometry
  const geometry = getBufferGeometryFromDotBimMesh(dotBimMesh)

  // Compute normals using THREE.js
  geometry.computeVertexNormals()

  // THREE.BufferGeometry -> SimpleMeshLayer format
  const mesh = bufferGeometryToSimpleMesh(geometry)

  // Cache the result (LRU cache handles eviction automatically)
  if (useCache) {
    setCachedMesh(id, mesh)
  }

  return mesh
}

/**
 * Clears the mesh cache (useful for testing or when data changes).
 */
export function clearMeshCache(): void {
  clearCache()
}

// Re-export cache stats for debugging
export { getMeshCacheStats }
