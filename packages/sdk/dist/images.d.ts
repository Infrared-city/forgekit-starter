/**
 * Local grid-image rendering: turn a result grid into a PNG in the browser, a Worker
 * or Node, without a network call to an image service.
 *
 * Colours come from the public colour registry for the analysis type you name.
 * Without a registry entry the image uses a default `magma_r` ramp over the grid's
 * own finite range, with no-data cells white and opaque.
 */
import { type FetchRegistryOptions, type VisualConfig, type VisualConfigurations } from "./internal/registry-document.js";
export { clearRegistryCache, fetchVisualConfigurations, MAX_REGISTRY_BYTES, REGISTRY_URL, RegistryFetchError, } from "./internal/registry-document.js";
export type { FetchRegistryOptions, RegistryDocument, VisualConfig, VisualConfigurations, } from "./internal/registry-document.js";
/**
 * A cell as the API returns it: a number, a wind-comfort class label, or no data.
 *
 * @category Results and legend
 */
export type GridCell = number | string | null | undefined;
/**
 * The default cap on the long axis of a rendered image, in pixels (960).
 *
 * A grid at or below the cap renders 1:1, one pixel per cell. A larger grid is
 * sampled nearest-neighbour on its values, so the aspect ratio and no-data cells
 * are kept.
 *
 * @category Results and legend
 */
export declare const DEFAULT_MAX_LONG_AXIS_PX = 960;
/**
 * The size of a rendered image, and how many pixels it spends per grid cell.
 *
 * @category Results and legend
 */
export interface GridImageSize {
    /** Image width in pixels. */
    width: number;
    /** Image height in pixels. */
    height: number;
    /** Output pixels per grid cell on the long axis: `1` for a 1:1 image. */
    scale: number;
}
/**
 * Options for `renderGridPng`.
 *
 * @category Results and legend
 */
export interface RenderGridPngOptions {
    /** Analysis process id, e.g. `"pedestrian-wind-comfort"`. */
    analysisType?: string;
    /** Variant selector for analyses with several variants; wins over `subtype`. */
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
     * Cap on the long axis of the image, in pixels. Defaults to
     * `DEFAULT_MAX_LONG_AXIS_PX` (960); `0` renders every cell.
     *
     * Above the cap the grid is sampled nearest-neighbour on its values before
     * it is coloured, so the aspect ratio holds and a no-data cell stays
     * no-data; no blended value appears between two classes.
     */
    maxLongAxisPx?: number;
    /** Overrides for the registry fetch. */
    registry?: FetchRegistryOptions;
}
/**
 * Thrown when a grid cannot be rendered locally, for example because it is empty,
 * ragged or mixes text into a numeric result.
 *
 * @category Errors
 */
export declare class GridImageError extends Error {
    readonly name = "GridImageError";
}
/**
 * Flatten `visualConfigurations` to a flat lookup table: a simple type keeps its
 * process id, and a multi-variant one contributes `process:variant` for each
 * variant that carries `colors`.
 *
 * @param configurations - The registry's `visualConfigurations` document.
 * @returns Lookup key to colour configuration.
 *
 * @category Results and legend
 */
export declare function flattenVisualConfigs(configurations: VisualConfigurations): Record<string, VisualConfig>;
/**
 * The colour configuration for one analysis type, or `undefined` when the registry
 * has none.
 *
 * The bare `analysisType` wins; only if it is absent does `criteria` (then
 * `subtype`) select a variant. `undefined` is not an error: the renderer falls
 * back to its default `magma_r` ramp.
 *
 * @param configurations - The registry's `visualConfigurations` document.
 * @param analysisType - Analysis process id, e.g. `"pedestrian-wind-comfort"`.
 * @param selectors - Optional variant selectors; `criteria` wins over `subtype`.
 * @returns The matching configuration, or `undefined`.
 *
 * @category Results and legend
 */
export declare function resolveVisualConfig(configurations: VisualConfigurations, analysisType: string, selectors?: {
    criteria?: string | undefined;
    subtype?: string | undefined;
}): VisualConfig | undefined;
/**
 * The wind-comfort class table, mapping a class label to its ordinal, e.g.
 * `{A: 0, .., S: 5, S15: 5, S20: 6}`.
 *
 * A label outside the table is treated as no-data, never as a clamped class.
 * `initializeCore()` must have completed.
 *
 * @returns Class label to ordinal.
 *
 * @category Results and legend
 */
export declare function windClassOrdinals(): Record<string, number>;
/**
 * Convert a grid as returned by the API into a flat `Float32Array` plus its size.
 *
 * `null` / `undefined` cells become no-data (`NaN`). When the last row holds any
 * string, the whole grid is read as wind-comfort classes: an unknown label is
 * no-data and a number stays a number.
 *
 * @param grid - Rows of cells: numbers, class labels, `null` or `undefined`.
 * @returns The row-major values and the grid `width` and `height`.
 * @throws {GridImageError} when the grid is empty, ragged, holds a non-numeric cell
 * or mixes text into a numeric result.
 *
 * @category Results and legend
 */
export declare function normalizeGrid(grid: readonly (readonly GridCell[])[]): {
    values: Float32Array;
    width: number;
    height: number;
};
/**
 * Render a result grid to PNG bytes with the initialized Infrared core.
 *
 * The image is 1:1, one pixel per grid cell, up to a 960 px long axis;
 * `maxLongAxisPx` moves that cap and `0` removes it. Colours come from the registry
 * `visualConfigurations` entry the options resolve to; without one, a default
 * `magma_r` ramp applies. Read the result size with `gridImageSize`.
 * `initializeCore()` must have completed.
 *
 * The promise only awaits the registry: pass `visualConfigurations` (or omit
 * `analysisType`) and it resolves without any network request.
 *
 * @param grid - Rows of cells: numbers, class labels, `null` or `undefined`.
 * @param options - Analysis type, variant selectors, row order and size cap.
 * @returns PNG file bytes.
 * @throws {GridImageError} when the grid is invalid or local rendering fails.
 * @throws {RegistryFetchError} when the colour registry has to be fetched and the
 * fetch fails.
 *
 * @category Results and legend
 */
export declare function renderGridPng(grid: readonly (readonly GridCell[])[], options?: RenderGridPngOptions): Promise<Uint8Array>;
/**
 * The rendered size and the scale factor of a PNG from `renderGridPng`, for
 * aligning an overlay.
 *
 * The dimensions are read from the PNG itself. A capped image maps output pixel
 * `(x, y)` to grid cell
 * `(floor((x + 0.5) * gridWidth / width), floor((y + 0.5) * gridHeight / height))`,
 * the nearest-neighbour rule.
 *
 * @param png - PNG bytes from `renderGridPng`.
 * @param gridWidth - Width of the rendered grid, in cells.
 * @param gridHeight - Height of the rendered grid, in cells.
 * @returns The image `width` and `height` in pixels and the pixels per cell.
 * @throws {GridImageError} when `png` is not a PNG or a grid dimension is not positive.
 *
 * @category Results and legend
 */
export declare function gridImageSize(png: Uint8Array, gridWidth: number, gridHeight: number): GridImageSize;
