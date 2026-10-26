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
export {};
