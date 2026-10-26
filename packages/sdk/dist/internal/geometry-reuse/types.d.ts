/**
 * Whether the API resolved a reference to previously uploaded geometry.
 *
 * `"supported"` means it did, `"unsupported"` means it did not.
 *
 * @category Client
 */
export type GeometryReuseProbeOutcome = "supported" | "unsupported";
/**
 * What the first submission that refers to previously uploaded geometry settled.
 *
 * `acceptedJobIds` are real jobs from your own run, not extra test jobs. On
 * `"supported"` it is the job whose acknowledgement confirmed that the API resolves
 * geometry references. On `"unsupported"` it is the job that was accepted without a valid
 * acknowledgement; its result is discarded and it is reported here so it can be
 * reconciled against billing.
 *
 * @category Client
 */
export interface GeometryReuseProbeEvent {
    /** Whether the API resolved the geometry reference. */
    readonly outcome: GeometryReuseProbeOutcome;
    /** Ids of the jobs that were accepted by this submission. */
    readonly acceptedJobIds: readonly string[];
}
/**
 * A callback that receives a {@link GeometryReuseProbeEvent}. It may return a promise.
 *
 * @category Client
 */
export type OnGeometryReuseProbe = (event: GeometryReuseProbeEvent) => void | Promise<void>;
export interface ReuseDocument {
    readonly key: string;
    readonly groups: Readonly<Record<string, string>>;
    readonly acknowledged_at: number;
    readonly expires_at: number;
}
export interface ReuseState {
    readonly schema_version: 1;
    readonly last_hashes: Readonly<Record<string, string>>;
    readonly documents: readonly ReuseDocument[];
}
export interface ReuseSnapshot {
    readonly state: ReuseState;
    readonly urls: Readonly<Record<string, string>>;
}
