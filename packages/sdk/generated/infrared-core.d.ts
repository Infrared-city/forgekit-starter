// Added by scripts/build-wasm.mjs — see the comment there (infrared-core#262).
// Declares the symbol the generated members below use, so this file type-checks
// under the default library for `target: ES2022`. Merges with, and does not
// replace, `lib.esnext.disposable.d.ts` when the consumer has it.
declare global {
    interface SymbolConstructor {
        readonly dispose: unique symbol;
    }
}

/* tslint:disable */
/* eslint-disable */

export interface SurfaceSynthesisFrame {
    key: string;
    origin: [number, number, number];
    u_axis: [number, number, number];
    v_axis: [number, number, number];
    grid_size: number;
    nu: number;
    nv: number;
    cells: (number | null)[];
}
export interface SurfaceSynthesisBuffers {
    points: Float64Array;
    normals: Float64Array;
    cell_area: Float32Array | null;
    cell_tris: Float32Array | null;
    cell_tris_offsets: Uint32Array | null;
    frames: SurfaceSynthesisFrame[];
    entity_hashes: string[];
    sensor_layout_hash: string;
    warnings: string[];
    culled_below_terrain?: number;
}
export interface SurfaceSynthesisCompactFrame extends Omit<SurfaceSynthesisFrame, "cells"> {
    cells_u64_le: Uint8Array;
}
export interface SurfaceSynthesisCompactBuffers extends Omit<SurfaceSynthesisBuffers, "frames"> {
    frames: SurfaceSynthesisCompactFrame[];
    cells_missing: bigint;
}
export type SurfaceSynthesisResult = string | SurfaceSynthesisBuffers;
export type SurfaceSynthesisAnyResult = SurfaceSynthesisResult | SurfaceSynthesisCompactBuffers;

export function synthesizeSurfaces<Compact extends boolean | null | undefined = false>(
geometries_json: string, mode: string, grid_size: number, offset: number,
max_sensors: bigint, partial_cells?: boolean | null, min_coverage?: number | null,
emit_cell_tris?: boolean | null, return_buffers?: boolean | null,
compact_cells?: Compact,
): Compact extends true ? SurfaceSynthesisCompactBuffers : SurfaceSynthesisResult;

export function synthesizeSurfacesOnTerrain<Compact extends boolean | null | undefined = false>(
geometries_json: string, mode: string, grid_size: number, offset: number,
max_sensors: bigint, terrain_coordinates: Float64Array, terrain_indices: Uint32Array,
partial_cells?: boolean | null, min_coverage?: number | null,
emit_cell_tris?: boolean | null, return_buffers?: boolean | null,
compact_cells?: Compact,
): Compact extends true ? SurfaceSynthesisCompactBuffers : SurfaceSynthesisResult;

export function synthesizeSurfacesFromCapture<Compact extends boolean | null | undefined = false>(
capture: Uint8Array, mode: string, grid_size: number, offset: number,
max_sensors: bigint, partial_cells?: boolean | null, min_coverage?: number | null,
emit_cell_tris?: boolean | null, return_buffers?: boolean | null,
compact_cells?: Compact,
): Compact extends true ? SurfaceSynthesisCompactBuffers : SurfaceSynthesisResult;

export function synthesizeSurfacesFromCaptures<Compact extends boolean | null | undefined = false>(
captures: Uint8Array[],
on_answer: (index: number,
answer: (Compact extends true ? SurfaceSynthesisCompactBuffers : SurfaceSynthesisBuffers) | Error) => void,
mode: string, grid_size: number, offset: number,
max_sensors: bigint, partial_cells?: boolean | null, min_coverage?: number | null,
emit_cell_tris?: boolean | null, compact_cells?: Compact,
): void;



/**
 * JS-owned result. Getters return handles to buffers that do not borrow WASM.
 */
export class AreaGridMerge {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly bounds: Float64Array | undefined;
    readonly shape: Uint32Array;
    readonly values: Float64Array;
}

/**
 * JS-owned canonical categorical values and their sorted observed legend.
 */
export class CategoricalAreaDense {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly legend: Array<any>;
    readonly values: Float64Array;
}

/**
 * JS-owned category ordinals and sorted observed dictionary.
 */
export class CompactAreaCategories {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly legend: Array<any>;
    readonly values: Float32Array;
}

/**
 * JS-owned f32 result; the four geographic bounds retain f64 precision.
 */
export class CompactAreaGrid {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly bounds: Float64Array | undefined;
    readonly shape: Uint32Array;
    readonly values: Float32Array;
}

export class GridDecode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly data: Uint8Array;
    readonly dtype: string;
    readonly kind: string;
    readonly legend: string[] | undefined;
    readonly shape: Uint32Array;
}

export class GridDocumentDecode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly finiteNumbersValidated: boolean | undefined;
    readonly route: string;
}

/**
 * One downloaded AREA result archive, decoded in one crossing. `route` is
 * `"json"` (read `shape`/`kind`/`dtype`/`data`/`legend`: `data` is `f64`
 * little-endian for `kind === "numeric"` — NOT narrowed to f32, unlike
 * [`GridDecode`], because the JSON transport promises full double-precision
 * round-tripping — or one `u8` ordinal per cell (`0xFF` missing) into the
 * PER-TILE `legend` for `kind === "categorical"`, an open label set, unlike
 * the strict-IRBF wire's closed Lawson family) or `"irbf"` (read `document`
 * and hand it to
 * `decodeCompactGridDocument` — the archive held a strict IRBF document,
 * which already has its own buffer-native decoder).
 */
export class ResultArchiveDecode {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly data: Uint8Array | undefined;
    readonly document: Uint8Array | undefined;
    readonly dtype: string | undefined;
    readonly kind: string | undefined;
    readonly legend: string[] | undefined;
    readonly route: string;
    readonly shape: Uint32Array | undefined;
}

/**
 * One area site, read once, answering per tile range.
 */
export class Site {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Every tile's membership and ownership answer, as ONE JSON array of the
     * `tileIds` documents, in tile order (as `SiteAssignment.allTileIds`).
     */
    allTileIds(): string;
    /**
     * Tiles `start..end`'s IRBF geometry artifacts: `SiteAssignment.artifacts`'
     * object for the range (offsets from 0 for tile `start`), plus `present`
     * (`Uint8Array`, one mask per tile) and `meshGroupHashes` (`string[]`,
     * two per tile), as `identity` answers them. Four additive per-tile
     * fact buffers report checked frame bytes, metadata bytes, mesh count
     * and instance count without changing the existing archive fields.
     */
    artifacts(start: number, end: number, box_trees: boolean, max_total_bytes: bigint, max_metadata_bytes: number, max_meshes: bigint, max_instances: bigint): any;
    /**
     * Tiles `start..end`'s wire bodies and kernel group hashes, as
     * `SiteAssignment.arena` answers the whole grid: `{bytes: Uint8Array,
     * offsets: Uint32Array, hashes: string[]}`, five slots per tile, offsets
     * starting at 0 for tile `start`.
     *
     * Each tile's bytes are copied straight into the JavaScript array and
     * dropped: the joined bytes never exist in wasm memory, which never
     * shrinks (a 2 km site: about 100 MiB less heap at this call).
     */
    bodies(start: number, end: number): any;
    /**
     * Refuse tiles `start..end` whose terrain is over the per-request cap,
     * the check a selected facade body makes, without writing one.
     */
    checkTerrain(start: number, end: number): void;
    /**
     * Geometry-free facade policy and saved records in; selected batch ID
     * records out. The shared core parses both policy versions.
     */
    facadeBatches(start: number, end: number, request_json: string): string;
    /**
     * Many facade jobs in one call (WP3). Job `j` is tile `tiles[j]` with the
     * next `idCounts[j]` ids of `ids` as its targets. For each job, in job
     * order, an object with the parts asked for: `body` (`{bytes, offsets,
     * hashes}`, the five-group arena of `bodies(tile, tile + 1)`), `identity`
     * (`{present, meshGroupHashes}`), `capture` (the pretty capture with the
     * request's `terrain-alignment`: `alignment`, or `undefined` when the
     * request does not send it) and `artifact` (`{targetIds, archive,
     * artifactDigest, contentDigest, encoding, treeBoxes, frameByteLength,
     * metadataByteLength, meshCount, instanceCount}`). A job the kernel
     * refuses is `{error}`; the other jobs are kept. The kernel builds each
     * tile once for all of its jobs.
     */
    facadeFrames(tiles: Uint32Array, id_counts: Uint32Array, ids: string[], body: boolean, identity: boolean, capture: boolean, alignment: string | null | undefined, artifact: boolean, box_trees: boolean, max_total_bytes: bigint, max_metadata_bytes: number, max_meshes: bigint, max_instances: bigint): Array<any>;
    /**
     * Tiles `start..end`'s presence masks (`present`: one byte per tile, bit
     * `i` for group `i` in `arenaGroups()` order) and `geometries` /
     * `context-geometry` group hashes (`meshGroupHashes`: two per tile, `""`
     * for none), with no body written and no archive encoded.
     */
    identity(start: number, end: number): any;
    /**
     * Read the site once and prepare its layers over EVERY tile.
     *
     * The first fourteen arguments are `SiteAssignment`'s. Then the five
     * group documents as JSON text (`geometries`, `context-geometry`,
     * `ground-geometry`, `vegetation`, `ground-materials`; `undefined` for a
     * group the run does not carry), which must name the meshes the packed
     * site holds; `polygonJson`, the source polygon the tree and
     * ground-material assigners project with; `terrainMarginM`, the caller's
     * extra terrain reach. The tile list is always the whole grid.
     */
    constructor(building_ids: string[], building_coordinates: Uint8Array, building_offsets: Uint32Array, context_ids: string[], context_coordinates: Uint8Array, context_offsets: Uint32Array, rows: Uint32Array, cols: Uint32Array, tile_ids: string[], inference_size_m: number, context_size_m: number, step_m: number, site_lon: number, site_lat: number, geometries: string | null | undefined, context_geometry: string | null | undefined, ground_geometry: string | null | undefined, vegetation: string | null | undefined, ground_materials: string | null | undefined, polygon_json: string, terrain_margin_m?: number | null);
    /**
     * How many tiles the site has; every range is within `0..tileCount()`.
     */
    tileCount(): number;
    /**
     * Ids the shrink band gave up that NO tile's core took (D63).
     */
    unowned(): string[];
}

export class SurfaceArchive {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * The `cell-area` cells, cut by `valueOffsets`; NaN is `null`.
     */
    takeCellArea(): Float64Array;
    /**
     * `[[id, fields], ...]`: each surface's fields without `values` and
     * `cell-tris`; an array `cell-area` is the placeholder `0`.
     */
    takeFieldsJson(): string;
    /**
     * Every root field except `surfaces`, as JSON object text.
     */
    takeRootJson(): string;
    /**
     * One byte per surface: 0 absent, 1 `null`, 2 array.
     */
    readonly cellAreaState: Uint8Array;
    /**
     * One byte per surface: 0 absent, 1 `null`, 2 array.
     */
    readonly cellTrisState: Uint8Array;
    /**
     * `"surface"`, or `"not-surface"` for a valid result of another shape
     * (a grid, other JSON, another IRBF family).
     */
    readonly route: string;
    readonly valueOffsets: Uint32Array;
}

export class SurfaceAreaMerger {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Finish with JS-owned COLUMNS, not one object per surface: `metadataJson`
     * (`Uint8Array`), `ids` (one string) cut by `idOffsets` (UTF-16 units),
     * `values` cut by `valueOffsets`, `hasCellTris` (one byte per surface),
     * and — only when some surface has cell triangles — `triangleValues`,
     * `triangleOffsets` and `triangleMask`, one entry per cell of every
     * surface. No result borrows WASM memory.
     */
    finish(): any;
    constructor();
    /**
     * Add one job that `decodeSurfaceArchive` decoded. The handle is
     * consumed: its values and triangles move into the merge. `rootJson` is
     * the response root without `surfaces`, as the host holds it (the host
     * `JSON.stringify` of its parsed root, which is what the retired `pushJob` read).
     */
    pushArchive(entry_id: string, root_json: string, archive: SurfaceArchive, sw_x: number, sw_y: number): void;
}

/**
 * The 4 built-in low-poly tree templates → `{registry_id: {coordinates,
 * indices, height, crown_diameter, crown_base_fraction}}`. Instance these with
 * `instancesFromPoints` so the frontend shows the archetype geometry + dims.
 */
export function archetypeMeshes(): string;

