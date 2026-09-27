import { CoreInitializationError, CoreNotReadyError, CoreTerminalError } from "./errors.js";
let core;
let pending;
let sourceIdentity;
let terminalFailure;
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
export const REQUIRED_FUNCTION_EXPORTS = [
    "coreVersion",
    "geometryGroups",
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
    "tileLocationApplies",
    "bboxMeetsRows",
    "terrainTriangleCap",
    "scalarPolygonOriginF64",
    "projectPolygonToMeters",
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
    // the body from the server. `decodeSurfaceIdentity` reads the layout hash
    // the synthesis is checked against. The terrain arm is the kernel's capture
    // reader: it decodes and merges the terrain (D20) and seats the targets the
    // way the server does before it synthesizes. One call answers every
    // capture of a merge (D185).
    "decodeSurfaceIdentity",
    "synthesizeSurfaces",
    "synthesizeSurfacesFromCaptures",
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
    // The same port's tolerance export, called by the public
    // `slabToleranceDeg` measurement helper (`geodata/rect-union-metrics.ts`).
    "rectUnionSlabToleranceDeg",
    // Trees as boxes on the binary wind routes (D70). Without these the SDK
    // cannot honour a binary wind/PWC body that carries vegetation at all.
    "vegetationTreeBoxDecision",
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
    "renderGridRegistry",
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
    // The area SURFACE merge's job decode (WP4): inflate, route, parse,
    // validate and flatten a JSON or IRBF surface result in one call, handed
    // to `SurfaceAreaMerger.pushArchive` without a second crossing.
    "decodeSurfaceArchive",
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
    "__wbg_surfaceareamerger_free",
    "__wbg_surfacearchive_free",
    "areagridmerge_values",
    "areagridmerge_shape",
    "areagridmerge_bounds",
    "categoricalareadense_values",
    "categoricalareadense_legend",
    "surfacearchive_route",
    "surfacearchive_takeRootJson",
    "surfacearchive_takeFieldsJson",
    "surfacearchive_takeCellArea",
    "surfacearchive_valueOffsets",
    "surfacearchive_cellAreaState",
    "surfacearchive_cellTrisState",
    "surfaceareamerger_new",
    "surfaceareamerger_pushArchive",
    "surfaceareamerger_finish",
];
function terminal(error, message) {
    const failure = new CoreTerminalError(error instanceof CoreInitializationError ? error.message : message, { cause: error });
    terminalFailure = failure;
    return failure;
}
async function compileSource(source) {
    if (source instanceof WebAssembly.Module)
        return source;
    if (typeof source === "string" || source instanceof URL) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new CoreInitializationError(`could not load the Infrared core (HTTP ${response.status})`);
        }
        return WebAssembly.compile(await response.arrayBuffer());
    }
    return WebAssembly.compile(source);
}
function requireCapabilities(output) {
    if (!(output.memory instanceof WebAssembly.Memory)) {
        throw new CoreInitializationError("the Infrared core has no compatible memory export");
    }
    if (!(output.__wbindgen_externrefs instanceof WebAssembly.Table)) {
        throw new CoreInitializationError("the Infrared core has no compatible reference table");
    }
    for (const name of REQUIRED_FUNCTION_EXPORTS) {
        if (typeof output[name] !== "function") {
            throw new CoreInitializationError(`the Infrared core is missing required export ${name}`);
        }
    }
}
async function loadCore(source) {
    const compiled = await compileSource(source.source);
    const module = await import("../../generated/infrared-core.js");
    let output;
    try {
        output = await module.default({ module_or_path: compiled });
    }
    catch (error) {
        throw terminal(error, "the loaded Infrared core failed during initialization");
    }
    try {
        requireCapabilities(output);
        if (module.coreVersion() !== "0.4.0") {
            throw new CoreInitializationError(`incompatible Infrared core version ${module.coreVersion()}`);
        }
        core = module;
    }
    catch (error) {
        throw terminal(error, "the loaded Infrared core failed its capability check");
    }
}
export function initializeCoreSource(source) {
    if (terminalFailure !== undefined) {
        return Promise.reject(terminalFailure);
    }
    // A realm holds ONE core. Once it is loaded and has passed the version and
    // capability checks, a later call is satisfied whatever source it names:
    // any other source would have to pass the same checks to be accepted. A
    // worker that serves a second request gets a NEW `WebAssembly.Module`
    // object from every `postMessage`, so an identity check refused a correct
    // second call ("already initialized from another source"). A compiled
    // module is still checked for the exports this SDK calls, which costs no
    // instantiation, so a module of another build is refused, not ignored.
    if (core !== undefined) {
        if (source?.source instanceof WebAssembly.Module && source.identity !== sourceIdentity) {
            const names = new Set(WebAssembly.Module.exports(source.source).map((entry) => entry.name));
            const missing = REQUIRED_FUNCTION_EXPORTS.find((name) => !names.has(name));
            if (missing !== undefined) {
                return Promise.reject(new CoreInitializationError(`the Infrared core is already initialized; the other module is missing export ${missing}`));
            }
        }
        // A URL or byte source is NOT compiled again to check it: the generated
        // glue and its wasm ship as one pair, and the loaded core already passed
        // the pinned version check, so resolving is safe and costs nothing.
        return Promise.resolve();
    }
    if (source === undefined) {
        return Promise.reject(new CoreInitializationError("a URL, byte buffer, or compiled module is required"));
    }
    if (pending !== undefined) {
        if (source.identity === sourceIdentity)
            return pending;
        // Wait for the load in progress, then run this caller's source through
        // the same rules: the post-load check on success, its own load on failure.
        return pending.then(() => initializeCoreSource(source), () => initializeCoreSource(source));
    }
    sourceIdentity = source.identity;
    pending = loadCore(source).catch((error) => {
        if (terminalFailure === undefined) {
            pending = undefined;
            sourceIdentity = undefined;
        }
        throw error;
    });
    return pending;
}
export function requireCore() {
    if (core === undefined)
        throw new CoreNotReadyError();
    return core;
}
