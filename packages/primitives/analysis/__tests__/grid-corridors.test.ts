// ABOUTME: Exercises deterministic least-cost corridors and terminal networks on result grids.
// ABOUTME: Locks preference weighting, no-data barriers, snapping, and spanning-tree behavior.

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CORRIDOR_MAX_EXPANDED,
  DEFAULT_SINGLE_CORRIDOR_MAX_EXPANDED,
  findGridCorridor,
  findGridCorridorNetwork,
  type NumericResultGrid,
} from '../core'

function grid(values: Array<Array<number | null>>): NumericResultGrid {
  return {
    mergedGrid: values,
    gridShape: [values.length, values[0]?.length ?? 0],
    gridBounds: { west: 0, south: 0, east: 0.05, north: 0.05 },
  }
}

function center(row: number, col: number): [number, number] {
  return [(col + 0.5) * 0.01, (row + 0.5) * 0.01]
}

function syntheticGrid(size: number): NumericResultGrid {
  let seed = 42
  const random = (): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  return {
    mergedGrid: Array.from({ length: size }, () =>
      Array.from({ length: size }, () => random() * 10),
    ),
    gridShape: [size, size],
    gridBounds: { west: 10, south: 50, east: 10.05, north: 50.05 },
  }
}

function syntheticPosition(size: number, row: number, col: number): [number, number] {
  return [10 + ((col + 0.5) / size) * 0.05, 50 + ((row + 0.5) / size) * 0.05]
}

function spreadTerminals(size: number): Array<{ id: string; position: [number, number] }> {
  return [
    { id: 'a', position: syntheticPosition(size, 5, 5) },
    { id: 'b', position: syntheticPosition(size, 5, size - 6) },
    { id: 'c', position: syntheticPosition(size, size - 6, 5) },
    { id: 'd', position: syntheticPosition(size, size - 6, size - 6) },
    { id: 'e', position: syntheticPosition(size, Math.floor(size / 2), Math.floor(size / 2)) },
    {
      id: 'f',
      position: syntheticPosition(size, Math.floor(size / 4), Math.floor((3 * size) / 4)),
    },
  ]
}

describe('findGridCorridor', () => {
  const values = [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [9, 9, 9, 9, 9],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ]

  it('routes around high values when lower values are preferred', () => {
    const result = findGridCorridor(grid(values), center(2, 0), center(2, 4), {
      preference: 'lower',
    })

    expect(result).not.toHaveProperty('error')
    if ('error' in result) return
    expect(result.cells[0]).toMatchObject({ row: 2, col: 0 })
    expect(result.cells.at(-1)).toMatchObject({ row: 2, col: 4 })
    expect(result.cells.slice(1, -1).some((cell) => cell.row !== 2)).toBe(true)
    expect(result.stats.mean).toBeLessThan(9)
  })

  it('uses the high-value centerline when higher values are preferred', () => {
    const result = findGridCorridor(grid(values), center(2, 0), center(2, 4), {
      preference: 'higher',
    })

    expect(result).not.toHaveProperty('error')
    if ('error' in result) return
    expect(result.cells.every((cell) => cell.row === 2)).toBe(true)
    expect(result.stats.mean).toBe(9)
  })

  it('treats no-data as a barrier and snaps a blocked endpoint to finite evidence', () => {
    const result = findGridCorridor(
      grid([
        [1, 1, null, 1, 1],
        [1, 1, null, 1, 1],
        [null, 1, 1, 1, 1],
        [1, 1, null, 1, 1],
        [1, 1, null, 1, 1],
      ]),
      center(2, 0),
      center(2, 4),
      { preference: 'lower' },
    )

    expect(result).not.toHaveProperty('error')
    if ('error' in result) return
    expect(result.start.snapped).toBe(true)
    expect(result.cells.some((cell) => cell.row === 2 && cell.col === 2)).toBe(true)
    expect(result.cells.every((cell) => cell.value !== null)).toBe(true)
  })

  it('returns an actionable error when the expansion budget is exhausted', () => {
    const result = findGridCorridor(
      grid(Array.from({ length: 5 }, () => [1, 1, 1, 1, 1])),
      center(0, 0),
      center(4, 4),
      { maxExpanded: 2 },
    )

    expect(result).toEqual({ error: 'No corridor found within the 2-cell expansion budget.' })
  })

  it('rejects terminals that resolve to the same finite cell', () => {
    const result = findGridCorridor(
      grid(Array.from({ length: 5 }, () => [1, 1, 1, 1, 1])),
      center(1, 1),
      [center(1, 1)[0] + 0.001, center(1, 1)[1]],
    )

    expect(result).toEqual({
      error: 'Corridor endpoints must resolve to different finite grid cells.',
    })
  })

  it('keeps its own 250000-cell default budget, separate from the network default', () => {
    expect(DEFAULT_SINGLE_CORRIDOR_MAX_EXPANDED).toBe(250_000)
    expect(DEFAULT_CORRIDOR_MAX_EXPANDED).toBe(200_000)

    // 600x600 = 360k reachable cells, so a corner-to-corner default solve must
    // exhaust — and the error message pins which default budget was actually
    // applied. This locks the single-corridor entry point to 250000 so sharing
    // corridorContext with the network path can never silently shrink it again.
    const result = findGridCorridor(
      syntheticGrid(600),
      syntheticPosition(600, 0, 0),
      syntheticPosition(600, 599, 599),
      {},
    )
    expect(result).toEqual({
      error: 'No corridor found within the 250000-cell expansion budget.',
    })
  })

  it('does not cut diagonally across no-data corners', () => {
    const result = findGridCorridor(
      {
        mergedGrid: [
          [1, null],
          [null, 1],
        ],
        gridShape: [2, 2],
        gridBounds: { west: 0, south: 0, east: 0.02, north: 0.02 },
      },
      [0.005, 0.005],
      [0.015, 0.015],
    )

    expect(result).toEqual({ error: 'No finite-cell corridor connects the endpoints.' })
  })
})

