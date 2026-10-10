import { DaylightFactorResult } from "../parts/daylight-result.js";
import { type DecompressResultArchiveOptions } from "./archive.js";
import { type ParsedSurfaceResult, type ParseSurfaceOptions } from "./surface-record.js";
/**
 * The kind of grid result a caller expects: `"numeric"` or `"categorical"`.
 *
 * @category Results and legend
 */
export type GridExpectedKind = "numeric" | "categorical";
/**
 * A parsed result document, tagged by `route`: `"surface"` for a surface result,
 * `"daylight-points"` for a binary daylight-factor result, and `"json"` for any other
 * result (the decoded JSON value).
 *
 * @category Results and legend
 */
export type ParsedResult = ParsedSurfaceResult | {
    readonly route: "json";
    readonly value: unknown;
} | {
    readonly route: "daylight-points";
    readonly value: DaylightFactorResult;
};
/**
 * Options for parsing a result.
 *
 * @category Results and legend
 */
export interface ParseResultOptions {
    /** Size limits for expanding the archive. */
    readonly archive?: DecompressResultArchiveOptions;
    /** Require a grid result of this kind; a grid of the other kind is rejected. */
    readonly expectedGridKind?: GridExpectedKind;
    /** Options for parsing a surface result. */
    readonly surface?: ParseSurfaceOptions;
}
/**
 * The size limits applied to every binary result: total bytes, metadata bytes, cells and
 * triangle values.
 *
 * @category Results and legend
 */
export declare const RESULT_DECODE_LIMITS: {
    readonly maxTotalBytes: 268435456;
    readonly maxMetadataBytes: 4194304;
    readonly maxCells: 16777216;
    readonly maxTriangleValues: 67108864;
};
/**
 * Parses one already expanded result document (JSON or binary) and routes it by kind.
 *
 * @param document - The expanded result bytes.
 * @param options - Expected grid kind and surface options.
 * @returns The parsed result, tagged by `route`.
 * @throws {TypeError} When the result is a grid of a kind other than `expectedGridKind`.
 * @throws {Error} When the document is not a valid result.
 * @category Results and legend
 */
export declare function parseResultDocument(document: Uint8Array, options?: ParseResultOptions): ParsedResult;
/**
 * Expands a downloaded result archive and parses the document inside it.
 *
 * @param content - The downloaded archive bytes.
 * @param options - Archive limits, expected grid kind and surface options.
 * @returns The parsed result, tagged by `route`.
 * @throws {Error} When the archive cannot be expanded or the result is not valid.
 * @category Results and legend
 */
export declare function parseResultArchive(content: Uint8Array, options?: ParseResultOptions): ParsedResult;
