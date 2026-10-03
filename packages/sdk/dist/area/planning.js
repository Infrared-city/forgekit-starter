import { CONFIG_HASH_FOLD_CONTRACT_VERSION, foldHashFields, kernelConfigHash, kernelFacadeConfigHash, } from "./config-hash.js";
import { checkFacadeCountContract } from "./count-contract.js";
import { Slice } from "./cooperative.js";
import { prepareAreaPayload } from "./payload.js";
import { buildEntries } from "./plan-entries.js";
import { foldTileBuildings, GROUP_KEYS, indexed } from "./plan-layers.js";
import { liveTerrain, siteTerrain, terrainDigest } from "./site-terrain.js";
import { buildPreparedSite, preparedSiteKey, preparedSites, } from "./prepared-site.js";
import { checkPaidRetrySiteIdentity } from "./site-identity-guard.js";
import { checkFacadeSensorCap } from "./sensor-cap.js";
import { buildRetryContext } from "./retry-context.js";
import { freshRunId } from "./retry-plan.js";
import { FacadeOwnership } from "./facade-ownership.js";
import { facadeRequest } from "./site-facade.js";
import { generateTilesForPolygon, getTilingConfig, validatePolygon } from "./tiling.js";
import { consumeGradeOption } from "../to-grade.js";
import { checkResumeWeather, isWeatherBearing, preparedWeatherIdentity, } from "./weather-guard.js";
/**
 * The identity a paid retry compares with `retryFrom.siteIdentity`.
 *
 * 0.12.13-next.17 and older hashed each acquisition result whole, with its
 * per-fetch `executionTime`, so their saved identity differs from today's
 * content-only one for the same inputs (D187). On that mismatch only, the
 * legacy key is computed too; when IT matches, the inputs are the ones the
 * schedule was made from. The legacy key covers a superset of today's
 * content, so this accepts nothing today's key would refuse for new content.
 *
 * Gated on `retryContext.resubmitKeys` (D224 review), never
 * `prior.failedSubmissions.length > 0`: a compute-failed job or an uncertain
 * key with no failed SUBMIT also needs this fallback checked, because the
 * plan resubmits it.
 */
async function retrySiteIdentity(current, inputs, prior, retryContext) {
    const recorded = prior?.siteIdentity;
    if (current === undefined || recorded === undefined || recorded === current ||
        prior === undefined || (retryContext?.resubmitKeys.size ?? 0) === 0)
        return current;
    const legacyKey = await preparedSiteKey(inputs, undefined, true);
    return legacyKey !== undefined && `sha256:${kernelConfigHash({ siteKey: legacyKey })}` === recorded
        ? recorded : current;
}
/**
 * Complete and validate the whole grid plan before the first POST.
 *
 * COOPERATIVE since WP-3 (`infrared-core#237`, `docs/DEVIATIONS.md` D78):
 * every stage hands the thread back on a time slice and reads
 * `options.signal` at each boundary, so a host around this SDK stays
 * responsive and a stop is honoured during the plan rather than 24 s later.
 * The work, the order and the answer are unchanged.
 */
