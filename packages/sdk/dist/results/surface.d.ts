import { type ParsedSurfaceResult, type ParseSurfaceOptions } from "./surface-record.js";
export type { ParsedSurfaceResult, ParseSurfaceOptions, SurfaceEntry, SurfaceResultValue } from "./surface-record.js";
/** Parse and validate one ordinary JSON surface response. */
export declare function parseSurfaceResult(document: Uint8Array, options?: ParseSurfaceOptions): ParsedSurfaceResult;
