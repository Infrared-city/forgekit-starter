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
import type { AreaJobsService } from "../area/run-options.js";
import type { BinaryCapability, BinaryLimits, PreparedBinary } from "../internal/binary-submission.js";
import type { UploadArtifact } from "../internal/binary-artifact.js";
import type { Logger } from "../logger.js";
import { type DaylightResultFormat } from "./result-format.js";
import type { KernelPart, PartsOptions } from "./types.js";
/** True when the live capability lists `analysisType`'s binary route with a
 * result family the run can take: `json` (D228), or `daylight-points` when
 * the run wants the binary result (D234). */
export declare function interiorRouteSupported(capability: BinaryCapability, analysisType: string, wanted?: DaylightResultFormat): boolean;
/** The ONE scene every part of a run shares: the archive and the control
 * bytes (the request without its frame groups) the kernel split it into. */
export interface InteriorArtifact {
    readonly artifact: UploadArtifact;
    readonly control: Uint8Array;
}
/**
 * Encode the request's scene ONCE for the whole run — never re-encoded per
 * part. The kernel throws when a deferred field means the frame cannot
 * carry the request exactly (`buildings`, `vegetation`, a mesh with one
 * arm, a coordinate at the frame limit, ...): `undefined` on that throw, so
 * the caller falls back to JSON parts, exactly as before D228. Never a
 * user-facing error — a deferred field is a normal, supported request.
 */
export declare function encodeInteriorArtifact(bytes: Uint8Array, analysisType: string, limits: BinaryLimits): InteriorArtifact | undefined;
/**
 * One part's `PreparedBinary`: the artifact SHARED with every other part of
 * this run, and this part's own control — `daylightPartBody` over the
 * shared control bytes, the same kernel export the JSON route's parts use,
 * only given the control bytes instead of the whole request (D228: floors
 * and sensor-range are control, so the swap lands the same either way).
 */
export declare function interiorPartBinary(shared: InteriorArtifact, limits: BinaryLimits, part: KernelPart): PreparedBinary;
/** The shared scene and the limits every part of a run's binary route reuses. */
export interface InteriorRoute {
    readonly shared: InteriorArtifact;
    readonly limits: BinaryLimits;
    /** The result family every part asks for (D234): `"irbf"` only when the
     * caller wants the binary result and the live row lists `daylight-points`. */
    readonly resultFormat: DaylightResultFormat;
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
export declare function planInteriorRoute(service: Pick<AreaJobsService, "binaryCapability">, analysisType: string, bytes: Uint8Array, options: Pick<PartsOptions, "transport" | "signal">, logger: Logger, wanted?: DaylightResultFormat): Promise<InteriorRoute | undefined>;
