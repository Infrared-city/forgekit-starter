/**
 * deck.gl PolygonLayer factory rendering SDK-fetched ground material polygons.
 *
 * Stacking — the core of this factory:
 *   Material polygons used to render coplanar at z=0 and z-fought under the
 *   interleaved MapboxOverlay (deck shares its depth buffer with Mapbox's
 *   basemap), so overlapping asphalt / vegetation / water / concrete / soil
 *   collapsed into an unreadable mess. We now give each material a per-layer
 *   RENDER elevation from `groundMaterialRenderZ` — the SAME descending
 *   hierarchy the SDK sim uses (`MATERIAL_Z`), scaled to 0.2 m steps:
 *   vegetation 0.8 > soil 0.6 > water 0.4 > concrete 0.2 > asphalt 0.0. The
 *   layer is `extruded` so the offset is a real depth-buffer Z (a thin lip),
 *   not a painter's-order trick — it reads cleanly top-down AND oblique.
 *
 * Boundary clip:
 *   Features normally arrive pre-clipped — `clipAreaLayersToPolygon` runs in
 *   `useGroundMaterialsAreaMutation` before the store write, which keeps us
 *   off `MaskExtension` (it silently breaks under `MapboxOverlay`'s
 *   `interleaved: true`). For paths that don't pre-clip (e.g. BYO upload) the
 *   caller can pass `boundaryPolygon` here and the factory clips at render
 *   time as a safety net so nothing bleeds past the outline.
 */
import { COORDINATE_SYSTEM, type Layer } from '@deck.gl/core'
import { PolygonLayer } from '@deck.gl/layers'
import { latLngToMetersLocal } from '@forge-kit/geo-core'
import type { Polygon as GeoJsonPolygon, MultiPolygon, Position } from 'geojson'
import { clipAreaLayersToPolygon } from '../core/ground-materials.area-clip'
import { normalizeAreaPolygonCoordinates } from '../core/ground-materials.area-geometry'
import type { LooseMaterialLayers } from '../core/ground-materials.area-normalize'
import { type GroundMaterialColorMode, pastelizeGroundColor } from '../core/ground-materials.colors'
import { groundMaterialRenderZ } from '../core/ground-materials.render-z'
import type { GroundMaterialRegistry } from '../core/ground-materials.sdk-types'
import type { MaterialLayers, SdkFeatureCollection } from './ground-materials.store'

/**
 * Loose GeoJSON Polygon/MultiPolygon feature shape arriving from the SDK area
 * fetch. clean-v3 stamps 3D coords `[lon, lat, z]` per-material; the busier
 * layers also carry holes and post-clip slivers.
 */
interface PolygonFeature {
  geometry?: { type?: string; coordinates?: Position[][] | MultiPolygon['coordinates'] }
}

/**
 * What `getPolygon` hands the extruded `PolygonLayer`: ONE cleaned single polygon
 * as a 2D ring-array `[outerRing, ...holes]`. Coordinates are pre-normalised (z
 * stripped, uniform 2D, degenerate/null rings dropped) so the tessellator never
 * sees the mixed-dimensionality stride mis-alignment or null rings that crash it.
 * Paired with `positionFormat: 'XY'` on the layer so `positionSize` is exactly 2.
 * A MultiPolygon feature becomes MULTIPLE RenderPolygons (one per part) — never a
 * nested `Position[][][]`, which `PolygonLayer` mis-reads.
 */
interface RenderPolygon {
  polygon: Position[][]
}

/**
 * Pre-normalise a layer's raw SDK features into clean render polygons. Each
 * feature yields one render polygon per part (a MultiPolygon → N items), so the
 * layer only ever sees single polygons. Features whose geometry normalises to
 * nothing usable (all-degenerate / empty) contribute nothing — and are counted
 * so the caller can surface a signal rather than silently losing data (a silent
 * drop hides an upstream SDK data-quality regression).
 */
function toRenderPolygons(features: Array<Record<string, unknown>>): {
  polygons: RenderPolygon[]
  dropped: number
} {
  const out: RenderPolygon[] = []
  let dropped = 0
  for (const feature of features) {
    const geometry = (feature as PolygonFeature)?.geometry
    const polygons = normalizeAreaPolygonCoordinates(geometry?.coordinates, geometry?.type)
    if (polygons.length === 0) dropped++
    for (const polygon of polygons) out.push({ polygon })
  }
  return { polygons: out, dropped }
}

