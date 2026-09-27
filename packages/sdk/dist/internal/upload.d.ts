import { type FetchLike } from "./transport.js";
export interface UploadOptions {
    readonly fetch: FetchLike;
    readonly signal?: AbortSignal;
    readonly timeoutMs: number;
}
/** Upload once to a signed URL without gateway credentials or redirects. */
export declare function uploadPresignedZip(input: string, content: Uint8Array, options: UploadOptions): Promise<void>;
