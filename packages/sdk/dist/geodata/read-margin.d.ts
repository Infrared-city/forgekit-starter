/**
 * The READ MARGIN of an acquisition, and the rule that keeps it honest.
 *
 * A tile's read rectangle is the box the SDK fetches buildings, trees and
 * ground materials in. Its half extent — the READ MARGIN — is not a number
 * this host owns. It is the kernel's own tiling preset:
 *
 *     read margin = getTilingConfig(analysisType).contextSizeM / 2
 *
 * which is **256 m** for the wind preset (`wind-speed`,
 * `pedestrian-wind-comfort`) and **384 m** for every other analysis, because a
 * solar, daylight or thermal model must see the buildings and trees that cast
 * a shadow into the tile from further away than a wind model must see the
 * obstacles that steer the air. There is no host constant for it and there
 * must never be one: a second copy of these numbers is a second answer to one
 * question. The Python host derives the same two numbers the same way
 * (`infrared_sdk.tiling.read_margin`).
 *
 * **The default is the WIDEST margin.** A caller who names no analysis type
 * gets {@link WIDEST_READ_ANALYSIS_TYPE}, whose preset is the solar one. That
 * is correct for every analysis and costs a wind caller extra input/output.
 * The reverse default is not safe: a missing context band changes a result and
 * says nothing, while extra reading only costs time.
 *
 * **Ground materials and trees read a little wider than buildings.** Their
 * query box is `ceil(sqrt(2) * margin)` — 363 m on the wind preset, 544 m on
 * the solar one. The `sqrt(2)` is the tile's half DIAGONAL and it is the clip
 * buffer the deleted `GET /ground-material/collect` route came with: the clean
 * step crops to a CIRCLE of that radius around the tile centre, so a square
 * box of the plain margin leaves the four corners of that circle unread. It is
 * kept, and it is now derived from the margin instead of written down as 363.
 *
 * See `docs/DEVIATIONS.md` D54.
 */
/**
 * The analysis type an acquisition uses when the caller names none.
 *
 * A REAL analysis name, not a preset label, so the kernel — and only the
 * kernel — turns it into numbers. Every non-wind name resolves to the same
 * (solar) preset, so the choice among them is arbitrary; `solar-radiation` is
 * the plainest member of that family.
 */
export declare const WIDEST_READ_ANALYSIS_TYPE = "solar-radiation";
/**
 * The analysis type an acquisition reads for.
 *
 * `undefined`, `null` and the empty string mean "the caller named none" and
 * become {@link WIDEST_READ_ANALYSIS_TYPE}. This is NOT the kernel's own
 * default: `getTilingConfig(undefined)` answers the WIND preset, for
 * compatibility with stored grids that predate explicit analysis types. A READ
 * has the opposite safe direction, and this function is the only place that
 * difference lives.
 */
export declare function resolveReadAnalysisType(analysisType?: string | null): string;
/**
 * Half extent, in metres, of a tile's building read rectangle.
 *
 * `getTilingConfig(analysisType).contextSizeM / 2`, read from the KERNEL
 * preset — 256 for the wind analyses, 384 for everything else.
 */
export declare function readMarginM(analysisType?: string | null): number;
/**
 * The ground-material and tree read half extent, in metres.
 *
 * `ceil(sqrt(2) * readMarginM(...))` — the tile half diagonal, so the circular
 * crop the clean step applies is fully covered by the square box fetched.
 * 363 on the wind preset, 544 on the solar one.
 */
export declare function groundReadDistanceM(analysisType?: string | null): number;
/** A layer that records what it was read with. */
export interface ReadMarginRecord {
    readonly readMarginM: number;
    readonly analysisType?: string;
}
/**
 * A run needs a wider read margin than its acquired layer was read with.
 *
 * Carries both numbers and both analysis types, so a caller sees what to
 * re-acquire with instead of reading a bare refusal. The Python host raises
 * `ReadMarginError` with the same fields.
 */
export declare class ReadMarginError extends Error {
    readonly layer: string;
    readonly acquiredMarginM: number;
    readonly acquiredAnalysisType: string | undefined;
    readonly requiredMarginM: number;
    readonly requiredAnalysisType: string | undefined;
    constructor(fields: {
        readonly layer: string;
        readonly acquiredMarginM: number;
        readonly acquiredAnalysisType?: string;
        readonly requiredMarginM: number;
        readonly requiredAnalysisType?: string;
    });
}
/** The read margin `layer` needs for `analysisType`. */
export declare function requiredMarginM(layer: string, analysisType?: string | null): number;
/**
 * Refuse a run whose analysis needs more margin than `acquired` carries.
 *
 * Anything that records no margin — a bare `{buildingId: mesh}` map, a
 * hand-built layer document — is passed unchanged: it makes no claim, and
 * refusing it would break every caller who builds their own layers.
 *
 * `analysisTypes` is every analysis the run will submit, and the check is
 * against the WIDEST requirement among them: one acquisition serves the whole
 * list, so it has to satisfy the hungriest member.
 */
export declare function checkReadMargin(acquired: unknown, layer: string, analysisTypes: ReadonlyArray<string | null | undefined>): void;
