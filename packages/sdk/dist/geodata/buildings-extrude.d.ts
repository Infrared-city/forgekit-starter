import type { Bbox } from "./http.js";
/**
 * Assign and extrude ONE rectangle's footprints, and decode the answer once.
 *
 * `buildingsAssignAndExtrudeBytes` is the wasm-idiom form of the operation
 * the Python binding already has: the same kernel call, the same argument
 * order, with each document crossing as a `Uint8Array` instead of a JS string
 * (WP14-D). The extrusion of a 5 km2 site is the largest document on this
 * leg — tens of thousands of bodies — and the string form makes wasm-bindgen
 * build a JS string of the whole thing before anything reads it, on the
 * caller's thread, in a browser or Worker. The parity gate folds the twin
 * onto its stem, so both bindings still ship the operation.
 *
 * The kernel keys its answer by RECTANGLE id, and this leg always passes one
 * rectangle, so the single entry is read back here.
 */
export declare function extrudeRectangle(collectionJson: string, source: string, id: string, rectangle: Bbox, defaultHeightM: number): Record<string, Record<string, unknown>>;
/**
 * Extrude the site's compose PIECES and put them all in the site frame.
 *
 * One kernel call takes the whole piece list, because the operation is keyed
 * by rectangle and normalises the collection once whatever the list holds. A
 * piece that IS the site rectangle needs no re-anchor and gets none — that is
 * the compact-site path, unchanged. Every other piece is framed at its own
 * south-west corner by the kernel and moved into the site frame with the exact
 * affine, which is the same discipline {@link perRectangleArea} applies.
 *
 * The pieces are disjoint, but a footprint whose envelope meets two of them is
 * assigned to both — the kernel's rule is the envelope, not the centroid — so
 * the FIRST piece in decomposition order keeps it.
 */
export declare function extrudePieces(collectionJson: string, source: string, site: Bbox, rectangles: readonly Bbox[], defaultHeightM: number): Record<string, Record<string, unknown>>;
