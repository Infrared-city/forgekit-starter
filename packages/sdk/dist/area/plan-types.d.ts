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
}
export interface AreaSubmissionPlan {
    readonly polygon: Polygon;
    readonly analysisType: string;
    readonly configHash: string;
    /** Digest of the prepared site's input identity; guards paid partial retries. */
    readonly siteIdentity?: string;
    readonly gridShape: readonly [number, number];
    readonly tilePositions: readonly TilePosition[];
    readonly entries: readonly SubmissionEntry[];
    /** `entries.length`, named for what it prices (WP-6): the real planned
     * job count, which equals the tile count on a grid run but not on a
     * facade (`analysisSurfaces`) run, where a tile can split into several
     * separately billed sub-batches. Optional so a hand-built plan (a test
     * fixture, say) need not carry it -- `planAreaSubmission` always sets
     * it; a reader falls back to `entries.length` itself. */
    readonly plannedJobCount?: number;
    readonly surfaceFields: boolean;
    /** The caller asked for `cell-tris`, so the merge synthesizes them locally
     * (`area/facade-synthesis.ts`, `docs/DEVIATIONS.md` D88). Plan-only: the
     * SCHEDULE never carries it, because the capture it gates is per client. */
    readonly localCellTris?: boolean;
    readonly batchingPolicyVersion?: 2;
    readonly batchMembership?: Readonly<Record<string, readonly string[]>>;
    readonly batchSensorCounts?: Readonly<Record<string, number>>;
    readonly terrainContextMarginM: number;
    /** The weather this plan's payloads were built from, if it is provable. */
    readonly weatherIdentity?: string;
}
