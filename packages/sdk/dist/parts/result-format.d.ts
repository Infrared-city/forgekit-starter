import type { BinaryCapability } from "../internal/binary-submission.js";
/**
 * The format of a daylight-factor result.
 *
 * - `"irbf"`: a `DaylightFactorResult` (typed-array views over one binary frame, with
 *   `toJson()` on demand). Parts ask the server for binary results when it offers them;
 *   JSON part results from an older server are converted to the same frame.
 * - `"json"`: the plain JSON value.
 *
 * @category Results and legend
 */
export type DaylightResultFormat = "irbf" | "json";
/**
 * The daylight-factor result format used when none is given: `"irbf"`.
 *
 * @category Results and legend
 */
export declare const DEFAULT_DAYLIGHT_RESULT_FORMAT: DaylightResultFormat;
/**
 * The name of the binary result family of a daylight-factor result: `"daylight-points"`.
 *
 * @category Results and legend
 */
export declare const DAYLIGHT_POINTS_FAMILY = "daylight-points";
/**
 * Resolves an optional result format to a concrete one.
 *
 * @param value - The caller's format, if any.
 * @returns `value`, else `DEFAULT_DAYLIGHT_RESULT_FORMAT`.
 * @category Results and legend
 */
export declare function resolveResultFormat(value: DaylightResultFormat | undefined): DaylightResultFormat;
/**
 * Tells whether the server offers the binary daylight-factor result for an analysis type.
 *
 * @param capability - The server's capability document.
 * @param analysisType - The analysis type to look up.
 * @returns True when the binary result is listed for `analysisType`.
 * @category Results and legend
 */
export declare function binaryResultSupported(capability: BinaryCapability, analysisType: string): boolean;
