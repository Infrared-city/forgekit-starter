import { describe, expect, it } from 'vitest'
import { darkenColor, generateDrawStyles, rgbToHex } from '../core/ground-materials.draw-styles'
import type { GroundMaterialRegistry } from '../core/ground-materials.sdk-types'

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('rgbToHex', () => {
  it('should convert normal [0-1] RGB values to hex', () => {
    expect(rgbToHex([1, 0, 0])).toBe('#ff0000')
    expect(rgbToHex([0, 1, 0])).toBe('#00ff00')
    expect(rgbToHex([0, 0, 1])).toBe('#0000ff')
  })

  it('should convert boundary [0,0,0] to #000000', () => {
    expect(rgbToHex([0, 0, 0])).toBe('#000000')
  })

  it('should convert boundary [1,1,1] to #ffffff', () => {
    expect(rgbToHex([1, 1, 1])).toBe('#ffffff')
  })

  it('should handle mid-range values', () => {
    // 0.5 * 255 = 127.5, rounds to 128 = 0x80
    expect(rgbToHex([0.5, 0.5, 0.5])).toBe('#808080')
  })

  it('should pad single-digit hex values', () => {
    // Small value: 0.01 * 255 = 2.55, rounds to 3 = 0x03
    expect(rgbToHex([0.01, 0, 0])).toBe('#030000')
  })
})

describe('darkenColor', () => {
  it('should darken a color by default 30%', () => {
    // #ff0000 darkened by 30%: 255 * 0.7 = 178.5 -> 179 = 0xb3
    const result = darkenColor('#ff0000')
    expect(result).toBe('#b30000')
  })

  it('should not change color when percent is 0', () => {
    expect(darkenColor('#ff8040', 0)).toBe('#ff8040')
  })

  it('should return #000000 when percent is 1 (full darken)', () => {
    expect(darkenColor('#ff8040', 1)).toBe('#000000')
  })

  it('should darken all channels proportionally', () => {
    // #804020 darkened by 50%: r=128*0.5=64=0x40, g=64*0.5=32=0x20, b=32*0.5=16=0x10
    expect(darkenColor('#804020', 0.5)).toBe('#402010')
  })

  it('should handle white color', () => {
    // #ffffff darkened by 30%: 255 * 0.7 = 178.5 -> 179 = 0xb3
    expect(darkenColor('#ffffff', 0.3)).toBe('#b3b3b3')
  })

  it('should handle black color (no change possible)', () => {
    expect(darkenColor('#000000', 0.5)).toBe('#000000')
  })
})

