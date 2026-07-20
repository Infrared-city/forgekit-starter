// ABOUTME: Tests the pure value-predicate filter over numeric result grids.
// ABOUTME: Covers threshold and percentile resolution plus exact mask statistics.

import { describe, expect, it } from 'vitest'
import { computeFilterMask, type HighlightPredicate, resolveHighlight } from '../core/grid-filter'

// 3×3 grid, values 1..9 with one null hole.
const GRID: (number | null)[][] = [
  [1, 2, 3],
  [4, null, 6],
  [7, 8, 9],
]
const SHAPE: [number, number] = [3, 3]

function maskOf(predicate: HighlightPredicate) {
  const resolved = resolveHighlight(predicate, GRID)
  if (!resolved) throw new Error('predicate did not resolve')
  return { resolved, ...computeFilterMask(GRID, SHAPE, resolved) }
}

describe('threshold ops', () => {
  it('gt selects strictly greater', () => {
    const r = maskOf({ op: 'gt', value: 6 })
    expect(r.matchCount).toBe(3) // 7,8,9
    expect(r.matchedMin).toBe(7)
    expect(r.matchedMax).toBe(9)
    expect(r.resolved.resolvedThreshold).toBe(6)
    expect(r.resolved.description).toBe('> 6')
  })

  it('gte includes the boundary', () => {
    expect(maskOf({ op: 'gte', value: 6 }).matchCount).toBe(4) // 6,7,8,9
  })

  it('lt / lte respect the null hole (only finite cells count)', () => {
    expect(maskOf({ op: 'lt', value: 4 }).matchCount).toBe(3) // 1,2,3
    expect(maskOf({ op: 'lte', value: 4 }).matchCount).toBe(4) // 1,2,3,4
  })

  it('between is inclusive on both ends', () => {
    const r = maskOf({ op: 'between', min: 3, max: 7 })
    expect(r.matchCount).toBe(4) // 3,4,6,7 (5 is null)
    expect(r.resolved.resolvedRange).toEqual({ min: 3, max: 7 })
  })

  it('totalFinite excludes the null and matchShare is against it', () => {
    const r = maskOf({ op: 'gt', value: 6 })
    expect(r.totalFinite).toBe(8)
    expect(r.matchShare).toBeCloseTo(3 / 8, 10)
  })
})

describe('percentile ops resolve to absolute cutoffs', () => {
  it('top-percent is the exact mirror of bottom-percent (k largest)', () => {
    // 8 finite values [1,2,3,4,6,7,8,9]; top 25% = k=ceil(0.25*8)=2 largest →
    // cutoff = the 2nd-largest = 8 → {8,9}. (Mirror of bottom 25% → {1,2}.)
    const r = maskOf({ op: 'top-percent', percent: 25 })
    expect(r.resolved.resolvedThreshold).toBe(8)
    expect(r.matchCount).toBe(2)
    expect(r.resolved.description).toContain('top 25%')
    expect(r.resolved.description).toContain('≥ 8')
  })

  it('bottom-percent selects the lowest share', () => {
    const r = maskOf({ op: 'bottom-percent', percent: 25 })
    // bottom 25% = 2nd value → cutoff 2 → {1,2}
    expect(r.resolved.resolvedThreshold).toBe(2)
    expect(r.matchCount).toBe(2)
  })

  it('top and bottom at the same percent select the same count', () => {
    const top = maskOf({ op: 'top-percent', percent: 50 })
    const bottom = maskOf({ op: 'bottom-percent', percent: 50 })
    expect(top.matchCount).toBe(bottom.matchCount)
  })

  it('top-percent 100 matches every finite cell', () => {
    expect(maskOf({ op: 'top-percent', percent: 100 }).matchCount).toBe(8)
  })
})

describe('resolution failures return null', () => {
  it('missing operands', () => {
    expect(resolveHighlight({ op: 'gt' }, GRID)).toBeNull()
    expect(resolveHighlight({ op: 'between', min: 3 }, GRID)).toBeNull()
    expect(resolveHighlight({ op: 'between', min: 5, max: 3 }, GRID)).toBeNull()
    expect(resolveHighlight({ op: 'top-percent' }, GRID)).toBeNull()
    expect(resolveHighlight({ op: 'top-percent', percent: 0 }, GRID)).toBeNull()
    expect(resolveHighlight({ op: 'top-percent', percent: 150 }, GRID)).toBeNull()
  })

  it('percentile op on an all-null grid', () => {
    const allNull: (number | null)[][] = [
      [null, null],
      [null, null],
    ]
    expect(resolveHighlight({ op: 'top-percent', percent: 10 }, allNull)).toBeNull()
  })
})

describe('empty match', () => {
  it('reports zero without NaN extremes', () => {
    const r = maskOf({ op: 'gt', value: 100 })
    expect(r.matchCount).toBe(0)
    expect(r.matchedMin).toBeNull()
    expect(r.matchedMax).toBeNull()
    expect(r.matchShare).toBe(0)
  })
})
