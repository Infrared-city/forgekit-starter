/**
 * Three.js Theme: Effects & Postprocessing Configuration
 *
 * Ambient occlusion, canvas settings, and post-processing effects.
 */

import { ACESFilmicToneMapping } from 'three'

// ============================================
// Ambient Occlusion Configuration (N8AO)
// ============================================

export const aoConfig = {
  /** Radius of the ambient occlusion effect */
  aoRadius: 30.0,
  /** Distance falloff for AO */
  distanceFalloff: 1.0,
  /** Intensity of the AO effect */
  intensity: 3,
  /** Number of AO samples (higher = better quality) */
  aoSamples: 4,
  /** Number of denoise samples */
  denoiseSamples: 4,
  /** Denoise radius */
  denoiseRadius: 12,
  /** Layers to apply AO (0 = all) */
  layers: 0,
} as const

// ============================================
// Canvas Configuration
// ============================================

export const canvasConfig = {
  /** Enable antialiasing */
  antialias: true,
  /** Tone mapping algorithm */
  toneMapping: ACESFilmicToneMapping,
  /** Tone mapping exposure */
  toneMappingExposure: 1.5,
  /** Preserve drawing buffer for screenshots */
  preserveDrawingBuffer: true,
  /** GPU power preference */
  powerPreference: 'high-performance' as const,
  /** Enable depth buffer */
  depth: true,
  /** Enable stencil buffer */
  stencil: true,
  /** Disable alpha for better performance */
  alpha: false,
  /** Enable logarithmic depth buffer for large scale scenes */
  logarithmicDepthBuffer: true,
} as const

// ============================================
// Camera Configuration
// ============================================

export const cameraConfig = {
  /** Near clipping plane */
  near: 1,
  /** Far clipping plane */
  far: 2000,
  /** Field of view in degrees */
  fov: 45,
  /** Default camera position */
  position: [450, 450, 450] as [number, number, number],
} as const

export const reportCameraConfig = {
  /** Near clipping plane */
  near: 1,
  /** Far clipping plane */
  far: 2000,
  /** Field of view in degrees */
  fov: 45,
  /** Top-down camera position */
  position: [0, 650, 0] as [number, number, number],
  /** Smooth transition time */
  smoothTime: 0.25,
} as const

// ============================================
// Render Quality Presets
// ============================================

export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra'

export const qualityPresets: Record<
  QualityPreset,
  {
    aoSamples: number
    denoiseSamples: number
    shadowMapSize: number
    antialias: boolean
  }
> = {
  low: {
    aoSamples: 2,
    denoiseSamples: 2,
    shadowMapSize: 1024,
    antialias: false,
  },
  medium: {
    aoSamples: 4,
    denoiseSamples: 4,
    shadowMapSize: 2048,
    antialias: true,
  },
  high: {
    aoSamples: 8,
    denoiseSamples: 8,
    shadowMapSize: 4096,
    antialias: true,
  },
  ultra: {
    aoSamples: 16,
    denoiseSamples: 16,
    shadowMapSize: 8192,
    antialias: true,
  },
}

// ============================================
// Effect Composer Configuration
// ============================================

export const effectComposerConfig = {
  /** Enable multisampling for smoother edges */
  multisampling: 0,
  /** Enable frame buffer objects */
  frameBufferType: undefined,
} as const

// ============================================
// Helper Functions
// ============================================

/**
 * Get AO configuration for a quality preset
 */
export function getAOConfigForQuality(quality: QualityPreset) {
  const preset = qualityPresets[quality]
  return {
    ...aoConfig,
    aoSamples: preset.aoSamples,
    denoiseSamples: preset.denoiseSamples,
  }
}

/**
 * Get canvas configuration with optional overrides
 */
export function getCanvasConfig(overrides?: Partial<typeof canvasConfig>) {
  return {
    ...canvasConfig,
    ...overrides,
  }
}

/**
 * Get camera configuration for standard or report view
 */
export function getCameraConfig(isReportView = false) {
  return isReportView ? reportCameraConfig : cameraConfig
}
