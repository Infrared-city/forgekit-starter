import { type ParsedSurfaceResult, type ParseSurfaceOptions } from "./surface-record.js";
export type { ParsedSurfaceResult, ParseSurfaceOptions, SurfaceEntry, SurfaceResultValue } from "./surface-record.js";
/**
 * Parses and validates one JSON surface result.
 *
 * @param document - The UTF-8 JSON bytes of the result.
 * @param options - Surface parse options.
 * @returns The validated result with `route: "surface"`.
 * @throws {TypeError} When the document does not have the shape of a surface result.
 * @throws {Error} When `requireCellGeometry` is set and cell geometry is omitted.
 * @category Results and legend
 */
export declare function parseSurfaceResult(document: Uint8Array, options?: ParseSurfaceOptions): ParsedSurfaceResult;
