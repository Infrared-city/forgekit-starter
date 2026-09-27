const ZERO_ANCHOR = [0, 0];
function cellTriangles(entry) {
    if (!entry.hasCellTris)
        return undefined;
    if (entry.triangleOffsets.length !== entry.triangleMask.length + 1
        || entry.triangleOffsets[0] !== 0
        || entry.triangleOffsets.at(-1) !== entry.triangleValues.length) {
        throw new Error(`surface merge returned invalid triangle offsets for ${entry.key}`);
    }
    const cells = [];
    const [anchorX, anchorY] = entry.triangleAnchor ?? ZERO_ANCHOR;
    for (let index = 0; index < entry.triangleMask.length; index += 1) {
        const start = entry.triangleOffsets[index];
        const end = entry.triangleOffsets[index + 1];
        if (start > end || end > entry.triangleValues.length || (end - start) % 9 !== 0) {
            throw new Error(`surface merge returned invalid triangles for ${entry.key}`);
        }
        if (entry.triangleMask[index] === 0) {
            cells.push(null);
            continue;
        }
        const coordinates = new Array(end - start);
        if (anchorX === 0 && anchorY === 0) {
            // Untranslated, and the copy stays EXACT: `-0 + 0` is `+0`, and a
            // coordinate's signed zero is part of the public array's contract.
            for (let at = start; at < end; at += 1)
                coordinates[at - start] = entry.triangleValues[at];
        }
        else {
            for (let at = start; at < end; at += 1) {
                const axis = (at - start) % 3;
                coordinates[at - start] = entry.triangleValues[at]
                    + (axis === 0 ? anchorX : axis === 1 ? anchorY : 0);
            }
        }
        cells.push(coordinates);
    }
    return cells;
}
/**
 * Cut the merge columns into one entry per surface, the view
 * `surfaceAnalysisFromMergeView` reads. Each entry OWNS its buffers
 * (`slice`, not `subarray`): a caller that keeps one surface must not keep
 * the whole area's values alive (`docs/sdk-data-flow.md`, bulk-data rule 5).
 * The entries are the ones the per-surface kernel `finish` built, buffer
 * for buffer; a surface without triangles shares the three empty arrays.
 */
export function mergeViewFromColumns(columns) {
    const { ids, idOffsets, values, valueOffsets, hasCellTris } = columns;
    const noValues = new Float64Array(0), noOffsets = new Uint32Array(0), noMask = new Uint8Array(0);
    const entries = [];
    for (let index = 0; index + 1 < valueOffsets.length; index += 1) {
        const start = valueOffsets[index], end = valueOffsets[index + 1];
        const key = ids.slice(idOffsets[index], idOffsets[index + 1]);
        if (hasCellTris[index] !== 1) {
            entries.push({ key, values: values.slice(start, end), triangleValues: noValues,
                triangleOffsets: noOffsets, triangleMask: noMask, hasCellTris: false });
            continue;
        }
        const base = columns.triangleOffsets[start];
        const triangleOffsets = new Uint32Array(end - start + 1);
        for (let at = start; at <= end; at += 1) {
            triangleOffsets[at - start] = columns.triangleOffsets[at] - base;
        }
        entries.push({ key, values: values.slice(start, end),
            triangleValues: columns.triangleValues.slice(base, columns.triangleOffsets[end]),
            triangleOffsets, triangleMask: columns.triangleMask.slice(start, end), hasCellTris: true });
    }
    return { metadataJson: columns.metadataJson, entries };
}
function record(value, name) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`${name} must be an object`);
    }
    return value;
}
function number(value, name) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(`${name} must be a finite number`);
    }
    return value;
}
function vector(value, name) {
    if (!Array.isArray(value) || !value.every((item) => typeof item === "number")) {
        throw new TypeError(`${name} must be a number array`);
    }
    return value;
}
/**
 * Convert the kernel merge view to the legacy camel-case public contract.
 *
 * `hostFields`, when given, holds each surface's decoded fields as the host
 * parsed them; the kernel's own per-surface fields (the re-anchored `origin`)
 * are written over them, in place, so the field order is the response's.
 * Without it the kernel metadata carries every field, as before.
 */
export function surfaceAnalysisFromMergeView(view, hostFields) {
    const raw = record(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(view.metadataJson)), "surface merge metadata");
    const rawSurfaces = record(raw.surfaces, "surface merge surfaces");
    const entryMap = new Map(view.entries.map((entry) => [entry.key, entry]));
    const surfaces = Object.create(null);
    for (const [key, value] of Object.entries(rawSurfaces)) {
        const kernelFields = record(value, `surface ${key}`);
        const host = hostFields?.get(key);
        if (hostFields !== undefined && host === undefined)
            throw new Error(`surface merge returned unknown surface ${key}`);
        const fields = host === undefined ? kernelFields : { ...host, ...kernelFields };
        const entry = entryMap.get(key);
        if (entry === undefined)
            throw new Error(`surface merge omitted values for ${key}`);
        const cellArea = fields["cell-area"];
        const cellTris = cellTriangles(entry);
        surfaces[key] = {
            ...fields,
            origin: vector(fields.origin, `surface ${key} origin`),
            uAxis: vector(fields["u-axis"], `surface ${key} u-axis`),
            vAxis: vector(fields["v-axis"], `surface ${key} v-axis`),
            gridSize: number(fields["grid-size"], `surface ${key} grid-size`),
            nu: number(fields.nu, `surface ${key} nu`),
            nv: number(fields.nv, `surface ${key} nv`),
            values: entry.values,
            area: number(fields.area, `surface ${key} area`),
            mean: number(fields.mean, `surface ${key} mean`),
            peak: number(fields.peak, `surface ${key} peak`),
            ...(Array.isArray(cellArea) ? { cellArea: cellArea } : {}),
            ...(cellTris === undefined ? {} : { cellTris }),
        };
        entryMap.delete(key);
    }
    if (entryMap.size !== 0)
        throw new Error("surface merge returned unknown value buffers");
    return {
        surfaces,
        aggregates: record(raw.aggregates, "surface merge aggregates"),
        minLegend: number(raw["min-legend"], "surface merge min-legend"),
        maxLegend: number(raw["max-legend"], "surface merge max-legend"),
        sensorCount: number(raw["sensor-count"], "surface merge sensor-count"),
    };
}
export function hasCellGeometry(surface) {
    return surface.cellTris !== undefined;
}
export function isVertical(surface) {
    const normalZ = surface.uAxis[0] * surface.vAxis[1]
        - surface.uAxis[1] * surface.vAxis[0];
    return Math.abs(normalZ) <= 0.5;
}
export function surfaceTriangles(surface) {
    if (surface.cellTris === undefined) {
        throw new Error("cell-tris was not emitted for this surface");
    }
    return iterTriangles(surface.cellTris, surface.values);
}
function* iterTriangles(cells, values) {
    for (let cell = 0; cell < cells.length; cell += 1) {
        const coordinates = cells[cell];
        if (coordinates === null || coordinates === undefined)
            continue;
        const rawValue = values[cell];
        const value = rawValue === undefined || Number.isNaN(rawValue) ? null : rawValue;
        for (let at = 0; at + 8 < coordinates.length; at += 9) {
            yield {
                value,
                vertices: [
                    [coordinates[at], coordinates[at + 1], coordinates[at + 2]],
                    [coordinates[at + 3], coordinates[at + 4], coordinates[at + 5]],
                    [coordinates[at + 6], coordinates[at + 7], coordinates[at + 8]],
                ],
            };
        }
    }
}