/**
 * `infrared_sdk.tiling.transforms.assign_buildings_to_tiles` port. Buildings
 * (`{key:{coordinates:[x,y,z,...],...}}`, polygon-bbox-SW meters) + non-empty
 * tiles → `{tileId:{key:building_with_tile_local_coords}}`.
 */
export function assignBuildingsToTiles(buildings_json: string, tiles_json: string, analysis_type: string | null | undefined, strict: boolean): string;

/**
 * `ground_materials.dedup.assign_ground_materials_to_tiles` port. Layers
 * (`{layer_name: FeatureCollection}`, WGS84) + tiles + polygon →
 * `{tileId:{layer_name:FeatureCollection}}` with `properties.material` injected.
 */
export function assignGroundMaterialsToTiles(layers_json: string, tiles_json: string, polygon_json: string, analysis_type?: string | null): string;

/**
 * `vegetation.dedup.assign_vegetation_to_tiles` port. Vegetation
 * (`{key:{geometry:{...}},...}` — Point/Polygon/MultiPolygon, D27) + tiles +
 * source polygon → `{tileId:{key:feature}}` (LocalFrame D1; payload
 * preserved verbatim).
 *
 * # Errors
 *
 * Throws if a feature's geometry cannot be reduced to a single seating
 * position — see [`ir_geo::tiling::vegetation::VegetationGeometryError`].
 * Previously an unsupported geometry type was skipped silently; D27 made
 * this a hard error on both bindings.
 */
export function assignVegetationToTiles(vegetation_json: string, tiles_json: string, polygon_json: string, analysis_type?: string | null): string;

/**
 * Building-batching manifest for parallel raytracing. `{key:{coordinates,
 * indices?}}` (tile-local meters) → `{batches:[[key...]], occluder_sets:
 * null|[[key...]]}`. `halo_radius_m = undefined` → Full context.
 */
export function batchBuildings(buildings_json: string, batch_size: number, halo_radius_m?: number | null): string;

/**
 * One byte per row (`1` meets): `rows` holds four values per row (`west,
 * south, east, north`), NaN for a missing member. Closed intervals; a row
 * with a missing member meets every rectangle.
 */
export function bboxMeetsRows(rows: Float64Array, west: number, south: number, east: number, north: number): Uint8Array;

/**
 * `ir_geo::tiling::categorical::build_cat_map` binding. JSON array of category
 * strings in → `{category: index}` JSON out (unique, non-empty, sorted, 0-based
 * f64 indices). The legend for `encodeCategoricalGrid`.
 */
export function buildCatMap(categories_json: string): string;

/**
 * Normalise an area of footprints ONCE, assign them to tiles and extrude
 * each tile's set in that tile's frame.
 *
 * The tiled twin of `buildingsNormalize` followed by
 * `extrudeFootprintsToDotbim`. A footprint goes to EVERY tile whose rectangle
 * its envelope meets, not only the first — that is the duplication the
 * per-tile reads produced, and the host's grid-order first-seen dedup removes
 * it. Each tile is extruded with its own south-west corner as the origin, so
 * `mesh_id` counts from zero WITHIN each tile, exactly as before (it was
 * never an identifier — D36).
 *
 * **`chunk` is read and IGNORED here.** `tiles` is parsed by the one shared
 * reader, so a rectangle may carry the member — but this operation has no
 * per-chunk input to resolve through it. Roads are not its concern: what a
 * footprint is extruded into depends on the RECTANGLE alone (its own frame, its
 * own `mesh_id` numbering), so a chunk name cannot change the answer. It is
 * accepted rather than refused because a host may hand ONE rectangle list to the
 * ground and buildings operations, and refusing the member would force it to
 * build two lists that must then be kept identical by hand.
 *
 * One AOI-sized rectangle is a valid list: the footprints are normalised once
 * and extruded once, in the AOI frame. That is NOT bit-identical to today's
 * per-tile extrusion offset into the grid, and cannot be — `LocalFrame` fixes
 * the east-west scale at the frame's ORIGIN latitude (D1), so the two frames
 * disagree by `R * dlon * (cos lat_tile - cos lat_AOI)`, measured at up to
 * 8.9 mm on the Vienna capture, with identical indices and vertex counts. The
 * host records the move in `docs/DEVIATIONS.md` D48 (host adoption).
 *
 * Returns the JSON of `{tileId: {buildingId: {mesh_id, coordinates,
 * indices}}}`, one entry per tile in the given order, `{}` for a tile no
 * footprint meets.
 */
export function buildingsAssignAndExtrude(fc: string, source: string, tiles: string, default_height: number): string;

/**
 * [`buildings_assign_and_extrude`] with every document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes.
 */
export function buildingsAssignAndExtrudeBytes(fc: Uint8Array, source: string, tiles: Uint8Array, default_height: number): Uint8Array;

/**
 * [`buildings_assign_and_extrude`] keeping the attributes extrusion drops.
 *
 * Same normalisation, same assignment, same frames: each tile's answer is
 * `{"meshes": {buildingId: {mesh_id, coordinates, indices}}, "attributes":
 * {buildingId: {height, min_height, num_floors, source_id}}}` instead of the
 * mesh map alone. The two maps of a tile carry exactly the same ids — a row
 * is written in the same loop iteration that writes its mesh, after the same
 * eligibility test.
 */
export function buildingsAssignAndExtrudeWithAttributes(fc: string, source: string, tiles: string, default_height: number): string;

/**
 * [`buildings_assign_and_extrude_with_attributes`] with every document
 * crossing as a `Uint8Array` (WP14-D). Same operation, same bytes.
 */
export function buildingsAssignAndExtrudeWithAttributesBytes(fc: Uint8Array, source: string, tiles: Uint8Array, default_height: number): Uint8Array;

/**
 * Building footprint normalisation — utilities-service `app/gis/buildings.py`
 * and the `POST /buildings` Lambda, whose height fallbacks it shares.
 *
 * `source` is a global provider (`"mapbox"`, `"overture"` or `"bigquery"`)
 * or a city overlay's registry `source_key` (for example `"vienna_ogd"`)
 * when the host range-read a city FlatGeobuf. Any non-empty label is
 * accepted; an empty one is an error.
 */
export function buildingsNormalize(fc_json: string, source: string): string;

/**
 * Return the exact bounded metadata bytes used by the server.
 */
export function canonicalMetadataJson(metadata_json: string, max_bytes: number, max_depth: number): Uint8Array;

/**
 * Refuse a per-job sensor cap the exact policy cannot take, before planning.
 * The rule is `ir_simprep::surface_batch::exact_batch_policy`.
 */
export function checkMaxSensorsPerJob(max_sensors_per_job: number): void;

/**
 * `infrared_sdk.tiling.merger.clip_to_polygon` port. base64-f32 grid in/out;
 * cells whose centre is outside `polygon_meters` (`[[x,y],...]`) become NaN.
 */
export function clipToPolygon(grid_bin: string, rows: number, cols: number, polygon_meters_json: string, origin_x: number, origin_y: number, cell_size_m: number): string;

/**
 * Roll child hashes up one level of the Merkle tree. `level` ∈
 * {`"tile"`, `"layer"`}; `"tile"` yields the `tile_geo_hash` that keys the
 * result cache.
 *
 * Order-independent (children are sorted), but NOT a set — duplicates count.
 * An empty array is valid: a buildingless tile is a real tile. Throws on any
 * child that is not 64 lowercase hex chars.
 */
export function composeHash(child_hashes: string[], level?: string | null): string;

/**
 * `resolve_layers` analogue: the `compose_tile_payloads` driver. Assigns every
 * category into per-tile payloads by its policy. `categories_json` =
 * `[{key, kind, data, strict?, ctx?}]` (kind ∈ {"buildings","vegetation",
 * "ground-materials","terrain","context"}). Returns `{tileId:{key:data}}` JSON.
 */
export function composeTilePayloads(categories_json: string, tiles_json: string, polygon_json: string, analysis_type?: string | null): string;

/**
 * `infrared_sdk.tiling.merger.compute_grid_bounds` port. GeoJSON Polygon +
 * `num_rows × num_cols` tile grid + config JSON → `{min_lon, min_lat, max_lon,
 * max_lat}` JSON (the grid's geographic bbox, SW-anchored, NE extent via the
 * canonical LocalFrame; D1). Throws on an empty grid or a polygon with no
 * usable exterior ring.
 */
export function computeGridBounds(polygon_json: string, num_rows: number, num_cols: number, config_json: string): string;

/**
 * sha256 (lowercase hex) of a simulation-parameters JSON document — the
 * `configHash` term of the result-cache key ("how it's run", alongside
 * `tileGeoHash`'s "what is there").
 *
 * The kernel canonicalises and hashes whatever it is given (sorted keys, 6dp
 * half-away rounding then integral collapse); the FIELD SET is a documented
 * SDK-side contract (plan §14e), NOT enforced here. Pass the same JSON the
 * server would resolve for the run.
 *
 * THROWS on invalid JSON or a non-object — deliberately, via a Rust panic.
 * An error here is a caller bug, and a binding that returned a hashable error
 * value (an empty string, say) would mint a plausible-looking cache key for
 * an input no client should ever send. Fail loud or not at all.
 */
export function configHash(config_json: string): string;

/**
 * Seat bring-your-own solids + drape sensor points onto a terrain mesh
 * (`ir_simprep::conform::conform_scene`). TRACK-2 §A datum alignment — the
 * TS-SDK counterpart of the Python wheel's `conform_scene`, identical JSON.
 *
 * `solidsJson`: `{uuid: {coordinates, indices}}` (tile-local meters, same shape
 * as `synthesizeSurfaces` / ground). `sensorPoints`: a FLAT `[x0,y0,z0, …]`
 * buffer (length a multiple of 3). `terrainCoordinates`/`terrainIndices`: a
 * flat triangle mesh in the SAME tile-local frame (like `groundCleanV3OnTerrain`).
 * `mode` ∈ {auto, force, passthrough} (pass `undefined` for `auto`); `edgeRule`
 * ∈ {clamp, skip} (pass `undefined` for `clamp`). `skirtDepthM`/`epsilonM`
 * default (when `undefined`) to the kernel consts.
 *
 * Returns JSON `{solids: {uuid:{coordinates,indices}}, sensor_points:
 * [[x,y,z],…], report: {seated, passthrough, skipped_off_terrain,
 * skipped_non_finite, max_lift_m}}`.
 * Throws on malformed solid/terrain geometry or a bad mode/edge_rule.
 */
export function conformScene(solids_json: string, sensor_points: Float64Array, terrain_coordinates: Float64Array, terrain_indices: Uint32Array, mode?: string | null, skirt_depth_m?: number | null, epsilon_m?: number | null, edge_rule?: string | null): string;

export function coreVersion(): string;

/**
 * Count retained façade/roof sensors at the requested grid size without
 * constructing synthesis output arrays. The count never coarsens and a valid
 * zero-survivor scene returns `0n`.
 *
 * `workBudget` limits the conservative cell-work bound, not the retained
 * count. JavaScript receives the `u64` result as a lossless `BigInt`.
 */
export function countSurfaces(geometries_json: string, mode: string, grid_size: number, offset: number, work_budget: bigint, terrain_coordinates?: Float64Array | null, terrain_indices?: Uint32Array | null, partial_cells?: boolean | null, min_coverage?: number | null): bigint;

/**
 * Validate a result frame and return independent owned section byte arrays.
 *
 * Input length is checked before copying into WASM. Family validation finishes
 * before any output array is allocated. Output sections do not retain input.
 */
export function decodeBinaryResult(buffer: Uint8Array, max_total_bytes: bigint, max_metadata_bytes: number, max_sections: number, max_elements_per_section: bigint, max_metadata_depth: number, max_cells: bigint, max_triangle_values: bigint): any;

export function decodeGridDocument(response_bytes: Uint8Array, expected_kind?: string | null): GridDocumentDecode;

export function decodeGridResponse(response_json: string, expected_kind?: string | null): GridDecode;

/**
 * Decode one downloaded AREA result archive (ZIP or GZIP, one entry):
 * inflate, then either flatten a JSON grid or hand back a strict IRBF
 * document undecoded. Replaces the host's own inflate + `JSON.parse` +
 * per-cell flatten for the JSON route (ADR 0006).
 */
export function decodeResultArchive(archive: Uint8Array): ResultArchiveDecode;

/**
 * Decode one downloaded surface result archive (ZIP or GZIP, one entry,
 * JSON or strict IRBF). The four limits are the strict IRBF result limits.
 */
