import { type FetchLike } from "./transport.js";
export interface PresignedDownloadOptions {
    readonly fetch?: FetchLike;
    readonly signal?: AbortSignal;
    readonly timeoutMs?: number;
}
export interface PresignedDownload {
    readonly content: Uint8Array;
    readonly contentType: string;
}
/**
 * Download one presigned HTTPS object without gateway authentication.
 * Redirects are manual because a redirected signed URL needs a separate,
 * reviewed origin and query policy. The API deliberately accepts no headers.
 * Uses the standard portable Fetch and AbortController APIs available in the
 * browser, Workers, and the supported Node 18+ runtime.
 *
 * @see https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://nodejs.org/api/globals.html#fetch
 */
export declare function downloadPresignedBytes(input: string | URL, options?: PresignedDownloadOptions): Promise<Uint8Array>;
export declare function downloadPresigned(input: string | URL, options?: PresignedDownloadOptions): Promise<PresignedDownload>;
