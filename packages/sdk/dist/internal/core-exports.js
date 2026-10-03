export const REQUIRED_FUNCTION_EXPORTS = [
    "coreVersion",
    // The bundled kernel's roof-gate version (infrared-core #674): every
    // surface request names it, so the worker runs the gate this SDK was
    // tested against instead of guessing from an absent field.
    "surfgridVersion",
    "geometryGroups",
    // Geometry schema 2 (D206): the body fields the geometry document carries,
    // the schema this kernel writes, and the one per-job sensor budget.
    "binaryGeometryFields",
    "geometrySchemaVersion",
    "maxSensorsPerJob",
    "geometryGroupHash",
    // The schedule identity (audit M8b, D81): sha256 of the canonical config
    // JSON (sorted keys, 6dp half-away rounding, integral collapse). Replaces
    // this package's own `bankersRound6` fold.
    "configHash",
    // D91: the wind family's datum — every supplied mesh's own lowest point to
    // z = 0, one pass over the packed site at the plan seam.
    "dropToGrade",
    "planGeometryReuse",
    "verifyGeometryAck",
    "getTilingConfig",
    "validatePolygon",
    "generateTilesForPolygon",
    // The SITE (D84, D90, WS2) and the ARENA (D98): membership, ownership and
    // every tile's finished group bodies with their reuse identities, for the
    // whole grid, from ONE copy of the site the kernel reads and keeps. The
    // kernel's `composeTilePayloads` driver is no longer called from this
    // package. A `#[wasm_bindgen]` CLASS appears in the instance as its
    // methods, so the class name itself is not listable here —
    // `tests/required-exports.wasm.test.ts` maps it onto these.
    "__wbg_site_free",
    "site_new",
    // D200: the site's terrain read once per content, and the site built on it.
    "__wbg_siteterrain_free",
    "siteterrain_new",
    "siteterrain_groupHash",
    "site_withTerrain",
    "site_allTileIds",
    "site_bodies",
    // D101: every tile's IRBF artifact from the same site, and one body's for
    // the direct `submit` path — the kernel packs, frames, zips and digests.
    "site_artifacts",
    "geometryArtifact",
    // The facade batches, planned from the same kept site, and every batch's
    // selected body, capture and artifact (D156: its targets, the rest as
    // context) from one call per tile, as the Python host does
    // (`area/site-facade.ts`, WP3).
    "site_facadeBatches",
    "site_facadeFrames",
    "site_checkTerrain",
    "site_identity",
    "site_unowned",
    // `splitFacadeCoreContext` and its report twin are NOT here: the kernel
    // `Site` plans every facade job (`site_facadeBatches`), so this package
    // calls neither. The kernel still exports both.
    // `partitionFacadeCoreContext` and its `...F64` twin are NOT here: the site
    // pass answers `core`, the shrink band, the demoted ids and `unowned` for the
    // whole grid in one call, so this package no longer asks per tile (D90). The
    // kernel still exports both, for a caller composing tiles itself.
    // D158: the cap's one validation rule, checked before any planning. The
    // exact planner itself runs inside `site_facadeBatches`; the kernel still
    // exports `planExactSurfaceBatchesCapped` for a caller composing tiles.
    "checkMaxSensorsPerJob",
    // D160: four small rules this package used to restate, now asked of the
    // kernel as the Python host does — which analyses get the tile location,
    // the Overture bbox membership, the terrain triangle cap, and the polygon
    // frame origin.
    "tileLocationApplies", "bboxMeetsRows", "terrainTriangleCap",
    "scalarPolygonOriginF64", "projectPolygonToMeters",
    "mergeAreaGridDense",
    "mergeAreaGridDenseF64",
    "mergeAreaGridCompact",
    "mergeAreaGridCompactWind",
    // `normalizeAreaCategoricalLabels` is NOT here: D107 moved the JSON route's
    // categorical decode into the kernel too, so every categorical tile now
    // carries a `CompactCategory` dictionary and merges through
    // `normalizeAreaCategoricalCompact` — nothing calls the labels-only form
    // any more. The kernel still exports it.
    "normalizeAreaCategoricalCompact",
    "groundCleanV3",
    "gridToPng",
    "packedIndexCount",
    "tileSwOffset",
    // Facade "pretty mode" (ADR 0008, D88): the SDK draws the per-cell render
    // geometry with the kernel it already bundles instead of downloading 12.6x
    // the body from the server. The area merge synthesizes inside the one-call
    // join (`joinSurfaceJobs`, below).
    "synthesizeSurfaces",
    // The public mesh utility `cleanMesh` (#555, D208).
    "cleanMesh",
    // The exact per-tile re-anchor. It replaced the constant-offset loop the
    // host used to run per mesh (D48), which is why `transformBuildingCoords`
    // is no longer on this list: the kernel still exports it, both bindings
    // still ship it, and nothing in this package calls it any more.
    "frameReanchorBytes",
    "vegetationRegistryDocument",
    // The rectangle-union decomposition every site-chunk / building-extrude
    // compose calls (D57 / rect-union kernel port): `chunk ∩ union(tile
    // rectangles)`, replacing this package's own `geodata/rect-union.ts`.
    "rectUnionDecompose",
    // Daylight-factor floor parts (`parts/`, D221): plan, part body, join.
    "daylightParts", "daylightPartBody", "daylightMerge", "interiorArtifact",
    // The binary daylight-factor result (family 7, D232): views, binary join,
    // JSON projection both ways.
    "decodeDaylightResult", "daylightMergeBinary", "daylightJsonFromFrame", "daylightFrameFromJson",
    // The same port's tolerance export, called by the public
    // `slabToleranceDeg` measurement helper (`geodata/rect-union-metrics.ts`).
    "rectUnionSlabToleranceDeg",
    // Trees as boxes on the binary wind routes (D70). Without these the SDK
    // cannot honour a binary wind/PWC body that carries vegetation at all.
    "vegetationTreeBoxDecision",
    // The default transport (D196); the send budget (#556); the poll schedule (D213).
    "defaultTransport", "sendBudgetSeconds", "sendStallSeconds", "pollIntervalSeconds",
    "pollErrorDelaySeconds", "pollDefaultTimeoutSeconds", "pollFirstDelaySeconds",
    // The area retry plan and its idempotency key, and the same-key resend budget (D224). See `area/retry-plan.ts`.
    "areaIdempotencyKey", "planAreaRetry",
    "submitResendDelaySeconds", "classifySubmitSend",
    "windClassOrdinals",
    "overlayAoiIntersectsPolygon",
    "overlayBboxCandidates",
    // `mergeTileLayers` and `mergeAndCleanTileLayers` are NOT here:
    // `groundMaterialsComposeAndMergeBytes` composes, merges and cleans in one
    // call, so nothing in this SDK calls either any more (D48). The kernel still
    // exports both.
    // Direct data acquisition: the kernel is the ONLY FlatGeobuf reader and
    // the ONLY normaliser, so a build without these exports cannot serve the
    // shipped paths. Naming them here makes the mismatch one loud failure at
    // initialization instead of a per-path probe that silently picks older
    // semantics.
    "fgbLayout",
    "fgbIndexSearchStep",
    "fgbDecodeRangeFeatures",
    "treesNormalize",
    "dedupTrees",
    "dedupVegetationFeatures",
    "roadsNormalize",
    "groundMaterialsCompose",
    // The submission gate (WP20/D56): an unknown ground-material layer name is
    // the model's UNKNOWN material row — a job that succeeds, bills and returns
    // a wrong thermal result. The kernel owns the list of five names.
    "validateGroundLayers",
    // The site-level tiling operations (WP13), adopted by the acquisition path
    // in WP14-A: one compose+merge+clean per site, one assign+extrude per site.
    "groundMaterialsComposeAndMergeBytes",
    // The bytes twin (WP14-D): the same kernel operation, with each document
    // crossing as a `Uint8Array` instead of a JS string. The Python binding
    // has taken `str | bytes` and returned `bytes` from the start, so this is
    // a wasm idiom, not a second operation — the parity gate folds it onto
    // `buildingsAssignAndExtrude`, which is why the string form is no longer
    // listed: nothing in this package calls it.
    "buildingsAssignAndExtrudeBytes",
    "buildingsNormalize",
    // `extrudeFootprintsToDotbim` is NOT here: `buildingsAssignAndExtrude`
    // superseded it on every shipped path (D48). The kernel still exports it and
    // the frame gate still uses it as its independent reference, but this SDK
    // does not call it.
    "vegetationPointsToMeshes",
    "overtureSelectFiles",
    // Static weather: the two kernel operations behind the three public
    // weather methods.
    "weatherNearestStations",
    "weatherFilterHours",
    // Bring-your-own weather. A core without these cannot parse an EPW file,
    // cannot prove which weather a run used and cannot select a model's
    // arrays — each of them a shipped path, so a missing one is one loud
    // failure at initialization, not a TypeError at the call.
    "weatherParseEpw",
    "weatherIdentity",
    "weatherModelInputs",
    // The RUN identity. Without it no weather-bearing run can be resumed at
    // all: the schedule records this value for every weather source.
    "weatherRunIdentity",
    "renderGridRegistry", "legendRange", "sharedLegendRange", "registryFixedRange",
    "packMesh",
    // The canonical JSON writer behind every binary submission envelope. It
    // reached the kernel through a local `ReturnType<typeof requireCore> & {…}`
    // cast for months, so `initializeCore()` never checked for it and the one
    // matched-kernel list this package has was not true (ADR 0013, audit M5).
    "canonicalMetadataJson",
    "decodeBinaryResult",
    "inspectBinaryResult",
    "decodeGridDocument",
    // The area grid merge's tile decode (D107): inflate a downloaded result
    // archive and flatten a JSON grid in one crossing, or hand back an IRBF
    // document for `decodeBinaryResult`/`inspectBinaryResult` to decode.
    "decodeResultArchive",
    // The area SURFACE merge: each download decoded as it arrives (WP4), then
    // the whole run joined into columns in one call, triangles included (D197).
    "decodeSurfaceArchive",
    "decodeSurfaceArchives",
    "joinSurfaceJobs",
    // Brief J (D106): the deterministic `payload.json` ZIP writer every json
    // submit body and geometry-reference document uses. Replaces
    // `internal/zip.ts` (`fflate`), deleted in the same PR.
    "zipPayloadJson",
    "__wbindgen_malloc",
    "__wbindgen_realloc",
    "__wbindgen_free",
    "__wbindgen_exn_store",
    "__wbindgen_start",
    "__externref_table_alloc",
    "__externref_table_dealloc",
    "__externref_drop_slice",
    "__wbg_griddocumentdecode_free",
    "griddocumentdecode_route",
    "griddocumentdecode_finiteNumbersValidated",
    "__wbg_areagridmerge_free",
    "__wbg_categoricalareadense_free",
    "__wbg_surfacearchive_free",
    "areagridmerge_values",
    "areagridmerge_shape",
    "areagridmerge_bounds",
    "categoricalareadense_values",
    "categoricalareadense_legend",
    "surfacearchive_route",
    "surfacearchive_error",
];
