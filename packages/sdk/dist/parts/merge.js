/**
 * Join a finished parts run: poll once, download every part, and let the
 * kernel join the part results into the bytes the single request gives:
 * `daylightMergeBinary` (the IRBF frame, D234; it reads JSON and IRBF parts)
 * or `daylightMerge` (the JSON bytes, as before). All or nothing, like the
 * facade merge: a part without a result stops the join with an
 * `AnalysisPartsError` that names it.
 */
import { parallel, throwable, workerCount } from "../area/merge-common.js";
import { checkAreaState, revivePolledOut } from "../area/poll.js";
import { requireCore } from "../internal/core.js";
import { decompressResultArchive } from "../results/archive.js";
import { isDaylightFrame } from "./daylight-result.js";
import { resolveResultFormat } from "./result-format.js";
import { splitsAnalysis } from "./plan.js";
import { retryableParts } from "./submit.js";
import { AnalysisPartsError } from "./types.js";
/** The frame of each part: a frame as it is, a JSON part through the kernel.
 * `undefined` when a JSON part has no exact frame (the worker's JSON fallback). */
function framesOf(core, parts) {
    const frames = [];
    for (const part of parts) {
        if (isDaylightFrame(part)) {
            frames.push(part);
            continue;
        }
        try {
            frames.push(core.daylightFrameFromJson(part));
        }
        catch {
            return undefined;
        }
    }
    return frames;
}
/** The format of a join: the caller's, else the schedule's own, else the default. */
export function mergeFormat(schedule, options) {
    return resolveResultFormat(options.resultFormat ?? schedule.resultFormat);
}
/** The joined document: the frame (`"irbf"`) or the worker's JSON bytes (`"json"`). */
function join(plan, parts, format, logger) {
    const core = requireCore();
    // The JSON join: every binary part projected to the worker's JSON first, so
    // a mix of frames and JSON parts with no exact frame still joins (D232 §8).
    const jsonJoin = () => core.daylightMerge(plan, parts.map((p) => isDaylightFrame(p) ? core.daylightJsonFromFrame(p) : p));
    if (format === "json")
        return jsonJoin();
    // Only a part with no exact frame takes the JSON join (`daylightValue` then
    // returns the JSON value). Every error of the binary join itself (a legend
    // or floor mismatch) is raised.
    const frames = framesOf(core, parts);
    if (frames === undefined)
        return jsonJoin();
    try {
        return core.daylightMergeBinary(plan, frames);
    }
    catch (error) {
        // The merged room table is over the frame's 65 535 rows (kernel text,
        // pinned by `ir-geo` `binary_result/daylight/tests.rs`): the run is paid,
        // so the JSON join gives its result. Any other join error is raised.
        if (!(error instanceof Error) || !error.message.includes("65 535 rooms"))
            throw error;
        logger?.warn({ event: "daylight_result", outcome: "json",
            message: "the merged result has more than 65 535 rooms; it is returned as JSON" });
        return jsonJoin();
    }
}
/** Parts with no result to join: failed, never sent, or of unknown outcome with no job id. */
function missingParts(schedule) {
    const retry = new Set(retryableParts(schedule));
    return schedule.partKeys.filter((key) => {
        if (retry.has(key))
            return true;
        const job = schedule.jobs.get(key);
        return job === undefined || !job.jobId;
    });
}
/** The joined result document of a parts run: the IRBF frame or the JSON bytes. */
export async function mergePartsDocument(service, schedule, options = {}) {
    // An explicit merge is a retry of the poll: its breaker's victims get one
    // more chance (D115), as in the area merges.
    revivePolledOut(schedule);
    await checkAreaState(service, schedule, {
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    const missing = missingParts(schedule);
    if (missing.length > 0) {
        const uncertain = missing.filter((key) => schedule.uncertainSubmissions.includes(key));
        throw new AnalysisPartsError(`${missing.length} of ${schedule.partKeys.length} ${schedule.analysisType} parts have no result: ` +
            `${JSON.stringify(missing)}` +
            (uncertain.length === 0 ? "" : `; outcome unknown, never resent: ${JSON.stringify(uncertain)}`) +
            ". Pass this error's schedule as retryFrom to send the failed parts again.", missing, schedule);
    }
    const open = schedule.partKeys.filter((key) => schedule.jobs.get(key)?.status !== "completed");
    if (open.length > 0) {
        throw new AnalysisPartsError(`Cannot join the parts: not finished: ${JSON.stringify(open)}; merge this error's schedule again later.`, [], schedule);
    }
    const documents = Array(schedule.partKeys.length);
    const errors = Array(schedule.partKeys.length);
    await parallel(schedule.partKeys.map((key, index) => ({ key, index })), workerCount(options.maxWorkers), async ({ key, index }) => {
        const job = schedule.jobs.get(key);
        try {
            const result = await service.downloadResults(job.jobId, {
                ...(job.lastJobSnapshot === undefined ? {} : { job: job.lastJobSnapshot }),
                ...(options.signal === undefined ? {} : { signal: options.signal }),
            });
            documents[index] = decompressResultArchive(result.content);
        }
        catch (error) {
            errors[index] = throwable(error);
        }
    });
    if (options.signal?.aborted)
        throw options.signal.reason ?? new DOMException("aborted", "AbortError");
    const failed = schedule.partKeys.filter((_key, index) => errors[index] !== undefined);
    if (failed.length > 0) {
        // The results are still on the server: merging the same schedule again
        // downloads them again. Nothing is resubmitted or billed.
        throw new AnalysisPartsError(`Cannot join the parts: download failed for ${JSON.stringify(failed)}; ` +
            "call mergeParts with this error's schedule to download them again.", [], schedule, failed, { cause: errors[schedule.partKeys.indexOf(failed[0])] });
    }
    // Only a daylight-factor schedule has a binary form; any other keeps its JSON join.
    if (!splitsAnalysis(schedule.analysisType))
        return requireCore().daylightMerge(schedule.plan, documents);
    return join(schedule.plan, documents, mergeFormat(schedule, options), options.logger);
}
