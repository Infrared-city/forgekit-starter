/**
 * The shape a validated area plan takes between `planAreaSubmission`
 * and `submitAreaPlan`.
 *
 * Split out of `planning.ts` so that file stays inside the 400-line cap
 * (root `CLAUDE.md` rule 8) — the same split `area/schedule-types.ts`
 * already makes for the schedule. `planning.ts` re-exports both names,
 * so no importer moves.
 */
import type { PreparedSubmission } from "../jobs.js";
import type { Polygon } from "./types.js";
import type { AreaRetryContext } from "./retry-context.js";
import type { TilePosition } from "./schedule-types.js";
export interface SubmissionEntry {
    readonly key: string;
    readonly row: number;
    readonly col: number;
    readonly prepared: PreparedSubmission;
    /**
     * A facade job's pretty capture from the kernel site (`Site.facadeFrames`),
     * for the body's `terrain-alignment` (`null` when the body does not send it).
     */
    readonly capture?: (alignment: string | null) => Uint8Array;
    /** This entry's `Idempotency-Key` header value (D224), from the kernel's
     * retry plan or, on a fresh run, attempt 1 of the run's own id. */
    readonly idempotencyKey?: string;
}
/**
 * The plan for one area run: the tiles, the requests built for them and the
 * identity used to resume the run. `submitAreaPlan` sends it.
 *
 * @category Run an analysis
 */
export interface AreaSubmissionPlan {
    /** The area the run covers. */
    readonly polygon: Polygon;
    /** The analysis the run performs. */
    readonly analysisType: string;
    /** Digest of the settings the plan was built with. */
    readonly configHash: string;
    /** Digest of the site inputs; a resumed run checks it before it resubmits paid jobs. */
    readonly siteIdentity?: string;
    /** Rows and columns of the tile grid. */
    readonly gridShape: readonly [number, number];
    /** Where each tile sits in the grid. */
    readonly tilePositions: readonly TilePosition[];
    /** The requests to send, one per job. */
    readonly entries: readonly SubmissionEntry[];
    /**
     * The number of jobs the run will submit. It equals the tile count on a
     * grid run but can be larger on a facade run, where a tile can split into
     * several separately billed jobs. When absent, use `entries.length`.
     */
    readonly plannedJobCount?: number;
    /** Whether the analysis returns per-surface fields rather than a grid. */
    readonly surfaceFields: boolean;
    /** Whether the caller asked for `cell-tris`, which the merge then builds locally. Every surface run keeps its layout capture for the outline; this flag only asks for the triangles. */
    readonly localCellTris?: boolean;
    readonly batchingPolicyVersion?: 2;
    readonly batchMembership?: Readonly<Record<string, readonly string[]>>;
    readonly batchSensorCounts?: Readonly<Record<string, number>>;
    readonly terrainContextMarginM: number;
    /** The weather this plan's payloads were built from, if it is provable. */
    readonly weatherIdentity?: string;
    /** Identifies the run; each job's idempotency key is derived from it, and the schedule keeps it. */
    readonly runId: string;
    /** Present only when the run continues an earlier one with `retryFrom`. */
    readonly retryContext?: AreaRetryContext;
}
