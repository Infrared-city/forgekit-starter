import type { DotBimMesh } from './buildings.sdk-types'
import { createTimeSlicer, type TimeSliceOpts } from './buildings.timeslice'
import { applyTransform, type BuildingTransform } from './buildings.transforms'

/**
 * Merged geometry containing all building meshes in a single set of typed arrays,
 * with per-vertex building identification for GPU picking and partial color updates.
 */
export interface MergedGeometry {
  /** Flat Float32Array of vertex positions [x,y,z, x,y,z, ...] */
  positions: Float32Array
  /** Flat Float32Array of vertex normals [nx,ny,nz, ...] */
  normals: Float32Array
  /** Triangle indices (offset-adjusted for the merged buffer) */
  indices: Uint32Array
  /** Per-vertex building index as Float32Array (needed for GPU attribute, not just CPU lookup) */
  buildingIndices: Float32Array
  /** Ordered array of building IDs matching Object.entries() iteration order */
  buildingIds: string[]
  /** Per-building vertex range: [startVertex, vertexCount] for partial color updates */
  buildingRanges: [number, number][]
  /** Total number of vertices in the merged buffer */
  vertexCount: number
  /** Total number of triangles in the merged buffer */
  triangleCount: number
}

/**
 * Generates sequential triangle indices [0, 1, 2, 3, 4, 5, ...] for meshes without indices.
 */
function generateSequentialIndices(vertexCount: number): Uint32Array {
  const indices = new Uint32Array(vertexCount)
  for (let i = 0; i < vertexCount; i++) {
    indices[i] = i
  }
  return indices
}

/**
 * Compute flat-shaded vertex normals for an indexed triangle mesh.
 *
 * Self-contained (no Three.js dependency) — accepts `coordinates` + `indices`,
 * returns a `Float32Array` of normals of the same length as positions. The
 * result is identical to THREE's `BufferGeometry.computeVertexNormals()`:
 * area-weighted face cross-products `(B-A)×(C-A)` summed per vertex, then
 * normalized. Avoids allocating a THREE `BufferGeometry` per building on the
 * main thread (the merge hot path). Mirrors the vegetation primitive's copy.
 */
function computeVertexNormals(coordinates: number[], indices: Uint32Array): Float32Array {
  const vertexCount = coordinates.length / 3
  const normals = new Float32Array(coordinates.length)

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3
    const b = indices[i + 1] * 3
    const c = indices[i + 2] * 3

    const ax = coordinates[a]
    const ay = coordinates[a + 1]
    const az = coordinates[a + 2]
    const bx = coordinates[b]
    const by = coordinates[b + 1]
    const bz = coordinates[b + 2]
    const cx = coordinates[c]
    const cy = coordinates[c + 1]
    const cz = coordinates[c + 2]

    const abx = bx - ax
    const aby = by - ay
    const abz = bz - az
    const acx = cx - ax
    const acy = cy - ay
    const acz = cz - az

    const nx = aby * acz - abz * acy
    const ny = abz * acx - abx * acz
    const nz = abx * acy - aby * acx

    normals[a] += nx
    normals[a + 1] += ny
    normals[a + 2] += nz
    normals[b] += nx
    normals[b + 1] += ny
    normals[b + 2] += nz
    normals[c] += nx
    normals[c + 1] += ny
    normals[c + 2] += nz
  }

  for (let i = 0; i < vertexCount; i++) {
    const nx = normals[i * 3]
    const ny = normals[i * 3 + 1]
    const nz = normals[i * 3 + 2]
    const len = Math.hypot(nx, ny, nz) || 1
    normals[i * 3] = nx / len
    normals[i * 3 + 1] = ny / len
    normals[i * 3 + 2] = nz / len
  }

  return normals
}

/**
 * Merges all DotBimMesh entries into a single set of typed arrays with per-vertex
 * building identification. Empty meshes (0 coordinates) are skipped.
 *
 * @param meshes - Record of building ID to DotBimMesh
 * @param transforms - Optional per-building transforms to apply before merging
 * @returns MergedGeometry with combined buffers and building metadata
 */
export function mergeBuildings(
  meshes: Record<string, DotBimMesh>,
  transforms?: Record<string, BuildingTransform>,
): MergedGeometry {
  // First pass: collect valid entries + total sizes, skipping empty meshes.
  const validEntries: BuildingEntry[] = []
  for (const [id, rawMesh] of Object.entries(meshes)) {
    const entry = collectEntry(id, rawMesh, transforms)
    if (entry) validEntries.push(entry)
  }

  const state = allocMergeState(validEntries)
  if (!state) return EMPTY_MERGED_GEOMETRY()

  // Second pass: fill buffers.
  for (let bi = 0; bi < validEntries.length; bi++) {
    fillEntry(validEntries[bi], bi, state)
  }

  return finalizeMergeState(state)
}

/**
 * Time-sliced twin of {@link mergeBuildings} for the project-load hot path —
 * IDENTICAL output (both passes share `collectEntry`/`fillEntry`; a test pins
 * buffer equality), but yields to the event loop between buildings so a
 * 100k-building city no longer freezes the viewport for the whole merge.
 * Returns `null` when aborted via `opts.shouldAbort` (stale result — discard).
 *
 * A worker is deliberately NOT used here: meshes are plain `number[]`
 * objects, and structured-cloning a whole city across a worker boundary
 * blocks the main thread about as long as the merge itself. See
 * `buildings.timeslice.ts`.
 */
