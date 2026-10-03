export function freezeRetryFields(schedule) {
    const attempts = schedule.attempts === undefined ? undefined : Object.freeze({ ...schedule.attempts });
    return {
        ...(attempts === undefined ? {} : { attempts }),
        ...(schedule.runId === undefined ? {} : { runId: schedule.runId }),
    };
}
export function retryFieldsToJSON(schedule) {
    return {
        ...(schedule.runId === undefined ? {} : { runId: schedule.runId }),
        ...(schedule.attempts === undefined ? {} : { attempts: { ...schedule.attempts } }),
    };
}
function object(value, name, invalid) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        invalid(`${name} must be an object`);
    return value;
}
function positiveIntegers(value, name, invalid) {
    if (value === undefined)
        return undefined;
    const raw = object(value, name, invalid);
    const entries = [];
    for (const [key, item] of Object.entries(raw)) {
        if (!Number.isSafeInteger(item) || item < 1)
            invalid(`${name}.${key} must be a positive integer`);
        entries.push([key, item]);
    }
    return Object.fromEntries(entries);
}
/**
 * Read the retry fields off a parsed schedule document. `invalid` is the
 * caller's refusal (throws); this never throws on its own.
 *
 * `raw.maxAttempts` and `raw.exhaustedSubmissions` are read by name and
 * dropped -- a legacy field from an older SDK, never validated, never
 * carried into the parsed `AreaSchedule` (CUT 4, D224 review).
 */
export function parseRetryFields(raw, invalid) {
    if (raw.runId !== undefined && (typeof raw.runId !== "string" || raw.runId.length === 0)) {
        invalid("runId must be a non-empty string");
    }
    const attempts = positiveIntegers(raw.attempts, "attempts", invalid);
    return {
        ...(raw.runId === undefined ? {} : { runId: raw.runId }),
        ...(attempts === undefined ? {} : { attempts }),
    };
}
