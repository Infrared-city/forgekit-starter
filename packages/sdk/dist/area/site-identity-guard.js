import { consoleLogger } from "../logger.js";
const MISMATCH = "retryFrom site identity mismatch: geometry or layer inputs changed. Retry with the original immutable inputs or start a fresh run.";
const UNVERIFIABLE = "retryFrom cannot verify site identity in this runtime (the current site inputs cannot be hashed, for example no crypto.subtle). Run in a runtime that can hash them, or start a fresh run.";
/** The prefix of a site identity from the kernel site key (D297). */
export const SITE_IDENTITY_PREFIX = "site2:";
const OLD_KEY = "retryFrom site identity: the schedule was written by an older SDK, whose site key this SDK no longer computes (D297). Start a fresh run.";
/** Refuse by name a recorded identity from before the kernel site key. */
export function refuseOldSiteIdentity(...identities) {
    if (identities.some((id) => id !== undefined && !id.startsWith(SITE_IDENTITY_PREFIX)))
        throw new Error(OLD_KEY);
}
/** The event name of the one-time legacy-schedule warning (as Python). */
export const LEGACY_SCHEDULE_EVENT = "area.resume.site_identity_missing";
let legacyWarned = false;
function warnLegacyScheduleOnce(logger) {
    if (legacyWarned)
        return;
    legacyWarned = true;
    const message = "retryFrom schedule has no site identity (written by an older SDK), so the SDK cannot prove that trees, ground materials and per-building overrides are unchanged. Resuming without that check.";
    if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
        process.emitWarning(message, { type: "Warning", code: LEGACY_SCHEDULE_EVENT });
    }
    else {
        logger.warn(`${LEGACY_SCHEDULE_EVENT}: ${message}`);
    }
}
/**
 * Check site inputs on every `retryFrom` that comes with inputs.
 *
 * A round that resubmits a tile needs a provable identity (stricter than
 * Python). A round that resubmits nothing, such as a complete schedule, follows
 * Python's `check_site_resume`: a recorded identity must match the current
 * one, and a schedule without a recorded identity is not checked.
 */
export function checkPaidRetrySiteIdentity(prior, current, willSubmit, logger = consoleLogger) {
    if (prior === undefined)
        return;
    if (!willSubmit) {
        if (prior.siteIdentity === undefined)
            warnLegacyScheduleOnce(logger);
        if (prior.siteIdentity !== undefined) {
            // Fail closed: a recorded identity that cannot be compared proves nothing.
            if (current === undefined)
                throw new Error(UNVERIFIABLE);
            refuseOldSiteIdentity(prior.siteIdentity);
            if (prior.siteIdentity !== current)
                throw new Error(MISMATCH);
        }
        return;
    }
    if (prior.siteIdentity === undefined || current === undefined) {
        throw new Error("retryFrom schedule has no provable site identity; old schedules may be polled and merged, but failed tiles cannot be retried safely. Start a fresh run.");
    }
    refuseOldSiteIdentity(prior.siteIdentity);
    if (prior.siteIdentity !== current) {
        throw new Error(MISMATCH);
    }
}
