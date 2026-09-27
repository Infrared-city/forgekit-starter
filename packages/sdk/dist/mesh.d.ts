export interface PackedMesh {
    readonly coordinates_bin: string;
    readonly indices_bin: string;
}
export interface MeshNotRepresentable {
    readonly not_representable: string;
}
export type MeshPackVerdict = PackedMesh | MeshNotRepresentable;
export declare function packMesh(coordinates: readonly number[] | Float64Array, indices: readonly number[]): MeshPackVerdict;
