// One line of the statistics box (mean, and min to max or the strongest
// change), and the number format the explorer uses everywhere.

import type React from 'react'
import type { DemoAnalysis } from '../demo/analyses'
import type { Stats } from './results'

export function fmt(value: number, unit: string, diff: boolean) {
  const v = Math.abs(value) < 0.05 ? 0 : value
  const s = Math.abs(v) >= 20 ? v.toFixed(0) : v.toFixed(1)
  return `${diff && v > 0 ? '+' : ''}${s} ${unit}`
}

/** One row of the statistics table: place, mean, and the range (or the strongest change). */
export function StatsLine({
  label,
  s,
  a,
  diff,
}: {
  label: string
  s: Stats
  a: DemoAnalysis
  diff: boolean
}) {
  if (Number.isNaN(s.mean)) return null
  const extreme = diff ? (Math.abs(s.min) > Math.abs(s.max) ? s.min : s.max) : null
  const range = diff
    ? extreme !== null && Math.abs(extreme) > 0.05
      ? `strongest ${fmt(extreme, '', true).trim()}`
      : 'no change'
    : `${fmt(s.min, '', false).trim()} – ${fmt(s.max, '', false).trim()}`
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="stat-mean">{fmt(s.mean, a.unit, diff).trim().split(' ')[0]}</td>
      <td className="stat-range">{range}</td>
    </tr>
  )
}

/** The table around the rows, with the unit in its caption. */
export function StatsTable({
  unit,
  diff,
  children,
}: {
  unit: string
  diff: boolean
  children: React.ReactNode
}) {
  return (
    <table className="stats" data-testid="stats">
      <caption>{diff ? `Change in ${unit}` : unit}</caption>
      <thead>
        <tr>
          <th scope="col">Place</th>
          <th scope="col">Mean</th>
          <th scope="col">{diff ? '' : 'Range'}</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}
