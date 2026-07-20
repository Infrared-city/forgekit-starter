/**
 * Three.js Theme: Lighting Configuration
 *
 * Three-point lighting setup for architectural visualization.
 */

// ============================================
// Light Types
// ============================================

export type LightConfig = {
  position: [number, number, number]
  intensity: number
  color: string
  castShadow?: boolean
  shadowMapSize?: [number, number]
  shadowBias?: number
}

// ============================================
// Key Light (Main Shadow-Casting Light)
// ============================================

export const keyLight: LightConfig = {
  position: [700, 3800, 700],
  intensity: 0.5,
  color: '#ffffff',
  castShadow: true,
  shadowMapSize: [2048, 2048],
  shadowBias: -0.0001,
}

// ============================================
// Fill Light (Secondary Light)
// ============================================

export const fillLight: LightConfig = {
  position: [3300, 1000, -100],
  intensity: 0.2,
  color: '#ffffff',
}

// ============================================
// Back Light (Rim Light)
// ============================================

export const backLight: LightConfig = {
  position: [200, 2400, -500],
  intensity: 0.2,
  color: '#ffffff',
}

// ============================================
// Environment Configuration
// ============================================

export type EnvironmentPreset =
  | 'city'
  | 'studio'
  | 'sunset'
  | 'dawn'
  | 'night'
  | 'warehouse'
  | 'forest'

export const environmentConfig = {
  /** Default environment preset */
  preset: 'city' as EnvironmentPreset,
  /** Background color (off-white) */
  backgroundColor: 0xfefefe,
  /** Background color as hex string */
  backgroundColorHex: '#fefefe',
}

// ============================================
// Shadow Configuration
// ============================================

export const shadowConfig = {
  /** Shadow map size (higher = better quality, more memory) */
  mapSize: [2048, 2048] as [number, number],
  /** Shadow bias to prevent shadow acne */
  bias: -0.0001,
  /** Shadow near plane */
  near: 1,
  /** Shadow far plane */
  far: 2000,
}

// ============================================
// Contact Shadows (Optional)
// ============================================

export const contactShadowConfig = {
  opacity: 0.7,
  blur: 2.5,
  scale: 10.0,
  far: 20,
  resolution: 1024,
  color: '#000000',
}

// ============================================
// Complete Lighting Setup
// ============================================

export const lightingSetup = {
  keyLight,
  fillLight,
  backLight,
  environment: environmentConfig,
  shadows: shadowConfig,
  contactShadows: contactShadowConfig,
}

// ============================================
// React Three Fiber JSX Props
// ============================================

/**
 * Returns props for the key directional light
 */
export function getKeyLightProps() {
  return {
    position: keyLight.position,
    intensity: keyLight.intensity,
    color: keyLight.color,
    castShadow: keyLight.castShadow,
    'shadow-mapSize': keyLight.shadowMapSize,
    'shadow-bias': keyLight.shadowBias,
  }
}

/**
 * Returns props for the fill directional light
 */
export function getFillLightProps() {
  return {
    position: fillLight.position,
    intensity: fillLight.intensity,
    color: fillLight.color,
  }
}

/**
 * Returns props for the back directional light
 */
export function getBackLightProps() {
  return {
    position: backLight.position,
    intensity: backLight.intensity,
    color: backLight.color,
  }
}
