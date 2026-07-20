import { describe, expect, it } from 'vitest'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import {
  applyTransform,
  type BuildingTransform,
  rotateMesh,
  translateMesh,
} from '../core/buildings.transforms'

// No mock needed -- computeMeshCentroid is now local to the package

// Test fixtures
const createTriangleMesh = (): DotBimMesh => ({
  mesh_id: 1,
  coordinates: [
    0,
    0,
    0, // Vertex 0 at origin
    10,
    0,
    0, // Vertex 1 at (10, 0, 0)
    5,
    10,
    0, // Vertex 2 at (5, 10, 0)
  ],
  indices: [0, 1, 2],
})

describe('translateMesh', () => {
  it('should translate mesh by positive X delta', () => {
    const mesh = createTriangleMesh()
    const result = translateMesh(mesh, 5, 0)

    expect(result.coordinates[0]).toBe(5)
    expect(result.coordinates[3]).toBe(15)
    expect(result.coordinates[6]).toBe(10)

    expect(result.coordinates[1]).toBe(0)
    expect(result.coordinates[4]).toBe(0)
    expect(result.coordinates[7]).toBe(10)
  })

  it('should translate mesh by positive Y delta', () => {
    const mesh = createTriangleMesh()
    const result = translateMesh(mesh, 0, 7)

    expect(result.coordinates[1]).toBe(7)
    expect(result.coordinates[4]).toBe(7)
    expect(result.coordinates[7]).toBe(17)

    expect(result.coordinates[0]).toBe(0)
    expect(result.coordinates[3]).toBe(10)
    expect(result.coordinates[6]).toBe(5)
  })

  it('should translate mesh by negative deltas', () => {
    const mesh = createTriangleMesh()
    const result = translateMesh(mesh, -3, -2)

    expect(result.coordinates[0]).toBe(-3)
    expect(result.coordinates[1]).toBe(-2)
    expect(result.coordinates[3]).toBe(7)
    expect(result.coordinates[4]).toBe(-2)
  })

  it('should not modify Z coordinates', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [0, 0, 5, 10, 0, 10, 5, 10, 15],
      indices: [0, 1, 2],
    }
    const result = translateMesh(mesh, 100, 100)

    expect(result.coordinates[2]).toBe(5)
    expect(result.coordinates[5]).toBe(10)
    expect(result.coordinates[8]).toBe(15)
  })

  it('should return identity for zero deltas', () => {
    const mesh = createTriangleMesh()
    const result = translateMesh(mesh, 0, 0)

    expect(result.coordinates).toEqual(mesh.coordinates)
  })

  it('should not modify original mesh', () => {
    const mesh = createTriangleMesh()
    const originalCoords = [...mesh.coordinates]
    translateMesh(mesh, 10, 10)

    expect(mesh.coordinates).toEqual(originalCoords)
  })

  it('should preserve other mesh properties', () => {
    const mesh = createTriangleMesh()
    const result = translateMesh(mesh, 5, 5)

    expect(result.mesh_id).toBe(mesh.mesh_id)
    expect(result.indices).toEqual(mesh.indices)
  })
})

