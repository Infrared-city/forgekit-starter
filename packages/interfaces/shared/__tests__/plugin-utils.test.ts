import { describe, expect, it } from 'vitest'
import type { PluginBase } from '../plugin-types.ts'
import { orderPlugins, validatePlugins } from '../plugin-utils.ts'

// ---------------------------------------------------------------------------
// Helper: minimal plugin factory
// ---------------------------------------------------------------------------

function plugin(id: string, requires?: string[]): PluginBase {
  return { id, requires }
}

// ---------------------------------------------------------------------------
// validatePlugins
// ---------------------------------------------------------------------------

describe('validatePlugins', () => {
  it('passes when no plugins have requirements', () => {
    const plugins = [plugin('a'), plugin('b'), plugin('c')]
    expect(() => validatePlugins(plugins)).not.toThrow()
  })

  it('passes when all requirements are satisfied', () => {
    const plugins = [
      plugin('buildings'),
      plugin('analysis', ['buildings']),
      plugin('ground-materials'),
    ]
    expect(() => validatePlugins(plugins)).not.toThrow()
  })

  it('passes with an empty plugin list', () => {
    expect(() => validatePlugins([])).not.toThrow()
  })

  it('throws when a required plugin is missing', () => {
    const plugins = [plugin('analysis', ['buildings'])]
    expect(() => validatePlugins(plugins)).toThrow(/Plugin "analysis" requires "buildings"/)
  })

  it('throws listing all missing dependencies', () => {
    const plugins = [
      plugin('analysis', ['buildings', 'weather']),
      plugin('overlay', ['scene-manager']),
    ]
    expect(() => validatePlugins(plugins)).toThrow(/buildings/)
    expect(() => validatePlugins(plugins)).toThrow(/weather/)
    expect(() => validatePlugins(plugins)).toThrow(/scene-manager/)
  })

  it('throws with descriptive error message format', () => {
    const plugins = [plugin('x', ['y'])]
    expect(() => validatePlugins(plugins)).toThrow('Plugin validation failed:')
  })

  it('passes when requires is undefined', () => {
    const plugins = [plugin('a'), { id: 'b' }]
    expect(() => validatePlugins(plugins)).not.toThrow()
  })

  it('passes when requires is an empty array', () => {
    const plugins = [plugin('a', []), plugin('b', [])]
    expect(() => validatePlugins(plugins)).not.toThrow()
  })

  it('throws on duplicate plugin IDs', () => {
    const plugins = [plugin('a'), plugin('a')]
    expect(() => validatePlugins(plugins)).toThrow(/Duplicate plugin id "a"/)
  })

  it('throws on duplicate IDs even when deps are satisfied', () => {
    const plugins = [plugin('a'), plugin('b', ['a']), plugin('a')]
    expect(() => validatePlugins(plugins)).toThrow(/Duplicate plugin id "a"/)
  })
})

// ---------------------------------------------------------------------------
// orderPlugins
// ---------------------------------------------------------------------------

describe('orderPlugins', () => {
  it('returns plugins in original order when there are no dependencies', () => {
    const plugins = [plugin('a'), plugin('b'), plugin('c')]
    const result = orderPlugins(plugins)
    expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })

  it('orders a linear dependency chain correctly', () => {
    // c depends on b, b depends on a => a, b, c
    const plugins = [plugin('c', ['b']), plugin('b', ['a']), plugin('a')]
    const result = orderPlugins(plugins)
    const ids = result.map((p) => p.id)

    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'))
  })

  it('handles a diamond dependency graph', () => {
    //     a
    //    / \
    //   b   c
    //    \ /
    //     d
    const plugins = [plugin('d', ['b', 'c']), plugin('c', ['a']), plugin('b', ['a']), plugin('a')]
    const result = orderPlugins(plugins)
    const ids = result.map((p) => p.id)

    // a must come before b and c; b and c must come before d
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'))
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('d'))
    expect(ids.indexOf('c')).toBeLessThan(ids.indexOf('d'))
  })

  it('handles independent plugins (no deps between them)', () => {
    const plugins = [plugin('x'), plugin('y'), plugin('z')]
    const result = orderPlugins(plugins)
    expect(result).toHaveLength(3)
    expect(new Set(result.map((p) => p.id))).toEqual(new Set(['x', 'y', 'z']))
  })

  it('preserves plugin references (same objects)', () => {
    const a = plugin('a')
    const b = plugin('b', ['a'])
    const result = orderPlugins([b, a])
    expect(result[0]).toBe(a)
    expect(result[1]).toBe(b)
  })

  it('throws on circular dependency between two plugins', () => {
    const plugins = [plugin('a', ['b']), plugin('b', ['a'])]
    expect(() => orderPlugins(plugins)).toThrow(/Circular dependency/)
  })

  it('throws on circular dependency among three plugins', () => {
    const plugins = [plugin('a', ['c']), plugin('b', ['a']), plugin('c', ['b'])]
    expect(() => orderPlugins(plugins)).toThrow(/Circular dependency/)
  })

  it('mentions the involved plugins in the circular error', () => {
    const plugins = [plugin('alpha', ['beta']), plugin('beta', ['alpha']), plugin('gamma')]
    expect(() => orderPlugins(plugins)).toThrow(/alpha/)
    expect(() => orderPlugins(plugins)).toThrow(/beta/)
  })

  it('throws on missing dependency (delegates to validatePlugins)', () => {
    const plugins = [plugin('a', ['missing'])]
    expect(() => orderPlugins(plugins)).toThrow(/requires "missing"/)
  })

  it('handles a single plugin with no deps', () => {
    const result = orderPlugins([plugin('solo')])
    expect(result.map((p) => p.id)).toEqual(['solo'])
  })

  it('handles an empty plugin list', () => {
    const result = orderPlugins([])
    expect(result).toEqual([])
  })

  it('throws on duplicate plugin IDs (delegates to validatePlugins)', () => {
    const plugins = [plugin('a'), plugin('a')]
    expect(() => orderPlugins(plugins)).toThrow(/Duplicate plugin id "a"/)
  })

  it('handles a complex realistic scenario', () => {
    // buildings (no deps)
    // analysis (requires buildings)
    // ground-materials (no deps)
    // indoor-analysis (requires buildings)
    const plugins = [
      plugin('indoor-analysis', ['buildings']),
      plugin('ground-materials'),
      plugin('analysis', ['buildings']),
      plugin('buildings'),
    ]
    const result = orderPlugins(plugins)
    const ids = result.map((p) => p.id)

    expect(ids.indexOf('buildings')).toBeLessThan(ids.indexOf('analysis'))
    expect(ids.indexOf('buildings')).toBeLessThan(ids.indexOf('indoor-analysis'))
    expect(result).toHaveLength(4)
  })
})