export function decodeSurfaceArchive(archive: Uint8Array, max_total_bytes: bigint, max_metadata_bytes: number, max_cells: bigint, max_triangle_values: bigint): SurfaceArchive;

export function decodeSurfaceIdentity(response_json: string): string;

/**
 * `ground_materials.dedup.dedup_material_features` port. JSON array of features
 * in → deduped JSON array out (first-seen by geometry).
 */
export function dedupMaterialFeatures(features_json: string): string;

/**
 * Tree dedup across sources (city-OGD wins). features JSON in/out.
 */
export function dedupTrees(features_json: string, radius_m: number, preferred_sources: string[], same_source_dedup?: boolean | null): string;

/**
 * `vegetation.dedup.dedup_vegetation_features` port. JSON array of per-tile
 * FeatureCollections (or `null`) → `{dedup_key: feature}` JSON (first-seen).
 */
export function dedupVegetationFeatures(tile_results_json: string): string;

/**
 * The automatic ground-material order, weakest first.
 */
export function defaultPrecedence(): any[];

/**
 * Drop each mesh of a packed geometry group so its own lowest point is z = 0.
 *
 * `coordinates` is every mesh's flat `[x, y, z, ...]` array, concatenated, as
 * little-endian f64 bytes; `offsets` names where each starts and where the
 * last ends, counting ELEMENTS, so it holds one more entry than there are
 * meshes. A ZERO-LENGTH slot is a mesh the host could not read and is left
 * alone.
 *
 * Returns `{ coordinates: Uint8Array, removed: Float64Array }`: the dropped
 * buffer in the same packing, and one value per mesh — the z that was
 * subtracted, exactly `0` for a mesh this pass left untouched. The host writes
 * back only the meshes that moved, so an already-at-grade site keeps the
 * caller's own coordinate arrays and goes on the wire byte-for-byte as before.
 */
export function dropToGrade(coordinates: Uint8Array, offsets: Uint32Array): object;

/**
 * `ir_geo::tiling::categorical::encode_categorical_grid` binding. A 2-D JSON
 * grid of category cells (`[[str|null,...],...]`, must be rectangular) + a
 * `cat_map` JSON (`{category: index}`) → a base64(f32 LE) grid `{rows, cols,
 * data_bin}`. Cells that are null / empty / absent from the map become NaN.
 * Rides the same f32 grid wire as `mergeTiles` so PWC categorical layers
 * compose uniformly.
 */
export function encodeCategoricalGrid(grid_json: string, cat_map_json: string): string;

/**
 * Encode an owned canonical geometry frame.
 *
 * Lengths are checked before typed arrays are copied into WASM. Returned byte
 * arrays own JavaScript storage. The artifact digest covers the raw frame; an
 * archive transport must digest the exact archive bytes separately.
 */
export function encodeGeometryDocument(metadata_json: string, coordinates_f32_le: Uint8Array, indices_u32_le: Uint8Array, instance_f32_le: Uint8Array | null | undefined, max_total_bytes: bigint, max_metadata_bytes: number, max_sections: number, max_elements_per_section: bigint, max_metadata_depth: number, max_meshes: bigint, max_instances: bigint): any;

/**
 * sha256 (lowercase hex) of ONE ground-material layer — a material NAME plus
 * the polygons carrying it (D25).
 *
 * `collectionJson` is the GeoJSON FeatureCollection the wire carries for this
 * material. Only Polygon and MultiPolygon features are hashed: clean-v3 drops
 * the rest, so they are not simulated. Feature `id` and `properties` are NOT
 * hashed — lambda-models strips both before clean-v3, so hashing them would
 * guarantee the client's value never matched the server's.
 *
 * Coordinates are WGS84 DEGREES and are hashed as f64, never narrowed to f32
 * the way `entityHashMesh` narrows tile-local meters — the f32 ULP at
 * longitude 16.37 is about 20 cm on the ground.
 *
 * The material name is in the preimage: the thermal models simulate
 * materials, so the same footprint under `"asphalt"` and `"water"` is
 * different ground. An empty layer is valid. Throws on structural garbage or
 * a non-finite coordinate.
 */
export function entityHashGroundLayer(material: string, collection_json: string): string;

/**
 * sha256 (lowercase hex) of ONE instanced-vegetation group (trees) — the tree
 * equivalent of `entityHashMesh`.
 *
 * `tuples` is the flat `[scale_xy, scale_z, tx, ty]` × n that `instances_bin`
 * carries, as f64. NOT narrowed (unlike coordinates): `instances_bin` is
 * `base64(f64 LE)` and the vegetation parity contract is f64 end-to-end, so
 * every difference counts however small — and there is only one transport, since
 * no plain-JSON `instances` array exists.
 *
 * `registryVersion` and `template` are REQUIRED and hashed: expansion hard-fails
 * on registry skew ("never places wrong-sized trees"), so the same tuples under
 * a different registry are different geometry. Tree ids are NOT hashed (labels,
 * not shape) but their order is, because the tuples are parallel to them.
 *
 * Throws if `tuples` is not a whole number of trees (a multiple of 4) or holds a
 * non-finite value. An empty group is valid.
 */
export function entityHashInstances(template: string, tuples: Float64Array, registry_version: string): string;

/**
 * sha256 (lowercase hex) of ONE triangle-mesh entity — a building, a terrain
 * patch: the Merkle leaf.
 *
 * Hashes the canonical `coordinates_bin`/`indices_bin` packing bytes, so a
 * mesh sent as JSON and the same mesh sent binary share one hash. Coordinates
 * must already be tile-local (`|coord| < 1e5`, rule 6) — throws otherwise
 * rather than hashing a silently-narrowed value.
 */
export function entityHashMesh(coordinates: Float64Array, indices: Uint32Array): string;

/**
 * Return the request-wide upper bound on first-pass surfgrid cells.
 *
 * Uses the exact synthesis input parser. JavaScript receives a lossless
 * `BigInt` because wasm-bindgen maps the Rust `u64` return without narrowing.
 */
export function estimateCellsUpperBound(geometries_json: string, mode: string, grid_size: number, offset: number, max_sensors: bigint, partial_cells?: boolean | null, min_coverage?: number | null, emit_cell_tris?: boolean | null): bigint;

/**
 * `infrared_sdk.preflight.estimate_sun_context_loss` port — direct-sun-hours
 * context-buffer diagnostic. Returns the JSON `SunContextResult` (severity,
 * message, numeric fields). Never throws. Optional args mirror the Python
 * wheel's defaults: `lon=0`, `buffer_m=128`, `typical_building_height_m=25`;
 * `timezone_offset_h`/`max_building_height_m` default to `None` (undefined).
 */
export function estimateSunContextLoss(lat: number, start_month: bigint, start_day: bigint, start_hour: bigint, end_month: bigint, end_day: bigint, end_hour: bigint, lon?: number | null, timezone_offset_h?: number | null, buffer_m?: number | null, typical_building_height_m?: number | null, max_building_height_m?: number | null): string;

/**
 * `VegetationInstances` JSON → `{id: mesh}` JSON (bit-identical to
 * `vegetationPointsToMeshes`). `expectedRegistryVersion` skew errors loudly.
 */
export function expandInstances(instances_json: string, registry_json: string, expected_registry_version: string): string;

/**
 * Extrude normalised footprints into dotbim meshes — the geometry operation
 * the direct buildings path was missing.
 *
 * `geojsonLayersToDotbim` triangulates FLAT at z = 0 and reads no height
 * property (extrusion is utils#83), so it cannot serve this path. This is
 * caps plus walls from z = 0 to `height` (or `defaultHeight` when the
 * footprint has none); `min_height` is carried by the normaliser and
 * deliberately not read (the Lambda extrudes from ground). Non-positive
 * extrusions are skipped, and features sharing a building id merge into one
 * mesh. Coordinates are local metres in the explicit origin frame. Returns
 * `{building_id: {mesh_id, coordinates, indices}}`, the shape
 * `POST /buildings` returns.
 *
 * Features whose geometry is not a Polygon/MultiPolygon are skipped and
 * absent from the output; a host detects them by diffing input ids against
 * output keys.
 */
export function extrudeFootprintsToDotbim(fc: string, origin_lon: number, origin_lat: number, default_height: number): string;

/**
 * `extrudeFootprintsToDotbim` plus the attributes a mesh cannot carry.
 *
 * Returns `{meshes, attributes}` from ONE walk, so an attribute row exists
 * exactly where its mesh does. `height` is the height the mesh was built to.
 */
export function extrudeFootprintsWithAttributes(fc: string, origin_lon: number, origin_lat: number, default_height: number): string;

/**
 * Phase 3: decode the fetched feature ranges.
 *
 * `header` is the first `12 + header_len` bytes; `featuresBytes` the fetched
 * `features` range bodies concatenated IN ORDER. The bbox re-applies the
 * envelope filter, because merged ranges deliberately carry features nobody
 * asked for.
 */
export function fgbDecodeRangeFeatures(header: Uint8Array, features_bytes: Uint8Array, min_lon: number, min_lat: number, max_lon: number, max_lat: number): string;

/**
 * Phase 2: one step of the stateless packed-R-tree walk.
 *
 * `header` is the first `12 + header_len` bytes. `fileSize` is MANDATORY —
 * it closes the last feature's range, which the index cannot. `fetchedNodes`
 * is an array of `{offset, bytes}` for every index range fetched so far.
 *
 * Returns `{need: [[offset, length], ...], features: [[offset, length],
 * ...]}`. While `need` is non-empty, fetch those ranges, append them to
 * `fetchedNodes` and call again; when it is empty, fetch the `features`
 * ranges, concatenate the bodies IN ORDER, and hand them to
 * [`fgb_decode_range_features`]. A host that already holds the WHOLE index
 * passes it as one entry and finishes in a single step — a convenience for
 * SMALL files only, since a world-sized index is hundreds of megabytes and
 * the whole point of the walk is never to read it.
 *
 * `mergeGapBytes` overrides the 256 KiB gap budget the `features` ranges are
 * merged on; omit it for the default the Python twin also uses.
 */
export function fgbIndexSearchStep(header: Uint8Array, min_lon: number, min_lat: number, max_lon: number, max_lat: number, file_size: number, fetched_nodes: Array<any>, merge_gap_bytes?: number | null): object;

/**
 * Phase 1 of a FlatGeobuf range read: where the file's sections are.
 *
 * `prefix` is the first bytes of the file (16 KiB covers the files we
 * publish). Returns an object with `header_len` and `required_prefix_len`
 * always, and — once the prefix reaches the whole header — `index_len`,
 * `features_offset`, `features_count` and `index_node_size`. A short prefix
 * leaves those four `null` and `required_prefix_len` names the length to
 * fetch, rather than throwing.
 */
export function fgbLayout(prefix: Uint8Array): object;

/**
 * FlatGeobuf bytes -> GeoJSON features JSON (whole file).
 */
export function fgbToFeatures(bytes: Uint8Array): string;

/**
 * FlatGeobuf bytes -> GeoJSON features JSON within a bbox (spatial index).
 */
export function fgbToFeaturesBbox(bytes: Uint8Array, west: number, south: number, east: number, north: number): string;

/**
 * Re-anchor every metre-frame coordinate of a document from one local frame
 * into another, EXACTLY.
 *
 * The SDK extrudes buildings and composes ground ONCE in the SITE frame (the
 * `LocalFrame` at the AOI south-west corner, `DEVIATIONS.md` D1); the
 * simulation server projects EACH TILE at that tile's own reference point.
 * This is the map between the two, and it is not a translation — `LocalFrame`
 * fixes the east-west scale at the frame's ORIGIN latitude:
 *
 * ```text
 * x' = x * cos(lat1)/cos(lat0) + dx        y' = y + dy        z' = z
 * ```
 *
 * with `(dx, dy)` the frame-0 origin expressed in frame 1. The scale is the
 * TARGET cosine over the SOURCE cosine; a constant offset leaves it behind
 * (8.9 mm across one 512 m tile, of order a metre across a 5 km² site).
 *
 * `document` is a JSON OBJECT whose every entry is a mesh
 * (`{meshId, coordinates: [x, y, z, ...], indices}`), a GeoJSON
 * FeatureCollection in LOCAL METRES, or `null` (which passes through, as
 * `groundMaterialsComposeTiles` emits for a rectangle that composed
 * nothing). Anything else throws: a document half of which is still in the
 * old frame is the failure this operation removes. A stale `bbox` member is
 * REMOVED rather than left describing the old frame.
 *
 * **Coordinates must be METRES.** A document in WGS84 degrees carries no
 * frame and cannot be told apart — `groundCleanV3` output is degrees (with
 * the Z in metres) and must NOT be passed here.
 */
