/**
 * Size limits for expanding a downloaded result archive.
 *
 * @category Results and legend
 */
export interface DecompressResultArchiveOptions {
    /** Maximum downloaded archive size in bytes. The default is 64 MiB. */
    readonly maxCompressedBytes?: number;
    /** Maximum expanded document size in bytes. The default is 512 MiB. */
    readonly maxExpandedBytes?: number;
}
/**
 * Checks archive limits without downloading anything.
 *
 * @param options - The limits to check.
 * @throws {TypeError} When a limit is not a positive safe integer.
 * @category Results and legend
 */
export declare function checkArchiveOptions(options: DecompressResultArchiveOptions): void;
/**
 * Expands one result archive (ZIP or GZIP) into the result document, with bounded output.
 * Raw JSON is not accepted: the content must be an archive.
 *
 * The limits bound the downloaded compressed bytes and the expanded document. They do not
 * bound the object graph of the JSON parsed from it. Joining the output chunks also needs a
 * temporary destination buffer.
 *
 * @param content - The downloaded archive bytes.
 * @param options - Size limits; see `DecompressResultArchiveOptions`.
 * @returns The expanded document (JSON or binary result bytes).
 * @throws {TypeError} When a limit is not a positive safe integer.
 * @throws {Error} When the content is not a ZIP or GZIP archive, is truncated, or exceeds a
 * limit.
 * @category Results and legend
 */
export declare function decompressResultArchive(content: Uint8Array, options?: DecompressResultArchiveOptions): Uint8Array;
