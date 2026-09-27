import type { KernelSite } from "./site-assign.js";
import type { AreaGeometryGroups, IndexedTile, Polygon } from "./types.js";
/**
 * The kernel `Site` handle and the one read of the site into it, split out of
 * `site-assign.ts` for the 400-line rule (root `CLAUDE.md` rule 8).
 * `SiteAssignment` is the only reader.
 */
export interface KernelTileIds {
    readonly members: string[];
    readonly core: string[];
    readonly shrink_band: string[];
    readonly demoted: string[];
    readonly context: string[];
}
/** What the kernel is asked with. */
export interface SiteInputs {
    readonly groups: AreaGeometryGroups;
    readonly tiles: readonly IndexedTile[];
    readonly polygon: Polygon;
    readonly analysisType: string | undefined;
    readonly terrainContextMarginM: number | undefined;
}
/** The site read into the kernel ONCE: the packed groups, their documents, the layers. */
export declare function kernelSite(inputs: SiteInputs, texts?: ReadonlyMap<object, string>): KernelSite;
/**
 * Frees a kept kernel site once its {@link SiteAssignment} is unreachable.
 * JavaScript never frees wasm memory by itself, and a prepared site outlives
 * the plan that built it: the realm cache keeps it for later runs, and a
 * planned tile's artifact is encoded at SUBMIT time. Freeing on cache
 * eviction would pull the site from under a run that still holds it, so the
 * site is freed when the last holder lets go — the rule the Python binding
 * gets from reference counting. A realm without `FinalizationRegistry` keeps
 * no kernel site at all (see {@link SiteAssignment.read}).
 */
export declare const release: FinalizationRegistry<KernelSite> | undefined;
