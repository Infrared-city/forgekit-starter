/**
 * Check that a JSON text is an array, without parsing it.
 *
 * @param json - The JSON text.
 * @param origin - Name of the producer, used in the error message.
 * @returns `json` unchanged.
 * @throws {GeodataError} when the text does not start with `[`.
 * @category Geodata
 */
export declare function requireJsonArray(json: string, origin: string): string;
/**
 * Check that a JSON text is an object (a GeoJSON FeatureCollection), without
 * parsing it.
 *
 * @param json - The JSON text.
 * @param origin - Name of the producer, used in the error message.
 * @returns `json` unchanged.
 * @throws {GeodataError} when the text does not start with `{`.
 * @category Geodata
 */
export declare function requireFeatureCollection(json: string, origin: string): string;
/**
 * Extract the `features` array of a GeoJSON FeatureCollection text, as text.
 *
 * The document is scanned once, without building JavaScript objects, so large
 * collections are not parsed and re-encoded.
 *
 * @param featureCollectionText - The FeatureCollection JSON text.
 * @param origin - Name of the producer, used in the error message.
 * @returns The text of the `features` array, including its brackets.
 * @throws {GeodataError} when no readable `features` array is found.
 * @category Geodata
 */
export declare function featuresArrayText(featureCollectionText: string, origin: string): string;
/**
 * Concatenate JSON array texts into one array text, without parsing them.
 *
 * @param parts - JSON texts that each hold one array.
 * @returns One array text with the elements of all parts, in order.
 * @throws {GeodataError} when a part is not an array text.
 * @category Geodata
 */
export declare function spliceJsonArrays(parts: readonly string[]): string;
/**
 * Wrap a JSON array text of features as a GeoJSON FeatureCollection text.
 *
 * @param featuresJson - JSON text of an array of features.
 * @returns The FeatureCollection JSON text.
 * @category Geodata
 */
export declare function featureCollectionJson(featuresJson: string): string;
/**
 * Build a JSON array text from element texts.
 *
 * @param elements - JSON texts of the elements; `undefined` becomes `null`.
 * @returns The array JSON text.
 * @category Geodata
 */
export declare function jsonArrayOf(elements: ReadonlyArray<string | undefined>): string;
/**
 * Wrap a JSON text as a single-entry object text, `{ "<key>": <value> }`.
 *
 * @param key - The object key.
 * @param valueJson - JSON text of the value.
 * @returns The object JSON text.
 * @category Geodata
 */
export declare function jsonObjectOf(key: string, valueJson: string): string;
