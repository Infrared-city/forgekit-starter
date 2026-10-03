import { type FetchLike } from "./transport.js";
export interface UploadOptions {
    readonly fetch: FetchLike;
    readonly signal?: AbortSignal;
    /** The wait for S3's answer after the last byte, and for the dispatch. */
    readonly timeoutMs: number;
}
/**
 * Upload once to a signed URL without gateway credentials or redirects.
 *
 * The body is sent under the send guard (`send-guard.ts`, #556): a moving
 * upload is never stopped, a stalled one is, and the whole body gets the
 * kernel's size-scaled budget; `timeoutMs` bounds the answer after the last
 * byte.
 */
export declare function uploadPresignedZip(input: string, content: Uint8Array, options: UploadOptions): Promise<void>;
