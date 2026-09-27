export interface SurfaceEntry extends Record<string, unknown> {
    values: Float64Array | Array<number | null>;
    "cell-tris"?: Array<number[] | null> | null;
}
export interface SurfaceResultValue extends Record<string, unknown> {
    surfaces: Record<string, SurfaceEntry>;
}
export interface ParseSurfaceOptions {
    /** Reject an omitted layout. This parser does not invent geometry inputs. */
    readonly requireCellGeometry?: boolean;
}
export interface ParsedSurfaceResult {
    readonly route: "surface";
    readonly value: SurfaceResultValue;
    readonly cellGeometry: "complete" | "omitted";
}
/** Parse and fully validate an ordinary JSON surface record. */
export declare function parseSurfaceRecord(rawValue: unknown, options?: ParseSurfaceOptions): ParsedSurfaceResult;
/** Project bulk arrays that the strict IRBF decoder already validated. */
export declare function parseValidatedIrBfSurfaceRecord(rawValue: unknown, options?: ParseSurfaceOptions): ParsedSurfaceResult;
