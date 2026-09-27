/**
 * Bounded caches for the static weather reader.
 *
 * Every cache in this SDK is module state in the realm that loads it, so a
 * page, a Worker and a Node process each keep their own and nothing crosses a
 * `postMessage` boundary. What was missing is the BOUND: the catalog cache
 * was an unbounded `Map`, so a long-lived process that outlives a few catalog
 * generations kept every one of them — 7.45 MB of text plus its indices each
 * — and station documents were not cached at all, so a caller asking two
 * questions about the same station downloaded it twice
 * (`FABLE-perf-audit.md` row 4a).
 *
 * The eviction rule is least-recently-USED, not least-recently-written: the
 * generation a process keeps asking about is the one it should keep.
 */
/** A `Map` with a ceiling, evicting the least recently used entry. */
export class BoundedCache {
    limit;
    entries = new Map();
    constructor(limit) {
        this.limit = limit;
        if (!Number.isSafeInteger(limit) || limit < 1) {
            throw new TypeError("cache limit must be a positive integer");
        }
    }
    get(key) {
        const value = this.entries.get(key);
        if (value === undefined)
            return undefined;
        // Re-inserting moves the key to the end of the iteration order, which is
        // what makes the first key the least recently used one.
        this.entries.delete(key);
        this.entries.set(key, value);
        return value;
    }
    set(key, value) {
        this.entries.delete(key);
        this.entries.set(key, value);
        while (this.entries.size > this.limit) {
            const oldest = this.entries.keys().next();
            if (oldest.done === true)
                break;
            this.entries.delete(oldest.value);
        }
    }
    clear() {
        this.entries.clear();
    }
    get size() {
        return this.entries.size;
    }
}
/**
 * Catalog generations kept per realm.
 *
 * Two: the one in use, and the one a re-export has just published while a
 * long-running process still holds requests against the previous folder URL.
 * A third would only hold a generation nothing is asking about.
 */
export const CATALOG_CACHE_LIMIT = 2;
/** Catalog base URLs whose pointer answer is kept. One per host, in practice. */
export const POINTER_CACHE_LIMIT = 4;
/**
 * Station documents kept per realm.
 *
 * A station file is ~1.5 MB of text, so this is the cache whose bound costs
 * real memory: three is a full-year comparison of two or three sites without
 * a re-download, and 4.5 MB at worst.
 */
export const STATION_CACHE_LIMIT = 3;
