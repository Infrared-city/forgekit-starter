/**
 * Turns an analysis input into the request body for one analysis, with wire field names.
 * Entity and metadata maps pass through unchanged.
 *
 * @param input - The analysis input, with `analysisType` (or the wire key `analysis-type`).
 * @returns The request body.
 * @throws {TypeError} when the input is invalid for its analysis type.
 * @category Run an analysis
 */
export declare function prepareAnalysisPayload(input: Readonly<Record<string, unknown>>): Record<string, unknown>;
/**
 * Alias of `prepareAnalysisPayload`.
 * @category Run an analysis
 */
export declare const prepareAreaPayload: typeof prepareAnalysisPayload;
