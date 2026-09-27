const RETIRED_SIDECAR_KEYS = [
    "values_bin",
    "values_bin_dtype",
    "values_bin_encoding",
    "cell-tris_bin",
    "cell-tris_bin_dtype",
    "cell-tris_offsets_bin",
    "cell-tris_bin_encoding",
    "cell-tris_offsets_bin_encoding",
];
const RETIRED_ROOT_KEYS = [
    "output_bin", "output_bin_dtype", "output_bin_shape", "output_bin_encoding",
    "values_bin", "values_bin_dtype", "values_bin_shape", "values_bin_encoding",
];
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
/** Check only result fields; arbitrary nested metadata remains opaque. */
export function rejectRetiredResultFields(value) {
    if (!isRecord(value))
        return;
    for (const field of RETIRED_ROOT_KEYS) {
        if (Object.prototype.hasOwnProperty.call(value, field)) {
            throw new TypeError(`result contains retired field ${field}`);
        }
    }
    if (!isRecord(value.surfaces))
        return;
    for (const [key, entry] of Object.entries(value.surfaces)) {
        if (!isRecord(entry))
            continue;
        for (const field of RETIRED_SIDECAR_KEYS) {
            if (Object.prototype.hasOwnProperty.call(entry, field)) {
                throw new TypeError(`surface ${key} contains retired result field ${field}`);
            }
        }
    }
}
