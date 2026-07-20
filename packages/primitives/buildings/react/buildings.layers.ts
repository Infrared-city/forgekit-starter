import { hexToRgb } from '@infrared/analysis-colors'
import { materialColors } from '@infrared/three-theme'
import { COORDINATE_SYSTEM, SimpleMeshLayer } from 'deck.gl'
import type { MergedGeometry } from '../core/buildings.merge-geometry'
import { dotBimToSimpleMesh } from '../core/buildings.mesh-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import { applyTransform, type BuildingTransform } from '../core/buildings.transforms'
import { MergedBuildingsLayer } from './buildings.merged-layer'

// Convert three-theme colors to RGBA for deck.gl
const buildingColors = {
  default: [255, 255, 255] as [number, number, number], // white
  hover: hexToRgb(materialColors.primaryTeal), // Teal hover state
  selected: hexToRgb(materialColors.secondaryCyan), // Cyan selected state
}

export interface BuildingLayerOptions {
  selectedId?: string
  hoveredId?: string
  transforms?: Record<string, BuildingTransform>
  opacity?: number
  visible?: boolean
  /** Z offset in metres applied to the coordinate origin. Used to lift
   *  building bases to the photogrammetry terrain elevation when Google 3D
   *  Tiles are on (HafenCity ground sits ~5-6 m above WGS84 sea level —
   *  origin Z = 0 floats buildings in air). Composition root reads
   *  `useGoogle3DTilesStore.groundElevationM + manualElevationOffsetM` and
   *  threads it through here. */
  zOffsetM?: number
}

/**
 * Creates a single MergedBuildingsLayer from pre-computed merged geometry.
 *
 * This replaces the old per-building SimpleMeshLayer approach, reducing draw calls
 * from N to 1 and eliminating deck.gl's 255 pickable layer limit.
 *
 * @param mergedGeometry - Pre-computed merged geometry (memoized in MapCanvas)
 * @param origin - Geographic origin [lng, lat] for METER_OFFSETS coordinate system
 * @param options - Layer options (selectedId, hoveredId, opacity, visible)
 * @returns A single MergedBuildingsLayer instance
 */
export function createBuildingsLayer(
  mergedGeometry: MergedGeometry,
  origin: [number, number],
  options: BuildingLayerOptions = {},
): MergedBuildingsLayer {
  // Opaque (1, not 0.92): a translucent layer falls into deck.gl's TRANSPARENT
  // pass, where the translucent ground-materials surface composites over it
  // (draw-order, not depth). Opaque buildings render in the OPAQUE pass and write
  // depth first — so the surface is correctly occluded by them, exactly like the
  // (opaque) vegetation/trees layer which never had this problem.
  const { selectedId, hoveredId, opacity = 1, visible = true, zOffsetM = 0 } = options

  return new MergedBuildingsLayer({
    id: 'buildings-merged',
    mergedGeometry,
    selectedId: selectedId ?? null,
    hoveredId: hoveredId ?? null,
    opacity,
    defaultColor: buildingColors.default,
    hoverColor: buildingColors.hover,
    selectedColor: buildingColors.selected,
    pickable: visible, // Only pickable when visible
    visible,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [origin[0], origin[1], zOffsetM],
  })
}

/**
 * @deprecated Use `createBuildingsLayer` with pre-computed `MergedGeometry` instead.
 * Kept temporarily for A/B comparison.
 *
 * Creates SimpleMeshLayers for building meshes (one layer per building).
 */
export function createBuildingMeshLayers(
  meshes: Record<string, DotBimMesh>,
  origin: [number, number],
  options: BuildingLayerOptions = {},
): SimpleMeshLayer[] {
  const { selectedId, hoveredId, transforms = {}, opacity = 0.8, visible = true } = options

  return Object.entries(meshes).map(([id, dotBimMesh]) => {
    // Apply transform if it exists
    const hasTransform = !!transforms[id]
    const transformedMesh = hasTransform ? applyTransform(dotBimMesh, transforms[id]) : dotBimMesh

    // Bypass cache for transformed meshes to ensure changes are reflected
    const mesh = dotBimToSimpleMesh(id, transformedMesh, !hasTransform)
    const isSelected = id === selectedId
    const isHovered = id === hoveredId

    // Color priority: selected (cyan) > hovered (teal) > default (gray)
    // Using theme colors from @infrared/three-theme
    let color: [number, number, number, number]
    if (isSelected) {
      color = [...buildingColors.selected, Math.round(255 * opacity)]
    } else if (isHovered) {
      color = [...buildingColors.hover, Math.round(255 * opacity)]
    } else {
      color = [...buildingColors.default, Math.round(255 * opacity)]
    }

    return new SimpleMeshLayer({
      id: `building-mesh-${id}`,
      // In METER_OFFSETS, `getPosition` is interpreted as a meter offset from `coordinateOrigin`.
      // The mesh vertices are already in local meters relative to `coordinateOrigin`, so the
      // instance position must be the zero offset.
      data: [{ position: [0, 0, 0] }],
      mesh,
      getPosition: (d: { position: [number, number, number] }) => d.position,
      getColor: color,
      pickable: visible, // Only pickable when visible
      wireframe: false,
      material: true,
      visible, // Use deck.gl's visible prop to toggle without destroying WebGL resources
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [origin[0], origin[1], 0],
    })
  })
}
