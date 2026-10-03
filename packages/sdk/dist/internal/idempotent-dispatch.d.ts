import { type ByteResponse, type GatewayTransport } from "./transport.js";
export interface DispatchKeyedOptions {
    readonly gateway: Pick<GatewayTransport, "requestBytesWithHeaders">;
    readonly endpointPath: string;
    readonly body: Uint8Array;
    readonly headers: Readonly<Record<string, string>>;
    /** The area retry `Idempotency-Key` for this submit (D224). Unset for a
     * direct, non-area submit: that path keeps today's single-attempt D59
     * behaviour. */
    readonly idempotencyKey?: string;
    readonly beforeDispatch?: () => void;
    readonly signal?: AbortSignal;
}
/**
 * One POST, resent with the SAME `Idempotency-Key` while the kernel's
 * `classifySubmitSend` answers "resend" (D224). Each send's outcome is
 * mapped to the kernel input: the HTTP status; a transport error before the
 * request left (`before_send`) or after it may have (`after_send`); a 2xx
 * body that is not readable (`unreadable_2xx`). On "uncertain" this throws
 * `SubmissionUncertainError`; on "accepted" or "definite_fail" it returns
 * the response (a 4xx, including 409, goes to the caller's ordinary
 * rejection handling) or rethrows the transport error. An UNKEYED call
 * makes exactly one send and classifies nothing.
 */
export declare function dispatchKeyed(options: DispatchKeyedOptions): Promise<ByteResponse>;
