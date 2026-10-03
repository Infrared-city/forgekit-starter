/**
 * The runtime adapter that sends ONE request with a body (#556).
 *
 * The budget and stall rules are one state machine (`send-guard.ts`); only
 * the way bytes reach the network differs per runtime, and only that lives
 * behind this interface:
 *
 * - Node: the SDK's `fetch` (undici) with the body as a stream it pulls in
 *   64 KiB blocks and an explicit `Content-Length` (`stream-sender.ts`). A
 *   pull means the connection took the blocks before it, the same unit the
 *   Python SDK guards (one block write). A presigned S3 PUT refuses chunked
 *   transfer, so the length is always sent. Because it is the SDK's own
 *   `fetch`, a global dispatcher (a proxy) applies as to every other request.
 * - Browsers and web workers: `XMLHttpRequest`, whose `upload.onprogress` is
 *   the portable byte-progress signal (`xhr-sender.ts`); a streamed `fetch`
 *   body there needs HTTP/2 and is not portable. XHR follows a redirect
 *   itself and sends the body again, which no code can stop, and it sends the
 *   page's cookies to its own origin, so it carries only the presigned PUT to
 *   another origin (idempotent, no credentials). A gateway request (a paid
 *   POST) goes through `fetch`.
 * - A caller's own `fetch`, and a runtime with neither: the request goes
 *   through `fetch` as given. It reports no progress, so the guard gives it
 *   one window for body and response.
 *
 * Every sender answers with a standard `Response`, and none follows a
 * redirect with the body where the runtime lets the SDK choose (`fetch` with
 * `redirect: "manual"`). XHR cannot choose; its followed redirect is answered
 * as `Response.error()`, status 0, like a browser `fetch` with `"manual"`.
 */
import { isDefaultFetch } from "./fetch.js";
import { streamSender } from "./stream-sender.js";
import { xhrSender } from "./xhr-sender.js";
/** Send through a `fetch` implementation; no byte progress is visible. */
export function fetchSender(fetcher) {
    return {
        observesProgress: false,
        send: (request) => fetcher(request.url, {
            method: request.method,
            headers: request.headers,
            // Browser, Node 18+, and Workers accept ArrayBufferView bodies. The DOM
            // declaration narrows the generic ArrayBufferLike parameter out, so the
            // runtime object is kept and cast only at this seam.
            body: request.body,
            credentials: request.credentials,
            redirect: "manual",
            signal: request.signal,
        }),
    };
}
/**
 * Real Node only: its `fetch` (undici) sends a streamed body over HTTP/1.1
 * with the set length. Bun, Deno, Electron and Workers look like Node but
 * have another `fetch`; they send the body as bytes (`fetchSender`).
 */
function streamedUploads() {
    const runtime = globalThis;
    const versions = runtime.process?.versions ?? {};
    return runtime.process?.release?.name === "node" && typeof versions.node === "string" &&
        versions.bun === undefined && versions.deno === undefined && versions.electron === undefined;
}
/**
 * True when `url` is on another origin than the page. XHR cannot keep the
 * page's cookies off a same-origin request (`withCredentials` governs only
 * cross-origin ones), so a credential-free body goes by XHR only across
 * origins.
 */
function crossOrigin(url) {
    const page = globalThis.location?.origin;
    try {
        return typeof page !== "string" || new URL(url).origin !== page;
    }
    catch {
        return false;
    }
}
/**
 * The sender for a body, given the `fetcher` the transport uses for its other
 * requests. A caller's own `fetch` is used as given. The SDK's default `fetch`
 * sends the body through the runtime's progress-reporting sender. XHR carries
 * only a presigned upload (`presigned`): safe to send twice, credential-free,
 * and on another origin; every other body in a browser goes through `fetch`.
 */
export function bodySenderFor(fetcher, presigned) {
    if (!isDefaultFetch(fetcher))
        return fetchSender(fetcher);
    if (streamedUploads())
        return streamSender(fetcher);
    if (presigned !== undefined && typeof XMLHttpRequest === "function" && crossOrigin(presigned.url)) {
        return xhrSender;
    }
    return fetchSender(fetcher);
}
