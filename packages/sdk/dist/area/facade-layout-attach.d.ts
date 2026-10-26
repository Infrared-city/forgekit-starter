/**
 * `attachValues`: verify a rebuilt {@link FacadeLayout} against a live (or
 * reloaded) {@link SurfaceColumns} before draping values onto it. Split out
 * of `facade-layout.ts` to keep that file under the 400-line cap (D224
 * CUT 6); no behaviour change.
 */
import { type SurfaceColumns } from "../results/surface-columns.js";
import type { FacadeLayout } from "./facade-layout.js";
/**
 * The options of `attachValues`.
 *
 * @category Facade layout
 */
export interface AttachValuesOptions {
    /**
     * The `layoutKey` you stored alongside the result when it first ran. Required.
     *
     * It must not be read off the `layout` you are checking: a layout always agrees with its own
     * key, so that would check nothing.
     */
    readonly expectedLayoutKey: string;
}
/**
 * Checks a facade layout against a result before values are draped onto it, and refuses a
 * mismatch instead of placing values on plausible-looking wrong cells.
 *
 * The layout's `layoutKey` must equal `options.expectedLayoutKey`. The key covers the geometry,
 * synthesis parameters and surface-grid and core versions, so a rebuilt layout whose geometry
 * drifted, even by a small hole inside a cell's footprint, has a different key and is refused
 * before anything else is checked. Three further checks catch a result that does not belong to
 * the layout: that `columns` contains each surface of the layout (joined by surface id, not by
 * row), that its origin, axes and grid dimensions agree with the layout's, and that exactly the
 * same grid cells carry a sensor, in the same row-major order. Frame keys must be unique across
 * the layout. Store the layout key with every result.
 *
 * @param layout - The layout rebuilt for the geometry you want to check.
 * @param columns - The result columns (live or reloaded) to check against the layout.
 * @param options - `expectedLayoutKey`, the key stored with the result.
 * @returns `columns`, unchanged; this function only verifies.
 * @throws {Error} when the layout key differs, a frame key is duplicated, a surface is missing
 *   from `columns`, or a surface's geometry or cell layout differs from the layout.
 * @category Facade layout
 */
export declare function attachValues(layout: FacadeLayout, columns: SurfaceColumns, options: AttachValuesOptions): SurfaceColumns;
