import { describe, expect, it } from 'vitest'
import {
  ANALYSIS_ABOVE_SURFACES_M,
  analysisAboveSurfacesZ,
  DEFAULT_RENDER_Z,
  groundMaterialRenderZ,
  MATERIAL_RENDER_Z,
  RENDER_Z_STEP_M,
  SIM_RENDER_HIERARCHY,
  TOP_SURFACE_RENDER_Z,
} from '../core/ground-materials.render-z'

describe('ground-materials render-z helper', () => {
  it('mirrors the SIM descending hierarchy at 0.2 m render steps', () => {
    // Same descending order the SDK uses for MATERIAL_Z (sim offset, 0.01 m
    // steps): vegetation > soil > water > concrete > asphalt. Scaled to the
    // 0.2 m render step so overlapping surfaces stack visibly without
    // z-fighting.
    expect(MATERIAL_RENDER_Z).toEqual({
      vegetation: 0.8,
      soil: 0.6,
      water: 0.4,
      concrete: 0.2,
      asphalt: 0.0,
    })
  })

  it('uses a 0.2 m step between adjacent hierarchy layers', () => {
    expect(RENDER_Z_STEP_M).toBe(0.2)
    for (let i = 1; i < SIM_RENDER_HIERARCHY.length; i++) {
      const hi = MATERIAL_RENDER_Z[SIM_RENDER_HIERARCHY[i - 1]]
      const lo = MATERIAL_RENDER_Z[SIM_RENDER_HIERARCHY[i]]
      expect(Number((hi - lo).toFixed(10))).toBe(RENDER_Z_STEP_M)
    }
  })

  it('matches the SIM MATERIAL_Z ordering (strictly descending render-z)', () => {
    // SIM_RENDER_HIERARCHY mirrors the SDK sim `MATERIAL_Z` priority
    // (vegetation > soil > water > concrete > asphalt) — the authoritative
    // stacking order. Render-z must be strictly descending in that sequence.
    // NOTE: this deliberately differs from `GROUND_MATERIAL_ORDER`
    // (vegetation > water > soil > ...), which is a clip/processing priority,
    // not a z-stacking order.
    expect(SIM_RENDER_HIERARCHY).toEqual(['vegetation', 'soil', 'water', 'concrete', 'asphalt'])
    const zs = SIM_RENDER_HIERARCHY.map((name) => groundMaterialRenderZ(name))
    for (let i = 1; i < zs.length; i++) {
      expect(zs[i - 1]).toBeGreaterThan(zs[i])
    }
  })

  it('looks up each known material case-insensitively', () => {
    expect(groundMaterialRenderZ('vegetation')).toBe(0.8)
    expect(groundMaterialRenderZ('VEGETATION')).toBe(0.8)
    expect(groundMaterialRenderZ('Asphalt')).toBe(0.0)
    expect(groundMaterialRenderZ('water')).toBe(0.4)
  })

  it('returns the mid-stack default for unknown / undefined materials', () => {
    expect(DEFAULT_RENDER_Z).toBe(0.3)
    expect(groundMaterialRenderZ('granite')).toBe(0.3)
    expect(groundMaterialRenderZ(undefined)).toBe(0.3)
    expect(groundMaterialRenderZ('')).toBe(0.3)
    // Default sits between concrete (0.2) and soil (0.6) so unknown surfaces
    // are plausibly visible without clobbering a known class.
    expect(DEFAULT_RENDER_Z).toBeGreaterThan(MATERIAL_RENDER_Z.concrete)
    expect(DEFAULT_RENDER_Z).toBeLessThan(MATERIAL_RENDER_Z.soil)
  })

  it('exposes the top surface render-z as the max of the table', () => {
    expect(TOP_SURFACE_RENDER_Z).toBe(0.8)
    expect(TOP_SURFACE_RENDER_Z).toBe(Math.max(...Object.values(MATERIAL_RENDER_Z)))
  })

  it('places the analysis result 0.5 m above the top surface', () => {
    expect(ANALYSIS_ABOVE_SURFACES_M).toBe(0.5)
    // top surface (0.8) + 0.5 = 1.3 m above the WGS84 ground datum.
    expect(analysisAboveSurfacesZ()).toBeCloseTo(1.3, 10)
    expect(analysisAboveSurfacesZ(0)).toBeCloseTo(1.3, 10)
  })

  it('adds the analysis lift on top of a 3D-tiles base elevation', () => {
    // When Google 3D Tiles lift the scene, the analysis raster must still sit
    // 1.3 m above the (already-lifted) surfaces.
    expect(analysisAboveSurfacesZ(50)).toBeCloseTo(51.3, 10)
    expect(analysisAboveSurfacesZ(-2)).toBeCloseTo(-0.7, 10)
  })
})
