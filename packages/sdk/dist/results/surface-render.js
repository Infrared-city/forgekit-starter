// Maintainer note (not published): The render buffers of a surface result (D271, #753). The
// kernel builds them (`surfaceRenderBuffers`, contract `docs/surface-render-buffers.md`); this
// file only moves the columns in and the typed arrays out. Section 8 of the contract: the
// columns are copied into wasm memory once, each buffer is copied out once into an OWNED typed
// array, and no wasm handle survives the call.
import { requireCore } from "../internal/core.js";
/**
 * Builds the render buffers of a surface result.
 *
 * The outline comes from `options.layout` (a saved layout: `FacadeLayout.fromBytes`), or from the
 * columns themselves: a facade or roof result of this client has one.
 *
 * @param columns - The surface columns.
 * @param options - `layout`, the layout that holds the outline.
 * @returns The render buffers, as owned typed arrays.
 * @throws {Error} When there is no outline, when a surface is not in the layout, or when a
 *   column breaks the contract (for example a frame with cells and no outline triangle, or a
 *   grid larger than 65,535 cells on a side). The message names the frame.
 * @category Results and legend
 */
export function surfaceRenderBuffers(columns, options = {}) {
    return (options.layout === undefined ? requireCore("surfaceRenderBuffers").surfaceRenderBuffers(columns)
        : options.layout._surfaceRenderBuffers(columns));
}
