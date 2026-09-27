/**
 * Local grid-image rendering: the WASM replacement for
 * `POST /utils/analysis/generate-image`.
 *
 * The route normalises the grid, looks a colour scheme up in the models
 * registry, and renders it with matplotlib. This module does the same three
 * things in the browser or a Worker: it reproduces the normalisation, resolves
 * the config against the PUBLIC colour registry, and hands numbers plus one
 * config object to the kernel's `renderGridRegistry`.
 *
 * Two inherited behaviours are deliberate:
 *
 * - **Row order.** The route reverses the caller's grid and then draws it with
 *   `imshow(origin="lower")`; the two flips cancel, so the top image row is the
 *   caller's row 0. `reverseRows` therefore defaults to `false`. The reversal
 *   is still observable in one place — whether the grid is read as wind
 *   CLASSES is decided by the caller's LAST row — and that is reproduced here.
 * - **The fallback.** With no `analysisType`, or one the registry has no config
 *   for, the route falls back to matplotlib's `magma_r` over the grid's own
 *   finite range, no-data white and opaque. `gridToPng`'s default is that same
 *   ramp.
 *
 * Differences from the route are `docs/DEVIATIONS.md` D9 (1:1 cell to pixel up
 * to a 960 px long axis, where the route capped at ~480 px) and D37 (the
 * colour port itself). Nothing fails open: an image
 * in the wrong colours is indistinguishable from a correct one at the call
 * site.
 */
import { fetchVisualConfigurations, } from "./internal/registry-document.js";
import { requireCore } from "./internal/core.js";
export { clearRegistryCache, fetchVisualConfigurations, MAX_REGISTRY_BYTES, REGISTRY_URL, RegistryFetchError, } from "./internal/registry-document.js";
/**
 * The default cap on the LONG axis of a rendered image, in pixels.
 *
 * This MIRRORS `ir_raster::DEFAULT_MAX_LONG_AXIS_PX`, which is what the
 * bindings apply; neither binding exports the constant, so the copy here is
 * named so a caller can read it and is held to the kernel's value by the tests
 * that render with the default and assert a 960 px output. A grid at or
 * below the cap renders 1:1, cell for pixel; a larger one is sampled
 * nearest-neighbour on the VALUES, aspect ratio and no-data cells kept (D9).
 */
export const DEFAULT_MAX_LONG_AXIS_PX = 960;
/** A grid could not be rendered locally. */
export class GridImageError extends Error {
    name = "GridImageError";
}
let windOrdinals;
function isDirectConfig(value) {
    return typeof value === "object" && value !== null && "colors" in value;
}
/**
 * Flatten `visualConfigurations` to the reference's lookup keys: a simple type
 * keeps its process id, a multi-variant one contributes `process:variant` per
 * variant that carries `colors`.
 */
export function flattenVisualConfigs(configurations) {
    const flat = {};
    for (const [processId, value] of Object.entries(configurations)) {
        if (isDirectConfig(value)) {
            flat[processId] = value;
        }
        else if (typeof value === "object" && value !== null) {
            for (const [variant, config] of Object.entries(value)) {
                if (isDirectConfig(config))
                    flat[`${processId}:${variant}`] = config;
            }
        }
    }
    return flat;
}
/**
 * The config for one analysis type, or `undefined` when the registry has none.
 *
 * The bare `analysisType` wins; only if it is absent does `criteria` (then
 * `subtype`) select a variant. `undefined` is not an error — the route falls
 * back to its magma_r ramp there, and so does this renderer.
 */
export function resolveVisualConfig(configurations, analysisType, selectors = {}) {
    const flat = flattenVisualConfigs(configurations);
    if (analysisType in flat)
        return flat[analysisType];
    const variant = selectors.criteria ?? selectors.subtype;
    if (variant !== undefined && variant !== "") {
        const compound = `${analysisType}:${variant}`;
        if (compound in flat)
            return flat[compound];
    }
    return undefined;
}
/**
 * The kernel's wind-comfort class table, e.g. `{A: 0, .., S: 5, S15: 5, S20: 6}`.
 *
 * Read from the core so the host and the kernel cannot drift. A label outside
 * it is no-data, never a clamped class.
 */
export function windClassOrdinals() {
    if (windOrdinals === undefined) {
        const raw = requireCore().windClassOrdinals();
        windOrdinals = JSON.parse(raw);
    }
    return windOrdinals;
}
/**
 * Grid as returned by the API to the flat `Float32Array` the kernel takes.
 *
 * `null` / `undefined` is no-data, and when the LAST row holds any string the
 * whole grid is read as wind CLASSES (an unknown label is no-data, a number
 * stays a number). The last row decides because the route decides on the
 * already-reversed grid.
 */
