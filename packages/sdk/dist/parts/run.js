/**
 * `runAndWait` for an analysis the kernel splits into parts (daylight-factor,
 * D221): plan, submit the parts, wait, join. A request of one part takes the
 * one-job path and sends the bytes it always sent.
 */
import { waitForSchedule } from "../area/wait-schedule.js";
import { decompressResultValue } from "../compat.js";
import { requireCore } from "../internal/core.js";
import { requireTimeout } from "../internal/deadline.js";
import { defaultPollTimeoutS } from "../internal/poll-engine.js";
import { DEFAULT_TOKENS_PER_JOB } from "../pricing.js";
import { checkArchiveOptions, decompressResultArchive } from "../results/archive.js";
import { parseResultDocument } from "../results/router.js";
import { DaylightFactorResult, isDaylightFrame } from "./daylight-result.js";
import { mergeFormat, mergePartsDocument } from "./merge.js";
import { planRequest, splitsAnalysis } from "./plan.js";
import { resolveResultFormat } from "./result-format.js";
import { submitParts } from "./submit.js";
import { AnalysisPartsError } from "./types.js";
export class PartsTimeoutError extends Error {
    schedule;
    name = "PartsTimeoutError";
    constructor(message, schedule) {
        super(message);
        this.schedule = schedule;
    }
}
/** The result's `warnings`, once per run, on the client logger. */
export function logWarnings(value, analysisType, logger) {
    if (value === null || typeof value !== "object")
        return;
    if (value instanceof DaylightFactorResult) {
        if (value.warnings.length > 0)
            logger.warn({ event: "analysis_warnings", analysisType, warnings: value.warnings });
        return;
    }
    const warnings = value.warnings;
    if (!Array.isArray(warnings) || warnings.length === 0)
        return;
    logger.warn({ event: "analysis_warnings", analysisType, warnings });
}
function splits(request) {
    return request.plan !== undefined && request.plan.parts.length > 1;
}
/**
 * The value of one daylight-factor result document in `format` (D234). A
 * frame is viewed in place. With `"irbf"`, a JSON document (an older server,
 * or a result the worker could not write as a frame) is turned into the
 * frame by the kernel; when it has no exact frame, the JSON value is
 * returned and logged.
 */
