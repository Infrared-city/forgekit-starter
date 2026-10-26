// Maintainer note (not published): the facade sensor-count contract of a saved
// schedule (infrared-core #555, #582, #630, #674).
//
// The kernel welds each building by exact position and orients its shells
// about the building (D208), so an unwelded mesh (a Rhino / Grasshopper
// export) or an SDK-extruded building counts different retained sensors than
// before. An exact (policy 2) facade schedule written by an older SDK stays
// pollable and its finished tiles merge on their own, but a RETRY of it is
// refused by name: its batches were sized with the old counts, and replaying
// them against a kernel that counts differently can put more sensors in one
// job than it was planned for.
//
// The Python twin records the same fact as `batch_count_contract_version` 2
// (`tiling/_batch_schedule.py`); this package has no separate field, so the
// schedule record version is the discriminator.
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
// Maintainer note (not published): the schedule contract version of the
// kernel's current sensor-count rule: 6 counts after the per-building weld
// (#555, D208), 7 counts each wall on a level grid (#582, D212,
// `SURFGRID_VERSION` 4), 8 counts after the kernel cleans each building in a
// canonical order (#630, `SURFGRID_VERSION` 5), 9 counts a covered-but-outdoor
// upward face, such as a terrace under an overhang, as a roof cell (#674,
// `SURFGRID_VERSION` 6). Schedule contract 10 is config_hash v2 (#679, D242)
// -- the facade COUNTS did not move with it, so this stayed at the version
// that last changed them, until now: 11 counts a downward-facing face too --
// a soffit, a cantilever underside, a wall that leans out over the ground
// (`SURFGRID_VERSION` 7). The Python twin is count contract 6.
export const FACADE_COUNT_CONTRACT_VERSION = 11;
/** What each schedule contract changed in the count, named in the refusal. */
const COUNT_CHANGES = [
    [6, "the kernel welds each building's vertices (infrared-core #555)"],
    [7, "the kernel gives each wall a level grid (infrared-core #582)"],
    [8, "the kernel cleans each building in a canonical order (infrared-core #630)"],
    [9, "the kernel gives a terrace under an overhang roof sensors (infrared-core #674)"],
    [11, "the kernel gives downward-facing faces sensors too (infrared-core surfgrid v7)"],
];
/**
 * Thrown when a facade retry is refused because the saved schedule's batches
 * were sized with an older sensor-counting rule.
 *
 * The schedule's finished tiles stay readable; start a fresh run to run the
 * whole area again under the current rule.
 *
 * @category Errors
 */
export class FacadeCountContractError extends Error {
    constructor(message) {
        super(message);
        this.name = "FacadeCountContractError";
    }
}
/**
 * Refuse a retry of an exact facade schedule counted under an older rule.
 *
 * @param retryFrom - The saved schedule being retried, if any.
 * @throws {FacadeCountContractError} when `retryFrom` is an exact facade
 * schedule written under an older sensor-counting rule.
 * @category Run an analysis
 */
export function checkFacadeCountContract(retryFrom) {
    if (retryFrom === undefined || retryFrom.batchingPolicyVersion !== 2)
        return;
    const version = retryFrom.scheduleContractVersion ?? 1;
    if (version >= FACADE_COUNT_CONTRACT_VERSION)
        return;
    const since = COUNT_CHANGES.filter(([at]) => at > version).map(([, change]) => change);
    throw new FacadeCountContractError(`retryFrom: this facade schedule was planned under schedule contract ` +
        `version ${String(version)}. Since then, ${since.join("; ")}. Its batches ` +
        `were sized with the old sensor counts, and this SDK counts under contract ` +
        `${FACADE_COUNT_CONTRACT_VERSION}. The finished tiles of this schedule ` +
        "stay readable on their own; a fresh runArea runs (and bills) the whole " +
        "area again under the new rule.");
}
