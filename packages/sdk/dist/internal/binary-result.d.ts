interface Section {
    role: number;
    dtype: "u8" | "u32" | "i16" | "i32" | "f16" | "f32" | "f64" | "u64";
    elementCount: bigint;
    bytes: Uint8Array;
}
interface Decoded {
    family: "numeric-grid" | "categorical-grid" | "vector" | "surfaces";
    formatVersion: number;
    metadataJson: string;
    sections: Section[];
}
export type CompactGridResult = {
    readonly route: "compact-grid";
    readonly kind: "numeric" | "categorical";
    readonly shape: readonly [number, number];
    readonly values: Float32Array | Float64Array | Uint32Array;
    readonly validity: Uint8Array;
    readonly dictionary?: readonly string[];
    /**
     * Set only by the JSON route (`compact-grid-result.ts`): a JSON grid with
     * every cell null cannot say whether it WOULD have been numeric or
     * categorical (unlike strict IRBF, whose family is a wire fact), so
     * `flattenGridTile` keeps it out of the numeric/categorical count entirely
     * — exactly what `flattenJson`'s `{}` return used to do before this route
     * moved into the kernel (D107).
     */
    readonly ambiguousEmpty?: boolean;
};
/** Decode one IRBF result to the SDK's existing object and surface shapes. */
export declare function decodeBinaryResult(document: Uint8Array, limits: {
    maxTotalBytes: number;
    maxMetadataBytes: number;
    maxCells: number;
    maxTriangleValues: number;
}): unknown;
export declare function decodeBinaryResultDocument(document: Uint8Array, limits: {
    maxTotalBytes: number;
    maxMetadataBytes: number;
    maxCells: number;
    maxTriangleValues: number;
}): {
    readonly family: Decoded["family"];
    readonly value: unknown;
};
/** Decode a validated IRBF grid without creating nested public result arrays. */
export declare function decodeCompactGridDocument(document: Uint8Array, limits: ResultLimitInput): CompactGridResult | undefined;
type ResultLimitInput = {
    maxTotalBytes: number;
    maxMetadataBytes: number;
    maxCells: number;
    maxTriangleValues: number;
};
export {};
