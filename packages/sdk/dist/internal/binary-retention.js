/**
 * How many encoded bytes ONE CLIENT's preflight may hold for its submits.
 *
 * The binary preflight has to encode every tile before the first billable POST,
 * and unless the encoded artifact is kept the submit encodes the very same body
 * again: two IRBF encodes a tile, one of which is never sent. Keeping it costs
 * memory, so the client stops retaining once it holds this much and any further
 * tile is encoded a second time, exactly as before.
 *
 * The budget is one maximal artifact (the binary capability's
 * `maxGeometryBytes`, 64 MiB). A tile's encoded size is known only after it is
 * encoded, so a client's peak is this budget plus at most one artifact — and
 * the bound is per client, not per run: N concurrent `runArea` calls on ONE
 * client share it, while a second client is a second budget, the same way
 * `binary-admission.ts` bounds concurrent encodes.
 */
const BUDGET_BYTES = 64 * 1024 * 1024;
/**
 * The encoded artifacts one client's preflight is holding for its own submits.
 *
 * A `WeakMap` so an abandoned plan cannot leak: the artifact dies with the
 * `PreparedSubmission` that owns it. `bytes` is the live total, and it is only
 * ever right if every retained artifact is released — `release` is idempotent
 * for exactly that reason, so the submit path and the caller's cleanup can both
 * call it for the same tile.
 */
export class BinaryRetention {
    held = new WeakMap();
    bytes = 0;
    get(prepared) {
        return this.held.get(prepared);
    }
    /** Hold this artifact if the budget allows. Returns the bytes now held for it. */
    keep(prepared, binary) {
        if (this.held.has(prepared))
            return binary.artifact.archive.byteLength;
        if (this.bytes >= BUDGET_BYTES)
            return 0;
        this.held.set(prepared, binary);
        this.bytes += binary.artifact.archive.byteLength;
        return binary.artifact.archive.byteLength;
    }
    /** Drop what is held for this submission. A no-op when nothing is. */
    release(prepared) {
        const binary = this.held.get(prepared);
        if (binary === undefined)
            return;
        this.held.delete(prepared);
        this.bytes -= binary.artifact.archive.byteLength;
    }
    /** What this client is holding right now. Zero when every tile is released. */
    get retainedBytes() {
        return this.bytes;
    }
}
