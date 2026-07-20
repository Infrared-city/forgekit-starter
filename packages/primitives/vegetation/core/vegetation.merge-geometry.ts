import type { DotBimMesh } from './vegetation.sdk-types'
import { createTimeSlicer, type TimeSliceOpts } from './vegetation.timeslice'

/**
 * Merged geometry containing all tree meshes in a single set of typed arrays.
 *
 * Mirrors `@forge-kit/buildings/core` `MergedGeometry` (sans transforms).
 * Per-vertex `treeIndex` enables shader-side depth offsets to avoid z-fighting
 * between coplanar leaves of neighbouring trees.
 */
export interface MergedVegetationGeometry {
  positions: Float32Array
  normals: Float32Array
  indices: Uint32Array
  treeIndices: Float32Array
  treeIds: string[]
  treeRanges: [number, number][]
  vertexCount: number
  triangleCount: number
  /** Per-vertex RGB colors in 0-1 normalized range (Float32Array, length =
   *  vertexCount * 3). All zeros when no source mesh supplied colors, in
   *  which case the layer's flat `getColor` is used unmodified. */
  colors: Float32Array
  /** True when at least one source mesh supplied a `colors` buffer — drives
   *  the layer's `getColor` accessor (white tint to preserve vertex colors
   *  vs flat green when absent). */
  hasColors: boolean
}

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
 * returns a `Float32Array` of normals of the same length as positions.
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
 * Merge an array of DotBimMesh entries into a single MergedVegetationGeometry.
 *
 * Empty meshes are skipped. Tree ids are derived from `mesh_id` (cast to
 * string) so picking can reach back to the originating feature.
 */
export function mergeVegetationMeshes(meshes: DotBimMesh[]): MergedVegetationGeometry {
  const valid: VegEntry[] = []
  for (const mesh of meshes) {
    const entry = collectVegEntry(mesh)
    if (entry) valid.push(entry)
  }

  const state = allocVegState(valid)
  if (!state) return EMPTY_VEG_GEOMETRY()

  for (let t = 0; t < valid.length; t++) {
    fillVegEntry(valid[t], t, state)
  }

  return finalizeVegState(state)
}

/**
 * Time-sliced twin of {@link mergeVegetationMeshes} for the project-load hot
 * path — IDENTICAL output (both passes share `collectVegEntry`/`fillVegEntry`;
 * a test pins buffer equality), but yields to the event loop between trees so
 * a dense AOI no longer freezes the viewport for the whole merge. Returns
 * `null` when aborted via `opts.shouldAbort` (stale result — discard).
 * See `vegetation.timeslice.ts` for why this is sliced, not worker-ized.
 */
export async function mergeVegetationMeshesChunked(
  meshes: DotBimMesh[],
  opts: TimeSliceOpts = {},
): Promise<MergedVegetationGeometry | null> {
  const slicer = createTimeSlicer(opts)

  const valid: VegEntry[] = []
  for (const mesh of meshes) {
    if (!(await slicer.checkpoint())) return null
    const entry = collectVegEntry(mesh)
    if (entry) valid.push(entry)
  }

  const state = allocVegState(valid)
  if (!state) return EMPTY_VEG_GEOMETRY()

  for (let t = 0; t < valid.length; t++) {
    if (!(await slicer.checkpoint())) return null
    fillVegEntry(valid[t], t, state)
  }

  return finalizeVegState(state)
}

// ── shared per-tree steps (sync + chunked merge MUST NOT drift) ─────────────

interface VegEntry {
  id: string
  mesh: DotBimMesh
  vertexCount: number
  indexCount: number
  indices: Uint32Array
}

function collectVegEntry(mesh: DotBimMesh): VegEntry | null {
  if (!mesh.coordinates || mesh.coordinates.length === 0) return null
  const vertexCount = mesh.coordinates.length / 3
  const meshIndices = mesh.indices
    ? new Uint32Array(mesh.indices)
    : generateSequentialIndices(vertexCount)
  return {
    id: String(mesh.mesh_id),
    mesh,
    vertexCount,
    indexCount: meshIndices.length,
    indices: meshIndices,
  }
}

interface VegMergeState {
  positions: Float32Array
  normals: Float32Array
  indices: Uint32Array
  treeIndices: Float32Array
  colors: Float32Array
  treeIds: string[]
  treeRanges: [number, number][]
  hasColors: boolean
  totalVertices: number
  totalIndices: number
  vertexOffset: number
  indexOffset: number
}

function EMPTY_VEG_GEOMETRY(): MergedVegetationGeometry {
  return {
    positions: new Float32Array(0),
    normals: new Float32Array(0),
    indices: new Uint32Array(0),
    treeIndices: new Float32Array(0),
    treeIds: [],
    treeRanges: [],
    vertexCount: 0,
    triangleCount: 0,
    colors: new Float32Array(0),
    hasColors: false,
  }
}

function allocVegState(valid: VegEntry[]): VegMergeState | null {
  let totalVertices = 0
  let totalIndices = 0
  for (const e of valid) {
    totalVertices += e.vertexCount
    totalIndices += e.indexCount
  }
  if (totalVertices === 0) return null
  return {
    positions: new Float32Array(totalVertices * 3),
    normals: new Float32Array(totalVertices * 3),
    indices: new Uint32Array(totalIndices),
    treeIndices: new Float32Array(totalVertices),
    colors: new Float32Array(totalVertices * 3),
    treeIds: [],
    treeRanges: [],
    hasColors: false,
    totalVertices,
    totalIndices,
    vertexOffset: 0,
    indexOffset: 0,
  }
}

function fillVegEntry(entry: VegEntry, t: number, state: VegMergeState): void {
  const { id, mesh, vertexCount, indexCount, indices: meshIndices } = entry
  const { positions, normals, indices, treeIndices, colors, vertexOffset, indexOffset } = state

  state.treeIds.push(id)
  state.treeRanges.push([vertexOffset, vertexCount])

  for (let i = 0; i < vertexCount * 3; i++) {
    positions[vertexOffset * 3 + i] = mesh.coordinates[i]
  }

  const meshNormals = computeVertexNormals(mesh.coordinates, meshIndices)
  for (let i = 0; i < vertexCount * 3; i++) {
    normals[vertexOffset * 3 + i] = meshNormals[i]
  }

  for (let i = 0; i < indexCount; i++) {
    indices[indexOffset + i] = meshIndices[i] + vertexOffset
  }

  for (let i = 0; i < vertexCount; i++) {
    treeIndices[vertexOffset + i] = t
  }

  // Per-vertex colors: SimpleMeshLayer modulates `getColor` by the mesh's
  // `colors` attribute in 0-1 float range, so normalize from the 0-255
  // RGB stored on the source mesh. When absent, leave zeros + flag the
  // layer to use a flat color via `getColor` instead.
  if (mesh.colors && mesh.colors.length >= vertexCount * 3) {
    state.hasColors = true
    for (let i = 0; i < vertexCount * 3; i++) {
      colors[vertexOffset * 3 + i] = mesh.colors[i] / 255
    }
  }

  state.vertexOffset += vertexCount
  state.indexOffset += indexCount
}

function finalizeVegState(state: VegMergeState): MergedVegetationGeometry {
  return {
    positions: state.positions,
    normals: state.normals,
    indices: state.indices,
    treeIndices: state.treeIndices,
    treeIds: state.treeIds,
    treeRanges: state.treeRanges,
    vertexCount: state.totalVertices,
    triangleCount: state.totalIndices / 3,
    colors: state.colors,
    hasColors: state.hasColors,
  }
}
