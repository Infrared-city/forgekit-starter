/**
 * How the sensors of a daylight-factor result are grouped: `"floors"`, `"buildings"`,
 * `"surfaces"` or `"single"` (one group for the whole result).
 *
 * @category Results and legend
 */
export type DaylightLayout = "floors" | "buildings" | "surfaces" | "single";
/**
 * One group of sensors in a daylight-factor result: a floor, a building floor, a surface,
 * or the whole result. It matches one `output` list of the JSON result.
 *
 * @category Results and legend
 */
export interface DaylightGroup {
    /** Floor key, surface id, or `""` for the `"single"` layout. */
    readonly key: string;
    /** `"buildings"` layout: index into `DaylightFactorResult.buildings`. Otherwise `null`. */
    readonly building: number | null;
    /** First sensor of the group: sensors `start` up to (not including) `end` of every column. */
    readonly start: number;
    /** End of the group's sensor range (exclusive). */
    readonly end: number;
    /** True when the sensors carry a room and the group has room rows and mean values. */
    readonly hasRooms: boolean;
    /** First row of the group in `DaylightFactorResult.rooms`. */
    readonly roomStart: number;
    /** End of the group's rows in `DaylightFactorResult.rooms` (exclusive). */
    readonly roomEnd: number;
    /** Mean daylight factor of the group (`mean-df` in the JSON result); `null` when absent. */
    readonly meanDf: number | null;
    /** Mean daylight factor over all of the group's sensors (`mean-df-all`); `null` when absent. */
    readonly meanDfAll: number | null;
}
/**
 * One room row of a daylight-factor result. A value of `null` is the JSON `null`
 * (not available).
 *
 * @category Results and legend
 */
export interface DaylightRoom {
    /** Room id. */
    readonly id: string;
    /** Room name. */
    readonly name: string;
    /** Number of sensors in the room. */
    readonly sensors: number;
    /** Mean daylight factor of the room, or `null`. */
    readonly meanDf: number | null;
    /** Median daylight factor of the room, or `null`. */
    readonly medianDf: number | null;
    /** Lowest daylight factor in the room, or `null`. */
    readonly minDf: number | null;
    /** Highest daylight factor in the room, or `null`. */
    readonly maxDf: number | null;
    /** Percentage of the room's area with a daylight factor of at least 2, or `null`. */
    readonly areaPctDfGe2: number | null;
    /** Window area of the room, or `null`. */
    readonly windowArea: number | null;
    /** Floor area of the room, or `null`. */
    readonly floorArea: number | null;
    /** The room's `irc` value, or `null`. */
    readonly irc: number | null;
}
/**
 * The `room` value of a sensor that has no room (`"room": null` in the JSON result, or a
 * group without rooms).
 *
 * @category Results and legend
 */
export declare const NO_ROOM = 65535;
/**
 * A daylight-factor result as columns. Sensor `i` of group `g` is element
 * `groups[g].start + i` of `x`, `y`, `z`, `values` and `room`.
 *
 * The columns are typed-array views over one binary frame, so no object is created per
 * sensor. `values` holds the daylight factor as 32-bit floats; `toJson()` gives the same
 * result as plain JSON numbers (each value rounded to 4 significant digits).
 *
 * @category Results and legend
 */
export declare class DaylightFactorResult {
    /** Result discriminator: always `"daylight-points"`. */
    readonly kind: "daylight-points";
    /** The frame's schema version. */
    readonly version: number;
    /** The binary frame every view reads. Do not change it. */
    readonly frame: Uint8Array;
    /** How the sensors are grouped. */
    readonly layout: DaylightLayout;
    /** Total number of sensors (the length of every per-sensor column). */
    readonly sensorCount: number;
    /** Lower end of the colour legend, as for a grid or facade result. */
    readonly minLegend: number;
    /** Upper end of the colour legend. */
    readonly maxLegend: number;
    /** Sensor x coordinates. */
    readonly x: Float64Array;
    /** Sensor y coordinates. */
    readonly y: Float64Array;
    /** Sensor z coordinates. */
    readonly z: Float64Array;
    /** The daylight factor per sensor: the `values` column of the grid and facade results. */
    readonly values: Float32Array;
    /** Bit `i % 8` of byte `i / 8`: `values[i]` is present (as a grid result's `validity`). */
    readonly validity: Uint8Array;
    /** Index into `rooms` per sensor, or `NO_ROOM` for a sensor without a room. */
    readonly room: Uint16Array;
    /** The sensor groups, in frame order. */
    readonly groups: readonly DaylightGroup[];
    /** The room rows, which `groups` and `room` index into. */
    readonly rooms: readonly DaylightRoom[];
    /** Building names, indexed by `DaylightGroup.building`. */
    readonly buildings: readonly string[];
    /** Warnings the analysis reported for the whole result. */
    readonly warnings: readonly string[];
    /**
     * Validates `frame` and creates the views over it.
     *
     * The views share the buffer of `frame` when it starts on an 8-byte boundary; otherwise
     * it is copied once.
     *
     * @param frame - A binary daylight-factor result.
     * @throws {RangeError} When the frame exceeds the result size limit.
     * @throws {Error} When the frame is not a valid daylight-factor result.
     */
    constructor(frame: Uint8Array);
    /**
     * Returns the result as the analysis's JSON document, as UTF-8 bytes.
     *
     * @returns The JSON bytes.
     */
    toJsonBytes(): Uint8Array;
    /**
     * Returns the result as the parsed JSON value, the same value the `"json"` result
     * format gives.
     *
     * @returns The parsed JSON document.
     */
    toJson(): unknown;
}
/**
 * Tells whether `document` is a binary daylight-factor result.
 *
 * @param document - The bytes of a result document.
 * @returns True when the bytes start a daylight-factor frame.
 * @category Results and legend
 */
export declare function isDaylightFrame(document: Uint8Array): boolean;
