/**
 * The binary daylight-factor result (IRBF family 7, `daylight-points`, D232, TypeScript host D234;
 * `docs/binary-daylight-result-contract.md`). The kernel validates the frame
 * and describes it (`decodeDaylightResult`); this file only builds TypedArray
 * VIEWS over the one frame at the offsets the kernel gives. No per-sensor
 * object is made. `toJsonBytes()` / `toJson()` give the worker's JSON result on
 * demand (`daylightJsonFromFrame`), byte for byte. `toJsonBytes()` /
 * `toJson()` are the names the Python `DaylightFactorResult` uses too.
 */
/** The group order of the frame: `floors`, `buildings`, `surfaces` or `single`. */
export type DaylightLayout = "floors" | "buildings" | "surfaces" | "single";
/** One `output` list of the JSON result: a floor, a building floor, a surface, or the root. */
export interface DaylightGroup {
    /** Floor key, surface id, or `""` for the `single` layout. */
    readonly key: string;
    /** `buildings` layout: index into `buildings`. Else `null`. */
    readonly building: number | null;
    /** Sensors `start .. end` of every per-sensor column. */
    readonly start: number;
    readonly end: number;
    /** The sensors carry `room`, and the group carries `rooms` / `mean-df` / `mean-df-all`. */
    readonly hasRooms: boolean;
    /** Rows `roomStart .. roomEnd` of `rooms`. */
    readonly roomStart: number;
    readonly roomEnd: number;
    readonly meanDf: number | null;
    readonly meanDfAll: number | null;
}
/** One room row. `null` = JSON `null`. */
export interface DaylightRoom {
    readonly id: string;
    readonly name: string;
    readonly sensors: number;
    readonly meanDf: number | null;
    readonly medianDf: number | null;
    readonly minDf: number | null;
    readonly maxDf: number | null;
    readonly areaPctDfGe2: number | null;
    readonly windowArea: number | null;
    readonly floorArea: number | null;
    readonly irc: number | null;
}
/** `ROOM` value of a sensor with no room (`"room": null`, or a group without rooms). */
export declare const NO_ROOM = 65535;
/**
 * A daylight-factor result as columns. Sensor `i` of group `g` is element
 * `groups[g].start + i` of `x`, `y`, `z`, `values`, `room`.
 *
 * `values` (the daylight factor) is the stored `f32` of the worker's 4-significant-digit value; the
 * JSON number is that value rounded to 4 significant digits again (exact for
 * every DF value, contract §5). `toJson()` gives the JSON numbers.
 */
export declare class DaylightFactorResult {
    /** The result shape, as `SurfaceColumns.kind` for a facade run. */
    readonly kind: "daylight-points";
    /** The frame's schema version. */
    readonly version: number;
    /** The IRBF frame every view reads. Do not change it. */
    readonly frame: Uint8Array;
    readonly layout: DaylightLayout;
    readonly sensorCount: number;
    /** The worker's `min-legend` / `max-legend`, as for a grid or facade result. */
    readonly minLegend: number;
    readonly maxLegend: number;
    readonly x: Float64Array;
    readonly y: Float64Array;
    readonly z: Float64Array;
    /** The daylight factor per sensor: the `values` column of the grid and facade results. */
    readonly values: Float32Array;
    /** Bit `i % 8` of byte `i / 8`: `values[i]` is present (as a grid result's `validity`). */
    readonly validity: Uint8Array;
    /** Index into `rooms`, or `NO_ROOM`. */
    readonly room: Uint16Array;
    readonly groups: readonly DaylightGroup[];
    readonly rooms: readonly DaylightRoom[];
    readonly buildings: readonly string[];
    /** The result's root `warnings`. */
    readonly warnings: readonly string[];
    /** Validate `frame` (a family 7 frame) and view it. The views share its
     * buffer when it starts on an 8-byte boundary; else it is copied once. */
    constructor(frame: Uint8Array);
    /** The worker's JSON result bytes, byte for byte (`daylightJsonFromFrame`). */
    toJsonBytes(): Uint8Array;
    /** The worker's JSON result, parsed: the value the JSON result format returns. */
    toJson(): unknown;
}
/** IRBF frame family 7 (`daylight-points`): magic, then the `u16` family at byte 10. */
export declare function isDaylightFrame(document: Uint8Array): boolean;
