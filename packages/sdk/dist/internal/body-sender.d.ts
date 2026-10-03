import type { SendProgress } from "./send-guard.js";
export interface BodyRequest {
    readonly url: string;
    readonly method: string;
    readonly headers: Headers;
    readonly body: Uint8Array;
    readonly signal: AbortSignal;
    /** `"omit"` for a presigned URL: no cookies, no gateway credentials. */
    readonly credentials: "omit" | "same-origin";
}
export interface BodySender {
    /** False when the sender cannot see byte progress (see the module comment). */
    readonly observesProgress: boolean;
    send(request: BodyRequest, progress: SendProgress): Promise<Response>;
}
/** Send through a `fetch` implementation; no byte progress is visible. */
export declare function fetchSender(fetcher: typeof fetch): BodySender;
/**
 * The sender for a body, given the `fetcher` the transport uses for its other
 * requests. A caller's own `fetch` is used as given. The SDK's default `fetch`
 * sends the body through the runtime's progress-reporting sender. XHR carries
 * only a presigned upload (`presigned`): safe to send twice, credential-free,
 * and on another origin; every other body in a browser goes through `fetch`.
 */
export declare function bodySenderFor(fetcher: typeof fetch, presigned?: {
    readonly url: string;
}): BodySender;
