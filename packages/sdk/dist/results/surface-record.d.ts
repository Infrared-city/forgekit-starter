/**
 * One surface of a surface result, keyed as in the JSON document (`origin`, `u-axis`,
 * `v-axis`, `grid-size`, `nu`, `nv`, `area`, `mean`, `peak`, `values`, and optionally
 * `cell-area` and `cell-tris`).
 *
 * @category Results and legend
 */
export interface SurfaceEntry extends Record<string, unknown> {
    /** The value of each cell (`nu * nv` entries); `null` or `NaN` marks a cell without a value. */
    values: Float64Array | Array<number | null>;
    /** Render triangles of each cell (9 numbers per triangle); absent or `null` when omitted. */
    "cell-tris"?: Array<number[] | null> | null;
}
/**
 * A validated surface result: the surfaces by id, plus any other fields of the document.
 *
 * @category Results and legend
 */
export interface SurfaceResultValue extends Record<string, unknown> {
    /** The surfaces, by surface id. */
    surfaces: Record<string, SurfaceEntry>;
}
/**
 * Options for parsing a surface result.
 *
 * @category Results and legend
 */
export interface ParseSurfaceOptions {
    /**
     * Reject a result whose cell geometry (`cell-tris`) was omitted. The parser does not
     * synthesise geometry.
     */
    readonly requireCellGeometry?: boolean;
}
/**
 * A parsed surface result.
 *
 * @category Results and legend
 */
export interface ParsedSurfaceResult {
    /** Result discriminator: always `"surface"`. */
    readonly route: "surface";
    /** The validated surface result. */
    readonly value: SurfaceResultValue;
    /** `"complete"` when every surface has cell geometry, `"omitted"` otherwise. */
    readonly cellGeometry: "complete" | "omitted";
}
/**
 * Parses and fully validates a surface result that was read from JSON.
 *
 * @param rawValue - The parsed JSON value.
 * @param options - Surface parse options.
 * @returns The validated result with `route: "surface"`.
 * @throws {TypeError} When a field is missing, malformed or has the wrong number of cells.
 * @throws {Error} When `requireCellGeometry` is set and cell geometry is omitted.
 * @category Results and legend
 */
export declare function parseSurfaceRecord(rawValue: unknown, options?: ParseSurfaceOptions): ParsedSurfaceResult;
/**
 * Builds a surface result from a binary result whose bulk arrays were already validated, so
 * they are not checked again.
 *
 * @param rawValue - The decoded surface value.
 * @param options - Surface parse options.
 * @returns The validated result with `route: "surface"`.
 * @throws {TypeError} When a field is missing, malformed or has the wrong number of cells.
 * @throws {Error} When `requireCellGeometry` is set and cell geometry is omitted.
 * @category Results and legend
 */
export declare function parseValidatedIrBfSurfaceRecord(rawValue: unknown, options?: ParseSurfaceOptions): ParsedSurfaceResult;
