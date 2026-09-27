import type { PreparedSubmission } from "../job-model.js";
import type { PreparedBinary } from "./binary-submission.js";
/**
 * The encoded artifacts one client's preflight is holding for its own submits.
 *
 * A `WeakMap` so an abandoned plan cannot leak: the artifact dies with the
 * `PreparedSubmission` that owns it. `bytes` is the live total, and it is only
 * ever right if every retained artifact is released — `release` is idempotent
 * for exactly that reason, so the submit path and the caller's cleanup can both
 * call it for the same tile.
 */
export declare class BinaryRetention {
    private readonly held;
    private bytes;
    get(prepared: PreparedSubmission): PreparedBinary | undefined;
    /** Hold this artifact if the budget allows. Returns the bytes now held for it. */
    keep(prepared: PreparedSubmission, binary: PreparedBinary): number;
    /** Drop what is held for this submission. A no-op when nothing is. */
    release(prepared: PreparedSubmission): void;
    /** What this client is holding right now. Zero when every tile is released. */
    get retainedBytes(): number;
}
