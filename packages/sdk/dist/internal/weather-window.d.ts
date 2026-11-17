/**
 * One analysis window. The KERNEL decides whether a window is well formed
 * (`validateTimeWindow`, `ir_geodata::weather::window`); this file only
 * spells the window the way the kernel takes it.
 *
 * **A window is a date SPAN with a daily hour range** — the hours the model
 * counts (`ir_geodata::weather::filter_hours`, `lambda-models`
 * `params::in_window`; `docs/DEVIATIONS.md` D238). "1 March 08:00 to 30
 * September 18:00" selects hours 08-18 of every day from 1 March to 30
 * September. The hours are EPW local standard time: no DST hour is added or
 * removed.
 *
 * A window may cross the year end (for example 1 December to 28 February);
 * it selects December, January and February of the typical year, in
 * calendar order of the year (January first, the order of the EPW file; D45
 * section 1, superseded 2026-10-05). A single-hour window is valid. An hour
 * range across midnight is valid for a weather selection and is refused for
 * the five analyses the server checks.
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
/**
 * Check one window with the kernel and return it in the kernel's spelling.
 * Give `analysisType` for a window that belongs to an analysis request.
 */
export declare function weatherWindow(filters: TimeFilters, analysisType?: string): WeatherWindow;
/** The checked window as the kernel takes it: snake_case, one flat object. */
export declare function weatherWindowJson(filters: TimeFilters, analysisType?: string): string;
