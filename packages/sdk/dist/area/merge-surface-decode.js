/**
 * One downloaded surface result, decoded by the kernel (WP4).
 *
 * `decodeSurfaceArchive` inflates the archive, selects the route, parses,
 * validates and flattens a JSON or strict IRBF surface result in one call.
 * The values and the server's cell triangles STAY in WebAssembly memory in
 * the returned handle, and `SurfaceAreaMerger.pushArchive` moves them into
 * the merge; this host never holds them as JavaScript numbers.
 *
 * What the host takes out is what it builds public objects from:
 *
 * - the root fields without `surfaces`, as the response's own JSON text,
 *   parsed here with `JSON.parse` exactly as the whole response was before;
 * - each surface's fields without `values` and `cell-tris`, also the
 *   response's own text, so key order, duplicate keys, unknown fields and
 *   every number are what `JSON.parse` gave before;
 * - `cell-area`, rebuilt as the `(number | null)[]` it always was from the
 *   kernel's `f64` cells (NaN is `null`). A JSON number and its kernel
 *   `f64` are the same double: the kernel parses with `float_roundtrip`.
 *
 * This replaces, in this host, `parseResultArchive` + `parseSurfaceRecord`
 * + `surfaceParts` on the merge path: the inflate, the route probe, the
 * `JSON.parse` of the whole document, the per-cell checks and the flatten.
 */
import { requireCore } from "../internal/core.js";
import { RESULT_DECODE_LIMITS } from "../results/router.js";
const ARRAY = 2;
function nullableCells(cells, start, end) {
    // Sized once, every index written: the same elements `JSON.parse` gave,
    // without the slack a growing array keeps for 14.7 M cells at 4 km.
    const out = new Array(end - start);
    for (let at = start; at < end; at += 1) {
        const value = cells[at];
        out[at - start] = Number.isNaN(value) ? null : value;
    }
    return out;
}
/**
 * Decode one archive, or `undefined` when it holds a valid result that is
 * not a surface result (a grid, other JSON, another IRBF family).
 */
export function decodeSurfaceJob(content) {
    const limits = RESULT_DECODE_LIMITS;
    const archive = requireCore().decodeSurfaceArchive(content, BigInt(limits.maxTotalBytes), limits.maxMetadataBytes, BigInt(limits.maxCells), BigInt(limits.maxTriangleValues));
    if (archive.route !== "surface") {
        archive.free();
        return undefined;
    }
    try {
        const root = JSON.parse(archive.takeRootJson());
        const pairs = JSON.parse(archive.takeFieldsJson());
        const cellArea = archive.takeCellArea();
        const offsets = archive.valueOffsets;
        const areaState = archive.cellAreaState;
        const keys = [];
        const fields = [];
        pairs.forEach(([key, value], index) => {
            // The kernel wrote the placeholder `0` at the field's own position;
            // assigning keeps that position.
            if (areaState[index] === ARRAY) {
                value["cell-area"] = nullableCells(cellArea, offsets[index], offsets[index + 1]);
            }
            keys.push(key);
            fields.push(value);
        });
        return { archive, root, keys, fields, cellTrisState: archive.cellTrisState };
    }
    catch (error) {
        archive.free();
        throw error;
    }
}
/**
 * The response as `synthesizeSurfaceTriangles` reads it: the root fields and
 * a `surfaces` map of the host fields. A surface the server drew keeps a
 * non-null `cell-tris` marker, which is all that reader checks
 * (`already_present`); its coordinates stay in the kernel.
 */
export function synthesisView(job) {
    const surfaces = Object.create(null);
    job.keys.forEach((key, index) => {
        const fields = job.fields[index];
        Object.defineProperty(surfaces, key, {
            configurable: true, enumerable: true, writable: true,
            value: job.cellTrisState[index] === ARRAY ? { ...fields, "cell-tris": true } : fields,
        });
    });
    return { ...job.root, surfaces };
}
