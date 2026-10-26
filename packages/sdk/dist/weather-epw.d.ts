import type { TimeFilters, WeatherDataPoint } from "./weather.js";
/**
 * The analyses that read weather data: `thermal-comfort-index`,
 * `thermal-comfort-statistics`, `solar-radiation` and `energy-balance`.
 *
 * `energy-balance` also reads the request field `solar-model`: omitted or
 * `"legacy-flat"` it uses dry-bulb temperature and global horizontal
 * radiation, and `"irradiance"` adds the direct and diffuse series and needs
 * a full year. Wind, pedestrian wind comfort, sky view factors, daylight, sun
 * hours and daylight factor take no weather data.
 *
 * @category Weather
 */
export declare const WEATHER_BEARING_ANALYSES: ReadonlySet<string>;
/**
 * Thrown by `parseEpw` for an EPW file that cannot be used; the message gives
 * the reason, and the original error is kept as `cause`.
 *
 * @category Errors
 */
export declare class EpwParseError extends Error {
    /**
     * @param message - The reason the file was refused.
     * @param options - `cause` is the underlying error.
     */
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
/**
 * Thrown when a weather document cannot supply what the requested analysis
 * needs for the requested time window; the message gives the reason, and the
 * original error is kept as `cause`.
 *
 * @category Errors
 */
export declare class WeatherModelInputsError extends Error {
    /**
     * @param message - The reason the document cannot serve the request.
     * @param options - `cause` is the underlying error.
     */
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
/**
 * What `WeatherDocument.modelInputs` is asked for.
 *
 * @category Weather
 */
export interface WeatherModelRequest {
    /** The analysis the weather is for. */
    readonly analysisType: string;
    /** The time window to select from the file. */
    readonly timePeriod: TimeFilters;
    /** The analysis subtype, for analyses that take one (such as `thermal-comfort-statistics`). */
    readonly subtype?: string;
    /**
     * `"energy-balance"` only: `"irradiance"` or `"legacy-flat"` (the default).
     * See `WEATHER_BEARING_ANALYSES`.
     */
    readonly solarModel?: string;
}
/**
 * Limits for `parseEpw`. You can lower either limit; asking for a higher one
 * than the default is refused, not ignored.
 *
 * @category Weather
 */
export interface ParseEpwOptions {
    /** The largest file accepted, in bytes. */
    readonly maxBytes?: number;
    /** The most data rows accepted. */
    readonly maxRows?: number;
}
/**
 * One validated EPW file, as returned by `parseEpw`.
 *
 * Build a request from it and keep it for any retry: its `identity` proves
 * that a resumed run uses the same weather as the run it resumes. The
 * identity is computed on every read, so editing `document` after submitting
 * makes a retry be refused instead of passing as unchanged weather.
 *
 * @category Weather
 */
export declare class WeatherDocument {
    readonly document: Record<string, unknown>;
    /**
     * @param document - The validated document, as a JSON object.
     * @throws {TypeError} when `document` is not an object.
     */
    constructor(document: Record<string, unknown>);
    /**
     * The versioned weather identity, `"sha256:<hex>"`.
     *
     * It covers the validated values, their order, the location, the calendar
     * columns and the hour basis, but never the file name, a station id or the
     * raw text, so two differently formatted files with the same readings
     * share one identity.
     *
     * @throws {EpwParseError} when the document has no computable identity.
     */
    get identity(): string;
    /** The EPW `LOCATION` header, as the document records it. Empty when the document has none. */
    get location(): Record<string, unknown>;
    /** Row count, records per hour, and whether the data is a leap year or a full year. */
    get period(): Record<string, unknown>;
    /** Data rows in the file, before any window is applied. */
    get rows(): number;
    /**
     * The snake_case arrays one analysis reads, for one time window.
     *
     * The window is applied first, then the required fields are checked on the
     * selected rows and then the period rule. A gap outside the window is
     * harmless, a gap inside it is refused, and an analysis that needs a full
     * year refuses a shorter one. Every refusal happens before a request is
     * submitted, so nothing is billed.
     *
     * `solarModel` applies to `analysisType: "energy-balance"` only; on any
     * other analysis it is refused. `"irradiance"` selects the irradiance input
     * set, which needs a full year; omitted, or `"legacy-flat"`, selects the
     * two climate arrays that model reads.
     *
     * @param request - The analysis, time window and options.
     * @returns The arrays, by field name.
     * @throws {WeatherModelInputsError} when the document cannot serve the request.
     */
    modelInputs(request: WeatherModelRequest): Record<string, number[]>;
    /**
     * The file's hours inside `filters`, one record per hour: the same shape
     * `WeatherService.filterWeatherData` returns for a public station, from a
     * local file and with no network call.
     *
     * @param filters - The time window.
     * @returns One record per selected hour.
     * @throws {WeatherModelInputsError} when the file cannot be filtered to that window.
     */
    filterHours(filters: TimeFilters): WeatherDataPoint[];
}
/**
 * Validates the text of an `.epw` weather file and returns its document.
 *
 * You read the file yourself and pass its text (`await file.text()` in a
 * browser, `readFileSync(path, "utf8")` in Node), because this package also
 * runs where there is no file system.
 *
 * @param text - The whole file.
 * @param options - Optional lower limits on file size and row count.
 * @returns The validated `WeatherDocument`.
 * @throws {TypeError} when `text` is not a string.
 * @throws {EpwParseError} when the file is not usable: no `LOCATION` header,
 * a location number out of range, sub-hourly data, a row shorter than 22
 * columns, an hour outside 1-24, a calendar cell that is not a number, or a
 * file over the size or row limit. The message names the row or the field.
 *
 * @category Weather
 */
export declare function parseEpw(text: string, options?: ParseEpwOptions): WeatherDocument;
