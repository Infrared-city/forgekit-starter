import type { AreaSchedule, AreaScheduleJSON, AreaState } from "./schedule-types.js";
export declare function freezeAreaSchedule(schedule: AreaSchedule): AreaSchedule;
export declare function areaScheduleToJSON(schedule: AreaSchedule): AreaScheduleJSON;
export declare function areaScheduleFromJSON(value: unknown): AreaSchedule;
export declare function computeAreaState(schedule: Pick<AreaSchedule, "jobs">): AreaState;
