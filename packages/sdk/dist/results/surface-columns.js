/**
 * The merged surface result of an area run, as COLUMNS (D197, D198).
 *
 * The kernel joins every job of a facade / surface run in one call
 * (`joinSurfaceJobs`) and this is what it gives back: one typed array per
 * per-surface field, one per per-cell field, and a triangle table. There is
 * no object per surface and no array per cell. Every array owns its whole
 * buffer, so the result can be transferred to another thread as it is, and a
 * renderer can upload `triangles.positions[g]` without a copy.
 *
 * Rows: surface `i` is `ids.slice(idOffsets[i], idOffsets[i + 1])`, its
 * vectors are `origin[3i..3i+3]` (and the axes), and its cells are
 * `values[cellOffsets[i]..cellOffsets[i + 1]]`. Look a surface up by id with
 * {@link surfaceIndex}. Join two results by surface id and cell index, never
 * by row: the row order is the canonical order of the run's entry ids (#579).
 */
/** The public result from the kernel's answer: two JSON texts parsed, nothing copied. */
export function surfaceColumnsFromJoin(joined) {
    return {
        kind: "surface-columns", version: 1,
        surfaceCount: joined.surfaceCount, ids: joined.ids, idOffsets: joined.idOffsets,
        origin: joined.origin, uAxis: joined.uAxis, vAxis: joined.vAxis,
        gridSize: joined.gridSize, nu: joined.nu, nv: joined.nv,
        area: joined.area, mean: joined.mean, peak: joined.peak,
        cellOffsets: joined.cellOffsets, values: joined.values, cellAreaState: joined.cellAreaState,
        ...(joined.cellArea === undefined ? {} : { cellArea: joined.cellArea }),
        ...(joined.extraJson === undefined ? {} : { extra: JSON.parse(joined.extraJson) }),
        ...(joined.triangles === undefined ? {} : { triangles: joined.triangles }),
        aggregates: JSON.parse(joined.aggregatesJson),
        minLegend: joined.minLegend, maxLegend: joined.maxLegend, sensorCount: joined.sensorCount,
        ...(joined.fallbackReasons.length === 0 ? {} : { cellTrisFallback: [...joined.fallbackReasons] }),
    };
}
/** The result of a run with no jobs. */
export function emptySurfaceColumns() {
    const none = new Float64Array(0);
    return {
        kind: "surface-columns", version: 1, surfaceCount: 0, ids: "", idOffsets: Uint32Array.of(0),
        origin: none, uAxis: none.slice(), vAxis: none.slice(), gridSize: none.slice(),
        nu: new Uint32Array(0), nv: new Uint32Array(0),
        area: none.slice(), mean: none.slice(), peak: none.slice(),
        cellOffsets: Uint32Array.of(0), values: none.slice(), cellAreaState: new Uint8Array(0),
        aggregates: {}, minLegend: 0, maxLegend: 0, sensorCount: 0,
    };
}
/** The id of surface `row`. */
export function surfaceId(result, row) {
    return result.ids.slice(result.idOffsets[row], result.idOffsets[row + 1]);
}
const indices = new WeakMap();
/** Surface id → row, built on first use and kept with the result. */
export function surfaceIndex(result) {
    let index = indices.get(result);
    if (index === undefined) {
        const map = new Map();
        for (let row = 0; row < result.surfaceCount; row += 1)
            map.set(surfaceId(result, row), row);
        indices.set(result, map);
        index = map;
    }
    return index;
}
/** True when surface `row` is a wall: its grid normal is at most 30° from horizontal. */
export function isVertical(result, row) {
    const u = 3 * row;
    const normalZ = result.uAxis[u] * result.vAxis[u + 1] - result.uAxis[u + 1] * result.vAxis[u];
    return Math.abs(normalZ) <= 0.5;
}
/**
 * The value of each VERTEX of group `group`'s triangles (three per
 * triangle, aligned with `triangles.positions[group]`): the value of the
 * cell the triangle draws, NaN for a cell without one. One attribute a
 * renderer uploads next to the positions.
 */
export function vertexValues(result, group) {
    const table = result.triangles;
    if (table === undefined)
        throw new Error("this result has no triangles");
    const base = table.groupTriangles[group];
    const out = new Float32Array((table.groupTriangles[group + 1] - base) * 3);
    const first = result.cellOffsets[table.groupSurfaces[group]];
    const last = result.cellOffsets[table.groupSurfaces[group + 1]];
    for (let cell = first; cell < last; cell += 1) {
        const start = table.cellOffsets[cell], end = table.cellOffsets[cell + 1];
        if (end > start)
            out.fill(result.values[cell], (start - base) * 3, (end - base) * 3);
    }
    return out;
}
