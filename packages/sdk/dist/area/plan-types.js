/**
 * The shape a validated area plan takes between `planAreaSubmission`
 * and `submitAreaPlan`.
 *
 * Split out of `planning.ts` so that file stays inside the 400-line cap
 * (root `CLAUDE.md` rule 8) — the same split `area/schedule-types.ts`
 * already makes for the schedule. `planning.ts` re-exports both names,
 * so no importer moves.
 */
export {};