export function frameReanchor(document: string, lon0: number, lat0: number, lon1: number, lat1: number): string;

/**
 * [`frame_reanchor`] with the document crossing as a `Uint8Array` in and
 * out — the same operation and the same bytes, without the JS string
 * traversal in either direction (WP14-D).
 */
export function frameReanchorBytes(document: Uint8Array, lon0: number, lat0: number, lon1: number, lat1: number): Uint8Array;

/**
 * `infrared_sdk.tiling.tiles.generate_tiles_for_polygon` port. JSON Polygon in
 * → JSON VERDICT out (canonical LocalFrame stepping, DEVIATIONS D1):
 *
 * * ok:    `{"ok": true, "tiles": [[{tileId,empty,centroid,size}]]}`
 * * error: `{"ok": false, "kind": "bbox_too_large" | "too_many_non_empty", …}`
 *
 * A tile CAP is a verdict the caller acts on, not a failed call, so it comes
 * back as a value — the same shape the python and dotnet bindings already use
 * for this function (ADR 0010). The TS SDK composes the sentence, because only
 * it knows the knob is spelled `maxTilesOverride` there and `max_tiles_override`
 * in Python; a `JsError` carrying the kernel's own text could not say either.
 * Everything else — a malformed polygon, a ring with no vertices — is still a
 * `JsError`, which is the binding-wide convention for "the call itself failed".
 */
export function generateTilesForPolygon(polygon_json: string, analysis_type?: string | null, max_tiles_override?: number | null): string;

/**
 * utilities-service `POST /geometries/geojson-to-dotbim` port: JSON string
 * `{layerId: FeatureCollection}` → JSON string `{layerId: [flat mesh]}`.
 */
export function geojsonLayersToDotbim(layers_json: string): string;

/**
 * One body's IRBF geometry artifact (D101): the geometry groups of
 * `bodyJson` as given — packed, framed, zipped and digested in the kernel.
 * The direct `submit` path; an area run takes `SiteAssignment.artifacts`.
 * With `boxTrees` the body's trees become boxes in `geometries` (D70), in
 * the frame of the body's own `longitude`/`latitude`.
 *
 * Returns `{archive: Uint8Array, artifactDigest, contentDigest, encoding,
 * treeBoxes}` — `treeBoxes` the substitution's counts as JSON, or `null`.
 */
export function geometryArtifact(body_json: string, box_trees: boolean, max_total_bytes: bigint, max_metadata_bytes: number, max_meshes: bigint, max_instances: bigint): any;

/**
 * Hash one S1 geometry group from its wire JSON.
 *
 * Uses the registry's `HashKind` and existing leaf preimages. Returns null
 * when the registry says the group has no hash rule. Throws for an unknown
 * name, invalid JSON, or a malformed hashable group.
 */
export function geometryGroupHash(group_name: string, group_json: string): any;

/**
 * Return plain records so JavaScript hosts need no Rust-specific wrapper type.
 */
export function geometryGroups(): Array<any>;

/**
 * Return the kernel-owned tiling preset for an analysis type as JSON.
 */
export function getTilingConfig(analysis_type?: string | null): string;

/**
 * Colormap a 2-D grid of f32 (row-major, NaN = no-data) to PNG bytes
 * (`Uint8Array`). Mirror of the Python wheel's `grid_to_png` — gives the
 * webapp local image rendering. `vmin`/`vmax`: explicit range; pass both as
 * `undefined` for auto. `colors`: a flat 256×3 RGB buffer (768 bytes) for a
 * registry LUT, or `undefined` for magma_r. `alpha` + `bad_*` apply to a
 * custom LUT (magma_r carries its own); all OPTIONAL and default to the
 * Python wheel's values (alpha 255, bad = opaque white) so an omitted/
 * `undefined` arg can't silently render everything transparent.
 *
 * `maxLongAxisPx` caps the LONG axis of the image, 960 px when it is omitted
 * — the same default the wheel ships. A grid at or below the cap renders
 * 1:1, byte for byte as before; a larger one is sampled nearest-neighbour on
 * the VALUES before colouring, keeping its aspect ratio and its no-data cells
 * (DEVIATIONS D9). **Pass `0` for the uncapped 1:1 image**: JavaScript cannot
 * tell an omitted argument from an explicit `undefined`, so `0` is the
 * opt-out here where the wheel also accepts `None`.
 *
 * `reverseRows` is OPTIONAL and defaults to `false`, which emits grid row 0
 * as the TOP PNG row. `true` is for a caller whose grid is already bottom-up.
 * The flip is on the OUTPUT rows, AFTER the cap has sampled the grid — the
 * same rule `renderGridRegistry` follows, so the two paths place a row
 * identically at any cap. A host must never pre-flip the grid instead: a
 * nearest-neighbour map is not symmetric for every size pair, and the two
 * answers differ by up to one grid row above the cap.
 */
export function gridToPng(values: Float32Array, width: number, height: number, vmin?: number | null, vmax?: number | null, colors?: Uint8Array | null, alpha?: number | null, bad_r?: number | null, bad_g?: number | null, bad_b?: number | null, bad_a?: number | null, max_long_axis_px?: number | null, reverse_rows?: boolean | null): Uint8Array;

/**
 * utilities-service `POST /ground-material/clean-v3` port. JSON-in/out.
 * Pass `z_step = undefined` for the fixed default (0.05, DEVIATIONS.md D5).
 */
export function groundCleanV3(layers_json: string, latitude: number, longitude: number, distance: number, default_layer?: string | null, z_step?: number | null): string;

/**
 * clean-v3 with the material layers DRAPED onto a terrain mesh (TRACK-2 §A).
 *
 * `terrainCoordinates`/`terrainIndices` are a flat triangle mesh in LOCAL
 * METERS; `frameOriginLon`/`frameOriginLat` pin the WGS84→local projection so
 * the material layers (WGS84 degrees) sample the right surface. Points outside
 * the mesh fall back to a flat base of 0. Pass `z_step = undefined` for the
 * fixed default (0.05, DEVIATIONS.md D5). An empty terrain mesh is equivalent
 * to `groundCleanV3`.
 */
export function groundCleanV3OnTerrain(layers_json: string, latitude: number, longitude: number, distance: number, terrain_coordinates: Float64Array, terrain_indices: Uint32Array, frame_origin_lon: number, frame_origin_lat: number, default_layer?: string | null, z_step?: number | null): string;

/**
 * The per-material leaves of a whole `ground-materials` object, sorted by
 * material name — what a producer folds into `composed`.
 *
 * `layersJson` is the wire object itself (`{"asphalt": {...}, ...}`). The
 * returned ORDER is a convenience only: every fold that consumes these sorts.
 */
export function groundMaterialLeaves(layers_json: string): string[];

/**
 * Ground-material layers from direct sources — utilities-service
 * `GET /ground-material/collect?source=fgb`.
 *
 * `roadsFc` is a FeatureCollection of road centrelines as
 * [`roads_normalize`] emits them; `overtureFc` one of Overture `water` /
 * `land_cover` / `land_use` features.
 *
 * **`originLon` / `originLat` is the AOI-level frame origin — the tiling
 * polygon-bbox south-west corner — and must be the SAME for every tile of
 * one area**, or overlapping tiles buffer the same road to two different
 * vertex sets and every duplicate survives `dedupMaterialFeatures`.
 * `minLon`..`maxLat` is the TILE query bbox; Overture features are clipped
 * to it, as the reference clips them at fetch time.
 *
 * Returns the JSON `{asphalt, concrete, water, soil, vegetation}` in that
 * canonical z order, ready for `groundCleanV3`. See DEVIATIONS D35.
 */
export function groundMaterialsCompose(roads_fc: string, overture_fc: string, origin_lon: number, origin_lat: number, min_lon: number, min_lat: number, max_lon: number, max_lat: number): string;

/**
 * Compose every tile AND merge and clean them, in ONE kernel call.
 *
 * The fused operation `getArea` calls: `groundMaterialsComposeTiles` followed
 * by `mergeAndCleanTileLayers`, with the intermediate array never built. Tile
 * *i*'s document is composed, merged and dropped before tile *i + 1* is
 * composed, so neither the host nor the kernel holds N per-tile documents.
 *
 * A fused operation takes and returns the SAME opaque documents its parts do
 * (`docs/sdk-data-flow.md`), so running the two steps by hand gives the same
 * bytes.
 *
 * The first five arguments are `groundMaterialsComposeTiles`'s; the last five
 * are `mergeAndCleanTileLayers`'s, unchanged (`defaultLayer` omitted → the
 * clean step's own `asphalt`; `zStep` omitted → 0.05 m, DEVIATIONS D5).
 *
 * An area that composed nothing returns `{}` WITHOUT cleaning.
 */
export function groundMaterialsComposeAndMerge(roads_by_tile: string, overture_fc: string, origin_lon: number, origin_lat: number, tiles: string, latitude: number, longitude: number, distance: number, default_layer?: string | null, z_step?: number | null): string;

/**
 * [`ground_materials_compose_and_merge`] with every document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes.
 */
export function groundMaterialsComposeAndMergeBytes(roads_by_tile: Uint8Array, overture_fc: Uint8Array, origin_lon: number, origin_lat: number, tiles: Uint8Array, latitude: number, longitude: number, distance: number, default_layer?: string | null, z_step?: number | null): Uint8Array;

/**
 * Ground-material layers for EVERY tile of an area, in one call.
 *
 * The tiled twin of `groundMaterialsCompose`: the same clip, the same
 * classification and the same carve per tile, with the area's Overture set
 * parsed once instead of once per tile.
 *
 * `roadsByTile` is `{key: roads FeatureCollection}`, where the key is a
 * rectangle's `chunk` when the entry names one and its own `id` otherwise.
 * Roads are read per READ CHUNK by the host, so a chunk cut into several
 * compose pieces hands its roads over ONCE (D57). A key that matches no
 * rectangle is an error, because a mis-spelled id would silently drop that
 * ground's streets, and a rectangle that names a chunk never falls back to its
 * own id's entry. `overtureFc` is the AREA-level FeatureCollection.
 * `originLon`/`originLat` is the AOI-level frame origin, the SAME for every
 * tile.
 *
 * **The rectangle list is the CALLER'S, and the fetch tiling is not the
 * simulation tiling.** One rectangle covering the whole site is a valid list
 * and is where the hosts are going (fetch once, assign to simulation tiles at
 * payload time); so is a short list of large chunks. Two lists over the same
 * area do NOT give the same geometry — one clip against one rectangle is not
 * the union of four clips against four rectangles, so a feature crossing a
 * former tile seam comes back whole site-level and in pieces grid-level. The
 * operation is deterministic for a given list; the choice of list is the
 * host's, and the host records the change in `docs/DEVIATIONS.md` D48 (host adoption).
 *
 * Returns the JSON of an ARRAY with one entry per tile, in the given order:
 * the tile's `{material: FeatureCollection}` document, or `null` where the
 * tile composed no features. `null` is what the per-tile host path produced
 * for such a tile, so the array feeds `mergeAndCleanTileLayers` unchanged.
 */
export function groundMaterialsComposeTiles(roads_by_tile: string, overture_fc: string, origin_lon: number, origin_lat: number, tiles: string): string;

/**
 * [`ground_materials_compose_tiles`] with every document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes; the area document is
 * viewed once instead of traversed into a JS string and back.
 */
export function groundMaterialsComposeTilesBytes(roads_by_tile: Uint8Array, overture_fc: Uint8Array, origin_lon: number, origin_lat: number, tiles: Uint8Array): Uint8Array;

/**
 * The `geometry-hashes["ground-materials"]` layer value: `composeHash` over
 * every per-material leaf at level `"tile"`, like every other layer (D25).
 *
 * THE supported derivation — material KEY ORDER is irrelevant by construction
 * (the compose sorts), which matters more in JS than anywhere else: engines
 * reorder integer-like object keys and re-serializing proxies change order in
 * transit. Hand-rolling the fold is the footgun this deletes.
 */
export function groundMaterialsLayerHash(layers_json: string): string;

/**
 * Validate a result and return section ranges into the caller's input bytes.
 *
 * The ranges describe the original input layout. They never expose WASM memory.
 */
