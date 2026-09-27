import type { Bbox } from "./http.js";
import type { ParquetMetadata } from "./overture-parquet.js";
/** Row-group reads in flight at the Overture bucket, across every type. */
export declare const OVERTURE_HOST_CONCURRENCY: number;
/**
 * The byte limit for a runtime. A parameter, so BOTH arms can be tested in
 * whichever realm the tests happen to run in.
 */
export declare function plannedBytesLimitFor(node: boolean): number;
/**
 * The per-host ceiling for a runtime.
 *
 * A browser allows six connections per host and queues the rest, so a wave
 * that starts more holds memory for requests that have not left the tab.
 * Node has no such limit and keeps its connections alive.
 */
export declare function hostConcurrencyFor(node: boolean): number;
/** A selected row group: its index in the file, and the row range it covers. */
export interface SelectedGroup {
    readonly index: number;
    readonly start: number;
    readonly end: number;
}
/**
 * The byte budget of one acquisition call.
 *
 * An area read of the three ground themes shares ONE of these, because it is
 * one process that holds all three at once; a lone read makes its own. The
 * refusal names the collection whose plan took the total over the limit.
 */
export interface PlannedBudget {
    readonly limitBytes: number;
    /** Bytes planned so far across every collection of this call. */
    readonly plannedBytes: number;
    /** Add one collection's plan, refusing if the CALL total is over. */
    add(collection: string, bbox: Bbox, bytes: number, files: number, rowGroups: number): void;
}
/** A budget for one call; `limit` defaults to this runtime's ceiling. */
export declare function plannedBudget(limit?: number): PlannedBudget;
/**
 * Compressed bytes the selected row groups hold in the projected columns.
 *
 * Only the columns the reader asks for are counted, because only those are
 * fetched. A column chunk with no recorded size counts as zero rather than
 * failing the read: the limit is a guard, and a footer that omits a size
 * must not turn into a refusal.
 */
export declare function plannedBytes(metadata: ParquetMetadata, groups: readonly SelectedGroup[], columns: readonly string[]): number;
/** Row-group reads in flight right now; the ceiling is observable. */
export declare function hostSlotsInUse(): number;
/**
 * Run one row-group read under the shared per-host ceiling.
 *
 * Module state, so the three ground themes read concurrently share ONE
 * budget of connections instead of each taking its own. A browser would
 * otherwise queue the surplus in the network stack while this process kept
 * the memory for every read it believed was in flight.
 */
export declare function withHostSlot<T>(run: () => Promise<T>): Promise<T>;