export async function planAreaSubmission(service, input, polygonInput, options = {}) {
    const slice = new Slice(options);
    slice.check();
    if (input.vegetationInstances != null || input["vegetation-instances"] != null) {
        throw new TypeError("vegetation-instances have no area tiling policy");
    }
    const payload = prepareAreaPayload(input);
    if (payload["vegetation-instances"] != null) {
        throw new TypeError("vegetation-instances have no area tiling policy");
    }
    const analysisType = payload["analysis-type"];
    // Read off the PREPARED payload, which is what reaches the wire. It holds
    // the arrays whichever of the three sources produced them, so a catalog
    // run and a hand-built run are identified exactly as a bring-your-own run
    // is (D45 §5). Reading `input.weather` instead named a FILE for one source
    // and nothing for the other two — the hole that made every new catalog and
    // manual run unresumable from its first run. ONCE PER RUN: the digest is
    // taken here, before the tile loop, never per tile.
    const weatherIdentity = isWeatherBearing(analysisType)
        ? preparedWeatherIdentity(payload)
        : undefined;
    const surfaceFields = payload["analysis-surfaces"] != null;
    if (payload["sensor-points"] !== undefined) {
        throw new TypeError("sensor-points are not supported for area analysis");
    }
    if (surfaceFields && options.retryFrom !== undefined && options.retryFrom.batchingPolicyVersion !== 2) {
        throw new Error("legacy facade schedules can be polled and merged but cannot be retried safely");
    }
    if (surfaceFields)
        checkFacadeCountContract(options.retryFrom);
    if (surfaceFields)
        checkFacadeSensorCap(options);
    const polygon = validatePolygon(polygonInput);
    const grid = generateTilesForPolygon(polygon, {
        analysisType,
        ...(options.maxTilesOverride === undefined ? {} : { maxTilesOverride: options.maxTilesOverride }),
    });
    const { tiles, byId } = indexed(grid);
    const config = getTilingConfig(analysisType);
    const requestedMargin = options.terrainContextMarginM ?? 128;
    const terrainContextMarginM = Math.max((config.contextSizeM - config.inferenceSizeM) / 2, requestedMargin);
    if (options.retryFrom?.terrainContextMarginM !== undefined &&
        options.retryFrom.terrainContextMarginM !== terrainContextMarginM) {
        throw new Error("retryFrom terrainContextMarginM mismatch");
    }
    validateRetryGrid(options.retryFrom, polygon, analysisType, tiles, grid);
    if (options.terrainContext !== undefined)
        throw new TypeError("terrainContext is internal; use terrainContextMarginM");
    // ONE analysis per `planAreaSubmission` call on this host: `runArea` takes a
    // single input. The list shape is the Python host's, where `run_area` takes
    // a LIST of payloads and the check has to be against the widest of them.
    // D91: the wind family's datum, decided ONCE per plan and consumed here
    // rather than carried onto a wire that has no such key. The choice is part
    // of the site's identity; the drop itself runs when the site is BUILT.
    const inputs = {
        payload, options, polygon, config, terrainContextMarginM, grade: consumeGradeOption(payload),
    };
    // The site stage — layers, compose, frame — once per (site content, tiling
    // family), shared by every run in this realm (D96). Four concurrent runs of
    // one family build it once; the other three await that build.
    // The key and the site constructor write the same group documents; the
    // key keeps its texts for the constructor of THIS plan only (`SiteTexts`).
    const texts = new Map();
    // A new map, or a map changed in place, gets a new digest (D104, D182);
    // raw key-order changes may conservatively refuse retry.
    const siteKey = await preparedSiteKey(inputs, texts);
    // D224: ONE retry context per round, built here -- before the legacy
    // -identity fallback below and the paid-retry guard further down read
    // `resubmitKeys`, and before `buildEntries` reads `retryContext.resubmitKeys`.
    const retryContext = options.retryFrom === undefined
        ? undefined
        : await buildRetryContext(service, options.retryFrom, options);
    const currentSiteIdentity = await retrySiteIdentity(siteKey === undefined ? undefined : `sha256:${kernelConfigHash({ siteKey })}`, inputs, options.retryFrom, retryContext);
    // A no-POST carry-forward cannot attest legacy jobs to newly supplied inputs.
    const siteIdentity = options.retryFrom === undefined ? currentSiteIdentity : options.retryFrom.siteIdentity;
    // The terrain, read into the kernel once per content (D200): the site
    // below is built on it, and the schedule hash folds its group hash.
    const terrain = siteTerrain(payload["ground-geometry"], terrainDigest(siteKey), texts);
    const site = await preparedSites().get(siteKey, () => buildPreparedSite(inputs, analysisType, tiles, slice, texts, terrain), options.signal);
    texts.clear();
    slice.check();
    // A facade run's bodies are the kernel's: it composes no tile payload.
    const composed = surfaceFields ? undefined : await composedTiles(site, slice, options.signal);
    const ownership = new FacadeOwnership(site.answers.unowned);
    ownership.seedFromSchedule(options.retryFrom?.batchMembership);
    // SHALLOW. `base` is copied once per tile below and nothing on the tile
    // path writes into a nested value — `Object.assign` sets the composed
    // geometry groups and the two location fields, both top level, and the
    // facade split moves this host's own mesh objects. A deep clone here
    // copied a bring-your-own-weather run's eight 8,760-float columns for every
    // one of 81 tiles (the twin of the Python `model_copy(deep=True)` finding,
    // `FABLE-perf-audit.md` row 1c/1d).
    const base = { ...payload };
    for (const key of GROUP_KEYS)
        delete base[key];
    const hashFields = { ...payload };
    if (Object.hasOwn(hashFields, "geometries"))
        hashFields.geometries = {};
    delete hashFields["ground-materials"];
    // "auto" is the default (#555): hashed as nothing, as it is sent, so a retry
    // with or without an explicit "auto" has the same identity.
    if (hashFields["mesh-cleaning"] === "auto")
        delete hashFields["mesh-cleaning"];
    // The geometry documents are replaced by the KERNEL's group hash before
    // the kernel's `configHash` ever sees them (D51). `foldHashFields` does
    // not mutate its input, so the shallow copies above are safe to hand it.
    //
    // `liveTerrain`, not `terrain` directly: `terrain` was read BEFORE the
    // `await preparedSites().get(...)` above, and the realm's terrain cache
    // is shared by every concurrent plan. A third, different terrain read by
    // ANOTHER plan while this one was suspended on that await evicts and
    // FREES the oldest handle (`site-terrain.ts`'s `MAX_TERRAINS`), which can
    // be this plan's. Reading a freed wasm handle's `groupHash` throws; a
    // plan that took its terrain before such an eviction must fall back to
    // folding the document text instead, exactly as `buildPreparedSite`
    // already does via the same guard (`site-kernel.ts`).
    const foldedFields = foldHashFields(hashFields, liveTerrain(terrain));
    const hashInput = Object.hasOwn(foldedFields, "ground-geometry")
        ? { ...foldedFields, terrain_slicing: { v: 1 } }
        : foldedFields;
    // Old SVF tiles used the area centre. Never mix them with corrected retries.
    if (analysisType === "sky-view-factors")
        hashInput.tile_location_policy = { v: 1 };
    // ONLY on a facade run — `tests/area/config-hash-fold.wasm.test.ts` asserts
    // the fold does not happen on a grid run and does happen on a facade run.
    const configHash = surfaceFields
        ? kernelFacadeConfigHash(hashInput, site.tileBuildingFolds ??= await foldTileBuildings(tiles, slice, site.answers))
        : kernelConfigHash(hashInput);
    // `configHash` DOES cover the weather arrays in this SDK — the hash input
    // above is the whole prepared payload minus the geometry groups (their
    // kernel group hashes stand in for them, D51). Both hosts compute the
    // value through the SAME kernel primitive (audit M8, D81), but the FIELD
    // SET stays host-owned, so it still does not agree with the Python SDK,
    // which hashes only the fields that gate resume/retry. It raises BEFORE
    // any submission (`docs/DEVIATIONS.md` D45 §4).
    checkResumeWeather(options.retryFrom, weatherIdentity);
    if (options.retryFrom !== undefined) {
        // AFTER the weather guard: both refusals are correct for an old weather
        // schedule, and the weather one names the specific hazard.
        requireFoldedSchedule(options.retryFrom);
        if (options.retryFrom.configHash !== configHash) {
            throw new Error("retryFrom schedule configHash mismatch");
        }
        // D224 review: the guard reads the kernel plan's own
        // "does this round resubmit anything" answer (`resubmit.length > 0`) -- never
        // `failedSubmissions.length > 0`, which misses a compute-failed job or
        // an uncertain key with no failed SUBMIT.
        checkPaidRetrySiteIdentity(options.retryFrom, currentSiteIdentity, (retryContext?.resubmitKeys.size ?? 0) > 0);
    }
    // D224: the kernel's retry plan (built above) decides WHICH keys are
    // rebuilt and sent -- never `failed - uncertain` host arithmetic. A fresh
    // run has no plan: the run id is made here, attempt 1 for every tile.
    const runId = retryContext?.runId ?? options.retryFrom?.runId ?? freshRunId();
    const attemptFor = (key) => retryContext?.attempts[key] ?? 1;
    const retry = retryContext === undefined ? undefined : retryContext.resubmitKeys;
    const tilePositions = options.retryFrom === undefined
        ? tiles.map((tile) => ({ ...tile }))
        : options.retryFrom.tilePositions.map((position) => ({ ...position }));
    const built = await buildEntries(tiles, {
        service, options, analysisType, base, byId, ownership, site: site.answers, surfaceFields, retry,
        runId, attemptFor,
        ...(composed === undefined ? {} : { composed }),
        ...(surfaceFields ? { facadeRequest: facadeRequest(base, tiles, options.retryFrom, options.maxSensorsPerJob) } : {}),
        reuseScope: (key) => [
            "area-v1", key, config.inferenceSizeM, config.contextSizeM,
            config.stepM, terrainContextMarginM, surfaceFields ? 2 : 0,
        ].join(":"),
    }, slice);
    tilePositions.push(...built.extraPositions);
    if (surfaceFields)
        ownership.finish(options.retryFrom === undefined);
    return {
        polygon, analysisType, configHash,
        ...(siteIdentity === undefined ? {} : { siteIdentity }),
        gridShape: [grid.length, grid.reduce((width, line) => Math.max(width, line.length), 0)],
        tilePositions, entries: built.entries, surfaceFields,
        // Read off the CALLER input, not the payload: every path pins
        // `emit-cell-tris` false on the wire (the server arm is 12x the bytes and
        // is never requested), so asking for triangles is what selects LOCAL
        // synthesis in the merge. `docs/DEVIATIONS.md` D88.
        ...(surfaceFields && (input.emitCellTris === true || input["emit-cell-tris"] === true)
            ? { localCellTris: true } : {}),
        // The real planned job count (WP-6, `infrared-core#240` / `#209`): one
        // entry per tile on a grid run, but one per facade sub-batch on a
        // surface run -- `tilePositions.length` is NOT this (it also carries a
        // base entry for every empty-of-batches tile). `previewAreaBatches`
        // (`area/preview.ts`) reads this so a caller prices from the plan, not
        // from the tile count.
        plannedJobCount: built.entries.length,
        terrainContextMarginM,
        runId,
        ...(retryContext === undefined ? {} : { retryContext }),
        ...(weatherIdentity === undefined ? {} : { weatherIdentity }),
        ...(surfaceFields
            ? {
                batchingPolicyVersion: 2,
                batchMembership: built.batchMembership,
                batchSensorCounts: built.batchSensorCounts,
            }
            : {}),
    };
}
/**
 * The prepared site's tile payloads. They are parsed once, under the slice
 * of the run that asked first; a run that finds that parse stopped by the
 * other run's signal parses them itself.
 */
