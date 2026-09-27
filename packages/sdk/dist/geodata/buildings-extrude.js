import { reanchorEntries } from "../area/reanchor.js";
import { requireCore } from "../internal/core.js";
import { decompose, namePieces } from "./site-chunks.js";
/**
 * The EXTRUSION half of the site buildings leg: rectangles in, dotbim bodies
 * in the site frame out.
 *
 * Split out of `buildings-area.ts` for the 400-line file cap. Nothing here
 * reads: the collection arrives as text and the only I/O-free decisions left
 * are which rectangles the kernel is asked about and which frame the answer
 * is put in.
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();
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
export function extrudeRectangle(collectionJson, source, id, rectangle, defaultHeightM) {
    return extrudeAll(collectionJson, source, [{ id, bbox: rectangle }], defaultHeightM)[id] ?? {};
}
/** The same call over a LIST of rectangles, answered by rectangle id. */
function extrudeAll(collectionJson, source, rectangles, defaultHeightM) {
    const tiles = JSON.stringify(rectangles.map(({ id, bbox }) => ({
        id,
        bbox: [bbox.west, bbox.south, bbox.east, bbox.north],
    })));
    const document = requireCore().buildingsAssignAndExtrudeBytes(encoder.encode(collectionJson), source, encoder.encode(tiles), defaultHeightM);
    return JSON.parse(decoder.decode(document));
}
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
export function extrudePieces(collectionJson, source, site, rectangles, defaultHeightM) {
    const pieces = decompose(site, rectangles.length > 0 ? rectangles : [site]);
    // The site rectangle is the union of the tile rectangles, so at least one of
    // them meets it with area. An empty list is a defect in the decomposition,
    // not a site shape, and extruding nothing would answer with an empty city.
    if (pieces.length === 0)
        throw new Error("no site piece meets any tile rectangle");
    if (pieces.length === 1) {
        return extrudeRectangle(collectionJson, source, "site", pieces[0], defaultHeightM);
    }
    // ONE piece-id namer for the package (`site-chunks.ts`): the ground leg names
    // a chunk's pieces and this one names the SITE's, and two spellings of one
    // format is two formats.
    const named = namePieces("site", pieces);
    const answer = extrudeAll(collectionJson, source, named, defaultHeightM);
    const buildings = {};
    for (const piece of named) {
        const bodies = answer[piece.id] ?? {};
        if (Object.keys(bodies).length === 0)
            continue;
        const moved = reanchorEntries(bodies, { lon: piece.bbox.west, lat: piece.bbox.south }, { lon: site.west, lat: site.south });
        for (const [key, body] of Object.entries(moved)) {
            if (!Object.hasOwn(buildings, key)) {
                buildings[key] = body;
            }
        }
    }
    return buildings;
}
