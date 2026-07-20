declare module 'n8ao' {
  import type { Camera, Color, Scene } from 'three'
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js'

  interface N8AOPassConfiguration {
    aoRadius: number
    aoSamples: number
    denoiseSamples: number
    denoiseRadius: number
    distanceFalloff: number
    intensity: number
    denoiseIterations: number
    renderMode: 0 | 1 | 2 | 3 | 4
    color: Color
    gammaCorrection: boolean
    screenSpaceRadius: boolean
    halfRes: boolean
    depthAwareUpsampling: boolean
    autoRenderBeauty: boolean
    colorMultiply: boolean
    transparencyAware: boolean
    stencil: boolean
    accumulate: boolean
  }

  export class N8AOPass extends Pass {
    constructor(scene: Scene, camera: Camera, width?: number, height?: number)
    configuration: N8AOPassConfiguration
    setSize(width: number, height: number): void
  }

  export class N8AOPostPass {
    constructor(scene: Scene, camera: Camera, width?: number, height?: number)
    configuration: N8AOPassConfiguration
    setSize(width: number, height: number): void
  }

  export enum DepthType {
    Default = 1,
    Log = 2,
    Reverse = 3,
  }
}