export interface GroundMaterialsAreaLayerOptions {
  /** Master visibility flag — applied to every layer returned. */
  visible?: boolean
  /** Fill alpha 0-255. Default 140 (~0.55). */
  fillAlpha?: number
  /** Outline alpha 0-255. Default 200. */
  lineAlpha?: number
  /** Outline thickness in pixels. Default 0 (no outline). Outlines on
   *  hundreds of overlapping small features cause horizontal moire at any
   *  pitch under interleaved MapboxOverlay mode; opt in only when the
   *  material count is small and the camera is mostly top-down. */
  lineWidthMinPixels?: number
  /** Scene base lift (m) added beneath every material's render-z. Composition
   *  root threads `groundElevationM + manualElevationOffsetM` when Google 3D
   *  Tiles are on so surfaces sit on the photogrammetry floor; defaults to 0
   *  (flat at WGS84 z=0). */
  zOffsetM?: number
  /** Optional boundary polygon. When provided, layers are clipped to it at
   *  render time (safety net for paths that don't pre-clip on the data side).
   *  Pass `null`/omit when the data is already clipped (the SDK display path).
   */
  boundaryPolygon?: GeoJsonPolygon | null
  /** Theme for the on-map fill treatment. The registry `diffuseColor` (sim
   *  input) is left untouched; the rendered fill is softened to a calm pastel —
   *  bright in `light`, muted toward a mid-tone in `dark`. Default `light`. */
  colorMode?: GroundMaterialColorMode
  /** Shared METER_OFFSETS origin `[lng, lat]` — the SAME origin buildings/trees
   *  use (`computeOriginFromPolygon(boundary)`). When set, the surface renders
   *  in `METER_OFFSETS` off this origin with depth testing ON, so it shares the
   *  buildings' depth space and the buildings OCCLUDE it (fixes the surface
   *  painting over buildings). When `null`/omitted, the legacy `LNGLAT` +
   *  `depthTest:false` path is used unchanged. */
  coordinateOrigin?: [number, number] | null
}

const FALLBACK_RGB: [number, number, number] = [160, 160, 160]

/**
 * Look up the registry's `diffuseColor` (0-1 RGB tuple) for a material `name`.
 * Returns 0-255 RGB. Case-insensitive name match.
 */
function colorForLayerName(
  layerName: string,
  registry: GroundMaterialRegistry,
): [number, number, number] {
  const lname = layerName.toLowerCase()
  for (const material of Object.values(registry.materials)) {
    if (material.name.toLowerCase() === lname) {
      const [r, g, b] = material.diffuseColor
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
    }
  }
  return FALLBACK_RGB
}

/**
 * Build one extruded `PolygonLayer` per material layer keyed in `layers`.
 * Returns an empty array when there is nothing to render.
 */
