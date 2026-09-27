/** Request authentication kept in TypeScript, outside shared WASM state. */
import { VERSION } from "../version.js";
/** Internal pre-dispatch signal that a dynamic credential selected another cache partition. */
export class AuthPartitionChangedError extends Error {
    name = "AuthPartitionChangedError";
    constructor() {
        super("active authentication credential changed before dispatch");
    }
}
const SDK_HEADER_VALUE = `ts-sdk/${VERSION}`;
/** Build an authentication resolver that evaluates dynamic JWTs per request. */
export function buildAuthResolver(options) {
    const { apiKey, token, getToken, surface = "script" } = options;
    if (token !== undefined && getToken !== undefined) {
        throw new Error("`token` and `getToken` are mutually exclusive");
    }
    if (!apiKey && token === undefined && getToken === undefined) {
        throw new Error("provide at least one of `apiKey`, `token`, or `getToken`");
    }
    return async () => {
        const headers = {
            "x-infrared-application": surface,
            "x-infrared-sdk": SDK_HEADER_VALUE,
        };
        if (apiKey)
            headers["X-Api-Key"] = apiKey;
        const resolvedToken = getToken === undefined ? token : await getToken();
        if (getToken !== undefined && (typeof resolvedToken !== "string" || !resolvedToken)) {
            throw new Error("`getToken` must return a non-empty string");
        }
        if (resolvedToken)
            headers.Authorization = `Bearer ${resolvedToken}`;
        return headers;
    };
}
