const ID_MAP_FIELDS = new Set([
    "geometries",
    "groundGeometry",
    "contextGeometry",
    "vegetation",
    "groundMaterials",
]);
const VERBATIM_MAP_FIELDS = new Set([
    "barriers",
    "openings",
    "buildings",
    "sensorSurfaces",
    "roomReflectances",
    "globalTransform",
]);
const WIRE_KEY_OVERRIDES = new Map([
    ["openingFactor", "openingFactor"],
    ["windowArea", "window_area"],
    ["roomReflectances", "room_reflectances"],
    ["exteriorGroundReflectance", "exterior_ground_reflectance"],
    ["useObb", "use_obb"],
    ["globalTransform", "global_transform"],
]);
/**
 * Converts a snake_case or kebab-case name to camelCase, for example
 * `"wind-speed"` to `"windSpeed"`.
 *
 * @param value - The name to convert.
 * @returns The camelCase name.
 *
 * @category Requests
 */
export function toCamelCase(value) {
    return value.replace(/[-_]([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Converts a camelCase or snake_case name to kebab-case, for example
 * `"windSpeed"` to `"wind-speed"`.
 *
 * @param value - The name to convert.
 * @returns The lower-case, hyphen-separated name.
 *
 * @category Requests
 */
export function toKebabCase(value) {
    return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}
/**
 * Sets an enumerable property directly on `target`, even when `key` is a
 * name such as `__proto__` that a plain assignment would treat specially.
 *
 * @param target - The object to change.
 * @param key - The property name.
 * @param value - The value to store.
 *
 * @category Requests
 */
export function setOwnKey(target, key, value) {
    Object.defineProperty(target, key, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
    });
}
function serializeMap(value, recurse) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        return recurse ? serializeToKebab(value) : value;
    }
    const output = {};
    for (const [key, item] of Object.entries(value)) {
        if (item === null || item === undefined)
            continue;
        setOwnKey(output, key, recurse ? serializeToKebab(item) : item);
    }
    return output;
}
/**
 * Converts a request object with camelCase keys to the kebab-case keys the
 * API expects, recursively. Fields that are `null` or `undefined` are
 * dropped, and the ids inside entity maps such as `geometries`,
 * `vegetation` and `groundMaterials` are kept exactly as given.
 *
 * @param value - The request object, or any value found inside one.
 * @returns A converted copy; values that are not plain objects or arrays are returned as they are.
 *
 * @category Requests
 */
// Maintainer note (not published): converts a legacy SDK input to API wire
// keys without changing entity ids.
export function serializeToKebab(value) {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map(serializeToKebab);
    if (typeof value !== "object" || value.constructor !== Object)
        return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) {
        if (item === null || item === undefined)
            continue;
        const wireKey = WIRE_KEY_OVERRIDES.get(key) ?? toKebabCase(key);
        if (VERBATIM_MAP_FIELDS.has(key))
            setOwnKey(output, wireKey, serializeMap(item, false));
        else if (ID_MAP_FIELDS.has(key))
            setOwnKey(output, wireKey, serializeMap(item, true));
        else
            setOwnKey(output, wireKey, serializeToKebab(item));
    }
    return output;
}
/**
 * Converts the keys of an API response to camelCase, recursively, and leaves
 * the input unchanged.
 *
 * @param value - The response object, or any value found inside one.
 * @returns A converted copy; values that are not plain objects or arrays are returned as they are.
 *
 * @category Results and legend
 */
export function deserializeToCamelCase(value) {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map(deserializeToCamelCase);
    if (typeof value !== "object" || value.constructor !== Object)
        return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) {
        setOwnKey(output, toCamelCase(key), deserializeToCamelCase(item));
    }
    return output;
}
