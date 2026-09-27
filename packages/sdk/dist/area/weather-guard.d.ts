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
import type { AreaSchedule } from "./schedule-types.js";
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
 */
export declare const SCHEDULE_CONTRACT_VERSION = 5;
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
export declare const WEATHER_IDENTITY_CONTRACT_VERSION = 4;
/** A resume whose weather cannot be proved to be the weather that was run. */
export declare class WeatherIdentityError extends Error {
    constructor(message: string);
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
export declare function preparedWeatherIdentity(payload: Readonly<Record<string, unknown>>): string;
/** True for the analyses that read weather arrays. */
export declare function isWeatherBearing(analysisType: string): boolean;
/**
 * Admit or refuse a resume, BEFORE anything is submitted.
 *
 * Every branch carries the migration guidance: a refusal a caller cannot act
 * on is a refusal they will work around.
 */
export declare function checkResumeWeather(retryFrom: AreaSchedule | undefined, currentIdentity: string | undefined): void;