describe('rotateMesh', () => {
  it('should rotate mesh 90 degrees around centroid', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [-5, -5, 0, 5, -5, 0, 5, 5, 0, -5, 5, 0],
      indices: [0, 1, 2, 0, 2, 3],
    }

    const result = rotateMesh(mesh, 90)

    expect(result.coordinates[0]).toBeCloseTo(5, 5)
    expect(result.coordinates[1]).toBeCloseTo(-5, 5)
    expect(result.coordinates[3]).toBeCloseTo(5, 5)
    expect(result.coordinates[4]).toBeCloseTo(5, 5)
  })

  it('should rotate mesh 180 degrees', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [-5, -5, 0, 5, -5, 0, 5, 5, 0, -5, 5, 0],
      indices: [0, 1, 2, 0, 2, 3],
    }

    const result = rotateMesh(mesh, 180)

    expect(result.coordinates[0]).toBeCloseTo(5, 5)
    expect(result.coordinates[1]).toBeCloseTo(5, 5)
  })

  it('should return identity for 0 degree rotation', () => {
    const mesh = createTriangleMesh()
    const result = rotateMesh(mesh, 0)

    for (let i = 0; i < mesh.coordinates.length; i++) {
      expect(result.coordinates[i]).toBeCloseTo(mesh.coordinates[i], 5)
    }
  })

  it('should return identity for 360 degree rotation', () => {
    const mesh = createTriangleMesh()
    const result = rotateMesh(mesh, 360)

    for (let i = 0; i < mesh.coordinates.length; i++) {
      expect(result.coordinates[i]).toBeCloseTo(mesh.coordinates[i], 5)
    }
  })

  it('should not modify Z coordinates', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [0, 0, 5, 10, 0, 10, 5, 10, 15],
      indices: [0, 1, 2],
    }
    const result = rotateMesh(mesh, 45)

    expect(result.coordinates[2]).toBe(5)
    expect(result.coordinates[5]).toBe(10)
    expect(result.coordinates[8]).toBe(15)
  })

  it('should not modify original mesh', () => {
    const mesh = createTriangleMesh()
    const originalCoords = [...mesh.coordinates]
    rotateMesh(mesh, 45)

    expect(mesh.coordinates).toEqual(originalCoords)
  })

  it('should handle negative angles (clockwise)', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [-5, -5, 0, 5, -5, 0, 5, 5, 0, -5, 5, 0],
      indices: [0, 1, 2, 0, 2, 3],
    }

    const result90 = rotateMesh(mesh, 90)
    const resultNeg270 = rotateMesh(mesh, -270)

    for (let i = 0; i < result90.coordinates.length; i++) {
      expect(result90.coordinates[i]).toBeCloseTo(resultNeg270.coordinates[i], 5)
    }
  })
})

describe('applyTransform', () => {
  it('should apply translation only', () => {
    const mesh = createTriangleMesh()
    const transform: BuildingTransform = {
      meshId: 'test',
      deltaX: 10,
      deltaY: 5,
      rotation: 0,
    }

    const result = applyTransform(mesh, transform)

    expect(result.coordinates[0]).toBe(10)
    expect(result.coordinates[1]).toBe(5)
    expect(result.coordinates[3]).toBe(20)
    expect(result.coordinates[4]).toBe(5)
  })

  it('should apply rotation only', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [-5, -5, 0, 5, -5, 0, 5, 5, 0, -5, 5, 0],
      indices: [0, 1, 2, 0, 2, 3],
    }
    const transform: BuildingTransform = {
      meshId: 'test',
      deltaX: 0,
      deltaY: 0,
      rotation: 90,
    }

    const result = applyTransform(mesh, transform)

    expect(result.coordinates[0]).toBeCloseTo(5, 5)
    expect(result.coordinates[1]).toBeCloseTo(-5, 5)
  })

  it('should apply rotation then translation', () => {
    const mesh: DotBimMesh = {
      mesh_id: 1,
      coordinates: [-5, -5, 0, 5, -5, 0, 5, 5, 0, -5, 5, 0],
      indices: [0, 1, 2, 0, 2, 3],
    }
    const transform: BuildingTransform = {
      meshId: 'test',
      deltaX: 100,
      deltaY: 50,
      rotation: 90,
    }

    const result = applyTransform(mesh, transform)

    expect(result.coordinates[0]).toBeCloseTo(105, 5)
    expect(result.coordinates[1]).toBeCloseTo(45, 5)
  })

  it('should return unchanged mesh for identity transform', () => {
    const mesh = createTriangleMesh()
    const transform: BuildingTransform = {
      meshId: 'test',
      deltaX: 0,
      deltaY: 0,
      rotation: 0,
    }

    const result = applyTransform(mesh, transform)

    expect(result.coordinates).toEqual(mesh.coordinates)
  })

  it('should not modify original mesh', () => {
    const mesh = createTriangleMesh()
    const originalCoords = [...mesh.coordinates]
    const transform: BuildingTransform = {
      meshId: 'test',
      deltaX: 10,
      deltaY: 10,
      rotation: 45,
    }

    applyTransform(mesh, transform)

    expect(mesh.coordinates).toEqual(originalCoords)
  })

  it('should preserve mesh metadata', () => {
    const mesh = createTriangleMesh()
    const transform: BuildingTransform = {
      meshId: 'test',
      deltaX: 10,
      deltaY: 10,
      rotation: 45,
    }

    const result = applyTransform(mesh, transform)

    expect(result.mesh_id).toBe(mesh.mesh_id)
    expect(result.indices).toEqual(mesh.indices)
  })
})
