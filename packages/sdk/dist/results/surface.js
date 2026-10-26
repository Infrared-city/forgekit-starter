import { parseSurfaceRecord } from "./surface-record.js";
/**
 * Parses and validates one JSON surface result.
 *
 * @param document - The UTF-8 JSON bytes of the result.
 * @param options - Surface parse options.
 * @returns The validated result with `route: "surface"`.
 * @throws {TypeError} When the document does not have the shape of a surface result.
 * @throws {Error} When `requireCellGeometry` is set and cell geometry is omitted.
 * @category Results and legend
 */
export function parseSurfaceResult(document, options = {}) {
    const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document));
    return parseSurfaceRecord(raw, options);
}
