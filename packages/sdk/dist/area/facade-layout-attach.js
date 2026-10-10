/**
 * `attachValues`: verify a rebuilt {@link FacadeLayout} against a live (or
 * reloaded) {@link SurfaceColumns} before draping values onto it. Split out
 * of `facade-layout.ts` to keep that file under the 400-line cap (D224
 * CUT 6); no behaviour change.
 */
import { surfaceHasValue, surfaceIndex } from "../results/surface-columns.js";
/**
 * `frameGeometryMatches`'s tolerances (#707 projection report, 2026-10-04,
 * owner decision). A SERVER-RUN result's frame axes come from one triangle
 * normal in f32, so a rebuilt (f64) layout's axis never matches it exactly
 * even once the projection bug above is fixed: measured p50 6e-6, p90 5e-5
 * relative error on a large dense-city fixture. `AXIS_CLOSE_ENOUGH` (relative,
 * same formula as before) covers that noise with headroom; `layoutKey` stays
 * the PRIMARY check (exact, see `attachValues`'s docs) -- this is only the
 * second, geometry-level guard. The origin check is a separate, ABSOLUTE
 * bound in metres, not relative: an origin's own magnitude (a large UTM-like
 * offset) would make a relative tolerance either far looser or far tighter
 * than intended, so `ORIGIN_CLOSE_ENOUGH_M` is a flat 1 cm instead.
 */
const AXIS_CLOSE_ENOUGH = 1e-4;
const ORIGIN_CLOSE_ENOUGH_M = 0.01;
function closeEnough(a, b) {
    return Math.abs(a - b) <= AXIS_CLOSE_ENOUGH * Math.max(1, Math.abs(a), Math.abs(b));
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
// Maintainer note (not published): the safety check #707 asks for ("a client can refuse a
// mismatch instead of draping values onto plausible-looking wrong cells"). `expectedLayoutKey` is
// REQUIRED (#709 review round 3, owner decision, 2026-10-04). The frame and presence checks stay
// as a SECOND guard behind `layoutKey`; they also catch a `columns` mismatch `layoutKey` alone
// cannot, such as the wrong surface entirely. The surface join is by SURFACE ID, never by row --
// `surfaceIndex` in `results/surface-columns.ts`, #579. See `docs/UPGRADING.md`: "store
// layoutKey with every result."
export function attachValues(layout, columns, options) {
    if (layout.layoutKey !== options.expectedLayoutKey) {
        throw new Error(`facade layout mismatch: layoutKey '${layout.layoutKey}' does not match the expected ` +
            `'${options.expectedLayoutKey}' -- the geometry, synth params or kernel version this layout ` +
            "was built from differs from what the stored result was built from");
    }
    // #709 review (2026-10-04): a duplicate frame key across jobs would make
    // the surface-id join below silently check one surface's geometry against
    // another's (whichever key `surfaceIndex` keeps last wins). The kernel
    // itself refuses this at synthesis now, but an older export file (or a
    // layout built by hand) could still carry one.
    const seenKeys = new Set();
    for (const job of layout.jobs) {
        for (const frame of job.frames) {
            if (seenKeys.has(frame.key)) {
                throw new Error(`facade layout mismatch: duplicate frame key '${frame.key}' (job '${job.jobId}') -- ` +
                    "attachValues requires frame keys unique across the whole layout");
            }
            seenKeys.add(frame.key);
        }
    }
    const index = surfaceIndex(columns);
    for (const job of layout.jobs) {
        for (const frame of job.frames) {
            const row = index.get(frame.key);
            if (row === undefined) {
                throw new Error(`facade layout mismatch: surface '${frame.key}' (job '${job.jobId}') is not in this result`);
            }
            if (!frameGeometryMatches(columns, row, frame)) {
                throw new Error(`facade layout mismatch: surface '${frame.key}' geometry differs from the layout`);
            }
            if (!cellLayoutMatches(columns, row, frame)) {
                throw new Error(`facade layout mismatch: surface '${frame.key}' cell layout (which cells have a sensor) differs from the layout`);
            }
        }
    }
    return columns;
}
function frameGeometryMatches(columns, row, frame) {
    const o = 3 * row;
    for (let k = 0; k < 3; k += 1) {
        if (Math.abs(columns.origin[o + k] - frame.origin[k]) > ORIGIN_CLOSE_ENOUGH_M)
            return false;
        if (!closeEnough(columns.uAxis[o + k], frame.uAxis[k]))
            return false;
        if (!closeEnough(columns.vAxis[o + k], frame.vAxis[k]))
            return false;
    }
    return (columns.gridSize[row] === frame.gridSize &&
        columns.nu[row] === frame.nu &&
        columns.nv[row] === frame.nv);
}
/** `true` when `columns` row `row` has a sensor at EXACTLY the same cells
 * (same positions, same row-major order) as `frame.cells`. */
function cellLayoutMatches(columns, row, frame) {
    const start = columns.cellOffsets[row];
    const end = columns.cellOffsets[row + 1];
    if (end - start !== frame.cells.length)
        return false;
    for (let k = 0; k < frame.cells.length; k += 1) {
        const livePresent = surfaceHasValue(columns, start + k);
        const layoutPresent = frame.cells[k] !== null;
        if (livePresent !== layoutPresent)
            return false;
    }
    return true;
}