export function inspectBinaryResult(buffer: Uint8Array, max_total_bytes: bigint, max_metadata_bytes: number, max_sections: number, max_elements_per_section: bigint, max_metadata_depth: number, max_cells: bigint, max_triangle_values: bigint): any;

/**
 * Tree Point features → compact `VegetationInstances` JSON (trees grouped by
 * archetype, per-tree transforms from `height`/`crownDiameter` in
 * `instances_bin`). Render with `archetypeMeshes` instead of a mesh per tree.
 */
export function instancesFromPoints(features_json: string, reference_lon: number, reference_lat: number, registry_json: string, registry_version: string): string;

/**
 * Land-use classification — utilities-service
 * `app/maps/overture/landuse.py::fetch_landuse`.
 *
 * Collapses Overture's free-text `class` / `subtype` spellings into the
 * fixed Infrared vocabulary, consulting `class` first and falling back to
 * `subtype`. Features with no geometry are dropped, so `totalFeatures`
 * and `categorized` differing is the signal that input was discarded.
 *
 * Classification ONLY: the reference also projects to UTM and writes
 * `area_m2`, which this does not — see the kernel module docs.
 *
 * Returns `{"features": FeatureCollection, "metadata": {...}}`.
 */
export function landuseClassify(fc: string): string;

export function lawsonLabels(): string[];

/**
 * Identity of the prettify mask that surface synthesis produces from the
 * geometry behind `geoHash` under these params — the key to cache a mask (or a
 * result carrying one) against.
 *
 * `terrainHash` identifies the terrain the scene was draped onto; pass
 * `undefined`/`null` for no terrain. NOT optional detail: terrain-aware
 * synthesis culls sub-grade sensors, so the same geometry and params produce a
 * different mask with a terrain than without. Hash the terrain's patches with
 * `entityHashMesh` and roll them up with `composeHash`.
 *
 * The three optional synthesis knobs accept `undefined` and fall back to the
 * SAME kernel constants the Python binding defaults to (`surfgridDefaults()`
 * exposes them), so a TS caller never has to hardcode a literal that could
 * drift from the server's value.
 *
 * Mixes in `surfgridVersion()`, so a kernel synthesis change invalidates every
 * cached mask instead of silently serving a stale one. Pass the SAME param
 * values the server resolved (§12f: the 7-tuple is an echoed contract, never
 * mirrored constants). Throws on a malformed hash, an unknown `mode`, a
 * non-finite float param, or a `maxSensors` above 2**32-1.
 */
export function maskHash(geo_hash: string, mode: string, grid_size: number, offset: number, max_sensors: bigint, terrain_hash?: string | null, partial_cells?: boolean | null, min_coverage?: number | null, emit_cell_tris?: boolean | null): string;

/**
 * Return the automatic precedence rank for one material name.
 */
export function materialRank(name: string): number;

/**
 * Merge per-tile material layers and clean the result, in ONE kernel call —
 * the wasm twin of the wheel's `merge_and_clean_tile_layers`.
 *
 * Opaque-document contract: this operation takes an opaque JSON document and
 * returns one. The host parses exactly once, at its own public boundary. A
 * fused operation is an optimisation over a measured chain of such
 * operations — it takes and returns the SAME opaque documents its parts do,
 * so a caller can still run the chain step by step and get the same answer.
 * Parsed handles across the boundary are a later step, not this one.
 *
 * `tileLayersJson` is the same input `mergeTileLayers` takes. The merge
 * (`ir_geo::tiling::ground_merge::merge_tile_layers`) and the clean
 * (`ir_simprep::ground_clean::clean_v3`) both run in Rust, so the host never
 * materializes the merged layer tree between the two steps (bulk-data rule 1).
 * Pass `defaultLayer = undefined` for the clean step's own default
 * (`asphalt`) and `zStep = undefined` for the fixed default (0.05,
 * DEVIATIONS.md D5).
 *
 * An EMPTY merge returns `{}` WITHOUT cleaning, so a host that fetched no
 * features still reports "no ground materials" instead of receiving a default
 * backdrop over an empty area.
 */
export function mergeAndCleanTileLayers(tile_layers_json: string, latitude: number, longitude: number, distance: number, default_layer?: string | null, z_step?: number | null): string;

/**
 * [`merge_and_clean_tile_layers`] with the document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes.
 */
export function mergeAndCleanTileLayersBytes(tile_layers: Uint8Array, latitude: number, longitude: number, distance: number, default_layer?: string | null, z_step?: number | null): Uint8Array;

/**
 * Merge the default center-crop strategy with f32 input, work and output grids.
 */
export function mergeAreaGridCompact(values: Float32Array, positions: Uint32Array, num_rows: number, num_cols: number, config_json: string, polygon_json: string): CompactAreaGrid;

/**
 * Merge Wind with f32 scene storage and bounded f64 block computation.
 * `block` must be 1..=928; omitted means 928. The strategy is directional or directional_blend.
 */
export function mergeAreaGridCompactWind(values: Float32Array, positions: Uint32Array, num_rows: number, num_cols: number, config_json: string, polygon_json: string, strategy_name: string, wind_direction_deg: number, block?: number | null): CompactAreaGrid;

/**
 * Merge concatenated row-major f32 tiles without base64 or a host JSON grid.
 */
export function mergeAreaGridDense(values: Float32Array, positions: Uint32Array, num_rows: number, num_cols: number, config_json: string, polygon_json: string, strategy_name?: string | null, wind_direction_deg?: number | null, block?: number | null): AreaGridMerge;

/**
 * Merge JSON-origin f64 tiles without narrowing their numeric precision.
 */
export function mergeAreaGridDenseF64(values: Float64Array, positions: Uint32Array, num_rows: number, num_cols: number, config_json: string, polygon_json: string, strategy_name?: string | null, wind_direction_deg?: number | null, block?: number | null): AreaGridMerge;

/**
 * Canonical terrain merge → the layout hash's terrain term (D20).
 *
 * `entries_json` = the `ground-geometry` map's VALUES as a JSON list of
 * `{"coordinates": [...], "indices": [...]}` meshes, in ANY order — entries
 * are sorted by their own `entityHashMesh` leaf before the concat, so every
 * derivation path (map iteration order, JS key reordering, re-serializing
 * proxies) converges. THE supported client derivation; hand-rolling the
 * concat is the documented footgun this deletes. Errors on an empty list
 * (terrain-less = absence, never an empty merge).
 */
export function mergeTerrainLeaf(entries_json: string): string;

/**
 * The canonical merged terrain MESH itself (D20) — same sort/concat/rebase
 * as [`merge_terrain_leaf`]; returns a JSON string
 * `{"coordinates": [...], "indices": [...]}` (conform.rs convention).
 * Parity twin of the wheel's `merge_terrain_mesh`.
 */
export function mergeTerrainMesh(entries_json: string): string;

/**
 * `ground_materials.dedup.merge_tile_layers` port. JSON array of per-tile
 * `{layer: FeatureCollection}` (or `null`) → merged+deduped `{layer: FC}` JSON.
 */
export function mergeTileLayers(tile_results_json: string): string;

/**
 * [`merge_tile_layers`] with the document crossing as a `Uint8Array`
 * (WP14-D). Same operation, same bytes: a run merges the per-tile array
 * once per area, and the array is the largest document the host holds.
 */
export function mergeTileLayersBytes(tile_results: Uint8Array): Uint8Array;

/**
 * `infrared_sdk.tiling.merger.merge_tiles` (default centre-crop) port.
 * `tiles_json` = `[{row,col,rows,cols,data_bin}]` (base64-f32); out =
 * `{rows,cols,data_bin}`.
 */
export function mergeTiles(tiles_json: string, num_rows: number, num_cols: number, config_json: string): string;

/**
 * `infrared_sdk.tiling.merger.merge_tiles(strategy="directional")` port — the
 * directional argmax merge with NO Gaussian blend (the sharper sibling of
 * `mergeTilesSmart`). base64-f32 wire like `mergeTiles`. WIND-SPEED ONLY
 * (reliability argmax; f64 mask vs the SDK's f32, within the 1e-5 contract).
 */
export function mergeTilesDirectional(tiles_json: string, num_rows: number, num_cols: number, config_json: string, wind_direction_deg: number): string;

/**
 * `infrared_sdk.tiling.merger_smart.merge_tiles_smart` (`directional_blend`)
 * port — streaming overlap-save FFT blend (DEVIATIONS D11). WIND-SPEED ONLY.
 * base64-f32 wire like `mergeTiles`: the blend is f64 internally, narrowed to
 * f32 on the wire (within the 1e-5 contract at wind magnitudes). `block`
 * (`undefined` → 928) is a perf/memory knob only — the result is identical for
 * any value.
 */
export function mergeTilesSmart(tiles_json: string, num_rows: number, num_cols: number, config_json: string, wind_direction_deg: number, block?: number | null): string;

/**
 * Normalize typed codes without a JSON array or host string for each cell.
 */
export function normalizeAreaCategoricalCompact(codes: Uint32Array, validity: Uint8Array, legends_json: string, tile_cells: number): CompactAreaCategories;

/**
 * Normalize u8 tile indices through one sorted, observed category mapping.
 */
export function normalizeAreaCategoricalDense(values: Uint8Array, legends_json: string, tile_cells: number): CategoricalAreaDense;

/**
 * Normalize JSON category labels through the same canonical mapping.
 */
export function normalizeAreaCategoricalLabels(tiles_json: string, tile_cells: number): CategoricalAreaDense;

/**
 * Normalize mixed binary and JSON categorical tiles in source tile order.
 */
export function normalizeAreaCategoricalMixed(dense_values: Uint8Array, dense_legends_json: string, dense_indices: Uint32Array, label_tiles_json: string, label_indices: Uint32Array, tile_count: number, tile_cells: number): CategoricalAreaDense;

/**
 * Stage 2 (precise gate): does the AOI bbox intersect the city polygon?
 * `polygon_geojson` is the consumer-fetched city outline (Geometry / Feature /
 * FeatureCollection of Polygon/MultiPolygon).
 */
export function overlayAoiIntersectsPolygon(polygon_geojson: string, west: number, south: number, east: number, north: number): boolean;

/**
 * Stage 1 (cheap prefilter): parse `sources.json` and return the cities whose
 * bbox intersects the AOI bbox, as a JSON array of `{id, bbox, polygon_url,
 * layers}`. Never under-includes a city the precise polygon gate would accept.
 */
export function overlayBboxCandidates(sources_json: string, west: number, south: number, east: number, north: number): string;

/**
 * Convenience point-in-polygon (degenerate AOI). Boundary-exclusive, matching
 * shapely `.contains(Point)`.
 */
export function overlayPointInPolygon(polygon_geojson: string, lon: number, lat: number): boolean;

/**
 * Overture R2 file-index: manifest JSON + bbox -> intersecting file URLs.
 */
export function overtureSelectFiles(manifest_json: string, west: number, south: number, east: number, north: number): string[];

/**
 * base64(f32 LE) encode of interleaved xyz f64 coordinates (must be 3n), RAW.
 * Throws on non-finite or non-tile-local values (|coord| >= 1e5, §2.4).
 */
export function packCoordinates(coordinates: Float64Array): string;

/**
 * base64(i32 LE) encode of triangle indices, RAW. Throws on any index >= 2^31
 * — the §2.1 producer bound that keeps the blob readable by signed 32-bit
 * decoders (C#, Java).
 */
export function packIndices(indices: Uint32Array): string;

/**
 * Pack one valid, representable mesh as raw input blobs.
 *
 * Returns `{coordinates_bin, indices_bin}` or `{not_representable: reason}`.
 * Malformed input throws. The regular JavaScript array keeps element types
 * visible until the shared strict wire-index rule validates them.
 */
export function packMesh(coordinates: Float64Array, indices: any): any;

/**
 * Pack explicit typed arrays. Inputs are copied into WASM and never retained.
 * Returned typed arrays own JavaScript storage and do not view WASM memory.
 */
export function packMeshBatch(coordinates: Float64Array, indices: Uint32Array, spans: Uint32Array, max_meshes: number, max_coordinate_values: number, max_indices: number, max_output_bytes: number): any;

/**
 * Pack ordinary arrays with strict index validation before numeric narrowing.
 */
export function packMeshBatchArrays(coordinates: any, indices: any, spans: Uint32Array, max_meshes: number, max_coordinate_values: number, max_indices: number, max_output_bytes: number): any;

/**
 * Element count of a raw packed index blob without decoding it.
 */
export function packedIndexCount(indices_bin: string): number;

