import { describe, expect, it } from 'vitest'
import { splitDateFiltersForFetch } from '../core/analysis.date-filters'

const df = (
  start: [number, number, number],
  end: [number, number, number],
  extra: Record<string, unknown> = {},
) => ({
  period: {
    start: { month: start[0], day: start[1], hour: start[2] },
    end: { month: end[0], day: end[1], hour: end[2] },
  },
  ...extra,
})

describe('splitDateFiltersForFetch (primitive — shared by interactive + batch paths)', () => {
  it('passes normal ranges through as one window', () => {
    const w = df([6, 1, 0], [8, 31, 23])
    expect(splitDateFiltersForFetch(w)).toEqual([w])
    const single = df([7, 14, 0], [7, 14, 23])
    expect(splitDateFiltersForFetch(single)).toEqual([single])
  })

  it('splits a Dec→Jan year wrap into calendar halves', () => {
    const windows = splitDateFiltersForFetch(df([12, 1, 0], [2, 28, 23]))
    expect(windows).toHaveLength(2)
    expect(windows[0].period).toEqual({
      start: { month: 12, day: 1, hour: 0 },
      end: { month: 12, day: 31, hour: 23 },
    })
    expect(windows[1].period).toEqual({
      start: { month: 1, day: 1, hour: 0 },
      end: { month: 2, day: 28, hour: 23 },
    })
  })

  it('REGRESSION (staging 422): splits an ascending-month day-straddling design week', () => {
    // Jun 29 → Jul 5 sent unsplit was rejected with
    // "start-day (29) cannot be greater than end-day (5)".
    const windows = splitDateFiltersForFetch(df([6, 29, 0], [7, 5, 23]))
    expect(windows).toHaveLength(2)
    expect(windows[0].period).toEqual({
      start: { month: 6, day: 29, hour: 0 },
      end: { month: 6, day: 30, hour: 23 },
    })
    expect(windows[1].period).toEqual({
      start: { month: 7, day: 1, hour: 0 },
      end: { month: 7, day: 5, hour: 23 },
    })
    for (const w of windows) expect(w.period.start.day).toBeLessThanOrEqual(w.period.end.day)
  })

  it('uses the correct 28-day February boundary', () => {
    const windows = splitDateFiltersForFetch(df([2, 26, 0], [3, 3, 23]))
    expect(windows[0].period.end).toEqual({ month: 2, day: 28, hour: 23 })
    expect(windows[1].period.start).toEqual({ month: 3, day: 1, hour: 0 })
  })

  it('emits full middle months for longer straddles (total function)', () => {
    const windows = splitDateFiltersForFetch(df([5, 20, 0], [7, 5, 23]))
    expect(windows).toHaveLength(3)
    expect(windows[1].period).toEqual({
      start: { month: 6, day: 1, hour: 0 },
      end: { month: 6, day: 30, hour: 23 },
    })
  })

  it('preserves extra fields (filter.hour) on every half', () => {
    const windows = splitDateFiltersForFetch(
      df([6, 29, 9], [7, 5, 18], { filter: { hour: '9-18' } }),
    )
    for (const w of windows) expect((w as { filter?: unknown }).filter).toEqual({ hour: '9-18' })
  })
})
