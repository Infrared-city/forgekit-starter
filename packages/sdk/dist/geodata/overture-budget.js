import { OvertureReadTooLargeError } from "./errors.js";
/**
 * What one Overture CALL is allowed to move, and how much of it at once.
 *
 * Two limits, both of them stated rather than discovered. The parquet
 * footers say exactly how many compressed bytes the selected row groups
 * hold before a single one is fetched, so an AOI that cannot fit fails HERE
 * with a number in the message — not as an out-of-memory kill, and never as
 * a browser tab that stops responding. And a browser allows six connections
 * per host, so a wave that starts nine row-group reads at one bucket queues
 * three of them anyway while holding three more decoded buffers alive.
 */
/**
 * Compressed bytes ONE CALL may plan, across every type it reads.
 *
 * Node gets 512 MiB and a browser 256 MiB — a browser tab shares a ~4 GB
 * heap with the page it is embedded in, and the decoded rows are several
 * times their compressed size. Measured for scale: a 5 km2 Vienna box plans
 * about 96 MiB across the three ground themes together.
 */
const OVERTURE_PLANNED_BYTES_LIMIT = plannedBytesLimitFor(isNode());
/** Row-group reads in flight at the Overture bucket, across every type. */
export const OVERTURE_HOST_CONCURRENCY = hostConcurrencyFor(isNode());
/**
 * The byte limit for a runtime. A parameter, so BOTH arms can be tested in
 * whichever realm the tests happen to run in.
 */
export function plannedBytesLimitFor(node) {
    return node ? 512 * 1024 * 1024 : 256 * 1024 * 1024;
}
/**
 * The per-host ceiling for a runtime.
 *
 * A browser allows six connections per host and queues the rest, so a wave
 * that starts more holds memory for requests that have not left the tab.
 * Node has no such limit and keeps its connections alive.
 */
export function hostConcurrencyFor(node) {
    return node ? 16 : 6;
}
function isNode() {
    const runtime = globalThis.process;
    return typeof runtime?.versions?.node === "string";
}
/** A budget for one call; `limit` defaults to this runtime's ceiling. */
export function plannedBudget(limit = OVERTURE_PLANNED_BYTES_LIMIT) {
    let planned = 0;
    return {
        limitBytes: limit,
        get plannedBytes() {
            return planned;
        },
        add(collection, bbox, bytes, files, rowGroups) {
            planned += bytes;
            if (planned > limit) {
                throw new OvertureReadTooLargeError(collection, planned, limit, files, rowGroups, bbox);
            }
        },
    };
}
/**
 * Compressed bytes the selected row groups hold in the projected columns.
 *
 * Only the columns the reader asks for are counted, because only those are
 * fetched. A column chunk with no recorded size counts as zero rather than
 * failing the read: the limit is a guard, and a footer that omits a size
 * must not turn into a refusal.
 */
export function plannedBytes(metadata, groups, columns) {
    const wanted = new Set(columns);
    let total = 0;
    for (const group of groups) {
        const rowGroup = metadata.row_groups[group.index];
        if (rowGroup === undefined)
            continue;
        for (const column of rowGroup.columns) {
            const path = column.meta_data?.path_in_schema[0];
            if (path === undefined || !wanted.has(path))
                continue;
            total += Number(column.meta_data?.total_compressed_size ?? 0);
        }
    }
    return total;
}
let active = 0;
const waiting = [];
/**
 * Take a slot, or wait for one.
 *
 * The slot is HANDED OVER on release rather than released and re-taken, so
 * a caller arriving while a waiter is being woken cannot barge in front of
 * it and put two readers on one slot. The count is therefore an actual
 * ceiling, not an advisory one.
 */
function acquire() {
    if (active < OVERTURE_HOST_CONCURRENCY) {
        active += 1;
        return Promise.resolve();
    }
    return new Promise((resolve) => waiting.push(resolve));
}
function release() {
    const next = waiting.shift();
    if (next === undefined)
        active -= 1;
    else
        next();
}
/** Row-group reads in flight right now; the ceiling is observable. */
export function hostSlotsInUse() {
    return active;
}
/**
 * Run one row-group read under the shared per-host ceiling.
 *
 * Module state, so the three ground themes read concurrently share ONE
 * budget of connections instead of each taking its own. A browser would
 * otherwise queue the surplus in the network stack while this process kept
 * the memory for every read it believed was in flight.
 */
export async function withHostSlot(run) {
    await acquire();
    try {
        return await run();
    }
    finally {
        release();
    }
}