async function composedTiles(site, slice, signal) {
    try {
        return await site.composed(slice);
    }
    catch (error) {
        if (signal?.aborted)
            throw error;
        return site.composed(slice);
    }
}
function validateRetryGrid(retry, polygon, analysisType, tiles, grid) {
    if (retry === undefined)
        return;
    if (retry.analysisType !== analysisType)
        throw new Error("retryFrom analysisType mismatch");
    if (JSON.stringify(retry.polygon) !== JSON.stringify(polygon))
        throw new Error("retryFrom polygon mismatch");
    const shape = [grid.length, grid.reduce((width, line) => Math.max(width, line.length), 0)];
    if (retry.gridShape[0] !== shape[0] || retry.gridShape[1] !== shape[1])
        throw new Error("retryFrom gridShape mismatch");
    const expected = new Map(tiles.map((tile) => [tile.tileId, `${tile.row}:${tile.col}`]));
    for (const position of retry.tilePositions) {
        if (position.tileId.includes("#batch"))
            continue;
        if (expected.get(position.tileId) !== `${position.row}:${position.col}`) {
            throw new Error("retryFrom tilePositions mismatch");
        }
        expected.delete(position.tileId);
    }
    if (expected.size !== 0)
        throw new Error("retryFrom tilePositions mismatch");
}
/**
 * A saved schedule this SDK's `configHash` can be compared with (D51, D81).
 *
 * SDK 0.13 folds the terrain, context and vegetation documents into the
 * kernel's own group hash before the schedule hash is taken, so the same
 * inputs produce a DIFFERENT `configHash` than 0.12 did; the current SDK
 * additionally takes that hash through the kernel's `configHash` primitive
 * instead of this package's own rounding fold (audit M8b, D81) — a second,
 * independent reason an old value cannot be compared. Comparing either
 * generation's hash against this one would refuse every older resume with
 * "configHash mismatch", which reads as "you changed your inputs" and is not
 * something a caller can act on. The version discriminator is checked first
 * so the refusal says what actually happened and what to do about it — the
 * shape D45's weather refusals use.
 */
function requireFoldedSchedule(retryFrom) {
    const version = retryFrom.scheduleContractVersion ?? 1;
    if (version >= CONFIG_HASH_FOLD_CONTRACT_VERSION)
        return;
    throw new ConfigHashPolicyError(`retryFrom schedule predates this SDK's configHash (schedule contract ` +
        `version ${String(version)}, this SDK writes ` +
        `${CONFIG_HASH_FOLD_CONTRACT_VERSION}). An older SDK either hashed the ` +
        "whole terrain, context-geometry and vegetation documents instead of the " +
        "kernel's group hash of each (D51), or took the hash itself through this " +
        "package's own rounding fold instead of the kernel's configHash primitive " +
        "(D81) — either way the two identities cannot be compared and a mismatch " +
        "here would say nothing about your inputs. Start a fresh run with the " +
        "same inputs: the tiles that already succeeded are unaffected on the " +
        "server, and this SDK will not resume a schedule whose identity it " +
        "cannot verify.");
}
/** A resume refused because the saved identity was computed by an older SDK. */
export class ConfigHashPolicyError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConfigHashPolicyError";
    }
}
