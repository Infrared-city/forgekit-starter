import type { AreaSchedule, AreaScheduleJSON, AreaState } from "./schedule-types.js";
/** Returns a frozen copy of a schedule; its lists, polygon and job map cannot be changed.
 * @category Run an analysis */
export declare function freezeAreaSchedule(schedule: AreaSchedule): AreaSchedule;
/** Converts a schedule to plain JSON for saving; read it back with `areaScheduleFromJSON`.
 * @category Run an analysis */
export declare function areaScheduleToJSON(schedule: AreaSchedule): AreaScheduleJSON;
/** Rebuilds a frozen schedule from the JSON saved by `areaScheduleToJSON`, validating it.
 * @throws {TypeError} when the JSON is not a valid area schedule.
 * @category Run an analysis */
export declare function areaScheduleFromJSON(value: unknown): AreaSchedule;
/** Counts the jobs of a schedule by status; `isComplete` is true when none is pending or running.
 * @category Run an analysis */
export declare function computeAreaState(schedule: Pick<AreaSchedule, "jobs">): AreaState;
