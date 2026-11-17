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
import { requireCore } from "./core.js";
/**
 * Check one window with the kernel and return it in the kernel's spelling.
 * Give `analysisType` for a window that belongs to an analysis request.
 */
export function weatherWindow(filters, analysisType) {
    const start = filters?.period?.start;
    const end = filters?.period?.end;
    const window = {
        start_month: start?.month, start_day: start?.day, start_hour: start?.hour,
        end_month: end?.month, end_day: end?.day, end_hour: end?.hour,
    };
    try {
        return JSON.parse(requireCore().validateTimeWindow(JSON.stringify(window), analysisType));
    }
    catch (error) {
        if (error instanceof TypeError)
            throw error;
        throw new TypeError(`time window: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/** The checked window as the kernel takes it: snake_case, one flat object. */
export function weatherWindowJson(filters, analysisType) {
    return JSON.stringify(weatherWindow(filters, analysisType));
}
