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
export declare const OVERTURE_METADATA_CACHE_LIMIT = 50;
/** Drop every cached footer in this realm (tests, long-lived workers). */
export declare function clearOvertureMetadataCache(): void;
/** How many footers are held right now; the cache bound is observable. */
export declare function overtureMetadataCacheSize(): number;
/**
 * The cached footer for `release` and `url`, loading it at most once.
 *
 * The PROMISE is cached, not the value, so concurrent readers of one file
 * share a single footer read instead of racing to fetch it. A rejected load
 * is evicted, so a transient failure is retried rather than remembered.
 */
export declare function cachedOvertureMetadata<T>(release: string, url: string, load: () => Promise<T>): Promise<T>;
