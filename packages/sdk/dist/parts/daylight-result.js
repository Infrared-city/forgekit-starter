/**
 * The binary daylight-factor result (IRBF family 7, `daylight-points`, D232, TypeScript host D234;
 * `docs/binary-daylight-result-contract.md`). The kernel validates the frame
 * and describes it (`decodeDaylightResult`); this file only builds TypedArray
 * VIEWS over the one frame at the offsets the kernel gives. No per-sensor
 * object is made. `toJsonBytes()` / `toJson()` give the worker's JSON result on
 * demand (`daylightJsonFromFrame`), byte for byte. `toJsonBytes()` /
 * `toJson()` are the names the Python `DaylightFactorResult` uses too.
 */
import { requireCore } from "../internal/core.js";
import { RESULT_DECODE_LIMITS } from "../results/router.js";
/** `ROOM` value of a sensor with no room (`"room": null`, or a group without rooms). */
export const NO_ROOM = 0xffff;
function daylightCore() {
    return requireCore();
}
/**
 * A daylight-factor result as columns. Sensor `i` of group `g` is element
 * `groups[g].start + i` of `x`, `y`, `z`, `values`, `room`.
 *
 * `values` (the daylight factor) is the stored `f32` of the worker's 4-significant-digit value; the
 * JSON number is that value rounded to 4 significant digits again (exact for
 * every DF value, contract §5). `toJson()` gives the JSON numbers.
 */
export class DaylightFactorResult {
    /** The result shape, as `SurfaceColumns.kind` for a facade run. */
    kind = "daylight-points";
    /** The frame's schema version. */
    version;
    /** The IRBF frame every view reads. Do not change it. */
    frame;
    layout;
    sensorCount;
    /** The worker's `min-legend` / `max-legend`, as for a grid or facade result. */
    minLegend;
    maxLegend;
    x;
    y;
    z;
    /** The daylight factor per sensor: the `values` column of the grid and facade results. */
    values;
    /** Bit `i % 8` of byte `i / 8`: `values[i]` is present (as a grid result's `validity`). */
    validity;
    /** Index into `rooms`, or `NO_ROOM`. */
    room;
    groups;
    rooms;
    buildings;
    /** The result's root `warnings`. */
    warnings;
    /** Validate `frame` (a family 7 frame) and view it. The views share its
     * buffer when it starts on an 8-byte boundary; else it is copied once. */
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
    /** The worker's JSON result bytes, byte for byte (`daylightJsonFromFrame`). */
    toJsonBytes() {
        const core = daylightCore();
        return core.daylightJsonFromFrame(this.frame);
    }
    /** The worker's JSON result, parsed: the value the JSON result format returns. */
    toJson() {
        return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(this.toJsonBytes()));
    }
}
/** IRBF frame family 7 (`daylight-points`): magic, then the `u16` family at byte 10. */
export function isDaylightFrame(document) {
    return document.length >= 12 && document[0] === 73 && document[1] === 82
        && document[2] === 66 && document[3] === 70 && document[10] === 7 && document[11] === 0;
}