/**
 * Who owns what, by id, with no geometry moved.
 *
 * Takes the `{id: mesh}` map itself, not the whole payload, and answers
 * `{"core": [...], "context": [...], "shrink_band": [...], "packed": [...]}`.
 * A host that already holds the meshes calls this rather than
 * `splitFacadeCoreContextReport`: it gets the DECISION and moves its own
 * objects, so no mesh is serialised back out of the kernel.
 *
 * The box is given DIRECTLY here, both axes, rather than as one
 * `inference_size_m` with optional overrides: the older exports carry that
 * shape so a pre-D63 two-argument call keeps meaning what it meant, and a new
 * function need not inherit it. `nominal_*` default to `core_*`, which is the
 * pre-D63 box and reports an empty shrink band.
 *
 * `packed` names the ids decided from `coordinates_bin`. The SDK hosts refuse
 * a tile payload carrying any of them (`docs/DEVIATIONS.md` D63) — a packed
 * mesh on that path was never re-anchored, so its metres are site-frame.
 */
export function partitionFacadeCoreContext(geometries_json: string, core_x_m: number, core_y_m: number, nominal_x_m?: number | null, nominal_y_m?: number | null): string;

/**
 * [`partition_facade_core_context`] from f64 coordinate BUFFERS.
 *
 * `coordinates` is every mesh's flat `[x, y, z, ...]` array, concatenated, as
 * little-endian f64 bytes; `offsets` names where each starts and where the
 * last ends, counting ELEMENTS, so it holds one more entry than `ids`.
 *
 * This is the bulk path: a host with meshes in its own memory reaches the
 * rule without first WRITING a JSON document of them (root `CLAUDE.md`: "do
 * not create host objects only to serialize them back into Rust"). On the
 * Python SDK's F3 facade run that is 0.14 s of packing instead of 2.7 s of
 * `json.dumps` over 121 MB.
 *
 * It carries exactly the meshes whose JSON `coordinates` a host could pack.
 * Anything else — absent, empty or non-numeric coordinates, or geometry in a
 * `coordinates_bin` blob — goes to ``partitionFacadeCoreContext``, which
 * can read the whole mesh; `packed` here is therefore always empty. Choosing
 * a route is an ENCODING decision, never an ownership one, and
 * `crates/ir-geo/tests/facade_ownership.rs` pins the two routes equal.
 */
export function partitionFacadeCoreContextF64(ids: string[], coordinates: Uint8Array, offsets: Uint32Array, core_x_m: number, core_y_m: number, nominal_x_m?: number | null, nominal_y_m?: number | null): string;

/**
 * Return verified exact surface batches as JSON records.
 */
export function planExactSurfaceBatches(geometries_json: string, mode: string, grid_size: number, offset: number, work_budget: bigint, ground_geometry_json: string | null | undefined, auto_align: boolean, partial_cells?: boolean | null, min_coverage?: number | null): string;

/**
 * [`plan_exact_surface_batches`] under a caller's per-job sensor cap in
 * retained sensors. `undefined` is the default plan exactly.
 */
export function planExactSurfaceBatchesCapped(geometries_json: string, mode: string, grid_size: number, offset: number, work_budget: bigint, ground_geometry_json: string | null | undefined, auto_align: boolean, partial_cells?: boolean | null, min_coverage?: number | null, max_sensors_per_job?: number | null): string;

/**
 * Return one kernel reuse plan as JSON.
 */
export function planGeometryReuse(current_json: string, state_json: string, now: number): string;

/**
 * `infrared_sdk.tiling.merger.project_polygon_to_meters` port. GeoJSON Polygon
 * in → `{polygon_meters: [[x,y],...], origin_lon, origin_lat}` JSON (canonical
 * LocalFrame, D1; origin = bbox SW corner). The `polygon_meters` feed
 * `clipToPolygon`. Throws on an invalid polygon (< 2 ring vertices).
 */
export function projectPolygonToMeters(polygon_json: string): string;

/**
 * Recenter coordinates about their centroid; returns the centroid (xyz)
 * followed by the recentered f32 values widened back to f64, flattened:
 * `[cx, cy, cz, x0, y0, z0, ...]` (wasm-bindgen lacks tuple returns).
 */
export function recenterF32(coordinates: Float64Array): Float64Array;

/**
 * `clip ∩ union(rectangles)` as disjoint pieces, x-major then y.
 *
 * `clip` is `[west, south, east, north]`; `rectangles` is the same four
 * fields per rectangle, concatenated flat (length a multiple of 4). Returns
 * the pieces in the same flat shape, one quadruple per piece, in emission
 * order.
 */
export function rectUnionDecompose(clip: Float64Array, rectangles: Float64Array): Float64Array;

/**
 * The fusion tolerance a rectangle set earns, in degrees — see
 * `ir_geo::rect_union` for the derivation.
 */
export function rectUnionSlabToleranceDeg(rectangles: Float64Array): number;

/**
 * Colormap a 2-D grid of f32 (row-major, NaN = no-data) to registry-coloured
 * PNG bytes (`Uint8Array`). Mirror of the Python wheel's
 * `render_grid_registry`.
 *
 * `configJson` is ONE already-resolved `visualConfigurations` entry
 * (`{"colors": [[r, g, b], ..], "steps": .., "colorInterpolation": ..}`) — the
 * host owns the registry fetch and the `process_id` /
 * `process_id:{criteria or subtype}` key resolution, so the kernel stays
 * I/O-free.
 *
 * `reverseRows` is OPTIONAL and defaults to `false`, the same default the
 * Python wheel ships (signature table row 10). `false` emits grid row 0 as
 * the TOP PNG row — what the deployed utilities-service route produces (its
 * `grid[::-1]` and its `imshow(origin="lower")` cancel).
 *
 * The image is 1:1 cell→pixel up to the long-axis cap (DEVIATIONS D9); alpha
 * is 200 for a valid cell and 0 for a no-data one (DEVIATIONS D37).
 *
 * `maxLongAxisPx` is that cap, 960 px when it is omitted — the same default
 * the wheel ships. Above it the grid is sampled nearest-neighbour on the
 * VALUES before colouring, aspect ratio and no-data cells kept. **Pass `0`
 * for the uncapped 1:1 image**: JavaScript cannot tell an omitted argument
 * from an explicit `undefined`, so `0` is the opt-out here where the wheel
 * also accepts `None`.
 */
export function renderGridRegistry(values: Float32Array, width: number, height: number, config_json: string, reverse_rows?: boolean | null, max_long_axis_px?: number | null): Uint8Array;

/**
 * Road-surface normalisation — utilities-service
 * `app/gis/surfaces.py::_to_ir_features`.
 *
 * Takes the RAW FlatGeobuf features and emits the `surface` / `highway` /
 * `name` / `lanes` shape [`ground_materials_compose`] consumes. Ported
 * bug-for-bug: the world file keeps `surface` inside its HSTORE `other_tags`
 * column and exposes no `@id`, so every road comes out `surface: null` and
 * `id: "way/0"` — exactly what the deployed service returns. See DEVIATIONS
 * D36.
 */
export function roadsNormalize(fc: string): string;

export function scalarBboxMeetsContext(bbox: Float64Array, context: Float64Array): boolean;

export function scalarBuildingBboxF64(coordinates: Uint8Array): Float64Array;

export function scalarContextBound(row: number, col: number, step_m: number, inference_size_m: number, context_size_m: number): Float64Array;

export function scalarFrameAffine(lon0: number, lat0: number, lon1: number, lat1: number): Float64Array;

export function scalarPolygonOriginF64(positions: Uint8Array): Float64Array;

export function scalarReanchorF64(coordinates: Uint8Array, affine: Float64Array): Uint8Array;

export function scalarSiteToTileAffine(row: number, col: number, step_m: number, inference_size_m: number, origin_lon: number, origin_lat: number): Float64Array;

export function scalarUnproject(origin_lon: number, origin_lat: number, x: number, y: number): Float64Array;

/**
 * Identity of the sensor LAYOUT — the set AND its order — for reusing a
 * prettify mask across analyses.
 *
 * `entityHashes` are the per-entity leaf hashes (`entityHashMesh`) **in
 * synthesis WALK order** — since SURFGRID_VERSION 2 that is the canonical
 * `(entity_hash, uuid)` order, NOT your map's insertion order. Take the list
 * verbatim from `synthesizeSurfaces(...).entity_hashes`; never rebuild it by
 * hand. Folded IN THAT ORDER and never sorted: sensors are concatenated in
 * walk order, so two differently-ordered leaf lists describe genuinely
 * different layouts. Passing a sorted or `composeHash`-composed value here
 * defeats the purpose — `composeHash` is order-INdependent by design.
 *
 * Takes no `emitCellTris`: that flag decides whether render triangles ride
 * along, never which sensors exist or in what order. Two runs sharing this
 * hash return `values` that align INDEX FOR INDEX, so a cheap
 * `emitCellTris: false` run can be drawn with `cellTris` kept from an earlier
 * `true` run — synthesize the pretty mask once, run N analyses on it.
 *
 * Use `maskHash` instead to identify the mask AS SHIPPED. An EMPTY
 * `entityHashes` is valid: a buildingless tile is a real tile. The optional
 * knobs fall back to the same kernel constants `surfgridDefaults()` exposes.
 * Mixes in `surfgridVersion()`. Throws on a malformed hash, an unknown `mode`,
 * a non-finite float, or a `maxSensors` above 2**32-1.
 */
export function sensorLayoutHash(entity_hashes: string[], mode: string, grid_size: number, offset: number, max_sensors: bigint, terrain_hash?: string | null, partial_cells?: boolean | null, min_coverage?: number | null): string;

/**
 * Move non-owned buildings from `geometries` into `context-geometry`.
 *
 * `coreXM` / `coreYM` are the tile's RE-ANCHORED core extent (D48/D63);
 * omitted, both fall back to `inferenceSizeM` and the call behaves exactly
 * as it did before D63.
 */
export function splitFacadeCoreContext(payload_json: string, inference_size_m: number, core_x_m?: number | null, core_y_m?: number | null): string;

/**
 * [`split_facade_core_context`] returning `{"payload": ..., "shrink_band": [...]}`.
 *
 * `shrink_band` names the buildings the nominal `inferenceSizeM` box would
 * have kept and the re-anchored box hands to the tile east. The host asserts
 * that some tile claimed each of them (D63).
 */
export function splitFacadeCoreContextReport(payload_json: string, inference_size_m: number, core_x_m?: number | null, core_y_m?: number | null): string;

/**
 * The canonical defaults for the three optional synthesis knobs, so a TS caller
 * can import them instead of hardcoding literals that could drift from the
 * kernel. Returns `[partialCells, minCoverage, emitCellTris]`.
 */
export function surfgridDefaults(): any[];

/**
 * Behavioural version of surface synthesis, as mixed into `maskHash`. A
 * consumer caching masks should store this alongside them.
 */
export function surfgridVersion(): number;

/**
 * JSON facts for Uint32Array lengths; a JavaScript array cannot exceed
 * its u32 index space. Python accepts platform-sized `len` values instead.
 */
export function terrainTriangleCap(index_lengths: Uint32Array): string;

/**
 * True when a tile payload of `analysisType` carries the tile centroid as
 * its `latitude` / `longitude`.
 */
export function tileLocationApplies(analysis_type: string): boolean;

/**
 * `infrared_sdk.tiling.transforms.tile_sw_offset` port. `(row, col)` + analysis
 * type → `[offset_x, offset_y]` (meters, relative to the polygon-bbox SW
 * corner; `analysisType` undefined → wind preset). Returned as a length-2
 * Float64Array — the buildings reverse path negates it.
 */
export function tileSwOffset(row: number, col: number, analysis_type?: string | null): Float64Array;

/**
 * `infrared_sdk.tiling.transforms.transform_building_coords` port. Shift a flat
 * `[x,y,z,...]` array (Float64Array) by subtracting `offsetX` from x and
 * `offsetY` from y (z untouched). Throws when the length is not a multiple of 3.
 */
export function transformBuildingCoords(coordinates: Float64Array, offset_x: number, offset_y: number): Float64Array;

/**
 * utilities-service `POST /geometry/transform` port (JSON in/out).
 */
export function translateMeshes(meshes_json: string, origin_x: number, origin_y: number, destination_x: number, destination_y: number): string;

/**
 * Tree attribute normalisation — utilities-service
 * `app/gis/tree_attributes.py`.
 *
 * `source` is `"osm"` for the world FlatGeobuf / Overpass shape, or a city
 * overlay's registry source key. `idPrefix` namespaces overlay ids and
 * defaults to the reference's own fallback, `"city"`.
 */
