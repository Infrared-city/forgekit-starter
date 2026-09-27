/**
 * Assert that a kernel answer is a JSON array, without parsing it.
 *
 * A shape change in a kernel export must fail loudly here rather than be
 * papered over by a defensive parse — the two bindings are meant to agree.
 */
export declare function requireJsonArray(json: string, origin: string): string;
/** Assert that a kernel answer is a JSON object (a FeatureCollection). */
export declare function requireFeatureCollection(json: string, origin: string): string;
/**
 * The `features` array of a FeatureCollection text, as text.
 *
 * A scanner, not a parser: it walks the document once, tracking string
 * literals, escapes and bracket depth, and returns the substring the array
 * occupies. No JavaScript object tree is built, which is the point — the
 * kernel emits FeatureCollections and `dedupTrees` takes a feature array,
 * and bridging the two must not cost a parse and a re-encode of megabytes.
 */
export declare function featuresArrayText(featureCollectionText: string, origin: string): string;
/** Concatenate JSON array texts into one array text, without parsing. */
export declare function spliceJsonArrays(parts: readonly string[]): string;
/** Wrap a JSON array text of features as a FeatureCollection text. */
export declare function featureCollectionJson(featuresJson: string): string;
/** Build a JSON array text from element texts (`null` for a missing one). */
export declare function jsonArrayOf(elements: ReadonlyArray<string | undefined>): string;
/** Wrap a layers object text as a single-entry `{layerId: value}` text. */
export declare function jsonObjectOf(key: string, valueJson: string): string;
