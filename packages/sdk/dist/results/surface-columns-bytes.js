// Maintainer note (not published): The values-only blob of one result. The kernel writes and
// reads it (`ir_simprep::surface_columns_blob`, `docs/surface-render-buffers.md` section 10);
// this file only moves the columns in and the bytes out.
import { requireCore } from "../internal/core.js";
import { surfaceColumnsFromJoin } from "./surface-columns.js";
/**
 * Saves the values of one result as one blob: the values in the type the server stored, the
 * surface ids, the grid placement of each surface, the per-surface numbers, the legend and the
 * aggregates. It holds no outline and no triangles: the outline comes from the saved layout
 * (`surfaceRenderBuffers(columns, { layout })`). The blob starts with a version; a reader
 * refuses a version it does not know.
 *
 * Store one layout per geometry (`FacadeLayout.toBytes`) and one blob per simulation. Give the
 * `layoutKey` of the layout the result belongs to; read it back with `surfaceColumnsFromBytes`
 * and pass it as `expectedLayoutKey` to `attachValues`.
 *
 * @param columns - The surface columns of a run.
 * @param options - `layoutKey`, the key of the layout the result belongs to.
 * @returns The blob.
 * @throws {Error} When the columns hold a field the blob has no place for (`extra`).
 * @category Results and legend
 */
export function surfaceColumnsToBytes(columns, options = {}) {
    return requireCore().surfaceColumnsToBytes(columns, options.layoutKey);
}
/**
 * Loads the blob of `surfaceColumnsToBytes`. The columns have no outline: pass the saved layout
 * to `surfaceRenderBuffers`. They also have no triangles.
 *
 * @param bytes - The blob.
 * @returns The `columns` and the `layoutKey` saved with them (`undefined` when none was given).
 * @throws {Error} When the bytes are not a blob, or its version is unknown.
 * @category Results and legend
 */
export function surfaceColumnsFromBytes(bytes) {
    const joined = requireCore().surfaceColumnsFromBytes(bytes);
    const columns = surfaceColumnsFromJoin(joined);
    return joined.layoutKey === undefined ? { columns } : { columns, layoutKey: joined.layoutKey };
}
