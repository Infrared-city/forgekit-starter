import type { Polygon, Tile, TilingConfig } from "./types.js";
/** Validate and winding-normalize a GeoJSON polygon in the shared kernel. */
export declare function validatePolygon(polygon: Polygon): Polygon;
/** Generate the deterministic south-to-north tile grid in the shared kernel. */
export declare function generateTilesForPolygon(polygon: Polygon, options?: {
    readonly analysisType?: string | null;
    readonly maxTilesOverride?: number;
}): Tile[][];
/** Read the kernel-owned preset. Unknown non-empty analysis names use solar. */
export declare function getTilingConfig(analysisType?: string | null): TilingConfig;
