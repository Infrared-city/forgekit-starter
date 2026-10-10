/**
 * Converts a snake_case or kebab-case name to camelCase, for example
 * `"wind-speed"` to `"windSpeed"`.
 *
 * @param value - The name to convert.
 * @returns The camelCase name.
 *
 * @category Requests
 */
export declare function toCamelCase(value: string): string;
/**
 * Converts a camelCase or snake_case name to kebab-case, for example
 * `"windSpeed"` to `"wind-speed"`.
 *
 * @param value - The name to convert.
 * @returns The lower-case, hyphen-separated name.
 *
 * @category Requests
 */
export declare function toKebabCase(value: string): string;
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
export declare function setOwnKey(target: Record<string, unknown>, key: string, value: unknown): void;
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
export declare function serializeToKebab(value: unknown): unknown;
/**
 * Converts the keys of an API response to camelCase, recursively, and leaves
 * the input unchanged.
 *
 * @param value - The response object, or any value found inside one.
 * @returns A converted copy; values that are not plain objects or arrays are returned as they are.
 *
 * @category Results and legend
 */
export declare function deserializeToCamelCase(value: unknown): unknown;
