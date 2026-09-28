import { consoleLogger } from "../../logger.js";
import { trimTrailingSlashes } from "../url-trim.js";
export function buildGeometryReuseOptions(options, fetch, thresholdBytes, timeoutMs) {
    return {
        baseUrl: trimTrailingSlashes(String(options.baseUrl)),
        gatewayBaseUrl: trimTrailingSlashes(String(options.gatewayBaseUrl ?? options.baseUrl)),
        auth: options.auth,
        fetch,
        thresholdBytes,
        timeoutMs,
        logger: options.logger ?? consoleLogger,
        ...(options.onGeometryReuseProbe === undefined ? {} : {
            onProbe: options.onGeometryReuseProbe,
        }),
    };
}