export function normalizeGrid(grid) {
    if (!Array.isArray(grid) || grid.length === 0) {
        throw new GridImageError("grid is empty");
    }
    const height = grid.length;
    const last = grid[height - 1];
    if (!Array.isArray(last) || last.length === 0) {
        throw new GridImageError("grid is empty");
    }
    const width = grid[0]?.length ?? 0;
    if (width === 0)
        throw new GridImageError("grid rows are empty");
    const classScale = last.some((cell) => typeof cell === "string");
    const ordinals = classScale ? windClassOrdinals() : {};
    const values = new Float32Array(width * height);
    let at = 0;
    for (let y = 0; y < height; y += 1) {
        const row = grid[y];
        if (!Array.isArray(row) || row.length !== width) {
            throw new GridImageError(`grid is ragged — row ${y} has ${row?.length ?? 0} cells, row 0 has ${width}`);
        }
        for (const cell of row) {
            if (cell === null || cell === undefined) {
                values[at] = Number.NaN;
            }
            else if (typeof cell === "string") {
                if (!classScale) {
                    throw new GridImageError(`grid mixes text into a numeric result — row ${y} holds ${JSON.stringify(cell)} ` +
                        "but the last row has no class labels, so the grid is read as numbers");
                }
                values[at] = ordinals[cell] ?? Number.NaN;
            }
            else if (typeof cell === "number") {
                values[at] = cell;
            }
            else {
                throw new GridImageError(`grid row ${y} holds a non-numeric cell`);
            }
            at += 1;
        }
    }
    return { values, width, height };
}
/**
 * Render a result grid to PNG bytes with the initialized Infrared WASM core.
 *
 * The image is **1:1 — one pixel per grid cell** up to a 960 px long axis (D9),
 * not the route's ~480 px matplotlib figure; `maxLongAxisPx` moves that cap
 * and `0` removes it. Colours come from the registry `visualConfigurations`
 * entry the options resolve to; without one, the magma_r fallback the route
 * uses applies. Read the result size with {@link gridImageSize}.
 * `initializeCore()` must have completed.
 *
 * The promise only awaits the registry: pass `visualConfigurations` (or omit
 * `analysisType`) and it resolves without any I/O at all.
 */
export async function renderGridPng(grid, options = {}) {
    const { values, width, height } = normalizeGrid(grid);
    const reverseRows = options.reverseRows ?? false;
    // `undefined` and an omitted option are ONE thing in JavaScript, and both
    // mean the default. `0` is therefore the opt-out, in this host and in the
    // kernel binding under it.
    const maxLongAxisPx = options.maxLongAxisPx ?? DEFAULT_MAX_LONG_AXIS_PX;
    let config;
    if (options.analysisType !== undefined && options.analysisType !== "") {
        const configurations = options.visualConfigurations ??
            (await fetchVisualConfigurations(options.registry ?? {})).configurations;
        config = resolveVisualConfig(configurations, options.analysisType, {
            criteria: options.criteria,
            subtype: options.subtype,
        });
    }
    try {
        if (config !== undefined) {
            return requireCore().renderGridRegistry(values, width, height, JSON.stringify(config), reverseRows, maxLongAxisPx);
        }
        // The magma_r fallback takes the SAME row-order argument as the registry
        // path, so both flip the OUTPUT rows after the cap has sampled the grid.
        // This host used to pre-flip the values instead; above the cap that places
        // a row up to one grid row away from the registry path, because a
        // nearest-neighbour map is not symmetric for every size pair. It also
        // copied the whole grid on exactly the biggest inputs.
        return requireCore().gridToPng(values, width, height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, maxLongAxisPx, reverseRows);
    }
    catch (error) {
        if (error instanceof GridImageError)
            throw error;
        throw new GridImageError(`local rendering failed: ${String(error)}`, { cause: error });
    }
}
/**
 * The rendered size and the scale factor, for aligning an overlay.
 *
 * The dimensions are READ FROM THE PNG the kernel wrote, never recomputed
 * from the cap: the cap rule has ONE home, in the kernel, and a second
 * implementation here could only disagree with it. `gridWidth` / `gridHeight`
 * are the dimensions of the grid that was rendered.
 *
 * A capped image maps output pixel `(x, y)` to grid cell
 * `(floor((x + 0.5) * gridWidth / width), floor((y + 0.5) * gridHeight /
 * height))` — the nearest-neighbour rule of D9.
 */
export function gridImageSize(png, gridWidth, gridHeight) {
    if (png.length < 24)
        throw new GridImageError("not a PNG");
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (signature.some((byte, at) => png[at] !== byte)) {
        throw new GridImageError("not a PNG");
    }
    if (gridWidth <= 0 || gridHeight <= 0) {
        throw new GridImageError("the grid must have both dimensions");
    }
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    const scale = gridWidth >= gridHeight ? width / gridWidth : height / gridHeight;
    return { width, height, scale };
}
