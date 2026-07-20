import { describe, expect, it } from 'vitest'
import { latLngToMetersLocal } from '../core/vegetation.geo-utils'
import {
  featuresToDotBimMeshes,
  featuresToDotBimMeshesWithStats,
} from '../core/vegetation.mesh-builder'

const ORIGIN: [number, number] = [-0.1, 51.5]

const DEFAULT_TRUNK_RADIUS = 0.2
const DEFAULT_TOTAL_HEIGHT = 8
const TRUNK_FRACTION = 0.3
const DEFAULT_TRUNK_HEIGHT = DEFAULT_TOTAL_HEIGHT * TRUNK_FRACTION // 2.4
const DEFAULT_CANOPY_RADIUS = (DEFAULT_TOTAL_HEIGHT * (1 - TRUNK_FRACTION)) / 2 // 2.8

/**
 * Default trunk segments = 6.
 * Trunk verts = 2N (rings) + 2 (centers) = 14.
 * Canopy = UV sphere with 3 latitude bands × M longitude bands = 2 ring ×
 * M verts + 2 poles. With M=8: 18 canopy verts → total default = 32.
 */
const DEFAULT_TRUNK_VERTS = 14
const DEFAULT_CANOPY_VERTS = 18
const DEFAULT_VERTEX_COUNT = DEFAULT_TRUNK_VERTS + DEFAULT_CANOPY_VERTS

// Per-feature canopy height range clamps; values fall back to defaults
// outside this range. Ceiling widened to accommodate mature urban trees
// (Platanen, Linden, oak) common in central Vienna.
const TRUNK_HEIGHT_RANGE: readonly [number, number] = [1, 5]
const CANOPY_RADIUS_RANGE: readonly [number, number] = [1.5, 7]

function clampToRange(value: number, range: readonly [number, number]): number {
  return Math.max(range[0], Math.min(range[1], value))
}

