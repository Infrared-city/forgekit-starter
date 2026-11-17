/**
 * One POST of a submit, with its `Idempotency-Key` when it has one (D224).
 * Every resend of a keyed POST is the kernel run engine's
 * (`ir_geo::run_engine`, `area/run-io.ts`); this file sends once.
 * `internal/submission.ts` (JSON) and `internal/binary-submission.ts`
 * (binary) both call it.
 */
import type { ByteResponse, GatewayTransport } from "./transport.js";
/**
 * The raw facts of one failed request: the kernel run engine classifies them
 * (`ir_geo::request_failure`). `before_send`: the paid request did not leave.
 * `after_send`: it may have reached the server. `unknown`: the host cannot tell.
 */
export interface RequestFacts {
    readonly phase: "before_send" | "after_send" | "unknown";
    readonly status?: number;
    readonly unreadable_2xx?: true;
}
/** The answer of one request in a run-engine event: its raw facts, or an HTTP status that came back. */
export type RawSendAnswer = RequestFacts | {
    readonly status: number;
} | "before_send" | "after_send" | "unreadable_2xx";
export interface DispatchKeyedOptions {
    readonly gateway: Pick<GatewayTransport, "requestBytesWithHeaders">;
    readonly endpointPath: string;
    readonly body: Uint8Array;
    readonly headers: Readonly<Record<string, string>>;
    /** The area `Idempotency-Key` for this submit (D224); unset for a direct submit. */
    readonly idempotencyKey?: string;
    readonly beforeDispatch?: () => void;
    readonly signal?: AbortSignal;
}
/** One POST. An HTTP error answer is returned, not thrown. */
export declare function dispatchKeyed(options: DispatchKeyedOptions): Promise<ByteResponse>;
