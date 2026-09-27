import type { FacadeOwnership } from "./facade-ownership.js";
import type { SiteAnswer } from "./site-assign.js";
import type { Slice } from "./cooperative.js";
import type { AreaJobsService, RunAreaOptions } from "./run-options.js";
import type { TilePosition } from "./schedule-types.js";
import type { IndexedTile, Tile } from "./types.js";
import type { SubmissionEntry } from "./plan-types.js";
export interface EntryInputs {
    readonly service: AreaJobsService;
    readonly options: RunAreaOptions;
    readonly analysisType: string;
    readonly base: Readonly<Record<string, unknown>>;
    /** Every tile's composed groups: a GRID run's; a facade run composes none. */
    readonly composed?: Readonly<Record<string, Record<string, unknown>>>;
    readonly byId: ReadonlyMap<string, Tile>;
    readonly ownership: FacadeOwnership;
    /** The site pass: the facade split reads this tile's `core` off it (D63). */
    readonly site: SiteAnswer;
    readonly surfaceFields: boolean;
    /** The kernel facade request (`area/site-facade.ts`) on a facade run. */
    readonly facadeRequest?: Readonly<Record<string, unknown>>;
    readonly retry: ReadonlySet<string> | undefined;
    /** `area-v1:<key>:<tiling constants>` — the key is the SECOND field. */
    readonly reuseScope: (key: string) => string;
}
export interface EntryResult {
    readonly entries: SubmissionEntry[];
    readonly batchMembership: Record<string, readonly string[]>;
    readonly batchSensorCounts: Record<string, number>;
    readonly extraPositions: TilePosition[];
}
/** Build every tile's submission bodies, yielding between time slices. */
export declare function buildEntries(tiles: readonly IndexedTile[], input: EntryInputs, slice: Slice): Promise<EntryResult>;
