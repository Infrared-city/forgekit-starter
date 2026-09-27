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
/** The cap for one read, and the error type of the layer that asks for it. */
export interface CappedBody {
    /** Largest body accepted, in bytes. */
    readonly cap: number;
    /** Make the typed error of the calling module from a detail sentence. */
    readonly fail: (detail: string) => Error;
}
/** Release a body that the caller will not read. */
export declare function cancelBody(response: Response): void;
/** The declared body length, or `undefined` when the answer names no usable one. */
export declare function declaredLength(response: Response): number | undefined;
/** Read the whole body, or fail as soon as it passes {@link CappedBody.cap}. */
export declare function readCappedBody(response: Response, limits: CappedBody): Promise<Uint8Array>;
