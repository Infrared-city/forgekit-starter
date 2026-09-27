import { facadeBatchesForTile, facadeTileBase, planFacadeRecords, } from "./site-facade.js";
import { requireCore } from "../internal/core.js";
/**
 * The per-tile stage of `planAreaSubmission`: one composed tile in, the
 * bodies that tile will submit out.
 *
 * Split out of `planning.ts` for the 400-line file cap (root `CLAUDE.md`
 * rule 8) when WP-3 made the loop cooperative. On a facade run the kernel
 * `Site` plans the batches first, one tile per call with the thread handed
 * back between them (`area/site-facade.ts`); the loop then builds each
 * batch's body, and it too gives the thread back on a time slice.
 */
/** A tile is rebuilt when the retry names it, or any of its batches. */
function retryIncludesTile(tileId, retry) {
    if (retry === undefined || retry.has(tileId))
        return true;
    for (const key of retry)
        if (key.startsWith(`${tileId}#batch`))
            return true;
    return false;
}
/** Build every tile's submission bodies, yielding between time slices. */
export async function buildEntries(tiles, input, slice) {
    const { service, options, analysisType, base, composed, byId, ownership, site, surfaceFields } = input;
    const retryFrom = options.retryFrom;
    const entries = [];
    const batchMembership = { ...(retryFrom?.batchMembership ?? {}) };
    const batchSensorCounts = { ...(retryFrom?.batchSensorCounts ?? {}) };
    const extraPositions = [];
    // Which analyses get the tile centroid as `latitude` / `longitude` is the
    // kernel's rule (D160), the one the Python host asks too.
    const tileLocation = requireCore().tileLocationApplies(analysisType);
    const facadeRecords = surfaceFields
        ? await planFacadeRecords(site, tiles.length, new Set(tiles.flatMap((tile, index) => retryIncludesTile(tile.tileId, input.retry) ? [index] : [])), input.facadeRequest, slice)
        : undefined;
    for (const [index, tile] of tiles.entries()) {
        if (!retryIncludesTile(tile.tileId, input.retry))
            continue;
        // The slice boundary is HERE, before a tile's kernel work, not after it:
        // an abort between two tiles must stop the plan without having paid for
        // the tile it would have gone on to. An abort mid-loop leaves NOTHING
        // behind to undo: `prepareSubmission` builds and validates a body and
        // returns it (`jobs.ts`), and no job exists until `submitAreaPlan` runs
        // over the finished plan — a service whose `prepareSubmission` reserves
        // or uploads something is outside that contract and always was.
        await slice.tick();
        // Shallow, for the reason `base` is shallow: only top-level keys are
        // written below, and the kernel's compose output is already a fresh
        // document per tile.
        const detail = byId.get(tile.tileId);
        const location = detail && tileLocation ? detail.centroid : undefined;
        const answer = site.tiles[index];
        if (surfaceFields && answer === undefined) {
            throw new Error(`tile ${JSON.stringify(tile.tileId)} has no site assignment`);
        }
        let payloads;
        if (surfaceFields && answer !== undefined) {
            // A facade job's body is the kernel's (`area/site-facade.ts`): no tile
            // payload is composed on this path.
            const records = facadeRecords?.get(index) ?? [];
            ownership.observe(tile.tileId, answer, records.flatMap((record) => record.active_ids));
            const value = facadeTileBase(base, site.carried ?? [], location);
            payloads = facadeBatchesForTile(value, tile.tileId, index, records, site, answer, site.identity().present[index] ?? 0, (record) => input.retry === undefined || input.retry.has(record.key));
        }
        else {
            // Shallow, for the reason `base` is shallow: only top-level keys are
            // written below, and the kernel's compose output is already a fresh
            // document per tile.
            const value = { ...base };
            Object.assign(value, composed[tile.tileId] ?? {});
            if (location !== undefined) {
                value.latitude = location.latitude;
                value.longitude = location.longitude;
            }
            payloads = [{ key: tile.tileId, payload: value }];
        }
        for (const batch of payloads) {
            const targets = "buildingIds" in batch ? batch.buildingIds : undefined;
            if ("buildingIds" in batch) {
                batchMembership[batch.key] = batch.buildingIds;
                batchSensorCounts[batch.key] = batch.sensorCount;
                if (retryFrom === undefined && batch.key !== tile.tileId) {
                    extraPositions.push({ ...tile, tileId: batch.key });
                }
            }
            if (input.retry !== undefined && !input.retry.has(batch.key))
                continue;
            const prepared = service.prepareSubmission(analysisType, batch.payload, {
                ...(options.transport === undefined ? {} : { transport: options.transport }),
                ...(options.webhookUrl === undefined ? {} : { webhookUrl: options.webhookUrl }),
                ...(options.webhookEvents === undefined ? {} : { webhookEvents: options.webhookEvents }),
            });
            entries.push({
                key: batch.key,
                row: tile.row,
                col: tile.col,
                prepared: {
                    ...prepared,
                    reuseScope: input.reuseScope(batch.key),
                    // A facade batch uploads ITS OWN selection (D156): its targets in
                    // `geometries`, the rest of the tile as context — the body the plan
                    // counted sensors for. The unsplit tile artifact (D101) made the
                    // server synthesize sensors on every member of the tile. Grid
                    // tiles keep the shared tile artifact.
                    ...("artifact" in batch && batch.artifact !== undefined
                        ? { artifact: batch.artifact }
                        : targets === undefined ? tileArtifactFor(site, index) : {}),
                },
                ...("capture" in batch ? { capture: batch.capture } : {}),
            });
        }
    }
    return { entries, batchMembership, batchSensorCounts, extraPositions };
}
/** A grid tile's binary artifact thunk, or none when the site has none. */
function tileArtifactFor(site, index) {
    return site.tileArtifact === undefined ? {} : {
        artifact: (boxTrees, limits) => site.tileArtifact(index, boxTrees, limits),
    };
}