export function treesNormalize(fc_json: string, source: string, id_prefix?: string | null): string;

/**
 * Inverse of `packCoordinates`: decode a RAW base64(f32 LE) `coordinates_bin`
 * blob back to a flat interleaved xyz coordinate array (§2.4 wire). Throws
 * on malformed base64 or a byte length that is not a whole number of 4-byte
 * f32 lanes — a decoder never guesses at truncated blobs.
 */
export function unpackCoordinates(coordinates_bin: string): Float32Array;

/**
 * Inverse of `packIndices`: decode a RAW base64(i32 LE) `indices_bin` blob back
 * to a triangle-index array (§2.1 wire). Throws on malformed base64 or a
 * byte length that is not a whole number of 4-byte i32 lanes.
 */
export function unpackIndices(indices_bin: string): Uint32Array;

/**
 * Refuse a ground-materials document whose layer keys are not material names
 * the simulation knows (D56, issue #217).
 *
 * `document` is the `{material_name: FeatureCollection}` object as JSON text;
 * the values are never read. Throws with the offending key and the five
 * accepted names — and, for a registry-UUID key, the extra sentence that
 * points at `features[].properties.material`, because the remedy is
 * different. Returns nothing: there is nothing to report when the document is
 * acceptable.
 *
 * This REPLACES `validateGroundMaterialKeys`, which returned unknown names for
 * the host to warn about. A warning let a job run and bill with an unknown
 * material, which is the failure this closes.
 */
export function validateGroundLayers(document: string): void;

/**
 * Validate a complete JSON triangle-index array without coercing its values.
 * One call checks every element and returns a flat copy of the indices.
 */
export function validateMeshIndices(indices_json: string, vertex_count: number): Uint32Array;

/**
 * `infrared_sdk.tiling.validation.validate_polygon` port. JSON GeoJSON Polygon
 * in → validated + winding-normalized JSON Polygon out.
 */
export function validatePolygon(polygon_json: string): string;

/**
 * Read-only scene alignment check (NO mutation) — the worker/scheduler reject
 * gate (`ir_simprep::conform::validate_scene_alignment`). Same geometry inputs
 * as `conformScene` (minus seating opts). `skirtDepthM`/`epsilonM` MUST match
 * the `conformScene` opts the scene was (or would be) seated with; default
 * (when `undefined`) to the kernel consts. Returns a JSON array of
 * `{index, kind, base_z, terrain_z, residual_m}` for every misaligned object
 * (`terrain_z`/`residual_m` are `null` off-terrain). Empty array ⇒ aligned.
 */
export function validateSceneAlignment(solids_json: string, sensor_points: Float64Array, terrain_coordinates: Float64Array, terrain_indices: Uint32Array, skirt_depth_m?: number | null, epsilon_m?: number | null): string;

export function vegetationDimensionKeys(): string;

/**
 * lambda-models in-process vegetation meshing port: Point features +
 * caller-fetched registry JSON -> dotbim meshes (JSON strings throughout).
 */
export function vegetationPointsToMeshes(features_json: string, reference_lon: number, reference_lat: number, registry_json: string): string;

/**
 * The baked production vegetation registry (bare `clientModels` map, 8
 * species, first entry = default) as JSON — feed it to
 * `vegetationPointsToMeshes` / `instancesFromPoints` / `expandInstances` when
 * no fresher registry is at hand. Published with the kernel (2026-07-10
 * decision: the tree models are not secret).
 */
export function vegetationRegistry(): string;

/**
 * The composite production registry document (v1.3.0): four archetypes
 * first, then the legacy species. Untagged trees use the first archetype.
 */
export function vegetationRegistryDocument(): string;

/**
 * Registry version of `vegetationRegistry` — pass as `registryVersion` to the
 * instancing round-trip (its version-skew guard refuses mismatches).
 */
export function vegetationRegistryVersion(): string;

/**
 * Whether this model's trees are boxed, and what decided it.
 *
 * `geometryGroupsJson` is the model's `geometryGroups` from the LIVE
 * `/binary/v1/capabilities` document, as a JSON array, or `"null"` when the
 * caller has not read one. The capability is the AUTHORITY: a model that
 * advertises `vegetation` gets real trees whatever the kernel's fallback list
 * says, which is what stops both SDKs from silently substituting boxes on
 * every paid run the day the backend ships trees on binary wind.
 *
 * Returns the decision tag — `"capability-excludes-vegetation"`,
 * `"capability-lists-vegetation"`, `"fallback-model-list"` or
 * `"model-not-boxed"`.
 */
export function vegetationTreeBoxDecision(model: string, geometry_groups_json: string): string;

/**
 * The tree → box substitution the binary wind routes need, as one call.
 *
 * `vegetationJson` is the body's `vegetation` group, `groundGeometryJson` its
 * `ground-geometry` group (`"null"` when it carries none) and
 * `reservedIdsJson` the ids the geometry group already uses (a JSON array, or
 * `"null"`). A tree whose id names a reserved one is reported instead of
 * boxed — real geometry outranks a stand-in. `centreLon`/`centreLat` are the
 * payload's own `longitude`/`latitude` — the tile CENTRE; the local frame the
 * boxes are emitted in is derived from it.
 *
 * Out: `{"boxes": {id: {mesh_id, coordinates, indices}}, "trees": n,
 * "boxesSent": n, "seatedOnTerrain": n, "outsideTile": n, "idCollisions": [],
 * "footprintM": 1.8, "heightM": 3.5}` as JSON. Every count is of boxes
 * ACTUALLY EMITTED, so the host merges `boxes` into the geometry group and
 * records the rest without arithmetic; it re-implements nothing (ADR 0006).
 */
export function vegetationTreesToBoxes(vegetation_json: string, ground_geometry_json: string, centre_lon: number, centre_lat: number, reserved_ids_json: string): string;

/**
 * Return the kernel's tagged acknowledgement verdict as JSON.
 */
export function verifyGeometryAck(accept_body_json: string, expected_groups: string[]): string;

/**
 * Build a pedestrian walk graph from Overture segments and connectors.
 *
 * `segments` and `connectors` are the FeatureCollections the host has
 * already read. The graph is placed in the frame at (`originLon`,
 * `originLat`) — pass the same origin the rest of the scene uses.
 *
 * Returns `{"nodes": {id: {x, y}}, "edges": [{from, to, length, travelTime
 * as travel_time, road_class, surface, coordinates}], "metadata": {…}}`.
 * Lengths are local-frame metres, NOT the reference's UTM metres
 * (`docs/DEVIATIONS.md` D137).
 *
 * Every cut is returned. `metadata.distinct_pairs` is what a
 * `networkx.Graph` would collapse `edges` to.
 */
export function walkGraphBuild(segments: string, connectors: string, origin_lon: number, origin_lat: number, walk_speed_kph: number): string;

/**
 * Filter a station `data` object's hourly arrays to the indices matching
 * `time_period_json` (verbatim `_matches_time_range` semantics: month/hour
 * wrap-around, equality when `start == end`, an inclusive day range with
 * no wrap, EPW hours 1-24 normalised to 0-23 before comparison).
 * `time_period_json` fields are snake_case: `start_month`, `start_day`,
 * `start_hour`, `end_month`, `end_day`, `end_hour`.
 */
export function weatherFilterHours(station_json: string, time_period_json: string): string;

/**
 * The versioned identity of a `weather_document`: `sha256:<hex>` over the
 * framed input of contract section 9 — proof that two runs used the same
 * weather.
 *
 * It hashes the validated VALUES, the location, the calendar columns and
 * the hour basis; never the file name, the raw text or a station id, so
 * two files with the same readings and different spacing share one
 * identity. A document that cannot supply one throws, rather than being
 * given the current file's weather.
 */
export function weatherIdentity(document: string): string;

/**
 * Select the snake_case weather arrays one model needs from a
 * `weather_document` (contract sections 7 and 10).
 *
 * `requestJson` carries `analysis_type`, the optional `subtype`, the
 * `time_period` window and the optional `solar_model`. `solar_model`
 * belongs to `energy-balance`, the one analysis whose worker reads it;
 * elsewhere it is refused, never ignored. The window is
 * applied first, then the required fields are checked ON THE FILTERED
 * ROWS, then the period rule — so a gap outside the window is harmless, a
 * gap inside it throws, and a model that needs a full year throws when the
 * window is shorter. Every one of those reaches the caller BEFORE a
 * request is submitted.
 */
export function weatherModelInputs(document: string, request_json: string): string;

/**
 * Rank `catalog_json`'s stations by great-circle distance from
 * `(lat, lon)`, matching MongoDB's `$geoNear`: spherical distance at
 * Earth radius 6378.1 km, radius cutoff, `limit` results, ascending,
 * ties broken by catalog (input) order. Returns a JSON array of
 * `{uuid, fileName, location_data}`.
 */
export function weatherNearestStations(catalog_json: string, lat: number, lon: number, radius_km: number, limit: number): string;

/**
 * Parse one EPW file's text into a `weather_document` (contract sections
 * 3-8): the location, the period, the 34 hour-indexed arrays with a `null`
 * for every gap, the gap row indexes, and the document's own identity.
 *
 * `text` is the whole file — the HOST reads the file and the kernel parses
 * text (root `CLAUDE.md` rule 1). `optionsJson` is the options object,
 * `"null"` or `"{}"` for the defaults; `max_bytes` and `max_rows` may only
 * be TIGHTENED, and an unknown option throws rather than being ignored.
 *
 * **This side takes a JavaScript string only.** The wheel's twin also
 * accepts `bytes`, and with them the whole-input Latin-1 fallback for the
 * older files whose station names are not UTF-8. A TypeScript host must
 * therefore decode the file itself; `TextDecoder("windows-1252")` is the
 * equivalent of that fallback. The kernel's behaviour is identical once
 * the text arrives — only the accepted INPUT set differs, because
 * wasm-bindgen strings are already UTF-8 by the time they reach Rust.
 *
 * Throws with a message that names the row or the field for every
 * rejection, so a caller learns what is wrong with their file before a
 * request is submitted.
 */
export function weatherParseEpw(text: string, options_json: string): string;

/**
 * The versioned identity of one RUN's weather: `sha256:<hex>` over the
 * framed input of contract section 9.1 — proof that two runs SUBMITTED the
 * same weather, whatever source it came from.
 *
 * `inputsJson` is one object: `latitude`, `longitude`, the six-integer
 * `window` (`start_month` .. `end_hour`) and `columns`, a map of
 * snake_case column name to an array of finite numbers. It hashes what a
 * request carries — never a file, a station or a row outside the window —
 * so a catalog run, a hand-built run and a bring-your-own-file run all get
 * one identity of one shape.
 *
 * Call it ONCE PER RUN, over the arrays the prepared payload holds, never
 * per tile. Throws when a member is missing or a value is not finite.
 */
export function weatherRunIdentity(inputs_json: string): string;

/**
 * The ordinal for one wind-comfort class label, or `undefined` when the
 * reference does not know it (which makes the cell no-data).
 */
export function windClassOrdinal(label: string): number | undefined;

/**
 * The wind-comfort class table as a JSON object, e.g.
 * `{"A":0.0,..,"S":5.0,"S15":5.0,"S20":6.0}`.
 *
 * The host maps class strings to these ordinals before calling
 * `renderGridRegistry`; a label outside the table is no-data (NaN), never a
 * clamped class. Byte-identical to the Python wheel's `wind_class_ordinals`.
 */
export function windClassOrdinals(): string;

/**
 * utilities-service `POST /convert/mesh-to-file` port. `guid` is
 * caller-provided (no RNG in the kernel).
 */
export function wrapMeshToBimFile(mesh_json: string, guid: string): string;

/**
 * Deflate `payload` into the one-entry `payload.json` ZIP archive every
 * json submit body and geometry-reference document uses: the same
 * deterministic, fixed-timestamp writer as the D101 tile artifacts
 * (`ir_simprep::site_artifacts::zip_payload_json`), always DEFLATE. Replaces
 * `internal/zip.ts`.
 */
