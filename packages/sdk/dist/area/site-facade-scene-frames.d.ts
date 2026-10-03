import type { FacadeArtifact } from "../internal/facade-artifact-guard.js";
/**
 * Hand out one facade-scene artifact per batch, once (#602).
 *
 * The cache is keyed like `TileFrames`'s other caches (`site-facade.ts`): the
 * first ask under `key` fetches every batch the plan submits from one kernel
 * call and keeps the answers; each is taken out once, then dropped, so an
 * artifact is not kept after its job took it. `fetched` remembers which keys
 * already had that one full fetch, so a LATER ask never fetches-and-caches
 * the whole `wanted` list again — that would leave every OTHER batch's
 * answer sitting in the map forever, since nothing asks for an already
 * handed-out batch again.
 *
 * An index outside `wanted`, or asked again after it was handed out, fetches
 * again — with the SAME `wanted` list when `index` is one of them, so the
 * fetch gives the SAME scene bytes (same digest, no second upload; the
 * single-flight upload cache in `internal/binary-submit-coordinator.ts` also
 * covers a race between two such fetches) — or with `[index]` alone when
 * `index` is not in `wanted`. Either way, only `index`'s own answer is kept;
 * the rest of that fetch is dropped, not cached.
 */
export declare function pickSceneArtifact(cache: Map<string, Map<number, FacadeArtifact | Error>>, fetched: Set<string>, key: string, wanted: readonly number[], index: number, fetch: (indices: readonly number[]) => Map<number, FacadeArtifact | Error>): FacadeArtifact;
