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
    /**
     * The job's range in the archive's shared tile scene (#602): `{start,
     * count}` of the scene's `geometries` group. Absent when the archive IS
     * the job's own frame, not a shared scene.
     */
    readonly targets?: {
        readonly start: number;
        readonly count: number;
    };
}
/** One tile's artifact from the site. */
export type TileArtifact = UploadArtifact;
/** The four capability limits the encoder applies. */
export interface ArtifactLimits {
    readonly maxGeometryBytes: number;
    readonly maxMetadataBytes: number;
    readonly maxMeshes: number;
    readonly maxInstances: number;
    /**
     * The capability's `facadeTargets` (#602), carried with the limits so the
     * facade artifact getter can pick scene mode. Not one of the four kernel
     * encode limits; `bodyArtifact` never reads it and never sends it on.
     */
    readonly facadeTargets?: number;
}
/** One body's artifact: its geometry groups as given, encoded by the kernel. */
export declare function bodyArtifact(body: Readonly<Record<string, unknown>>, limits: ArtifactLimits): TileArtifact;
