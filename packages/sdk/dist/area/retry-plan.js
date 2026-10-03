/**
 * The host's one door to the kernel's area retry plan (D224). See
 * `ir_geo::area_retry` (`public/rust/crates/ir-geo/src/area_retry.rs`) for
 * the rules this module asks for, never restates: the idempotency key, the
 * attempt arithmetic, the per-key cap, the merge of several records for one
 * key, and which keys to resend, hold or drop.
 *
 * `scripts/ci/kernel_owned_ops.json` (op `area-retry-plan`) forbids a host
 * DEFINITION named `idempotencyKey`, `planRetry`, `retryPlan` or
 * `DEFAULT_MAX_ATTEMPTS`, and the literal `ir-idem-v` in host source. This
 * file only CALLS the kernel; it defines none of those.
 */
import { requireCore } from "../internal/core.js";
/** The retry plan of one area schedule (D224). Throws on a bad input (for
 * example a schedule with no run id and no fresh one given). */
export function planAreaRetry(input) {
    const raw = requireCore().planAreaRetry(JSON.stringify(input));
    return JSON.parse(raw);
}
/** The `Idempotency-Key` header value of one tile submit (D224). */
export function areaIdempotencyKey(runId, jobKey, attempt) {
    return requireCore().areaIdempotencyKey(runId, jobKey, attempt);
}
/**
 * A fresh run id for a schedule written before this field existed: 32 lower
 * -case hex characters from the platform's random source. The kernel does
 * not read any structure into the run id, so this shape is a host choice,
 * not a shared contract.
 */
export function freshRunId() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}
