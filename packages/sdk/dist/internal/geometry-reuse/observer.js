export function safeLog(logger, level, event, reason) {
    try {
        logger[level]({ event, reason });
    }
    catch {
        // A diagnostic observer cannot change submission safety.
    }
}
/**
 * Report what the first reference-carrying submission of a partition settled.
 *
 * The ids are REAL customer jobs: the submission whose acknowledgement proved
 * the deployment resolves the field, or the one accepted without one whose
 * result must be discarded. The SDK submits no probe job of its own (D71).
 */
export function notifyCapability(options, outcome, ids) {
    const event = Object.freeze({ outcome, acceptedJobIds: Object.freeze([...ids]) });
    try {
        const pending = options.onProbe?.(event);
        if (pending !== undefined)
            void Promise.resolve(pending).catch(() => undefined);
    }
    catch {
        // Observation cannot hide or repeat a billable request.
    }
    safeLog(options.logger, outcome === "supported" ? "info" : "warn", "geometry_ref_capability", `${outcome}; accepted job IDs: ${ids.length} reported`);
}
