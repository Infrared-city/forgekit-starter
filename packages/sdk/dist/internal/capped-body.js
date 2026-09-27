/**
 * Read a response body under a byte cap, without trust in the headers.
 *
 * A cap that is checked against `Content-Length` is not a cap. The header can
 * be absent, it can be wrong, and a hostile server can make it say anything;
 * `Number(null)` is `0`, which passed every cap this SDK had. So the cap here
 * is applied to the bytes as they arrive: the reader adds each chunk to a
 * running total, and the moment that total passes the cap it cancels the
 * download and reports the typed error of the calling module.
 *
 * The declared length keeps two smaller jobs. An answer that announces more
 * than the cap is refused before one byte is read, and an answer whose body
 * disagrees with its own `Content-Length` — shorter or longer — is an error,
 * because one of the two is a lie and the reader cannot tell which. That
 * second job holds for an identity transfer only: `Content-Length` counts the
 * encoded bytes, and the reader sees the decoded ones.
 *
 * The module is layer-neutral: the caller gives the cap and the error type of
 * its own layer, so the same reader serves the public geodata hosts and the
 * colour registry.
 */
/** Release a body that the caller will not read. */
export function cancelBody(response) {
    try {
        void response.body?.cancel().catch(() => undefined);
    }
    catch {
        // A body that is already read or locked cannot be cancelled. There is
        // nothing to release and nothing to report.
    }
}
/**
 * True when the declared length can be compared with the decoded body.
 *
 * `Content-Length` counts the ENCODED bytes while the reader sees the decoded
 * ones, so the two lengths are comparable for an identity transfer only.
 * A CORS response can hide Content-Encoding while exposing Content-Length.
 * An absent encoding header on that response does not prove identity.
 */
function hasComparableLength(response) {
    const encoding = (response.headers.get("content-encoding") ?? "").trim().toLowerCase();
    return encoding === "identity" || (encoding === "" && response.type !== "cors");
}
/** The declared body length, or `undefined` when the answer names no usable one. */
export function declaredLength(response) {
    const raw = response.headers.get("content-length");
    if (raw === null)
        return undefined;
    const value = Number(raw);
    // A header that is not a whole count of bytes tells the reader nothing. It
    // is treated as absent, exactly as the Python host treats it, and the cap
    // is then kept by the streamed total alone.
    return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}
/** Read the whole body, or fail as soon as it passes {@link CappedBody.cap}. */
export async function readCappedBody(response, limits) {
    const declared = declaredLength(response);
    if (declared !== undefined && declared > limits.cap) {
        cancelBody(response);
        throw limits.fail(`declares ${declared} bytes; the limit is ${limits.cap} bytes`);
    }
    // A body that disagrees with its own `Content-Length` is an error: one of
    // the two is wrong and the reader cannot tell which. An encoded body is
    // capped but not compared, because no header describes its decoded length.
    // The same rule applies when CORS hides the encoding header.
    const comparable = hasComparableLength(response) ? declared : undefined;
    const stream = response.body;
    if (stream === null || typeof stream.getReader !== "function") {
        return readWithoutStream(response, declared, comparable, limits);
    }
    return readStream(stream.getReader(), comparable, limits);
}
async function readStream(reader, comparable, limits) {
    const chunks = [];
    let total = 0;
    for (;;) {
        const step = await reader.read();
        if (step.done)
            break;
        const chunk = step.value;
        if (chunk === undefined)
            continue;
        total += chunk.byteLength;
        if (total > limits.cap) {
            // Stop the transfer here rather than wait for the caller's deadline:
            // the answer is refused, so every further byte is paid for nothing.
            await reader.cancel().catch(() => undefined);
            throw limits.fail(`passed the ${limits.cap}-byte limit while it arrived; the read was abandoned`);
        }
        chunks.push(chunk);
    }
    if (comparable !== undefined && comparable !== total) {
        throw limits.fail(`declares ${comparable} bytes but carries ${total} bytes`);
    }
    return join(chunks, total);
}
/**
 * Read an answer that has no readable stream.
 *
 * An old browser, a Worker shim, or a caller's own `fetch` can answer without
 * `response.body`. `arrayBuffer()` reads all of the body before it returns, so
 * the only cap left is the declared length. An answer that declares nothing is
 * refused rather than buffered — the case this reader exists to prevent.
 */
async function readWithoutStream(response, declared, comparable, limits) {
    if (declared === undefined) {
        throw limits.fail("has no body stream and no content-length, so the limit cannot be kept; " +
            "the read was refused");
    }
    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength > limits.cap) {
        throw limits.fail(`carries ${body.byteLength} bytes; the limit is ${limits.cap} bytes`);
    }
    if (comparable !== undefined && body.byteLength !== comparable) {
        throw limits.fail(`declares ${comparable} bytes but carries ${body.byteLength} bytes`);
    }
    return body;
}
function join(chunks, total) {
    if (chunks.length === 1)
        return chunks[0];
    const out = new Uint8Array(total);
    let at = 0;
    for (const chunk of chunks) {
        out.set(chunk, at);
        at += chunk.byteLength;
    }
    return out;
}
