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
/** Longest day-of-month per month. February takes 29: a window carries no
 * year, so refusing 29 February here would refuse valid leap-year windows. */
const MAX_DAY_PER_MONTH = [
    31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
];
function integer(value, name) {
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(number))
        throw new TypeError(`${name} must be a whole number`);
    return number;
}
function endpoint(point, label) {
    const month = integer(point?.month, `${label} month`);
    const day = integer(point?.day, `${label} day`);
    const hour = integer(point?.hour, `${label} hour`);
    if (month < 1 || month > 12)
        throw new TypeError(`${label} month ${month} is not 1-12`);
    if (hour < 0 || hour > 23)
        throw new TypeError(`${label} hour ${hour} is not 0-23`);
    const longest = MAX_DAY_PER_MONTH[month - 1];
    if (day < 1 || day > longest) {
        throw new TypeError(`${label} day ${day} is not 1-${longest} for month ${month}`);
    }
    return [month, day, hour];
}
/** Validate one window and return it in the kernel's spelling. */
export function weatherWindow(filters) {
    const period = filters?.period;
    if (period === undefined || period === null)
        throw new TypeError("a window needs a period");
    const [startMonth, startDay, startHour] = endpoint(period.start, "start");
    const [endMonth, endDay, endHour] = endpoint(period.end, "end");
    if (endMonth < startMonth) {
        throw new TypeError(`time-period wraps across the year (month ${startMonth} to ${endMonth}); ` +
            "no model accepts a wrapping window — split it into two forward requests instead");
    }
    return {
        start_month: startMonth, start_day: startDay, start_hour: startHour,
        end_month: endMonth, end_day: endDay, end_hour: endHour,
    };
}
/** The validated window as the kernel takes it: snake_case, one flat object. */
export function weatherWindowJson(filters) {
    return JSON.stringify(weatherWindow(filters));
}
