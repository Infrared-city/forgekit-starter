import { type ReadFgbOptions } from "./fgb.js";
import { type ReadOvertureOptions } from "./overture.js";
import type { Bbox } from "./http.js";
/**
 * Direct ground-material acquisition — the client-side twin of
 * `GET /utils/ground-material/collect?source=fgb`.
 *
 * The host fetches two things: OSM road centrelines from the world
 * FlatGeobuf and the Overture base themes from the public parquet bucket.
 * Everything that decides a material — the half-width table, the buffering,
 * the land_cover / land_use tables, the carve — is one kernel call, so the
 * layers match the service's.
 */
/** OSM road centrelines with a surface tag, on the public R2 mirror. */
export declare const ROADS_URL = "https://geo.infrared.city/roads-surface-world.fgb";
/** Overture base themes the composer reads. */
export declare const GROUND_COLLECTIONS: readonly string[];
/** Material name to GeoJSON feature collection, in canonical z order. */
export type GroundLayers = Record<string, {
    type: string;
    features: unknown[];
}>;
export interface AcquireGroundOptions extends ReadFgbOptions, ReadOvertureOptions, ComposeFrame {
}
/**
 * Normalise road FlatGeobuf features to the composer's input shape.
 *
 * A thin wrapper over the shared kernel operation `roadsNormalize`, kept as
 * a public export for callers that hold feature OBJECTS. The acquisition
 * chain does not use it: it hands the kernel the FlatGeobuf TEXT, because
 * rebuilding every road as host objects between two kernel calls is what
 * bulk-data rule 1 forbids.
 *
 * The rules are the kernel's, not this host's, and stay bug-for-bug with
 * the deleted service per the D39 ruling: the id comes from `@id` only, and
 * `surface`/`lanes` are read from the feature's own properties, where the
 * world file does not put them (they live in the `other_tags` HSTORE), so
 * every road composes as asphalt. Both are DATA findings recorded in D39.
 */
export declare function roadsToIrFeatures(features: ReadonlyArray<Record<string, unknown>>): Array<Record<string, unknown>>;
export interface DirectGroundResult {
    readonly layers: GroundLayers;
    /** Features across every composed layer. */
    readonly featureCount: number;
    /** Overture release the base themes came from, for reproducibility. */
    readonly overtureRelease: string;
}
export interface AcquireGroundJson {
    /** The composed `{material: FeatureCollection}` document, as text. */
    readonly json: string;
    readonly overtureRelease: string;
}
export interface ComposeFrame {
    /**
     * The AOI-level frame origin: the tiling polygon's south-west corner, the
     * SAME for every tile of one area.
     *
     * The service buffers roads in the UTM zone of the request bbox, so one
     * OSM way fetched by two overlapping tiles buffers to identical polygons
     * and the duplicate is removed downstream by canonical geometry. A
     * per-tile origin gives two slightly different vertex sets for one way, so
     * every duplicate survives every overlap. One origin per area is what
     * keeps that dedup working (D39).
     */
    readonly frameOrigin?: readonly [number, number];
}
/**
 * Read and compose ground materials for an AOI, as JSON text.
 *
 * The composer's answer is handed on unparsed so a caller can merge and
 * clean tiles with further kernel calls (bulk-data rule 1). The kernel is
 * given the tile bbox and clips the Overture features to it, and drops the
 * coarse land_cover band; the host does not clip.
 */
export declare function acquireGroundMaterialsJson(bbox: Bbox, options?: AcquireGroundOptions): Promise<AcquireGroundJson>;
/** The same composition, parsed once for a caller that wants objects. */
export declare function acquireGroundMaterials(bbox: Bbox, options?: AcquireGroundOptions): Promise<DirectGroundResult>;
