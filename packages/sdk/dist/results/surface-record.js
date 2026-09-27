import { rejectRetiredResultFields } from "./retired.js";
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function ownValue(value, key) {
    return hasOwn(value, key) ? value[key] : undefined;
}
function emptyMap() {
    return Object.create(null);
}
function setOwn(target, key, value) {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}
function record(value, name) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`${name} must be an object`);
    }
    return value;
}
function finite(value, name) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(`${name} must be a finite number`);
    }
    return value;
}
function count(value, name) {
    const result = finite(value, name);
    if (!Number.isSafeInteger(result) || result < 0 || result > 0xffff_ffff) {
        throw new TypeError(`${name} must be an unsigned 32-bit integer`);
    }
    return result;
}
function vector(value, name) {
    if (!Array.isArray(value) || value.length !== 3) {
        throw new TypeError(`${name} must be a finite three-component vector`);
    }
    value.forEach((component, index) => finite(component, `${name}[${index}]`));
}
function validateNullableNumbers(value, expected, name) {
    if (!Array.isArray(value) || value.length !== expected) {
        throw new TypeError(`${name} must contain exactly ${expected} cells`);
    }
    value.forEach((item, index) => {
        if (item !== null)
            finite(item, `${name}[${index}]`);
    });
}
function validateCellTriangles(value, expected, name) {
    if (value === undefined || value === null)
        return;
    if (!Array.isArray(value) || value.length !== expected) {
        throw new TypeError(`${name} must contain exactly ${expected} cells`);
    }
    value.forEach((cell, cellIndex) => {
        if (cell === null)
            return;
        if (!Array.isArray(cell) || cell.length % 9 !== 0) {
            throw new TypeError(`${name}[${cellIndex}] must contain complete triangles`);
        }
        cell.forEach((item, index) => finite(item, `${name}[${cellIndex}][${index}]`));
    });
}
function validateEntry(entry, key, trustedBulk = false) {
    vector(ownValue(entry, "origin"), `surface ${key} origin`);
    vector(ownValue(entry, "u-axis"), `surface ${key} u-axis`);
    vector(ownValue(entry, "v-axis"), `surface ${key} v-axis`);
    const gridSize = finite(ownValue(entry, "grid-size"), `surface ${key} grid-size`);
    if (gridSize <= 0)
        throw new TypeError(`surface ${key} grid-size must be positive`);
    const nu = count(ownValue(entry, "nu"), `surface ${key} nu`);
    const nv = count(ownValue(entry, "nv"), `surface ${key} nv`);
    const expected = nu * nv;
    if (!Number.isSafeInteger(expected)) {
        throw new TypeError(`surface ${key} cell count is not representable`);
    }
    finite(ownValue(entry, "area"), `surface ${key} area`);
    finite(ownValue(entry, "mean"), `surface ${key} mean`);
    finite(ownValue(entry, "peak"), `surface ${key} peak`);
    const values = ownValue(entry, "values");
    if (trustedBulk) {
        if (!Array.isArray(values) || values.length !== expected) {
            throw new TypeError(`surface ${key} values must contain exactly ${expected} cells`);
        }
    }
    else if (values instanceof Float64Array) {
        if (values.length !== expected) {
            throw new TypeError(`surface ${key} values must contain exactly ${expected} cells`);
        }
        values.forEach((item, index) => {
            if (!Number.isFinite(item) && !Number.isNaN(item)) {
                throw new TypeError(`surface ${key} values[${index}] must be finite or masked`);
            }
        });
    }
    else {
        validateNullableNumbers(values, expected, `surface ${key} values`);
    }
    const cellArea = ownValue(entry, "cell-area");
    if (cellArea !== undefined && cellArea !== null) {
        if (trustedBulk) {
            if (!Array.isArray(cellArea) || cellArea.length !== expected) {
                throw new TypeError(`surface ${key} cell-area must contain exactly ${expected} cells`);
            }
        }
        else
            validateNullableNumbers(cellArea, expected, `surface ${key} cell-area`);
    }
    const cellTriangles = ownValue(entry, "cell-tris");
    if (trustedBulk) {
        if (cellTriangles !== undefined && cellTriangles !== null
            && (!Array.isArray(cellTriangles) || cellTriangles.length !== expected)) {
            throw new TypeError(`surface ${key} cell-tris must contain exactly ${expected} cells`);
        }
    }
    else
        validateCellTriangles(cellTriangles, expected, `surface ${key} cell-tris`);
    return entry;
}
function parseRecord(rawValue, options, trustedBulk) {
    const raw = record(rawValue, "surface result");
    if (!trustedBulk)
        rejectRetiredResultFields(raw);
    const rawSurfaces = record(ownValue(raw, "surfaces"), "surface result surfaces");
    const surfaces = emptyMap();
    for (const [key, value] of Object.entries(rawSurfaces)) {
        setOwn(surfaces, key, validateEntry(record(value, `surface ${key}`), key, trustedBulk));
    }
    const complete = Object.values(surfaces).every((entry) => entry["cell-tris"] !== undefined && entry["cell-tris"] !== null);
    if (options.requireCellGeometry === true && !complete) {
        throw new Error("surface cell geometry was omitted and no synthesis inputs were provided");
    }
    return {
        route: "surface",
        value: { ...raw, surfaces },
        cellGeometry: complete ? "complete" : "omitted",
    };
}
/** Parse and fully validate an ordinary JSON surface record. */
export function parseSurfaceRecord(rawValue, options = {}) {
    return parseRecord(rawValue, options, false);
}
/** Project bulk arrays that the strict IRBF decoder already validated. */
export function parseValidatedIrBfSurfaceRecord(rawValue, options = {}) {
    return parseRecord(rawValue, options, true);
}
