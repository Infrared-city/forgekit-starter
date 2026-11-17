/**
 * The many-job facade call of the kernel site (`Site.facadeFramesStart` / `facadeCapturesStart`,
 * WP3) as a pool task (`internal/pool-task.ts`): the start and the end that shapes the kernel's
 * answer. `site-assign.ts` runs it without blocking, or at once for a JSON body.
 */
import { requireCore } from "../internal/core.js";
/** The parts of every batch of tile `index` (see `SiteAnswer.facadeFrames`). */
export function facadeFramesCall(withKernel, index, batches, parts) {
    const limits = parts.artifact?.limits;
    const tiles = Uint32Array.from(batches, () => index);
    const counts = Uint32Array.from(batches, (ids) => ids.length);
    const ids = batches.flatMap((group) => [...group]);
    const site = requireCore().Site;
    const capture = parts.capture;
    if (capture !== undefined) {
        // The captures go straight into the client's store: no bytes come to JavaScript.
        return {
            start: () => withKernel((inner) => inner.facadeCapturesStart(tiles, counts, ids, capture.alignment ?? undefined, capture.store)),
            end: (task) => site.facadeCapturesEnd(task).map((item) => {
                const error = item.error;
                return error === undefined ? { capture: item } : { error };
            }),
        };
    }
    return {
        start: () => withKernel((inner) => inner.facadeFramesStart(tiles, counts, ids, parts.body === true, false, false, undefined, parts.artifact !== undefined, BigInt(limits?.maxGeometryBytes ?? 0), limits?.maxMetadataBytes ?? 0, BigInt(limits?.maxMeshes ?? 0), BigInt(limits?.maxInstances ?? 0))),
        end: (task) => site.facadeFramesEnd(task).map((frame) => {
            if (frame.error !== undefined)
                return { error: frame.error };
            const { body, artifact } = frame;
            return {
                ...(body === undefined ? {} : { body }),
                ...(artifact === undefined ? {} : {
                    artifact: {
                        archive: artifact.archive, artifactDigest: artifact.artifactDigest,
                        geometryContentDigest: artifact.contentDigest, encoding: artifact.encoding,
                        targetIds: artifact.targetIds,
                    },
                }),
            };
        }),
    };
}
