import { requireCore } from "../internal/core.js";
function validAt(bits, index) {
    return (bits[index >> 3] & (1 << (index & 7))) !== 0;
}
/** Keep owned compact values; apply missing cells without making nested arrays. */
export function compactGridTile(parsed, cells) {
    if (parsed.shape[0] !== parsed.shape[1] || parsed.shape[0] * parsed.shape[1] !== cells) {
        throw new Error(`grid result must contain exactly ${cells} cells`);
    }
    if (parsed.kind === "categorical") {
        const category = { codes: parsed.values,
            validity: parsed.validity, dictionary: parsed.dictionary ?? [] };
        // Numeric strings retain the staging decoder's numeric-category policy.
        const values = new Float32Array(cells).fill(Number.NaN);
        for (let cell = 0; cell < cells; cell += 1) {
            if (!validAt(category.validity, cell))
                continue;
            const label = category.dictionary[category.codes[cell]];
            const value = Number(label);
            if (label === undefined || Number.isNaN(value))
                return { compactCategory: category };
            values[cell] = value;
        }
        return { values };
    }
    // The private decoder owns these arrays; keep its caller's buffer unchanged.
    const values = parsed.values.slice();
    for (let cell = 0; cell < cells; cell += 1) {
        if (!validAt(parsed.validity, cell))
            values[cell] = Number.NaN;
    }
    return { values };
}
/**
 * Normalize compact dictionaries with the same kernel rule as staging.
 *
 * Used to take a second `jsonSources` source list (raw string labels per
 * cell, for a JSON tile decoded in JS) alongside `sources`. D107 moved the
 * JSON route's categorical decode into the kernel too — `decode_grid_json_f64`
 * already returns a `CompactCategory`-shaped per-tile dictionary, so every
 * caller now arrives through `sources`, and that second list is gone.
 */
export function compactCategoricalDense(sources, slots, cells) {
    const codes = new Uint32Array(slots * cells);
    const validity = new Uint8Array(Math.ceil(codes.length / 8));
    const legends = Array.from({ length: slots }, () => []);
    const put = (index, cell, code) => {
        const at = index * cells + cell;
        codes[at] = code;
        validity[at >> 3] = validity[at >> 3] | (1 << (at & 7));
    };
    for (const { index, category } of sources) {
        legends[index] = Array.from(category.dictionary);
        for (let cell = 0; cell < cells; cell += 1) {
            if (validAt(category.validity, cell))
                put(index, cell, category.codes[cell]);
        }
    }
    const normalized = requireCore().normalizeAreaCategoricalCompact(codes, validity, JSON.stringify(legends), cells);
    try {
        return { values: normalized.values, legend: Object.freeze(Array.from(normalized.legend, String)) };
    }
    finally {
        normalized.free();
    }
}
/** Promote only when a JSON or legacy F64 tile requires its original precision. */
export function numericCanvas(current, length, incoming) {
    if (current === undefined) {
        return incoming instanceof Float64Array
            ? new Float64Array(length).fill(Number.NaN) : new Float32Array(length).fill(Number.NaN);
    }
    return current instanceof Float32Array && incoming instanceof Float64Array
        ? new Float64Array(current) : current;
}
