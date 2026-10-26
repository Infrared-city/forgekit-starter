// Maintainer note (not published): The binary daylight-factor result (IRBF family 7,
// `daylight-points`, D232, TypeScript host D234;
// `docs/binary-daylight-result-contract.md`). The kernel validates the frame
// and describes it (`decodeDaylightResult`); this file only builds TypedArray
// VIEWS over the one frame at the offsets the kernel gives. No per-sensor
// object is made. `toJsonBytes()` / `toJson()` give the worker's JSON result on
// demand (`daylightJsonFromFrame`), byte for byte. `toJsonBytes()` /
// `toJson()` are the names the Python `DaylightFactorResult` uses too.
import { requireCore } from "../internal/core.js";
import { RESULT_DECODE_LIMITS } from "../results/router.js";
/**
 * The `room` value of a sensor that has no room (`"room": null` in the JSON result, or a
 * group without rooms).
 *
 * @category Results and legend
 */
export const NO_ROOM = 0xffff;
function daylightCore() {
    return requireCore();
}
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
// Maintainer note (not published): `values` is the stored `f32` of the worker's
// 4-significant-digit value; the JSON number is that value rounded to 4 significant
// digits again (exact for every DF value, contract §5). `toJson()` gives the JSON numbers.
export class DaylightFactorResult {
    /** Result discriminator: always `"daylight-points"`. */
    // Maintainer note (not published): The result shape, as `SurfaceColumns.kind` for a facade run.
    kind = "daylight-points";
    /** The frame's schema version. */
    version;
    /** The binary frame every view reads. Do not change it. */
    frame;
    /** How the sensors are grouped. */
    layout;
    /** Total number of sensors (the length of every per-sensor column). */
    sensorCount;
    /** Lower end of the colour legend, as for a grid or facade result. */
    // Maintainer note (not published): The worker's `min-legend` / `max-legend`.
    minLegend;
    /** Upper end of the colour legend. */
    maxLegend;
    /** Sensor x coordinates. */
    x;
    /** Sensor y coordinates. */
    y;
    /** Sensor z coordinates. */
    z;
    /** The daylight factor per sensor: the `values` column of the grid and facade results. */
    values;
    /** Bit `i % 8` of byte `i / 8`: `values[i]` is present (as a grid result's `validity`). */
    validity;
    /** Index into `rooms` per sensor, or `NO_ROOM` for a sensor without a room. */
    room;
    /** The sensor groups, in frame order. */
    groups;
    /** The room rows, which `groups` and `room` index into. */
    rooms;
    /** Building names, indexed by `DaylightGroup.building`. */
    buildings;
    /** Warnings the analysis reported for the whole result. */
    warnings;
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
    constructor(frame) {
        // `new Uint8Array(frame)` copies into a fresh buffer at offset 0 (a Node
        // `Buffer.slice()` would share the memory and keep the offset).
        // The SDK result limit of every IRBF family (the router's), before any copy into wasm.
        if (frame.length > RESULT_DECODE_LIMITS.maxTotalBytes) {
            throw new RangeError(`daylight-factor result frame of ${frame.length} bytes exceeds the result limit of ${RESULT_DECODE_LIMITS.maxTotalBytes} bytes`);
        }
        const owned = frame.byteOffset % 8 === 0 ? frame : new Uint8Array(frame);
        const core = daylightCore();
        const summary = core.decodeDaylightResult(owned);
        const s = summary.sections;
        const view = (make, i) => new make(owned.buffer, owned.byteOffset + i.offset, i.count);
        this.frame = owned;
        this.layout = summary.layout;
        this.sensorCount = summary.sensor_count;
        this.version = summary.schema_version;
        this.minLegend = summary.legend[0];
        this.maxLegend = summary.legend[1];
        this.x = view(Float64Array, s.x);
        this.y = view(Float64Array, s.y);
        this.z = view(Float64Array, s.z);
        this.values = view(Float32Array, s.df);
        this.validity = view(Uint8Array, s.df_validity);
        this.room = view(Uint16Array, s.room);
        this.groups = Object.freeze(summary.groups.map((g) => Object.freeze({
            key: g.key, building: g.building, start: g.start, end: g.end, hasRooms: g.rooms,
            roomStart: g.room_start, roomEnd: g.room_end, meanDf: g.mean_df, meanDfAll: g.mean_df_all,
        })));
        this.rooms = Object.freeze(summary.rooms.map((r) => Object.freeze({
            id: r.id, name: r.name, sensors: r.sensors, meanDf: r.mean_df, medianDf: r.median_df,
            minDf: r.min_df, maxDf: r.max_df, areaPctDfGe2: r.area_pct_df_ge_2,
            windowArea: r.window_area, floorArea: r.floor_area, irc: r.irc,
        })));
        this.buildings = Object.freeze([...summary.buildings]);
        this.warnings = Object.freeze([...summary.warnings]);
    }
    /**
     * Returns the result as the analysis's JSON document, as UTF-8 bytes.
     *
     * @returns The JSON bytes.
     */
    // Maintainer note (not published): Byte for byte the worker's JSON (`daylightJsonFromFrame`).
    toJsonBytes() {
        const core = daylightCore();
        return core.daylightJsonFromFrame(this.frame);
    }
    /**
     * Returns the result as the parsed JSON value, the same value the `"json"` result
     * format gives.
     *
     * @returns The parsed JSON document.
     */
    toJson() {
        return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(this.toJsonBytes()));
    }
}
/**
 * Tells whether `document` is a binary daylight-factor result.
 *
 * @param document - The bytes of a result document.
 * @returns True when the bytes start a daylight-factor frame.
 * @category Results and legend
 */
// Maintainer note (not published): IRBF frame family 7 (`daylight-points`): magic, then
// the `u16` family at byte 10.
export function isDaylightFrame(document) {
    return document.length >= 12 && document[0] === 73 && document[1] === 82
        && document[2] === 66 && document[3] === 70 && document[10] === 7 && document[11] === 0;
}
