import type { AuthResolver } from "./auth.js";
export type FetchLike = typeof fetch;
export type GatewayMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
export type TransportPhase = "pre-dispatch" | "unknown-acceptance" | "after-dispatch" | "response";
export type TransportReason = "validation" | "auth" | "aborted" | "timeout" | "network" | "body" | "http";
export declare class TransportError extends Error {
    readonly phase: TransportPhase;
    readonly reason: TransportReason;
    readonly method: GatewayMethod;
    readonly status?: number | undefined;
    /** The response's `Retry-After`, in delta-seconds, when it had one. */
    readonly retryAfterS?: number | undefined;
    readonly name = "TransportError";
    constructor(message: string, phase: TransportPhase, reason: TransportReason, method: GatewayMethod, status?: number | undefined, 
    /** The response's `Retry-After`, in delta-seconds, when it had one. */
    retryAfterS?: number | undefined);
}
/** A `Retry-After` header in delta-seconds; an HTTP-date is not honoured
 * (the gateway sends delta-seconds), the same rule as the Python host. */
export declare function retryAfterSeconds(headers: Headers | undefined): number | undefined;
export interface GatewayTransportOptions {
    readonly baseUrl: string | URL;
    readonly auth: AuthResolver;
    readonly fetch?: FetchLike;
    readonly timeoutMs?: number;
}
export interface ByteRequestOptions {
    /** Internal synchronous admission check, after auth and immediately before Fetch. */
    readonly beforeDispatch?: () => void;
    readonly method?: GatewayMethod;
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: Uint8Array;
    readonly signal?: AbortSignal;
    /** Return an HTTP response body to a caller that owns status policy. */
    readonly acceptHttpErrors?: boolean;
}
export interface JsonRequestOptions {
    readonly method?: GatewayMethod;
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: unknown;
    readonly signal?: AbortSignal;
}
export interface ByteResponse {
    readonly content: Uint8Array;
    readonly headers: Headers;
    readonly status: number;
}
/** Release an unread error/redirect body without delaying error delivery. */
export declare function cancelResponseBody(response: Response): void;
/**
 * A one-attempt gateway transport over the host's Fetch implementation.
 * It uses the standard AbortController signal through fetch and body reads,
 * and manual redirect handling so credentials never follow a redirect.
 *
 * @see https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://developer.mozilla.org/docs/Web/API/AbortController
 */
export declare class GatewayTransport {
    private readonly base;
    private readonly auth;
    private readonly fetch;
    private readonly sender;
    private readonly timeoutMs;
    constructor(options: GatewayTransportOptions);
    get baseUrl(): string;
    requestBytes(path: string, options?: ByteRequestOptions): Promise<Uint8Array>;
    requestBytesWithHeaders(path: string, options?: ByteRequestOptions): Promise<ByteResponse>;
    requestJson<T>(path: string, options?: JsonRequestOptions): Promise<T | undefined>;
}