describe('featuresToDotBimMeshes', () => {
  it('returns empty for empty features', () => {
    expect(featuresToDotBimMeshes({}, ORIGIN)).toEqual([])
  })

  it('projects each Point feature to a mesh and translates the template', () => {
    const features = {
      a: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      },
      b: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.09, 51.51] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    expect(meshes).toHaveLength(2)

    const [ax, ay] = latLngToMetersLocal(ORIGIN, -0.095, 51.505)
    const [bx, by] = latLngToMetersLocal(ORIGIN, -0.09, 51.51)

    // First vertex of mesh a is on the trunk bottom ring at angle 0:
    // (trunkRadius + ax, 0 + ay, 0).
    expect(meshes[0].coordinates[0]).toBeCloseTo(DEFAULT_TRUNK_RADIUS + ax, 5)
    expect(meshes[0].coordinates[1]).toBeCloseTo(0 + ay, 5)
    expect(meshes[0].coordinates[2]).toBeCloseTo(0, 5)

    expect(meshes[1].coordinates[0]).toBeCloseTo(DEFAULT_TRUNK_RADIUS + bx, 5)
    expect(meshes[1].coordinates[1]).toBeCloseTo(0 + by, 5)

    // Both meshes share the same template indices.
    expect(meshes[0].indices).toEqual(meshes[1].indices)
    expect(meshes[0].indices!.length % 3).toBe(0)
  })

  it('emits per-vertex colors (RGB triplets, length = vertexCount * 3)', () => {
    const features = {
      a: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    const mesh = meshes[0]
    expect(mesh.colors).toBeDefined()
    expect(mesh.colors!.length).toBe(mesh.coordinates.length)
    // First trunk vertex should carry the brown TRUNK_COLOR.
    expect(mesh.colors![0]).toBe(120)
    expect(mesh.colors![1]).toBe(76)
    expect(mesh.colors![2]).toBe(44)
    // A canopy vertex (offset past the trunk) should be green.
    const canopyVertOffset = DEFAULT_TRUNK_VERTS * 3
    expect(mesh.colors![canopyVertOffset]).toBe(70)
    expect(mesh.colors![canopyVertOffset + 1]).toBe(140)
    expect(mesh.colors![canopyVertOffset + 2]).toBe(56)
  })

  it('skips non-Point and malformed features', () => {
    const features = {
      a: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      },
      b: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
      },
      c: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: ['x', 'y'] },
      },
      d: {
        type: 'Feature',
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    expect(meshes).toHaveLength(1)
    expect(meshes[0].mesh_id).toBe(0)
  })

  it('honours custom default segment counts', () => {
    const features = {
      a: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN, {
      defaults: { trunkSegments: 4, canopySegments: 4 },
    })
    // 4-seg trunk: 2*4 ring + 2 centers = 10 verts. Sphere canopy with
    // longBands=4 + 3 latBands → 1 + 2*4 + 1 = 10 verts. Total = 20.
    expect(meshes[0].coordinates).toHaveLength(20 * 3)
  })

  it('shares one template when all features carry the same explicit height', () => {
    // Explicit height → no jitter applies → identical templates. (Without
    // an explicit height, deterministic per-feature jitter spreads the
    // canopy across templates so the visual reads as a forest, not a
    // regiment of identical balls — see the jitter test below.)
    const features = {
      a: {
        type: 'Feature',
        properties: { height: 8 },
        geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      },
      b: {
        type: 'Feature',
        properties: { height: 8 },
        geometry: { type: 'Point', coordinates: [-0.09, 51.51] },
      },
      c: {
        type: 'Feature',
        properties: { height: 8 },
        geometry: { type: 'Point', coordinates: [-0.085, 51.515] },
      },
    } as Record<string, Record<string, unknown>>

    const { meshes, templateCount } = featuresToDotBimMeshesWithStats(features, ORIGIN)
    expect(meshes).toHaveLength(3)
    expect(templateCount).toBe(1)
    for (const mesh of meshes) {
      expect(mesh.coordinates).toHaveLength(DEFAULT_VERTEX_COUNT * 3)
    }
  })

  it('jitters defaults so propless features spread across templates', () => {
    // No height + no circumference → deterministic ±20% jitter keyed on
    // feature id, so 25 propless trees produce > 1 distinct template
    // (jitter range ≈ 6.4–9.6 m → trunk 1.92–2.88 m → rounded buckets at
    // 2.0/2.5 m). Same ids ⇒ identical templates on the next call.
    const features: Record<string, Record<string, unknown>> = {}
    for (let i = 0; i < 25; i++) {
      features[`tree-${i}`] = {
        type: 'Feature',
        id: `tree-${i}`,
        geometry: { type: 'Point', coordinates: [-0.1 + i * 0.001, 51.5] },
      } as Record<string, unknown>
    }

    const { meshes, templateCount } = featuresToDotBimMeshesWithStats(features, ORIGIN)
    expect(meshes).toHaveLength(25)
    expect(templateCount).toBeGreaterThan(1)
    const second = featuresToDotBimMeshesWithStats(features, ORIGIN)
    expect(second.templateCount).toBe(templateCount)
    for (let i = 0; i < meshes.length; i++) {
      expect(second.meshes[i].coordinates).toEqual(meshes[i].coordinates)
    }
  })

  it('derives tree height from OSM circumference when height tag is missing', () => {
    // height ≈ 12 × circumference + 3 m. 0.5 m → 9 m, "1.0" → 15 m.
    const features = {
      small: {
        type: 'Feature',
        properties: { circumference: 0.5 },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
      large: {
        type: 'Feature',
        properties: { circumference: '1.0' },
        geometry: { type: 'Point', coordinates: [-0.09, 51.51] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    // small: 9 m total → trunk = 9 * 0.3 = 2.7 m (top-ring z).
    expect(meshes[0].coordinates[6 * 3 + 2]).toBeCloseTo(2.7, 4)
    // large: 15 m total → trunk = 15 * 0.3 = 4.5 m.
    expect(meshes[1].coordinates[6 * 3 + 2]).toBeCloseTo(4.5, 4)
  })

  it('treats properties.height as TOTAL tree height (not trunk-only)', () => {
    // A "10 m" OSM tree should render as ≤ 10 m total — NEVER as 33 m
    // (the pre-fix bug where canopy was stacked on top of full height).
    const features = {
      a: {
        type: 'Feature',
        properties: { height: 10 },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    const coords = meshes[0].coordinates
    // Find the maximum z across all vertices — that's the canopy top.
    let maxZ = 0
    for (let i = 2; i < coords.length; i += 3) {
      if (coords[i] > maxZ) maxZ = coords[i]
    }
    expect(maxZ).toBeLessThanOrEqual(10.001)
    // Top vertex is the sphere's north pole at z = trunkHeight + 2 * canopyRadius.
    // For height=10: trunk=3, canopyRadius=min(10*0.35, 5)=3.5 → top z = 3+7=10.
    expect(maxZ).toBeCloseTo(10, 4)
  })

  it('clamps absurd heights to the 25 m total ceiling', () => {
    // OSM-style garbage value (e.g. height in dm, or `200` typo).
    const features = {
      a: {
        type: 'Feature',
        properties: { height: '200', diameter_crown: '999' },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    const coords = meshes[0].coordinates
    let maxZ = 0
    for (let i = 2; i < coords.length; i += 3) {
      if (coords[i] > maxZ) maxZ = coords[i]
    }
    // After clamps: trunk=5 (max), canopyRadius=7 (max) → top = 5 + 2*7 = 19.
    expect(maxZ).toBeLessThanOrEqual(19.001)
  })

  it('coerces numeric-string props (OSM forwards strings, not numbers)', () => {
    const features = {
      a: {
        type: 'Feature',
        properties: { height: '8.5' },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    const coords = meshes[0].coordinates
    // trunkHeight = 8.5 * 0.3 = 2.55 → trunk top ring z = 2.55.
    // Trunk top ring vertex 0 is at index N=6 → coord offset 18.
    expect(coords[6 * 3 + 2]).toBeCloseTo(2.55, 4)
  })

  it('reads OSM-style diameter_crown alongside camelCase crownDiameter', () => {
    const features = {
      osm: {
        type: 'Feature',
        // SDK forwards OSM keys verbatim — diameter_crown (snake), not camelCase.
        properties: { height: '10', diameter_crown: '6' },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
      imported: {
        type: 'Feature',
        properties: { height: 10, crownDiameter: 6 },
        geometry: { type: 'Point', coordinates: [-0.09, 51.51] },
      },
    } as Record<string, Record<string, unknown>>

    const { meshes, templateCount } = featuresToDotBimMeshesWithStats(features, ORIGIN)
    expect(meshes).toHaveLength(2)
    // Both should produce the same template (same height + crown diameter).
    expect(templateCount).toBe(1)
    // trunkHeight = 10 * 0.3 = 3 → trunk top ring z = 3.
    expect(meshes[0].coordinates[6 * 3 + 2]).toBeCloseTo(3, 4)
  })

  it('clamps out-of-range height to the [3, 25] m total range', () => {
    const features = {
      tiny: {
        type: 'Feature',
        properties: { height: 0.5 },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
      huge: {
        type: 'Feature',
        properties: { height: 50 },
        geometry: { type: 'Point', coordinates: [-0.09, 51.51] },
      },
      bogus: {
        type: 'Feature',
        id: 'bogus',
        properties: { height: 'tall' },
        geometry: { type: 'Point', coordinates: [-0.08, 51.52] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    // tiny: clamped up to 3 → trunkHeight = 3 * 0.3 = 0.9 → clamped to 1.
    expect(meshes[0].coordinates[6 * 3 + 2]).toBeCloseTo(
      clampToRange(3 * TRUNK_FRACTION, TRUNK_HEIGHT_RANGE),
      4,
    )
    // huge: clamped down to 25 → trunkHeight = 25 * 0.3 = 7.5 → clamped to 5.
    expect(meshes[1].coordinates[6 * 3 + 2]).toBeCloseTo(
      clampToRange(25 * TRUNK_FRACTION, TRUNK_HEIGHT_RANGE),
      4,
    )
    // bogus: non-numeric height falls back to the default-with-jitter path
    // (±20% of 8 m). Trunk-top ring z must land inside the resulting band
    // post-clamp ≈ [6.4 * 0.3, 9.6 * 0.3] = [1.92, 2.88].
    const bogusTrunkZ = meshes[2].coordinates[6 * 3 + 2]
    expect(bogusTrunkZ).toBeGreaterThanOrEqual(1.92 - 1e-6)
    expect(bogusTrunkZ).toBeLessThanOrEqual(2.88 + 1e-6)
  })

  it('clamps out-of-range diameter_crown to the [1.5, 7] m canopy radius', () => {
    const features = {
      huge: {
        type: 'Feature',
        properties: { height: 10, diameter_crown: 30 },
        geometry: { type: 'Point', coordinates: [ORIGIN[0], ORIGIN[1]] },
      },
    } as Record<string, Record<string, unknown>>

    const meshes = featuresToDotBimMeshes(features, ORIGIN)
    const coords = meshes[0].coordinates
    let maxZ = 0
    for (let i = 2; i < coords.length; i += 3) {
      if (coords[i] > maxZ) maxZ = coords[i]
    }
    // trunkHeight = 3, canopyRadius clamped to 7 → top = 3 + 2*7 = 17.
    const expectedCanopyRadius = clampToRange(15, CANOPY_RADIUS_RANGE)
    expect(maxZ).toBeCloseTo(3 + 2 * expectedCanopyRadius, 4)
  })

  it('buckets close sizes into the same template via half-metre rounding', () => {
    const features = {
      a: {
        type: 'Feature',
        properties: { height: 10.1, diameter_crown: 6.1 },
        geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      },
      b: {
        type: 'Feature',
        properties: { height: 10.2, diameter_crown: 6.2 },
        geometry: { type: 'Point', coordinates: [-0.094, 51.504] },
      },
    } as Record<string, Record<string, unknown>>

    const { meshes, templateCount } = featuresToDotBimMeshesWithStats(features, ORIGIN)
    expect(meshes).toHaveLength(2)
    expect(templateCount).toBe(1)
  })

  it('mixes valid imports and default-fallback features in one call', () => {
    const features = {
      sized: {
        type: 'Feature',
        properties: { height: 12, crownDiameter: 5 },
        geometry: { type: 'Point', coordinates: [-0.095, 51.505] },
      },
      sdk: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-0.09, 51.51] },
      },
    } as Record<string, Record<string, unknown>>

    const { meshes, templateCount } = featuresToDotBimMeshesWithStats(features, ORIGIN)
    expect(meshes).toHaveLength(2)
    // Two templates: the 12 / 5 sized one + the default for sdk.
    expect(templateCount).toBe(2)
  })
})
