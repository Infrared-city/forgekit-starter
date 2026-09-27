/**
 * One analysis window, and the only place this package decides whether a
 * window is well formed.
 *
 * **A window is a PRODUCT MASK, not a span** — month AND day AND hour, each
 * matched on its own (`ir_geodata::weather::filter_hours`, a verbatim port
 * of the deleted service's `_matches_time_range`). "1 March 08:00 to 30
 * September 18:00" selects hours 08-18 of days 1-30 of months 3-9, not a
 * contiguous stretch of the year.
 *
 * Two kinds of value are refused. MALFORMED ones: a month outside 1-12, an
 * hour outside 0-23, a day outside its own month's length. And a window
 * that WRAPS THE YEAR (`end_month < start_month`), because no model in the
 * fleet can run one: the scheduler answers 400 ("time-period wraps across
 * the year") and the Rust worker answers 422 ("only forward same-year
 * windows are supported"). Refusing it here is what keeps the caller from
 * paying for a run every tile then rejects.
 *
 * A single-hour window (`start === end`) IS valid: the worker turns the
 * inclusive end hour into an exclusive one, so one hour selects one row.
 *
 * Up to SDK 0.9 this package validated NOTHING here. Both hosts now hold
 * the same rule. See `docs/DEVIATIONS.md` D45 section 1.
 */
import type { TimeFilters } from "../weather.js";
/** The six integers of one window, in the kernel's own spelling. */
export interface WeatherWindow {
    readonly start_month: number;
    readonly start_day: number;
    readonly start_hour: number;
    readonly end_month: number;
    readonly end_day: number;
    readonly end_hour: number;
}
/** Validate one window and return it in the kernel's spelling. */
export declare function weatherWindow(filters: TimeFilters): WeatherWindow;
/** The validated window as the kernel takes it: snake_case, one flat object. */
export declare function weatherWindowJson(filters: TimeFilters): string;
