import type { RequestFacts } from "../internal/idempotent-dispatch.js";
/**
 * The raw facts of a failed request: did the paid request leave, which HTTP
 * status came back, was a 2xx body unreadable. The kernel run engine reads
 * the facts and decides (`ir_geo::request_failure`); any other error is the
 * host's own and is thrown again.
 */
export declare function rawAnswer(error: unknown): RequestFacts;
