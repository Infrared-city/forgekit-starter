import type { TileArtifact } from "../internal/binary-artifact.js";
import type { FacadeArtifact } from "../internal/facade-artifact-guard.js";
/**
 * The shapes of one tile's facade-scene answer (#602): one shared frame per
 * scene, and each batch's job as a range into a scene, its own frame, or a
 * refusal. `area/site-assign.ts` is the only file that calls the kernel's
 * `facadeScenes` export (`scripts/ci/kernel_owned_ops.json`); this module
 * only shapes what that call returns, so it carries no forbidden symbol.
 */
/** One batch's job, from a facade-scene answer. */
export interface FacadeSceneJob {
    readonly error?: string;
    /** The job's range in `scenes[targets.scene]`'s `geometries` group. */
    readonly targets?: {
        readonly scene: number;
        readonly start: number;
        readonly count: number;
    };
    /** The range's target ids, in scene order; set together with `targets`. */
    readonly targetIds?: readonly string[];
    /** The job's own frame, when the kernel could not express it as a range. */
    readonly artifact?: FacadeArtifact;
}
/** Every scene the tile wrote, and every batch's job, in batch order. */
export interface FacadeSceneAnswer {
    readonly scenes: readonly TileArtifact[];
    readonly jobs: readonly FacadeSceneJob[];
}
/** The kernel's raw `facadeScenes` answer, before this host's field names. */
export interface KernelFacadeSceneAnswer {
    readonly scenes: ReadonlyArray<{
        readonly archive: Uint8Array;
        readonly artifactDigest: string;
        readonly contentDigest: string;
        readonly encoding: "zip-store" | "zip-deflate";
        readonly treeBoxes: string;
    }>;
    readonly jobs: ReadonlyArray<{
        readonly error?: string;
        readonly targets?: {
            readonly scene: number;
            readonly start: number;
            readonly count: number;
        };
        readonly targetIds?: readonly string[];
        readonly artifact?: {
            readonly archive: Uint8Array;
            readonly artifactDigest: string;
            readonly contentDigest: string;
            readonly encoding: "zip-store" | "zip-deflate";
            readonly treeBoxes: string;
            readonly targetIds: string[];
        };
    }>;
}
/** Map the kernel's raw `facadeScenes` answer to this host's typed shapes. */
export declare function mapFacadeScenes(raw: KernelFacadeSceneAnswer): FacadeSceneAnswer;
