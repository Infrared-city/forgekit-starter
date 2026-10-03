/**
 * Daylight-factor parts on the interior binary route (D228, "scene uploaded
 * once, control per part"): the kernel's `interiorArtifact` writes the ONE
 * IRBF archive a run's parts share, and `daylightPartBody` writes each
 * part's own control from it. This file asks the live capability whether
 * the route is open and turns the kernel's answers into the per-part
 * `PreparedBinary` values `plan.ts` attaches to a part's submission — it
 * does no frame/control split of its own; the kernel already did that.
 *
 * `plan.ts` uses this only when the caller gave no explicit `transport`:
 * `"json"` keeps every part on the JSON path, byte-identical to before
 * D228; `"binary"` is unchanged pre-D228 behavior (a single job, not a
 * parts split). Explicit json/binary therefore skip this module entirely.
 */
import { requireCore } from "../internal/core.js";
import { binaryResultSupported } from "./result-format.js";
const decoder = new TextDecoder("utf-8", { fatal: true });
/** True when the live capability lists `analysisType`'s binary route with a
 * result family the run can take: `json` (D228), or `daylight-points` when
 * the run wants the binary result (D234). */
export function interiorRouteSupported(capability, analysisType, wanted = "json") {
    const model = capability.models[analysisType];
    return model !== undefined && (model.resultFamilies.includes("json")
        || (wanted === "irbf" && binaryResultSupported(capability, analysisType)));
}
/**
 * Encode the request's scene ONCE for the whole run — never re-encoded per
 * part. The kernel throws when a deferred field means the frame cannot
 * carry the request exactly (`buildings`, `vegetation`, a mesh with one
 * arm, a coordinate at the frame limit, ...): `undefined` on that throw, so
 * the caller falls back to JSON parts, exactly as before D228. Never a
 * user-facing error — a deferred field is a normal, supported request.
 */
export function encodeInteriorArtifact(bytes, analysisType, limits) {
    try {
        const core = requireCore();
        // Every capability limit: a frame over one is refused here, before any
        // upload, and the parts go as JSON.
        const encoded = core.interiorArtifact(bytes, analysisType, BigInt(limits.maxGeometryBytes), limits.maxMetadataBytes, BigInt(limits.maxMeshes), BigInt(limits.maxInstances));
        return {
            artifact: {
                archive: encoded.archive,
                artifactDigest: encoded.artifactDigest,
                geometryContentDigest: encoded.contentDigest,
                encoding: encoded.encoding,
            },
            control: encoded.control,
        };
    }
    catch {
        return undefined;
    }
}
/**
 * One part's `PreparedBinary`: the artifact SHARED with every other part of
 * this run, and this part's own control — `daylightPartBody` over the
 * shared control bytes, the same kernel export the JSON route's parts use,
 * only given the control bytes instead of the whole request (D228: floors
 * and sensor-range are control, so the swap lands the same either way).
 */
export function interiorPartBinary(shared, limits, part) {
    const bytes = requireCore().daylightPartBody(shared.control, JSON.stringify(part));
    const control = JSON.parse(decoder.decode(bytes));
    return { artifact: shared.artifact, control, limits };
}
/**
 * Decide whether this run's parts go on the interior binary route (D228).
 * `undefined` keeps the JSON path, exactly as before D228, in every one of
 * these cases:
 *
 * - the caller gave an explicit `transport` (`"json"` or `"binary"`): this
 *   function is never even asked, since `submitParts` only calls it when
 *   `options.transport === undefined`;
 * - the service exposes no `binaryCapability` (an older or hand-rolled
 *   `AreaJobsService`);
 * - the capability GET fails, or its `daylight-factor` row has no `"json"`
 *   result family;
 * - `interiorArtifact` throws on a deferred field (`buildings`, `vegetation`,
 *   a mesh with one arm, a coordinate at the frame limit, ...).
 *
 * Every fallback is logged at `info`, never `error`: each is a normal,
 * supported request that simply does not fit the interior frame (yet, or at
 * all), not a defect.
 */
export async function planInteriorRoute(service, analysisType, bytes, options, logger, wanted = "json") {
    if (options.transport !== undefined || service.binaryCapability === undefined)
        return undefined;
    let capability;
    try {
        capability = await service.binaryCapability(options.signal);
    }
    catch (error) {
        logger.info({
            event: "analysis_parts_binary", outcome: "capability_unavailable", analysisType,
            error: error instanceof Error ? error.message : String(error),
        });
        return undefined;
    }
    if (!interiorRouteSupported(capability, analysisType, wanted))
        return undefined;
    const shared = encodeInteriorArtifact(bytes, analysisType, capability.limits);
    if (shared === undefined) {
        logger.info({
            event: "analysis_parts_binary", outcome: "encode_refused", analysisType,
            message: "the request carries a field the interior frame cannot encode; parts are sent as JSON",
        });
        return undefined;
    }
    const resultFormat = wanted === "irbf" && binaryResultSupported(capability, analysisType) ? "irbf" : "json";
    return { shared, limits: capability.limits, resultFormat };
}
