import { STATUS_BATCH_LIMIT } from "../internal/status-batch.js";
/**
 * What the next area sweep costs, in status requests (D213). The TIMING is
 * the SDK's one poll engine (`internal/poll-engine.ts`) with the kernel's
 * numbers; this is the only area-specific input it takes. The cost is
 * discovered at runtime, not configured: one batched request per 50 open
 * jobs where the gateway has proven the route, plus the per-job requests the
 * last sweep still needed; one request per open job where it has not. The
 * kernel keeps a sweep at or below two requests a second, so a per-job sweep
 * of 81 jobs (production today) waits 40.5 s, and a batched one 1-2 s.
 */
export function nextSweepRequests(state, batched, perJob) {
    const open = openJobs(state);
    return batched ? Math.ceil(open / STATUS_BATCH_LIMIT) + perJob : open;
}
/** Jobs a sweep still asks about: those not yet terminal. */
export function openJobs(state) {
    return state.pendingCount + state.runningCount;
}
