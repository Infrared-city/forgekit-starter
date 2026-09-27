import type { RunAreaOptions } from "./run-options.js";
/**
 * The facade `maxSensorsPerJob` contract, shared with the Python SDK
 * (`docs/DEVIATIONS.md` D158).
 *
 * The cap lowers the exact (policy 2) per-job target, in RETAINED server
 * sensors. It never selects another policy. The kernel's
 * `checkMaxSensorsPerJob` is the one rule: a whole number from 1 to the
 * default target. It runs here, before any planning or POST.
 *
 * A retry replays its saved membership, so the cap does no work there. The
 * retry may omit the cap or repeat the saved one. A different cap is refused:
 * the positional `#batchN` keys of the saved plan would not match a new one.
 */
export declare function checkFacadeSensorCap(options: RunAreaOptions): void;
