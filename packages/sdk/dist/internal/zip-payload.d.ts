/**
 * The kernel's deterministic one-entry `payload.json` ZIP of `json` (D106).
 * The bodies of one event-loop turn are zipped in ONE kernel call, on the
 * pool of the threaded core, at most `16 x threads` per call (D299), while
 * this thread goes on (`pool-task.ts`).
 */
export declare const zipPayload: (json: Uint8Array) => Promise<Uint8Array>;
