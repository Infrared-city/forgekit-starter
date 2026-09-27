import { geoUrlFor } from "./allowed-hosts.js";
import { OVERLAY_LAYER_KEY, OVERTURE_CANDIDATE_BUFFER_DEG, } from "./buildings.js";
import { readFgbBboxJson } from "./fgb.js";
import { featureCollectionJson } from "./json-chain.js";
import { resolveOverlayCity } from "./manifests.js";
import { readOvertureArea, tileFeaturesJson } from "./overture-area.js";
import { requireOvertureReader } from "./overture.js";
import { plannedBudget } from "./overture-budget.js";
import { extrudePieces, extrudeRectangle } from "./buildings-extrude.js";
import { reanchorEntries } from "../area/reanchor.js";
import { warnIfOverOneFrame } from "./site-chunks.js";
import { consoleLogger } from "../logger.js";
/** Read and extrude every footprint of one site, in one frame. */
export async function acquireBuildingsArea(site, options) {
    // The frame rules are the SITE's, not the chunk grid's, so they belong on
    // this leg too: it reads and extrudes the whole site in one frame and never
    // calls `siteChunks`, so a buildings-only caller used to be told nothing
    // about a 10 km site (D57 "Host differences", FINAL-SANITY F5).
    warnIfOverOneFrame(site, options.logger ?? consoleLogger);
    // `bestAvailable: false` skips the registry, so Overture is the ONLY source
    // this call can have: the missing peer dependency is reported here, before
    // anything else can fail for a reason that is not the real one (WAVE2 F3).
    // A read that MAY be served by a city overlay is not gated here — a base
    // install reads Vienna's own building bodies through the bundled kernel and
    // needs no parquet at all (D55, and the README's install table) — so the
    // Overture branch below carries its own check.
    if (options.bestAvailable === false)
        await requireOvertureReader();
    const rectangles = options.rectangles ?? [];
    if (rectangles.length > 1 && !(await tilesAgreeOnSource(rectangles, options))) {
        return perRectangleArea(site, rectangles, options);
    }
    const overlay = await readOverlay(site, options);
    let collectionJson;
    let source;
    let overtureRelease = "";
    if (overlay.collectionJson !== undefined && overlay.source !== undefined) {
        collectionJson = overlay.collectionJson;
        source = overlay.source;
    }
    else {
        // ONE read for the WHOLE site, not one per chunk. A row group is the
        // smallest unit hyparquet can read and it spans far more ground than a
        // chunk, so a per-chunk read re-fetches the same bytes once per chunk for
        // no gain (measured on the ground themes: 59-66 s against 10-17 s). The
        // read fails the SITE. A partial set of footprints is not a degraded
        // answer; it is a thinner city that nobody can see. The typed cause is
        // re-thrown unchanged, so a caller still sees `OvertureReadTooLargeError`
        // with its limit and its rectangle (D47).
        // No city covers the site, so this read is Overture: check the peer
        // dependency BEFORE the read plans a byte, so the answer names the
        // packages rather than whatever the plan tripped over (WAVE2 F3).
        await requireOvertureReader();
        const read = await readOvertureArea("building", site, {
            ...options,
            candidateBufferDeg: OVERTURE_CANDIDATE_BUFFER_DEG,
            budget: options.budget ?? plannedBudget(options.maxPlannedBytes),
        });
        collectionJson = featureCollectionJson(tileFeaturesJson(read.features, site));
        source = "overture";
        overtureRelease = read.release;
    }
    // ONE normalisation, ONE extrusion call, over the pieces of
    // `site ∩ union(tile rectangles)` (D57): a footprint that no simulation tile
    // will read is not extruded at all. A compact site is ONE piece equal to the
    // site rectangle, which is the single-rectangle call this leg always made.
    return {
        buildings: extrudePieces(collectionJson, source, site, rectangles, options.defaultHeightM),
        origin: [site.west, site.south],
        source,
        warnings: overlay.warnings,
        overtureRelease,
    };
}
/**
 * The city-overlay stage for the SITE rectangle.
 *
 * Bug-for-bug with the per-tile twin it replaces: `bestAvailable: false` skips
 * the registry, a registry outage degrades to Overture with a warning, and a
 * failed overlay READ degrades the same way rather than failing the read.
 *
 * **The registry outage is handled INSIDE `resolveOverlayCity`** — it answers
 * no city plus a `sources_registry_unavailable` warning — so this function
 * used to wrap that call in a bare `catch` that could only ever catch
 * something else, and then reported it as "the source registry is
 * unreachable". The WAVE2 smoke got exactly that from a base install whose
 * registry had answered 18 times in the same process; the real failure was an
 * uninitialised kernel, which the resolver needs for the bbox candidates and
 * the point-in-polygon test. The wrap is gone: a failure that is NOT the
 * registry now arrives as itself (WAVE2 F3).
 */
