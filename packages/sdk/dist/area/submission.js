import { planAreaSubmission } from "./planning.js";
import { concurrency, submitEntries } from "./submit-pool.js";
import { computeAreaState, freezeAreaSchedule } from "./schedule.js";
import { checkPaidRetrySiteIdentity } from "./site-identity-guard.js";
import { SCHEDULE_CONTRACT_VERSION } from "./weather-guard.js";
import { areaTransport } from "../internal/transport-choice.js";
import { checkBinaryRoute } from "../internal/binary-submission.js";
function effectiveOptions(options, analysisType) {
    if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
        throw new TypeError("unsupported option binaryResults; use transport instead");
    }
    // D196: unset = binary (or JSON for an analysis with no binary route); a
    // retry keeps the saved transport.
    const transport = areaTransport(options, analysisType);
    if (options.transport !== undefined && options.retryFrom?.transport !== undefined
        && options.transport !== options.retryFrom.transport) {
        throw new Error("retryFrom transport mismatch");
    }
    const margin = options.terrainContextMarginM ?? options.retryFrom?.terrainContextMarginM;
    if (margin !== undefined && (!Number.isFinite(margin) || margin < 0)) {
        throw new TypeError("terrainContextMarginM must be a finite non-negative number");
    }
    if (options.terrainContextMarginM !== undefined && options.retryFrom?.terrainContextMarginM !== undefined &&
        options.terrainContextMarginM !== options.retryFrom.terrainContextMarginM) {
        throw new Error("retryFrom terrainContextMarginM mismatch");
    }
    return {
        ...options,
        transport,
        ...(margin === undefined ? {} : { terrainContextMarginM: margin }),
        ...(options.webhookUrl !== undefined || options.retryFrom?.webhookUrl === undefined
            ? {} : { webhookUrl: options.retryFrom.webhookUrl }),
        ...(options.webhookEvents !== undefined || options.retryFrom?.webhookEvents === undefined
            ? {} : { webhookEvents: [...options.retryFrom.webhookEvents] }),
    };
}
function scheduleFromPlan(plan, jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus, options) {
    const siteIdentity = options.retryFrom === undefined
        ? plan.siteIdentity : options.retryFrom.siteIdentity;
    const sensorCap = options.maxSensorsPerJob ?? options.retryFrom?.maxSensorsPerJob;
    // D224: the run id and attempts travel with the schedule. A fresh run
    // stamps no attempts map at all -- a missing key means attempt 1, the same
    // thing an explicit `1` would say. A retry stores the kernel plan's WHOLE
    // attempt map AS IS (it is already the whole map, not a delta): never
    // merged with the old one.
    const attempts = plan.retryContext?.attempts;
    return {
        jobs, polygon: plan.polygon, configHash: plan.configHash,
        ...(siteIdentity === undefined ? {} : { siteIdentity }),
        tilePositions: plan.tilePositions, gridShape: plan.gridShape,
        analysisType: plan.analysisType, failedSubmissions, uncertainSubmissions,
        invalidReferenceSubmissions,
        transport: areaTransport(options, plan.analysisType),
        ...(areaTransport(options, plan.analysisType) === "binary" ? { wireVersion: 1 } : {}),
        submissionAbortStatus, surfaceFields: plan.surfaceFields,
        terrainContextMarginM: plan.terrainContextMarginM,
        // A retry that omits the cap replays a plan made under the saved one.
        ...(sensorCap === undefined ? {} : { maxSensorsPerJob: sensorCap }),
        // Stamped on every schedule this SDK writes, whether or not the weather
        // is provable: the VERSION is what tells a schedule that recorded no
        // identity from one written before the field existed, and only the first
        // can be resumed once the caller brings a parsed file.
        scheduleContractVersion: SCHEDULE_CONTRACT_VERSION,
        ...(plan.weatherIdentity === undefined ? {} : { weatherIdentity: plan.weatherIdentity }),
        ...(plan.batchingPolicyVersion === undefined ? {} : { batchingPolicyVersion: plan.batchingPolicyVersion }),
        ...(plan.batchMembership === undefined ? {} : { batchMembership: plan.batchMembership }),
        ...(plan.batchSensorCounts === undefined ? {} : { batchSensorCounts: plan.batchSensorCounts }),
        ...(options.webhookUrl === undefined ? {} : { webhookUrl: options.webhookUrl }),
        ...(options.webhookEvents === undefined ? {} : { webhookEvents: [...options.webhookEvents] }),
        runId: plan.runId,
        ...(attempts === undefined ? {} : { attempts }),
    };
}
/**
 * Thrown when the API accepted a job whose geometry reference turned out to be invalid. The
 * accepted jobs cannot produce a trusted result, so the run stops.
 *
 * `areaSchedule` is the schedule recorded so far and `acceptedJobIds` lists the jobs the API
 * accepted with the invalid reference, so you can find them for billing or support.
 *
 * @category Errors
 */
