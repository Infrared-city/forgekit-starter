import { WIND_ANALYSIS_TYPES } from "./analysis-types.js";
import { requireCore } from "./internal/core.js";
import { groupHasContent, KernelGroup } from "./internal/kernel-group.js";
const SURFACE_TYPES = new Set([
    "sky-view-factors", "solar-radiation", "direct-sun-hours", "daylight-availability",
]);
const TERRAIN_TYPES = new Set([
    ...SURFACE_TYPES, "thermal-comfort-index", "thermal-comfort-statistics",
]);
const INTERIOR_TYPES = new Set(["daylight-factor", "energy-balance", "spatial-daylight-autonomy"]);
// Python's TcsModelBaseRequest.subtype is required (analyses/types.py:1013);
// TS has no per-model type to hang that on (D109). Scoped to this one field —
// not general input hardening.
const TCS_SUBTYPES = new Set(["thermal-comfort", "heat-stress", "cold-stress"]);
const SURFACE_FIELDS = [
    "analysis-surfaces", "sensor-points", "sensor-normals", "context-geometry",
    "surface-grid-size", "surface-offset", "emit-cell-tris", "mesh-cleaning",
    "surfgrid-version",
];
// infrared-core #674: the bundled kernel's roof-gate version. The worker
// uses 5 (the frozen pre-#674 layout) when the field is absent and 6 when
// the request says 6; no other value is a kernel this SDK line has shipped.
const TERRAIN_FIELDS = ["ground-geometry"];
// `terrain-alignment` reaches two models further than `ground-geometry` does.
// The wind family cannot take terrain at all and that refusal stands, but the
// option answers a question about the CALLER's own scene — where its solids
// sit relative to grade — which those two models do have (D91).
const ALIGNMENT_FIELDS = ["terrain-alignment"];
const ALIGNMENT_TYPES = new Set([
    ...TERRAIN_TYPES, "wind-speed", "pedestrian-wind-comfort",
]);
// Server-side fast mode for a long time window (lambda-models #489). Valid
// ONLY on the two solar area models and the two thermal models — `sky-view-
// factors` and `solar-radiation` never read it, matching Python's
// `extra="forbid"` refusal of `fast` there. NEEDS SERVER SUPPORT: the server
// ignores this key until #489 ships; refusing it on the WRONG models now
// still catches a caller's typo or a misplaced flag before the job bills.
const FAST_FIELDS = ["fast"];
const FAST_TYPES = new Set([
    "direct-sun-hours", "daylight-availability",
    "thermal-comfort-index", "thermal-comfort-statistics",
]);
const TERRAIN_ALIGNMENT_MODES = new Set(["as-is", "auto-align", "assume-aligned"]);
// The WIND family spells the same option with its own values (D91): there is no
// terrain to align to, only the caller's own solids to drop to grade.
const GRADE_ALIGNMENT_MODES = new Set(["to-ground", "as-is"]);
function present(input, names) {
    return names.filter((name) => input[name] !== undefined && input[name] !== null);
}
function vectors(value, name) {
    if (!Array.isArray(value))
        throw new TypeError(`${name} must be an array`);
    return value;
}
function validateVector(value, name, nonZero) {
    if (!Array.isArray(value) || value.length !== 3 ||
        !value.every((component) => typeof component === "number" && Number.isFinite(component))) {
        throw new TypeError(`${name} must be a finite 3-component vector`);
    }
    if (nonZero && Math.hypot(value[0], value[1], value[2]) < 1e-9) {
        throw new TypeError(`${name} must be non-zero`);
    }
}
function validateSensors(input) {
    const surfaces = input["analysis-surfaces"];
    const pointsValue = input["sensor-points"];
    const normalsValue = input["sensor-normals"];
    const emitCellTris = input["emit-cell-tris"];
    if (surfaces != null && (typeof surfaces !== "string" ||
        !["facades", "roofs", "all"].includes(surfaces))) {
        throw new TypeError("analysis-surfaces must be facades, roofs, or all");
    }
    if (surfaces != null && pointsValue != null) {
        throw new TypeError("analysis-surfaces and sensor-points are mutually exclusive");
    }
    if (normalsValue != null && pointsValue == null) {
        throw new TypeError("sensor-normals require sensor-points");
    }
    if (pointsValue != null) {
        const points = vectors(pointsValue, "sensor-points");
        if (points.length === 0)
            throw new TypeError("sensor-points must not be empty");
        // The one per-job sensor budget, BYO or synthesized, on both transports
        // (kernel `MAX_SENSORS_PER_JOB`, D206). BYO sensors travel in S3 on both.
        const maxSensors = requireCore().maxSensorsPerJob();
        if (points.length > maxSensors) {
            throw new TypeError(`sensor-points length exceeds the maximum of ${maxSensors}`);
        }
        points.forEach((point, index) => validateVector(point, `sensor-points[${index}]`, false));
        if (normalsValue != null) {
            const normals = vectors(normalsValue, "sensor-normals");
            if (normals.length !== points.length) {
                throw new TypeError("sensor-normals length must match sensor-points length");
            }
            normals.forEach((normal, index) => validateVector(normal, `sensor-normals[${index}]`, true));
        }
    }
    const gridSize = input["surface-grid-size"];
    if (gridSize != null && (typeof gridSize !== "number" || !Number.isFinite(gridSize) || gridSize < 0.25)) {
        throw new TypeError("surface-grid-size must be a finite number >= 0.25 m");
    }
    const offset = input["surface-offset"];
    if (offset != null && (typeof offset !== "number" || !Number.isFinite(offset) || offset < 0)) {
        throw new TypeError("surface-offset must be a finite number >= 0");
    }
    if (emitCellTris != null && typeof emitCellTris !== "boolean") {
        throw new TypeError("emit-cell-tris must be a Boolean");
    }
    if (emitCellTris != null && surfaces == null) {
        throw new TypeError("emit-cell-tris only applies to analysis-surfaces requests");
    }
    // #555: whether the kernel cleans each building first ("auto", the
    // default) or uses the meshes as drawn ("off").
    const cleaning = input["mesh-cleaning"];
    if (cleaning != null && cleaning !== "auto" && cleaning !== "off") {
        throw new TypeError('mesh-cleaning must be "auto" or "off"');
    }
    if (cleaning != null && surfaces == null) {
        throw new TypeError("mesh-cleaning only applies to analysis-surfaces requests");
    }
    // #674: which roof-gate layout the worker ran, named by this SDK's own
    // bundled kernel rather than guessed from an absent field.
    const surfgridVersion = input["surfgrid-version"];
    if (surfgridVersion != null && surfaces == null) {
        throw new TypeError("surfgrid-version only applies to analysis-surfaces requests");
    }
    // Counting, batching and the layout hash run on the bundled kernel's
    // version, so a request for another version is refused (#674).
    if (surfgridVersion != null && surfgridVersion !== requireCore().surfgridVersion()) {
        throw new TypeError(`surfgrid-version must be the bundled kernel's (${requireCore().surfgridVersion()}); leave it unset`);
    }
}
function validateCanonicalBase64(blob, key) {
    if (blob.length % 4 !== 0)
        throw new TypeError(`ground-geometry[${JSON.stringify(key)}].indices_bin must be canonical base64`);
    const padding = blob.endsWith("==") ? 2 : blob.endsWith("=") ? 1 : 0;
    for (let index = 0; index < blob.length - padding; index += 1) {
        const code = blob.charCodeAt(index);
        const valid = (code >= 48 && code <= 57) || (code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122) || code === 43 || code === 47;
        if (!valid)
            throw new TypeError(`ground-geometry[${JSON.stringify(key)}].indices_bin must be canonical base64`);
    }
    for (let index = blob.length - padding; index < blob.length; index += 1) {
        if (blob[index] !== "=")
            throw new TypeError("packed terrain indices have invalid base64 padding");
    }
}
function packedIndexCount(mesh, key) {
    const blob = mesh.indices_bin;
    if (typeof blob !== "string")
        return undefined;
    validateCanonicalBase64(blob, key);
    return requireCore().packedIndexCount(blob);
}
function validateTerrain(input, enforceLimit) {
    const value = input["ground-geometry"];
    // A facade batch's terrain is the kernel site's own, capped by
    // `Site.checkTerrain` when the plan was made (`area/site-facade.ts`).
    if (value == null || value instanceof KernelGroup)
        return;
    if (typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError("ground-geometry must be an id-keyed mesh map");
    }
    const indexLengths = [];
    for (const [key, meshValue] of Object.entries(value)) {
        if (meshValue === null || typeof meshValue !== "object" || Array.isArray(meshValue)) {
            throw new TypeError(`ground-geometry[${JSON.stringify(key)}] must be a mesh`);
        }
        const mesh = meshValue;
        if (mesh.coordinates_bin_encoding !== undefined || mesh.indices_bin_encoding !== undefined) {
            throw new TypeError("request terrain binary fields do not support encoding sidecars");
        }
        const hasCoordinates = typeof mesh.coordinates_bin === "string" || mesh.coordinates !== undefined;
        const hasIndices = typeof mesh.indices_bin === "string" || mesh.indices !== undefined;
        if (!hasCoordinates || !hasIndices) {
            throw new TypeError(`ground-geometry[${JSON.stringify(key)}] must be a mesh`);
        }
        const indices = mesh.indices;
        let indexCount = 0;
        if (typeof mesh.indices_bin === "string")
            indexCount = packedIndexCount(mesh, key) ?? 0;
        else if (Array.isArray(indices))
            indexCount = indices.length;
        else if (ArrayBuffer.isView(indices) && "length" in indices && typeof indices.length === "number") {
            indexCount = indices.length;
        }
        if (indexCount % 3 !== 0)
            throw new TypeError("terrain indices must contain complete triangles");
        indexLengths.push(indexCount);
    }
    if (!enforceLimit)
        return;
    // The count and the cap are the kernel's (`terrainTriangleCap`), the ones the
    // Python host checks, pinned to the server's own terrain cap (D160).
    const checked = JSON.parse(requireCore().terrainTriangleCap(Uint32Array.from(indexLengths)));
    if (checked.over_cap) {
        throw new TypeError(`ground-geometry has ${checked.triangles} triangles, exceeding the ${checked.limit} cap`);
    }
}
/**
 * Refuse a `ground-materials` document whose layer keys are not material names
 * the simulation knows (WP20/D56, issue #217).
 *
 * The five names live in the kernel and a CI gate compares them with the
 * lambda-models physics table, so this file keeps no list. An unknown key is
 * the model's UNKNOWN material row: the job succeeds, bills, and returns a
 * thermal result computed from the wrong surface.
 *
 * Only the KEYS are sent across: each FeatureCollection is replaced by `null`,
 * so a multi-megabyte document is never serialised to ask about its keys.
 */
