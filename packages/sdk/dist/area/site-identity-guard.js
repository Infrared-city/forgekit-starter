/** Check site inputs before a retry can submit another paid job. */
export function checkPaidRetrySiteIdentity(prior, current, willSubmit) {
    if (prior === undefined || !willSubmit)
        return;
    if (prior.siteIdentity === undefined || current === undefined) {
        throw new Error("retryFrom schedule has no provable site identity; old schedules may be polled and merged, but failed tiles cannot be retried safely. Start a fresh run.");
    }
    if (prior.siteIdentity !== current) {
        throw new Error("retryFrom site identity mismatch: geometry or layer inputs changed. Retry with the original immutable inputs or start a fresh run.");
    }
}
