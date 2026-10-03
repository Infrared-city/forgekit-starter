import type { GeometryReuseProbeOutcome, ReuseSnapshot } from "./types.js";
export declare class GeometryReuseCapacityError extends Error {
    readonly name = "GeometryReuseCapacityError";
}
/** Bounded realm-local state. Signed URLs never leave this in-memory store. */
export declare class GeometryReuseCache {
    private readonly now;
    private readonly partitions;
    private readonly firstUses;
    private readonly scopeLocks;
    private readonly uploads;
    /** Upload entries whose PUT has finished: the only ones the bound evicts. */
    private readonly settledUploads;
    constructor(now?: () => number);
    getCapability(partitionKey: string): GeometryReuseProbeOutcome | undefined;
    setCapability(partitionKey: string, outcome: GeometryReuseProbeOutcome): void;
    /**
     * Single-flight the FIRST reference-carrying submission of a partition.
     *
     * There is no probe job any more: the verdict is learned from a real
     * customer submission (D71). One submission therefore has to go first and
     * alone, or a 49-tile run against a deployment that ignores the field would
     * discard 49 billed jobs where one is enough. `owned` marks the caller that
     * ran it, and only that caller may use the returned job. A waiter learns
     * nothing except that the question has been answered; it reads the verdict.
     */
    firstUse<T>(partitionKey: string, task: () => Promise<T>, signal?: AbortSignal): Promise<{
        readonly owned: true;
        readonly value: T;
    } | {
        readonly owned: false;
    }>;
    snapshot(partitionKey: string, scopeKey: string): ReuseSnapshot;
    acknowledge(partitionKey: string, scopeKey: string, value: {
        readonly key: string;
        readonly groups: Readonly<Record<string, string>>;
        readonly url: string;
        readonly current: Readonly<Record<string, string>>;
        readonly expiresAt: number;
    }): void;
    /**
     * Record `current` as the last group hashes of an inline submission (D189).
     * Only an acknowledgement recorded them before, so a group that changed
     * while no reference was sent never became "unchanged since the last run"
     * and stayed inline on every later run. A scope with no history is left
     * absent: empty state is a first use, which uploads every eligible group.
     */
    observe(partitionKey: string, scopeKey: string, current: Readonly<Record<string, string>>): void;
    invalidate(partitionKey: string, scopeKey: string, key: string, url: string): void;
    /**
     * The URL of the document `key` names, PUT at most once per partition
     * (D201). The key is the document's CONTENT, not a job's scope, so every
     * job that sends the same document — the grid job and the facade job of
     * one tile, the next design edit — shares one upload: the first caller
     * PUTs, callers that arrive meanwhile await it, and later callers get its
     * URL until the URL expires. `fresh` is true only for the caller whose
     * `put` ran. A failed PUT is its caller's: it is not kept. A waiter stops
     * waiting when its own `signal` aborts.
     */
    sharedUpload(partitionKey: string, key: string, put: () => Promise<string>, signal?: AbortSignal): Promise<{
        readonly url: string;
        readonly fresh: boolean;
    }>;
    /** Forget `key`'s upload when its URL is `url` (a dead reference). */
    dropUpload(partitionKey: string, key: string, url: string): Promise<void>;
    withScope<T>(partitionKey: string, scopeKey: string, task: () => Promise<T>, signal?: AbortSignal): Promise<T>;
    counts(): {
        readonly partitions: number;
        readonly scopes: number;
        readonly documents: number;
    };
    private partition;
    private trim;
}
export declare function getGeometryReuseCache(): GeometryReuseCache;
/** Test-only reset for the realm-local cache. */
export declare function resetGeometryReuseCacheForTests(): void;
