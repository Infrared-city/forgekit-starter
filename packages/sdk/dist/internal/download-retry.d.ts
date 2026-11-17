/** Download `jobId` with `once` (one try, a fresh presigned link) until the engine stops. */
export declare function downloadWithRetries<T>(jobId: string, once: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal): Promise<T>;
