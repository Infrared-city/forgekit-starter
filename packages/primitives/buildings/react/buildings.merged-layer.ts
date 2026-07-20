import type {
  DefaultProps,
  GetPickingInfoParams,
  LayerProps,
  PickingInfo,
  UpdateParameters,
} from '@deck.gl/core'
import { COORDINATE_SYSTEM, Layer, picking, project32 } from '@deck.gl/core'
import { Model } from '@luma.gl/engine'
import type { ShaderModule } from '@luma.gl/shadertools'
import type { MergedGeometry } from '../core/buildings.merge-geometry'

// ---------------------------------------------------------------------------
// Custom uniform module (v9 pattern: uniform buffer block via ShaderModule)
// ---------------------------------------------------------------------------

type MergedBuildingsProps = {
  opacity: number
}

const uniformBlock = `\
uniform mergedBuildingsUniforms {
  float opacity;
} mergedBuildings;
`

const mergedBuildingsUniforms = {
  name: 'mergedBuildings',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    opacity: 'f32',
  },
} as const satisfies ShaderModule<MergedBuildingsProps>

// ---------------------------------------------------------------------------
// GLSL 300 es shaders
// ---------------------------------------------------------------------------

const vs = `\
#version 300 es
#define SHADER_NAME merged-buildings-vertex-shader

in vec3 positions;
in vec3 normals;
in vec4 colors;
in vec3 pickingColors;
in float buildingIndices;

out vec4 vColor;
out vec3 vNormal;
out vec3 vPosition;

void main(void) {
  // deck.gl picking
  geometry.worldPosition = positions;
  geometry.pickingColor = pickingColors;

  // Project from METER_OFFSETS into clip-space
  gl_Position = project_position_to_clipspace(positions, vec3(0.), vec3(0.), geometry.position);

  // Constant depth tie-breaker: pull ALL buildings a fixed 1e-5 toward the
  // camera (xw cancels the perspective divide). Beats coincident Mapbox fill,
  // ~100x SMALLER than a real 1m depth gap (~2e-3 NDC @500m) so REAL depth (not
  // index) decides building-vs-building AND tree-vs-building order. Was index-
  // proportional (idx+1)*2e-5*w which shoved high-index buildings up to 6e-3 in
  // front of true geometry -- the root of both occlusion bugs.
  gl_Position.z -= 1.0e-5 * gl_Position.w;

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vec3 normal = project_normal(normals);
  geometry.normal = normal;
  vec3 n = normalize(normal);

  // Soft directional from upper-left
  vec3 keyDir = normalize(vec3(0.4, 0.3, 0.9));
  float keyDiffuse = max(dot(n, keyDir), 0.0);

  // Fill from opposite side
  vec3 fillDir = normalize(vec3(-0.3, -0.2, 0.7));
  float fillDiffuse = max(dot(n, fillDir), 0.0);

  // High ambient base; directionals add gentle depth
  float lighting = 0.88 + keyDiffuse * 0.10 + fillDiffuse * 0.04;

  // Height-based ambient occlusion: subtle darken near ground (building bases)
  float heightAO = smoothstep(0.0, 4.0, positions.z);
  float ao = mix(0.88, 1.0, heightAO);

  vColor = vec4(colors.rgb * lighting * ao, colors.a * mergedBuildings.opacity);
  vNormal = normal;
  vPosition = geometry.position.xyz;

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`

const fs = `\
#version 300 es
#define SHADER_NAME merged-buildings-fragment-shader

precision highp float;

in vec4 vColor;
in vec3 vNormal;
in vec3 vPosition;

out vec4 fragColor;

void main(void) {
  geometry.uv = vec2(0.);

  fragColor = vColor;

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`

// ---------------------------------------------------------------------------
// Layer props
// ---------------------------------------------------------------------------

