import { readFgbBboxJson } from "./fgb.js";
import { featureCollectionJson, spliceJsonArrays } from "./json-chain.js";
import { GROUND_COLLECTIONS, ROADS_URL } from "./ground.js";
import { readOvertureArea, tileFeaturesJson, } from "./overture-area.js";
import { plannedBudget } from "./overture-budget.js";
import { requireOvertureReader } from "./overture.js";
import { eachChunk, siteChunks } from "./site-chunks.js";
import { requireCore } from "../internal/core.js";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
/** Compose, merge and clean the ground materials of one site. */
export async function acquireGroundMaterialsArea(site, options) {
    // FIRST, before any planning. Every ground read reads Overture — the three
    // GROUND_COLLECTIONS are Overture themes — so a realm without the parquet
    // peers cannot answer this call at all, and the caller must be told which
    // packages to install rather than what the plan then tripped over. Before
    // this, a base install was told "no read chunk meets any tile rectangle"
    // (WAVE2 F3).
    await requireOvertureReader();
    const chunks = siteChunks(site, options.tileRectangles, options.logger);
    // ONE budget for the CALL: the themes of every chunk are held while the
    // compose runs, so the ceiling covers their sum (D47).
    const read = {
        ...options,
        budget: options.budget ?? plannedBudget(options.maxPlannedBytes),
    };
    // ONE I/O wave, and ONE Overture read for the WHOLE site.
    //
    // The chunk grid bounds the COMPOSE, not the parquet read, and the two must
    // not be conflated: hyparquet's smallest readable unit is a row group, a row
    // group spans far more ground than a 2 km chunk, and the bbox statistics
    // that select row groups are per FILE. Reading the themes per chunk
    // therefore re-fetches the SAME row groups once per chunk — measured at
    // 59-66 s for a 7.7 km2 site in four chunks against 10-17 s for one site
    // read of the identical bytes. The features are held once and each chunk
    // takes the slice its own rectangle meets, exactly as D47 does per tile.
    //
    // Roads DO stay per chunk: they are FlatGeobuf range reads, so the bytes
    // fetched follow the rectangle — and the kernel keys them by CHUNK, so the
    // chunk read is also the unit handed over (WP22).
    const [themes, roadsPerChunk] = await Promise.all([
        Promise.all(GROUND_COLLECTIONS.map((name) => readOvertureArea(name, site, read))),
        eachChunk(chunks, (chunk) => readFgbBboxJson(ROADS_URL, chunk.bbox, options), options.maxWorkers, options.signal),
    ]);
    const parts = chunks.map((chunk, index) => ({
        chunk, themes, roads: roadsPerChunk[index],
    }));
    // Every chunk feeds the site, so ONE failing chunk fails the site. A partial
    // ground set is not a degraded answer. It is an emptier city that nobody can
    // see. `eachChunk` raises `SiteReadError` naming every chunk that failed,
    // with the first typed cause as its `cause` — the same records and the same
    // refusal as the Python host's `TiledRunError` (D48).
    // The roads stay TEXT from the FlatGeobuf decode, through the kernel
    // normaliser, into the compose. At 5 km2 that is ~46 MiB of features;
    // parsing them into host objects to build one map and re-serialising it is
    // what bulk-data rule 1 forbids, and it is pure cost — the kernel is the
    // only thing that reads them.
    const core = requireCore();
    // Keyed by CHUNK, ONE entry per chunk (WP22). The compose rectangles are
    // `chunk ∩ union(tile rectangles)` (D57) and every rectangle NAMES its chunk
    // below, so the kernel resolves a piece's roads through the chunk it was cut
    // from. It still carves streets out of EVERY piece's vegetation and soil — a
    // piece with no roads would keep vegetation where a street runs — so the
    // answer does not move; only the text handed over shrinks. Before WP22 the
    // kernel keyed road buffers by rectangle, so this document repeated the whole
    // road text once per piece (4.7 -> 14.1 MiB on the D57 corridor, 3.0x).
    // Normalised ONCE per chunk, as it always was.
    const roadsByChunk = `{${parts.map(({ chunk, roads }) => `${JSON.stringify(chunk.id)}:${core.roadsNormalize(roads)}`).join(",")}}`;
    // The site's features go to the kernel ONCE, not once per chunk: the kernel
    // assigns each rectangle its own subset by the D47 envelope rule, so
    // pre-slicing per chunk would only duplicate the TEXT of every feature that
    // meets two chunks and leave the kernel to dedup the identical clips it
    // produced from the copies.
    const overtureFc = featureCollectionJson(spliceJsonArrays(themes.map((theme) => tileFeaturesJson(theme.features, site))));
    const origin = options.frameOrigin ?? [site.west, site.south];
    const extent = options.cleaningExtent;
    const merged = core.groundMaterialsComposeAndMergeBytes(encoder.encode(roadsByChunk), encoder.encode(overtureFc), origin[0], origin[1], 
    // `chunk` names the read chunk each piece was cut from, which is how the
    // kernel finds the roads that were handed over once for it (WP22). Written
    // for a single-piece chunk too: one rule, and the answer is the same.
    encoder.encode(JSON.stringify(chunks.flatMap((chunk) => chunk.pieces.map((piece) => ({
        id: piece.id,
        bbox: [piece.bbox.west, piece.bbox.south, piece.bbox.east, piece.bbox.north],
        chunk: chunk.id,
    }))))), extent.latitude, extent.longitude, extent.distance, options.defaultLayer, options.zStep);
    return {
        layersJson: decoder.decode(merged),
        overtureRelease: themes[0]?.release ?? "",
        chunks,
    };
}
