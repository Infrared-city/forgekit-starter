import type { TileAnswer } from "./site-assign.js";
/**
 * The GRID-level half of facade ownership (`docs/DEVIATIONS.md` D63, D84, D90).
 *
 * The RULE is the kernel's and always was. What used to be HERE was grid
 * bookkeeping the kernel deliberately did not do, because it saw one tile at a
 * time: sizing the per-tile core box from the frame scales, resolving a
 * building two tiles both claim, and proving that what one tile gave up another
 * tile took.
 *
 * Since the site pass the kernel sees the whole grid in one call, so all three
 * came back with it — `core` is post-resolution, `demoted` names what an
 * earlier tile already owned, and `unowned` names any id the shrink band gave
 * up that NO tile's core took. Since the kernel `Site` plans the facade
 * batches (`area/site-facade.ts`) it also applies a retry's saved owners. This
 * class is what is left: the record of a resolved duplicate, and the REFUSAL
 * for a building no tile analyses — an unowned one, or one whose saved tile
 * was rebuilt without it.
 *
 * The Python twin is `_area/_facade_ownership.py`; the two are kept in step by
 * `public/python/tests/_area/test_facade_ownership.py` and
 * `tests/area/facade-ownership.wasm.test.ts`.
 */
export declare class FacadeOwnership {
    private readonly unowned;
    private readonly savedOwner;
    private readonly demoted;
    /**
     * Ids some visited tile ANALYSES, and the tiles this pass visited. A saved
     * owner is the only thing that can leave a building unclaimed, and whether
     * that is a defect depends on whether its tile was rebuilt — see
     * {@link FacadeOwnership.finish}.
     */
    private readonly claimed;
    private readonly visited;
    /** `unowned` is the site pass's own answer, computed before any seeding. */
    constructor(unowned: readonly string[]);
    /**
     * Adopt the ownership a saved schedule already recorded.
     *
     * A retry rebuilds SOME tiles. The kernel's answer is a property of the GRID
     * and not of one pass over it, so a fresh run and a retry agree by
     * construction — but a schedule saved by an older SDK, or one whose grid was
     * planned under a different tile list, may not. Where it disagrees the SAVED
     * answer wins: those sensors are already billed.
     *
     * "Wins" means it SELECTS a tile, not merely that it rejects the kernel's.
     * Using it only to reject loses the building in both — the saved tile never
     * had it in `core`, and the kernel's tile gives it up — and the kernel's own
     * `unowned` cannot see that, because it is computed before this filter.
     * {@link FacadeOwnership.finish} carries the host's own check for it.
     */
    seedFromSchedule(membership: Readonly<Record<string, readonly string[]>> | undefined): void;
    /**
     * Record what the kernel selected for this tile (`area/site-facade.ts`).
     *
     * The kernel applies the rule this class used to apply here — a saved owner
     * wins where the tile still carries the mesh, else the tile's post-resolution
     * `core` — so this host only records what was claimed and which duplicates
     * the site pass resolved. The Python twin is `observe_native`.
     */
    observe(tileId: string, answer: TileAnswer, activeIds: Iterable<string>): void;
    /**
     * Refuse a building nobody analyses.
     *
     * Two ways to end up analysed by nobody. The kernel's `unowned` is one: a
     * shrink-band building no core took. The other is a saved owner whose tile
     * this pass DID visit and which no longer carries the mesh — and the visited
     * set is what keeps that apart from the ordinary retry, where the owning tile
     * simply was not rebuilt and its existing job still analyses the building.
     * Raising on the second would fail a legitimate retry for geometry that is
     * already billed.
     *
     * `complete` is `false` when only SOME tiles were visited (a retry).
     */
    finish(complete: boolean): void;
    /** `{id, kept, later}` per duplicate the kernel resolved, in tile order. */
    get resolved(): readonly {
        id: string;
        kept: string;
        later: string;
    }[];
}
