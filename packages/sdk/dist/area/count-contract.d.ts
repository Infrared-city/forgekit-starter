/**
 * The facade sensor-count contract of a saved schedule (infrared-core #555, #582, #630, #674).
 *
 * The kernel welds each building by exact position and orients its shells
 * about the building (D208), so an unwelded mesh (a Rhino / Grasshopper
 * export) or an SDK-extruded building counts different retained sensors than
 * before. An exact (policy 2) facade schedule written by an older SDK stays
 * pollable and its finished tiles merge on their own, but a RETRY of it is refused by name: its batches
 * were sized with the old counts, and replaying them against a kernel that
 * counts differently can put more sensors in one job than it was planned for.
 *
 * The Python twin records the same fact as `batch_count_contract_version` 2
 * (`tiling/_batch_schedule.py`); this package has no separate field, so the
 * schedule record version is the discriminator.
 */
import type { AreaSchedule } from "./schedule-types.js";
/**
 * The schedule contract version of the kernel's current sensor-count rule:
 * 6 counts after the per-building weld (#555, D208), 7 counts each wall on a
 * level grid (#582, D212, `SURFGRID_VERSION` 4), 8 counts after the kernel
 * cleans each building in a canonical order (#630, `SURFGRID_VERSION` 5),
 * 9 counts a covered-but-outdoor upward face, such as a terrace under an
 * overhang, as a roof cell (#674, `SURFGRID_VERSION` 6). The Python twin is
 * count contract 5.
 */
export declare const FACADE_COUNT_CONTRACT_VERSION = 9;
/** A facade retry refused because its batches were counted by an older kernel. */
export declare class FacadeCountContractError extends Error {
    constructor(message: string);
}
/** Refuse a retry of an exact facade schedule counted under an older rule. */
export declare function checkFacadeCountContract(retryFrom: AreaSchedule | undefined): void;
