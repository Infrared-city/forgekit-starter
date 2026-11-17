import { checkBinaryRoute } from "../internal/binary-submission.js";
import { areaTransport } from "../internal/transport-choice.js";
import { consoleLogger } from "../logger.js";
import { checkGridSchedule, GridMerge } from "./grid-merge.js";
import { throwable } from "./merge-common.js";
import { SurfaceFeed } from "./merge-surface.js";
import { planAreaSubmission } from "./planning.js";
import { siteKeyMemo } from "./prepared-site.js";
import { finalError } from "./run-errors.js";
import { EngineDriver } from "./run-engine.js";
import { recordsFromFacts } from "./engine-jobs.js";
import { acceptedAction, batchConfig, freePreparedCaptures, runAction, } from "./run-io.js";
import { computeAreaState, freezeAreaSchedule } from "./schedule.js";
import { effectiveOptions, facadeCaptureFor, rememberFacadeInputs, scheduleFromPlan, shareFacadeSites, } from "./submission.js";
const DEFAULT_AREA_TIMEOUT_S = 3_600;
function analysisType(input) {
    return String(input.analysisType ?? input["analysis-type"]);
}
/** The public schedule of an analysis from the engine's facts. */
function scheduleFromFacts(an, facts, options) {
    recordsFromFacts(an, facts);
    return freezeAreaSchedule({
        ...scheduleFromPlan(an.plan, an.jobs, facts.failed, facts.uncertain, [], facts.payment_stopped ? 402 : null, options),
        runId: facts.run_id,
        ...(Object.keys(facts.attempts).length === 0 ? {} : { attempts: facts.attempts }),
    });
}
/** The item of a finished analysis: its result, or its error. Frees its merger. */
async function finish(service, an, outcome, facts, options) {
    an.done = true; // its item is being made: never a second item for it
    const { index, analysisType } = an;
    let schedule;
    try {
        const made = scheduleFromFacts(an, facts, options);
        schedule = made;
        const failure = finalError(outcome, facts, analysisType, options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S, () => computeAreaState(made));
        if (failure !== undefined)
            throw failure; // never an incomplete result
        if (an.grid === undefined) {
            return { index, analysisType, result: await an.surface.finish(made, options.logger) };
        }
        checkGridSchedule(made);
        return { index, analysisType, result: an.grid.finish(made, options.logger, an.started) };
    }
    catch (error) {
        return { index, analysisType, error: throwable(error) };
    }
    finally {
        // A failing step never skips the next one, and never replaces the item.
        const tidy = (step) => { try {
            step();
        }
        catch { /* the item is made */ } };
        tidy(() => service.captures?.forgetSchedule(schedule ?? { jobs: an.jobs }));
        tidy(() => an.grid?.free());
        tidy(() => an.surface?.free());
        for (const entry of an.entries.values())
            tidy(() => service.releasePreflight?.(entry.prepared));
        // No reference to the tile bodies stays after the hand-over.
        an.entries.clear();
        an.plan = { ...an.plan, entries: [] };
    }
}
/** The tile of each planned key: its entry's row and column (a facade batch has its tile's). */
function tilesOf(plan) {
    const tiles = new Map(plan.entries.map((e) => [e.key, { row: e.row, col: e.col }]));
    return (key) => tiles.get(key);
}
/**
 * The stream behind `InfraredClient.runAreaStream`. Results come in the order
 * they finish. Leaving the loop early cancels the rest.
 */
