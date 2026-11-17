import type { RunAreaOptions } from "./run-options.js";
/**
 * The `maxSensorsPerJob` rule of a facade run (D158, D300): the kernel
 * refuses a fraction, a value under 1 or over 250 000, and a retry that
 * passes a cap other than the saved one. It runs before any planning or POST.
 *
 * @throws {RangeError} with the kernel's reason.
 */
export declare function checkFacadeSensorCap(options: RunAreaOptions): void;
