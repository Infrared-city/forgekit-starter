import { CONFIG_HASH_V2_CONTRACT_VERSION, scheduleConfigHash, kernelConfigHash, } from "./config-hash.js";
import { suppliedSceneAlignment } from "../internal/scene-alignment.js";
import { areaTransport } from "../internal/transport-choice.js";
import { consoleLogger } from "../logger.js";
import { checkFacadeCountContract } from "./count-contract.js";
import { Slice } from "./cooperative.js";
import { prepareAreaPayload } from "./payload.js";
import { dropUnknownRequestKeys } from "./unknown-request-keys.js";
import { buildEntries } from "./plan-entries.js";
import { GROUP_KEYS, indexed } from "./plan-layers.js";
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
 * Not gated on a resubmit: a complete schedule is checked too, so a
 * legacy-key schedule must get the same fallback.
 */
async function retrySiteIdentity(current, inputs, prior) {
    const recorded = prior?.siteIdentity;
    if (current === undefined || recorded === undefined || recorded === current ||
        prior === undefined)
        return current;
    const legacyKey = await preparedSiteKey(inputs, undefined, true);
    return legacyKey !== undefined && `sha256:${kernelConfigHash({ siteKey: legacyKey })}` === recorded
        ? recorded : current;
}
/**
 * Build and validate the whole submission plan for an area run, before any job is submitted.
 *
 * It makes no billed request. The plan lists every job to submit, the tile grid, the
 * configuration hash and, for a facade run, the planned batches. The work yields the thread
 * regularly and checks `options.signal` at each stage, so a stop is honoured during planning.
 *
 * @param service - The jobs service the plan is prepared against, for example `client.jobs`.
 * @param input - The analysis request fields.
 * @param polygonInput - The area to analyse.
 * @param options - Run options such as `retryFrom`, `signal` and `maxTilesOverride`.
 * @returns The validated submission plan.
 * @throws {TypeError} when the input carries `vegetation-instances` or `sensor-points`,
 * which area runs do not support.
 * @throws {ConfigHashPolicyError} when `retryFrom` was saved by an older SDK whose
 * configuration hash cannot be compared.
 * @throws {FacadeCountContractError} when `retryFrom` is a facade schedule counted under
 * an older sensor-counting rule.
 * @throws {WeatherIdentityError} when the weather of a retry cannot be shown to be the
 * weather of the schedule it resumes.
 * @throws {Error} when `retryFrom` does not match this input (polygon, analysis type,
 * grid shape, tile positions or configuration hash).
 * @category Run an analysis
 */
