const MAX_PARTITIONS = 64;
const MAX_SCOPES = 256;
const MAX_DOCUMENTS = 256;
const MAX_IN_FLIGHT_FIRST_USES = 64;
const MAX_SCOPE_LOCKS = 64;
const UNSUPPORTED_TTL_MS = 24 * 60 * 60 * 1_000;
export class GeometryReuseCapacityError extends Error {
    name = "GeometryReuseCapacityError";
}
function emptyState() {
    return { schema_version: 1, last_hashes: {}, documents: [] };
}
function cloneSnapshot(scope) {
    if (scope === undefined)
        return { state: emptyState(), urls: {} };
    return {
        state: structuredClone(scope.state),
        urls: { ...scope.urls },
    };
}
function liveCapability(value, now) {
    if (value === undefined)
        return undefined;
    return value.expiresAt === undefined || now < value.expiresAt ? value.outcome : undefined;
}
/** Bounded realm-local state. Signed URLs never leave this in-memory store. */
export class GeometryReuseCache {
    now;
    partitions = new Map();
    firstUses = new Map();
    scopeLocks = new Map();
    constructor(now = Date.now) {
        this.now = now;
    }
    getCapability(partitionKey) {
        const partition = this.partitions.get(partitionKey);
        if (partition === undefined)
            return undefined;
        const outcome = liveCapability(partition.capability, this.now());
        if (outcome === undefined)
            delete partition.capability;
        return outcome;
    }
    setCapability(partitionKey, outcome) {
        const now = this.now();
        const partition = this.partition(partitionKey, now);
        partition.capability = outcome === "supported"
            ? { outcome }
            : { outcome, expiresAt: now + UNSUPPORTED_TTL_MS };
    }
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
    async firstUse(partitionKey, task, signal) {
        const existing = this.firstUses.get(partitionKey);
        if (existing !== undefined) {
            // A failed first use still answers the question through the verdict it
            // recorded, so a waiter never inherits the owner's rejection.
            await waitFor(existing.then(ignore, ignore), signal);
            // An owner that rejects settles this promise immediately, which would
            // otherwise let a waiter's own cancellation pass unnoticed.
            if (signal?.aborted)
                throw signal.reason ?? new DOMException("aborted", "AbortError");
            return { owned: false };
        }
        // One cancelled waiter must not start a new billable shared submission.
        if (signal?.aborted)
            throw signal.reason ?? new DOMException("aborted", "AbortError");
        if (this.firstUses.size >= MAX_IN_FLIGHT_FIRST_USES)
            return { owned: false };
        let pending;
        pending = task().finally(() => {
            if (this.firstUses.get(partitionKey) === pending)
                this.firstUses.delete(partitionKey);
        });
        this.firstUses.set(partitionKey, pending);
        return { owned: true, value: await pending };
    }
    snapshot(partitionKey, scopeKey) {
        const now = this.now();
        const partition = this.partitions.get(partitionKey);
        const scope = partition?.scopes.get(scopeKey);
        if (scope === undefined)
            return cloneSnapshot(undefined);
        const documents = scope.state.documents.filter((item) => now / 1_000 < item.expires_at && scope.urls[item.key] !== undefined);
        if (documents.length !== scope.state.documents.length) {
            const keys = new Set(documents.map((item) => item.key));
            scope.state = { ...scope.state, documents };
            scope.urls = Object.fromEntries(Object.entries(scope.urls).filter(([key]) => keys.has(key)));
        }
        scope.touchedAt = now;
        if (partition !== undefined)
            partition.touchedAt = now;
        return cloneSnapshot(scope);
    }
    acknowledge(partitionKey, scopeKey, value) {
        const now = this.now();
        if (!Number.isFinite(value.expiresAt) || value.expiresAt <= now)
            return;
        const partition = this.partition(partitionKey, now);
        const prior = partition.scopes.get(scopeKey);
        const documents = (prior?.state.documents ?? []).filter((item) => item.key !== value.key);
        const document = {
            key: value.key,
            groups: { ...value.groups },
            acknowledged_at: now / 1_000,
            expires_at: value.expiresAt / 1_000,
        };
        partition.scopes.delete(scopeKey);
        partition.scopes.set(scopeKey, {
            state: {
                schema_version: 1,
                last_hashes: { ...value.current },
                documents: [...documents, document],
            },
            urls: { ...(prior?.urls ?? {}), [value.key]: value.url },
            touchedAt: now,
        });
        this.trim();
    }
    /**
     * Record `current` as the last group hashes of an inline submission (D189).
     * Only an acknowledgement recorded them before, so a group that changed
     * while no reference was sent never became "unchanged since the last run"
     * and stayed inline on every later run. A scope with no history is left
     * absent: empty state is a first use, which uploads every eligible group.
     */
    observe(partitionKey, scopeKey, current) {
        const scope = this.partitions.get(partitionKey)?.scopes.get(scopeKey);
        if (scope === undefined)
            return;
        scope.state = { ...scope.state, last_hashes: { ...current } };
    }
    invalidate(partitionKey, scopeKey, key, url) {
        const scope = this.partitions.get(partitionKey)?.scopes.get(scopeKey);
        if (scope === undefined || scope.urls[key] !== url)
            return;
        delete scope.urls[key];
        scope.state = {
            ...scope.state,
            documents: scope.state.documents.filter((item) => item.key !== key),
        };
    }
    async withScope(partitionKey, scopeKey, task, signal) {
        const key = `${partitionKey}\n${scopeKey}`;
        const prior = this.scopeLocks.get(key) ?? Promise.resolve();
        if (!this.scopeLocks.has(key) && this.scopeLocks.size >= MAX_SCOPE_LOCKS) {
            throw new GeometryReuseCapacityError("geometry reuse scope capacity is full");
        }
        let release;
        const next = new Promise((resolve) => { release = resolve; });
        const tail = prior.then(() => next);
        this.scopeLocks.set(key, tail);
        const wait = signal === undefined ? prior : new Promise((resolve, reject) => {
            if (signal.aborted) {
                reject(signal.reason ?? new DOMException("aborted", "AbortError"));
                return;
            }
            const abort = () => reject(signal.reason ?? new DOMException("aborted", "AbortError"));
            signal.addEventListener("abort", abort, { once: true });
            void prior.then(() => {
                signal.removeEventListener("abort", abort);
                resolve();
            });
        });
        try {
            await wait;
        }
        catch (error) {
            release();
            void tail.then(() => {
                if (this.scopeLocks.get(key) === tail)
                    this.scopeLocks.delete(key);
            });
            throw error;
        }
        try {
            return await task();
        }
        finally {
            release();
            if (this.scopeLocks.get(key) === tail)
                this.scopeLocks.delete(key);
        }
    }
    counts() {
        const scopes = [...this.partitions.values()].flatMap((item) => [...item.scopes.values()]);
        return {
            partitions: this.partitions.size,
            scopes: scopes.length,
            documents: scopes.reduce((sum, item) => sum + item.state.documents.length, 0),
        };
    }
    partition(key, now) {
        const found = this.partitions.get(key);
        if (found !== undefined) {
            found.touchedAt = now;
            this.partitions.delete(key);
            this.partitions.set(key, found);
            return found;
        }
        const created = { scopes: new Map(), touchedAt: now };
        this.partitions.set(key, created);
        this.trim();
        return created;
    }
    trim() {
        while (this.partitions.size > MAX_PARTITIONS)
            this.partitions.delete(this.partitions.keys().next().value);
        const allScopes = () => [...this.partitions].flatMap(([partition, value]) => [...value.scopes].map(([scope, state]) => [partition, scope, state]));
        while (allScopes().length > MAX_SCOPES) {
            const [partition, scope] = allScopes().sort((left, right) => left[2].touchedAt - right[2].touchedAt)[0];
            this.partitions.get(partition)?.scopes.delete(scope);
        }
        while (allScopes().reduce((sum, item) => sum + item[2].state.documents.length, 0) > MAX_DOCUMENTS) {
            const candidates = allScopes().flatMap(([partition, scope, value]) => value.state.documents.map((document) => ({ partition, scope, document })));
            candidates.sort((left, right) => left.document.acknowledged_at - right.document.acknowledged_at);
            const oldest = candidates[0];
            if (oldest === undefined)
                break;
            const value = this.partitions.get(oldest.partition)?.scopes.get(oldest.scope);
            if (value !== undefined) {
                value.state = { ...value.state, documents: value.state.documents.filter((item) => item !== oldest.document) };
                delete value.urls[oldest.document.key];
            }
        }
    }
}
function ignore() {
    return undefined;
}
function waitFor(pending, signal) {
    if (signal === undefined)
        return pending;
    if (signal.aborted)
        return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
    return new Promise((resolve, reject) => {
        const abort = () => reject(signal.reason ?? new DOMException("aborted", "AbortError"));
        signal.addEventListener("abort", abort, { once: true });
        void pending.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    });
}
let sharedCache = new GeometryReuseCache();
export function getGeometryReuseCache() {
    return sharedCache;
}
/** Test-only reset for the realm-local cache. */
export function resetGeometryReuseCacheForTests() {
    sharedCache = new GeometryReuseCache();
}
