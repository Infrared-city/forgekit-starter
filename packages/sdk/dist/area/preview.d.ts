/**
 * Facade-aware area preview (WP-6, `infrared-core#240` / `#209`).
 *
 * `InfraredClient.previewArea` is synchronous and prices from the grid tile
 * count alone -- correct for a grid analysis (one job per tile), but an
 * UNDER-estimate for a facade (`analysisSurfaces`) run, where a tile can
 * split into several separately billed sub-batches. `planAreaSubmission`
 * already runs that split offline to build the real submission; this
 * module reads the job count and sensor count straight off its result
 * instead of re-deriving them, so the estimate can never drift from what a
 * real run would submit.
 *
 * "No HTTP" is the actual behaviour of `planAreaSubmission`, not merely an
 * assumption: it calls `service.prepareSubmission` (synchronous body
 * encoding, `internal/submit-body.ts` — no `fetch`, no `await`) and nothing
 * else on `service` before returning. It never calls `preflightPrepared` or
 * `submitPrepared`, which are the only two `AreaJobsService` members that
 * touch the network (`submitAreaPlan`, `area/submission.ts`, is the
 * function that calls those, and this module never calls it). The SAME
 * property is already relied on elsewhere for the SAME reason —
 * `surface-planning.wasm.test.ts` calls `planAreaSubmission` directly to
 * compute a config hash, with a mocked `service`, expecting no network call.
 */
import type { AreaJobsService, RunAreaOptions } from "./run-options.js";
import type { Polygon } from "./types.js";
export interface AreaBatchPreview {
    /** Non-empty tiles on the grid -- what the old tile-count-only estimate
     * priced from. Equal to `plannedJobCount` on a grid run. */
    readonly tileCount: number;
    /** The real planned job count: `entries.length` off the offline plan.
     * Price from THIS, not `tileCount`, on a facade run. */
    readonly plannedJobCount: number;
    readonly estimatedTimeS: number;
    readonly estimatedCostTokens: number;
    /** Total synthesized sensors across the planned facade batches, or
     * `undefined` off a grid preview (no batching to sum). */
    readonly sensorCount?: number;
}
/**
 * Preview the jobs a `runArea(service, input, polygon, options)` call would
 * submit, with no HTTP request made. Reports the real batch-split job count
 * on a facade (`analysisSurfaces`) request; degenerates to one job per tile
 * (equal to `previewArea`) on a grid request.
 *
 * `service` FIRST, same shape as `runArea` (`area/submission.ts`) and for
 * the same reason: this is the composable primitive, not the ergonomic
 * entry point. Most callers want `client.previewAreaBatches(input, polygon,
 * options)` (`InfraredClient`, `client.ts`), which supplies `service` as
 * `client.jobs` -- calling THIS function directly with only two arguments
 * silently type-errors (`service` narrows against `AreaJobsService`, not
 * `RunAreaInputLike`) rather than failing at runtime, since a caller who
 * calls it that way is missing a required argument, not passing one that
 * merely does the wrong thing.
 */
export declare function previewAreaBatches(service: AreaJobsService, input: RunAreaInputLike, polygon: Polygon, options?: RunAreaOptions): Promise<AreaBatchPreview>;
type RunAreaInputLike = Readonly<Record<string, unknown>>;
export {};
