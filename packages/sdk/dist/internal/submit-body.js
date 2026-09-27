import { validatePreparedAnalysisRequest } from "../request-validation.js";
import { takesGradeDrop } from "../to-grade.js";
import { groupHasContent } from "./kernel-group.js";
const INTERIOR_ANALYSES = new Set([
    "daylight-factor",
    "energy-balance",
    "spatial-daylight-autonomy",
]);
const UNSUPPORTED_TOP_LEVEL_ALIASES = new Set([
    "analysisType", "analysis_type", "analysisSurfaces", "analysis_surfaces",
    "binaryResults", "binary_results", "contextGeometry", "context_geometry",
    "emitCellTris", "emit_cell_tris", "groundMaterials", "ground_materials",
    "groundGeometry", "ground_geometry", "sensorSurfaces", "sensor_surfaces",
    "surfaceGridSize", "surface_grid_size", "surfaceOffset", "surface_offset",
    "terrainAlignment", "terrain_alignment", "webhookEvents", "webhook_events",
    "webhookUrl", "webhook_url",
]);
/** Apply transport defaults to an explicitly wire-keyed payload, then pack it. */
export function prepareSubmissionBody(analysisType, payload, options) {
    if (typeof analysisType !== "string" || analysisType.length === 0) {
        throw new TypeError("analysisType must be a non-empty string");
    }
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
        throw new TypeError("analysis payload must be an object");
    }
    for (const name of UNSUPPORTED_TOP_LEVEL_ALIASES) {
        if (Object.prototype.hasOwnProperty.call(payload, name)) {
            throw new TypeError(`analysis payload must use wire-keyed fields; unsupported ${name}`);
        }
    }
    const bodyType = payload["analysis-type"];
    if (bodyType !== undefined && bodyType !== analysisType) {
        throw new TypeError("payload analysis-type does not match analysisType");
    }
    if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
        throw new TypeError("unsupported option binaryResults; use transport instead");
    }
    if (Object.prototype.hasOwnProperty.call(payload, "binary-results")) {
        throw new TypeError("unsupported payload field binary-results; use transport instead");
    }
    const hasAlignment = Object.prototype.hasOwnProperty.call(payload, "terrain-alignment");
    const body = { ...payload, "analysis-type": analysisType };
    // The alignment VALUE rule is checked inside `validatePreparedAnalysisRequest`
    // (D111), which is why the delete below happens AFTER it and not before: the
    // area path reaches the same seam, and this one no longer hides the field
    // from it. D91: the option is an SDK-side choice and the worker has no such
    // key, so it never reaches the wire. It is only READ here — the drop itself
    // happens at the plan seam, once per `runArea`, and a direct submission is
    // sent as given rather than rewritten by a second path.
    validatePreparedAnalysisRequest(body, { enforceTerrainTriangleLimit: true });
    if (takesGradeDrop(analysisType))
        delete body["terrain-alignment"];
    if (options.webhookUrl !== undefined)
        body["webhook-url"] = options.webhookUrl;
    if (options.webhookEvents !== undefined)
        body["webhook-events"] = [...options.webhookEvents];
    const suppliedScene = [
        "geometries", "context-geometry", "vegetation", "vegetation-instances",
    ].some((name) => groupHasContent(body[name]));
    if (!INTERIOR_ANALYSES.has(analysisType) && !hasAlignment &&
        groupHasContent(body["ground-geometry"]) && suppliedScene)
        body["terrain-alignment"] = "as-is";
    return body;
}
