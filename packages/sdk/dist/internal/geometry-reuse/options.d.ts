import type { AuthResolver } from "../auth.js";
import type { FetchLike } from "../transport.js";
import { type Logger } from "../../logger.js";
import type { OnGeometryReuseProbe } from "./types.js";
export interface GeometryReuseOptions {
    readonly baseUrl: string;
    readonly gatewayBaseUrl: string;
    readonly auth: AuthResolver;
    readonly fetch: FetchLike;
    readonly thresholdBytes: number;
    readonly timeoutMs: number;
    readonly logger: Logger;
    readonly onProbe?: OnGeometryReuseProbe;
}
export interface GeometryReuseHostOptions {
    readonly baseUrl: string | URL;
    readonly gatewayBaseUrl?: string | URL;
    readonly auth: AuthResolver;
    readonly logger?: Logger;
    readonly onGeometryReuseProbe?: OnGeometryReuseProbe;
}
export declare function buildGeometryReuseOptions(options: GeometryReuseHostOptions, fetch: FetchLike, thresholdBytes: number, timeoutMs: number): GeometryReuseOptions;
