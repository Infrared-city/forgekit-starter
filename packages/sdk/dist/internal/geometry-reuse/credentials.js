import { trimTrailingSlashes } from "../url-trim.js";
import { canonicalJsonBytes, sha256Hex } from "./canonical.js";
function activeCredential(headers) {
    let apiKey;
    for (const [name, value] of Object.entries(headers)) {
        if (name.toLowerCase() === "authorization") {
            const match = /^\s*Bearer\s+(.+)$/i.exec(value);
            if (match?.[1]?.trim())
                return { kind: "bearer", value: match[1].trim() };
        }
        if (name.toLowerCase() === "x-api-key" && value.trim())
            apiKey = value.trim();
    }
    return apiKey === undefined ? undefined : { kind: "api-key", value: apiKey };
}
export async function credentialPartition(baseUrl, headers) {
    const credential = activeCredential(headers);
    if (credential === undefined)
        return undefined;
    const material = canonicalJsonBytes(`${credential.kind}\0${credential.value}`);
    const digest = material === undefined ? undefined : await sha256Hex(material);
    return digest === undefined
        ? undefined
        : `${trimTrailingSlashes(baseUrl)}\n${credential.kind}:${digest}`;
}
export async function exactAuthHeadersDigest(headers) {
    if (activeCredential(headers) === undefined)
        return undefined;
    const normalized = Object.entries(normalizeAuthHeaders(headers));
    const material = canonicalJsonBytes(normalized);
    return material === undefined ? undefined : sha256Hex(material);
}
/** Match GatewayTransport's case-insensitive, last-entry-wins header writes. */
export function normalizeAuthHeaders(headers) {
    const normalized = new Headers();
    for (const [name, value] of Object.entries(headers))
        normalized.set(name, value);
    return Object.fromEntries(normalized.entries());
}
