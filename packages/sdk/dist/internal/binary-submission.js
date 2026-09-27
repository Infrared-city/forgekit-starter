import { bodyArtifact } from "./binary-artifact.js";
import { SubmissionUncertainError } from "./submission.js";
import { checkFacadeArtifact, isSurfaceBody } from "./facade-artifact-guard.js";
import { TransportError } from "./transport.js";
import { uploadPresignedZip } from "./upload.js";
import { requireCore } from "./core.js";
import { decisionBoxesTrees, treeBoxDecision } from "./tree-boxes.js";
// Control travels in the API request, not in the uploaded geometry file.
const MAX_CONTROL_METADATA_BYTES = 4_194_304;
const GEOMETRY_GROUPS = ["geometries", "context-geometry", "ground-geometry",
    "vegetation", "vegetation-instances", "ground-materials"];
export async function capability(gateway, signal) {
    const raw = await gateway.requestJson("/binary/v1/capabilities", signal === undefined ? {} : { signal });
    const value = object(raw, "binary capability");
    if (value.inputFormat !== "irbf" || value.resultFormat !== "irbf" || value.wireVersion !== 1) {
        throw new TypeError("gateway has an incompatible binary wire format");
    }
    const limits = object(value.limits, "binary limits");
    const parsedLimits = {
        maxGeometryBytes: positive(limits.maxGeometryBytes, 67_108_864, "maxGeometryBytes"),
        // Ground polygons and point vegetation share this bounded input metadata budget.
        maxMetadataBytes: positive(limits.maxMetadataBytes, 8_388_608, "maxMetadataBytes"),
        maxMeshes: positive(limits.maxMeshes, 100_000, "maxMeshes"),
        maxInstances: positive(limits.maxInstances, 100_000, "maxInstances"),
        maxResultBytes: positive(limits.maxResultBytes, 268_435_456, "maxResultBytes"),
        maxResultCells: positive(limits.maxResultCells, 16_777_216, "maxResultCells"),
        maxTriangleValues: positive(limits.maxTriangleValues, 67_108_864, "maxTriangleValues"),
    };
    const models = object(value.models, "binary capability models");
    for (const [name, raw] of Object.entries(models)) {
        const model = object(raw, `binary model ${name}`);
        if (!Array.isArray(model.geometryGroups) || !model.geometryGroups.every((item) => typeof item === "string")
            || !Array.isArray(model.resultFamilies) || !model.resultFamilies.every((item) => typeof item === "string")) {
            throw new TypeError(`binary model ${name} is invalid`);
        }
    }
    return { inputFormat: "irbf", resultFormat: "irbf", wireVersion: 1, models, limits: parsedLimits };
}
export async function prepareBinary(prepared, supported) {
    const model = supported.models[prepared.analysisType];
    if (model === undefined || !Array.isArray(model.geometryGroups)
        || !Array.isArray(model.resultFamilies) || model.resultFamilies.length === 0) {
        throw new TypeError(`model ${prepared.analysisType} does not support binary transport`);
    }
    // The trees AFTER the capability document is in hand: on a model whose
    // advertised `geometryGroups` carries no `vegetation` each tree becomes a
    // box in `geometries` (D70) — in the kernel, whether the body is an area
    // tile (its artifact comes from the prepared site, D101) or a direct body
    // (`geometryArtifact`). The day the backend adds `vegetation` for wind the
    // trees travel as trees, which is why this cannot move above the fetch.
    const decision = treeBoxDecision(prepared.analysisType, model.geometryGroups);
    const trees = prepared.body.vegetation;
    const boxes = decisionBoxesTrees(decision) && trees !== undefined && trees !== null;
    if (boxes && (typeof trees !== "object" || Array.isArray(trees))) {
        throw new TypeError(`binary ${prepared.analysisType}: vegetation must be an object keyed by tree id to be boxed into the geometry layer`);
    }
    const body = { ...prepared.body };
    if (boxes)
        delete body.vegetation;
    const present = GEOMETRY_GROUPS.filter((name) => {
        const value = body[name];
        return value !== undefined && value !== null && typeof value === "object" && !Array.isArray(value);
    });
    for (const name of present)
        if (!model.geometryGroups.includes(name)) {
            throw new TypeError(`model ${prepared.analysisType} does not support binary geometry group ${name}`);
        }
    const control = { ...body };
    for (const name of GEOMETRY_GROUPS)
        delete control[name];
    delete control["binary-results"];
    const controlJson = JSON.stringify(control);
    if (controlJson === undefined)
        throw new TypeError("binary control has no JSON wire form");
    canonicalJsonBytes(controlJson, Math.min(supported.limits.maxMetadataBytes, MAX_CONTROL_METADATA_BYTES), "binary control");
    // The control is bounded BEFORE anything is encoded: an oversized control
    // fails here, unbilled, and pays for no artifact.
    const tile = prepared.artifact === undefined
        ? bodyArtifact(prepared.body, boxes, supported.limits)
        : prepared.artifact(boxes, supported.limits);
    // D156: an area facade batch must upload exactly its planned targets, or
    // the server synthesizes (and bills) sensors the plan never counted.
    if (prepared.artifact !== undefined && isSurfaceBody(prepared.body)) {
        checkFacadeArtifact(prepared.analysisType, prepared.body, tile);
    }
    const artifact = tile;
    const treeBoxes = tile.treeBoxes === undefined
        ? undefined
        : { ...tile.treeBoxes, model: prepared.analysisType, decidedBy: decision };
    return { artifact, control, limits: supported.limits,
        ...(treeBoxes === undefined ? {} : { treeBoxes }) };
}
export async function uploadGeometry(uploadGateway, fetch, prepared, timeoutMs, signal) {
    const response = await uploadGateway.requestJson("/uploads/presign", {
        method: "POST", body: { content_length: prepared.artifact.archive.byteLength },
        ...(signal === undefined ? {} : { signal }),
    });
    const value = object(response, "presign response");
    const uploadUrl = https(value["upload-url"], "upload-url");
    const getUrl = https(value["get-url"], "get-url");
    await uploadPresignedZip(uploadUrl, prepared.artifact.archive, { fetch, timeoutMs,
        ...(signal === undefined ? {} : { signal }) });
    return getUrl;
}
export function binarySubmission(binary, geometryUrl) {
    return { geometry: { url: geometryUrl, encoding: binary.artifact.encoding,
            artifactDigest: binary.artifact.artifactDigest,
            contentDigest: binary.artifact.geometryContentDigest,
            byteLength: binary.artifact.archive.byteLength }, control: binary.control, limits: binary.limits };
}
export async function submitBinary(gateway, prepared, binary, parseJob, signal, beforeDispatch) {
    const envelope = JSON.stringify({ inputFormat: "irbf", resultFormat: "irbf",
        wireVersion: 1, geometry: binary.geometry, control: binary.control });
    const body = canonicalJsonBytes(envelope, Math.min(binary.limits.maxMetadataBytes, MAX_CONTROL_METADATA_BYTES) + 65_536, "binary submission envelope");
    let response;
    try {
        response = await gateway.requestBytesWithHeaders(`/binary/v1/async/${encodeURIComponent(prepared.analysisType)}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body,
            acceptHttpErrors: true, ...(signal === undefined ? {} : { signal }),
            ...(beforeDispatch === undefined ? {} : { beforeDispatch }),
        });
    }
    catch (error) {
        if (error instanceof TransportError && error.phase !== "pre-dispatch") {
            throw new SubmissionUncertainError([]);
        }
        throw error;
    }
    let raw;
    try {
        raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(response.content));
    }
    catch {
        throw new SubmissionUncertainError([]);
    }
    if (response.status < 200 || response.status >= 300) {
        if (!preacceptRejection(response.status, raw)) {
            throw new SubmissionUncertainError(jobIds(raw));
        }
        throw new TransportError(`binary submission received HTTP ${response.status}`, "response", "http", "POST", response.status);
    }
    let record;
    let job;
    try {
        record = object(raw, "binary accepted response");
        job = parseJob(record);
    }
    catch {
        throw new SubmissionUncertainError(jobIds(raw));
    }
    try {
        validateAck(record.binary, binary.geometry);
    }
    catch {
        throw new SubmissionUncertainError([job.jobId]);
    }
    return job;
}
function preacceptRejection(status, raw) {
    if (![400, 401, 402, 404, 413, 415, 422, 429].includes(status)
        || raw === null || typeof raw !== "object" || Array.isArray(raw))
        return false;
    const value = raw;
    return Object.keys(value).sort().join() === "code,detail,status,title,type"
        && value.status === status && value.code === "JOB_BINARY_REJECTED"
        && [value.type, value.title, value.detail].every((item) => typeof item === "string");
}
function validateAck(raw, geometry) {
    const value = object(raw, "binary acknowledgement");
    if (value.inputFormat !== "irbf" || value.resultFormat !== "irbf" || value.wireVersion !== 1
        || value.artifactDigest !== geometry.artifactDigest || value.contentDigest !== geometry.contentDigest) {
        throw new TypeError("binary acknowledgement does not match the submitted artifact");
    }
}
function positive(value, cap, name) { if (!Number.isSafeInteger(value) || value <= 0 || value > cap)
    throw new TypeError(`binary ${name} is invalid`); return value; }
function object(value, name) { if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(`${name} must be an object`); return value; }
function https(value, name) { if (typeof value !== "string")
    throw new TypeError(`presign response has no ${name}`); const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password || url.hash)
    throw new TypeError(`presign response ${name} is invalid`); return url.href; }
function jobIds(value) { if (value === null || typeof value !== "object" || Array.isArray(value))
    return []; const id = value.jobId; return typeof id === "string" && id ? [id] : []; }
function canonicalJsonBytes(value, maxBytes, name) {
    try {
        return requireCore().canonicalMetadataJson(value, maxBytes, 32);
    }
    catch (error) {
        if (error instanceof Error && /byte limit/i.test(error.message)) {
            throw new RangeError(`${name} exceeds its byte limit`);
        }
        throw error;
    }
}
