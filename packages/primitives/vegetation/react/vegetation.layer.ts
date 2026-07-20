import { COORDINATE_SYSTEM } from '@deck.gl/core'
import { SimpleMeshLayer } from '@deck.gl/mesh-layers'
import type { MergedVegetationGeometry } from '../core/vegetation.merge-geometry'
import { VEGETATION_DEFAULT_COLOR } from '../core/vegetation.types'

export interface VegetationLayerOptions {
  /** RGB tuple 0-255. Default `VEGETATION_DEFAULT_COLOR`. */
  color?: [number, number, number]
  /** 0-1. Default 0.85. */
  opacity?: number
  /** Toggle without destroying GPU resources. Default true. */
  visible?: boolean
  /** Layer id override. Default `'vegetation-trees'`. */
  id?: string
  /** Z offset in metres applied to the coordinate origin. Lift tree bases
   *  to the photogrammetry terrain elevation when Google 3D Tiles are on.
   *  Composition root reads `useGoogle3DTilesStore.groundElevationM +
   *  manualElevationOffsetM`. */
  zOffsetM?: number
}

interface MeshAttribute<T> {
  value: T
  size: number
}

interface SimpleMeshFormat {
  attributes: {
    positions: MeshAttribute<Float32Array>
    normals: MeshAttribute<Float32Array>
    /** Optional per-vertex RGB (0-1 floats). When provided,
     *  SimpleMeshLayer modulates the layer-wide `getColor` by this. */
    colors?: MeshAttribute<Float32Array>
  }
  indices: MeshAttribute<Uint32Array>
}

/**
 * Build a single `SimpleMeshLayer` rendering every tree mesh as one merged
 * geometry. Returns `null` when the merged geometry is empty so the caller
 * can skip layer creation.
 *
 * Coordinates live in METER_OFFSETS relative to `origin` (the polygon-bbox
 * SW corner). One instance with `position: [0, 0, 0]` makes the merged mesh
 * sit at the origin in unmodified local meters.
 */
export function createVegetationLayer(
  merged: MergedVegetationGeometry,
  origin: [number, number],
  options: VegetationLayerOptions = {},
): SimpleMeshLayer | null {
  if (!merged || merged.vertexCount === 0) return null

  const {
    color = VEGETATION_DEFAULT_COLOR,
    // Opaque foliage. At 0.85 the 15% see-through was invisible over the dark
    // heatmap but read as washed-out/ghosted over the white buildings once the
    // depth-bias fix brought trees IN FRONT of them. Opaque also avoids the
    // semi-transparent-mesh depth/blend artifacts entirely. Callers can dial it
    // back for a softer look.
    opacity = 1,
    visible = true,
    id = 'vegetation-trees',
    zOffsetM = 0,
  } = options

  const mesh: SimpleMeshFormat = {
    attributes: {
      positions: { value: merged.positions, size: 3 },
      normals: { value: merged.normals, size: 3 },
    },
    indices: { value: merged.indices, size: 1 },
  }
  // SimpleMeshLayer multiplies vertex colors (when present) with the
  // layer-wide `getColor`. Add the `colors` attribute only when the merged
  // geometry actually carries them; otherwise fall back to the flat green
  // color the caller asked for.
  if (merged.hasColors && merged.colors.length === merged.vertexCount * 3) {
    mesh.attributes.colors = { value: merged.colors, size: 3 }
  }
  // White layer color = "use original mesh colors as-is" (per
  // SimpleMeshLayer docs). When the mesh has no colors, use the caller's
  // requested green tint.
  const layerColor: [number, number, number, number] = merged.hasColors
    ? [255, 255, 255, Math.round(255 * opacity)]
    : [color[0], color[1], color[2], Math.round(255 * opacity)]

  return new SimpleMeshLayer({
    id,
    data: [{ position: [0, 0, 0] }],
    mesh,
    getPosition: (d: { position: [number, number, number] }) => d.position,
    getColor: layerColor,
    pickable: false,
    wireframe: false,
    material: true,
    // Tree meshes aren't watertight and have inconsistent triangle winding, so
    // the default back-face cull drops the "inside"/away-facing faces and leaves
    // canopies looking half-missing (hollow / sliced). Render double-sided.
    parameters: { cullMode: 'none' },
    visible,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [origin[0], origin[1], zOffsetM],
  })
}
