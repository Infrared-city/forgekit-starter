export type Transport = "json" | "binary";
/** The transport for `analysisType` when the caller names none. */
export declare function defaultTransport(analysisType: string): Transport;
/** An area run's transport: the caller's, else a retry's saved one (a saved
 * schedule with no transport field was written by a JSON-only SDK), else the
 * default. The ONE resolution `runArea`, `planAreaSubmission` and
 * `submitAreaPlan` share, so a saved JSON schedule never retries as binary. */
export declare function areaTransport(options: {
    readonly transport?: Transport;
    readonly retryFrom?: {
        readonly transport?: Transport;
    };
}, analysisType: string): Transport;
