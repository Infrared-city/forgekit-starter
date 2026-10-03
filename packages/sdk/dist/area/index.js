export { initializeCore } from "../internal/initialize.js";
export { CoreInitializationError, CoreNotReadyError, CoreTerminalError, } from "../internal/errors.js";
// Finished bodies: since D98 the kernel answers every group in the tile's own
// frame, so there is no step between this and the wire.
export { composeTilePayloads } from "./composition.js";
export { CELL_SIZE_M, TILE_SIZE_CELLS, TILE_SIZE_M } from "./constants.js";
export { generateTilesForPolygon, getTilingConfig, validatePolygon } from "./tiling.js";
export { prepareAnalysisPayload, prepareAreaPayload } from "./payload.js";
export { PHYSICS_TIERS, THERMAL_CONTROLS } from "./thermal-controls.js";
export { checkAreaState } from "./poll.js";
export { areaScheduleFromJSON, areaScheduleToJSON, computeAreaState, freezeAreaSchedule, } from "./schedule.js";
export { AreaGeometryProbeError, AreaGeometryReferenceError, runArea, submitAreaPlan, } from "./submission.js";
// The offline half of `runArea` (WP-6): the same batch plan, read for its
// job count instead of submitted. Nameable from this entry for the same
// reason `runArea` is -- a caller who composes/plans by hand still wants it.
export { previewAreaBatches } from "./preview.js";
// The site every `runArea` in this realm prepares once per tiling family
// (D96), and the one call that releases it.
export { freePreparedSites } from "./prepared-site.js";
// `runArea` is on THIS entry, and `runArea` is what throws it. D51 tells a
// caller to catch it by type, so the class has to be nameable from the same
// import the call came from — the root entry carries it too.
export { ConfigHashPolicyError } from "./planning.js";
export { FacadeCountContractError } from "./count-contract.js";
export { mergeAreaJobs, mergeSurfaceAreaJobs } from "./merge.js";
export { SCHEDULE_CONTRACT_VERSION, WeatherIdentityError, } from "./weather-guard.js";
export { TileFailurePhase } from "./schedule-types.js";