type _MergedBuildingsLayerProps = {
  mergedGeometry: MergedGeometry | null
  selectedId: string | null
  hoveredId: string | null
  opacity: number
  defaultColor: [number, number, number]
  hoverColor: [number, number, number]
  selectedColor: [number, number, number]
}

export type MergedBuildingsLayerProps = _MergedBuildingsLayerProps & LayerProps

const defaultProps: DefaultProps<MergedBuildingsLayerProps> = {
  mergedGeometry: { type: 'object' as const, value: null },
  selectedId: { type: 'object' as const, value: null },
  hoveredId: { type: 'object' as const, value: null },
  opacity: { type: 'number', min: 0, max: 1, value: 0.92 },
  defaultColor: { type: 'color', value: [255, 255, 255] },
  hoverColor: { type: 'color', value: [43, 124, 133] }, // materialColors.primaryTeal (#2B7C85)
  selectedColor: { type: 'color', value: [35, 229, 229] }, // materialColors.secondaryCyan (#23E5E5)
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
}

// ---------------------------------------------------------------------------
// MergedBuildingsLayer -- single-draw-call layer for all buildings
// ---------------------------------------------------------------------------

export class MergedBuildingsLayer extends Layer<Required<_MergedBuildingsLayerProps>> {
  static layerName = 'MergedBuildingsLayer'
  static defaultProps = defaultProps

