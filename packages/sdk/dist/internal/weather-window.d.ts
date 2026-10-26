/**
 * One analysis window, and the only place this package decides whether a
 * window is well formed.
 *
 * **A window is a date SPAN with a daily hour range** — the hours the model
 * counts (`ir_geodata::weather::filter_hours`, `lambda-models`
 * `params::in_window`; `docs/DEVIATIONS.md` D238). "1 March 08:00 to 30
 * September 18:00" selects hours 08-18 of every day from 1 March to 30
 * September. The hours are EPW local standard time: no DST hour is added or
 * removed.
 *
 * MALFORMED values are refused: a month outside 1-12, an hour outside 0-23,
 * a day outside its own month's length.
 *
 * A window may cross the year end (for example 1 December to 28 February);
 * it selects December, January and February of the typical year, in
 * calendar order of the year (January first, the order of the EPW file and
 * of the worker's sun vectors; D45 section 1, superseded 2026-10-05).
 *
 * A single-hour window (`start === end`) IS valid: the worker turns the
 * inclusive end hour into an exclusive one, so one hour selects one row.
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
