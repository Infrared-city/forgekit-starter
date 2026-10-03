/**
 * The saved-schedule identity (`configHash`) and the fold that keeps it
 * cheap.
 *
 * The hash itself is now the kernel's own `configHash` (audit M8b;
 * `docs/DEVIATIONS.md` D81): sha256 of the canonical config JSON — sorted
 * keys, 6dp half-away rounding, then integral collapse
 * (`K/ir-geo/src/geo_hash_config.rs`). This file's `bankersRound6` fold,
 * which reproduced SDK 0.12's rounding by hand (round-half-to-EVEN, one
 * `toFixed(20)` + a `BigInt` per non-integer number, on the submit thread),
 * is deleted along with the Python twin's `round(v, 6)` — the SAME
 * kernel-owned rounding is now what BOTH hosts hash with, closing the
 * "one cache key, three algorithms" gap the architecture audit found
 * (§4 "Config hash"). A configHash computed here does not match one an
 * older SDK computed; `CONFIG_HASH_FOLD_CONTRACT_VERSION` below is what
 * refuses a resume against a schedule from before this change, rather than
 * comparing the two and reporting a caller-input mismatch that never
 * happened.
 */
/** sha256 of the canonical form the kernel builds from `fields` — see the
 * module docs. Synchronous: the kernel call does the hashing in Rust, no
 * `SubtleCrypto` round trip. */
export declare function kernelConfigHash(fields: Readonly<Record<string, unknown>>): string;
/** The facade identity: a config hash of a config hash. Grid schedules must
 * not use this extra fold. */
export declare function kernelFacadeConfigHash(fields: Readonly<Record<string, unknown>>, buildings: Readonly<Record<string, unknown>> | undefined): string;
/**
 * The geometry groups whose DOCUMENT the schedule hash no longer walks.
 *
 * `geometries` is not here because `planAreaSubmission` already replaces it
 * with `{}` before hashing, and `ground-materials` because it is deleted
 * outright. These three were the ones left: a 5 km" site's terrain, context
 * and vegetation are millions of coordinates, and every one of them used to
 * go through the hash fold on the submit thread before the first POST
 * (`FABLE-perf-audit.md` row 1d).
 */
export declare const FOLDED_HASH_GROUPS: readonly ["context-geometry", "ground-geometry", "vegetation"];
/**
 * The first schedule contract version whose `configHash` can be compared
 * with the one this SDK computes.
 *
 * Raised twice, for two independent reasons that both refuse a comparison
 * against an incompatible algorithm rather than reporting a false "your
 * inputs changed": 3 (D51) is when `configHash` started folding the
 * terrain/context/vegetation documents into the kernel's group hash instead
 * of walking them whole; 5 (audit M8b, D81) is when the hash itself moved
 * from this package's own `bankersRound6` fold to the kernel's `configHash`
 * primitive. A schedule below this version holds a hash this SDK cannot
 * reproduce, so resume is refused rather than silently re-planned.
 */
export declare const CONFIG_HASH_FOLD_CONTRACT_VERSION = 5;
/**
 * One geometry group as the hash sees it: the kernel's own group hash.
 *
 * The kernel is the ONE place that knows how a group is hashed — the same
 * `geometryGroupHash` the geometry-reuse path already uses, on the same wire
 * JSON — so the fold cannot drift from the registry's rules. A group the
 * registry has no hash rule for comes back `null`; that group is left as its
 * document, which is what 0.12 hashed, so the fold never LOSES a field from
 * the identity.
 */
export declare function foldGeometryGroup(name: string, value: unknown): unknown;
/**
 * {@link FOLDED_HASH_GROUPS}, folded, in a shallow copy of `fields`.
 *
 * `terrain` is the kernel terrain read once for `ground-geometry`
 * (`site-terrain.ts`, D200): its group hash is the value
 * {@link foldGeometryGroup} would compute from the same document, without
 * writing and parsing the whole terrain again on every run.
 */
export declare function foldHashFields(fields: Readonly<Record<string, unknown>>, terrain?: {
    readonly groupHash: string | undefined;
}): Record<string, unknown>;