export async function* streamArea(service, inputs, polygon, options = {}) {
    if (options.retryFrom !== undefined)
        throw new TypeError("runAreaStream takes no retryFrom; use runArea");
    const how = { ...options, logger: options.logger ?? consoleLogger };
    const controller = new AbortController();
    const outer = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted === true)
        outer();
    options.signal?.addEventListener("abort", outer, { once: true });
    const signal = controller.signal;
    const ready = [];
    const analyses = [];
    // Plan every analysis first (no HTTP but the capability GET); a planning error is its item.
    // The analyses share their mesh groups: each is packed and hashed once (`SiteKeyMemo`).
    const memo = siteKeyMemo();
    // The facade analyses on one site share each tile's parts (groups, captures,
    // scenes): the kernel makes them once and drops them when the last one took
    // them (`Site.shareFacadeParts`); the end of the stream drops what is left.
    // A site whose analyses plan different jobs shares nothing (a part one of
    // them never asks for would be kept to the end).
    const facadeSites = new Map();
    for (const [index, input] of inputs.entries()) {
        try {
            const effective = effectiveOptions({ ...options, signal }, analysisType(input));
            const plan = await planAreaSubmission(service, input, polygon, effective, memo, facadeSites);
            if (areaTransport(effective, plan.analysisType) === "binary" && plan.entries.length > 0 &&
                service.binaryCapability !== undefined) {
                checkBinaryRoute(plan.analysisType, await service.binaryCapability(signal));
            }
            analyses.push({ index, analysisType: analysisType(input), plan, jobs: new Map(),
                entries: new Map(plan.entries.map((e) => [e.key, e])), started: performance.now(),
                capture: (entry) => facadeCaptureFor(service, plan, entry),
                remember: (capture, jobId) => rememberFacadeInputs(service, capture, jobId, plan.localCellTris === true),
                ...(plan.surfaceFields
                    ? { surface: new SurfaceFeed(service, plan.analysisType, tilesOf(plan)) }
                    : { grid: new GridMerge(plan, options) }) });
        }
        catch (error) {
            ready.push({ index, analysisType: analysisType(input), error: throwable(error) });
        }
    }
    const release = shareFacadeSites(facadeSites);
    const binary = analyses.some((an) => an.plan.entries.some((e) => e.prepared.transport === "binary"));
    const driver = new EngineDriver({ retries: options.retries ?? 1,
        area_timeout_us: Math.round((options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S) * 1e6),
        ...await batchConfig(service, binary, signal) });
    const io = { service, analyses, byJob: new Map(), logger: how.logger,
        ...(options.onAccepted === undefined ? {} : { onAccepted: options.onAccepted }) };
    driver.onAccepted = (act) => acceptedAction(io, act);
    let wakeConsumer = () => { };
    // The joins being made (a surface join runs on the pool): the run ends after them.
    const finishing = [];
    const progress = options.onProgress === undefined ? undefined : () => {
        for (const [a, an] of analyses.entries()) {
            if (an.done === true)
                continue;
            try {
                options.onProgress(computeAreaState(scheduleFromFacts(an, driver.facts(a), how)));
            }
            catch { /* an observer never changes the run */ }
        }
    };
    const loop = driver.run(analyses.map((an) => ({ keys: an.plan.entries.map((e) => e.key), run_id: an.plan.runId })), signal, (act, own) => runAction(io, act, own), (act) => {
        const an = analyses[act.a];
        finishing.push(finish(service, an, act.outcome, act.facts, how).then((item) => {
            ready.push(item);
            wakeConsumer();
        }, (error) => {
            ready.push({ index: an.index, analysisType: an.analysisType, error: throwable(error) });
            wakeConsumer();
        }));
    }, progress).catch((error) => { controller.abort(error); }).finally(async () => {
        try {
            await Promise.all(finishing);
            freePreparedCaptures(io);
        }
        finally {
            // Whatever fails above, the unfinished analyses end with an error item and the consumer wakes.
            endUnfinished();
        }
    });
    function endUnfinished() {
        for (const an of analyses) {
            // Its item is made (maybe taken already): never a second item for it.
            if (an.done === true)
                continue;
            ready.push({ index: an.index, analysisType: an.analysisType,
                error: throwable(signal.reason ?? new Error("run stopped")) });
            // No schedule reaches the caller, so nothing can merge these jobs later.
            try {
                service.captures?.forgetSchedule({ jobs: an.jobs });
                an.grid?.free();
                for (const entry of an.entries.values())
                    service.releasePreflight?.(entry.prepared);
            }
            catch { /* the error item is made */ }
        }
        wakeConsumer();
    }
    try {
        for (let left = inputs.length; left > 0; left -= 1) {
            while (ready.length === 0)
                await new Promise((resolve) => { wakeConsumer = resolve; });
            // Shifted out, never held: after the hand-over the SDK has no reference to the result.
            const item = ready.shift();
            const a = analyses.findIndex((an) => an.index === item.index);
            if (a >= 0)
                driver.push({ kind: "taken", a });
            yield item;
        }
    }
    finally {
        controller.abort(new DOMException("result stream closed", "AbortError"));
        options.signal?.removeEventListener("abort", outer);
        await loop;
        release();
    }
}
/**
 * `runAreaAndWait`: the results of a stream of `count` analyses, in input order. When an analysis
 * failed, the first error in input order is thrown after every analysis is finished (as Python's
 * `run_area_and_wait`).
 */
export async function allResults(stream, count) {
    const results = new Array(count);
    const errors = new Map();
    for await (const item of stream) {
        if (item.error !== undefined)
            errors.set(item.index, item.error);
        else
            results[item.index] = item.result;
    }
    if (errors.size > 0)
        throw errors.get(Math.min(...errors.keys()));
    return results;
}
