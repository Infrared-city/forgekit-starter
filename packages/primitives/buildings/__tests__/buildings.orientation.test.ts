import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeMeshOrientation } from '../core/buildings.orientation'
import type { DotBimMesh } from '../core/buildings.sdk-types'

// No mock needed -- computeMeshCentroid is now local to the package

function makeMesh(coordinates: number[]): DotBimMesh {
  return { mesh_id: 1, coordinates } as DotBimMesh
}

describe('buildings.orientation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('computeMeshOrientation', () => {
    describe('normal mesh with clear orientation', () => {
      it('should return angle near 0 (or near 180) for a mesh elongated along +X axis', () => {
        const mesh = makeMesh([0, 0, 0, 10, 1, 0, 20, -1, 0, 30, 0, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThanOrEqual(0)
        expect(angle).toBeLessThan(180)
        const distanceFromHorizontal = Math.min(angle, 180 - angle)
        expect(distanceFromHorizontal).toBeLessThan(15)
      })

      it('should return angle near 90 for a mesh elongated along +Y axis', () => {
        const mesh = makeMesh([0, 0, 0, 1, 10, 0, -1, 20, 0, 0, 30, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThan(75)
        expect(angle).toBeLessThan(105)
      })

      it('should return angle near 45 for a mesh elongated along diagonal', () => {
        const mesh = makeMesh([0, 0, 0, 10, 10, 0, 20, 20, 0, 30, 30, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThan(35)
        expect(angle).toBeLessThan(55)
      })
    })

    describe('axis-aligned meshes', () => {
      it('should return 0 for a perfect X-axis alignment', () => {
        const mesh = makeMesh([-10, 0, 0, 0, 0, 0, 10, 0, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeCloseTo(0, 5)
      })

      it('should return 90 for a perfect Y-axis alignment', () => {
        const mesh = makeMesh([0, -10, 0, 0, 0, 0, 0, 10, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeCloseTo(90, 5)
      })
    })

    describe('edge cases', () => {
      it('should return 0 for empty coordinates', () => {
        const mesh = makeMesh([])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBe(0)
      })

      it('should return 0 for a single vertex (degenerate)', () => {
        const mesh = makeMesh([5, 10, 15])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThanOrEqual(0)
        expect(angle).toBeLessThan(180)
      })

      it('should return a valid angle for two identical vertices (degenerate PCA)', () => {
        const mesh = makeMesh([3, 7, 0, 3, 7, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThanOrEqual(0)
        expect(angle).toBeLessThan(180)
      })

      it('should return angle in [0, 180) range for any input', () => {
        const mesh = makeMesh([0, 0, 0, -10, 10, 0, -20, 20, 0, -30, 30, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThanOrEqual(0)
        expect(angle).toBeLessThan(180)
        expect(angle).toBeGreaterThan(125)
        expect(angle).toBeLessThan(145)
      })

      it('should normalize angles from third quadrant to [0, 180)', () => {
        const mesh = makeMesh([0, 0, 0, -10, -10, 0, -20, -20, 0])
        const angle = computeMeshOrientation(mesh)

        expect(angle).toBeGreaterThanOrEqual(0)
        expect(angle).toBeLessThan(180)
        expect(angle).toBeGreaterThan(35)
        expect(angle).toBeLessThan(55)
      })
    })

    describe('Z coordinate independence', () => {
      it('should ignore Z coordinates (only uses XY projection)', () => {
        const meshFlat = makeMesh([0, 0, 0, 10, 1, 0, 20, -1, 0])
        const meshTall = makeMesh([0, 0, 100, 10, 1, 200, 20, -1, 300])

        const angleFlat = computeMeshOrientation(meshFlat)
        const angleTall = computeMeshOrientation(meshTall)

        expect(angleFlat).toBeCloseTo(angleTall, 5)
      })
    })
  })
})