export function daylightValue(document, format, logger) {
    if (isDaylightFrame(document)) {
        const result = new DaylightFactorResult(document);
        return format === "irbf" ? result : result.toJson();
    }
    if (format === "irbf") {
        try {
            const core = requireCore();
            return new DaylightFactorResult(core.daylightFrameFromJson(document));
        }
        catch (error) {
            logger.info({
                event: "daylight_result", outcome: "json", message: "the result has no exact binary frame",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    // The worker's JSON as it is: a `sensor-surfaces` result also has a
    // `surfaces` key, but it is not a facade surface record.
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document));
}
export async function runPlannedAndWait(jobs, logger, request, options = {}) {
    // Checked before any POST: a bad timeout must not bill parts and lose them.
    // The default is the kernel's wait timeout (900 s) on both paths, as today.
    const timeoutS = options.timeout ?? defaultPollTimeoutS();
    requireTimeout(timeoutS * 1_000);
    // The archive limits too: a bad one must fail before the job is paid.
    if (options.archive !== undefined)
        checkArchiveOptions(options.archive);
    if (!splits(request)) {
        if (options.retryFrom !== undefined) {
            throw new Error("retryFrom needs a request that plans into more than one part");
        }
        const signal = options.signal === undefined ? {} : { signal: options.signal };
        const daylight = splitsAnalysis(request.analysisType);
        const format = resolveResultFormat(options.resultFormat);
        // One part is one JSON job, as Python sends it: its control can carry the
        // whole `sensor-points` list, which the binary envelope does not take.
        // The kernel turns the JSON result into the frame (`daylightValue`).
        const job = await jobs.submitPrepared(request.prepared, signal);
        const completed = await jobs.waitForCompletion(job.jobId, {
            ...signal,
            ...(options.timeout === undefined ? {} : { timeout: options.timeout }),
            ...(options.onPoll === undefined ? {} : { onPoll: options.onPoll }),
        });
        const download = await jobs.downloadResults(completed.jobId, { job: completed, ...signal });
        const archive = options.archive;
        if (!daylight)
            return decompressResultValue(jobs, download.content, archive === undefined ? undefined : { archive });
        const value = daylightValue(decompressResultArchive(download.content, archive), format, logger);
        logWarnings(value, request.analysisType, logger);
        return value;
    }
    // `onPoll` reports ONE job's status; a parts run polls a schedule, so it is
    // not called here. `onProgress` reports the parts (README).
    const schedule = await submitParts(jobs, request, options, logger);
    // From here the parts are paid: every error leaves with the schedule, so the
    // caller can merge again or retry the failed parts instead of paying again.
    try {
        return await waitAndJoin(jobs, logger, request, schedule, timeoutS, options);
    }
    catch (error) {
        throw withSchedule(error, schedule);
    }
}
/** The error as it is when it already carries this schedule, else an
 * `AnalysisPartsError` with the schedule and the error as its `cause`. */
function withSchedule(error, schedule) {
    if (error !== null && typeof error === "object" && error.schedule === schedule) {
        return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new AnalysisPartsError(`${schedule.analysisType} parts stopped after submission: ${message}. ` +
        "This error's schedule holds the accepted jobs: merge it again, or pass it as retryFrom.", [], schedule, [], { cause: error });
}
async function waitAndJoin(jobs, logger, request, schedule, timeoutS, options) {
    await waitForSchedule(jobs, schedule, {
        timeoutS,
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.onProgress === undefined ? {} : { onProgress: options.onProgress }),
        onTimeout: (last) => new PartsTimeoutError(`${request.analysisType} parts timed out after ${timeoutS}s: ` +
            `${last.completedCount}/${last.totalCount} completed, ${last.failedCount} failed`, schedule),
    });
    const format = mergeFormat(schedule, options);
    const document = await mergePartsDocument(jobs, schedule, { ...options, resultFormat: format, logger });
    const value = daylightValue(document, format, logger);
    logWarnings(value, request.analysisType, logger);
    return value;
}
export async function runAndWaitParts(jobs, logger, input, options = {}) {
    return runPlannedAndWait(jobs, logger, planRequest(jobs, input, options, logger), options);
}
/** Submit a request as parts; a request of one part is refused here (use `run`). */
export async function runParts(jobs, logger, input, options = {}) {
    const request = planRequest(jobs, input, options, logger);
    if (!splits(request)) {
        throw new Error(`the ${request.analysisType} request is one job; submit it with run or analyses.execute`);
    }
    return submitParts(jobs, request, options, logger);
}
/** What a run of `input` submits and bills, offline: no request is sent. */
export function previewParts(jobs, logger, input, options = {}, target) {
    const { analysisType, plan } = planRequest(jobs, input, options, logger, target);
    const parts = plan === undefined ? [] : plan.parts.map((part) => ({
        key: part.key, floorKeys: [...part.floor_keys], sensors: part.sensors,
    }));
    const partCount = Math.max(1, parts.length);
    return {
        analysisType, partCount, totalSensors: plan?.total_sensors ?? 0, parts,
        tokensPerJob: DEFAULT_TOKENS_PER_JOB,
        estimatedCostTokens: partCount * DEFAULT_TOKENS_PER_JOB,
        ...(plan?.unsplit_reason == null ? {} : { unsplitReason: plan.unsplit_reason }),
        notes: plan?.notes ?? [],
    };
}
/** `mergeParts`: the joined value of a finished run. Only a daylight-factor
 * schedule has the binary result; any other keeps its JSON value. */
export async function mergePartsValue(jobs, logger, schedule, options = {}) {
    const format = mergeFormat(schedule, options);
    const document = await mergePartsDocument(jobs, schedule, { ...options, resultFormat: format, logger });
    const value = splitsAnalysis(schedule.analysisType)
        ? daylightValue(document, format, logger) : parseResultDocument(document).value;
    logWarnings(value, schedule.analysisType, logger);
    return value;
}