export function validateGroundMaterials(layers) {
    // A kernel group was cut from layers this check already read at the site.
    if (layers === null || layers === undefined || layers instanceof KernelGroup)
        return;
    if (typeof layers !== "object" || Array.isArray(layers)) {
        throw new TypeError("ground-materials must be an object of {material_name: FeatureCollection}");
    }
    const keys = Object.keys(layers);
    if (keys.length === 0)
        return;
    const placeholder = {};
    for (const key of keys)
        placeholder[key] = null;
    requireCore().validateGroundLayers(JSON.stringify(placeholder));
}
/** Validate outdoor surface and terrain fields before a paid request. */
export function validatePreparedAnalysisRequest(input, options = {}) {
    const type = input["analysis-type"];
    // The VALUE rule lives here with the field rule, so both entry points reach
    // it: `prepareSubmissionBody` checked it on the direct path and `runArea`
    // never did, and a wind area run with `auto-align` was billed (D111, #348).
    // It sits ABOVE the interior return because the direct path checked the
    // value for every analysis type, interior ones included, and a move that
    // silently stopped checking them would be a regression of its own.
    // PRESENCE here is `hasOwn`, not `present()`: an explicit null is a bad
    // value, not an absent field, and the direct path has always said so.
    if (Object.hasOwn(input, "terrain-alignment")) {
        const grade = WIND_ANALYSIS_TYPES.has(type);
        const chosen = input["terrain-alignment"];
        if (typeof chosen !== "string" ||
            !(grade ? GRADE_ALIGNMENT_MODES : TERRAIN_ALIGNMENT_MODES).has(chosen)) {
            throw new TypeError(grade
                ? "terrain-alignment must be to-ground or as-is on the wind models"
                : "terrain-alignment must be as-is, auto-align, or assume-aligned");
        }
    }
    // Also sits ABOVE the interior return, for the same reason as
    // `terrain-alignment`: an interior model (`daylight-factor`,
    // `energy-balance`, `spatial-daylight-autonomy`) reads none of the four
    // area models' `fast` field either, and a check placed only below the
    // return would silently let it through on exactly the types it was
    // never meant to reach.
    const fast = present(input, FAST_FIELDS);
    if (fast.length > 0 && !FAST_TYPES.has(type)) {
        throw new TypeError(`${fast.join(", ")} not valid on '${type}'`);
    }
    if (input.fast != null && typeof input.fast !== "boolean") {
        throw new TypeError("fast must be a Boolean");
    }
    if (typeof type !== "string" || INTERIOR_TYPES.has(type))
        return;
    if (type === "thermal-comfort-statistics") {
        const subtype = input.subtype;
        if (typeof subtype !== "string" || !TCS_SUBTYPES.has(subtype)) {
            throw new TypeError(`subtype (one of ${[...TCS_SUBTYPES].join(", ")}) is required on 'thermal-comfort-statistics'`);
        }
    }
    const surface = present(input, SURFACE_FIELDS);
    if (surface.length > 0 && !SURFACE_TYPES.has(type)) {
        throw new TypeError(`${surface.join(", ")} not valid on '${type}'`);
    }
    const terrain = present(input, TERRAIN_FIELDS);
    if (terrain.length > 0 && !TERRAIN_TYPES.has(type)) {
        throw new TypeError(`${terrain.join(", ")} not valid on '${type}'`);
    }
    const alignment = present(input, ALIGNMENT_FIELDS);
    if (alignment.length > 0 && !ALIGNMENT_TYPES.has(type)) {
        throw new TypeError(`${alignment.join(", ")} not valid on '${type}'`);
    }
    validateSensors(input);
    validateTerrain(input, options.enforceTerrainTriangleLimit === true);
    validateGroundMaterials(input["ground-materials"]);
    if (groupHasContent(input["context-geometry"]) && input["sensor-points"] == null &&
        input["analysis-surfaces"] == null && input["ground-geometry"] == null) {
        throw new TypeError("context-geometry requires sensor-points, analysis-surfaces, or ground-geometry");
    }
}
