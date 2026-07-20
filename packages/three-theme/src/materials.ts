/**
 * Three.js Theme: Material Definitions
 *
 * Standard material configurations for 3D scenes.
 * These materials are designed for architectural visualization.
 */

import * as THREE from 'three'

// ============================================
// Material Color Constants
// ============================================

export const materialColors = {
  /** Default gray for buildings */
  gray: 0xcccccc,
  /** Warm beige for architectural maquette style (deck.gl map buildings) */
  maquetteBeige: 0xd2c3af,
  /** Pure red for highlights */
  red: 0xff0000,
  /** White/light gray */
  white: 0xcccccc,
  /** Primary teal (hover state) */
  primaryTeal: '#2B7C85',
  /** Secondary cyan (selected state) */
  secondaryCyan: '#23E5E5',
  /** Tree green */
  treeGreen: 0x2ecc71,
  /** Temporal/ghost tree */
  temporalTree: 0xcc9999,
  /** Simplified geometry */
  simplifiedGeometry: '#CAE0E0',
  /** Edge line gray */
  edgeLine: 0x666666,
  /** Line default blue */
  lineDefault: 0x0000ff,
  /** Geometry line black */
  geometryLine: 0x000000,
  /** Pattern base white */
  patternBase: 0xffffff,
} as const

// ============================================
// Standard Material Properties
// ============================================

export const standardMaterialProps = {
  /** Default roughness for architectural surfaces */
  roughness: 0.8,
  /** Default metalness (non-metallic) */
  metalness: 0.0,
  /** Environment map intensity */
  envMapIntensity: 0.2,
  /** Enable depth testing */
  depthTest: true,
  /** Enable depth writing */
  depthWrite: true,
} as const

// ============================================
// Material Factory Functions
// ============================================

/**
 * Creates the default gray mesh material for buildings
 */
export function createGrayMeshMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: materialColors.gray,
    roughness: standardMaterialProps.roughness,
    metalness: standardMaterialProps.metalness,
    side: THREE.DoubleSide,
    shadowSide: THREE.BackSide,
    envMapIntensity: standardMaterialProps.envMapIntensity,
    depthTest: standardMaterialProps.depthTest,
    depthWrite: standardMaterialProps.depthWrite,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
}

/**
 * Creates a red highlight material
 */
export function createRedMeshMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: materialColors.red,
    roughness: standardMaterialProps.roughness,
    metalness: standardMaterialProps.metalness,
    side: THREE.DoubleSide,
    shadowSide: THREE.BackSide,
    envMapIntensity: standardMaterialProps.envMapIntensity,
    depthTest: standardMaterialProps.depthTest,
    depthWrite: standardMaterialProps.depthWrite,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
}

/**
 * Creates the primary hover state material (teal)
 */
export function createPrimaryMeshMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: materialColors.primaryTeal,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
}

/**
 * Creates the secondary selected state material (cyan)
 */
export function createSecondaryMeshMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: materialColors.secondaryCyan,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2,
  })
}

/**
 * Creates the tree vegetation material
 */
export function createTreeMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: materialColors.treeGreen,
    emissive: 0x000000,
    side: THREE.DoubleSide,
    emissiveIntensity: 0.3,
    specular: 0x111111,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
}

/**
 * Creates the temporal/ghost tree material
 */
export function createTemporalTreeMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: materialColors.temporalTree,
    emissive: 0x000000,
    side: THREE.DoubleSide,
    emissiveIntensity: 0.3,
    specular: 0x111111,
  })
}

/**
 * Creates the simplified geometry view material
 */
export function createSimplifiedGeometryMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: materialColors.simplifiedGeometry,
    flatShading: true,
  })
}

/**
 * Creates a transparent vertex-colored material
 */
export function createTransparentMeshMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
  })
}

// ============================================
// Edge Line Configuration
// ============================================

export const edgeLineConfig = {
  /** Edge line color */
  color: materialColors.edgeLine,
  /** Line width (may not work in all browsers) */
  linewidth: 0.3,
  /** Line opacity */
  opacity: 0.1,
  /** Transparency enabled */
  transparent: true,
  /** Edge detection threshold angle in degrees */
  thresholdAngle: 45,
} as const

/**
 * Creates an edge line material
 */
export function createEdgeLineMaterial(): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: edgeLineConfig.color,
    linewidth: edgeLineConfig.linewidth,
    opacity: edgeLineConfig.opacity,
    transparent: edgeLineConfig.transparent,
  })
}

/**
 * Applies edge lines to a mesh
 */
export function applyEdgesToMesh(mesh: THREE.Mesh): void {
  const edges = new THREE.EdgesGeometry(mesh.geometry, edgeLineConfig.thresholdAngle)
  const edgeLine = new THREE.LineSegments(edges, createEdgeLineMaterial())
  mesh.add(edgeLine)
}

// ============================================
// Material State Management
// ============================================

export type MaterialState = 'default' | 'hover' | 'selected' | 'tree'

/**
 * Gets the appropriate material for a given state
 */
export function getMaterialForState(state: MaterialState): THREE.Material {
  switch (state) {
    case 'hover':
      return createPrimaryMeshMaterial()
    case 'selected':
      return createSecondaryMeshMaterial()
    case 'tree':
      return createTreeMaterial()
    default:
      return createGrayMeshMaterial()
  }
}

// ============================================
// Polygon Offset Configuration
// ============================================

export const polygonOffsetConfig = {
  default: { enabled: false, factor: 0, units: 0 },
  hover: { enabled: true, factor: 1, units: 1 },
  selected: { enabled: true, factor: 2, units: 2 },
  tree: { enabled: true, factor: 1, units: 1 },
} as const