export function zipPayloadJson(payload: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_areagridmerge_free: (a: number, b: number) => void;
    readonly __wbg_categoricalareadense_free: (a: number, b: number) => void;
    readonly __wbg_griddecode_free: (a: number, b: number) => void;
    readonly __wbg_griddocumentdecode_free: (a: number, b: number) => void;
    readonly __wbg_resultarchivedecode_free: (a: number, b: number) => void;
    readonly __wbg_site_free: (a: number, b: number) => void;
    readonly __wbg_surfacearchive_free: (a: number, b: number) => void;
    readonly __wbg_surfaceareamerger_free: (a: number, b: number) => void;
    readonly archetypeMeshes: () => [number, number, number, number];
    readonly areagridmerge_bounds: (a: number) => any;
    readonly areagridmerge_shape: (a: number) => any;
    readonly areagridmerge_values: (a: number) => any;
    readonly assignBuildingsToTiles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly assignGroundMaterialsToTiles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly assignVegetationToTiles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly batchBuildings: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly bboxMeetsRows: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly buildCatMap: (a: number, b: number) => [number, number, number, number];
    readonly buildingsAssignAndExtrude: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly buildingsAssignAndExtrudeBytes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly buildingsAssignAndExtrudeWithAttributes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly buildingsAssignAndExtrudeWithAttributesBytes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly buildingsNormalize: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly canonicalMetadataJson: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly categoricalareadense_legend: (a: number) => any;
    readonly categoricalareadense_values: (a: number) => any;
    readonly checkMaxSensorsPerJob: (a: number) => [number, number];
    readonly clipToPolygon: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly composeHash: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly composeTilePayloads: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly computeGridBounds: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly configHash: (a: number, b: number) => [number, number];
    readonly conformScene: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => [number, number, number, number];
    readonly coreVersion: () => [number, number];
    readonly countSurfaces: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => [bigint, number, number];
    readonly decodeBinaryResult: (a: any, b: bigint, c: number, d: number, e: bigint, f: number, g: bigint, h: bigint) => [number, number, number];
    readonly decodeGridDocument: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly decodeGridResponse: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly decodeResultArchive: (a: number, b: number) => [number, number, number];
    readonly decodeSurfaceArchive: (a: number, b: number, c: bigint, d: number, e: bigint, f: bigint) => [number, number, number];
    readonly decodeSurfaceIdentity: (a: number, b: number) => [number, number, number, number];
    readonly dedupMaterialFeatures: (a: number, b: number) => [number, number, number, number];
    readonly dedupTrees: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly dedupVegetationFeatures: (a: number, b: number) => [number, number, number, number];
    readonly defaultPrecedence: () => [number, number];
    readonly dropToGrade: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly encodeCategoricalGrid: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly encodeGeometryDocument: (a: number, b: number, c: any, d: any, e: number, f: bigint, g: number, h: number, i: bigint, j: number, k: bigint, l: bigint) => [number, number, number];
    readonly entityHashGroundLayer: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly entityHashInstances: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly entityHashMesh: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly estimateCellsUpperBound: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number) => [bigint, number, number];
    readonly estimateSunContextLoss: (a: number, b: bigint, c: bigint, d: bigint, e: bigint, f: bigint, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number) => [number, number, number, number];
    readonly expandInstances: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly extrudeFootprintsToDotbim: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly extrudeFootprintsWithAttributes: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly fgbDecodeRangeFeatures: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly fgbIndexSearchStep: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: any, i: number, j: number) => [number, number, number];
    readonly fgbLayout: (a: number, b: number) => [number, number, number];
    readonly fgbToFeatures: (a: number, b: number) => [number, number, number, number];
    readonly fgbToFeaturesBbox: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly frameReanchor: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly frameReanchorBytes: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly generateTilesForPolygon: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly geojsonLayersToDotbim: (a: number, b: number) => [number, number, number, number];
    readonly geometryArtifact: (a: number, b: number, c: number, d: bigint, e: number, f: bigint, g: bigint) => [number, number, number];
    readonly geometryGroupHash: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly geometryGroups: () => any;
    readonly getTilingConfig: (a: number, b: number) => [number, number, number, number];
    readonly gridToPng: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number) => [number, number, number, number];
    readonly griddecode_data: (a: number) => any;
    readonly griddecode_dtype: (a: number) => [number, number];
    readonly griddecode_kind: (a: number) => [number, number];
    readonly griddecode_legend: (a: number) => [number, number];
    readonly griddecode_shape: (a: number) => any;
    readonly griddocumentdecode_finiteNumbersValidated: (a: number) => number;
    readonly griddocumentdecode_route: (a: number) => [number, number];
    readonly groundCleanV3: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly groundCleanV3OnTerrain: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number, number, number];
    readonly groundMaterialLeaves: (a: number, b: number) => [number, number, number, number];
    readonly groundMaterialsCompose: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number, number];
    readonly groundMaterialsComposeAndMerge: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number, number, number];
    readonly groundMaterialsComposeAndMergeBytes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number, number, number];
    readonly groundMaterialsComposeTiles: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly groundMaterialsComposeTilesBytes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly groundMaterialsLayerHash: (a: number, b: number) => [number, number, number, number];
    readonly inspectBinaryResult: (a: any, b: bigint, c: number, d: number, e: bigint, f: number, g: bigint, h: bigint) => [number, number, number];
    readonly instancesFromPoints: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly landuseClassify: (a: number, b: number) => [number, number, number, number];
    readonly lawsonLabels: () => [number, number];
    readonly maskHash: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number, number, number];
    readonly materialRank: (a: number, b: number) => number;
    readonly mergeAndCleanTileLayers: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly mergeAndCleanTileLayersBytes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number, number];
    readonly mergeAreaGridCompact: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number];
    readonly mergeAreaGridCompactWind: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => [number, number, number];
    readonly mergeAreaGridDense: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number, number];
    readonly mergeAreaGridDenseF64: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number, number];
    readonly mergeTerrainLeaf: (a: number, b: number) => [number, number, number, number];
    readonly mergeTerrainMesh: (a: number, b: number) => [number, number, number, number];
    readonly mergeTileLayers: (a: number, b: number) => [number, number, number, number];
    readonly mergeTileLayersBytes: (a: number, b: number) => [number, number, number, number];
    readonly mergeTiles: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly mergeTilesDirectional: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly mergeTilesSmart: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly normalizeAreaCategoricalCompact: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly normalizeAreaCategoricalDense: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly normalizeAreaCategoricalLabels: (a: number, b: number, c: number) => [number, number, number];
    readonly normalizeAreaCategoricalMixed: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly overlayAoiIntersectsPolygon: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly overlayBboxCandidates: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly overlayPointInPolygon: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly overtureSelectFiles: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly packCoordinates: (a: number, b: number) => [number, number, number, number];
    readonly packIndices: (a: number, b: number) => [number, number, number, number];
    readonly packMesh: (a: number, b: number, c: any) => [number, number, number];
    readonly packMeshBatch: (a: any, b: any, c: any, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly packMeshBatchArrays: (a: any, b: any, c: any, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly packedIndexCount: (a: number, b: number) => [number, number, number];
    readonly partitionFacadeCoreContext: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly partitionFacadeCoreContextF64: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number, number];
    readonly planExactSurfaceBatches: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number, number, number];
    readonly planExactSurfaceBatchesCapped: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number, number, number];
    readonly planGeometryReuse: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly projectPolygonToMeters: (a: number, b: number) => [number, number, number, number];
    readonly recenterF32: (a: number, b: number) => [number, number];
    readonly rectUnionDecompose: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly rectUnionSlabToleranceDeg: (a: number, b: number) => [number, number, number];
    readonly renderGridRegistry: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly resultarchivedecode_data: (a: number) => any;
    readonly resultarchivedecode_document: (a: number) => any;
    readonly resultarchivedecode_dtype: (a: number) => [number, number];
    readonly resultarchivedecode_kind: (a: number) => [number, number];
    readonly resultarchivedecode_legend: (a: number) => [number, number];
    readonly resultarchivedecode_route: (a: number) => [number, number];
    readonly resultarchivedecode_shape: (a: number) => any;
    readonly roadsNormalize: (a: number, b: number) => [number, number, number, number];
    readonly scalarBboxMeetsContext: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly scalarBuildingBboxF64: (a: number, b: number) => [number, number, number, number];
    readonly scalarContextBound: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly scalarFrameAffine: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly scalarPolygonOriginF64: (a: number, b: number) => [number, number, number, number];
    readonly scalarReanchorF64: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly scalarSiteToTileAffine: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly scalarUnproject: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly sensorLayoutHash: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number) => [number, number, number, number];
    readonly site_allTileIds: (a: number) => [number, number, number, number];
    readonly site_artifacts: (a: number, b: number, c: number, d: number, e: bigint, f: number, g: bigint, h: bigint) => [number, number, number];
    readonly site_bodies: (a: number, b: number, c: number) => [number, number, number];
    readonly site_checkTerrain: (a: number, b: number, c: number) => [number, number];
    readonly site_facadeBatches: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly site_facadeFrames: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: bigint, p: number, q: bigint, r: bigint) => [number, number, number];
    readonly site_identity: (a: number, b: number, c: number) => [number, number, number];
    readonly site_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number, x: number, y: number, z: number, a1: number, b1: number, c1: number, d1: number, e1: number, f1: number, g1: number, h1: number, i1: number, j1: number, k1: number) => [number, number, number];
    readonly site_tileCount: (a: number) => number;
    readonly site_unowned: (a: number) => [number, number];
    readonly splitFacadeCoreContext: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly splitFacadeCoreContextReport: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly surfacearchive_cellAreaState: (a: number) => any;
    readonly surfacearchive_cellTrisState: (a: number) => any;
    readonly surfacearchive_route: (a: number) => [number, number];
    readonly surfacearchive_takeCellArea: (a: number) => [number, number, number];
    readonly surfacearchive_takeFieldsJson: (a: number) => [number, number, number, number];
    readonly surfacearchive_takeRootJson: (a: number) => [number, number, number, number];
    readonly surfacearchive_valueOffsets: (a: number) => any;
    readonly surfaceareamerger_finish: (a: number) => [number, number, number];
    readonly surfaceareamerger_new: () => number;
    readonly surfaceareamerger_pushArchive: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly surfgridDefaults: () => [number, number];
    readonly surfgridVersion: () => number;
    readonly synthesizeSurfaces: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number, number];
    readonly synthesizeSurfacesFromCapture: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number, number];
    readonly synthesizeSurfacesFromCaptures: (a: any, b: any, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number) => [number, number];
    readonly synthesizeSurfacesOnTerrain: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number) => [number, number, number];
    readonly terrainTriangleCap: (a: number, b: number) => [number, number];
    readonly tileLocationApplies: (a: number, b: number) => number;
    readonly tileSwOffset: (a: number, b: number, c: number, d: number) => [number, number];
    readonly transformBuildingCoords: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly translateMeshes: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly treesNormalize: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly unpackCoordinates: (a: number, b: number) => [number, number, number, number];
    readonly unpackIndices: (a: number, b: number) => [number, number, number, number];
    readonly validateGroundLayers: (a: number, b: number) => [number, number];
    readonly validateMeshIndices: (a: number, b: number, c: number) => [number, number, number, number];
    readonly validatePolygon: (a: number, b: number) => [number, number, number, number];
    readonly validateSceneAlignment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number, number];
    readonly vegetationDimensionKeys: () => [number, number];
    readonly vegetationPointsToMeshes: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly vegetationRegistry: () => [number, number];
    readonly vegetationRegistryDocument: () => [number, number];
    readonly vegetationRegistryVersion: () => [number, number];
    readonly vegetationTreeBoxDecision: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly vegetationTreesToBoxes: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly verifyGeometryAck: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly walkGraphBuild: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly weatherFilterHours: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly weatherIdentity: (a: number, b: number) => [number, number, number, number];
    readonly weatherModelInputs: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly weatherNearestStations: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly weatherParseEpw: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly weatherRunIdentity: (a: number, b: number) => [number, number, number, number];
    readonly windClassOrdinal: (a: number, b: number) => number;
    readonly windClassOrdinals: () => [number, number];
    readonly wrapMeshToBimFile: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly zipPayloadJson: (a: any) => any;
    readonly __wbg_compactareacategories_free: (a: number, b: number) => void;
    readonly compactareacategories_values: (a: number) => any;
    readonly compactareagrid_bounds: (a: number) => any;
    readonly __wbg_compactareagrid_free: (a: number, b: number) => void;
    readonly compactareagrid_values: (a: number) => any;
    readonly compactareagrid_shape: (a: number) => any;
    readonly compactareacategories_legend: (a: number) => any;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
