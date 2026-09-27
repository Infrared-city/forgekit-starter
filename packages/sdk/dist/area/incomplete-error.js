/**
 * A grid the caller PAID for and did not get (#342, D110). The recovery is in
 * the message, not a field: the caller already holds the schedule both halves
 * of it read. `cause` is the FIRST underlying failure in tile order, as
 * `SiteReadError` does for a chunked site read (D48).
 *
 * An uncertain submission WITH NO JOB is named separately, because neither of
 * the two recoveries reaches it and saying otherwise was a lie the first
 * version of this message told: there is no job for `mergeAreaJobs` to fetch,
 * and `retryFrom` carries `uncertainSubmissions` forward untouched on purpose
 * (#197, D59), since resubmitting a POST the server may already have accepted
 * can pay for the tile twice. The tile's own entry already says "do not
 * resubmit automatically". Whether to pay again is the caller's call, so the
 * message states the position and stops there.
 *
 * An uncertain submission that DID return an accepted `jobId` and later
 * SUCCEEDED is not named: it polls and downloads like any other tile, so a
 * second `mergeAreaJobs` call fetches it for free, and calling it unreachable
 * would push the caller into a paid resubmission they do not need.
 *
 * A THIRD case (2026-09-21 review, extends D115): an accepted `jobId` whose
 * job later ended FAILED. Neither blanket recovery reaches this one either —
 * the job ran, so there is no result to fetch, and `retryFrom` still will not
 * resubmit an uncertain-submission tile (#197, D59) — so it gets its own note.
 */
export function incomplete(schedule, missing) {
    const uncertain = new Set(schedule.uncertainSubmissions ?? []);
    // A tile is only unreachable if the schedule holds NO job for it. An
    // uncertain POST can still return an accepted `jobId` (`submission.ts`),
    // and that tile polls and downloads like any other — calling
    // `mergeAreaJobs` again fetches it for FREE. Naming it unreachable would
    // push the caller toward a paid resubmission they do not need.
    const unreachable = missing.filter((tile) => uncertain.has(tile.tileId) && schedule.jobs.get(tile.tileId)?.jobId === undefined);
    // Accepted (a jobId exists) but ran and FAILED: a different failure mode
    // than `unreachable`, reached by neither blanket recovery either.
    const failedAfterUncertain = missing.filter((tile) => {
        const job = schedule.jobs.get(tile.tileId);
        return uncertain.has(tile.tileId) && job?.jobId !== undefined && job.status === "failed";
    });
    const named = missing.map((tile) => `${tile.tileId} (${tile.phase ?? "unknown"}: ${tile.error})`);
    const cause = missing.find((tile) => tile.exception !== undefined)?.exception;
    const uncertainNote = unreachable.length === 0 ? "" :
        ` ${unreachable.length} of them (${unreachable.map((tile) => tile.tileId).join(", ")}) ` +
            `had an UNKNOWN submission outcome: neither recovery reaches those, because the ` +
            `server may or may not hold a job for them. Resubmitting one can pay for it twice, ` +
            `so this SDK will not do it for you — check the account's jobs, or call runArea for ` +
            `just those tiles knowing the cost.`;
    const failedNote = failedAfterUncertain.length === 0 ? "" :
        ` ${failedAfterUncertain.length} of them (${failedAfterUncertain.map((tile) => tile.tileId).join(", ")}) ` +
            `had an uncertain submission that turned out to be ACCEPTED: the job ran and FAILED, so ` +
            `there is no result for mergeAreaJobs to fetch. This SDK will not resubmit it for you ` +
            `either, for the same reason — check the job's own error, or call runArea for just that ` +
            `tile knowing the cost.`;
    return new Error(`Area run is incomplete: ${missing.length} of ${schedule.jobs.size} tiles did not ` +
        `contribute to the grid. Call mergeAreaJobs again with this schedule to fetch a ` +
        `result that is already computed, or runArea with retryFrom to resubmit a tile that ` +
        `was never accepted.${uncertainNote}${failedNote} Missing: ${named.join("; ")}`, cause === undefined ? {} : { cause });
}
