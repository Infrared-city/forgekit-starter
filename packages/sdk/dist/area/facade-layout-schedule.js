/**
 * Derive {@link synthesizeFacadeLayout}'s `siteOrigin`/`jobs` from a saved
 * `AreaSchedule` (infrared-core#725).
 *
 * The platform's default case is many tiles, so a caller reloading a tiled
 * facade run should not have to recompute a tile's frame by hand. This
 * reuses the SAME two kernel calls the submission path's own tiling uses to
 * anchor a tile (`tileSwOffset` + `scalarUnproject` -- together exactly what
 * the kernel's `scalarSiteToTileAffine` composes internally, `ir-geo`
 * `tiling/scalar_port.rs`), so a schedule-derived `tileOrigin` can never
 * drift from the one the live submission used.
 */
import { requireCore } from "../internal/core.js";
import { kernelPolygonOrigin } from "./tile-frames.js";
function tileOrigin(row, col, schedule, siteOrigin) {
    const core = requireCore("tiling");
    const [swX, swY] = core.tileSwOffset(row, col, schedule.analysisType);
    const [lon, lat] = core.scalarUnproject(siteOrigin.lon, siteOrigin.lat, swX, swY);
    return { lon: lon, lat: lat };
}
/**
 * `(lon, lat)` of `jobId`'s tile south-west corner (D254) -- the same
 * computation `runArea`'s own tiling used to anchor that tile when it
 * submitted it. Throws when `jobId` names none of `schedule.jobs`'s jobs.
 */
export function tileOriginOf(schedule, jobId) {
    const entry = [...schedule.jobs.values()].find((job) => job.jobId === jobId);
    if (entry === undefined) {
        throw new Error(`tileOriginOf: job id '${jobId}' is not in this schedule`);
    }
    return tileOrigin(entry.row, entry.col, schedule, kernelPolygonOrigin(schedule.polygon));
}
/**
 * `{siteOrigin, jobs}` for every SUBMITTED job a saved tiled run holds (a
 * job with no `jobId` -- failed or uncertain submission -- has nothing to
 * reproduce, and is skipped). Each job's building ids come from
 * `schedule.batchMembership` (`undefined` on an untiled or non-facade
 * schedule, which {@link synthesizeFacadeLayout} then reads as "every
 * building"). Sorted by tile key for a deterministic `jobs` order.
 */
export function jobsFromSchedule(schedule) {
    const siteOrigin = kernelPolygonOrigin(schedule.polygon);
    const jobs = [];
    for (const key of [...schedule.jobs.keys()].sort()) {
        const job = schedule.jobs.get(key);
        if (job.jobId === undefined)
            continue;
        const activeIds = schedule.batchMembership?.[key];
        jobs.push({
            jobId: job.jobId,
            ...(activeIds === undefined ? {} : { activeIds }),
            tileOrigin: tileOrigin(job.row, job.col, schedule, siteOrigin),
        });
    }
    return { siteOrigin, jobs };
}
/**
 * Per-jobId SITE-frame anchor (infrared-core#725 live-test finding,
 * 2026-10-05): the live run's MERGED `SurfaceColumns` is in the SITE frame
 * -- its own merge adds each job's flat `tileSwOffset` to the frame origin
 * to get there (`area/merge-surface.ts`'s own `core.tileSwOffset` call,
 * `ir_simprep::surface_join`, D197) -- the SAME flat offset, reused here,
 * not the exact (cos-latitude-corrected) affine `jobsFromSchedule`'s
 * `tileOrigin` uses for the forward re-anchor. Without this, a
 * schedule-driven rebuild's frames stay in each job's own TILE frame (still
 * needed during synthesis, to reproduce the server's per-tile floating
 * point behaviour, D48/D254) and `attachValues` refuses every tiled
 * surface against the live `SurfaceColumns`.
 */
export function jobSiteShifts(schedule) {
    const core = requireCore("jobSiteShifts");
    const shifts = new Map();
    for (const job of schedule.jobs.values()) {
        if (job.jobId === undefined)
            continue;
        const [swX, swY] = core.tileSwOffset(job.row, job.col, schedule.analysisType);
        shifts.set(job.jobId, [swX, swY]);
    }
    return shifts;
}
/** `job`, with `shift`'s (swX, swY) added to its frame origins and absolute
 * position arrays (`points`, `cellTris`) -- axes and `normals` are
 * directions, unaffected by a translation. `shift` undefined (an untiled or
 * non-schedule rebuild) returns `job` unchanged. */
export function shiftJobToSiteFrame(job, shift) {
    if (shift === undefined)
        return job;
    const [swX, swY] = shift;
    return {
        ...job,
        points: shiftXY(job.points, swX, swY),
        ...(job.cellTris === undefined ? {} : { cellTris: shiftXY(job.cellTris, swX, swY) }),
        frames: job.frames.map((frame) => ({
            ...frame,
            origin: [frame.origin[0] + swX, frame.origin[1] + swY, frame.origin[2]],
        })),
    };
}
function shiftXY(array, swX, swY) {
    const shifted = array.slice();
    for (let i = 0; i < shifted.length; i += 3) {
        shifted[i] = shifted[i] + swX;
        shifted[i + 1] = shifted[i + 1] + swY;
    }
    return shifted;
}
