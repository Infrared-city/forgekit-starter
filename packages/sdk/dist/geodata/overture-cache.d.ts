/**
 * Number of Overture files (`50`) whose parquet footer is kept in the cache.
 * The oldest-used entry is dropped first.
 *
 * @category Geodata
 */
export declare const OVERTURE_METADATA_CACHE_LIMIT = 50;
/**
 * Drop every cached Overture file footer held by this runtime. Useful in
 * tests and long-lived workers.
 *
 * @category Geodata
 */
export declare function clearOvertureMetadataCache(): void;
/**
 * How many Overture file footers are cached right now.
 *
 * @category Geodata
 */
export declare function overtureMetadataCacheSize(): number;
/**
 * Return the cached footer for an Overture file, loading it at most once.
 *
 * Concurrent callers for the same file share one load. A failed load is not
 * remembered, so the next call tries again.
 *
 * @param release - The Overture release the file belongs to.
 * @param url - The parquet file URL.
 * @param load - Loads the footer when it is not cached.
 * @returns The footer.
 * @category Geodata
 */
export declare function cachedOvertureMetadata<T>(release: string, url: string, load: () => Promise<T>): Promise<T>;
