// Maintainer note (not published): The daylight-factor result format (D234). ONE place
// holds the default; the owner sets it for a release.
//
// - `"irbf"`: `runAndWait` / `mergeParts` return a `DaylightFactorResult`
//   (TypedArray views over one IRBF frame; `toJson()` on demand). The parts
//   ask for binary results only when the live capability lists
//   `daylight-points` for `daylight-factor`; JSON part results (an older
//   server) are turned into the same frame by the kernel merge.
// - `"json"`: the JSON value, exactly as before D234.
/**
 * The daylight-factor result format used when none is given: `"irbf"`.
 *
 * @category Results and legend
 */
// Maintainer note (not published): THE default. Change it here only.
export const DEFAULT_DAYLIGHT_RESULT_FORMAT = "irbf";
/**
 * The name of the binary result family of a daylight-factor result: `"daylight-points"`.
 *
 * @category Results and legend
 */
export const DAYLIGHT_POINTS_FAMILY = "daylight-points";
/**
 * Resolves an optional result format to a concrete one.
 *
 * @param value - The caller's format, if any.
 * @returns `value`, else `DEFAULT_DAYLIGHT_RESULT_FORMAT`.
 * @category Results and legend
 */
export function resolveResultFormat(value) {
    return value ?? DEFAULT_DAYLIGHT_RESULT_FORMAT;
}
/**
 * Tells whether the server offers the binary daylight-factor result for an analysis type.
 *
 * @param capability - The server's capability document.
 * @param analysisType - The analysis type to look up.
 * @returns True when the binary result is listed for `analysisType`.
 * @category Results and legend
 */
export function binaryResultSupported(capability, analysisType) {
    return capability.models[analysisType]?.resultFamilies.includes(DAYLIGHT_POINTS_FAMILY) === true;
}
