import { coreThreads, requireCore } from "./core.js";
import { perTurn } from "./per-turn.js";
import { poolCall } from "./pool-task.js";
/**
 * The kernel's deterministic one-entry `payload.json` ZIP of `json` (D106).
 * The bodies of one event-loop turn are zipped in ONE kernel call, on the
 * pool of the threaded core, at most `16 x threads` per call (D299), while
 * this thread goes on (`pool-task.ts`).
 */
export const zipPayload = perTurn(async (items) => {
    const core = requireCore();
    return poolCall(() => core.zipPayloadJsonManyStart([...items]), (task) => core.zipPayloadJsonManyEnd(task));
}, () => 16 * coreThreads());
