import { requireCore } from "../internal/core.js";
import { DEFAULT_TOKENS_PER_JOB } from "../pricing.js";
const WASM_USIZE_MAX = 0xffff_ffff;
function optionalUsize(value, name) {
    if (value === undefined)
        return undefined;
    if (!Number.isSafeInteger(value) || value < 0 || value > WASM_USIZE_MAX) {
        throw new TypeError(`${name} must be an integer from 0 through ${WASM_USIZE_MAX}`);
    }
    return value;
}
function parseJson(document) {
    return JSON.parse(document);
}
/** Validate and winding-normalize a GeoJSON polygon in the shared kernel. */
export function validatePolygon(polygon) {
    return parseJson(requireCore().validatePolygon(JSON.stringify(polygon)));
}
/** Group digits the same way Python's `format(n, ",")` does, in every locale. */
function grouped(value) {
    return value.toLocaleString("en-US");
}
/**
 * The refusal text, field for field the same sentence the Python SDK raises
 * (`infrared_sdk/tiling/tiles.py`). Only the knob and the preview call are
 * spelled differently, because only those two are spelled differently in the
 * two SDKs. Keep them in step: a caller comparing the two should not have to
 * wonder whether the two SDKs disagree about what a run costs.
 */
function capRefusal(verdict) {
    const grid = `the ${verdict.family} grid (${verdict.step_m} m step)`;
    if (verdict.kind === "bbox_too_large") {
        const cost = verdict.estimate * DEFAULT_TOKENS_PER_JOB;
        return (`Polygon bbox would generate about ${grouped(verdict.estimate)} tiles on ${grid}, ` +
            `over the limit of ${grouped(verdict.limit)} non-empty tiles; a bbox grid that large ` +
            `is refused before a single tile is built. At about ${DEFAULT_TOKENS_PER_JOB} tokens ` +
            `per billed tile that is up to about ${grouped(cost)} tokens IF every bbox tile were ` +
            `non-empty — most will not be, so read it as an upper bound. To get past this ` +
            `pre-check, pass maxTilesOverride: ${verdict.min_override} or more; the non-empty cap ` +
            `is checked after it. A bbox this large is more often a coordinate-order mistake ` +
            `(GeoJSON is [lon, lat]).`);
    }
    const cost = verdict.count * DEFAULT_TOKENS_PER_JOB;
    return (`Polygon produces ${grouped(verdict.count)} non-empty tiles on ${grid}, over the limit ` +
        `of ${grouped(verdict.limit)}. Each tile is one billed job at about ` +
        `${DEFAULT_TOKENS_PER_JOB} tokens, so this run would cost about ${grouped(cost)} tokens. ` +
        `To run it, pass maxTilesOverride: ${verdict.count}; to spend less, shrink the polygon ` +
        `or size it first with previewArea().`);
}
/** Generate the deterministic south-to-north tile grid in the shared kernel. */
export function generateTilesForPolygon(polygon, options = {}) {
    const limit = optionalUsize(options.maxTilesOverride, "maxTilesOverride");
    const verdict = parseJson(requireCore().generateTilesForPolygon(JSON.stringify(polygon), options.analysisType ?? undefined, limit));
    if (!verdict.ok)
        throw new Error(capRefusal(verdict));
    return verdict.tiles;
}
/** Read the kernel-owned preset. Unknown non-empty analysis names use solar. */
export function getTilingConfig(analysisType) {
    const wire = parseJson(requireCore().getTilingConfig(analysisType ?? undefined));
    return {
        inferenceSizeM: wire.inference_size_m,
        inferenceSizeCells: wire.inference_size_cells,
        contextSizeM: wire.context_size_m,
        stepM: wire.step_m,
        stepCells: wire.step_cells,
        cellSizeM: wire.cell_size_m,
    };
}
