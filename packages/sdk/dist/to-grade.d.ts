import type { AreaGeometryGroups } from "./area/types.js";
/** The option value that asks for the drop; the default for the wind family. */
export declare const TO_GROUND = "to-ground";
/** `true` for the two models this option exists on, and no other. */
export declare function takesGradeDrop(analysisType: unknown): boolean;
/**
 * One geometry group with every mesh dropped to grade.
 *
 * Returns the caller's own object BY IDENTITY when nothing moved. That identity
 * is the contract: it is what lets a flat-base site submit an unchanged body.
 *
 * A mesh this host cannot read as a flat `[x, y, z, ...]` array is left alone —
 * the same predicate the tile assignment reads it with, so this pass never
 * moves a mesh membership would have skipped.
 */
export declare function dropMeshesToGrade<Mesh>(meshes: Readonly<Record<string, Mesh>>): Readonly<Record<string, Mesh>>;
/**
 * The PLAN seam, in two halves: read the option and consume it, then apply it
 * to the site. `planAreaSubmission` calls them separately, because the CHOICE
 * is part of the prepared site's identity (`area/prepared-site.ts`) and the
 * DROP runs only when that site is built — once per site, never per run.
 *
 * Called once per plan, before the compose cuts the site into tiles — never per
 * tile, and never after the geometry has been sliced. The option is REMOVED
 * from the payload because the wire has no such key: the worker takes no
 * terrain and would not know what to do with it, and leaving it in would change
 * every wind body and every configuration hash for a field the server ignores.
 */
export declare function resolveGradeDrop(payload: Record<string, unknown>, groups: AreaGeometryGroups): AreaGeometryGroups;
/**
 * The option's value, taken OFF the payload: `"to-ground"` (the wind family's
 * default) or `"as-is"`; `undefined` on a model that has no such option.
 */
export declare function consumeGradeOption(payload: Record<string, unknown>): unknown;
/** The site with every building at grade when `chosen` asks for it. */
export declare function dropSiteToGrade(groups: AreaGeometryGroups, chosen: unknown): AreaGeometryGroups;
