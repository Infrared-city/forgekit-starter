/** Map the kernel's raw `facadeScenes` answer to this host's typed shapes. */
export function mapFacadeScenes(raw) {
    const scenes = raw.scenes.map((scene) => ({
        archive: scene.archive, artifactDigest: scene.artifactDigest,
        geometryContentDigest: scene.contentDigest, encoding: scene.encoding,
    }));
    const jobs = raw.jobs.map((job) => {
        if (job.error !== undefined)
            return { error: job.error };
        if (job.targets !== undefined)
            return { targets: job.targets, targetIds: job.targetIds ?? [] };
        const artifact = job.artifact;
        return {
            artifact: {
                archive: artifact.archive, artifactDigest: artifact.artifactDigest,
                geometryContentDigest: artifact.contentDigest, encoding: artifact.encoding,
                targetIds: artifact.targetIds,
            },
        };
    });
    return { scenes, jobs };
}
