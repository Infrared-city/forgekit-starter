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
export declare class BoundedCache<V> {
    private readonly limit;
    private readonly entries;
    constructor(limit: number);
    get(key: string): V | undefined;
    set(key: string, value: V): void;
    clear(): void;
    get size(): number;
}
/**
 * Catalog generations kept per realm.
 *
 * Two: the one in use, and the one a re-export has just published while a
 * long-running process still holds requests against the previous folder URL.
 * A third would only hold a generation nothing is asking about.
 */
export declare const CATALOG_CACHE_LIMIT = 2;
/** Catalog base URLs whose pointer answer is kept. One per host, in practice. */
export declare const POINTER_CACHE_LIMIT = 4;
/**
 * Station documents kept per realm.
 *
 * A station file is ~1.5 MB of text, so this is the cache whose bound costs
 * real memory: three is a full-year comparison of two or three sites without
 * a re-download, and 4.5 MB at worst.
 */
export declare const STATION_CACHE_LIMIT = 3;
