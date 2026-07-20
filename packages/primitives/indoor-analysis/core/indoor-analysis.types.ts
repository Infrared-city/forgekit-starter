/** Supported indoor analysis types */
export type IndoorAnalysisType = 'daylight-factor'

/** A single point in the heatmap point cloud returned by the analysis API */
export interface HeatmapPoint {
  x: number
  y: number
  z: number
  df: number
}

/** Full heatmap response: legend range + point cloud */
export interface HeatmapPointData {
  minLegend: number
  maxLegend: number
  points: HeatmapPoint[]
}

/** Presigned S3 upload response from the Hono proxy */
export interface PresignResponse {
  fileId: string
  /** S3 presigned POST URL (client uploads directly) */
  url: string
  /** Fields to include in the multipart FormData (before the file) */
  fields: Record<string, string>
}

/** Confirmation response after S3 upload */
export interface ConfirmResponse {
  key: string
}

/** Progress step during the multi-step analysis flow */
export type AnalysisStep = 'uploading' | 'validating' | 'analyzing'

/** Current state of an indoor analysis run */
export interface AnalysisState {
  /** Whether the analysis is currently running */
  isRunning: boolean
  /** Error message if analysis failed */
  error: string | null
}

/**
 * A node in the IFC spatial structure tree.
 *
 * Re-declared here so the indoor-analysis package does not depend on the
 * interior domain. The composition root maps from the interior domain's
 * SpatialTreeNode to this compatible type.
 */
export interface SpatialTreeNode {
  /** IFC local ID */
  localId: number
  /** Display name from the IFC file */
  name: string
  /** IFC entity type e.g. "IFCSITE", "IFCBUILDING", "IFCBUILDINGSTOREY", "IFCSPACE" */
  type: string
  /** IFC GlobalId (22-char base-64 encoded) -- populated for storey nodes */
  globalId?: string
  /** Child nodes (may be empty until expanded) */
  children: SpatialTreeNode[]
  /** Whether this node has children not yet loaded */
  hasChildren: boolean
}
