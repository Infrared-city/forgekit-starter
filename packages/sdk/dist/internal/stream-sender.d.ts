/**
 * The Node body sender (#556): the SDK's own `fetch` with the body as a
 * stream it pulls block by block, and an explicit `Content-Length`, so the
 * request is never chunked (a presigned S3 PUT refuses chunked transfer).
 * See `body-sender.ts`.
 *
 * Node's `fetch` (undici) pulls the next block only when it can write it,
 * and the stream holds no block ahead (`highWaterMark: 0`), so a pull is the
 * progress signal: when the socket stops taking bytes, the pulls stop and
 * the stall guard fires.
 */
import type { BodySender } from "./body-sender.js";
export declare function streamSender(fetcher: typeof fetch): BodySender;
