/**
 * Buildings SDK types inlined from `@infrared/sdk`.
 *
 * Inlined into this primitive package after the SDK was removed.
 * These types are self-contained -- no SDK imports required.
 */

// ---------------------------------------------------------------------------
// DotBimMesh (3D geometry format)
// ---------------------------------------------------------------------------

export interface DotBimMesh {
  mesh_id: number
  coordinates: number[]
  indices?: number[]
  /** OSM building ID used to filter Mapbox's 3D extrusion layer */
  osmId?: number
}

// ---------------------------------------------------------------------------
// Buildings request/response types
// ---------------------------------------------------------------------------

export interface BuildingCoordinates {
  latitude: number
  longitude: number
}

export interface BuildingSize {
  x: number
  y: number
}

export interface BuildingOptimizations {
  mapCollectionOptimized?: boolean
  groupedBuildings?: boolean
  optimized2D?: boolean
  optimized3D?: boolean
}

export type OutputFormat = 'GeoJson' | 'DotBim' | 'Mesh'

export interface BuildingsRequest {
  coordinates: BuildingCoordinates
  size: BuildingSize
  returnBuildingIds?: boolean
  outputFormat?: OutputFormat
  compress?: boolean
  optimizations?: BuildingOptimizations
}

export interface BuildingsResponseData {
  buildingIds?: number[]
  buildings?: Record<string, DotBimMesh>
}

export interface BuildingsResponse {
  success: boolean
  data: BuildingsResponseData
  compressed?: boolean
  error?: {
    code: string
    message: string
    statusCode: number
  }
}

export interface BuildingsConfig {
  outputFormat?: OutputFormat
  compress?: boolean
  optimizations?: BuildingOptimizations
  onProgress?: (progress: { completed: number; total: number }) => void
}

/**
 * Result of `getBuildingsInArea()`.
 */
export interface AreaBuildings {
  buildings: Record<string, DotBimMesh>
  buildingIds: number[]
  totalBuildings: number
  executionTime: number
}