export async function mergeBuildingsChunked(
  meshes: Record<string, DotBimMesh>,
  transforms?: Record<string, BuildingTransform>,
  opts: TimeSliceOpts = {},
): Promise<MergedGeometry | null> {
  const slicer = createTimeSlicer(opts)

  const validEntries: BuildingEntry[] = []
  for (const [id, rawMesh] of Object.entries(meshes)) {
    // applyTransform copies whole coordinate arrays — checkpoint the collect
    // pass too, not just the fill.
    if (!(await slicer.checkpoint())) return null
    const entry = collectEntry(id, rawMesh, transforms)
    if (entry) validEntries.push(entry)
  }

  const state = allocMergeState(validEntries)
  if (!state) return EMPTY_MERGED_GEOMETRY()

  for (let bi = 0; bi < validEntries.length; bi++) {
    if (!(await slicer.checkpoint())) return null
    fillEntry(validEntries[bi], bi, state)
  }

  return finalizeMergeState(state)
}

// ── shared per-building steps (sync + chunked merge MUST NOT drift) ─────────

interface BuildingEntry {
  id: string
  mesh: DotBimMesh
  vertexCount: number
  indexCount: number
}

/** Phase-1 step: validate one mesh + apply its transform. Null = skip. */
function collectEntry(
  id: string,
  rawMesh: DotBimMesh,
  transforms?: Record<string, BuildingTransform>,
): BuildingEntry | null {
  // Skip empty meshes (0 coordinates)
  if (!rawMesh.coordinates || rawMesh.coordinates.length === 0) return null
  // Apply transform if it exists
  const mesh = transforms?.[id] ? applyTransform(rawMesh, transforms[id]) : rawMesh
  const vertexCount = mesh.coordinates.length / 3
  const indexCount = mesh.indices ? mesh.indices.length : vertexCount
  return { id, mesh, vertexCount, indexCount }
}

interface MergeState {
  positions: Float32Array
  normals: Float32Array
  indices: Uint32Array
  buildingIndices: Float32Array
  buildingIds: string[]
  buildingRanges: [number, number][]
  totalVertices: number
  totalIndices: number
  vertexOffset: number
  indexOffset: number
}

function EMPTY_MERGED_GEOMETRY(): MergedGeometry {
  return {
    positions: new Float32Array(0),
    normals: new Float32Array(0),
    indices: new Uint32Array(0),
    buildingIndices: new Float32Array(0),
    buildingIds: [],
    buildingRanges: [],
    vertexCount: 0,
    triangleCount: 0,
  }
}

/** Allocate the merged buffers for the collected entries; null when empty. */
function allocMergeState(validEntries: BuildingEntry[]): MergeState | null {
  let totalVertices = 0
  let totalIndices = 0
  for (const e of validEntries) {
    totalVertices += e.vertexCount
    totalIndices += e.indexCount
  }
  if (totalVertices === 0) return null
  return {
    positions: new Float32Array(totalVertices * 3),
    normals: new Float32Array(totalVertices * 3),
    indices: new Uint32Array(totalIndices),
    buildingIndices: new Float32Array(totalVertices),
    buildingIds: [],
    buildingRanges: [],
    totalVertices,
    totalIndices,
    vertexOffset: 0,
    indexOffset: 0,
  }
}

/** Phase-2 step: copy one building's positions/normals/indices into the
 *  merged buffers and advance the offsets. */
function fillEntry(entry: BuildingEntry, bi: number, state: MergeState): void {
  const { mesh, vertexCount, indexCount } = entry
  const { positions, normals, indices, buildingIndices, vertexOffset, indexOffset } = state

  // Record building metadata
  state.buildingIds.push(entry.id)
  state.buildingRanges.push([vertexOffset, vertexCount])

  // Copy positions directly from coordinates
  for (let i = 0; i < vertexCount * 3; i++) {
    positions[vertexOffset * 3 + i] = mesh.coordinates[i]
  }

  // Mesh-local triangle indices (0-based within this mesh).
  const meshIndices = mesh.indices
    ? new Uint32Array(mesh.indices)
    : generateSequentialIndices(vertexCount)

  // Flat-shaded normals via the pure, dependency-free path — no per-building
  // THREE.BufferGeometry allocation on the main thread. Identical result to
  // THREE's computeVertexNormals (area-weighted face cross-products summed
  // per vertex, then normalized).
  const meshNormals = computeVertexNormals(mesh.coordinates, meshIndices)
  for (let i = 0; i < vertexCount * 3; i++) {
    normals[vertexOffset * 3 + i] = meshNormals[i]
  }

  // Copy indices with vertex offset adjustment
  for (let i = 0; i < indexCount; i++) {
    indices[indexOffset + i] = meshIndices[i] + vertexOffset
  }

  // Fill per-vertex building index
  for (let i = 0; i < vertexCount; i++) {
    buildingIndices[vertexOffset + i] = bi
  }

  state.vertexOffset += vertexCount
  state.indexOffset += indexCount
}

function finalizeMergeState(state: MergeState): MergedGeometry {
  return {
    positions: state.positions,
    normals: state.normals,
    indices: state.indices,
    buildingIndices: state.buildingIndices,
    buildingIds: state.buildingIds,
    buildingRanges: state.buildingRanges,
    vertexCount: state.totalVertices,
    triangleCount: state.totalIndices / 3,
  }
}
