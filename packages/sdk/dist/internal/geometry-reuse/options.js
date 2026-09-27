import { consoleLogger } from "../../logger.js";
export function buildGeometryReuseOptions(options, fetch, thresholdBytes, timeoutMs) {
    return {
        baseUrl: String(options.baseUrl).replace(/\/+$/, ""),
        gatewayBaseUrl: String(options.gatewayBaseUrl ?? options.baseUrl).replace(/\/+$/, ""),
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