async function readOverlay(bbox, options) {
    if (options.bestAvailable === false)
        return { warnings: [] };
    const warnings = [];
    const resolution = await resolveOverlayCity(bbox, options);
    warnings.push(...resolution.warnings);
    const key = resolution.city?.layers[OVERLAY_LAYER_KEY];
    if (key === undefined || resolution.city === undefined)
        return { warnings };
    try {
        return {
            warnings,
            collectionJson: await readFgbBboxJson(geoUrlFor(key), bbox, options),
            source: resolution.city.sourceKey,
        };
    }
    catch {
        // Degrade to the global layer, but say so: a silent downgrade would hide
        // a city's higher-fidelity footprints going missing.
        warnings.push(`${resolution.city.id}_overlay_unavailable`);
        return { warnings };
    }
}
/**
 * Do every tile rectangle resolve to the SAME building source?
 *
 * The Python host's `site_source_or_none`, in TypeScript. Only the DECISION
 * is made here — which city, or none — so the answer costs one registry fetch
 * and one point-in-polygon test per rectangle; both the registry document and
 * each city outline are cached, so the reads do not repeat.
 *
 * A registry that cannot be reached answers "agree": `resolveOverlayCity`
 * returns no city for every rectangle, every rectangle therefore resolves to
 * `"overture"`, and the site read reports the outage through its own warning.
 * That is the pre-existing behaviour of the per-tile path and is not a place
 * to change it — and it needs no `catch` here, because the resolver handles
 * the outage itself. A bare `catch` here would swallow the failures that are
 * NOT an outage and silently pick the uniform path (WAVE2 F3).
 */
async function tilesAgreeOnSource(rectangles, options) {
    if (options.bestAvailable === false)
        return true;
    let first;
    for (const [index, rectangle] of rectangles.entries()) {
        const resolution = await resolveOverlayCity(rectangle, options);
        const layer = resolution.city?.layers[OVERLAY_LAYER_KEY];
        const key = layer === undefined || resolution.city === undefined
            ? "overture"
            : resolution.city.sourceKey;
        if (index === 0)
            first = key;
        else if (key !== first)
            return false;
    }
    return true;
}
/**
 * The mixed-source read: one source per rectangle, one site frame.
 *
 * Each rectangle is read and extruded in its OWN frame, then re-anchored into
 * the site frame with the exact affine, and the first rectangle in grid order
 * that carries a building key keeps it. That is the frame discipline of the
 * uniform path applied per rectangle; what it does NOT do is hand one
 * source's bodies to a rectangle that source does not cover.
 */
async function perRectangleArea(site, rectangles, options) {
    const buildings = {};
    const warnings = new Set();
    const sources = new Set();
    let overtureRelease = "";
    for (const [index, rectangle] of rectangles.entries()) {
        const read = await readRectangle(rectangle, options);
        for (const warning of read.warnings)
            warnings.add(warning);
        sources.add(read.source);
        if (overtureRelease === "")
            overtureRelease = read.overtureRelease;
        const bodies = extrudeRectangle(read.collectionJson, read.source, `rect-${String(index)}`, rectangle, options.defaultHeightM);
        if (Object.keys(bodies).length === 0)
            continue;
        const moved = reanchorEntries(bodies, { lon: rectangle.west, lat: rectangle.south }, { lon: site.west, lat: site.south });
        // FIRST-SEEN in grid order, so the answer does not depend on read order.
        for (const [key, body] of Object.entries(moved)) {
            if (!Object.hasOwn(buildings, key)) {
                buildings[key] = body;
            }
        }
    }
    return {
        buildings,
        origin: [site.west, site.south],
        source: [...sources].sort().join("+"),
        warnings: [...warnings],
        overtureRelease,
    };
}
/** One rectangle's RAW footprint collection and the source that answered. */
async function readRectangle(rectangle, options) {
    const overlay = await readOverlay(rectangle, options);
    if (overlay.collectionJson !== undefined && overlay.source !== undefined) {
        return {
            collectionJson: overlay.collectionJson,
            source: overlay.source,
            overtureRelease: "",
            warnings: overlay.warnings,
        };
    }
    await requireOvertureReader();
    const read = await readOvertureArea("building", rectangle, {
        ...options,
        candidateBufferDeg: OVERTURE_CANDIDATE_BUFFER_DEG,
        budget: options.budget ?? plannedBudget(options.maxPlannedBytes),
    });
    return {
        collectionJson: featureCollectionJson(tileFeaturesJson(read.features, rectangle)),
        source: "overture",
        overtureRelease: read.release,
        warnings: overlay.warnings,
    };
}
