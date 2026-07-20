import { describe, expect, it, vi } from 'vitest'

// Mock deck.gl PolygonLayer so we can inspect the props passed without
// instantiating the real WebGL pipeline. vi.mock is hoisted above top-level
// declarations, so the class is declared inline inside the factory.
vi.mock('@deck.gl/layers', () => {
  class FakePolygonLayer {
    props: Record<string, unknown>
    constructor(props: Record<string, unknown>) {
      this.props = props
    }
  }
  return { PolygonLayer: FakePolygonLayer }
})

type FakeLayer = { props: Record<string, unknown> }

import { groundMaterialRenderZ, MATERIAL_RENDER_Z } from '../core/ground-materials.render-z'
import { GROUND_MATERIAL_REGISTRY } from '../core/ground-materials.sdk-types'
import { createGroundMaterialsAreaLayer } from '../react/ground-materials.area-layer'
import type { MaterialLayers } from '../react/ground-materials.store'

function polyFeature(material: string): Record<string, unknown> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    },
    properties: { material },
  }
}

function fc(features: Array<Record<string, unknown>>) {
  return { type: 'FeatureCollection', features }
}

const layers: MaterialLayers = {
  asphalt: fc([polyFeature('asphalt')]),
  vegetation: fc([polyFeature('vegetation')]),
  water: fc([polyFeature('water')]),
}

