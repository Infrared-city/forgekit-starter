import type { FeatureBox, OvertureRow } from "./overture-rows.js";
import type { RawGeometry } from "./overture-parquet.js";
/**
 * The row filter of the Overture reader: decoded rows in, kept features out.
 *
 * Split out of `overture-rows.ts` (400-line rule). It decides nothing about
 * which bytes are fetched; the caller passes the tile-membership bytes
 * (`boxesMeet`) and this keeps the rows they select.
 */
/**
 * Overture publishes land_cover at several cartographic generalisation
 * bands. Only the finest (max_zoom >= 8) is real ground cover; the coarse
 * band's polygons can span a whole city.
 *
 * The kernel composer drops the coarse band, which is the contract. This
 * reader drops it too, AFTER decoding the row — an optimisation that keeps
 * continent-sized polygons out of the text handed across the WASM boundary,
 * not a second source of truth. (The Python service pushes the same test
 * into the parquet filter, before transfer; `hyparquet` has no predicate
 * pushdown, so here it is post-decode.)
 */
export declare const LAND_COVER_MIN_MAX_ZOOM = 8;
/**
 * True for a positively identified coarse land_cover band (fail-open).
 *
 * NOT the authority: the kernel re-applies this rule (`ir-geodata`
 * `ground/classify.rs::LAND_COVER_MIN_MAX_ZOOM`, `ground/mod.rs`). This copy
 * only drops rows before they cross into WASM, so a threshold change is made
 * in the kernel first and mirrored here.
 */
export declare function isGeneralizedLandCover(properties: Record<string, unknown>): boolean;
/** The rows of one row group whose `meets` byte is 1, as the caller wants them. */
export declare function keepRows<T>(rows: ReadonlyArray<Record<string, unknown>>, boxes: ReadonlyArray<FeatureBox | undefined>, meets: Uint8Array, collection: string, raw: RawGeometry | undefined, map: (row: OvertureRow) => T): T[];
