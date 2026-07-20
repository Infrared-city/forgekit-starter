// ABOUTME: Builds deterministic minimum spanning corridor networks between grid terminals.
// ABOUTME: Shares one expansion budget across all pairwise solves to bound whole-call work.

import { DisjointSet } from './corridor-structures'
import type { NumericResultGrid } from './grid-alignment'
import {
  corridorContext,
  DEFAULT_CORRIDOR_MAX_EXPANDED,
  type GridCorridor,
  type GridCorridorOptions,
  type GridCorridorPreference,
  solveCorridor,
} from './grid-corridors'

export interface GridCorridorTerminal {
  id: string
  position: [number, number]
}

export interface GridCorridorNetworkEdge {
  fromId: string
  toId: string
  corridor: GridCorridor
}

export interface GridCorridorNetwork {
  preference: GridCorridorPreference
  terminalCount: number
  edges: GridCorridorNetworkEdge[]
  totalCost: number
  totalLengthM: number
  expandedCells: number
}

export type GridCorridorNetworkResult = GridCorridorNetwork | { error: string }

/**
 * The maxExpanded budget bounds the WHOLE network call: every pairwise solve
 * draws from one shared countdown, so a network can never expand more cells in
 * total than a single corridor solve with the same budget.
 */
export function findGridCorridorNetwork(
  grid: NumericResultGrid,
  terminals: GridCorridorTerminal[],
  options: GridCorridorOptions = {},
): GridCorridorNetworkResult {
  if (terminals.length < 2 || terminals.length > 6) {
    return { error: 'A corridor network requires from 2 to 6 terminals.' }
  }
  const ids = terminals.map((terminal) => terminal.id)
  if (ids.some((id) => id.trim().length === 0) || new Set(ids).size !== ids.length) {
    return { error: 'Corridor terminal ids must be non-empty and unique.' }
  }
  const ctx = corridorContext(grid, options, DEFAULT_CORRIDOR_MAX_EXPANDED)
  if ('error' in ctx) return ctx
  const candidates: GridCorridorNetworkEdge[] = []
  let remainingBudget = ctx.maxExpanded
  for (let fromIndex = 0; fromIndex < terminals.length; fromIndex++) {
    for (let toIndex = fromIndex + 1; toIndex < terminals.length; toIndex++) {
      const from = terminals[fromIndex]
      const to = terminals[toIndex]
      const corridor = solveCorridor(ctx, from.position, to.position, remainingBudget)
      if ('error' in corridor) {
        return corridor.exhausted
          ? {
              error: `Terminal pair ${from.id}/${to.id}: no corridor found within the shared ${ctx.maxExpanded}-cell network expansion budget.`,
            }
          : { error: `Terminal pair ${from.id}/${to.id}: ${corridor.error}` }
      }
      remainingBudget -= corridor.expandedCells
      candidates.push({ fromId: from.id, toId: to.id, corridor })
    }
  }
  candidates.sort(
    (a, b) =>
      a.corridor.totalCost - b.corridor.totalCost ||
      a.fromId.localeCompare(b.fromId) ||
      a.toId.localeCompare(b.toId),
  )
  const sets = new DisjointSet(ids)
  const edges: GridCorridorNetworkEdge[] = []
  for (const candidate of candidates) {
    if (!sets.union(candidate.fromId, candidate.toId)) continue
    edges.push(candidate)
    if (edges.length === terminals.length - 1) break
  }
  if (edges.length !== terminals.length - 1) {
    return { error: 'The finite result cells do not connect every requested terminal.' }
  }
  return {
    preference: ctx.preference,
    terminalCount: terminals.length,
    edges,
    totalCost: edges.reduce((sum, edge) => sum + edge.corridor.totalCost, 0),
    totalLengthM: edges.reduce((sum, edge) => sum + edge.corridor.lengthM, 0),
    expandedCells: candidates.reduce((sum, edge) => sum + edge.corridor.expandedCells, 0),
  }
}
