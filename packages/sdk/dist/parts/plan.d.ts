/**
 * Plan a request into parts with the kernel (D221). The host writes no part
 * and counts no sensor: `daylightParts` answers the plan from the exact
 * request bytes the one-job path sends, and `daylightPartBody` writes each
 * part's bytes.
 */
import type { SubmissionEntry } from "../area/plan-types.js";
import type { JobsService, PreparedSubmission } from "../jobs.js";
import type { Logger } from "../logger.js";
import { type InteriorRoute } from "./interior-binary.js";
import type { KernelPartsPlan, PartsOptions } from "./types.js";
export declare function splitsAnalysis(analysisType: string): boolean;
export interface PlannedRequest {
    readonly analysisType: string;
    /** The ONE-job submission, as `analyses.execute` would send it. */
    readonly prepared: PreparedSubmission;
    /** Its JSON wire bytes, when the request was planned. */
    readonly bytes?: Uint8Array;
    /** The kernel plan, when there is one. */
    readonly plan?: KernelPartsPlan;
    readonly planText?: string;
}
/**
 * Prepare the request once and ask the kernel for its parts. A request that
 * does not split (another analysis, the binary route, `maxParts: 1`) is not
 * planned at all. A request the kernel cannot plan is logged and sent as one
 * job, as before: the server, not this package, answers it (no client gate).
 */
export declare function planRequest(jobs: Pick<JobsService, "prepareSubmission">, input: Readonly<Record<string, unknown>>, options: PartsOptions, logger: Logger, 
/** The kernel's part size in sensors; `undefined` = its default (300 000, D226).
 * Not public: the owner set one target for every caller. Tests pass a small
 * one to split the committed goldens. */
target?: number): PlannedRequest;
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
export declare function partEntries(request: PlannedRequest, keys?: ReadonlySet<string>, interior?: InteriorRoute): SubmissionEntry[];
