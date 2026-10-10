/**
 * The analysis type a geodata read assumes when you name none: `"solar-radiation"`.
 *
 * It gives the widest read margin, which is valid for every analysis; a wind
 * analysis reads a little more data than it needs.
 *
 * @category Geodata
 */
export declare const WIDEST_READ_ANALYSIS_TYPE = "solar-radiation";
/**
 * Resolve the analysis type a geodata read is made for.
 *
 * `undefined`, `null` and the empty string mean "none named" and become
 * {@link WIDEST_READ_ANALYSIS_TYPE}; any other value is trimmed and returned.
 *
 * @param analysisType - The analysis type name, if any.
 * @returns The analysis type to read for.
 * @category Geodata
 */
export declare function resolveReadAnalysisType(analysisType?: string | null): string;
/**
 * Half extent, in metres, of the area read around a tile for buildings.
 *
 * It is 256 m for the wind analyses (`wind-speed`, `pedestrian-wind-comfort`)
 * and 384 m for every other analysis, which must see further because shadows
 * are cast into a tile from more distant buildings and trees.
 *
 * @param analysisType - The analysis type; defaults to
 *   {@link WIDEST_READ_ANALYSIS_TYPE} when omitted.
 * @returns The read margin in metres.
 * @category Geodata
 */
export declare function readMarginM(analysisType?: string | null): number;
/**
 * Half extent, in metres, of the area read around a tile for ground materials
 * and trees.
 *
 * It is `ceil(sqrt(2) * readMarginM(analysisType))`, the tile's half diagonal,
 * so the circular crop applied when cleaning ground materials is fully covered
 * by the square box that is fetched: 363 m for the wind analyses and 544 m for
 * every other analysis.
 *
 * @param analysisType - The analysis type; defaults to
 *   {@link WIDEST_READ_ANALYSIS_TYPE} when omitted.
 * @returns The read distance in metres.
 * @category Geodata
 */
export declare function groundReadDistanceM(analysisType?: string | null): number;
/**
 * A layer that records the read margin it was acquired with.
 *
 * @category Geodata
 */
export interface ReadMarginRecord {
    /** The read margin, in metres, the layer was acquired with. */
    readonly readMarginM: number;
    /** The analysis type the layer was acquired for, when recorded. */
    readonly analysisType?: string;
}
/**
 * Thrown when a run needs a wider read margin than the layer it was given was
 * acquired with.
 *
 * It carries both margins and both analysis types, so you can see what to
 * re-acquire with. Re-acquire the layer with the analysis type the run needs, or
 * with no analysis type at all, which reads the widest margin and is valid for
 * every analysis.
 *
 * @category Errors
 */
export declare class ReadMarginError extends Error {
    /** The layer that was acquired too narrowly, for example `"buildings"`. */
    readonly layer: string;
    /** The read margin, in metres, the layer was acquired with. */
    readonly acquiredMarginM: number;
    /** The analysis type the layer was acquired for, when recorded. */
    readonly acquiredAnalysisType: string | undefined;
    /** The read margin, in metres, the run needs. */
    readonly requiredMarginM: number;
    /** The analysis type that sets the required margin. */
    readonly requiredAnalysisType: string | undefined;
    constructor(fields: {
        readonly layer: string;
        readonly acquiredMarginM: number;
        readonly acquiredAnalysisType?: string;
        readonly requiredMarginM: number;
        readonly requiredAnalysisType?: string;
    });
}
/**
 * The read margin, in metres, that a layer needs for an analysis type.
 *
 * Buildings need {@link readMarginM}; ground materials and trees need
 * {@link groundReadDistanceM}.
 *
 * @param layer - `"buildings"`, `"ground materials"` or `"trees"`.
 * @param analysisType - The analysis type; defaults to
 *   {@link WIDEST_READ_ANALYSIS_TYPE} when omitted.
 * @returns The required margin in metres.
 * @throws {TypeError} when `layer` is not one of the known layers.
 * @category Geodata
 */
export declare function requiredMarginM(layer: string, analysisType?: string | null): number;
/**
 * Refuse a run whose analysis needs more read margin than the acquired layer
 * carries.
 *
 * @param acquired - The acquired layer; one that records no margin is accepted.
 * @param layer - `"buildings"`, `"ground materials"` or `"trees"`.
 * @param analysisTypes - Every analysis type the run will submit; the check is
 *   against the widest requirement among them.
 * @throws {ReadMarginError} when the layer's recorded margin is smaller than
 *   required.
 * @category Geodata
 */
export declare function checkReadMargin(acquired: unknown, layer: string, analysisTypes: ReadonlyArray<string | null | undefined>): void;
