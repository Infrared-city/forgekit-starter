/**
 * Plan a request into parts with the kernel (D221). The host writes no part
 * and counts no sensor: `daylightParts` answers the plan from the exact
 * request bytes the one-job path sends, and `daylightPartBody` writes each
 * part's bytes.
 */
import { prepareAnalysisPayload } from "../area/payload.js";
import { requireCore } from "../internal/core.js";
import { preparedJsonBytes } from "../internal/prepared-json.js";
import { interiorPartBinary } from "./interior-binary.js";
/** The analyses the kernel splits into parts. */
const SPLIT_ANALYSES = new Set(["daylight-factor"]);
export function splitsAnalysis(analysisType) {
    return SPLIT_ANALYSES.has(analysisType);
}
function checkMaxParts(value) {
    if (value === undefined)
        return;
    if (!Number.isSafeInteger(value) || value < 1)
        throw new TypeError("maxParts must be a positive integer");
}
/**
 * The target a `retryFrom` schedule was planned with, read back from its
 * saved plan (never the kernel's CURRENT default): the kernel's own default
 * target is an SDK tuning value, not a user-visible contract (D226), so it
 * may change between the original run and a retry. Replanning at a new
 * default would give a different plan and `checkRetry` (`submit.ts`) would
 * then refuse the retry outright — the caller would have to start a fresh
 * run and the already-finished parts would bill again. Python's `replay`
 * (`_parts/_run.py`) avoids this by reusing the saved plan directly; this
 * reads the saved plan's `target` back into the SAME kernel call instead,
 * since this host always replans (the kernel, not the host, writes part
 * bodies and joins).
 */
function retryTarget(prior) {
    if (prior === undefined)
        return undefined;
    const target = JSON.parse(prior.plan).target;
    return typeof target === "number" ? target : undefined;
}
/**
 * Prepare the request once and ask the kernel for its parts. A request that
 * does not split (another analysis, the binary route, `maxParts: 1`) is not
 * planned at all. A request the kernel cannot plan is logged and sent as one
 * job, as before: the server, not this package, answers it (no client gate).
 */
export function planRequest(jobs, input, options, logger, 
/** The kernel's part size in sensors; `undefined` = its default (300 000, D226).
 * Not public: the owner set one target for every caller. Tests pass a small
 * one to split the committed goldens. */
target) {
    checkMaxParts(options.maxParts);
    const payload = prepareAnalysisPayload(input);
    const analysisType = String(payload["analysis-type"]);
    const prepared = jobs.prepareSubmission(analysisType, payload, {
        ...(options.webhookUrl === undefined ? {} : { webhookUrl: options.webhookUrl }),
        ...(options.webhookEvents === undefined ? {} : { webhookEvents: options.webhookEvents }),
        ...(options.transport === undefined ? {} : { transport: options.transport }),
    });
    if (!SPLIT_ANALYSES.has(analysisType) || prepared.transport !== "json" || options.maxParts === 1) {
        return { analysisType, prepared };
    }
    const bytes = preparedJsonBytes(prepared);
    // The one-job path sends the bytes planned here, not a second writing.
    const one = { ...prepared, json: () => bytes };
    // An explicit `target` (tests, `previewParts`' own param) always wins; a
    // `retryFrom` without one falls back to the schedule's OWN saved target,
    // never the kernel's current default — see `retryTarget`.
    const effectiveTarget = target ?? retryTarget(options.retryFrom);
    let planText;
    try {
        planText = requireCore().daylightParts(bytes, effectiveTarget);
    }
    catch (error) {
        logger.warn({
            event: "analysis_parts", outcome: "unplanned", analysisType,
            message: "the request is sent as one job",
            error: error instanceof Error ? error.message : String(error),
        });
        return { analysisType, prepared: one, bytes };
    }
    const plan = JSON.parse(planText);
    for (const note of plan.notes)
        logger.warn({ event: "analysis_parts", analysisType, note });
    if (options.maxParts !== undefined && plan.parts.length > options.maxParts) {
        throw new RangeError(`the ${analysisType} request plans ${plan.parts.length} parts (${plan.total_sensors} sensors), ` +
            `more than maxParts ${options.maxParts}; nothing was sent. Pass maxParts: 1 to send one job.`);
    }
    return { analysisType, prepared: one, bytes, plan, planText };
}
/**
 * One submission entry per part, in plan order (`keys`: only those parts).
 *
 * Without `interior`, each part's bytes are the kernel's
 * (`daylightPartBody`), written when the part is sent, so a plan holds one
 * copy of the scene, not one per part; `body` stays the whole request for
 * readers that need a value, and the JSON route sends `json`.
 *
 * With `interior` (D228, the interior binary route), every part instead
 * carries `interiorBinary`: the SAME shared archive (`interior.shared`,
 * encoded once for the whole run) and this part's own control
 * (`interiorPartBinary`). `submitPrepared` reads `interiorBinary` to send
 * the part through the binary submit coordinator with the route's
 * `resultFormat` (`"json"`, or `"irbf"` for the binary daylight result,
 * D234), instead of writing a JSON body at all.
 */
export function partEntries(request, keys, interior) {
    const { plan, bytes, prepared } = request;
    if (plan === undefined || bytes === undefined)
        throw new Error("the request has no parts plan");
    const entries = [];
    plan.parts.forEach((part, index) => {
        if (keys !== undefined && !keys.has(part.key))
            return;
        if (interior !== undefined) {
            entries.push({
                key: part.key, row: 0, col: index,
                prepared: { ...prepared, transport: "binary", interiorResultFormat: interior.resultFormat,
                    interiorBinary: interiorPartBinary(interior.shared, interior.limits, part) },
            });
            return;
        }
        const text = JSON.stringify(part);
        entries.push({
            key: part.key, row: 0, col: index,
            prepared: { ...prepared, json: () => requireCore().daylightPartBody(bytes, text) },
        });
    });
    return entries;
}
