export interface DecompressResultArchiveOptions {
    /** Maximum downloaded archive size. The default is 64 MiB. */
    readonly maxCompressedBytes?: number;
    /** Maximum retained expanded document size. The default is 512 MiB. */
    readonly maxExpandedBytes?: number;
}
/**
 * Expand one server result archive with bounded retained output.
 * Raw JSON is not an archive contract.
 *
 * The limits bound the already-downloaded compressed bytes and the expanded
 * document. They do not bound the later JSON object graph. Joining bounded
 * output chunks also needs a temporary destination buffer.
 */
export declare function decompressResultArchive(content: Uint8Array, options?: DecompressResultArchiveOptions): Uint8Array;
