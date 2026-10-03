/** Read the tree-box counts the kernel reported, or none. */
function boxes(json) {
    const counts = JSON.parse(json);
    return counts === null ? undefined : counts;
}
/** Map the kernel's raw `facadeScenes` answer to this host's typed shapes. */
export function mapFacadeScenes(raw) {
    const scenes = raw.scenes.map((scene) => {
        const treeBoxes = boxes(scene.treeBoxes);
        return {
            archive: scene.archive, artifactDigest: scene.artifactDigest,
            geometryContentDigest: scene.contentDigest, encoding: scene.encoding,
            ...(treeBoxes === undefined ? {} : { treeBoxes }),
        };
    });
    const jobs = raw.jobs.map((job) => {
        if (job.error !== undefined)
            return { error: job.error };
        if (job.targets !== undefined)
            return { targets: job.targets, targetIds: job.targetIds ?? [] };
        const artifact = job.artifact;
        const treeBoxes = boxes(artifact.treeBoxes);
        return {
            artifact: {
                archive: artifact.archive, artifactDigest: artifact.artifactDigest,
                geometryContentDigest: artifact.contentDigest, encoding: artifact.encoding,
                targetIds: artifact.targetIds,
                ...(treeBoxes === undefined ? {} : { treeBoxes }),
            },
        };
    });
    return { scenes, jobs };
}