describe('generateDrawStyles', () => {
  const mockRegistry: GroundMaterialRegistry = {
    version: '1.0',
    uuid: 'registry-uuid',
    materials: {
      'uuid-vegetation': {
        name: 'vegetation',
        displayName: 'Vegetation',
        diffuseColor: [0.2, 0.6, 0.1],
        specularColor: [0, 0, 0],
        shine: 0,
        reflectivity: 0.2,
        emissiveColor: [0, 0, 0],
        opacity: 1,
        thickness: 0.1,
        density: 1000,
        thermalConductivity: 0.5,
        specificHeat: 1000,
        solarAbsorptance: 0.7,
        thermalAbsorptance: 0.9,
        visibleAbsorptance: 0.7,
        roughness: 0.5,
        porosity: 0.3,
        carbonFactor: 0,
        uuid: 'uuid-vegetation',
      },
      'uuid-concrete': {
        name: 'concrete',
        displayName: 'Concrete',
        diffuseColor: [0.7, 0.7, 0.7],
        specularColor: [0, 0, 0],
        shine: 0,
        reflectivity: 0.3,
        emissiveColor: [0, 0, 0],
        opacity: 1,
        thickness: 0.2,
        density: 2300,
        thermalConductivity: 1.4,
        specificHeat: 880,
        solarAbsorptance: 0.6,
        thermalAbsorptance: 0.9,
        visibleAbsorptance: 0.6,
        roughness: 0.4,
        porosity: 0.15,
        carbonFactor: 0.1,
        uuid: 'uuid-concrete',
      },
    },
  }

  it('should generate 3 styles per material (fill, stroke, line)', () => {
    const styles = generateDrawStyles(mockRegistry)
    // 2 materials * 3 styles each = 6 material styles
    // Plus static styles: 2 preview + 2 invalid + 2 default polygon + 1 default line
    //   + 2 active polygon + 1 active line + 1 midpoint + 1 vertex halo + 1 vertex
    // = 6 + 2 + 2 + 2 + 1 + 2 + 1 + 1 + 1 + 1 = 19
    const materialStyleIds = styles.filter(
      (s) =>
        (s as { id: string }).id.includes('vegetation') ||
        (s as { id: string }).id.includes('concrete'),
    )
    expect(materialStyleIds).toHaveLength(6)
  })

  it('should generate correct filter structure for material styles', () => {
    const styles = generateDrawStyles(mockRegistry)
    const vegFill = styles.find(
      (s) => (s as { id: string }).id === 'gl-draw-polygon-fill-vegetation',
    ) as Record<string, unknown>

    expect(vegFill).toBeDefined()
    expect(vegFill.type).toBe('fill')
    expect(vegFill.filter).toEqual([
      'all',
      ['==', '$type', 'Polygon'],
      ['==', 'user_material', 'vegetation'],
    ])
  })

  it('should use diffuseColor for fill and darkened color for stroke', () => {
    const styles = generateDrawStyles(mockRegistry)
    const vegFill = styles.find(
      (s) => (s as { id: string }).id === 'gl-draw-polygon-fill-vegetation',
    ) as Record<string, unknown>
    const vegStroke = styles.find(
      (s) => (s as { id: string }).id === 'gl-draw-polygon-stroke-vegetation',
    ) as Record<string, unknown>

    const expectedBaseColor = rgbToHex([0.2, 0.6, 0.1])
    const expectedStrokeColor = darkenColor(expectedBaseColor, 0.3)

    expect((vegFill.paint as Record<string, unknown>)['fill-color']).toBe(expectedBaseColor)
    expect((vegStroke.paint as Record<string, unknown>)['line-color']).toBe(expectedStrokeColor)
  })

  it('should include preview, invalid, default, active, midpoint, and vertex styles', () => {
    const styles = generateDrawStyles(mockRegistry)
    const ids = styles.map((s) => (s as { id: string }).id)

    // Preview styles
    expect(ids).toContain('gl-draw-polygon-fill-preview')
    expect(ids).toContain('gl-draw-polygon-stroke-preview')

    // Invalid styles
    expect(ids).toContain('gl-draw-polygon-fill-invalid')
    expect(ids).toContain('gl-draw-polygon-stroke-invalid')

    // Default styles
    expect(ids).toContain('gl-draw-polygon-fill-default')
    expect(ids).toContain('gl-draw-polygon-stroke-default')
    expect(ids).toContain('gl-draw-line-default')

    // Active styles
    expect(ids).toContain('gl-draw-polygon-fill-active')
    expect(ids).toContain('gl-draw-polygon-stroke-active')
    expect(ids).toContain('gl-draw-line-active')

    // Midpoint and vertex
    expect(ids).toContain('gl-draw-polygon-midpoint')
    expect(ids).toContain('gl-draw-polygon-and-line-vertex-halo-active')
    expect(ids).toContain('gl-draw-polygon-and-line-vertex-active')
  })

  it('should return only static styles when registry is null', () => {
    const styles = generateDrawStyles(null)
    // No material-specific styles, only static ones
    const materialStyles = styles.filter(
      (s) =>
        (s as { id: string }).id.includes('vegetation') ||
        (s as { id: string }).id.includes('concrete'),
    )
    expect(materialStyles).toHaveLength(0)
    // Should still have preview, invalid, default, active, midpoint, vertex styles
    expect(styles.length).toBeGreaterThan(0)
  })

  it('should return only static styles when registry has no materials', () => {
    const emptyRegistry: GroundMaterialRegistry = {
      version: '1.0',
      uuid: 'empty-uuid',
      materials: {},
    }
    const styles = generateDrawStyles(emptyRegistry)
    // Only static styles (no material-specific ones)
    const ids = styles.map((s) => (s as { id: string }).id)
    expect(ids.every((id) => !id.includes('vegetation') && !id.includes('concrete'))).toBe(true)
  })

  it('should generate line style with special width expression for asphalt', () => {
    const asphaltRegistry: GroundMaterialRegistry = {
      version: '1.0',
      uuid: 'test-uuid',
      materials: {
        'uuid-asphalt': {
          name: 'asphalt',
          displayName: 'Asphalt',
          diffuseColor: [0.3, 0.3, 0.3],
          specularColor: [0, 0, 0],
          shine: 0,
          reflectivity: 0.1,
          emissiveColor: [0, 0, 0],
          opacity: 1,
          thickness: 0.05,
          density: 2360,
          thermalConductivity: 0.75,
          specificHeat: 920,
          solarAbsorptance: 0.9,
          thermalAbsorptance: 0.9,
          visibleAbsorptance: 0.9,
          roughness: 0.6,
          porosity: 0.05,
          carbonFactor: 0.05,
          uuid: 'uuid-asphalt',
        },
      },
    }

    const styles = generateDrawStyles(asphaltRegistry)
    const asphaltLine = styles.find(
      (s) => (s as { id: string }).id === 'gl-draw-line-asphalt',
    ) as Record<string, unknown>

    expect(asphaltLine).toBeDefined()
    // Asphalt line-width should be a conditional expression (array), not a plain number
    const lineWidth = (asphaltLine.paint as Record<string, unknown>)['line-width']
    expect(Array.isArray(lineWidth)).toBe(true)
  })

  it('should generate line style with plain number width for non-asphalt materials', () => {
    const styles = generateDrawStyles(mockRegistry)
    const vegLine = styles.find(
      (s) => (s as { id: string }).id === 'gl-draw-line-vegetation',
    ) as Record<string, unknown>

    expect(vegLine).toBeDefined()
    const lineWidth = (vegLine.paint as Record<string, unknown>)['line-width']
    expect(lineWidth).toBe(6)
  })
})
