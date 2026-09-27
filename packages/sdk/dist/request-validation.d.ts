/**
 * Refuse a `ground-materials` document whose layer keys are not material names
 * the simulation knows (WP20/D56, issue #217).
 *
 * The five names live in the kernel and a CI gate compares them with the
 * lambda-models physics table, so this file keeps no list. An unknown key is
 * the model's UNKNOWN material row: the job succeeds, bills, and returns a
 * thermal result computed from the wrong surface.
 *
 * Only the KEYS are sent across: each FeatureCollection is replaced by `null`,
 * so a multi-megabyte document is never serialised to ask about its keys.
 */
export declare function validateGroundMaterials(layers: unknown): void;
/** Validate outdoor surface and terrain fields before a paid request. */
export declare function validatePreparedAnalysisRequest(input: Readonly<Record<string, unknown>>, options?: {
    readonly enforceTerrainTriangleLimit?: boolean;
}): void;
