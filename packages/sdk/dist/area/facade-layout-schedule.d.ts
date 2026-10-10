import type { FacadeLayoutJob, FacadeLayoutJobSpec } from "./facade-layout.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { FrameOrigin } from "./tile-frames.js";
/**
 * `(lon, lat)` of `jobId`'s tile south-west corner (D254) -- the same
 * computation `runArea`'s own tiling used to anchor that tile when it
 * submitted it. Throws when `jobId` names none of `schedule.jobs`'s jobs.
 */
export declare function tileOriginOf(schedule: AreaSchedule, jobId: string): FrameOrigin;
/**
 * `{siteOrigin, jobs}` for every SUBMITTED job a saved tiled run holds (a
 * job with no `jobId` -- failed or uncertain submission -- has nothing to
 * reproduce, and is skipped). Each job's building ids come from
 * `schedule.batchMembership` (`undefined` on an untiled or non-facade
 * schedule, which {@link synthesizeFacadeLayout} then reads as "every
 * building"). Sorted by tile key for a deterministic `jobs` order.
 */
export declare function jobsFromSchedule(schedule: AreaSchedule): {
    siteOrigin: FrameOrigin;
    jobs: readonly FacadeLayoutJobSpec[];
};
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
export declare function jobSiteShifts(schedule: AreaSchedule): Map<string, readonly [number, number]>;
/** `job`, with `shift`'s (swX, swY) added to its frame origins and absolute
 * position arrays (`points`, `cellTris`) -- axes and `normals` are
 * directions, unaffected by a translation. `shift` undefined (an untiled or
 * non-schedule rebuild) returns `job` unchanged. */
export declare function shiftJobToSiteFrame(job: FacadeLayoutJob, shift: readonly [number, number] | undefined): FacadeLayoutJob;
