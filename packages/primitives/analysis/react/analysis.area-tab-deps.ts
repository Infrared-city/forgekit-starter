import type { AreaPreviewQueryResult } from './analysis.area-preview-api'
import type { RunAreaInput } from './analysis.area-run-api'

/**
 * Dependencies for the area analysis tab UI component.
 * Defined here (in the package) so both the plugin and app-side
 * component can reference the same type.
 */
export interface AreaAnalysisTabDeps {
  useAreaPreview: () => AreaPreviewQueryResult
  onRunArea: (input: RunAreaInput) => Promise<void>
  onCancelArea: () => void
  getLocation: () => { latitude: number; longitude: number }
  getBuildings: () => Record<string, unknown> | undefined
  /**
   * SDK ground-material layers from `useGroundMaterialsStore.areaLayers`.
   * Returned dict is forwarded verbatim to `runAreaAndWait` opts when
   * non-empty.
   */
  getGroundMaterials: () =>
    | Record<string, { features?: Array<Record<string, unknown>> }>
    | undefined
  /**
   * SDK vegetation features from `useVegetationStore` (paired with the
   * cached `AreaVegetation.features` dict in the composition root).
   */
  getVegetation: () => Record<string, Record<string, unknown>> | undefined
}
