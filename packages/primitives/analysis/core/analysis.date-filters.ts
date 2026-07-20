/**
 * Date-filter window splitting for `filterWeatherData` calls.
 *
 * The weather-filter endpoint validates `start-day <= end-day` as raw
 * numbers, independent of months (staging 422, 2026-07-06: "start-day (29)
 * cannot be greater than end-day (5)"). Two window shapes are therefore
 * inexpressible as ONE request and must be fetched as calendar halves whose
 * rows the caller concatenates:
 *
 *  - year wrap (winter Dec…Feb): `start.month > end.month`;
 *  - mid-year month straddle with a day-ranged window (design-event weeks,
 *    e.g. Jun 29 → Jul 5): months ascend but `start.day > end.day`.
 *
 * Lives in the PRIMITIVE so every call site shares one implementation — the
 * interactive Run path (`react/analysis.area-run-api.ts`) and the platform
 * app's batch path both import it; primitives cannot import app code, and a
 * second hand-rolled copy is how the interactive path shipped without any
 * splitting at all.
 */

/** Non-leap-year month lengths (EPW files are non-leap). */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

interface PeriodBoundary {
  month: number
  day: number
  hour: number
}

/** Structural shape of the SDK `TimeFilters` — kept minimal so both the
 *  app's `AnalysisDateFilters` alias and the react layer's interface
 *  satisfy it without a cross-layer import. */
export interface SplittableDateFilters {
  period: { start: PeriodBoundary; end: PeriodBoundary }
}

/** Split a window into endpoint-expressible calendar ranges (see module
 *  docs). Non-problematic filters pass through as a single entry. Generic
 *  so callers keep their concrete filter type (extra fields like
 *  `filter.hour` are spread onto every half). */
export function splitDateFiltersForFetch<T extends SplittableDateFilters>(df: T): T[] {
  const { start, end } = df.period
  if (start.month > end.month) {
    return [
      { ...df, period: { start, end: { month: 12, day: 31, hour: end.hour } } },
      { ...df, period: { start: { month: 1, day: 1, hour: start.hour }, end } },
    ]
  }
  if (start.month < end.month && start.day > end.day) {
    const startMonthEnd = { month: start.month, day: MONTH_DAYS[start.month - 1], hour: end.hour }
    const endMonthStart = { month: end.month, day: 1, hour: start.hour }
    return [
      { ...df, period: { start, end: startMonthEnd } },
      // Full middle months (not producible by today's ≤7-day event windows,
      // but the function stays total for any future window length).
      ...(end.month - start.month > 1
        ? [
            {
              ...df,
              period: {
                start: { month: start.month + 1, day: 1, hour: start.hour },
                end: { month: end.month - 1, day: MONTH_DAYS[end.month - 2], hour: end.hour },
              },
            },
          ]
        : []),
      { ...df, period: { start: endMonthStart, end } },
    ]
  }
  return [df]
}
