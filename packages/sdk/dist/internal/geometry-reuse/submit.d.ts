/** The transports and the two POSTs the geometry-reuse controller makes.
 *
 * Split out of `controller.ts` under the 400-line rule: this module is the
 * wire plumbing — bind a partition, submit a body, upload a document — and the
 * controller above it is the policy: plan, reference, verdict.
 */
import { GatewayTransport, type FetchLike } from "../transport.js";
import { type Job } from "../../jobs.js";
import type { GeometryReuseOptions } from "./options.js";
/** One partition's bound gateways, plus the knobs every POST here needs. */
export interface BoundTransport {
    readonly beforeDispatch?: () => void;
    readonly gateway: GatewayTransport;
    readonly uploadGateway: GatewayTransport;
    readonly fetch: FetchLike;
    readonly thresholdBytes: number;
    readonly timeoutMs: number;
    readonly signal?: AbortSignal;
}
/** Bind one partition's transports, refusing a mid-run credential swap. */
export declare function bound(options: GeometryReuseOptions, partitionKey: string, signal?: AbortSignal, beforeDispatch?: () => void): BoundTransport;
/** POST one body, verifying the acknowledgement when groups were referenced. */
export declare function submitBody(analysisType: string, body: Readonly<Record<string, unknown>>, transport: BoundTransport, groups?: readonly string[]): Promise<Job>;
/** Upload one geometry document and return its presigned GET URL. */
export declare function uploadGeometry(bytes: Uint8Array, transport: BoundTransport): Promise<string>;
