export const DEFAULT_BASE_URL = "https://api.infrared.city/v2";
export function envValue(env, name) {
    if (env?.[name] !== undefined)
        return env[name];
    return globalThis.process?.env?.[name];
}
function geometryReuseSetting(env) {
    const value = envValue(env, "INFRARED_GEOMETRY_REF_ENABLED");
    if (value === undefined || value === "")
        return true;
    if (/^(1|true|yes|on)$/i.test(value))
        return true;
    if (/^(0|false|no|off)$/i.test(value))
        return false;
    throw new TypeError("INFRARED_GEOMETRY_REF_ENABLED must be a Boolean string");
}
export function jobsServiceOptions(options, baseUrl, auth, logger, timeoutMs) {
    const downloadTimeoutMs = options.downloadTimeoutMs ?? options.downloadTimeout;
    const geometryReuseEnabled = geometryReuseSetting(options.env);
    return {
        baseUrl,
        auth,
        ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
        ...(timeoutMs === undefined ? {} : { timeoutMs }),
        ...(downloadTimeoutMs === undefined ? {} : { downloadTimeoutMs }),
        ...(options.gatewayBaseUrl === undefined ? {} : { gatewayBaseUrl: options.gatewayBaseUrl }),
        ...(options.bigPayloadThresholdBytes === undefined ? {} : {
            bigPayloadThresholdBytes: options.bigPayloadThresholdBytes,
        }),
        geometryReuseEnabled,
        logger,
        ...(options.onGeometryReuseProbe === undefined ? {} : {
            onGeometryReuseProbe: options.onGeometryReuseProbe,
        }),
        ...(options.geometryUrlStore === undefined ? {} : { geometryUrlStore: options.geometryUrlStore }),
    };
}
