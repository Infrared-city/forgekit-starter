// Maintainer note (not published): facade-aware area preview (WP-6, `infrared-core#240` /
// `#209`).
//
// `InfraredClient.previewArea` is synchronous and prices from the grid tile count alone --
// correct for a grid analysis (one job per tile), but an UNDER-estimate for a facade
// (`analysisSurfaces`) run, where a tile can split into several separately billed sub-batches.
// `planAreaSubmission` already runs that split offline to build the real submission; this
// module reads the job count and sensor count straight off its result instead of re-deriving
// them, so the estimate can never drift from what a real run would submit.
//
// "No HTTP" is the actual behaviour of `planAreaSubmission`, not merely an assumption: it calls
// `service.prepareSubmission` (synchronous body encoding, `internal/submit-body.ts` -- no
// `fetch`, no `await`) and nothing else on `service` before returning. It never calls
// `preflightPrepared` or `submitPrepared`, which are the only two `AreaJobsService` members
// that touch the network (`submitAreaPlan`, `area/submission.ts`, is the function that calls
// those, and this module never calls it). The SAME property is already relied on elsewhere for
// the SAME reason -- `surface-planning.wasm.test.ts` calls `planAreaSubmission` directly to
// compute a config hash, with a mocked `service`, expecting no network call.
import { planAreaSubmission } from "./planning.js";
import { DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE } from "../pricing.js";
// A `#batch` key is synthetic and inherits its parent tile's grid position
// (`planAreaSubmission`); the ORIGINAL per-tile entry is what `tilePositions` seeds with, one
// per non-empty grid tile, regardless of whether that tile carries any facade batch at all.
// Filtering out the synthetic keys recovers the grid tile count without generating the tile
// grid a second time.
function gridTileCount(tilePositions) {
    return tilePositions.filter((position) => !position.tileId.includes("#batch")).length;
}
function sumSensorCounts(counts) {
    if (counts === undefined)
        return undefined;
    return Object.values(counts).reduce((total, count) => total + count, 0);
}
/**
 * Preview the jobs a `runArea(service, input, polygon, options)` call would submit, without
 * submitting anything.
 *
 * It reports the real number of jobs, which on a facade (`analysisSurfaces`) request can exceed
 * the tile count because a tile may split into several billed batches. On a grid request it
 * gives one job per tile, like `previewArea`. Most callers want
 * `client.previewAreaBatches(input, polygon, options)`, which passes `client.jobs` as `service`.
 *
 * @param service - The jobs service the plan is prepared against, for example `client.jobs`.
 * @param input - The analysis request fields.
 * @param polygon - The area to analyse.
 * @param options - The same run options `runArea` takes.
 * @returns The tile count, planned job count, estimated time and cost, and the sensor count for
 * a facade request.
 * @category Run an analysis
 */
// Maintainer note (not published): `service` FIRST, same shape as `runArea`
// (`area/submission.ts`) and for the same reason: this is the composable primitive, not the
// ergonomic entry point. Most callers want `client.previewAreaBatches` (`InfraredClient`,
// `client.ts`), which supplies `service` as `client.jobs` -- calling THIS function directly with
// only two arguments silently type-errors (`service` narrows against `AreaJobsService`, not
// `RunAreaInputLike`) rather than failing at runtime, since a caller who calls it that way is
// missing a required argument, not passing one that merely does the wrong thing.
export async function previewAreaBatches(service, input, polygon, options = {}) {
    const plan = await planAreaSubmission(service, input, polygon, options);
    const plannedJobCount = plan.plannedJobCount ?? plan.entries.length;
    const sensorCount = sumSensorCounts(plan.batchSensorCounts);
    return {
        tileCount: gridTileCount(plan.tilePositions),
        plannedJobCount,
        estimatedTimeS: plannedJobCount * ESTIMATED_SECONDS_PER_TILE,
        estimatedCostTokens: plannedJobCount * DEFAULT_TOKENS_PER_JOB,
        ...(sensorCount === undefined ? {} : { sensorCount }),
    };
}
