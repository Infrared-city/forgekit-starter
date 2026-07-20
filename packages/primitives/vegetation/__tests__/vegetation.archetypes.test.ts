import { describe, expect, it } from 'vitest'
import { featuresToDotBimMeshesWithStats } from '../core/vegetation.mesh-builder'

const ORIGIN: [number, number] = [-0.1, 51.5]

function tree(archetype: string | undefined, height = 12, crownDiameter = 4) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-0.0995, 51.5005] },
    properties: { height, crownDiameter, ...(archetype ? { archetype } : {}) },
  } as Record<string, unknown>
}

function zMax(coordinates: number[]): number {
  let max = -Infinity
  for (let i = 2; i < coordinates.length; i += 3) if (coordinates[i] > max) max = coordinates[i]
  return max
}

describe('tree archetypes', () => {
  it('conical crowns reach the full tree height (apex at ~totalHeight)', () => {
    const { meshes } = featuresToDotBimMeshesWithStats({ a: tree('conical') }, ORIGIN)
    // trunk 12*0.3=3.6, canopy 12-3.6=8.4 → apex at 12.
    expect(zMax(meshes[0].coordinates as number[])).toBeCloseTo(12, 1)
  })

  it('columnar crowns stretch to the full tree height', () => {
    const { meshes } = featuresToDotBimMeshesWithStats({ a: tree('columnar') }, ORIGIN)
    expect(zMax(meshes[0].coordinates as number[])).toBeCloseTo(12, 1)
  })

  it('round stays byte-identical whether archetype is omitted or explicit', () => {
    const implicit = featuresToDotBimMeshesWithStats({ a: tree(undefined) }, ORIGIN)
    const explicit = featuresToDotBimMeshesWithStats({ a: tree('round') }, ORIGIN)
    expect(implicit.meshes[0].coordinates).toEqual(explicit.meshes[0].coordinates)
    expect(implicit.meshes[0].indices).toEqual(explicit.meshes[0].indices)
  })

  it('unknown archetype values fall back to round', () => {
    const weird = featuresToDotBimMeshesWithStats({ a: tree('bonsai') }, ORIGIN)
    const round = featuresToDotBimMeshesWithStats({ a: tree('round') }, ORIGIN)
    expect(weird.meshes[0].coordinates).toEqual(round.meshes[0].coordinates)
  })

  it('different archetypes never share a template', () => {
    const { templateCount } = featuresToDotBimMeshesWithStats(
      { a: tree('round'), b: tree('conical'), c: tree('columnar') },
      ORIGIN,
    )
    expect(templateCount).toBe(3)
  })
})