  declare state: {
    model?: Model
    models?: Model[]
  }

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      defines: {
        NON_INSTANCED_MODEL: 1,
      },
      // shadow module omitted: it causes self-shadowing acne on vertical walls
      // because the shadow map depth comparison fails at grazing angles.
      // Baked vertex-shader lighting (keyDir + fillDir + heightAO) is sufficient.
      modules: [project32, picking, mergedBuildingsUniforms],
    })
  }

  initializeState() {
    const attributeManager = this.getAttributeManager()!

    // Remove the default instanced picking colors attribute --
    // we provide our own per-vertex pickingColors.
    attributeManager.remove(['instancePickingColors'])

    const noAlloc = true

    attributeManager.add({
      positions: {
        size: 3,
        type: 'float32',
        noAlloc,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this._updatePositions,
      },
      normals: {
        size: 3,
        type: 'float32',
        noAlloc,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this._updateNormals,
      },
      colors: {
        size: 4,
        type: 'unorm8',
        noAlloc,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this._updateColorsAttr,
      },
      pickingColors: {
        size: 4,
        type: 'uint8',
        noAlloc,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this._updatePickingColors,
      },
      buildingIndices: {
        size: 1,
        type: 'float32',
        noAlloc,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this._updateBuildingIndices,
      },
      indices: {
        size: 1,
        isIndexed: true,
        noAlloc,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this._updateIndices,
      },
    })

    this._createModel()
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params)

    const { props, oldProps, changeFlags } = params

    // Rebuild model when geometry reference changes or extensions changed
    if (props.mergedGeometry !== oldProps.mergedGeometry || changeFlags.extensionsChanged) {
      this.state.model?.destroy()
      this._createModel()
      this.getAttributeManager()!.invalidateAll()
    } else if (
      props.selectedId !== oldProps.selectedId ||
      props.hoveredId !== oldProps.hoveredId ||
      props.opacity !== oldProps.opacity
    ) {
      // Only selection/hover/opacity changed -- invalidate just the colors attribute
      this.getAttributeManager()!.invalidate('colors')
    }
  }

  draw() {
    const { model } = this.state
    if (!model) return

    const geom = this.props.mergedGeometry
    if (!geom || geom.vertexCount === 0) return

    model.setVertexCount(geom.indices.length)
    model.shaderInputs.setProps({
      mergedBuildings: { opacity: this.props.opacity },
    })
    model.draw(this.context.renderPass)
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info = super.getPickingInfo(params)
    const { mergedGeometry } = this.props

    if (mergedGeometry && info.index >= 0 && info.index < mergedGeometry.buildingIds.length) {
      const buildingId = mergedGeometry.buildingIds[info.index]
      info.object = { buildingId }
    }

    return info
  }

  finalizeState() {
    super.finalizeState(this.context)
    this.state.model?.destroy()
  }

  // ---------------------------------------------------------------------------
  // Model creation -- follows SolidPolygonLayer's _getModels pattern
  // ---------------------------------------------------------------------------

  private _createModel() {
    const geom = this.props.mergedGeometry
    if (!geom || geom.vertexCount === 0) {
      this.setState({ model: undefined })
      return
    }

    const shaders = this.getShaders()
    const bufferLayout = this.getAttributeManager()!.getBufferLayouts({ isInstanced: false })

    const model = new Model(this.context.device, {
      ...shaders,
      id: `${this.id}-model`,
      topology: 'triangle-list',
      bufferLayout,
      isIndexed: true,
      // GPU-level polygon offset: pull our geometry slightly toward the camera
      // so it always wins the depth test against Mapbox fill-extrusion buildings
      // that share the same world-space position. Maps to gl.polygonOffset(-1, -1)
      // in the WebGL backend (luma.gl v9 RenderPipelineParameters).
      parameters: {
        depthBias: -1,
        depthBiasSlopeScale: -1,
        cullMode: 'none', // inherited gl.CULL_FACE (front=CCW) hides CW BYO meshes (2026-07-16)
      },
    })

    this.setState({ model })
    this.state.models = [model]
  }

  // ---------------------------------------------------------------------------
  // Attribute update callbacks
  // ---------------------------------------------------------------------------

  private _updatePositions(attribute: any) {
    const geom = this.props.mergedGeometry
    if (!geom) return
    attribute.value = geom.positions
  }

  private _updateNormals(attribute: any) {
    const geom = this.props.mergedGeometry
    if (!geom) return
    attribute.value = geom.normals
  }

  private _updateIndices(attribute: any) {
    const geom = this.props.mergedGeometry
    if (!geom) return
    attribute.value = geom.indices
  }

  private _updateColorsAttr(attribute: any) {
    const geom = this.props.mergedGeometry
    if (!geom) return

    const { selectedId, hoveredId, defaultColor, hoverColor, selectedColor } = this.props
    const colors = new Uint8ClampedArray(geom.vertexCount * 4)

    for (let b = 0; b < geom.buildingRanges.length; b++) {
      const [startVertex, vertexCount] = geom.buildingRanges[b]
      const id = geom.buildingIds[b]

      let color: [number, number, number] | number[]
      if (id === selectedId) {
        color = selectedColor
      } else if (id === hoveredId) {
        color = hoverColor
      } else {
        color = defaultColor
      }

      for (let v = 0; v < vertexCount; v++) {
        const idx = (startVertex + v) * 4
        colors[idx] = color[0]
        colors[idx + 1] = color[1]
        colors[idx + 2] = color[2]
        colors[idx + 3] = 255
      }
    }

    attribute.value = colors
  }

  private _updateBuildingIndices(attribute: any) {
    const geom = this.props.mergedGeometry
    if (!geom) return
    attribute.value = geom.buildingIndices
  }

  private _updatePickingColors(attribute: any) {
    const geom = this.props.mergedGeometry
    if (!geom) return

    const pickingColors = new Uint8ClampedArray(geom.vertexCount * 4)

    for (let b = 0; b < geom.buildingRanges.length; b++) {
      const [startVertex, vertexCount] = geom.buildingRanges[b]
      // Encode building index as RGB picking color
      const encoded = this.encodePickingColor(b)

      for (let v = 0; v < vertexCount; v++) {
        const idx = (startVertex + v) * 4
        pickingColors[idx] = encoded[0]
        pickingColors[idx + 1] = encoded[1]
        pickingColors[idx + 2] = encoded[2]
        pickingColors[idx + 3] = 255
      }
    }

    attribute.value = pickingColors
  }
}
