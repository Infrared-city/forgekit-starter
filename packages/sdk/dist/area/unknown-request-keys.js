/**
 * Drop a top-level AREA request key the kernel field registry does not know.
 *
 * Up to 0.14.0-next.1 this host sent an unknown top-level key as is; the
 * server ignored it. Since infrared-core #679 the schedule hash
 * (`config-hash.ts`, called from `planAreaSubmission`) reads the same
 * payload through the kernel field registry, and the kernel refuses an
 * unknown key (`config_hash_v2`'s `unknown-key` error) instead of ignoring
 * it. A caller that spreads RUN OPTIONS into the request body by mistake —
 * `strategy` and `windDirectionDeg` are `mergeAreaJobs` options, not request
 * fields — now sees that refusal.
 *
 * This restores the 0.13 behaviour (the request still runs) with one
 * difference: a dropped key is named in one `warn` log line, so the mistake
 * is visible instead of silent. The kernel's own strict check is unchanged;
 * this runs BEFORE it, on the host side only.
 *
 * SCOPED TO AREA MODELS (`planAreaSubmission`'s payload): the registry's
 * field list is what `config_hash_v2` itself hashes against, so for an area
 * model it is a complete, safe filter. The interior models (`daylight-factor`,
 * `energy-balance`, `spatial-daylight-autonomy`, reached through
 * `parts/plan.ts`) are a KNOWN GAP today — `daylight-factor`'s registry row
 * has no `latitude`/`longitude`, although the host sends them and the server
 * accepts them — and `config_hash_v2` is never called on that path, so there
 * is no throw to fix there. Do not call this from `parts/plan.ts` or
 * `client.ts`'s `run()` until that gap is closed; it would silently drop a
 * field those paths still send.
 *
 * Call this once per payload, right after `prepareAreaPayload`, before the
 * payload is hashed or sent. It mutates the payload in place so the hash and
 * the wire body see the same, filtered object.
 */
import { requireCore } from "../internal/core.js";
import { registryModel } from "./field-registry.js";
export function dropUnknownRequestKeys(payload, logger) {
    const model = payload["analysis-type"];
    if (typeof model !== "string")
        return;
    const row = registryModel(model);
    // An unknown model is not this function's job to report: the hash call
    // and the server both name it.
    if (row === undefined)
        return;
    const inert = new Set(requireCore().inertKeys(model));
    for (const key of Object.keys(payload)) {
        if (key === "analysis-type" || row.byKey.has(key) || inert.has(key))
            continue;
        delete payload[key];
        logger.warn({
            event: "ignored_unknown_request_key",
            analysisType: model,
            key,
            message: `ignored unknown request key ${JSON.stringify(key)} for ${model} ` +
                "(run option? pass it in runAreaAndWait options)",
        });
    }
}
