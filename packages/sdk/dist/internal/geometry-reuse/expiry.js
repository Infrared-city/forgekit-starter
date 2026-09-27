const DEFAULT_REF_TTL_MS = 24 * 60 * 60 * 1_000;
const EXPIRY_MARGIN_MS = 15 * 60 * 1_000;
/** Read an AWS-style signed URL expiry without retaining the URL. */
export function expiryFromUrl(value, now = Date.now()) {
    let signedAt = now;
    let ttl = DEFAULT_REF_TTL_MS;
    try {
        const url = new URL(value);
        const expires = Number(url.searchParams.get("X-Amz-Expires"));
        if (Number.isFinite(expires) && expires > 0)
            ttl = expires * 1_000;
        const stamp = url.searchParams.get("X-Amz-Date");
        if (stamp !== null && /^\d{8}T\d{6}Z$/.test(stamp)) {
            const iso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T` +
                `${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}Z`;
            const parsed = Date.parse(iso);
            if (Number.isFinite(parsed))
                signedAt = parsed;
        }
    }
    catch {
        // The upload adapter enforces HTTPS. This fallback only causes an earlier upload.
    }
    return signedAt + ttl - EXPIRY_MARGIN_MS;
}
