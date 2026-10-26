import type { AreaSchedule } from "./schedule-types.js";
/**
 * The schedule contract version this SDK writes for facade runs, which
 * records how facade sensors are counted.
 *
 * A facade schedule saved under a lower version can still be polled and its
 * finished tiles merged, but retrying it is refused with
 * `FacadeCountContractError`, because its batches were sized with the older
 * sensor counts.
 *
 * @category Run an analysis
 */
export declare const FACADE_COUNT_CONTRACT_VERSION = 11;
/**
 * Thrown when a facade retry is refused because the saved schedule's batches
 * were sized with an older sensor-counting rule.
 *
 * The schedule's finished tiles stay readable; start a fresh run to run the
 * whole area again under the current rule.
 *
 * @category Errors
 */
export declare class FacadeCountContractError extends Error {
    constructor(message: string);
}
/**
 * Refuse a retry of an exact facade schedule counted under an older rule.
 *
 * @param retryFrom - The saved schedule being retried, if any.
 * @throws {FacadeCountContractError} when `retryFrom` is an exact facade
 * schedule written under an older sensor-counting rule.
 * @category Run an analysis
 */
export declare function checkFacadeCountContract(retryFrom: AreaSchedule | undefined): void;
