import { planAreaSubmission } from "./planning.js";
import { concurrency, submitEntries } from "./submit-pool.js";
import { computeAreaState, freezeAreaSchedule } from "./schedule.js";
import { checkPaidRetrySiteIdentity } from "./site-identity-guard.js";
import { SCHEDULE_CONTRACT_VERSION } from "./weather-guard.js";
import { areaTransport } from "../internal/transport-choice.js";
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
 * A LEGACY schedule recorded an uncertain capability probe, and resuming it
 * would repeat work whose billing state is unknown. No SDK submits a probe job
 * any more (D71), so nothing written from here on can raise this.
 */
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
 * One facade job's capture for the local `cell-tris` synthesis
 * (`facade-synthesis.ts`, ADR 0008), or `undefined` when the run does not
 * synthesize locally. Written BEFORE the job's paid POST: a refusal or an
 * out-of-memory here fails the job while no request was sent, so a retry is
 * safe. After an accepted POST no host step may turn the job into a failed one.
 */
export function facadeCaptureFor(service, plan, entry) {
    if (service.facadeSynthesis === undefined || plan.localCellTris !== true)
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
 * Retain one accepted facade job's capture ({@link facadeCaptureFor}) so the
 * merge can synthesize its `cell-tris` locally. Per CLIENT, on the jobs
 * service: never module-global, and never in the `AreaSchedule`, which is
 * serialised, resumed and handed between processes.
 */
export function rememberFacadeInputs(service, capture, jobId) {
    const store = service.facadeSynthesis;
    if (store === undefined || jobId === undefined || capture === undefined)
        return;
    store.remember(jobId, { capture });
}
/** Submit an already validated plan once per entry. Unknown POSTs are not retried. */
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
    // No paid POST starts until every selected tile passes binary validation.
    // What the preflight encodes it KEEPS, under the client's byte budget, and
    // the worker that submits that tile sends those bytes instead of encoding the
    // same body again. The submit frees each artifact as its upload consumes it;
    // the `finally` frees every tile that never got that far — a preflight that
    // threw on a later tile, an abort, a 402, an invalid geometry reference.
    try {
        if (areaTransport(options, plan.analysisType) === "binary") {
            for (const entry of entries) {
                await service.preflightPrepared(entry.prepared, options.signal === undefined ? {} : { signal: options.signal });
            }
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
            afterAccepted: (capture, jobId) => rememberFacadeInputs(service, capture, jobId),
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
                service.facadeSynthesis?.forget(job.jobId);
        }
        const ids = [...jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== undefined ? [job.jobId] : []);
        throw new AreaGeometryReferenceError(schedule, ids);
    }
    return schedule;
}
export async function runArea(service, input, polygon, options = {}) {
    const effective = effectiveOptions(options, String(input.analysisType ?? input["analysis-type"]));
    concurrency(effective.maxWorkers);
    const plan = await planAreaSubmission(service, input, polygon, effective);
    return submitAreaPlan(service, plan, effective);
}
