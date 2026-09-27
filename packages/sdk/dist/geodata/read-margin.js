import { getTilingConfig } from "../area/tiling.js";
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
export const WIDEST_READ_ANALYSIS_TYPE = "solar-radiation";
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
export function resolveReadAnalysisType(analysisType) {
    const name = (analysisType ?? "").trim();
    return name === "" ? WIDEST_READ_ANALYSIS_TYPE : name;
}
/**
 * Half extent, in metres, of a tile's building read rectangle.
 *
 * `getTilingConfig(analysisType).contextSizeM / 2`, read from the KERNEL
 * preset — 256 for the wind analyses, 384 for everything else.
 */
export function readMarginM(analysisType) {
    return getTilingConfig(resolveReadAnalysisType(analysisType)).contextSizeM / 2;
}
/**
 * The ground-material and tree read half extent, in metres.
 *
 * `ceil(sqrt(2) * readMarginM(...))` — the tile half diagonal, so the circular
 * crop the clean step applies is fully covered by the square box fetched.
 * 363 on the wind preset, 544 on the solar one.
 */
export function groundReadDistanceM(analysisType) {
    return Math.ceil(Math.SQRT2 * readMarginM(analysisType));
}
/**
 * A run needs a wider read margin than its acquired layer was read with.
 *
 * Carries both numbers and both analysis types, so a caller sees what to
 * re-acquire with instead of reading a bare refusal. The Python host raises
 * `ReadMarginError` with the same fields.
 */
export class ReadMarginError extends Error {
    layer;
    acquiredMarginM;
    acquiredAnalysisType;
    requiredMarginM;
    requiredAnalysisType;
    constructor(fields) {
        super(`${fields.layer} were acquired with a ${fields.acquiredMarginM} m read margin ` +
            `(analysisType=${JSON.stringify(fields.acquiredAnalysisType)}), and this run's ` +
            `analysisType=${JSON.stringify(fields.requiredAnalysisType)} needs ` +
            `${fields.requiredMarginM} m. The outer band of context ${fields.layer} beyond ` +
            `the site is missing, which would change the result with no other symptom. ` +
            `Re-acquire with analysisType=${JSON.stringify(fields.requiredAnalysisType)}, or ` +
            `with no analysisType at all — the default reads the widest margin and is valid ` +
            `for every analysis.`);
        this.name = "ReadMarginError";
        this.layer = fields.layer;
        this.acquiredMarginM = fields.acquiredMarginM;
        this.acquiredAnalysisType = fields.acquiredAnalysisType;
        this.requiredMarginM = fields.requiredMarginM;
        this.requiredAnalysisType = fields.requiredAnalysisType;
    }
}
function recordedMargin(layer) {
    if (typeof layer !== "object" || layer === null)
        return undefined;
    const value = layer.readMarginM;
    if (typeof value !== "number" || !Number.isFinite(value))
        return undefined;
    const named = layer.analysisType;
    return {
        readMarginM: value,
        ...(typeof named === "string" ? { analysisType: named } : {}),
    };
}
/**
 * Which derivation gives each layer's requirement.
 *
 * Buildings read the plain margin; ground materials and trees read the tile
 * half diagonal of it, so comparing either of them against the BUILDINGS
 * number would state the wrong requirement in the refusal — and would decide
 * the refusal wrongly the moment a third preset or a different clip buffer
 * arrives. The Python host keys the same three names the same way.
 */
const LAYER_REQUIREMENT = {
    buildings: readMarginM,
    "ground materials": groundReadDistanceM,
    trees: groundReadDistanceM,
};
/** The read margin `layer` needs for `analysisType`. */
export function requiredMarginM(layer, analysisType) {
    const derive = LAYER_REQUIREMENT[layer];
    if (derive === undefined) {
        throw new TypeError(`unknown acquisition layer ${JSON.stringify(layer)}; known layers are ` +
            `${Object.keys(LAYER_REQUIREMENT).sort().join(", ")}`);
    }
    return derive(analysisType);
}
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
export function checkReadMargin(acquired, layer, analysisTypes) {
    const record = recordedMargin(acquired);
    if (record === undefined)
        return;
    const names = analysisTypes.length === 0 ? [undefined] : analysisTypes;
    let widest = names[0];
    let required = requiredMarginM(layer, widest);
    for (const name of names.slice(1)) {
        const candidate = requiredMarginM(layer, name);
        if (candidate > required) {
            required = candidate;
            widest = name;
        }
    }
    if (record.readMarginM >= required)
        return;
    throw new ReadMarginError({
        layer,
        acquiredMarginM: record.readMarginM,
        ...(record.analysisType === undefined ? {} : { acquiredAnalysisType: record.analysisType }),
        requiredMarginM: required,
        ...(widest == null ? {} : { requiredAnalysisType: widest }),
    });
}
