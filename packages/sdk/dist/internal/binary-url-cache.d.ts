import type { GeometryUrlStoreGate } from "./geometry-url-store.js";
/** A bounded realm-level cache of completed URLs partitioned by its caller. */
export declare class BinaryUrlCache {
    readonly enabled: boolean;
    private readonly now;
    readonly store?: GeometryUrlStoreGate | undefined;
    /** The uploads that run now, one per URL key, for this client only (T4).
     * Used also when reuse is off: it only joins an upload that runs now. */
    readonly inFlight: Map<string, Promise<{
        readonly url: string;
        readonly reused: boolean;
    }>>;
    /** The caller's `geometryUrlStore`, read once per key before an upload. */
    constructor(enabled: boolean, now?: () => number, store?: GeometryUrlStoreGate | undefined);
    get(key: string): string | undefined;
    /** Forget `key` when its URL is `url` (the server refused it). */
    drop(key: string, url: string): void;
    /** Keep `url`; `limit` is a known end of validity (from the caller's store). */
    set(key: string, url: string, limit?: number): void;
}
export declare function resetBinaryUrlCacheForTests(): void;
/** Read SigV4 expiry. Unsigned URLs get the gateway's maximum one-hour lifetime. */
export declare function reusableUntil(raw: string, now: number): number | undefined;
