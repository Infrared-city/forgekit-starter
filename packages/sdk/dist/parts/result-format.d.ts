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
import type { BinaryCapability } from "../internal/binary-submission.js";
export type DaylightResultFormat = "irbf" | "json";
/** THE default. Change it here only. */
export declare const DEFAULT_DAYLIGHT_RESULT_FORMAT: DaylightResultFormat;
/** The IRBF result family name of the daylight-factor result. */
export declare const DAYLIGHT_POINTS_FAMILY = "daylight-points";
export declare function resolveResultFormat(value: DaylightResultFormat | undefined): DaylightResultFormat;
/** True when the live capability lists the binary daylight-factor result for `analysisType`. */
export declare function binaryResultSupported(capability: BinaryCapability, analysisType: string): boolean;