describe('findGridCorridorNetwork', () => {
  it('returns a deterministic minimum spanning tree for three terminals', () => {
    const result = findGridCorridorNetwork(
      grid(Array.from({ length: 5 }, () => [1, 1, 1, 1, 1])),
      [
        { id: 'west', position: center(2, 0) },
        { id: 'east', position: center(2, 4) },
        { id: 'north', position: center(4, 2) },
      ],
      { preference: 'lower' },
    )

    expect(result).not.toHaveProperty('error')
    if ('error' in result) return
    expect(result.edges).toHaveLength(2)
    expect(result.edges.map((edge) => `${edge.fromId}:${edge.toId}`)).toEqual([
      'east:north',
      'west:north',
    ])
    expect(result.totalLengthM).toBeGreaterThan(0)
    expect(result.totalCost).toBeGreaterThan(0)
  })

  it('fails the network when any terminal pair cannot be solved exactly', () => {
    const result = findGridCorridorNetwork(grid(Array.from({ length: 5 }, () => [1, 1, 1, 1, 1])), [
      { id: 'a', position: center(1, 1) },
      { id: 'b', position: [center(1, 1)[0] + 0.001, center(1, 1)[1]] },
      { id: 'c', position: center(4, 4) },
    ])

    expect(result).toEqual({
      error: 'Terminal pair a/b: Corridor endpoints must resolve to different finite grid cells.',
    })
  })

  it('shares one expansion budget across all terminal pairs', () => {
    // On this uniform grid the west/east pair alone expands 21 cells, the full
    // three-terminal network 51. A 25-cell budget must cover a single solve but
    // exhaust when shared across the pairwise batch.
    const uniform = grid(Array.from({ length: 5 }, () => [1, 1, 1, 1, 1]))
    const terminals = [
      { id: 'west', position: center(2, 0) },
      { id: 'east', position: center(2, 4) },
      { id: 'north', position: center(4, 2) },
    ]

    const single = findGridCorridor(uniform, center(2, 0), center(2, 4), { maxExpanded: 25 })
    expect(single).not.toHaveProperty('error')

    const exhausted = findGridCorridorNetwork(uniform, terminals, { maxExpanded: 25 })
    expect(exhausted).toMatchObject({
      error: expect.stringContaining('25-cell network expansion budget'),
    })

    const solved = findGridCorridorNetwork(uniform, terminals, { maxExpanded: 60 })
    expect(solved).not.toHaveProperty('error')
    if ('error' in solved) return
    expect(solved.edges).toHaveLength(2)
    expect(solved.expandedCells).toBeLessThanOrEqual(60)
  })

  it('keeps the default six-terminal network bounded on a typical grid', () => {
    const startedAt = performance.now()
    const result = findGridCorridorNetwork(syntheticGrid(100), spreadTerminals(100), {})
    const elapsedMs = performance.now() - startedAt

    expect(result).not.toHaveProperty('error')
    if ('error' in result) return
    expect(result.edges).toHaveLength(5)
    expect(result.expandedCells).toBeLessThanOrEqual(DEFAULT_CORRIDOR_MAX_EXPANDED)
    // Coarse freeze smoke only (~45ms idle); the budget assert above is the
    // deterministic guard, and CI runs these suites under heavy parallel load.
    expect(elapsedMs).toBeLessThan(5000)
  })

  it('fails fast instead of freezing on a worst-case default network call', () => {
    // A spread six-terminal network on 500x500 needs >2M expansions with the old
    // per-pair budgets (~1.1s measured). The shared default budget must cut the
    // whole call off well below that instead of freezing the main thread.
    const startedAt = performance.now()
    const result = findGridCorridorNetwork(syntheticGrid(500), spreadTerminals(500), {})
    const elapsedMs = performance.now() - startedAt

    // The budget error is the deterministic tripwire: with the old per-pair
    // budgets this network SUCCEEDS after >2M expansions, so a revert fails
    // here regardless of machine speed. The wall clock (~145ms idle) is only
    // a coarse freeze smoke under loaded parallel CI runs.
    expect(result).toMatchObject({
      error: expect.stringContaining('200000-cell network expansion budget'),
    })
    expect(elapsedMs).toBeLessThan(5000)
  })
})
