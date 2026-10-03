/**
 * The weather identity where it does its work: resume and carry-forward.
 *
 * Contract: `docs/plans/2026-09-07-byo-weather-epw-contract.md` section 9
 * ("Use"), plan sections D.11 and D.12; the differences a caller sees are
 * `docs/DEVIATIONS.md` D45. The Python twin is
 * `public/python/src/infrared_sdk/_internal/weather_guard.py` and holds the
 * same rules in the same order — including the refusal when a
 * weather-bearing payload cannot be identified at all.
 *
 * **Since WP18 the identity names the RUN, not a FILE.** It is the kernel's
 * `ir.weather.run-identity/1` over the SUBMITTED columns, the payload
 * latitude and longitude, and the window. Every weather source therefore has
 * one — catalog records and a caller's own arrays included — so a run built
 * from them is resumable, which it was not (D45 §5, option (b)). The Python
 * twin computes the same digest for the same payload because the KERNEL
 * hashes it; neither host spells a number (ADR 0006).
 *
 * **The problem this closes.** This SDK's `configHash` hashes the whole
 * prepared payload minus the geometry groups (`area/planning.ts`), so it
 * DOES cover the weather arrays — unlike the Python twin, whose hash lists
 * only the analysis type, the subtype and the window. What no hash covers is
 * the rest of the file: the calendar columns, the location, and every row
 * outside the selected window. Nor can a hash express "this run's weather was
 * never proved at all", which is the case plan D.12 is about.
 *
 * So a resume could still be admitted against a file that is not the one the
 * run used: same selected readings, different year stamps or a different
 * station. The failed tiles would be resubmitted against one climate, the
 * succeeded tiles carried forward against the other, and the merge would
 * stitch them into one grid — adjacent tiles, two climates, no error, after
 * the charge.
 *
 * **Wire compatibility.** Nothing here reaches the server: the identity is
 * an additional field on the CLIENT's schedule record, beside the existing
 * optional `batchingPolicyVersion` and `wireVersion`.
 */
import { requireCore } from "../internal/core.js";
import { WEATHER_BEARING_ANALYSES } from "../weather-epw.js";
import { MODEL_INPUT_NAMES, TOP_LEVEL_ALIASES } from "./payload-aliases.js";
/**
 * Version of the client-side schedule record, raised when a field a guard
 * depends on is added or an existing one changes meaning.
 *
 * It is the discriminator for plan D.12: a schedule written before this
 * field existed carries no version, and the SDK cannot tell "this run used
 * no provable weather" from "this SDK could not record it". Both are refused
 * on resume, and neither is quietly given the current file's weather.
 *
 * **Version 4 changes what `weatherIdentity` MEANS** (WP18,
 * `docs/DEVIATIONS.md` D45 §5). Versions 2 and 3 recorded the identity of a
 * parsed EPW FILE, and only a bring-your-own run had one. Version 4 records
 * the identity of the weather a run SUBMITS — the columns, the payload
 * latitude and longitude, and the window — so every weather source has one.
 * The two are computed over different preimages under different version
 * tags and can never agree, so an older schedule is refused by NAME.
 *
 * **Version 5 changes what `configHash` MEANS** (audit M8b,
 * `docs/DEVIATIONS.md` D81). Versions 3 and 4 folded the terrain, context
 * and vegetation documents into the kernel's group hash but still took the
 * outer hash with this package's own `bankersRound6` fold. Version 5 takes
 * that outer hash through the kernel's `configHash` primitive instead — the
 * same primitive the Python SDK now calls for its own `config_hash` — so a
 * value computed under 3 or 4 cannot be compared with one computed under 5;
 * `area/config-hash.ts`'s `CONFIG_HASH_FOLD_CONTRACT_VERSION` is the
 * discriminator that refuses the comparison instead of reporting a false
 * "your inputs changed".
 *
 * **Version 6 changes what an exact facade batch COUNTS** (infrared-core #555,
 * D208): the kernel welds each building and orients its shells about the
 * building, so the saved batches of an older facade schedule were sized with
 * other sensor counts. `area/count-contract.ts` refuses such a retry by name.
 *
 * **Version 7 changes it again** (infrared-core #582, D212): the kernel gives
 * each wall a level grid (`SURFGRID_VERSION` 4), so per-wall counts move.
 *
 * **Version 8 changes it again** (infrared-core #630): the kernel cleans
 * each building in a canonical order (`SURFGRID_VERSION` 5), so per-building
 * counts move again.
 *
 * **Version 9 changes it again** (infrared-core #674): a covered upward face
 * that is outdoors — a terrace under an overhang — now gets roof sensors
 * (`SURFGRID_VERSION` 6), so "all"/"roofs" counts move again. Facade counts
 * do not change.
 */
