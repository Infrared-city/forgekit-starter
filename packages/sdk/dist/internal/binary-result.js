import { requireCore } from "./core.js";
const F16_EXPONENT_SCALE = Array.from({ length: 31 }, (_, exponent) => 2 ** (exponent - 25));
/** Decode one IRBF result to the SDK's existing object and surface shapes. */
export function decodeBinaryResult(document, limits) {
    checkLimits(limits);
    return projectDecoded(callCore("decodeBinaryResult", document, limits)).value;
}
export function decodeBinaryResultDocument(document, limits) {
    checkLimits(limits);
    const source = typeof SharedArrayBuffer !== "undefined"
        && document.buffer instanceof SharedArrayBuffer ? document.slice() : document;
    const inspected = callCore("inspectBinaryResult", source, limits);
    const decoded = { ...inspected, sections: inspected.sections.map((section) => {
            const [offset, length] = section.byteRange;
            return { ...section, bytes: source.subarray(offset, offset + length) };
        }) };
    return projectDecoded(decoded);
}
/** Decode a validated IRBF grid without creating nested public result arrays. */
export function decodeCompactGridDocument(document, limits) {
    checkLimits(limits);
    const source = typeof SharedArrayBuffer !== "undefined"
        && document.buffer instanceof SharedArrayBuffer ? document.slice() : document;
    const decoded = callCore("inspectBinaryResult", source, limits);
    if (decoded.family !== "numeric-grid" && decoded.family !== "categorical-grid")
        return undefined;
    const metadata = object(JSON.parse(decoded.metadataJson), "binary result metadata");
    const sections = new Map(decoded.sections.map((section) => {
        const [offset, length] = section.byteRange;
        return [section.role, { ...section, bytes: source.subarray(offset, offset + length) }];
    }));
    const data = requireSection(sections, 1), validity = requireSection(sections, 2);
    const shape = metadata.shape;
    if (!Array.isArray(shape) || shape.length !== 2)
        throw new TypeError("grid shape is invalid");
    const rows = shape[0], columns = shape[1];
    if (!Number.isSafeInteger(rows) || !Number.isSafeInteger(columns)) {
        throw new TypeError("grid shape is invalid");
    }
    const bits = validity.bytes.slice();
    if (decoded.family === "categorical-grid") {
        if (data.dtype !== "u32")
            throw new TypeError("categorical grid data must use u32 codes");
        const raw = metadata.dictionary;
        if (!Array.isArray(raw) || raw.some((item) => typeof item !== "string")) {
            throw new TypeError("categorical dictionary is missing");
        }
        return { route: "compact-grid", kind: "categorical", shape: [rows, columns],
            values: typed(data).slice(), validity: bits,
            dictionary: Object.freeze(Array.from(raw)) };
    }
    if (data.dtype === "f64") {
        return { route: "compact-grid", kind: "numeric", shape: [rows, columns],
            values: typed(data).slice(), validity: bits };
    }
    const sourceValues = numericSource(data), divisor = valueDivisor(metadata, data);
    const values = new Float32Array(Number(data.elementCount));
    for (let index = 0; index < values.length; index += 1) {
        values[index] = sourceValues.at(index) / divisor;
    }
    return { route: "compact-grid", kind: "numeric", shape: [rows, columns],
        values, validity: bits };
}
function callCore(method, document, limits) {
    return requireCore()[method](document, BigInt(limits.maxTotalBytes), limits.maxMetadataBytes, 64, BigInt(Math.max(limits.maxCells + 1, limits.maxTriangleValues)), 32, BigInt(limits.maxCells), BigInt(limits.maxTriangleValues));
}
function projectDecoded(decoded) {
    const metadata = object(JSON.parse(decoded.metadataJson), "binary result metadata");
    const sections = new Map(decoded.sections.map((section) => [section.role, section]));
    if (decoded.family === "surfaces")
        return { family: decoded.family,
            value: surfaces(metadata, sections) };
    const data = requireSection(sections, 1), validity = requireSection(sections, 2);
    const dataValues = numericSource(data);
    let dictionary;
    if (decoded.family === "categorical-grid") {
        dictionary = metadata.dictionary;
        if (!Array.isArray(dictionary))
            throw new TypeError("categorical dictionary is missing");
    }
    const attributes = { ...object(metadata.attributes ?? {}, "result attributes") };
    projectArrays(attributes, metadata.arrays, sections);
    if (decoded.family === "vector")
        return { family: decoded.family, value: { ...attributes,
                output: materializeRange(dataValues, validity, 0, Number(data.elementCount), dictionary, valueDivisor(metadata, data)) } };
    const shape = metadata.shape;
    if (!Array.isArray(shape) || shape.length !== 2)
        throw new TypeError("grid shape is invalid");
    const rows = shape[0], columns = shape[1], matrix = [];
    for (let row = 0; row < rows; row += 1) {
        matrix.push(materializeRange(dataValues, validity, row * columns, (row + 1) * columns, dictionary, valueDivisor(metadata, data)));
    }
    return { family: decoded.family,
        value: metadata.root === "array" ? matrix : { ...attributes, output: matrix } };
}
function checkLimits(limits) {
    for (const [name, value] of Object.entries(limits))
        checkLimit(value, name);
}
function projectArrays(target, raw, sections) {
    if (raw === undefined)
        return;
    if (!Array.isArray(raw))
        throw new TypeError("binary result arrays must be an array");
    for (const candidate of raw) {
        const descriptor = object(candidate, "binary result array descriptor");
        const path = descriptor.path, shape = descriptor.shape;
        const data = requireSection(sections, descriptor.dataRole);
        const validity = descriptor.validityRole;
        const value = materializeShape(numericSource(data), validity === undefined ? undefined : requireSection(sections, validity), shape, valueDivisor(descriptor, data));
        let owner = target;
        for (const key of path.slice(0, -1)) {
            const child = Object.hasOwn(owner, key) ? owner[key] : undefined;
            if (child === undefined)
                defineOwn(owner, key, {});
            else if (child === null || typeof child !== "object" || Array.isArray(child)) {
                throw new Error("binary result auxiliary path collides with metadata");
            }
            owner = owner[key];
        }
        defineOwn(owner, path[path.length - 1], value);
    }
}
function materializeShape(values, validity, shape, divisor) {
    let cursor = 0;
    const visit = (depth) => {
        if (depth === shape.length) {
            const index = cursor++;
            return validity !== undefined && !validAt(validity, index) ? null : values.at(index) / divisor;
        }
        const output = new Array(shape[depth]);
        for (let index = 0; index < output.length; index += 1)
            output[index] = visit(depth + 1);
        return output;
    };
    return visit(0);
}
function surfaces(metadata, sections) {
    if (!Array.isArray(metadata.frames))
        throw new TypeError("surface frames are missing");
    const values = requireSection(sections, 1), valueValidity = requireSection(sections, 2);
    const valueSource = numericSource(values);
    const areas = sections.get(3), areaValidity = sections.get(4);
    const offsets = sections.get(5);
    const triangles = sections.has(6) ? typed(requireSection(sections, 6)) : undefined;
    const triangleBits = sections.get(7);
    const output = Object.create(null);
    for (const raw of metadata.frames) {
        const frame = object(raw, "surface frame"), shape = frame.shape;
        if (!Array.isArray(shape) || shape.length !== 2)
            throw new TypeError("surface shape is invalid");
        const start = frame.start, end = start + shape[0] * shape[1];
        const attributes = object(frame.attributes ?? {}, "surface attributes");
        const item = { ...attributes, nu: shape[0], nv: shape[1],
            values: materializeRange(valueSource, valueValidity, start, end, undefined, valueDivisor(metadata, values)) };
        if (frame.hasCellArea === true && areas !== undefined && areaValidity !== undefined) {
            item["cell-area"] = materializeRange(numericSource(areas), areaValidity, start, end);
        }
        if (frame.hasCellTris === true && offsets !== undefined && triangles !== undefined) {
            const cells = new Array(end - start);
            for (let cell = start; cell < end; cell += 1) {
                if (triangleBits !== undefined && !validAt(triangleBits, cell)) {
                    cells[cell - start] = null;
                    continue;
                }
                const first = u64OffsetAt(offsets, cell), last = u64OffsetAt(offsets, cell + 1);
                const coordinates = new Array(last - first);
                for (let index = first; index < last; index += 1) {
                    coordinates[index - first] = triangles[index];
                }
                cells[cell - start] = coordinates;
            }
            item["cell-tris"] = cells;
        }
        output[String(frame.id)] = item;
    }
    const attributes = object(metadata.attributes ?? {}, "surface root attributes");
    return { ...attributes, surfaces: output };
}
function materializeRange(values, validity, start, end, dictionary, divisor = 1) {
    const output = new Array(end - start);
    for (let index = start; index < end; index += 1) {
        const value = values.at(index);
        output[index - start] = !validAt(validity, index) ? null
            : dictionary === undefined ? value / divisor : dictionary[value];
    }
    return output;
}
function typed(section) {
    if (section.dtype === "u8")
        return section.bytes;
    if (section.dtype === "f16")
        throw new TypeError("f16 requires scalar projection");
    const definitions = { u32: [Uint32Array, 4], i16: [Int16Array, 2], i32: [Int32Array, 4], f32: [Float32Array, 4],
        f64: [Float64Array, 8], u64: [BigUint64Array, 8] };
    const definition = definitions[section.dtype];
    if (definition === undefined)
        throw new TypeError(`unsupported result dtype ${section.dtype}`);
    const [Constructor, width] = definition;
    if (section.bytes.buffer instanceof ArrayBuffer && section.bytes.byteOffset % width === 0) {
        return new Constructor(section.bytes.buffer, section.bytes.byteOffset, section.bytes.byteLength / width);
    }
    const copy = new Uint8Array(section.bytes.length);
    copy.set(section.bytes);
    return new Constructor(copy.buffer, 0, copy.byteLength / width);
}
function numericSource(section) {
    if (section.dtype === "u64")
        throw new TypeError("u64 is not a scalar result value dtype");
    if (section.dtype === "f16") {
        const view = new DataView(section.bytes.buffer, section.bytes.byteOffset, section.bytes.byteLength);
        return { at: (index) => decodeF16(view.getUint16(index * 2, true)) };
    }
    const values = typed(section);
    return { at: (index) => values[index] };
}
function valueDivisor(owner, data) {
    const raw = owner.valueDivisor;
    if (raw === undefined || raw === null)
        return 1;
    if (data.dtype !== "i16" || !Number.isSafeInteger(raw) || raw < 1
        || raw > 1_000_000)
        throw new TypeError("valueDivisor requires i16 data and a uint value from 1 through 1000000");
    return raw;
}
function decodeF16(bits) {
    const sign = bits & 0x8000 ? -1 : 1;
    const exponent = (bits >>> 10) & 0x1f, fraction = bits & 0x3ff;
    return exponent === 0 ? sign * fraction * F16_EXPONENT_SCALE[1]
        : exponent === 31 ? (fraction === 0 ? sign * Infinity : NaN)
            : sign * (fraction + 1024) * F16_EXPONENT_SCALE[exponent];
}
function validAt(section, index) {
    return (section.bytes[index >> 3] & (1 << (index & 7))) !== 0;
}
function u64OffsetAt(section, index) {
    if (section.dtype !== "u64")
        throw new TypeError("triangle offsets must use u64");
    const position = index * 8;
    const view = new DataView(section.bytes.buffer, section.bytes.byteOffset, section.bytes.byteLength);
    if (view.getUint32(position + 4, true) !== 0) {
        throw new RangeError("triangle offset exceeds the supported uint32 range");
    }
    return view.getUint32(position, true);
}
function defineOwn(owner, key, value) {
    Object.defineProperty(owner, key, { value, enumerable: true, configurable: true, writable: true });
}
function requireSection(sections, role) { const value = sections.get(role); if (value === undefined)
    throw new Error(`binary result omitted role ${role}`); return value; }
function object(value, name) { if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(`${name} must be an object`); return value; }
function checkLimit(value, name) { if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff)
    throw new RangeError(`${name} must be a non-negative uint32 integer`); }
