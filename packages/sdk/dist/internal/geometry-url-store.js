/** The server keeps uploaded geometry for 24 h; the SDK uses an entry for 23 h. */
export const STORED_URL_LIFETIME_MS = 23 * 60 * 60 * 1_000;
const MAX_STORE_WAIT_MS = 2_000;
/** The longest wait for a {@link GeometryUrlStore.claim}; then the SDK uploads anyway. */
export const MAX_CLAIM_WAIT_MS = 60_000;
/** The end of a SigV4 URL (`X-Amz-Date` + `X-Amz-Expires`), or `undefined`. */
function signedUrlEnd(raw) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        return undefined;
    }
    const date = url.searchParams.get("X-Amz-Date");
    const seconds = Number(url.searchParams.get("X-Amz-Expires"));
    if (date === null || !/^\d{8}T\d{6}Z$/.test(date) || !(seconds > 0))
        return undefined;
    const signedAt = Date.parse(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T` +
        `${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}Z`);
    return Number.isFinite(signedAt) ? signedAt + seconds * 1_000 : undefined;
}
/** The store key: a tag and the parts of the SDK's own key, joined by `:`. */
export function storeKey(tag, key) {
    return `${tag}:${key.replaceAll("\n", ":")}`;
}
/** Settle `work`, or reject after `ms`. The timer never keeps a process alive. */
function within(work, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`no answer in ${ms} ms`)), ms);
        timer.unref?.();
        work.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
    });
}
/**
 * @internal The SDK side of a caller's store. One rule on both paths: an
 * entry is good until `min(its expiresAt, the signed URL's end)`. `get` waits
 * at most `min(2 s, timeoutMs)`; `set` is not awaited. An error or a timeout
 * is a miss, with one warning per client. The server's answer to a dead URL
 * is the real safety net: the caller then uploads again and overwrites.
 */
export class GeometryUrlStoreGate {
    store;
    logger;
    now;
    claimWaitMs;
    warned = false;
    waitMs;
    constructor(store, logger, timeoutMs, now = Date.now, claimWaitMs = MAX_CLAIM_WAIT_MS) {
        this.store = store;
        this.logger = logger;
        this.now = now;
        this.claimWaitMs = claimWaitMs;
        this.waitMs = Math.min(MAX_STORE_WAIT_MS, timeoutMs);
    }
    /** The stored entry for `key` while it is good. */
    async get(key) {
        let entry;
        try {
            entry = await within(Promise.resolve().then(() => this.store.get(key)), this.waitMs);
        }
        catch (error) {
            this.warn("get", error);
            return undefined;
        }
        if (typeof entry !== "object" || entry === null)
            return undefined;
        const { url, expiresAt } = entry;
        if (typeof url !== "string" || url === "" || typeof expiresAt !== "number")
            return undefined;
        const end = Math.min(expiresAt, signedUrlEnd(url) ?? Infinity);
        return this.now() < end ? { url, expiresAt: end } : undefined;
    }
    /** Keep `url`, uploaded now. The promise settles when the store's write
     * settles and never rejects; a run never awaits it (a claim holder releases
     * when it settles). */
    set(key, url) {
        const expiresAt = Math.min(this.now() + STORED_URL_LIFETIME_MS, signedUrlEnd(url) ?? Infinity);
        return Promise.resolve().then(() => this.store.set(key, url, expiresAt))
            .then(() => undefined, (error) => { this.warn("set", error); });
    }
    /** The store's claim on `key` ({@link GeometryUrlStore.claim}), held until
     * the returned release runs; `undefined` without a claim, when it fails or
     * after {@link MAX_CLAIM_WAIT_MS}. A claim that arrives after the wait
     * ended is released at once. No caller's signal: the claim belongs to the
     * shared upload, and each caller stops waiting on its own abort. */
    async claim(key) {
        if (this.store.claim === undefined)
            return undefined;
        let abandoned = false;
        const claimed = Promise.resolve().then(() => this.store.claim(key));
        claimed.then((release) => { if (abandoned)
            this.release(release); }, () => undefined);
        let timer;
        const stop = new Promise((resolve) => {
            timer = setTimeout(() => {
                this.warn("claim", new Error(`no claim in ${this.claimWaitMs} ms`));
                resolve(undefined);
            }, this.claimWaitMs);
            timer.unref?.();
        });
        try {
            const release = await Promise.race([claimed, stop]);
            if (release === undefined)
                abandoned = true;
            return release === undefined ? undefined : () => { this.release(release); };
        }
        catch (error) {
            abandoned = true;
            this.warn("claim", error);
            return undefined;
        }
        finally {
            clearTimeout(timer);
        }
    }
    release(release) {
        try {
            release();
        }
        catch (error) {
            this.warn("claim", error);
        }
    }
    warn(verb, error) {
        if (this.warned)
            return;
        this.warned = true;
        try {
            this.logger.warn(`geometryUrlStore.${verb} failed; the SDK uploads the geometry instead`, error);
        }
        catch {
            // A logger failure must not fail the run either.
        }
    }
}
/** @internal The gate for an optional caller store. */
export function geometryUrlStoreGate(store, logger, timeoutMs) {
    return store === undefined ? undefined : new GeometryUrlStoreGate(store, logger, timeoutMs);
}
