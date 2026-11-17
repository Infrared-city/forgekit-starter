/**
 * `geojsonLayersToDotbim`: flat dotbim meshes from GeoJSON polygon layers.
 */
import type { FeatureCollection } from "./ground-materials.js";
/**
 * One flat mesh returned by `geojsonLayersToDotbim`.
 *
 * @category Ground materials
 */
export interface FlatMesh {
    /** Always `0`. */
    mesh_id: number;
    /** Flat `[x, y, z, ...]` in metres. `z` is always `0`. */
    coordinates: number[];
    /** Flat triangle vertex indices into `coordinates`. */
    indices: number[];
}
/**
 * Triangulates GeoJSON polygon layers into flat dotbim meshes.
 *
 * Every `Polygon`, and every part of a `MultiPolygon`, becomes one mesh lying
 * flat at `z = 0`. Holes are kept. Other geometry types produce no mesh, so a
 * layer without polygons maps to an empty list.
 *
 * All layers share one local frame: `x` points east and `y` points north, in
 * metres, measured from the south-west corner of the whole input. That corner is
 * the smallest longitude and the smallest latitude over every coordinate in every
 * layer, including the coordinates of features that are not polygons. The
 * projection is a tangent plane on a sphere of radius 6 371 000 m.
 *
 * Each ring's closing vertex stays in `coordinates`, but no triangle uses it.
 *
 * `initializeCore()` must have completed before you call it.
 *
 * @param layers - Layer key to GeoJSON feature collection, in WGS84 degrees
 *   (`[longitude, latitude]`). Keys are returned unchanged, in the same order.
 * @returns Layer key to the meshes of that layer, in feature order.
 * @throws {Error} for a polygon that cannot be read or triangulated. The
 *   message names the layer.
 * @category Ground materials
 */
export declare function geojsonLayersToDotbim(layers: Record<string, FeatureCollection>): Record<string, FlatMesh[]>;
