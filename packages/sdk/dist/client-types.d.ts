import type { AreaMergeOptions } from "./area/merge.js";
import type { RunAreaOptions } from "./area/run-options.js";
import type { AreaState } from "./area/schedule-types.js";
import type { AuthOptions, AuthResolver } from "./internal/auth.js";
import type { OnGeometryReuseProbe } from "./internal/geometry-reuse/types.js";
import type { GeometryUrlStore } from "./internal/geometry-url-store.js";
import type { FetchLike } from "./internal/transport.js";
import type { Logger } from "./logger.js";
/**
 * An analysis request already written with the API's own keys (kebab-case),
 * the form `AnalysisService.execute` takes. It must have an `"analysis-type"`
 * string.
 *
 * @category Requests
 */
export type WireAnalysisRequest = Readonly<Record<string, unknown>> & {
    readonly "analysis-type": string;
};
/**
 * Environment values for `InfraredClientConfig.env`, for runtimes without
 * `process.env` (for example Cloudflare Workers). Each value that is missing
 * here is read from `process.env` when that exists.
 *
 * @category Client
 */
export interface InfraredEnvBindings {
    /** The API key, used when `apiKey` is not given. */
    readonly INFRARED_API_KEY?: string;
    /** The API base URL, used when `baseUrl` is not given. */
    readonly INFRARED_BASE_URL?: string;
    /**
     * Turns geometry reuse on or off. Accepts `1`, `true`, `yes` or `on` for
     * on, and `0`, `false`, `no` or `off` for off (any letter case). Unset or
     * empty means on; any other value makes the client constructor throw a
     * `TypeError`.
     */
    readonly INFRARED_GEOMETRY_REF_ENABLED?: string;
}
/**
 * Settings for `new InfraredClient(config)`. Give at least one credential:
 * `apiKey`, `token` or `getToken` (inherited from the authentication
 * options), or a custom `auth`.
 *
 * @category Client
 */
export interface InfraredClientConfig extends AuthOptions {
    /** The API base URL. Defaults to `INFRARED_BASE_URL`, then `https://api.infrared.city/v2`. */
    readonly baseUrl?: string | URL;
    /** Environment values to use in place of `process.env`. */
    readonly env?: InfraredEnvBindings;
    /**
     * A custom function that supplies the request headers carrying the
     * credentials. It cannot be combined with `apiKey`, `token` or `getToken`.
     */
    readonly auth?: AuthResolver;
    /** The `fetch` implementation to use for requests. Defaults to the global `fetch`. */
    readonly fetch?: FetchLike;
    /** Where the SDK's warnings go. Defaults to `consoleLogger`; use `silentLogger` to silence them. */
    readonly logger?: Logger;
    /** Alias of `timeoutMs`, also in milliseconds; `timeoutMs` wins when both are given. */
    readonly timeout?: number;
    /** Timeout for each API request, in milliseconds. Default 180 000. */
    readonly timeoutMs?: number;
    /** Alias of `downloadTimeoutMs`, also in milliseconds; `downloadTimeoutMs` wins when both are given. */
    readonly downloadTimeout?: number;
    /** Timeout for each result download, in milliseconds. Default 600 000. */
    readonly downloadTimeoutMs?: number;
    /** The base URL that large request archives are uploaded through. Defaults to `baseUrl`. */
    readonly gatewayBaseUrl?: string | URL;
    /**
     * Request archives larger than this many bytes are uploaded separately
     * instead of being sent in the request. A non-negative whole number;
     * default 5 MiB (5 242 880).
     */
    readonly bigPayloadThresholdBytes?: number;
    /**
     * Called when the first submission that refers to previously uploaded
     * geometry settles whether the API supports that. The event carries the
     * `outcome` (`"supported"` or `"unsupported"`) and the ids of the jobs
     * that were accepted.
     */
    readonly onGeometryReuseProbe?: OnGeometryReuseProbe;
    /**
     * Keeps the URLs of uploaded tile geometry outside this client, so a new
     * client (a new worker, or the page after a reload) does not upload the
     * same geometry again while its signed URL is still valid. Before an
     * upload the SDK looks in its own memory, then calls `get` once per
     * geometry; after an upload it calls `set`. The SDK makes the keys (they
     * contain a digest of the credentials, never the credentials) and the
     * `expiresAt` values (23 h after the upload, or the signed URL's end when
     * earlier). When the server refuses a stored URL, the SDK uploads again
     * and overwrites the entry. A `get` or `set` that throws or hangs gives
     * one warning and an upload; the run does not fail. An entry is a read
     * link to your geometry for its lifetime; treat the store like a cache of
     * secrets. Default: no store, the URLs stay in this realm's memory only.
     *
     * @example
     * ```ts
     * const client = new InfraredClient({
     *   apiKey,
     *   geometryUrlStore: {
     *     get: (key) => JSON.parse(sessionStorage.getItem(`ir:${key}`) ?? "null") ?? undefined,
     *     set: (key, url, expiresAt) =>
     *       sessionStorage.setItem(`ir:${key}`, JSON.stringify({ url, expiresAt })),
     *   },
     * });
     * ```
     */
    readonly geometryUrlStore?: GeometryUrlStore;
}
/**
 * Another name for `InfraredClientConfig`.
 *
 * @category Client
 */
export type InfraredClientOptions = InfraredClientConfig;
/**
 * A quick estimate of an area run, from `InfraredClient.previewArea`.
 *
 * @category Run an analysis
 */
export interface AreaPreview {
    /** The number of non-empty tiles, each of which is one billed job. */
    readonly tileCount: number;
    /** A rough run time in seconds. */
    readonly estimatedTimeS: number;
    /** The estimated cost in tokens. */
    readonly estimatedCostTokens: number;
}
/**
 * An `AreaPreview` priced with the API's current price list, from
 * `InfraredClient.previewAreaWithPricing`.
 *
 * @category Run an analysis
 */
export interface AreaPreviewWithPricing extends AreaPreview {
    /** The tokens charged for one job of the previewed analysis. */
    readonly tokensPerJob: number;
    /** `"remote"` when the price came from the API, `"fallback"` when it could not be fetched and the default was used. */
    readonly pricingSource: "remote" | "fallback";
    /** The version of the price list used. Present only when `pricingSource` is `"remote"` and the list has a version. */
    readonly pricingVersion?: string;
}
/**
 * Options for `InfraredClient.runAreaAndWait`: everything `runArea` takes,
 * plus the merge options.
 *
 * @category Run an analysis
 */
export interface RunAreaAndWaitOptions extends RunAreaOptions, AreaMergeOptions {
    /**
     * Retry rounds after the run completes, when it left submissions that
     * failed, jobs that failed while computing, or submissions whose outcome
     * is unknown. Default 1; `0` turns retrying off. Each round resubmits only
     * what needs it and waits again; a round that resubmits nothing ends the
     * retrying early. A run is never retried after the API refused it with
     * status 402 (payment required).
     */
    readonly retries?: number;
}
/**
 * Thrown by `InfraredClient.runAreaAndWait` when the run does not finish
 * within `areaTimeout` seconds.
 *
 * @category Errors
 */
export declare class AreaTimeoutError extends Error {
    /** The run's counts at the moment it timed out. */
    readonly areaState: AreaState;
    /**
     * @param message - The error message.
     * @param areaState - The run's counts at the moment it timed out.
     */
    constructor(message: string, areaState: AreaState);
}
