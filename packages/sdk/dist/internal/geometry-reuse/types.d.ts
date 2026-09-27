export type GeometryReuseProbeOutcome = "supported" | "unsupported";
/**
 * What the first reference-carrying submission of a partition settled.
 *
 * `acceptedJobIds` are REAL customer jobs — the SDK submits no probe job of
 * its own (D71). On `supported` it is the job whose acknowledgement proved the
 * deployment resolves the field, and for an area run that ID is also a tile on
 * the schedule. On `unsupported` it is the job that was accepted WITHOUT a
 * valid acknowledgement, whose result must be discarded and which is reported
 * here so it can be reconciled against a bill.
 */
export interface GeometryReuseProbeEvent {
    readonly outcome: GeometryReuseProbeOutcome;
    readonly acceptedJobIds: readonly string[];
}
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
