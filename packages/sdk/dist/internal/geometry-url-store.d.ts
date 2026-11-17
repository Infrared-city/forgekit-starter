import type { Logger } from "../logger.js";
/**
 * One geometry URL that a {@link GeometryUrlStore} keeps.
 *
 * @category Client
 */
export interface GeometryUrlEntry {
    /** The signed URL of the uploaded geometry. */
    readonly url: string;
    /** When the SDK stops using the URL, in milliseconds since the Unix epoch. */
    readonly expiresAt: number;
}
/**
 * A place that keeps the URLs of uploaded tile geometry for longer than one
 * client: for example `sessionStorage`, IndexedDB or a file. Give the same
 * store to a new client (a new worker, or the page after a reload) and it
 * does not upload the same geometry again while the URL is still valid.
 *
 * The SDK makes the keys and the `expiresAt` values: 23 hours after the
 * upload, or the end of the signed URL when that is earlier. A key contains
 * the gateway URLs, a SHA-256 digest of the credentials (never the
 * credentials) and the digest of the geometry. An entry is a read link to
 * your geometry for its lifetime; treat the store like a cache of secrets.
 *
 * @category Client
 */
export interface GeometryUrlStore {
    /** Return the entry for `key`, or `undefined` when there is none. */
    get(key: string): Promise<GeometryUrlEntry | undefined> | GeometryUrlEntry | undefined;
    /** Keep `url` for `key` until `expiresAt` (milliseconds since the Unix epoch). */
    set(key: string, url: string, expiresAt: number): Promise<void> | void;
    /**
     * Optional. Claim `key` for one upload across clients that share this
     * store (several workers, tabs or processes). Resolve when this client
     * holds the claim, and return the function that releases it. On a `get`
     * miss the SDK claims the key, calls `get` again (another client may have
     * uploaded it while this one waited), uploads only on a second miss, waits
     * for `set` to settle, then releases (the run itself does not wait for
     * `set`). An aborted run stops waiting for the claim at once; the shared
     * upload that other runs may wait on keeps waiting, at most 60 s, and
     * then uploads anyway (a second upload is
     * better than a stuck run). A claim that resolves later is released at
     * once. A claim that throws is a miss with one warning; the SDK uploads.
     *
     * @example Web Locks, in a page or a worker:
     * ```ts
     * claim: (key) => new Promise((claimed, failed) => {
     *   navigator.locks.request(`ir-geom:${key}`, () => new Promise<void>((release) => claimed(release)))
     *     .catch(failed);
     * }),
     * ```
     */
    claim?(key: string): Promise<() => void>;
}
/** The server keeps uploaded geometry for 24 h; the SDK uses an entry for 23 h. */
export declare const STORED_URL_LIFETIME_MS: number;
/** The longest wait for a {@link GeometryUrlStore.claim}; then the SDK uploads anyway. */
export declare const MAX_CLAIM_WAIT_MS = 60000;
/** The store key: a tag and the parts of the SDK's own key, joined by `:`. */
export declare function storeKey(tag: "irbf" | "json", key: string): string;
/**
 * @internal The SDK side of a caller's store. One rule on both paths: an
 * entry is good until `min(its expiresAt, the signed URL's end)`. `get` waits
 * at most `min(2 s, timeoutMs)`; `set` is not awaited. An error or a timeout
 * is a miss, with one warning per client. The server's answer to a dead URL
 * is the real safety net: the caller then uploads again and overwrites.
 */
export declare class GeometryUrlStoreGate {
    private readonly store;
    private readonly logger;
    private readonly now;
    private readonly claimWaitMs;
    private warned;
    private readonly waitMs;
    constructor(store: GeometryUrlStore, logger: Logger, timeoutMs: number, now?: () => number, claimWaitMs?: number);
    /** The stored entry for `key` while it is good. */
    get(key: string): Promise<GeometryUrlEntry | undefined>;
    /** Keep `url`, uploaded now. The promise settles when the store's write
     * settles and never rejects; a run never awaits it (a claim holder releases
     * when it settles). */
    set(key: string, url: string): Promise<void>;
    /** The store's claim on `key` ({@link GeometryUrlStore.claim}), held until
     * the returned release runs; `undefined` without a claim, when it fails or
     * after {@link MAX_CLAIM_WAIT_MS}. A claim that arrives after the wait
     * ended is released at once. No caller's signal: the claim belongs to the
     * shared upload, and each caller stops waiting on its own abort. */
    claim(key: string): Promise<(() => void) | undefined>;
    private release;
    private warn;
}
/** @internal The gate for an optional caller store. */
export declare function geometryUrlStoreGate(store: GeometryUrlStore | undefined, logger: Logger, timeoutMs: number): GeometryUrlStoreGate | undefined;
