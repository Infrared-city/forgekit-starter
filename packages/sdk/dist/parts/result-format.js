/**
 * The daylight-factor result format (D234). ONE place holds the default; the
 * owner sets it for a release.
 *
 * - `"irbf"`: `runAndWait` / `mergeParts` return a `DaylightFactorResult`
 *   (TypedArray views over one IRBF frame; `toJson()` on demand). The parts
 *   ask for binary results only when the live capability lists
 *   `daylight-points` for `daylight-factor`; JSON part results (an older
 *   server) are turned into the same frame by the kernel merge.
 * - `"json"`: the JSON value, exactly as before D234.
 */
/** THE default. Change it here only. */
export const DEFAULT_DAYLIGHT_RESULT_FORMAT = "irbf";
/** The IRBF result family name of the daylight-factor result. */
export const DAYLIGHT_POINTS_FAMILY = "daylight-points";
export function resolveResultFormat(value) {
    return value ?? DEFAULT_DAYLIGHT_RESULT_FORMAT;
}
/** True when the live capability lists the binary daylight-factor result for `analysisType`. */
export function binaryResultSupported(capability, analysisType) {
    return capability.models[analysisType]?.resultFamilies.includes(DAYLIGHT_POINTS_FAMILY) === true;
}
