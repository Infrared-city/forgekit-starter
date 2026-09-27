export type WasmCore = typeof import("../../generated/infrared-core.js");
export interface CoreSource {
    readonly source: string | URL | BufferSource | WebAssembly.Module;
    readonly identity: object | string;
}
/**
 * Every kernel export this SDK version calls, plus the wasm-bindgen runtime
 * symbols the glue needs.
 *
 * The list is the ONE matched-kernel check. Nothing in this package probes a
 * name to decide between a newer and an older way of doing the same work, so
 * a core that does not match the SDK is one loud failure here rather than a
 * `TypeError` at the call, or worse, a quietly different result.
 *
 * `tests/required-exports.wasm.test.ts` scans the source for kernel accesses
 * and fails when a name is called but not listed, so this cannot drift.
 */
export declare const REQUIRED_FUNCTION_EXPORTS: readonly ["coreVersion", "geometryGroups", "geometryGroupHash", "configHash", "dropToGrade", "planGeometryReuse", "verifyGeometryAck", "getTilingConfig", "validatePolygon", "generateTilesForPolygon", "__wbg_site_free", "site_new", "site_allTileIds", "site_bodies", "site_artifacts", "geometryArtifact", "site_facadeBatches", "site_facadeFrames", "site_checkTerrain", "site_identity", "site_unowned", "checkMaxSensorsPerJob", "tileLocationApplies", "bboxMeetsRows", "terrainTriangleCap", "scalarPolygonOriginF64", "projectPolygonToMeters", "mergeAreaGridDense", "mergeAreaGridDenseF64", "mergeAreaGridCompact", "mergeAreaGridCompactWind", "normalizeAreaCategoricalCompact", "groundCleanV3", "gridToPng", "packedIndexCount", "tileSwOffset", "decodeSurfaceIdentity", "synthesizeSurfaces", "synthesizeSurfacesFromCaptures", "frameReanchorBytes", "vegetationRegistryDocument", "rectUnionDecompose", "rectUnionSlabToleranceDeg", "vegetationTreeBoxDecision", "windClassOrdinals", "overlayAoiIntersectsPolygon", "overlayBboxCandidates", "fgbLayout", "fgbIndexSearchStep", "fgbDecodeRangeFeatures", "treesNormalize", "dedupTrees", "dedupVegetationFeatures", "roadsNormalize", "groundMaterialsCompose", "validateGroundLayers", "groundMaterialsComposeAndMergeBytes", "buildingsAssignAndExtrudeBytes", "buildingsNormalize", "vegetationPointsToMeshes", "overtureSelectFiles", "weatherNearestStations", "weatherFilterHours", "weatherParseEpw", "weatherIdentity", "weatherModelInputs", "weatherRunIdentity", "renderGridRegistry", "packMesh", "canonicalMetadataJson", "decodeBinaryResult", "inspectBinaryResult", "decodeGridDocument", "decodeResultArchive", "decodeSurfaceArchive", "zipPayloadJson", "__wbindgen_malloc", "__wbindgen_realloc", "__wbindgen_free", "__wbindgen_exn_store", "__wbindgen_start", "__externref_table_alloc", "__externref_table_dealloc", "__externref_drop_slice", "__wbg_griddocumentdecode_free", "griddocumentdecode_route", "griddocumentdecode_finiteNumbersValidated", "__wbg_areagridmerge_free", "__wbg_categoricalareadense_free", "__wbg_surfaceareamerger_free", "__wbg_surfacearchive_free", "areagridmerge_values", "areagridmerge_shape", "areagridmerge_bounds", "categoricalareadense_values", "categoricalareadense_legend", "surfacearchive_route", "surfacearchive_takeRootJson", "surfacearchive_takeFieldsJson", "surfacearchive_takeCellArea", "surfacearchive_valueOffsets", "surfacearchive_cellAreaState", "surfacearchive_cellTrisState", "surfaceareamerger_new", "surfaceareamerger_pushArchive", "surfaceareamerger_finish"];
export declare function initializeCoreSource(source?: CoreSource): Promise<void>;
export declare function requireCore(): WasmCore;
