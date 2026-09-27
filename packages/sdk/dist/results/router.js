import { rejectRetiredResultFields } from "./retired.js";
import { decodeBinaryResultDocument } from "../internal/binary-result.js";
import { requireCore } from "../internal/core.js";
import { decompressResultArchive } from "./archive.js";
import { parseSurfaceRecord, parseValidatedIrBfSurfaceRecord } from "./surface-record.js";
const IRBF_MAGIC = [73, 82, 66, 70, 13, 10, 26, 10];
/** The strict IRBF result limits every result decode in this package applies. */
export const RESULT_DECODE_LIMITS = {
    maxTotalBytes: 268_435_456, maxMetadataBytes: 4_194_304,
    maxCells: 16_777_216, maxTriangleValues: 67_108_864,
};
function parseJson(document) {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document));
}
function requireFiniteNumbers(value) {
    const pending = [value];
    while (pending.length > 0) {
        const item = pending.pop();
        if (typeof item === "number" && !Number.isFinite(item))
            throw new Error("JSON result contains a non-finite number");
        if (Array.isArray(item))
            for (const child of item)
                pending.push(child);
        else if (item !== null && typeof item === "object")
            for (const child of Object.values(item))
                pending.push(child);
    }
}
function isSurfaceResult(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)
        || !Object.prototype.hasOwnProperty.call(value, "surfaces"))
        return false;
    const surfaces = value.surfaces;
    return surfaces !== null && typeof surfaces === "object" && !Array.isArray(surfaces);
}
function jsonRoute(document, options) {
    const decoded = requireCore().decodeGridDocument(document, options.expectedGridKind);
    let route = "";
    let finiteNumbersValidated = false;
    try {
        route = decoded.route;
        finiteNumbersValidated = decoded.finiteNumbersValidated === true;
    }
    finally {
        decoded.free();
    }
    const value = parseJson(document);
    rejectRetiredResultFields(value);
    if (route === "json-grid" && !finiteNumbersValidated)
        requireFiniteNumbers(value);
    if (route !== "json-grid" && isSurfaceResult(value)) {
        return options.surface === undefined ? parseSurfaceRecord(value) : parseSurfaceRecord(value, options.surface);
    }
    return { route: "json", value };
}
/** Route one already decompressed JSON or strict IRBF document. */
export function parseResultDocument(document, options = {}) {
    const irbf = document.length >= IRBF_MAGIC.length
        && IRBF_MAGIC.every((value, index) => document[index] === value);
    if (!irbf)
        return jsonRoute(document, options);
    const decoded = decodeBinaryResultDocument(document, RESULT_DECODE_LIMITS);
    if (decoded.family === "surfaces") {
        return options.surface === undefined
            ? parseValidatedIrBfSurfaceRecord(decoded.value)
            : parseValidatedIrBfSurfaceRecord(decoded.value, options.surface);
    }
    const kind = decoded.family === "categorical-grid" ? "categorical"
        : decoded.family === "numeric-grid" ? "numeric" : undefined;
    if (options.expectedGridKind !== undefined && kind !== undefined && options.expectedGridKind !== kind) {
        throw new TypeError(`result grid kind is ${kind}, expected ${options.expectedGridKind}`);
    }
    return { route: "json", value: decoded.value };
}
/** Decompress one supported JSON or strict IRBF result. */
export function parseResultArchive(content, options = {}) {
    return parseResultDocument(decompressResultArchive(content, options.archive), options);
}
