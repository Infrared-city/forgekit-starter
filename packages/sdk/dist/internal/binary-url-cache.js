const FALLBACK_TTL_MS = 60 * 60 * 1_000;
const SAFETY_MARGIN_MS = 60 * 1_000;
// Bound retained URL strings; larger valid URLs still work without caching.
const MAX_URL_LENGTH = 8_192;
// Two complete 128-tile platform runs fit while URL-only retention stays small.
const MAX_ENTRIES = 256;
const entries = new Map();
/** A bounded realm-level cache of completed URLs partitioned by its caller. */
export class BinaryUrlCache {
    enabled;
    now;
    constructor(enabled, now = Date.now) {
        this.enabled = enabled;
        this.now = now;
    }
    get(key) {
        if (!this.enabled)
            return undefined;
        const entry = entries.get(key);
        if (entry === undefined)
            return undefined;
        if (this.now() >= entry.expiresAt) {
            entries.delete(key);
            return undefined;
        }
        entries.delete(key);
        entries.set(key, entry);
        return entry.url;
    }
    set(key, url) {
        if (!this.enabled || url.length > MAX_URL_LENGTH)
            return;
        const expiresAt = reusableUntil(url, this.now());
        if (expiresAt === undefined || expiresAt <= this.now())
            return;
        entries.delete(key);
        entries.set(key, { url, expiresAt });
        while (entries.size > MAX_ENTRIES)
            entries.delete(entries.keys().next().value);
    }
}
export function resetBinaryUrlCacheForTests() { entries.clear(); }
/** Read SigV4 expiry. Unsigned URLs get the gateway's maximum one-hour lifetime. */
export function reusableUntil(raw, now) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        return undefined;
    }
    const date = url.searchParams.get("X-Amz-Date");
    const seconds = url.searchParams.get("X-Amz-Expires");
    if (date === null && seconds === null)
        return now + FALLBACK_TTL_MS - SAFETY_MARGIN_MS;
    if (date === null || seconds === null || !/^\d{8}T\d{6}Z$/.test(date) || !/^\d+$/.test(seconds)) {
        return undefined;
    }
    const signedAt = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)), Number(date.slice(9, 11)), Number(date.slice(11, 13)), Number(date.slice(13, 15)));
    const ttl = Number(seconds) * 1_000;
    if (!Number.isSafeInteger(ttl) || ttl <= 0)
        return undefined;
    const canonical = new Date(signedAt).toISOString().replace(/[-:]/g, "").replace(".000", "");
    if (canonical !== date)
        return undefined;
    return Math.min(signedAt + ttl, now + FALLBACK_TTL_MS) - SAFETY_MARGIN_MS;
}
