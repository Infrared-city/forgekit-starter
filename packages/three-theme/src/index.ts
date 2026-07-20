/**
 * Three.js Theme
 *
 * A comprehensive Three.js theme library for architectural visualization.
 * Includes materials, lighting, camera presets, and post-processing effects.
 *
 * @example
 * ```typescript
 * import {
 *   createGrayMeshMaterial,
 *   createPrimaryMeshMaterial,
 *   lightingSetup,
 *   aoConfig,
 *   cameraConfig,
 * } from '@infrared/three-theme';
 *
 * // Create materials
 * const defaultMaterial = createGrayMeshMaterial();
 * const hoverMaterial = createPrimaryMeshMaterial();
 *
 * // Use lighting configuration
 * const { keyLight, fillLight, backLight } = lightingSetup;
 * ```
 */

// Camera (extended)
export {
  // Types
  type CameraConfig,
  calculateCameraPosition,
  cameraPresets,
  createCameraConfig,
  // Helper functions
  getCameraPreset,
  // Orbit controls
  orbitControlsConfig,
  // Pitch angles
  pitchAngles,
  reportCameraConfig as reportCamera,
  // Camera presets
  standardCameraConfig,
} from './camera'
// Effects & Canvas
export {
  // Ambient Occlusion
  aoConfig,
  // Camera (from effects - basic config)
  cameraConfig,
  // Canvas
  canvasConfig,
  // Effect composer
  effectComposerConfig,
  // Helper functions
  getAOConfigForQuality,
  getCameraConfig,
  getCanvasConfig,
  // Types
  type QualityPreset,
  // Quality presets
  qualityPresets,
  reportCameraConfig,
} from './effects'
// Lighting
export {
  backLight,
  contactShadowConfig,
  type EnvironmentPreset,
  // Environment
  environmentConfig,
  fillLight,
  getBackLightProps,
  getFillLightProps,
  // Props helpers
  getKeyLightProps,
  // Light configurations
  keyLight,
  // Types
  type LightConfig,
  // Complete setup
  lightingSetup,
  // Shadows
  shadowConfig,
} from './lighting'
// Materials
export {
  applyEdgesToMesh,
  createEdgeLineMaterial,
  // Material factory functions
  createGrayMeshMaterial,
  createPrimaryMeshMaterial,
  createRedMeshMaterial,
  createSecondaryMeshMaterial,
  createSimplifiedGeometryMaterial,
  createTemporalTreeMaterial,
  createTransparentMeshMaterial,
  createTreeMaterial,
  // Edge lines
  edgeLineConfig,
  // State management
  getMaterialForState,
  // Types
  type MaterialState,
  // Color constants
  materialColors,
  polygonOffsetConfig,
  // Standard material properties
  standardMaterialProps,
} from './materials'