export class AreaGeometryReferenceError extends Error {
    areaSchedule;
    acceptedJobIds;
    name = "AreaGeometryReferenceError";
    constructor(areaSchedule, acceptedJobIds) {
        super("area submission stopped after an invalid geometry-reference acceptance");
        this.areaSchedule = areaSchedule;
        this.acceptedJobIds = acceptedJobIds;
    }
}
/**
 * Thrown when resuming a saved schedule from an older SDK version that recorded a capability
 * probe with an unknown outcome. Resuming would repeat work whose billing state is unknown.
 * This SDK no longer submits probe jobs, so schedules it writes never raise this.
 *
 * `areaSchedule` is the saved schedule and `acceptedProbeJobIds` the probe job ids it recorded.
 *
 * @category Errors
 */
// Maintainer note (not published): no SDK submits a probe job any more (D71).
export class AreaGeometryProbeError extends Error {
    areaSchedule;
    acceptedProbeJobIds;
    name = "AreaGeometryProbeError";
    constructor(areaSchedule, acceptedProbeJobIds) {
        super("area submission stopped after an uncertain geometry-reference capability probe");
        this.areaSchedule = areaSchedule;
        this.acceptedProbeJobIds = acceptedProbeJobIds;
    }
}
/**
 * Captures what is needed to draw one facade job's cell triangles locally after the merge, or
 * returns `undefined` when the run does not synthesize them locally.
 *
 * The capture is taken before the job's paid request is sent, so a failure here fails the job
 * while nothing was sent and a retry is safe.
 *
 * @param service - The jobs service of the run.
 * @param plan - The submission plan.
 * @param entry - The submission entry (one job) to capture.
 * @returns The capture bytes, or `undefined`.
 * @category Run an analysis
 */
// Maintainer note (not published): the local `cell-tris` synthesis is `facade-synthesis.ts`, ADR
// 0008. Written BEFORE the job's paid POST: a refusal or an out-of-memory here fails the job
// while no request was sent, so a retry is safe. After an accepted POST no host step may turn the
// job into a failed one. The capture is the kernel's (`Site.facadeFrames`, the Python host's
// `facade_frames`): the batch's targets and the tile's terrain from the prepared site.
export function facadeCaptureFor(service, plan, entry) {
    if (service.captures === undefined || !plan.surfaceFields)
        return undefined;
    // A facade job's capture is the kernel's: the batch's targets and the tile's
    // terrain from the prepared site (`Site.facadeFrames`, the Python host's
    // `facade_frames`). The mode is not kept — the response echoes the one that
    // ran.
    if (entry.capture === undefined)
        return undefined;
    const alignment = entry.prepared.body["terrain-alignment"];
    // Verbatim, `null` when unsent: the kernel seats the targets on terrain by
    // the server's rule for this value (the server seats before it synthesizes).
    return entry.capture(typeof alignment === "string" ? alignment : null);
}
/**
 * Keeps the capture of one accepted facade job (see `facadeCaptureFor`) so the merge can draw its
 * cell triangles locally. The capture is held per client, on the jobs service; it is never part
 * of the schedule, which is saved and handed between processes.
 *
 * @param service - The jobs service of the run.
 * @param capture - The capture, or `undefined` for nothing to keep.
 * @param jobId - The id of the accepted job, or `undefined` for nothing to keep.
 * @category Run an analysis
 */
// Maintainer note (not published): per CLIENT, on the jobs service: never module-global, and
// never in the `AreaSchedule`, which is serialised, resumed and handed between processes.
export function rememberFacadeInputs(service, capture, jobId, cellTris = false) {
    const store = service.captures;
    if (store === undefined || jobId === undefined || capture === undefined)
        return;
    store.remember(jobId, capture, cellTris);
}
/**
 * Submits an already validated plan, one job per entry, and returns the schedule of the run.
 *
 * A request whose outcome is unknown is not retried; it is recorded in the schedule as uncertain
 * so you can decide. Failed submissions are recorded too. Pass `options.retryFrom` to continue a
 * saved schedule.
 *
 * @param service - The jobs service that sends the jobs, for example `client.jobs`.
 * @param plan - The submission plan from `planAreaSubmission`.
 * @param options - The run options: `maxWorkers`, `signal`, `onAccepted`, `onProgress`, `retryFrom`.
 * @returns The frozen schedule of the run.
 * @throws {AreaGeometryReferenceError} when the API accepted a job with an invalid geometry
 *   reference, or `retryFrom` records one.
 * @throws {AreaGeometryProbeError} when `retryFrom` is a legacy schedule with an uncertain
 *   capability probe.
 * @category Run an analysis
 */
