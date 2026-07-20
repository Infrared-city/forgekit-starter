/**
 * Tests for resolveMergeStrategy — the silent-fallback guard that
 * prevents directional-strategy params from being forwarded to the SDK
 * when they would cause a throw.
 *
 * Sonnet-5 review (2026-05-23) flagged this file as test-gap: critical
 * guard logic with three distinct branches, trivially testable, zero
 * coverage.
 */
import { describe, expect, it, vi } from 'vitest'
import type { RunAreaInput } from '../react/analysis.area-run-api'
import { resolveMergeStrategy } from '../react/analysis.merge-strategy'

function makeInput(extras: Record<string, unknown> = {}): RunAreaInput {
  // RunAreaInput accepts arbitrary extras via an index signature; the
  // tests probe only the fields the helper cares about.
  return extras as unknown as RunAreaInput
}

describe('resolveMergeStrategy', () => {
  it('returns empty for non-wind-speed analyses regardless of input', () => {
    const out = resolveMergeStrategy(
      makeInput({ strategy: 'directional', windDirectionDeg: 270 }),
      'thermal-comfort-index',
    )
    expect(out).toEqual({})
  })

  it('returns empty for wind-speed without a strategy on input', () => {
    const out = resolveMergeStrategy(makeInput({}), 'wind-speed')
    expect(out).toEqual({})
  })

  it('returns empty when strategy is set but windDirectionDeg missing', () => {
    const out = resolveMergeStrategy(makeInput({ strategy: 'directional' }), 'wind-speed')
    expect(out).toEqual({})
  })

  it('returns empty when strategy is an unknown value (defensive)', () => {
    const out = resolveMergeStrategy(
      makeInput({ strategy: 'bogus', windDirectionDeg: 90 }),
      'wind-speed',
    )
    expect(out).toEqual({})
  })

  it('forwards directional + windDirectionDeg=270 for wind-speed', () => {
    const out = resolveMergeStrategy(
      makeInput({ strategy: 'directional', windDirectionDeg: 270 }),
      'wind-speed',
    )
    expect(out).toEqual({ strategy: 'directional', windDirectionDeg: 270 })
  })

  it('forwards directional_blend + windDirectionDeg=0 for wind-speed', () => {
    const out = resolveMergeStrategy(
      makeInput({ strategy: 'directional_blend', windDirectionDeg: 0 }),
      'wind-speed',
    )
    expect(out).toEqual({ strategy: 'directional_blend', windDirectionDeg: 0 })
  })

  it('treats non-numeric windDirectionDeg as missing', () => {
    const out = resolveMergeStrategy(
      makeInput({ strategy: 'directional', windDirectionDeg: '270' as unknown as number }),
      'wind-speed',
    )
    expect(out).toEqual({})
  })

  it('only console.debug — never console.log (no prod noise)', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    resolveMergeStrategy(makeInput({}), 'wind-speed')
    resolveMergeStrategy(makeInput({ strategy: 'directional' }), 'wind-speed')
    resolveMergeStrategy(makeInput({ strategy: 'directional', windDirectionDeg: 90 }), 'wind-speed')
    expect(logSpy).not.toHaveBeenCalled()
    logSpy.mockRestore()
  })
})
