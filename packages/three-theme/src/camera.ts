/**
 * Three.js Theme: Camera Configuration
 *
 * Camera presets and controls for different view modes.
 */

// ============================================
// Camera Types
// ============================================

export type CameraConfig = {
  near: number
  far: number
  fov: number
  position: [number, number, number]
  smoothTime?: number
}

// ============================================
// Standard Camera (3D View)
// ============================================

export const standardCameraConfig: CameraConfig = {
  near: 1,
  far: 2000,
  fov: 45,
  position: [450, 450, 450],
}

// ============================================
// Report Camera (Top-Down View)
// ============================================

export const reportCameraConfig: CameraConfig = {
  near: 1,
  far: 2000,
  fov: 45,
  position: [0, 650, 0],
  smoothTime: 0.25,
}

// ============================================
// Pitch Angles
// ============================================

export const pitchAngles = {
  /** Normal 3D view pitch */
  normal: 60,
  /** Top-down perpendicular view */
  perpendicular: 0,
  /** Low angle view */
  low: 30,
  /** High angle view */
  high: 75,
} as const

// ============================================
// Camera Presets
// ============================================

export const cameraPresets = {
  /** Standard 3D isometric view */
  standard: standardCameraConfig,
  /** Top-down report view */
  report: reportCameraConfig,
  /** Close-up detail view */
  detail: {
    near: 0.1,
    far: 1000,
    fov: 35,
    position: [100, 100, 100] as [number, number, number],
  },
  /** Wide overview */
  overview: {
    near: 1,
    far: 5000,
    fov: 60,
    position: [800, 800, 800] as [number, number, number],
  },
} as const

// ============================================
// Controls Configuration
// ============================================

export const orbitControlsConfig = {
  /** Enable damping for smooth camera movement */
  enableDamping: true,
  /** Damping factor */
  dampingFactor: 0.05,
  /** Minimum distance to target */
  minDistance: 10,
  /** Maximum distance to target */
  maxDistance: 2000,
  /** Minimum polar angle (prevent going under ground) */
  minPolarAngle: 0,
  /** Maximum polar angle (prevent going upside down) */
  maxPolarAngle: Math.PI / 2,
  /** Enable zoom */
  enableZoom: true,
  /** Enable rotation */
  enableRotate: true,
  /** Enable pan */
  enablePan: true,
  /** Zoom speed */
  zoomSpeed: 1.0,
  /** Rotation speed */
  rotateSpeed: 0.5,
  /** Pan speed */
  panSpeed: 0.5,
} as const

// ============================================
// Helper Functions
// ============================================

/**
 * Get camera configuration for a preset
 */
export function getCameraPreset(preset: keyof typeof cameraPresets): CameraConfig {
  return cameraPresets[preset]
}

/**
 * Calculate camera position for a target and distance
 */
export function calculateCameraPosition(
  target: [number, number, number],
  distance: number,
  pitch: number = pitchAngles.normal,
  azimuth: number = 45,
): [number, number, number] {
  const pitchRad = (pitch * Math.PI) / 180
  const azimuthRad = (azimuth * Math.PI) / 180

  const x = target[0] + distance * Math.cos(pitchRad) * Math.sin(azimuthRad)
  const y = target[1] + distance * Math.sin(pitchRad)
  const z = target[2] + distance * Math.cos(pitchRad) * Math.cos(azimuthRad)

  return [x, y, z]
}

/**
 * Create a camera config with custom position
 */
export function createCameraConfig(
  position: [number, number, number],
  options?: Partial<Omit<CameraConfig, 'position'>>,
): CameraConfig {
  return {
    near: options?.near ?? standardCameraConfig.near,
    far: options?.far ?? standardCameraConfig.far,
    fov: options?.fov ?? standardCameraConfig.fov,
    position,
    ...(options?.smoothTime && { smoothTime: options.smoothTime }),
  }
}