export async function submitAreaPlan(service, plan, options = {}) {
    const entries = plan.entries;
    if ((options.retryFrom?.invalidReferenceSubmissions?.length ?? 0) > 0) {
        const ids = [...options.retryFrom.jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== undefined ? [job.jobId] : []);
        throw new AreaGeometryReferenceError(options.retryFrom, ids);
    }
    // Legacy schedules only: no SDK from D71 onward submits a probe job, but one
    // saved before it can still record an uncertain probe, and that schedule is
    // no safer to resume now than it was then.
    if (options.retryFrom?.geometryProbeUncertain === true) {
        throw new AreaGeometryProbeError(options.retryFrom, options.retryFrom.geometryProbeJobIds ?? []);
    }
    checkPaidRetrySiteIdentity(options.retryFrom, plan.siteIdentity, entries.length > 0);
    const workers = concurrency(options.maxWorkers);
    let outcome;
    // The whole-run checks come before the first paid POST: the capability GET,
    // the geometry schema and the model's binary route. Then each worker encodes
    // its tile, uploads it and posts it at once (#816, D277); a tile that fails
    // to encode is a failed tile, and the other tiles continue. The `finally`
    // frees what a caller pre-checked itself and did not submit.
    try {
        if (areaTransport(options, plan.analysisType) === "binary" && entries.length > 0
            && service.binaryCapability !== undefined) {
            checkBinaryRoute(plan.analysisType, await service.binaryCapability(options.signal));
        }
        outcome = await submitEntries(service, entries, {
            maxWorkers: workers,
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            ...(options.onAccepted === undefined ? {} : { onAccepted: options.onAccepted }),
            ...(options.retryFrom === undefined ? {} : {
                priorJobs: options.retryFrom.jobs,
                // D224: the kernel plan's held-uncertain list, not the raw saved
                // one -- a key the pre-plan sweep resolved to `completed` is gone
                // (nothing to carry), and one resolved to `failed` is a fresh
                // `computeFailed` entry in `plan.resubmit`, not a carried record.
                priorUncertain: plan.retryContext?.carryUncertain ?? options.retryFrom.uncertainSubmissions ?? [],
                priorInvalidReference: options.retryFrom.invalidReferenceSubmissions ?? [],
            }),
            beforeSubmit: (entry) => facadeCaptureFor(service, plan, entry),
            afterAccepted: (capture, jobId) => rememberFacadeInputs(service, capture, jobId, plan.localCellTris === true),
            ...(options.logger === undefined ? {} : { logger: options.logger }),
        });
    }
    finally {
        // Idempotent: the submit already released every tile it uploaded.
        for (const entry of entries)
            service.releasePreflight?.(entry.prepared);
    }
    const { jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus } = outcome;
    const schedule = freezeAreaSchedule(scheduleFromPlan(plan, jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus, options));
    try {
        options.onProgress?.(computeAreaState(schedule));
    }
    catch {
        // Observer failures must not hide accepted job IDs in the returned schedule.
    }
    if (invalidReferenceSubmissions.length > 0) {
        // This call throws instead of returning a schedule, so no merge will come
        // for what it already captured. Release it here or hold it for the life of
        // the client.
        for (const job of jobs.values()) {
            if (job.jobId !== undefined)
                service.captures?.forget(job.jobId);
        }
        const ids = [...jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== undefined ? [job.jobId] : []);
        throw new AreaGeometryReferenceError(schedule, ids);
    }
    return schedule;
}
/**
 * Plans an area run for a polygon and submits it: tiles the polygon, builds each tile's request
 * and sends one job per tile (or per batch of facade sensors).
 *
 * Returns as soon as the jobs are submitted; poll the jobs with `checkAreaState` and merge the
 * results with `mergeAreaJobs`, or use `InfraredClient.runAreaAndWait` to do all three. Every
 * tile is a billed job, so size the run first with `previewAreaBatches`.
 *
 * @param service - The jobs service that sends the jobs, for example `client.jobs`.
 * @param input - The analysis request: `analysisType` plus the analysis's own parameters.
 * @param polygon - The GeoJSON `Polygon` to analyse.
 * @param options - The run options (see `RunAreaOptions`).
 * @returns The frozen schedule of the run, to poll, merge or save.
 * @throws {TypeError} when the unsupported `binaryResults` option is passed, or
 *   `terrainContextMarginM` is not a finite non-negative number.
 * @throws {Error} when `retryFrom` was saved with a different transport or terrain margin.
 * @throws {AreaGeometryReferenceError} when the API accepted a job with an invalid geometry
 *   reference.
 * @category Run an analysis
 */
export async function runArea(service, input, polygon, options = {}) {
    const effective = effectiveOptions(options, String(input.analysisType ?? input["analysis-type"]));
    concurrency(effective.maxWorkers);
    const plan = await planAreaSubmission(service, input, polygon, effective);
    return submitAreaPlan(service, plan, effective);
}