export function createGroundMaterialsAreaLayer(
  layers: MaterialLayers,
  registry: GroundMaterialRegistry,
  options: GroundMaterialsAreaLayerOptions = {},
): Layer[] {
  const {
    visible = true,
    fillAlpha = 140,
    lineAlpha = 200,
    lineWidthMinPixels = 0,
    zOffsetM = 0,
    boundaryPolygon = null,
    coordinateOrigin = null,
    colorMode = 'light',
  } = options

  // METER_OFFSETS path: when the caller supplies the shared buildings origin,
  // render the surface in the SAME local-metre frame as buildings/trees so the
  // depth buffer can sort them. Else fall back to the legacy LNGLAT path.
  const origin = coordinateOrigin

  // Render-time safety clip for paths that don't pre-clip on the data side
  // (e.g. BYO upload). The SDK display path already clipped before the store
  // write, so passing no `boundaryPolygon` skips this (a no-op).
  const renderLayers: MaterialLayers = boundaryPolygon
    ? (clipAreaLayersToPolygon(
        layers as unknown as LooseMaterialLayers,
        boundaryPolygon,
      ) as unknown as MaterialLayers)
    : layers

  // Depth params depend on the coordinate frame:
  //  • METER_OFFSETS (origin set): the surface now shares the buildings' depth
  //    space, so depthTest is ON — the buildings (real 3D, drawn in the same
  //    frame) occlude the flat surface. depthMask stays OFF so the surface
  //    writes no Z and can never hide buildings; inter-material lips still order
  //    by their extruded render-z.
  //  • LNGLAT (legacy fallback): depthTest OFF. A cross-frame depth test under
  //    interleaved MapboxOverlay lets the flat LNGLAT surface win and paint OVER
  //    building extrusions (the bug this fix removes). With it off, the surface
  //    just composites with no depth interaction.
  // depthMask is the legacy WebGL key; under interleaved MapboxOverlay deck.gl
  // forces the luma-v9 default `depthWriteEnabled:true` on every layer, and that
  // separate key was NOT overridden by `depthMask:false` — so the surface kept
  // WRITING depth at ground level (with deck's index-based polygon offset) and
  // depth-rejected the buildings drawn after it (`depthCompare:less-equal`).
  // Setting BOTH keys to false stops the surface claiming depth, so the opaque
  // buildings/trees drawn after simply paint over it. (Root cause: the surface
  // writing depth — NOT the coordinate frame.)
  const stackParameters = origin
    ? ({ depthTest: true, depthMask: false, depthWriteEnabled: false } as const)
    : ({ depthTest: false, depthMask: false, depthWriteEnabled: false } as const)

  // Emit layers in ASCENDING render-z so the deck layer array is ordered
  // low→high (asphalt → vegetation). depthMask is off (surfaces don't write Z),
  // so under interleaved MapboxOverlay the draw order is the array order — an
  // explicit sort makes the stacking deterministic instead of leaning on JS
  // object key-insertion order (which varies by SDK response / clip output).
  const orderedLayerNames = Object.keys(renderLayers).sort(
    (a, b) => groundMaterialRenderZ(a) - groundMaterialRenderZ(b),
  )

  const result: Layer[] = []
  for (const layerName of orderedLayerNames) {
    const fc = renderLayers[layerName]
    const features = (fc as SdkFeatureCollection)?.features ?? []
    if (features.length === 0) continue
    // Normalise once: strip the clean-v3 embedded z, flatten every vertex to a
    // uniform 2D `[lon, lat]`, drop null / degenerate rings. Without this the
    // extruded tessellator mis-strides on mixed 2D/3D features (concrete /
    // vegetation) and crashes — `reading 'pos'` + web-mercator assertion.
    const { polygons: rawPolygons, dropped } = toRenderPolygons(features)
    if (dropped > 0) {
      console.warn(
        `[ground-materials] "${layerName}": dropped ${dropped}/${features.length} feature(s) with degenerate/out-of-range geometry (not rendered).`,
      )
    }
    if (rawPolygons.length === 0) continue
    // Convert the cleaned lng/lat rings to LOCAL METRES as the ABSOLUTE LAST
    // step — clip + normalize + isFiniteVertex validation all ran on lng/lat
    // above, and that range check rejects projected metres. Only when an origin
    // is set (METER_OFFSETS); the LNGLAT fallback passes the rings through.
    const renderData: RenderPolygon[] = origin
      ? rawPolygons.map((rp) => ({
          polygon: rp.polygon.map((ring) =>
            ring.map((pt) => latLngToMetersLocal(origin, pt[0], pt[1]) as Position),
          ),
        }))
      : rawPolygons
    // Soften the registry diffuse colour for display (theme-aware pastel) — the
    // registry itself stays untouched so the sim still sees the physical colour.
    const [r, g, b] = pastelizeGroundColor(colorForLayerName(layerName, registry), colorMode)
    const darken = 0.6
    const [lr, lg, lb] = [r * darken, g * darken, b * darken].map(Math.round) as [
      number,
      number,
      number,
    ]
    // Constant per-layer render elevation = the material's descending render-z
    // lip. In METER_OFFSETS the scene base lift lives in `coordinateOrigin[2]`,
    // so getElevation carries only the lip; in the LNGLAT fallback the base lift
    // (`zOffsetM`) is added here instead.
    const elevationM = origin
      ? groundMaterialRenderZ(layerName)
      : zOffsetM + groundMaterialRenderZ(layerName)
    const renderStroke = lineWidthMinPixels > 0
    const layerProps: Record<string, unknown> = {
      id: `ground-materials-area-${layerName}`,
      data: renderData as unknown,
      // `data` holds pre-normalised 2D ring-arrays; hand them straight through.
      getPolygon: (d: RenderPolygon) => d.polygon,
      // The cleaned coordinates are strictly 2D, so pin `positionSize` to 2.
      // `getElevation` is the SOLE height source — no embedded z to conflict.
      positionFormat: 'XY',
      extruded: true,
      wireframe: false,
      getElevation: () => elevationM,
      filled: true,
      stroked: renderStroke,
      getFillColor: [r, g, b, fillAlpha],
      getLineColor: [lr, lg, lb, lineAlpha],
      lineWidthMinPixels: renderStroke ? lineWidthMinPixels : 0,
      pickable: false,
      visible,
      parameters: stackParameters,
      // METER_OFFSETS: vertices are local metres from this geographic origin;
      // `[lng, lat, zOffsetM]` lifts the whole surface onto the scene base.
      ...(origin
        ? {
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin: [origin[0], origin[1], zOffsetM] as [number, number, number],
          }
        : {}),
    }
    result.push(new PolygonLayer<RenderPolygon>(layerProps))
  }
  return result
}
