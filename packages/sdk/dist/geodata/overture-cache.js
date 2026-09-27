/**
 * Parquet footer cache, one bounded map per realm.
 *
 * Reading an Overture file starts with two round trips that describe the
 * file and never the data: the object size and the parquet footer. They
 * cost the same whether the caller wants one tile or a whole area, and the
 * answer is immutable for a given release, so a second `getArea` in the
 * same process must not pay for them again (WP12 / D47).
 *
 * The key carries the RELEASE as well as the URL. A release pointer moves
 * daily and a per-release manifest is immutable, so two releases never
 * share an entry and a stale footer can never be served for a file that was
 * replaced underneath the same name.
 *
 * The map is module state, like every other cache in this layer: each realm
 * (page, Worker, Node process) keeps its own and nothing crosses a
 * `postMessage` boundary.
 */
/**
 * Files whose footer is kept. An AOI read touches a handful of files, so
 * this holds several areas at once while bounding a long-lived Worker.
 */
export const OVERTURE_METADATA_CACHE_LIMIT = 50;
const entries = new Map();
/** Drop every cached footer in this realm (tests, long-lived workers). */
export function clearOvertureMetadataCache() {
    entries.clear();
}
/** How many footers are held right now; the cache bound is observable. */
export function overtureMetadataCacheSize() {
    return entries.size;
}
/**
 * The cached footer for `release` and `url`, loading it at most once.
 *
 * The PROMISE is cached, not the value, so concurrent readers of one file
 * share a single footer read instead of racing to fetch it. A rejected load
 * is evicted, so a transient failure is retried rather than remembered.
 */
export async function cachedOvertureMetadata(release, url, load) {
    const key = `${release}\u001f${url}`;
    const cached = entries.get(key);
    if (cached !== undefined) {
        // Least-recently-used: re-insert so the hot files survive eviction.
        entries.delete(key);
        entries.set(key, cached);
        return cached;
    }
    const pending = load().catch((error) => {
        // An older pending load can be evicted and replaced before it rejects.
        // Remove only this load; do not erase the newer promise for the same key.
        if (entries.get(key) === pending)
            entries.delete(key);
        throw error;
    });
    entries.set(key, pending);
    while (entries.size > OVERTURE_METADATA_CACHE_LIMIT) {
        const oldest = entries.keys().next();
        if (oldest.done === true)
            break;
        entries.delete(oldest.value);
    }
    return pending;
}
