import type { Logger } from "../logger.js";
/** The three host requests the kernel retry table knows (`ir_geo::host_retry_wait_seconds`). */
export type HostRequest = "capability" | "upload" | "public_get";
/**
 * Run `call`; on a failure ask the kernel retry table for the wait and try
 * again, or throw the failure when the table says give up. The caller's
 * abort ends the loop at once.
 */
export declare function withHostRetry<T>(request: HostRequest, call: () => Promise<T>, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly logger?: Logger | undefined;
}): Promise<T>;