export const SCHEDULE_CONTRACT_VERSION = 9;
/**
 * The version at which `weatherIdentity` began to mean the RUN identity.
 *
 * The guard below asks about the IDENTITY, not about the record as a whole,
 * so it must not move when the record version does for an unrelated field.
 *
 * There is no dual-accept path. No RELEASED SDK ever wrote version 2 or 3 —
 * this file does not exist on `origin/main` — so accepting the old FILE
 * identity would keep two algorithms alive in two hosts, and make the
 * refusal ambiguous, for schedules that do not exist in the field.
 */
export const WEATHER_IDENTITY_CONTRACT_VERSION = 4;
const MIGRATION = "Start a fresh run, or re-run the finished tiles yourself. The SDK will " +
    "not assign the current weather to jobs it cannot prove were run with it, " +
    "and it will not start a billed run on your behalf. Build the retry " +
    "payload from the SAME weather — the same file, the same catalog window " +
    "or the same arrays — and the resume is admitted.";
/** A resume whose weather cannot be proved to be the weather that was run. */
export class WeatherIdentityError extends Error {
    constructor(message) {
        super(message);
        this.name = "WeatherIdentityError";
    }
}
/**
 * The kernel column name of each weather array, by the WIRE key a prepared
 * payload carries. DERIVED, never written out: `MODEL_INPUT_NAMES` already
 * names every weather column (kernel snake -> camelCase) and
 * `TOP_LEVEL_ALIASES` already spells camelCase -> wire, so their composition
 * IS this table.
 *
 * A hand-written third copy is the drift this whole work package exists to
 * prevent: one wrong or missing key would silently drop a column from the
 * TypeScript identity, the two SDKs would then answer different digests for
 * one payload, and every gate would stay green. Composing them means a new
 * weather column reaches this map by adding nothing here.
 */
const WIRE_TO_COLUMN = Object.fromEntries(Object.entries(MODEL_INPUT_NAMES).map(([column, camel]) => [
    TOP_LEVEL_ALIASES.get(camel) ?? camel,
    column,
]));
/** The six window integers, by the wire key the prepared payload carries. */
const WINDOW_KEYS = [
    ["start-month", "start_month"], ["start-day", "start_day"], ["start-hour", "start_hour"],
    ["end-month", "end_month"], ["end-day", "end_day"], ["end-hour", "end_hour"],
];
function numbers(value) {
    if (!Array.isArray(value))
        return undefined;
    const out = [];
    for (const item of value) {
        if (typeof item !== "number" || !Number.isFinite(item))
            return undefined;
        out.push(item);
    }
    return out;
}
/**
 * The weather identity of a PREPARED payload — the value `runArea` records
 * on the schedule, computed without submitting anything.
 *
 * Pass the output of `prepareAnalysisPayload` / `prepareAreaPayload`, not a
 * `runArea` input: the prepared payload is what reaches the wire, and it
 * holds the arrays whichever of the three sources produced them — a parsed
 * file, the public catalog's records or a caller's own arrays. Reading the
 * input instead named a FILE for one source and nothing for the other two,
 * which is the hole D45 §5 is about.
 *
 * It THROWS `WeatherIdentityError` when the payload carries no location, no
 * window or no weather column, matching the Python twin
 * (`_internal.weather_proof.payload_run_identity`). Returning a quiet
 * `undefined` would let `runArea` write a weather-bearing schedule with no
 * identity — silently unresumable, after the charge — where Python refuses
 * before any POST. A caller who wants "is this weather-bearing at all?"
 * asks `isWeatherBearing(analysisType)` first; that is a different
 * question, and the one `planAreaSubmission` asks.
 *
 * The kernel computes the digest; this function only gathers what it hashes
 * (root `CLAUDE.md` rule 1).
 */
