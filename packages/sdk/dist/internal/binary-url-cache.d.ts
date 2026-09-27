/** A bounded realm-level cache of completed URLs partitioned by its caller. */
export declare class BinaryUrlCache {
    private readonly enabled;
    private readonly now;
    constructor(enabled: boolean, now?: () => number);
    get(key: string): string | undefined;
    set(key: string, url: string): void;
}
export declare function resetBinaryUrlCacheForTests(): void;
/** Read SigV4 expiry. Unsigned URLs get the gateway's maximum one-hour lifetime. */
export declare function reusableUntil(raw: string, now: number): number | undefined;
