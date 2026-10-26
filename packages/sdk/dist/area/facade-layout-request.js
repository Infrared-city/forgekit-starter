/**
 * The request text of `synthesizeFacadeLayout`: the kernel reads one JSON document. Split out
 * of `facade-layout.ts` for the 400-line cap (root `CLAUDE.md` rule 8); no behaviour change.
 */
/**
 * `JSON.stringify` does not serialize a typed array as a JSON array --
 * `Float64Array`/`Uint32Array` are not `Array` exotic objects, so they
 * serialize as `{"0":1,"1":2,...}` instead of `[1,2,...]` (#709 review,
 * 2026-10-04). `FacadeLayoutMesh.coordinates`/`indices` are typed
 * `ArrayLike<number>` specifically so a caller CAN pass a typed array
 * straight from its own buffers; convert every mesh to plain arrays here,
 * once, right before the only `JSON.stringify` call in this module.
 */
function meshToPlain(mesh) {
    return { coordinates: Array.from(mesh.coordinates), indices: Array.from(mesh.indices) };
}
function meshesToPlain(meshes) {
    const out = {};
    for (const [id, mesh] of Object.entries(meshes)) {
        out[id] = meshToPlain(mesh);
    }
    return out;
}
export function buildRequest(input) {
    const request = {
        buildings: meshesToPlain(input.buildings),
        ground: input.ground === undefined ? null : meshesToPlain(input.ground),
        terrainAlignment: input.terrainAlignment ?? null,
        mode: input.analysisSurfaces,
        gridSize: input.surfaceGridSize,
        // 0.1 is the server's own default for an absent `surface-offset` on a
        // live run (lambda-models `solar-models/src/surfgrid_parse.rs`,
        // `docs/DEVIATIONS.md` B4) -- an omitted `surfaceOffset` here must
        // rebuild the same layout a live run produced.
        offset: input.surfaceOffset ?? 0.1,
        maxSensors: input.maxSensorsPerJob ?? 262_144,
        partialCells: input.partialCells ?? true,
        minCoverage: input.minCoverage ?? 0.05,
        meshCleaning: input.meshCleaning ?? "auto",
        ...(input.emitCellTris === undefined ? {} : { emitCellTris: input.emitCellTris }),
        ...(input.surfgridVersion === undefined ? {} : { surfgridVersion: input.surfgridVersion }),
        ...(input.siteOrigin === undefined ? {} : { siteOrigin: [input.siteOrigin.lon, input.siteOrigin.lat] }),
        ...(input.jobs === undefined
            ? {}
            : {
                jobs: input.jobs.map((job) => ({
                    jobId: job.jobId,
                    activeIds: job.activeIds ?? null,
                    ...(job.tileOrigin === undefined
                        ? {}
                        : { tileOrigin: [job.tileOrigin.lon, job.tileOrigin.lat] }),
                })),
            }),
    };
    return JSON.stringify(request);
}