export function preparedWeatherIdentity(payload) {
    const refuse = (detail) => {
        throw new WeatherIdentityError(`this payload's weather cannot be identified: ${detail}. The SDK does ` +
            "not submit a weather-bearing run it cannot describe, because a run " +
            "with no identity cannot be resumed and cannot be shown to be the " +
            "run a retry carries.");
    };
    const latitude = payload.latitude;
    const longitude = payload.longitude;
    const period = payload["time-period"];
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        refuse("it carries no location");
    }
    if (period === null || typeof period !== "object")
        refuse("it carries no window");
    const source = period;
    const window = {};
    for (const [wire, kernel] of WINDOW_KEYS) {
        const value = source[wire];
        if (typeof value !== "number" || !Number.isInteger(value)) {
            refuse("its window is incomplete");
        }
        window[kernel] = value;
    }
    const columns = {};
    for (const [wire, kernel] of Object.entries(WIRE_TO_COLUMN)) {
        if (!Object.hasOwn(payload, wire))
            continue;
        const values = numbers(payload[wire]);
        if (values === undefined)
            refuse(`column ${wire} holds a value that is not a number`);
        columns[kernel] = values;
    }
    if (Object.keys(columns).length === 0)
        refuse("it carries no weather column");
    return requireCore().weatherRunIdentity(JSON.stringify({ latitude, longitude, window, columns }));
}
/** True for the analyses that read weather arrays. */
export function isWeatherBearing(analysisType) {
    return WEATHER_BEARING_ANALYSES.has(analysisType);
}
/**
 * Admit or refuse a resume, BEFORE anything is submitted.
 *
 * Every branch carries the migration guidance: a refusal a caller cannot act
 * on is a refusal they will work around.
 */
export function checkResumeWeather(retryFrom, currentIdentity) {
    // The RECORDED analysis type, which is what the Python twin reads too. The
    // grid guard above has already refused a resume whose type differs, so the
    // two are provably equal here — but the mirrored guards must hold the same
    // rule in the same words, or one of them drifts first.
    if (retryFrom === undefined || !isWeatherBearing(retryFrom.analysisType))
        return;
    const version = retryFrom.scheduleContractVersion;
    if (version === undefined || version < WEATHER_IDENTITY_CONTRACT_VERSION) {
        throw new WeatherIdentityError(`retryFrom schedule predates the weather run identity (schedule ` +
            `contract version ${String(version)}, this SDK writes ` +
            `${WEATHER_IDENTITY_CONTRACT_VERSION}). An earlier version records ` +
            "either no weather at all, or the identity of an EPW FILE, which is " +
            "computed over a different preimage under a different version tag and " +
            "can never equal this SDK's value — so comparing them would report a " +
            "weather change that did not happen, and skipping the comparison " +
            "could submit the failed tiles with one climate and carry the " +
            `succeeded tiles forward with another, in one grid. ${MIGRATION}`);
    }
    const recorded = retryFrom.weatherIdentity;
    if (recorded === undefined) {
        throw new WeatherIdentityError("retryFrom schedule has no weather identity: it describes a " +
            "weather-bearing run whose weather this SDK cannot name, so it cannot " +
            "show that your retry carries the same readings at the same " +
            `location. ${MIGRATION}`);
    }
    if (currentIdentity === undefined) {
        throw new WeatherIdentityError("this retry's weather cannot be identified, and the schedule it " +
            `resumes carries an identity (${recorded.slice(0, 19)}...). The ` +
            "prepared payload reads no weather array, or carries no location or " +
            `window. ${MIGRATION}`);
    }
    if (currentIdentity !== recorded) {
        throw new WeatherIdentityError(`retryFrom weather identity mismatch: the schedule was created with ` +
            `${recorded.slice(0, 19)}..., this retry computes ` +
            `${currentIdentity.slice(0, 19)}.... The window is unchanged, so ` +
            "configHash matches and every other guard passes — but the readings, " +
            "or the latitude and longitude, differ, so the resubmitted tiles and " +
            `the carried-forward ones would hold two different climates. ${MIGRATION}`);
    }
}
