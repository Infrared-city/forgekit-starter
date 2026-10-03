import { DaylightFactorResult } from "../parts/daylight-result.js";
import { type DecompressResultArchiveOptions } from "./archive.js";
import { type ParsedSurfaceResult, type ParseSurfaceOptions } from "./surface-record.js";
export type GridExpectedKind = "numeric" | "categorical";
export type ParsedResult = ParsedSurfaceResult | {
    readonly route: "json";
    readonly value: unknown;
} | {
    readonly route: "daylight-points";
    readonly value: DaylightFactorResult;
};
export interface ParseResultOptions {
    readonly archive?: DecompressResultArchiveOptions;
    readonly expectedGridKind?: GridExpectedKind;
    readonly surface?: ParseSurfaceOptions;
}
/** The strict IRBF result limits every result decode in this package applies. */
export declare const RESULT_DECODE_LIMITS: {
    readonly maxTotalBytes: 268435456;
    readonly maxMetadataBytes: 4194304;
    readonly maxCells: 16777216;
    readonly maxTriangleValues: 67108864;
};
/** Route one already decompressed JSON or strict IRBF document. */
export declare function parseResultDocument(document: Uint8Array, options?: ParseResultOptions): ParsedResult;
/** Decompress one supported JSON or strict IRBF result. */
export declare function parseResultArchive(content: Uint8Array, options?: ParseResultOptions): ParsedResult;
