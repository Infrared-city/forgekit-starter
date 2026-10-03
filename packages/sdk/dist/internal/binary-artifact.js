import { requireCore } from "./core.js";
/**
 * One body's artifact: its geometry groups as given, encoded by the kernel —
 * and, with `boxTrees`, its trees boxed into `geometries` by the kernel (D70)
 * in the frame of the body's own `longitude`/`latitude`.
 */
export function bodyArtifact(body, boxTrees, limits) {
    // A caller may pass `facadeTargets` in `limits` (it rides along with the
    // other four for the facade artifact getter); this loop checks it as a
    // non-negative uint32 too, same as the four it actually uses below, and
    // only those four ever reach the kernel call.
    for (const [name, value] of Object.entries(limits)) {
        if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) {
            throw new RangeError(`${name} must be a non-negative uint32 integer`);
        }
    }
    const core = requireCore();
    const encoded = core.geometryArtifact(JSON.stringify(body), boxTrees, BigInt(limits.maxGeometryBytes), limits.maxMetadataBytes, BigInt(limits.maxMeshes), BigInt(limits.maxInstances));
    const counts = JSON.parse(encoded.treeBoxes);
    return {
        archive: encoded.archive, artifactDigest: encoded.artifactDigest,
        geometryContentDigest: encoded.contentDigest, encoding: encoded.encoding,
        ...(counts === null ? {} : { treeBoxes: counts }),
    };
}
