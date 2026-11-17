/**
 * Thrown when a weather read fails.
 *
 * `statusCode` is an HTTP-style status and `operation` names the call that failed. A
 * malformed catalog, a body that is not JSON and a refused answer are all `502`: the
 * weather host was reached but its answer was unusable.
 *
 * @category Errors
 */
export declare class WeatherServiceError extends Error {
    readonly statusCode: number;
    readonly operation: string;
    readonly name = "WeatherServiceError";
    constructor(message: string, statusCode: number, operation: string);
}
/**
 * One station in the weather catalog: its `uuid` and `fileName`, plus any other fields
 * the catalog row carries, such as its position.
 *
 * @category Weather
 */
export interface WeatherStationRow extends Readonly<Record<string, unknown>> {
    readonly uuid: string;
    readonly fileName: string;
}
export declare function failWeather(message: string, statusCode: number, operation: string): never;
export declare function decodeUtf8(bytes: Uint8Array, subject: string, operation: string): string;
export declare function parseJsonObject(text: string, subject: string, operation: string): Record<string, unknown>;
export declare function gunzipIfNeeded(bytes: Uint8Array, uuid: string, operation: string): Uint8Array;
