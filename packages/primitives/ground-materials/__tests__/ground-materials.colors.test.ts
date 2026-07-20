/**
 * Render-only pastel transform for the ground-material area surface.
 *
 * The registry `diffuseColor` is tuned for the physical sim and reads harsh on
 * the basemap (near-black asphalt, vivid grass). `pastelizeGroundColor` softens
 * ONLY the rendered fill — the registry is untouched:
 *  - light mode: desaturate toward luminance, then lift toward white → bright,
 *    happy, calm pastel.
 *  - dark mode: same desaturation but lift toward a calm mid-tone (not white,
 *    which glares on a dark basemap) → muted but still visible.
 *
 * Values below are the exact deterministic output (round once, at the end).
 */

import { describe, expect, it } from 'vitest'
import { pastelizeGroundColor } from '../core/ground-materials.colors'

describe('pastelizeGroundColor', () => {
  it('lifts near-black asphalt to a calm grey in light mode (gray stays neutral)', () => {
    // [13,13,13] is already neutral → stays neutral, lifted toward white.
    expect(pastelizeGroundColor([13, 13, 13], 'light')).toEqual([115, 115, 115])
  })

  it('lifts asphalt LESS in dark mode than light (light mode is brighter)', () => {
    const light = pastelizeGroundColor([13, 13, 13], 'light')
    const dark = pastelizeGroundColor([13, 13, 13], 'dark')
    expect(dark).toEqual([74, 74, 74])
    expect(dark[0]).toBeLessThan(light[0])
  })

  it('desaturates and brightens vivid grass to a pastel in light mode', () => {
    // vegetation [143,237,143]: channels pull together (less saturated) and up.
    const out = pastelizeGroundColor([143, 237, 143], 'light')
    expect(out).toEqual([208, 238, 208])
    const inSpread = 237 - 143
    const outSpread = out[1] - out[0]
    expect(outSpread).toBeLessThan(inSpread) // less saturated
  })

  it('mutes grass toward a calm mid-tone in dark mode', () => {
    expect(pastelizeGroundColor([143, 237, 143], 'dark')).toEqual([170, 201, 170])
  })

  it('keeps pure white at white in light mode (no overflow)', () => {
    expect(pastelizeGroundColor([255, 255, 255], 'light')).toEqual([255, 255, 255])
  })

  it('preserves neutral grey as neutral in both modes', () => {
    const light = pastelizeGroundColor([128, 128, 128], 'light')
    const dark = pastelizeGroundColor([128, 128, 128], 'dark')
    expect(light[0]).toBe(light[1])
    expect(light[1]).toBe(light[2])
    expect(dark[0]).toBe(dark[1])
    expect(dark[1]).toBe(dark[2])
  })
})
