/**
 * The binary transport's upload, as the kernel hands it over (D101): the
 * one-entry ZIP holding the IRBF geometry frame, the SHA-256 of the archive
 * the wire names it by, the frame's content digest, and the entry's encoding.
 *
 * Nothing in this package packs a coordinate, describes a mesh, frames a
 * section, zips or digests: an area run takes every tile's artifact from the
 * prepared site in one kernel crossing (`area/site-assign.ts`), and a direct
 * `submit` takes one body's from `geometryArtifact`.
 */
export interface UploadArtifact {
    readonly archive: Uint8Array;
    readonly artifactDigest: string;
    readonly geometryContentDigest: string;
    readonly encoding: "zip-store" | "zip-deflate";
}
/** The kernel's count of what boxing a tile's trees did (D70), or nothing. */
export interface TreeBoxCounts {
    readonly trees: number;
    readonly boxesSent: number;
    readonly seatedOnTerrain: number;
    readonly outsideTile: number;
    readonly idCollisions: readonly string[];
    readonly footprintM: number;
    readonly heightM: number;
}
/** One tile's artifact from the site, with the tree-box counts beside it. */
export interface TileArtifact extends UploadArtifact {
    readonly treeBoxes?: TreeBoxCounts;
}
/** The four capability limits the encoder applies. */
export interface ArtifactLimits {
    readonly maxGeometryBytes: number;
    readonly maxMetadataBytes: number;
    readonly maxMeshes: number;
    readonly maxInstances: number;
}
/**
 * One body's artifact: its geometry groups as given, encoded by the kernel —
 * and, with `boxTrees`, its trees boxed into `geometries` by the kernel (D70)
 * in the frame of the body's own `longitude`/`latitude`.
 */
export declare function bodyArtifact(body: Readonly<Record<string, unknown>>, boxTrees: boolean, limits: ArtifactLimits): TileArtifact;
