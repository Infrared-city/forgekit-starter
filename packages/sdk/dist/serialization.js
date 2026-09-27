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
export function toCamelCase(value) {
    return value.replace(/[-_]([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}
export function toKebabCase(value) {
    return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}
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
/** Convert a legacy SDK input to API wire keys without changing entity ids. */
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
/** Convert wire response keys to camel case without changing the input. */
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
