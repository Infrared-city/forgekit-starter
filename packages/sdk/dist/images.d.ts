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
import { type FetchRegistryOptions, type VisualConfig, type VisualConfigurations } from "./internal/registry-document.js";
export { clearRegistryCache, fetchVisualConfigurations, MAX_REGISTRY_BYTES, REGISTRY_URL, RegistryFetchError, } from "./internal/registry-document.js";
export type { FetchRegistryOptions, RegistryDocument, VisualConfig, VisualConfigurations, } from "./internal/registry-document.js";
/** A cell as the API returns it: a number, a wind-comfort class, or no data. */
export type GridCell = number | string | null | undefined;
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
export declare const DEFAULT_MAX_LONG_AXIS_PX = 960;
/** The size of a rendered image, and what it is per grid cell. */
export interface GridImageSize {
    /** Image width in pixels. */
    width: number;
    /** Image height in pixels. */
    height: number;
    /** Output pixels per grid cell on the long axis: `1` for a 1:1 image. */
    scale: number;
}
export interface RenderGridPngOptions {
    /** Analysis process id, e.g. `"pedestrian-wind-comfort"`. */
    analysisType?: string;
    /** Variant selector; wins over `subtype`. */
    criteria?: string;
    /** Variant selector, used only when `criteria` is absent. */
    subtype?: string;
    /**
     * Already-fetched `visualConfigurations`. Supply it to skip the network
     * entirely; omit it and the registry is fetched (and cached) on demand.
     */
    visualConfigurations?: VisualConfigurations;
    /** `true` if the caller's grid is already bottom-up. Defaults to `false`. */
    reverseRows?: boolean;
    /**
     * Cap on the LONG axis of the image, in pixels. Defaults to
     * {@link DEFAULT_MAX_LONG_AXIS_PX} (960); `0` renders every cell.
     *
     * Above the cap the grid is sampled nearest-neighbour on the VALUES before
     * it is coloured, so the aspect ratio holds and a no-data cell stays
     * no-data — no blended value appears between two classes (D9).
     */
    maxLongAxisPx?: number;
    /** Overrides for the registry fetch. */
    registry?: FetchRegistryOptions;
}
/** A grid could not be rendered locally. */
export declare class GridImageError extends Error {
    readonly name = "GridImageError";
}
/**
 * Flatten `visualConfigurations` to the reference's lookup keys: a simple type
 * keeps its process id, a multi-variant one contributes `process:variant` per
 * variant that carries `colors`.
 */
export declare function flattenVisualConfigs(configurations: VisualConfigurations): Record<string, VisualConfig>;
/**
 * The config for one analysis type, or `undefined` when the registry has none.
 *
 * The bare `analysisType` wins; only if it is absent does `criteria` (then
 * `subtype`) select a variant. `undefined` is not an error — the route falls
 * back to its magma_r ramp there, and so does this renderer.
 */
export declare function resolveVisualConfig(configurations: VisualConfigurations, analysisType: string, selectors?: {
    criteria?: string | undefined;
    subtype?: string | undefined;
}): VisualConfig | undefined;
/**
 * The kernel's wind-comfort class table, e.g. `{A: 0, .., S: 5, S15: 5, S20: 6}`.
 *
 * Read from the core so the host and the kernel cannot drift. A label outside
 * it is no-data, never a clamped class.
 */
export declare function windClassOrdinals(): Record<string, number>;
/**
 * Grid as returned by the API to the flat `Float32Array` the kernel takes.
 *
 * `null` / `undefined` is no-data, and when the LAST row holds any string the
 * whole grid is read as wind CLASSES (an unknown label is no-data, a number
 * stays a number). The last row decides because the route decides on the
 * already-reversed grid.
 */
export declare function normalizeGrid(grid: readonly (readonly GridCell[])[]): {
    values: Float32Array;
    width: number;
    height: number;
};
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
export declare function renderGridPng(grid: readonly (readonly GridCell[])[], options?: RenderGridPngOptions): Promise<Uint8Array>;
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
export declare function gridImageSize(png: Uint8Array, gridWidth: number, gridHeight: number): GridImageSize;