describe('createGroundMaterialsAreaLayer', () => {
  it('returns one PolygonLayer per non-empty material layer', () => {
    const result = createGroundMaterialsAreaLayer(layers, GROUND_MATERIAL_REGISTRY)
    expect(result).toHaveLength(3)
  })

  it('skips empty feature collections', () => {
    const result = createGroundMaterialsAreaLayer(
      { asphalt: fc([polyFeature('asphalt')]), water: fc([]) },
      GROUND_MATERIAL_REGISTRY,
    )
    expect(result).toHaveLength(1)
  })

  it('extrudes each layer with a thin lip (extruded + wireframe off)', () => {
    const [layer] = createGroundMaterialsAreaLayer(
      { asphalt: fc([polyFeature('asphalt')]) },
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    expect(layer.props.extruded).toBe(true)
    expect(layer.props.filled).toBe(true)
    expect(layer.props.wireframe).toBe(false)
  })

  it('assigns the per-material render-z as the constant elevation per layer', () => {
    const result = createGroundMaterialsAreaLayer(
      layers,
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]

    for (const layer of result) {
      const id = String(layer.props.id)
      const material = id.replace('ground-materials-area-', '')
      const getElevation = layer.props.getElevation as () => number
      expect(typeof getElevation).toBe('function')
      // Constant elevation per layer = the material's render-z (a thin
      // extruded lip used only for stacking order, not tall 3D walls).
      expect(getElevation()).toBeCloseTo(MATERIAL_RENDER_Z[material], 10)
    }
  })

  it('stacks vegetation above water above asphalt (descending sim hierarchy)', () => {
    const result = createGroundMaterialsAreaLayer(
      layers,
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    const byMaterial: Record<string, number> = {}
    for (const layer of result) {
      const material = String(layer.props.id).replace('ground-materials-area-', '')
      byMaterial[material] = (layer.props.getElevation as () => number)()
    }
    expect(byMaterial.vegetation).toBeGreaterThan(byMaterial.water)
    expect(byMaterial.water).toBeGreaterThan(byMaterial.asphalt)
    expect(byMaterial.vegetation).toBe(groundMaterialRenderZ('vegetation'))
  })

  it('lifts every layer by the scene base zOffsetM (3D-tiles support)', () => {
    const [layer] = createGroundMaterialsAreaLayer(
      { water: fc([polyFeature('water')]) },
      GROUND_MATERIAL_REGISTRY,
      { zOffsetM: 50 },
    ) as unknown as FakeLayer[]
    const elevation = (layer.props.getElevation as () => number)()
    // base 50 + water render-z 0.4
    expect(elevation).toBeCloseTo(50 + MATERIAL_RENDER_Z.water, 10)
  })

  it('honours the visible flag', () => {
    const [layer] = createGroundMaterialsAreaLayer(
      { asphalt: fc([polyFeature('asphalt')]) },
      GROUND_MATERIAL_REGISTRY,
      { visible: false },
    ) as unknown as FakeLayer[]
    expect(layer.props.visible).toBe(false)
  })

  it('disables depthTest AND depthMask so materials never occlude buildings', () => {
    // The analysis BitmapLayer (the proven reference) uses
    // { depthTest:false, depthMask:false }. Materials use LNGLAT while
    // buildings use METER_OFFSETS; under interleaved MapboxOverlay a depth
    // TEST across the two coordinate systems can let materials win and paint
    // over building extrusions. depthTest:false makes draw order (materials
    // first, buildings after) the sole arbiter.
    const [layer] = createGroundMaterialsAreaLayer(
      { asphalt: fc([polyFeature('asphalt')]) },
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    const params = layer.props.parameters as Record<string, unknown>
    expect(params.depthMask).toBe(false)
    expect(params.depthTest).toBe(false)
  })

  // --- z-stack crash regression (the clean-v3 geometry that broke deck.gl) ---

  /** clean-v3-shaped feature: 3D coords `[lon, lat, z]`, optionally with holes. */
  function clean3dFeature(rings: number[][][]): Record<string, unknown> {
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: rings } }
  }

  it('pins positionFormat to XY so positionSize is unambiguously 2', () => {
    const [layer] = createGroundMaterialsAreaLayer(
      { asphalt: fc([polyFeature('asphalt')]) },
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    expect(layer.props.positionFormat).toBe('XY')
  })

  it('strips embedded z from clean-v3 3D coords — getPolygon yields only 2D vertices', () => {
    const concrete = clean3dFeature([
      [
        [16.37, 48.2, 0.2],
        [16.38, 48.2, 0.2],
        [16.38, 48.21, 0.2],
        [16.37, 48.2, 0.2],
      ],
    ])
    const [layer] = createGroundMaterialsAreaLayer(
      { concrete: fc([concrete]) },
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    const data = layer.props.data as Array<{ polygon: number[][][] }>
    const getPolygon = layer.props.getPolygon as (d: unknown) => number[][][]
    expect(data).toHaveLength(1)
    const rings = getPolygon(data[0])
    // Every vertex is exactly 2D — no embedded z reaches the tessellator.
    expect(rings.every((ring) => ring.every((c) => c.length === 2))).toBe(true)
  })

  it('SPLITS a MultiPolygon feature into one data item per part (PolygonLayer-safe)', () => {
    // @turf/intersect (boundary clip) splits busy materials into MultiPolygons.
    // PolygonLayer cannot read a per-feature MultiPolygon (it mis-reads the extra
    // nesting → mercator assertion crash), so each part must be its own data item.
    const multi = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [0, 0, 0.2],
              [1, 0, 0.2],
              [1, 1, 0.2],
              [0, 0, 0.2],
            ],
          ],
          [
            [
              [5, 5, 0.2],
              [6, 5, 0.2],
              [6, 6, 0.2],
              [5, 5, 0.2],
            ],
          ],
        ],
      },
      properties: { material: 'concrete' },
    }
    const [layer] = createGroundMaterialsAreaLayer(
      { concrete: fc([multi]) },
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    const data = layer.props.data as Array<{ polygon: number[][][] }>
    const getPolygon = layer.props.getPolygon as (d: unknown) => number[][][]
    // one MultiPolygon feature → two standalone single-polygon data items
    expect(data).toHaveLength(2)
    for (const item of data) {
      const rings = getPolygon(item)
      // each is a single polygon: ring[0] is a coord pair of numbers (depth 2)
      expect(typeof rings[0][0][0]).toBe('number')
      expect(rings.every((ring) => ring.every((c) => c.length === 2))).toBe(true)
    }
  })

  it('keeps holes but drops a feature whose geometry is fully degenerate', () => {
    const withHole = clean3dFeature([
      [
        [0, 0, 0.2],
        [10, 0, 0.2],
        [10, 10, 0.2],
        [0, 10, 0.2],
        [0, 0, 0.2],
      ],
      [
        [3, 3, 0.2],
        [6, 3, 0.2],
        [6, 6, 0.2],
        [3, 3, 0.2],
      ],
    ])
    const degenerate = clean3dFeature([
      [
        [5, 5, 0.2],
        [5, 5, 0.2],
        [5, 5, 0.2],
      ],
    ])
    const [layer] = createGroundMaterialsAreaLayer(
      { concrete: fc([withHole, degenerate]) },
      GROUND_MATERIAL_REGISTRY,
    ) as unknown as FakeLayer[]
    const data = layer.props.data as Array<{ polygon: number[][][] }>
    // degenerate feature dropped; the hole-bearing one survives with its hole.
    expect(data).toHaveLength(1)
    expect(data[0].polygon).toHaveLength(2)
  })

  it('drops a layer entirely when every feature normalises to nothing', () => {
    const allBad = clean3dFeature([
      [
        [1, 1, 0.2],
        [1, 1, 0.2],
      ],
    ])
    const result = createGroundMaterialsAreaLayer(
      { concrete: fc([allBad]) },
      GROUND_MATERIAL_REGISTRY,
    )
    expect(result).toHaveLength(0)
  })
})