// Maintainer note (not published): COOPERATIVE since WP-3 (`infrared-core#237`,
// `docs/DEVIATIONS.md` D78): every stage hands the thread back on a time slice and reads
// `options.signal` at each boundary, so a host around this SDK stays responsive and a stop is
// honoured during the plan rather than 24 s later. The work, the order and the answer are
// unchanged.
export async function planAreaSubmission(service, input, polygonInput, options = {}) {
    const slice = new Slice(options);
    slice.check();
    if (input.vegetationInstances != null || input["vegetation-instances"] != null) {
        throw new TypeError("vegetation-instances have no area tiling policy");
    }
    const payload = prepareAreaPayload(input);
    // A caller-spread RUN OPTION (e.g. `strategy`, `windDirectionDeg` — both
    // `mergeAreaJobs` options, no request field) is dropped here, with one
    // warning, BEFORE the hash below and the wire body `base` further down
    // read the same object (infrared-core #679 follow-up: the kernel field
    // registry now refuses an unknown key instead of ignoring it).
    // The wind grade option (D91/D255) is a HOST-only key, never on the wire
    // and not a registry field: take it OFF the payload before the unknown-key
    // drop, or `"to-ground"` would be dropped with a warning and ignored.
    const grade = consumeGradeOption(payload);
    dropUnknownRequestKeys(payload, options.logger ?? consoleLogger);
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
    // Before the first request of any kind (the retry context below asks the
    // service): an older schedule is refused by name. The weather refusal
    // comes first, it names the specific hazard of a weather schedule.
    checkResumeWeather(options.retryFrom, weatherIdentity);
    if (options.retryFrom !== undefined)
        requireCurrentConfigHash(options.retryFrom);
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
        payload, options, polygon, config, terrainContextMarginM, grade,
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
    const currentSiteIdentity = await retrySiteIdentity(siteKey === undefined ? undefined : `sha256:${kernelConfigHash({ siteKey })}`, inputs, options.retryFrom);
    // A no-POST carry-forward cannot attest legacy jobs to newly supplied inputs.
    const siteIdentity = options.retryFrom === undefined ? currentSiteIdentity : options.retryFrom.siteIdentity;
    // The terrain, read into the kernel once per content (D200): the site
    // below is built on it, and the schedule hash folds its group hash.
    const terrain = siteTerrain(payload["ground-geometry"], terrainDigest(siteKey), texts);
    const site = await preparedSites().get(siteKey, () => buildPreparedSite(inputs, analysisType, tiles, slice, texts, terrain), options.signal);
    texts.clear();
    slice.check();
    // A facade run's bodies are the kernel's, and a binary grid run sends the
    // kernel's artifact: neither composes a tile payload (#816, D277).
    const composed = surfaceFields || areaTransport(options, analysisType) === "binary"
        ? undefined : await composedTiles(site, slice, options.signal);
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
    // `liveTerrain`, not `terrain` directly: `terrain` was read BEFORE the
    // `await preparedSites().get(...)` above, and the realm's terrain cache
    // is shared by every concurrent plan. A third, different terrain read by
    // ANOTHER plan while this one was suspended on that await evicts and
    // FREES the oldest handle (`site-terrain.ts`'s `MAX_TERRAINS`), which can
    // be this plan's. Reading a freed wasm handle's `groupHash` throws; a
    // plan that took its terrain before such an eviction must hash the
    // document text instead, exactly as `buildPreparedSite` already does via
    // the same guard (`site-kernel.ts`).
    //
    // The schedule hash is the kernel's `configHashV2` (`area/config-hash.ts`):
    // the registry picks the fields, the groups enter as group hashes, an unset
    // field as its server default. The prepared payload is the PRE-TILE body.
    // An unset alignment on a supplied scene is "as-is" on the wire, so it is
    // "as-is" in the hash (the same function the submit path uses).
    const alignment = suppliedSceneAlignment(analysisType, payload);
    const gridHash = scheduleConfigHash(analysisType, alignment === undefined ? payload : { ...payload, "terrain-alignment": alignment }, liveTerrain(terrain));
    // As Python: the same hash for a grid and a facade run. The buildings are
    // `exclude` in v2; the batch membership and the site identity guard them.
    const configHash = gridHash;
    if (options.retryFrom !== undefined) {
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
 * A saved schedule whose `configHash` this SDK can compare (D242).
 *
 * `configHash` is the kernel `configHashV2`: the field registry picks the
 * fields and an unset field is hashed as its server default. A schedule
 * written by SDK 0.13 or older holds a v1 hash (the host's own field list,
 * group folds and markers); the same inputs give another value, and a
 * comparison would report "configHash mismatch", which reads as "you changed
 * your inputs" and is not something a caller can act on. The contract version
 * is read first so the refusal says what happened and what to do. It runs
 * before any request.
 */
function requireCurrentConfigHash(retryFrom) {
    const version = retryFrom.scheduleContractVersion ?? 1;
    if (version >= CONFIG_HASH_V2_CONTRACT_VERSION)
        return;
    throw new ConfigHashPolicyError(`retryFrom schedule predates this SDK's configHash (schedule contract ` +
        `version ${String(version)}, this SDK writes ` +
        `${CONFIG_HASH_V2_CONTRACT_VERSION}). configHash now takes its fields ` +
        "from the kernel field registry and hashes an unset field as the " +
        "server default, so the hash of an older SDK can never equal the one " +
        "of the same inputs and a mismatch would say nothing about your " +
        "inputs. Start a fresh run with the same inputs: the tiles that " +
        "already succeeded are unaffected on the server, and this SDK will " +
        "not resume a schedule whose identity it cannot verify.");
}
/**
 * Thrown when a resume is refused because the saved schedule's configuration hash was
 * computed by an older SDK and cannot be compared with this one.
 *
 * Start a fresh run with the same inputs; tiles that already succeeded are unaffected.
 *
 * @category Errors
 */
export class ConfigHashPolicyError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConfigHashPolicyError";
    }
}
