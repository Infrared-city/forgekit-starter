// ABOUTME: Pure value-predicate filter over a result grid — the deterministic answer path.
// ABOUTME: Resolves threshold/percentile ops to an absolute predicate + boolean match mask + stats.

/**
 * Value-defined questions ("where is UTCI > 30", "the hottest 5%") are
 * answered EXACTLY over the grid — no model vision. This module resolves a
 * `HighlightPredicate` to a concrete numeric threshold (percentile ops
 * resolve against the finite values), builds a boolean match mask, and
 * reports match stats. The renderer dims non-matches; `grid-mask-polygon`
 * turns the mask into a polygon.
 *
 * Pure + framework-free: no canvas, no React, unit-tested.
 */

export type HighlightOp = 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'top-percent' | 'bottom-percent'

export interface HighlightPredicate {
  op: HighlightOp
  /** For gt/gte/lt/lte. */
  value?: number
  /** For between (inclusive). */
  min?: number
  max?: number
  /** For top-percent/bottom-percent, 0 < percent ≤ 100. */
  percent?: number
  /** Optional human label for the render legend + narration. */
  label?: string
}

export interface ResolvedHighlight {
  op: HighlightOp
  predicate: (value: number) => boolean
  /** Human-readable resolved rule, e.g. "> 30.0" or "top 5% (≥ 31.2)". */
  description: string
  /** The absolute value(s) the predicate compares against, after resolving
   *  percentiles — so the model can state the concrete cutoff. */
  resolvedThreshold: number | null
  resolvedRange: { min: number; max: number } | null
}

export interface FilterMask {
  /** rows × cols booleans; true = matches AND is finite. */
  mask: boolean[][]
  matchCount: number
  totalFinite: number
  /** matchCount / totalFinite, or 0 when no finite cells. */
  matchShare: number
  /** value extremes among MATCHED cells; null when nothing matched. */
  matchedMin: number | null
  matchedMax: number | null
}

function finiteValues(mergedGrid: (number | null)[][]): number[] {
  const out: number[] = []
  for (const row of mergedGrid) {
    for (const v of row) {
      if (v !== null && Number.isFinite(v)) out.push(v)
    }
  }
  return out
}

/** k = the count for a fraction of n, nearest-rank (≥1, ≤n). The single
 *  definition shared by top and bottom so they are EXACT mirrors: bottom
 *  selects the k smallest (`≤ values[k-1]`), top the k largest
 *  (`≥ values[n-k]`). */
function rankCount(n: number, frac: number): number {
  return Math.min(n, Math.max(1, Math.ceil(frac * n)))
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/**
 * Resolve a predicate against the grid's finite values. Returns null when the
 * predicate is ill-formed (missing operands) or unsatisfiable to resolve
 * (percentile op on an all-null grid) — callers surface that as a tool error.
 */
export function resolveHighlight(
  predicate: HighlightPredicate,
  mergedGrid: (number | null)[][],
): ResolvedHighlight | null {
  const { op } = predicate
  const num = (v: number | undefined): v is number => typeof v === 'number' && Number.isFinite(v)

  if (op === 'gt' || op === 'gte' || op === 'lt' || op === 'lte') {
    if (!num(predicate.value)) return null
    const t = predicate.value
    const cmp: Record<typeof op, (v: number) => boolean> = {
      gt: (v) => v > t,
      gte: (v) => v >= t,
      lt: (v) => v < t,
      lte: (v) => v <= t,
    }
    const sym = { gt: '>', gte: '≥', lt: '<', lte: '≤' }[op]
    return {
      op,
      predicate: cmp[op],
      description: `${sym} ${fmt(t)}`,
      resolvedThreshold: t,
      resolvedRange: null,
    }
  }

  if (op === 'between') {
    if (!num(predicate.min) || !num(predicate.max) || predicate.max < predicate.min) return null
    const lo = predicate.min
    const hi = predicate.max
    return {
      op,
      predicate: (v) => v >= lo && v <= hi,
      description: `between ${fmt(lo)} and ${fmt(hi)}`,
      resolvedThreshold: null,
      resolvedRange: { min: lo, max: hi },
    }
  }

  // Percentile ops: resolve to an absolute cutoff over the finite values.
  if (!num(predicate.percent) || predicate.percent <= 0 || predicate.percent > 100) return null
  const values = finiteValues(mergedGrid).sort((a, b) => a - b)
  const n = values.length
  if (n === 0) return null
  const k = rankCount(n, predicate.percent / 100)

  if (op === 'top-percent') {
    // The k LARGEST finite values → cutoff = the k-th largest. (Ties AT the
    // cutoff include their duplicates, same as bottom-percent — inherent to a
    // value-threshold, and now symmetric between the two ops.)
    const cutoff = values[n - k]
    return {
      op,
      predicate: (v) => v >= cutoff,
      description: `top ${fmt(predicate.percent)}% (≥ ${fmt(cutoff)})`,
      resolvedThreshold: cutoff,
      resolvedRange: null,
    }
  }

  // The k SMALLEST finite values → cutoff = the k-th smallest.
  const cutoff = values[k - 1]
  return {
    op,
    predicate: (v) => v <= cutoff,
    description: `bottom ${fmt(predicate.percent)}% (≤ ${fmt(cutoff)})`,
    resolvedThreshold: cutoff,
    resolvedRange: null,
  }
}

/** Boolean match mask + stats for a resolved predicate over the grid. */
export function computeFilterMask(
  mergedGrid: (number | null)[][],
  gridShape: readonly [number, number],
  resolved: ResolvedHighlight,
): FilterMask {
  const [rows, cols] = gridShape
  const mask: boolean[][] = []
  let matchCount = 0
  let totalFinite = 0
  let matchedMin = Number.POSITIVE_INFINITY
  let matchedMax = Number.NEGATIVE_INFINITY
  for (let r = 0; r < rows; r++) {
    const srcRow = mergedGrid[r]
    const maskRow = new Array<boolean>(cols).fill(false)
    for (let c = 0; c < cols; c++) {
      const v = srcRow?.[c]
      if (v === null || v === undefined || !Number.isFinite(v)) continue
      totalFinite++
      if (resolved.predicate(v)) {
        maskRow[c] = true
        matchCount++
        if (v < matchedMin) matchedMin = v
        if (v > matchedMax) matchedMax = v
      }
    }
    mask.push(maskRow)
  }
  return {
    mask,
    matchCount,
    totalFinite,
    matchShare: totalFinite > 0 ? matchCount / totalFinite : 0,
    matchedMin: matchCount > 0 ? matchedMin : null,
    matchedMax: matchCount > 0 ? matchedMax : null,
  }
}
